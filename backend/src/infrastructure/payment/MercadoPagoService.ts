import axios from 'axios';
import { MercadoPagoPaymentResponseDTO } from '../../application/dtos/PaymentDTO';

export class MercadoPagoService {
  private apiBaseUrl: string;
  private accessToken: string;
  
  constructor() {
    this.apiBaseUrl = 'https://api.mercadopago.com';
    this.accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-SIMULATED-TOKEN'; // Token simulado
  }
  
  // Método para criar uma preferência de pagamento simulada
  async createPaymentPreference(vehicleId: number, amount: number, description: string): Promise<{ paymentLink: string, externalId: string }> {
    try {
      // Gerar um ID externo simulado (para identificar o pagamento)
      const externalId = `SIM_${Date.now()}_${vehicleId}`;
      
      // Link aponta para a página de simulação no frontend
      // Assumindo que a URL base do frontend está em process.env.FRONTEND_URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080'; // Default para dev
      const paymentLink = `${frontendUrl}/simulate-payment/${externalId}`;
      
      // Retorna dados simulados
      return {
        paymentLink,
        externalId
      };
    } catch (error) {
      // Usar logger aqui seria ideal, mas mantendo console.error por enquanto
      console.error('Erro ao criar preferência de pagamento SIMULADA:', error);
      throw new Error('Falha ao criar link de pagamento simulado');
    }
  }
  
  // Método para obter informações simuladas de um pagamento
  async getPaymentInfo(externalId: string): Promise<MercadoPagoPaymentResponseDTO> {
    // Esta função pode não ser mais necessária se o webhook receber o status diretamente
    // Mas vamos mantê-la por enquanto, caso seja útil para outras verificações de status.
    try {
      const lastChar = externalId.charAt(externalId.length - 1);
      let status: string;
      
      if (['0', '1', '2', '3', '4', '5'].includes(lastChar)) {
        status = 'approved';
      } else if (['6', '7', '8'].includes(lastChar)) {
        status = 'pending';
      } else {
        status = 'rejected'; // Usar 'rejected' que é um status comum no MP
      }
      
      const simulatedAmountMatch = externalId.match(/_(\d+)$/); // Tenta pegar o ID do veículo como valor?
      const simulatedAmount = simulatedAmountMatch ? parseInt(simulatedAmountMatch[1]) : 100; // Default
      
      return {
        id: externalId, // O ID do Mercado Pago seria diferente do nosso externalId na vida real
        status: status,
        status_detail: `${status}_detail_simulated`,
        transaction_amount: simulatedAmount, // Usar um valor simulado
        payment_method_id: 'simulated_method',
        date_approved: status === 'approved' ? new Date().toISOString() : null,
        date_created: new Date(parseInt(externalId.split('_')[1])).toISOString(), // Tenta pegar do timestamp
        date_last_updated: new Date().toISOString(),
        external_reference: externalId.split('_')[2] // Tenta pegar o vehicleId
      };
    } catch (error) {
      console.error('Erro ao obter informações SIMULADAS do pagamento:', error);
      throw new Error('Falha ao obter informações simuladas do pagamento');
    }
  }
} 