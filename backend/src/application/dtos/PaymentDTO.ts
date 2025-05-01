import { PaymentStatus } from "../../domain/entities/Payment";

// DTO para criação de pagamento
export interface CreatePaymentDTO {
  vehicleId: number;
  amount: number;
  paymentMethod: string;
  buyerCPF?: string;
}

// DTO para atualização de pagamento
export interface UpdatePaymentDTO {
  id: number;
  status?: PaymentStatus;
  externalId?: string;
  paymentLink?: string;
  paidAt?: Date;
  paymentDate?: Date;
  paymentMethod?: string;
  additionalInfo?: string;
  buyerCPF?: string;
}

// DTO para resposta de pagamento
export interface PaymentResponseDTO {
  id: number;
  externalId: string | null;
  status: PaymentStatus;
  amount: number;
  paymentMethod: string;
  paymentLink: string | null;
  paymentDate: Date | null;
  vehicleId: number;
  buyerCPF: string | null;
  additionalInfo: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// DTO para notificação do Mercado Pago
export interface MercadoPagoWebhookDTO {
  action: string;
  api_version: string;
  data: {
    id: string; // ID do pagamento no Mercado Pago
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
}

// DTO para resposta da API do Mercado Pago
export interface MercadoPagoPaymentResponseDTO {
  id: string;
  status: string; // approved, pending, cancelled, etc.
  status_detail: string;
  transaction_amount: number;
  payment_method_id: string;
  date_approved: string | null;
  date_created: string;
  date_last_updated: string;
  external_reference: string; // Usamos para armazenar o vehicleId
} 