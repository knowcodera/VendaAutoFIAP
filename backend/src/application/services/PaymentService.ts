import logger from "../../config/logger"; // Usar logger
import { Payment, PaymentStatus } from "../../domain/entities/Payment"; // Importar entidade Payment
import { IPaymentGateway } from "../../domain/interfaces/IPaymentGateway"; // Importar a interface
import { IPaymentRepository } from "../../domain/repositories/PaymentRepository";
import { SimulatedPaymentStatus } from "../../types/payment.types";
import { PaymentAdapter } from "../adapters/PaymentAdapter";
import { CreatePaymentDTO, PaymentResponseDTO } from "../dtos/PaymentDTO";

export class PaymentService {
  private paymentRepository: IPaymentRepository;
  private paymentGateway: IPaymentGateway; // Usar a interface

  constructor(paymentRepository: IPaymentRepository, paymentGateway: IPaymentGateway) { // Usar a interface
    this.paymentRepository = paymentRepository;
    this.paymentGateway = paymentGateway; // Atribuir o gateway injetado
  }

  async createPayment(data: CreatePaymentDTO): Promise<PaymentResponseDTO> {
    logger.info({ vehicleId: data.vehicleId }, 'Criando registro de pagamento inicial (PENDING)');
    
    try {
       // Criar a entidade Payment a partir do DTO
       const paymentEntity = PaymentAdapter.toEntity(data);
       
       // Gerar ID externo simulado aqui (se for o caso)
       const externalId = `SIM_${Date.now()}_${data.vehicleId}`;
       paymentEntity.setExternalInfo(externalId); // Atualiza a entidade antes de salvar
       paymentEntity.updateStatus(PaymentStatus.PENDING); // Garante que o status inicial é PENDING

       // Usar try/catch para capturar qualquer erro específico do repository
       try {
         // Criar o pagamento no repositório (que agora lida com conflitos)
         const createdPaymentEntity = await this.paymentRepository.create(paymentEntity);
         
         logger.info({ paymentId: createdPaymentEntity.id, externalId: createdPaymentEntity.externalId }, 'Registro de pagamento PENDING criado com sucesso');
         // Converter entidade criada para DTO para retorno
         return PaymentAdapter.toDTO(createdPaymentEntity);
       } catch (error: any) {
         // Adicionar logs mais detalhados e traduzir os erros do repositório
         if (error.statusCode === 409 || (error.message && error.message.includes('pagamento'))) {
           logger.warn({ vehicleId: data.vehicleId, error: error.message }, 'Conflito ao criar pagamento (provavelmente já existe)');
           // Relançar o erro já formatado pelo repositório ou criar um novo
           const conflictError = new Error(error.message || 'Já existe um pagamento para este veículo.');
           (conflictError as any).statusCode = 409;
           throw conflictError;
         } else if (error.code === 'P2002') { // Erro genérico de constraint única
           logger.warn({ vehicleId: data.vehicleId, error: error.message }, 'Erro de constraint única ao criar pagamento.');
           const conflictError = new Error('Erro ao processar pagamento para este veículo.');
           (conflictError as any).statusCode = 409;
           throw conflictError;
         }
         
         // Repassar outros erros
         logger.error({ vehicleId: data.vehicleId, error }, 'Erro inesperado ao criar pagamento');
         throw error;
       }
    } catch (error: any) {
      // Garantir que qualquer erro tenha um statusCode adequado
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      logger.error({ vehicleId: data.vehicleId, error: error.message, statusCode: error.statusCode }, 'Erro ao processar criação de pagamento');
      throw error;
    }
  }

  async findById(id: number): Promise<PaymentResponseDTO> {
    const paymentEntity = await this.paymentRepository.findById(id);
    if (!paymentEntity) {
       logger.warn({ paymentId: id }, 'Pagamento não encontrado por ID');
       const notFoundError = new Error('Pagamento não encontrado');
       (notFoundError as any).statusCode = 404;
      throw notFoundError;
    }
    // Converter entidade para DTO
    return PaymentAdapter.toDTO(paymentEntity);
  }

  async findByVehicleId(vehicleId: number): Promise<PaymentResponseDTO | null> {
    const paymentEntity = await this.paymentRepository.findByVehicleId(vehicleId);
    if (!paymentEntity) {
      return null;
    }
    // Converter entidade para DTO
    return PaymentAdapter.toDTO(paymentEntity);
  }

  async processWebhook(externalId: string, simulatedStatus?: SimulatedPaymentStatus): Promise<PaymentResponseDTO> {
    logger.info({ externalId, simulatedStatus }, 'Processando webhook...');
    try {
      const paymentEntity = await this.paymentRepository.findByExternalId(externalId);
      
      if (!paymentEntity || !paymentEntity.id) {
        logger.error({ externalId }, 'Pagamento não encontrado para webhook');
        // Lançar erro com status code para o middleware tratar
        const notFoundError = new Error(`Pagamento com externalId ${externalId} não encontrado`);
        (notFoundError as any).statusCode = 404;
        throw notFoundError;
      }

      let updateDataPartial: Partial<Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'toJSON' | 'validate' | 'updateStatus' | 'setExternalInfo' | 'setBuyerCPF' | 'isValidCPF'>> = {};

      if (simulatedStatus) {
        logger.debug('Usando status simulado do webhook');
        const newStatus = simulatedStatus === 'approved' ? PaymentStatus.APPROVED : PaymentStatus.CANCELLED;
        updateDataPartial = {
          status: newStatus,
          paymentMethod: 'simulated',
          paymentDate: newStatus === PaymentStatus.APPROVED ? new Date() : undefined
        };
      } else {
        logger.debug('Buscando status real do gateway de pagamento');
        const paymentInfo = await this.paymentGateway.getPaymentInfo(externalId);
        // Usar o método renomeado do adapter
        const updateFields = PaymentAdapter.fromGatewayResponse(paymentInfo); 
        updateDataPartial = { ...updateFields }; // Espalhar os campos retornados (sem ID)
      }
      
      logger.info({ paymentId: paymentEntity.id, newStatus: updateDataPartial.status }, 'Atualizando status do pagamento');
      // Passar o ID conhecido e os campos parciais para atualização
      const updatedPaymentEntity = await this.paymentRepository.update(paymentEntity.id, updateDataPartial);
      
      const dto = PaymentAdapter.toDTO(updatedPaymentEntity);
      return dto;

    } catch (error: any) {
      logger.error({ externalId, error: error.message }, 'Erro ao processar webhook');
      // Garantir que o erro tenha statusCode se não for um erro já tratado
      if (!error.statusCode) {
         const internalError = new Error('Falha ao processar notificação de pagamento');
         (internalError as any).statusCode = 500;
         throw internalError;
      }
      throw error; // Relançar erro para middleware
    }
  }

  async checkPaymentStatus(paymentId: number): Promise<PaymentResponseDTO> {
    // findById já retorna DTO e trata erro 404
    const payment = await this.findById(paymentId);
    
    if ([PaymentStatus.APPROVED, PaymentStatus.CANCELLED, PaymentStatus.REFUNDED].includes(payment.status)) {
      return payment;
    }
    if (!payment.externalId) {
      throw new Error('Pagamento sem identificador externo');
    }
    
    logger.warn({ paymentId }, 'checkPaymentStatus chamado em ambiente simulado, retornando status atual.');
    return payment;
  }
} 