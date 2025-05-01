import { Factory } from '@/main/factories';
import { Router } from 'express';

const router = Router();
const webhookController = Factory.createWebhookController();

/**
 * @swagger
 * /api/webhooks/mercadopago:
 *   post:
 *     summary: Webhook para receber notificações do Mercado Pago
 *     description: Endpoint que recebe notificações de mudanças de status de pagamento do Mercado Pago
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, data]
 *             properties:
 *               type:
 *                 type: string
 *                 description: Tipo de notificação
 *                 example: payment
 *               action:
 *                 type: string
 *                 description: Ação que ocorreu
 *                 example: payment.updated
 *               data:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID do recurso (pagamento)
 *                     example: '12345678'
 *     responses:
 *       200:
 *         description: Notificação recebida e processada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Notificação processada com sucesso
 */
router.post('/mercadopago', webhookController.mercadoPagoWebhook.bind(webhookController));

export { router as webhookRoutes };
