import { Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { UpdateVehicleImageDTO } from '../application/dtos/VehicleImageDTO';
import { VehicleImageService } from '../application/services/VehicleImageService';

// Configurar o diretório de uploads
const UPLOADS_DIR = path.join(__dirname, '../../uploads/vehicles');

// Criar o diretório se não existir
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configurar o multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `vehicle-${uniqueSuffix}${ext}`);
  }
});

// Filtro para permitir apenas imagens
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Apenas imagens JPEG, PNG, GIF e WEBP são permitidas.'));
  }
};

// Configurar o upload
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limitar a 5MB
  }
});

export class VehicleImageController {
  private vehicleImageService: VehicleImageService;

  // Receber o serviço injetado
  constructor(vehicleImageService: VehicleImageService) {
    this.vehicleImageService = vehicleImageService;
  }

  // Buscar todas as imagens de um veículo
  async getImagesByVehicleId(req: Request, res: Response) {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      if (isNaN(vehicleId)) {
        return res.status(400).json({
          status: 'error',
          message: 'ID de veículo inválido'
        });
      }
      // Usar o serviço injetado
      const images = await this.vehicleImageService.findByVehicleId(vehicleId);
      
      return res.json({
        status: 'success',
        results: images.length,
        data: images
      });
    } catch (error: any) {
      throw error; // Deixar o middleware de erro tratar
    }
  }

  // Fazer upload de uma imagem para um veículo
  async uploadImage(req: Request, res: Response) {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      if (isNaN(vehicleId)) {
        return res.status(400).json({
          status: 'error',
          message: 'ID de veículo inválido'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'Nenhum arquivo foi enviado'
        });
      }

      const { description } = req.body;
      // Considerar validação de `isPrimary` (boolean ou string 'true'/'false')
      const isPrimary = req.body.isPrimary === 'true' || req.body.isPrimary === true;

      // Usar o serviço injetado
      const image = await this.vehicleImageService.create(
        vehicleId,
        req.file,
        description,
        isPrimary
      );

      return res.status(201).json({
        status: 'success',
        data: image
      });
    } catch (error: any) {
      // Se o erro for do multer (ex: tipo de arquivo inválido), retornar 400
      if (error instanceof multer.MulterError) {
         return res.status(400).json({ status: 'error', message: `Erro no upload: ${error.message}` });
      } 
      // Se o erro for do fileFilter
      if (error.message.includes('Tipo de arquivo não suportado')) {
        return res.status(400).json({ status: 'error', message: error.message });
      }
      throw error; // Deixar o middleware de erro tratar outros erros
    }
  }

  // Atualizar informações de uma imagem (descrição, marcar como primária)
  async updateImage(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'ID de imagem inválido'
        });
      }

      const { description, isPrimary } = req.body;
      // Validar ou garantir que isPrimary seja boolean
      const updateData: UpdateVehicleImageDTO = {};
      if (description !== undefined) updateData.description = description;
      if (isPrimary !== undefined) updateData.isPrimary = isPrimary === 'true' || isPrimary === true;

      // Usar o serviço injetado
      const image = await this.vehicleImageService.update(id, updateData);

      return res.json({
        status: 'success',
        data: image
      });
    } catch (error: any) {
      throw error;
    }
  }

  // Excluir uma imagem
  async deleteImage(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'ID de imagem inválido'
        });
      }
      // Usar o serviço injetado
      await this.vehicleImageService.delete(id);

      return res.status(204).send();
    } catch (error: any) {
      throw error;
    }
  }

  // Definir uma imagem como primária
  async setPrimaryImage(req: Request, res: Response) {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const imageId = parseInt(req.params.imageId);
      
      if (isNaN(vehicleId) || isNaN(imageId)) {
        return res.status(400).json({
          status: 'error',
          message: 'IDs inválidos'
        });
      }
      // Usar o serviço injetado
      await this.vehicleImageService.setPrimaryImage(vehicleId, imageId);

      // Retornar sucesso, talvez a imagem atualizada?
      return res.json({
        status: 'success',
        message: 'Imagem definida como primária com sucesso'
      });
    } catch (error: any) {
      throw error;
    }
  }
} 