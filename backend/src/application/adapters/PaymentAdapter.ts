import { Payment, PaymentStatus } from "../../domain/entities/Payment";
import { PaymentInfoDTO } from "../../domain/interfaces/IPaymentGateway";
import { CreatePaymentDTO, PaymentResponseDTO, UpdatePaymentDTO } from "../dtos/PaymentDTO";

export class PaymentAdapter {
  static toEntity(dto: CreatePaymentDTO): Payment {
    // Se for CreatePaymentDTO
    return new Payment(
      dto.vehicleId,
      dto.amount,
      dto.paymentMethod,
      undefined, // id
      PaymentStatus.PENDING, // status padrão
      undefined, // externalId
      undefined, // paymentLink
      undefined, // paymentDate
      dto.buyerCPF, // Passar o buyerCPF se fornecido
      undefined, // additionalInfo
      undefined, // createdAt
      undefined  // updatedAt
    );
  }

  static toDTO(entity: Payment): PaymentResponseDTO {
    return {
      id: entity.id || 0,
      externalId: entity.externalId || null,
      status: entity.status,
      amount: entity.amount,
      paymentMethod: entity.paymentMethod,
      paymentLink: entity.paymentLink || null,
      paymentDate: entity.paymentDate || null,
      vehicleId: entity.vehicleId,
      buyerCPF: entity.buyerCPF || null,
      additionalInfo: entity.additionalInfo || null,
      createdAt: entity.createdAt || new Date(),
      updatedAt: entity.updatedAt || new Date()
    };
  }
  
  // Método para mapear o status do Mercado Pago para nosso enum interno
  static mapMercadoPagoStatus(mpStatus: string): PaymentStatus {
    switch (mpStatus) {
      case 'approved':
        return PaymentStatus.APPROVED;
      case 'cancelled':
      case 'rejected':
        return PaymentStatus.CANCELLED;
      case 'refunded':
      case 'charged_back':
        return PaymentStatus.REFUNDED;
      case 'pending':
      case 'in_process':
      case 'in_mediation':
      default:
        return PaymentStatus.PENDING;
    }
  }
  
  // Método para extrair informações da resposta do Gateway
  static fromGatewayResponse(gatewayResponse: PaymentInfoDTO): Omit<UpdatePaymentDTO, 'id'> {
    return {
      status: this.mapMercadoPagoStatus(gatewayResponse.status),
      externalId: gatewayResponse.id,
      paymentDate: gatewayResponse.date_approved ? new Date(gatewayResponse.date_approved) : undefined,
      additionalInfo: JSON.stringify({
        status_detail: gatewayResponse.status_detail,
        payment_method_id: gatewayResponse.payment_method_id,
        date_created: gatewayResponse.date_created,
        date_last_updated: gatewayResponse.date_last_updated
      })
    };
  }
} 