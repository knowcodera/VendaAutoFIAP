import { PaymentService } from '@/application/services/PaymentService';
import { VehicleService } from '@/application/services/VehicleService';
import logger from '@/config/logger';
import { PaymentStatus } from '@/domain/entities/Payment';
import { SimulatedPaymentStatus } from '@/types/payment.types';
import { Request, Response } from 'express';

// Definir um tipo para o corpo da requisição simulada
interface SimulatedWebhookBody {
  type?: string;
  action?: string;
  data?: { id?: string };
  simulatedStatus?: SimulatedPaymentStatus;
}

export class WebhookController {
  private paymentService: PaymentService;
  private vehicleService: VehicleService;

  constructor(paymentService: PaymentService, vehicleService: VehicleService) {
    this.paymentService = paymentService;
    this.vehicleService = vehicleService;
  }

  // Webhooks do Mercado Pago (adaptado para simulação)
  async mercadoPagoWebhook(req: Request, res: Response) {
    const webhookData = req.body as SimulatedWebhookBody;
    logger.info({ webhookData }, 'Webhook recebido');

    try {
      // Extrair o ID externo e o status simulado
      const externalId = webhookData.data?.id;
      const simulatedStatus = webhookData.simulatedStatus;

      if (!externalId) {
        logger.warn('Webhook recebido sem ID externo em data.id');
        return res.status(400).json({ status: 'error', message: 'ID do pagamento não fornecido' });
      }
      
      // Processar a notificação usando o status simulado (se existir)
      const payment = await this.paymentService.processWebhook(externalId, simulatedStatus);
      logger.info({ paymentId: payment.id, status: payment.status }, 'Processamento do webhook concluído');
      
      // Se o pagamento for aprovado (seja real ou simulado), finalizar a venda do veículo
      if (payment.status === PaymentStatus.APPROVED && payment.vehicleId) {
        logger.info({ vehicleId: payment.vehicleId }, 'Pagamento aprovado, finalizando venda do veículo...');
        
        // Usar o buyerCPF diretamente do DTO retornado por processWebhook
        if (!payment.buyerCPF) { 
          logger.error({ paymentId: payment.id, vehicleId: payment.vehicleId }, 'CPF do comprador não encontrado no pagamento processado para finalizar venda');
          // Lançar erro para o middleware tratar (provavelmente 500, pois algo deu errado internamente)
          const internalError = new Error('Informações do comprador ausentes para finalizar a venda após pagamento aprovado.');
          (internalError as any).statusCode = 500;
          throw internalError;
        }
        
        // Finalizar a venda usando o CPF do DTO
        await this.vehicleService.finalizeVehicleSale(
          payment.vehicleId,
          payment.buyerCPF // Usar o CPF do DTO
        );
        logger.info({ vehicleId: payment.vehicleId }, 'Venda do veículo finalizada com sucesso');
      }
      
      return res.status(200).json({
        status: 'success',
        message: 'Notificação processada com sucesso'
      });
      
    } catch (error: any) {
      logger.error({ error: error.message, body: req.body }, 'Erro ao processar webhook');
      // Middleware global não será chamado aqui, pois retornamos 200.
      // Manter o retorno 200 OK mesmo em caso de erro.
      return res.status(200).json({
        status: 'error',
        message: 'Erro ao processar notificação, mas recebido com sucesso'
      });
    }
  }
} 