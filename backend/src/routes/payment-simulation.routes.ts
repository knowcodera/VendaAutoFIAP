import { Request, Response, Router } from 'express';
import { PaymentService } from '../application/services/PaymentService';
import { VehicleService } from '../application/services/VehicleService';
import logger from '../config/logger';
import { PaymentStatus } from '../domain/entities/Payment';
import { Factory } from '../main/factories';

// Controller específico para simulação
class PaymentSimulationController {
  private paymentService: PaymentService;
  private vehicleService: VehicleService;

  constructor(paymentService: PaymentService, vehicleService: VehicleService) {
    this.paymentService = paymentService;
    this.vehicleService = vehicleService;
  }

  async simulateStatusUpdate(req: Request, res: Response) {
    const { externalId } = req.params;
    const { status } = req.body; // Espera { "status": "approved" | "cancelled" }

    logger.info({ externalId, requestedStatus: status }, 'Recebida requisição para simular status do pagamento');

    if (!externalId) {
      return res.status(400).json({ status: 'error', message: 'External ID não fornecido na URL.' });
    }

    if (status !== 'approved' && status !== 'cancelled') { // Corrigido para usar 'cancelled' como no serviço
        return res.status(400).json({ status: 'error', message: 'Status inválido. Use \'approved\' ou \'cancelled\'.' });
    }

    try {
      // 1. Processar a atualização de status no PaymentService
      const payment = await this.paymentService.processWebhook(externalId, status);
      logger.info({ paymentId: payment.id, newStatus: payment.status }, 'Status do pagamento simulado e atualizado');

      // 2. Se aprovado, finalizar a venda do veículo
      if (payment.status === PaymentStatus.APPROVED && payment.vehicleId) {
        logger.info({ vehicleId: payment.vehicleId }, 'Pagamento simulado aprovado, finalizando venda...');
        if (!payment.buyerCPF) {
          logger.error({ paymentId: payment.id }, 'CPF do comprador não encontrado no pagamento após aprovação simulada.');
          // Considerar se deve falhar ou continuar sem CPF
          throw new Error('CPF do comprador não encontrado para finalizar venda.');
        }
        await this.vehicleService.finalizeVehicleSale(payment.vehicleId, payment.buyerCPF);
        logger.info({ vehicleId: payment.vehicleId }, 'Venda finalizada com sucesso após simulação.');
      }

      return res.status(200).json({ 
        status: 'success', 
        message: `Simulação para ${status} processada.`,
        payment: payment // Retorna o pagamento atualizado
      });

    } catch (error: any) {
      logger.error({ externalId, requestedStatus: status, error }, 'Erro ao simular atualização de status do pagamento');
      return res.status(500).json({ status: 'error', message: error.message || 'Erro interno no servidor' });
    }
  }
}

// Configuração da Rota
const router = Router();
const controller = new PaymentSimulationController(
  Factory.createPaymentService(),
  Factory.createVehicleService()
);

/**
 * @swagger
 * /api/payments/{externalId}/simulate-status:
 *   post:
 *     summary: Simula a atualização de status de um pagamento
 *     description: Recebe um status ('approved' ou 'cancelled') e atualiza o pagamento correspondente, marcando o veículo como vendido se aprovado.
 *     tags: [Payments, Simulation]
 *     parameters:
 *       - in: path
 *         name: externalId
 *         required: true
 *         schema:
 *           type: string
 *         description: |
 *           O ID externo simulado do pagamento (ex: SIM_1745889...)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, cancelled]
 *                 description: O status simulado a ser aplicado.
 *     responses:
 *       200:
 *         description: Simulação processada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse' # Reutilizar schema se definido
 *       400:
 *         description: Erro na requisição (ID faltando, status inválido).
 *       500:
 *         description: Erro interno ao processar a simulação.
 */
router.post('/:externalId/simulate-status', controller.simulateStatusUpdate.bind(controller));

export { router as paymentSimulationRoutes };

