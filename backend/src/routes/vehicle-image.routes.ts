import { Factory } from '@/main/factories';
import { Router } from 'express';
import { upload } from '../controllers/vehicle-image.controller';

const router = Router();
const vehicleImageController = Factory.createVehicleImageController();

/**
 * @swagger
 * /api/vehicle-images/vehicle/{vehicleId}:
 *   get:
 *     summary: Listar todas as imagens de um veículo específico
 *     tags: [Imagens]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema: { type: integer }
 *         description: ID do veículo para o qual buscar as imagens
 *     responses:
 *       200:
 *         description: Lista de imagens do veículo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VehicleImageResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound' # Veículo não encontrado
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/vehicle/:vehicleId', vehicleImageController.getImagesByVehicleId.bind(vehicleImageController));

/**
 * @swagger
 * /api/vehicle-images/upload/{vehicleId}:
 *   post:
 *     summary: Fazer upload de uma nova imagem para um veículo
 *     tags: [Imagens]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema: { type: integer }
 *         description: ID do veículo ao qual a imagem pertence
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateVehicleImageRequest'
 *           encoding:
 *             image: # Nome do campo que contém o arquivo
 *               contentType: image/png, image/jpeg, image/gif, image/webp # Tipos de imagem permitidos
 *     responses:
 *       201:
 *         description: Imagem carregada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/VehicleImageResponse' }
 *       400:
 *         $ref: '#/components/responses/BadRequest' # Ex: Arquivo faltando, tipo inválido
 *       404:
 *         $ref: '#/components/responses/NotFound' # Veículo não encontrado
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/upload/:vehicleId', upload.single('image'), vehicleImageController.uploadImage.bind(vehicleImageController));

/**
 * @swagger
 * /api/vehicle-images/{id}:
 *   put:
 *     summary: Atualizar informações de uma imagem (descrição, primária)
 *     tags: [Imagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID da imagem a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVehicleImageRequest'
 *     responses:
 *       200:
 *         description: Informações da imagem atualizadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/VehicleImageResponse' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound' # Imagem não encontrada
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/:id', vehicleImageController.updateImage.bind(vehicleImageController));

/**
 * @swagger
 * /api/vehicle-images/{id}:
 *   delete:
 *     summary: Excluir uma imagem
 *     tags: [Imagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID da imagem a ser excluída
 *     responses:
 *       204:
 *         description: Imagem excluída com sucesso (Sem conteúdo)
 *       404:
 *         $ref: '#/components/responses/NotFound' # Imagem não encontrada
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/:id', vehicleImageController.deleteImage.bind(vehicleImageController));

/**
 * @swagger
 * /api/vehicle-images/set-primary/{imageId}/vehicle/{vehicleId}:
 *   patch:
 *     summary: Definir uma imagem como a principal para um veículo
 *     tags: [Imagens]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema: { type: integer }
 *         description: ID da imagem a ser definida como principal
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema: { type: integer }
 *         description: ID do veículo
 *     responses:
 *       200:
 *         description: Imagem definida como principal com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string, example: Imagem definida como primária com sucesso }
 *       404:
 *         $ref: '#/components/responses/NotFound' # Veículo ou imagem não encontrada
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.patch('/set-primary/:imageId/vehicle/:vehicleId', vehicleImageController.setPrimaryImage.bind(vehicleImageController));

export default router; 