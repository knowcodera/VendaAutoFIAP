import { VehicleAdapter } from "@/application/adapters/VehicleAdapter";
import { CreatePaymentDTO, PaymentResponseDTO } from "@/application/dtos/PaymentDTO";
import { CreateVehicleDTO, SellVehicleDTO, UpdateVehicleDTO, VehicleResponseDTO } from "@/application/dtos/VehicleDTO";
import { PaymentService } from "@/application/services/PaymentService";
import logger from "@/config/logger";
import { PaymentStatus } from "@/domain/entities/Payment";
import { Vehicle } from "@/domain/entities/Vehicle";
import { IVehicleImageRepository } from "@/domain/repositories/IVehicleImageRepository";
import { IVehicleRepository } from "@/domain/repositories/IVehicleRepository";

export class VehicleService {
  private vehicleRepository: IVehicleRepository;
  private paymentService: PaymentService;
  private vehicleImageRepository?: IVehicleImageRepository;

  constructor(
    vehicleRepository: IVehicleRepository, 
    paymentService: PaymentService,
    vehicleImageRepository?: IVehicleImageRepository
  ) {
    this.vehicleRepository = vehicleRepository;
    this.paymentService = paymentService;
    this.vehicleImageRepository = vehicleImageRepository;
  }

  /** Método privado para buscar entidade ou lançar erro 404 */
  private async _getVehicleByIdOrThrow(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      logger.warn({ vehicleId: id }, 'Veículo não encontrado no repositório');
      const notFoundError = new Error('Veículo não encontrado');
      (notFoundError as any).statusCode = 404; // Adicionar statusCode para middleware
      throw notFoundError;
    }
    return vehicle;
  }

  async create(data: CreateVehicleDTO): Promise<VehicleResponseDTO> {
    const createdVehicle = await this.vehicleRepository.create(data);
    return VehicleAdapter.toDTO(createdVehicle);
  }

  async findById(id: number): Promise<VehicleResponseDTO> {
    // Usar o método privado para buscar a entidade
    const vehicleEntity = await this._getVehicleByIdOrThrow(id);
    // Converter para DTO para retorno
    return VehicleAdapter.toDTO(vehicleEntity);
  }

  async findAll(
    filters?: {
      onlySold?: boolean;
      brand?: string;
      model?: string;
      minYear?: number;
      maxYear?: number;
      minPrice?: number;
      maxPrice?: number;
      color?: string;
      minMileage?: number;
      maxMileage?: number;
      fuelType?: string;
      transmission?: string;
      condition?: string;
    },
    orderBy?: {
      field: 'price' | 'year' | 'createdAt' | 'mileage';
      direction: 'asc' | 'desc';
    }
  ): Promise<VehicleResponseDTO[]> {
    const vehicles = await this.vehicleRepository.findAll(filters, orderBy);
    return vehicles.map(vehicle => VehicleAdapter.toDTO(vehicle));
  }

  async update(data: UpdateVehicleDTO): Promise<VehicleResponseDTO> {
    // Verificar existência usando o método privado (lança 404 se não existir)
    await this._getVehicleByIdOrThrow(data.id); 
    
    const { id, ...updateData } = data;
    const updatedVehicle = await this.vehicleRepository.update(id, updateData);
    return VehicleAdapter.toDTO(updatedVehicle);
  }

  async startSaleProcess(id: number, data: SellVehicleDTO): Promise<PaymentResponseDTO> {
    logger.info({ vehicleId: id, buyerCPF: data.buyerCPF }, 'Iniciando processo de venda');
    
    // Usar método privado para buscar e validar existência
    const vehicle = await this._getVehicleByIdOrThrow(id);
    
    if (vehicle.isSold) {
      // Lançar erro com statusCode para middleware tratar como 400 ou 409
      const conflictError = new Error('Este veículo já está vendido');
      (conflictError as any).statusCode = 409; // Conflito
      throw conflictError;
    }
    
    const existingPayment = await this.paymentService.findByVehicleId(id);
    if (existingPayment) {
        if (existingPayment.status === PaymentStatus.APPROVED) {
            const conflictError = new Error('Este veículo já possui um pagamento aprovado');
            (conflictError as any).statusCode = 409; // Conflito
            throw conflictError;
        }
        if (existingPayment.status === PaymentStatus.PENDING) {
            const conflictError = new Error('Já existe um processo de venda pendente para este veículo.');
            (conflictError as any).statusCode = 409; // Conflito
            throw conflictError; 
        }
    }

    const paymentData: CreatePaymentDTO = {
      vehicleId: id,
      amount: vehicle.price,
      paymentMethod: 'simulated',
      buyerCPF: data.buyerCPF
    };
    
    const payment = await this.paymentService.createPayment(paymentData);
    logger.info({ vehicleId: id, paymentId: payment.id }, 'Pagamento PENDING criado.');
    return payment;
  }

  async finalizeVehicleSale(vehicleId: number, buyerCPF: string): Promise<VehicleResponseDTO> {
    logger.info({ vehicleId, buyerCPF }, 'Finalizando venda do veículo');
    
    // Buscar a entidade uma vez
    const vehicle = await this._getVehicleByIdOrThrow(vehicleId);
    
    // Se já vendido, retornar o DTO da entidade buscada
    if (vehicle.isSold) {
      logger.warn({ vehicleId }, 'Tentativa de finalizar venda de veículo já vendido.');
      return VehicleAdapter.toDTO(vehicle); 
    }
    
    // Marcar como vendido - Assumindo que sellVehicle retorna a entidade atualizada
    const soldVehicle = await this.vehicleRepository.sellVehicle(vehicleId, buyerCPF);
    
    // Retornar o DTO da entidade atualizada retornada pelo repositório
    return VehicleAdapter.toDTO(soldVehicle);
  }

  async delete(id: number): Promise<void> {
    // Usar método privado para verificar existência (lança 404 se não existir)
    await this._getVehicleByIdOrThrow(id);
    await this.vehicleRepository.delete(id);
  }
} 