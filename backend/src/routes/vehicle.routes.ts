import { Factory } from '@/main/factories';
import { Router } from 'express';

const router = Router();
const vehicleController = Factory.createVehicleController();

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Criar um novo veículo
 *     tags: [Veículos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVehicleRequest'
 *     responses:
 *       201:
 *         description: Veículo criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Vehicle'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/', vehicleController.createVehicle.bind(vehicleController));

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Listar todos os veículos
 *     tags: [Veículos]
 *     parameters:
 *       - in: query
 *         name: sold
 *         schema:
 *           type: boolean
 *         description: Filtrar por veículos vendidos (true) ou disponíveis (false)
 *     responses:
 *       200:
 *         description: Lista de veículos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vehicle'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/', vehicleController.getAllVehicles.bind(vehicleController));

/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Obter detalhes de um veículo específico
 *     tags: [Veículos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do veículo
 *     responses:
 *       200:
 *         description: Detalhes do veículo retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Vehicle'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:id', vehicleController.getVehicleById.bind(vehicleController));

/**
 * @swagger
 * /api/vehicles/{id}/sell:
 *   patch:
 *     summary: Iniciar processo de venda de um veículo (cria pagamento PENDING)
 *     tags: [Veículos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do veículo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SellVehicleRequest'
 *     responses:
 *       200:
 *         description: Processo de venda iniciado, pagamento pendente criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InitiateSaleResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Conflito - Já existe um pagamento pendente para este veículo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.patch('/:id/sell', vehicleController.initiateSale.bind(vehicleController));

/**
 * @swagger
 * /api/vehicles/{id}:
 *   put:
 *     summary: Atualizar um veículo
 *     tags: [Veículos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do veículo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVehicleRequest'
 *     responses:
 *       200:
 *         description: Veículo atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Vehicle'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/:id', vehicleController.updateVehicle.bind(vehicleController));

/**
 * @swagger
 * /api/vehicles/{id}:
 *   delete:
 *     summary: Excluir um veículo
 *     tags: [Veículos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do veículo
 *     responses:
 *       204:
 *         description: Veículo excluído com sucesso
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/:id', vehicleController.deleteVehicle.bind(vehicleController));

export { router as vehicleRoutes };

