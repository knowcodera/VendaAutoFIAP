import { Vehicle } from '../../../domain/entities/Vehicle';
import { IPaymentGateway } from '../../../domain/interfaces/IPaymentGateway';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { Logger } from '../../../infrastructure/logging/Logger';
import { IUseCase } from '../../interfaces/IUseCase';
import { PaymentService } from '../../services/PaymentService';
import { PaymentStatus } from '../../../domain/entities/Payment';
import { CreatePaymentDTO } from '../../dtos/PaymentDTO';

export interface SellVehicleRequest {
  vehicleId: number;
  buyerCPF: string;
  paymentMethod: string;
}

export interface SellVehicleResponse {
  vehicle: Vehicle;
  paymentExternalId: string;
  paymentStatus: PaymentStatus;
}

/**
 * Caso de uso para vender um veículo
 */
export class SellVehicleUseCase implements IUseCase<SellVehicleRequest, SellVehicleResponse> {
  private logger = Logger.getInstance().setContext('SellVehicleUseCase');
  
  constructor(
    private readonly vehicleRepository: IVehicleRepository,
    private readonly paymentService: PaymentService
  ) {}

  /**
   * Executa a operação de venda de um veículo
   */
  async execute(request: SellVehicleRequest): Promise<SellVehicleResponse> {
    const { vehicleId, buyerCPF, paymentMethod } = request;
    
    this.logger.info('Iniciando processo de venda de veículo', { vehicleId, buyerCPF });
    
    // Verificar se o veículo existe e não está vendido
    const vehicleDTO = await this.vehicleRepository.findById(vehicleId);
    
    if (!vehicleDTO) {
      const notFoundError = new Error('Veículo não encontrado');
      (notFoundError as any).statusCode = 404;
      throw notFoundError;
    }
    
    // Verificar se o veículo já está vendido
    if (vehicleDTO.isSold) {
      const conflictError = new Error('Este veículo já está vendido');
      (conflictError as any).statusCode = 409;
      throw conflictError;
    }

    this.logger.info('Iniciando criação de pagamento', { vehicleId, price: vehicleDTO.price, buyerCPF, paymentMethod });

    const paymentData: CreatePaymentDTO = {
      vehicleId: vehicleDTO.id,
      amount: vehicleDTO.price,
      paymentMethod: paymentMethod,
      buyerCPF: buyerCPF,
    };

    const paymentResponse = await this.paymentService.createPayment(paymentData);

    if (!paymentResponse || !paymentResponse.externalId) {
       this.logger.error('Falha ao criar pagamento ou externalId não retornado', { vehicleId, paymentResponse });
       throw new Error('Falha ao iniciar o processo de pagamento.');
    }
    
    this.logger.info('Pagamento PENDING criado com sucesso', { paymentId: paymentResponse.id, externalId: paymentResponse.externalId });
    
    this.logger.warn('Marcando veículo como vendido ANTES da confirmação do pagamento. Revisar esta lógica.', { vehicleId });
    const updatedVehicleDTO = await this.vehicleRepository.sellVehicle(vehicleId, buyerCPF);
    
    // Converter DTO para entidade de domínio
    const vehicle = new Vehicle({
      id: updatedVehicleDTO.id,
      brand: updatedVehicleDTO.brand,
      model: updatedVehicleDTO.model,
      year: updatedVehicleDTO.year,
      color: updatedVehicleDTO.color,
      price: updatedVehicleDTO.price,
      isSold: updatedVehicleDTO.isSold,
      buyerCPF: updatedVehicleDTO.buyerCPF || undefined,
      saleDate: new Date()
    });
    
    this.logger.info('Veículo vendido com sucesso (Pagamento PENDING)', { 
      vehicleId, 
      buyerCPF, 
      saleDate: vehicle.saleDate 
    });
    
    return {
      vehicle,
      paymentExternalId: paymentResponse.externalId,
      paymentStatus: paymentResponse.status,
    };
  }
} 