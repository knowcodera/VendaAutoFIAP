
// Definição da estrutura da resposta do getPaymentInfo (simplificada)
// Idealmente, mapear todos os campos relevantes do gateway
export interface PaymentInfoDTO {
  id: string; // ID externo no gateway
  status: string; // Status do gateway (ex: 'approved', 'rejected')
  date_approved?: string;
  status_detail?: string;
  payment_method_id?: string;
  date_created?: string;
  date_last_updated?: string;
  external_reference?: string; // Nosso ID de pagamento
}

export interface IPaymentGateway {
  /**
   * Cria uma intenção de pagamento no gateway
   * @param vehicleId ID do veículo associado ao pagamento
   * @param amount Valor do pagamento
   * @param description Descrição do pagamento
   * @returns Link de pagamento e ID externo da transação
   */
  createPaymentPreference(
    vehicleId: number, 
    amount: number, 
    description: string
  ): Promise<{ paymentLink: string, externalId: string }>;

  /**
   * Busca informações de um pagamento no gateway usando o ID externo.
   * @param externalPaymentId ID do pagamento no gateway.
   */
  getPaymentInfo(externalPaymentId: string): Promise<PaymentInfoDTO>;
} 