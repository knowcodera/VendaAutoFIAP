export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface PaymentResponseDTO {
  id: number;
  externalId: string | null;
  status: PaymentStatus; // Usar o enum local
  amount: number;
  paymentMethod: string;
  paymentLink: string | null;
  paymentDate: string | null; // API provavelmente retorna string ISO
  paidAt?: string | null; // Adicionado no backend DTO, incluir aqui
  vehicleId: number;
  buyerCPF: string | null;
  additionalInfo: string | null;
  createdAt: string; // API provavelmente retorna string ISO
  updatedAt: string; // API provavelmente retorna string ISO
} 