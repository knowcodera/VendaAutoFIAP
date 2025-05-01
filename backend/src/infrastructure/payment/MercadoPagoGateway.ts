import axios from 'axios';
import { IPaymentGateway, PaymentInfoDTO } from '../../domain/interfaces/IPaymentGateway';
import { ConfigService } from '../../application/services/ConfigService';

export class MercadoPagoGateway implements IPaymentGateway {
  private apiBaseUrl: string;
  private accessToken: string;
  
  constructor(configService: ConfigService) {
    this.apiBaseUrl = 'https://api.mercadopago.com';
    this.accessToken = configService.get('MERCADO_PAGO_ACCESS_TOKEN') || 
      'TEST-1234567890123456-012345-abcdef0123456789abcdef0123456789-123456789';
  }
  
  async createPaymentPreference(
    vehicleId: number, 
    amount: number, 
    description: string
  ): Promise<{ paymentLink: string, externalId: string }> {
    try {
      const preferenceId = `PREF_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const paymentLink = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`;
      
      
      return {
        paymentLink,
        externalId: preferenceId
      };
      
      /* Implementação real seria assim:
      const response = await axios.post(
        `${this.apiBaseUrl}/checkout/preferences`,
        {
          items: [
            {
              title: description,
              quantity: 1,
              currency_id: 'BRL',
              unit_price: amount
            }
          ],
          external_reference: vehicleId.toString(),
          back_urls: {
            success: `${process.env.FRONTEND_URL}/payment/success`,
            failure: `${process.env.FRONTEND_URL}/payment/failure`
          },
          auto_return: 'approved',
          notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        paymentLink: response.data.init_point,
        externalId: response.data.id
      };
      */
    } catch (error) {
      console.error('Erro ao criar preferência de pagamento no Mercado Pago:', error);
      throw new Error('Falha ao criar link de pagamento');
    }
  }
  
  async getPaymentInfo(externalId: string): Promise<PaymentInfoDTO> {
    try {
      // Em um cenário real, faríamos uma chamada à API do Mercado Pago
      // aqui estamos simulando a resposta
      
      // Simular diferentes status baseados no ID
      const lastChar = externalId.charAt(externalId.length - 1);
      let status: string;
      
      // Simulamos diferentes status baseados no último caractere do ID
      if (['0', '1', '2', '3', '4', '5'].includes(lastChar)) {
        status = 'approved'; // 60% chance de aprovado
      } else if (['6', '7', '8'].includes(lastChar)) {
        status = 'pending';  // 30% chance de pendente
      } else {
        status = 'cancelled'; // 10% chance de cancelado
      }
      
      // Simular uma resposta do Mercado Pago
      return {
        id: externalId,
        status: status,
        status_detail: `${status}_detail`,
        payment_method_id: 'credit_card',
        date_approved: status === 'approved' ? new Date().toISOString() : undefined,
        date_created: new Date().toISOString(),
        date_last_updated: new Date().toISOString(),
        external_reference: '123' // Simulação - na implementação real viria do banco
      };
      
      /* Implementação real seria assim:
      const response = await axios.get(
        `${this.apiBaseUrl}/v1/payments/${externalId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      
      return response.data;
      */
    } catch (error) {
      console.error('Erro ao obter informações do pagamento no Mercado Pago:', error);
      throw new Error('Falha ao obter informações do pagamento');
    }
  }
} 