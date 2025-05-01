import { Router } from 'express';
import { SellerController } from '../controllers/seller.controller';

const router = Router();
const sellerController = new SellerController();

/**
 * @swagger
 * /api/sellers:
 *   get:
 *     summary: Listar todos os vendedores
 *     tags: [Vendedores]
 *     responses:
 *       200:
 *         description: Lista de vendedores retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 results: { type: integer, example: 5 }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SellerResponse' # Usando SellerResponse
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/', sellerController.getAllSellers.bind(sellerController)); // Adicionado bind

/**
 * @swagger
 * /api/sellers/{id}:
 *   get:
 *     summary: Obter detalhes de um vendedor específico
 *     tags: [Vendedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do vendedor
 *     responses:
 *       200:
 *         description: Detalhes do vendedor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/SellerResponse' } # Usando SellerResponse
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:id', sellerController.getSellerById.bind(sellerController)); // Adicionado bind

/**
 * @swagger
 * /api/sellers:
 *   post:
 *     summary: Criar um novo vendedor
 *     tags: [Vendedores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSellerRequest'
 *     responses:
 *       201:
 *         description: Vendedor criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/SellerResponse' } # Usando SellerResponse
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict' # Ex: CPF ou Email já existe
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/', sellerController.createSeller.bind(sellerController)); // Adicionado bind

/**
 * @swagger
 * /api/sellers/{id}:
 *   put:
 *     summary: Atualizar um vendedor existente
 *     tags: [Vendedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do vendedor a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSellerRequest'
 *     responses:
 *       200:
 *         description: Vendedor atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/SellerResponse' } # Usando SellerResponse
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict' # Ex: Tentando atualizar para um email/CPF que já existe
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/:id', sellerController.updateSeller.bind(sellerController)); // Adicionado bind

/**
 * @swagger
 * /api/sellers/{id}:
 *   delete:
 *     summary: Excluir um vendedor
 *     tags: [Vendedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do vendedor a ser excluído
 *     responses:
 *       204:
 *         description: Vendedor excluído com sucesso (Sem conteúdo)
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/:id', sellerController.deleteSeller.bind(sellerController)); // Adicionado bind

export default router;
