import * as fs from 'fs';
import * as util from 'util';
import logger from "../../config/logger";
import { IVehicleImageRepository } from "../../domain/repositories/IVehicleImageRepository";
import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository";
import { VehicleImageAdapter } from "../adapters/VehicleImageAdapter";
import {
  CreateVehicleImageDTO,
  UpdateVehicleImageDTO,
  VehicleImageResponseDTO
} from "../dtos/VehicleImageDTO";
import { Express } from 'express';

const unlinkAsync = util.promisify(fs.unlink);

export class VehicleImageService {
  constructor(
    private vehicleImageRepository: IVehicleImageRepository,
    private vehicleRepository: IVehicleRepository
  ) {}

  async findByVehicleId(vehicleId: number): Promise<VehicleImageResponseDTO[]> {
    const images = await this.vehicleImageRepository.findByVehicleId(vehicleId);
    return images.map(image => VehicleImageAdapter.toDTO(image));
  }

  async create(
    vehicleId: number, 
    file: Express.Multer.File,
    description?: string, 
    isPrimary: boolean = false
  ): Promise<VehicleImageResponseDTO> {
    logger.info({ vehicleId, filename: file.filename }, 'Tentativa de criar nova imagem de veículo');
    const vehicle = await this.vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      logger.warn({ vehicleId }, 'Veículo não encontrado para adicionar imagem');
      // Remover arquivo órfão se o veículo não existe
      await unlinkAsync(file.path).catch((err: any) => logger.error({ path: file.path, err }, 'Erro ao remover arquivo órfão'));
      const notFoundError = new Error('Veículo não encontrado');
      (notFoundError as any).statusCode = 404;
      throw notFoundError;
    }

    const existingImages = await this.vehicleImageRepository.findByVehicleId(vehicleId);
    if (existingImages.length === 0 && !isPrimary) {
      logger.info({ vehicleId }, 'Definindo a primeira imagem como primária');
      isPrimary = true; // Garante que a primeira imagem é primária
    }

    // Criar o DTO
    const imageDataDto: CreateVehicleImageDTO = {
      filename: file.filename,
      path: file.path,
      url: `/uploads/vehicles/${file.filename}`,
      description,
      isPrimary,
      vehicleId
    };

    try {
      // Converter DTO para entidade
      const imageEntity = VehicleImageAdapter.toEntity(imageDataDto);
       // Remover ID temporário antes de enviar para o repositório
      const { id, ...imageDataToCreate } = imageEntity;
      
      // Salvar a imagem no banco de dados
      const createdImageEntity = await this.vehicleImageRepository.create(imageDataToCreate);
      logger.info({ imageId: createdImageEntity.id, vehicleId }, 'Imagem de veículo criada com sucesso');
      // Converter entidade criada para DTO
      return VehicleImageAdapter.toDTO(createdImageEntity);
    } catch (error) {
      logger.error({ vehicleId, filename: file.filename, error }, 'Erro ao salvar imagem no repositório');
      // Tentar remover o arquivo físico em caso de erro no banco
      await unlinkAsync(file.path).catch((err: any) => logger.error({ path: file.path, err }, 'Erro ao remover arquivo após falha no banco'));
      throw error;
    }
  }

  async update(id: number, data: UpdateVehicleImageDTO): Promise<VehicleImageResponseDTO> {
    logger.info({ imageId: id, data }, 'Tentativa de atualizar imagem de veículo');
    // O DTO 'data' já tem a forma correta Partial<Pick<VehicleImage, 'description' | 'isPrimary'>>
    // const imagePartialData: Partial<Pick<VehicleImage, 'description' | 'isPrimary'>> = {};
    // if (data.description !== undefined) imagePartialData.description = data.description;
    // if (data.isPrimary !== undefined) imagePartialData.isPrimary = data.isPrimary;

    // Verificar se há dados para atualizar
    if (data.description === undefined && data.isPrimary === undefined) {
       logger.warn({ imageId: id }, 'Nenhum dado fornecido para atualização da imagem');
       const existingImage = await this.vehicleImageRepository.findById(id);
        if (!existingImage) {
          const notFoundError = new Error('Imagem não encontrada');
          (notFoundError as any).statusCode = 404;
          throw notFoundError;
        }
       return VehicleImageAdapter.toDTO(existingImage);
    }

    try {
      // Passar o DTO 'data' diretamente, pois ele corresponde à assinatura do repositório
      const updatedImageEntity = await this.vehicleImageRepository.update(id, data);
      logger.info({ imageId: id }, 'Imagem de veículo atualizada com sucesso');
      return VehicleImageAdapter.toDTO(updatedImageEntity);
    } catch (error) {
       logger.error({ imageId: id, error }, 'Erro ao atualizar imagem no repositório');
       throw error;
    }
  }

  async delete(id: number): Promise<void> {
    logger.info({ imageId: id }, 'Tentativa de excluir imagem de veículo');
    const image = await this.vehicleImageRepository.findById(id);
    if (!image) {
      logger.warn({ imageId: id }, 'Imagem não encontrada para exclusão');
      const notFoundError = new Error('Imagem não encontrada');
      (notFoundError as any).statusCode = 404;
      throw notFoundError;
    }

    try {
      // Excluir do banco de dados (repositório lida com a lógica de primary)
      await this.vehicleImageRepository.delete(id);
      logger.info({ imageId: id }, 'Imagem excluída do banco de dados');

      // Também excluir o arquivo físico
      try {
        await unlinkAsync(image.path);
        logger.info({ imageId: id, path: image.path }, 'Arquivo físico da imagem excluído');
      } catch (fileError) {
        logger.error({ imageId: id, path: image.path, fileError }, 'Erro ao excluir arquivo físico da imagem');
        // Não relançar erro de arquivo, pois o registro DB foi removido
      }
    } catch (error) {
      logger.error({ imageId: id, error }, 'Erro ao excluir imagem do banco de dados');
      throw error;
    }
  }

  async setPrimaryImage(vehicleId: number, imageId: number): Promise<void> {
    logger.info({ vehicleId, imageId }, 'Tentativa de definir imagem primária');
    try {
      await this.vehicleImageRepository.setPrimaryImage(vehicleId, imageId);
      logger.info({ vehicleId, imageId }, 'Imagem definida como primária com sucesso');
    } catch (error) {
       logger.error({ vehicleId, imageId, error }, 'Erro ao definir imagem primária');
       throw error;
    }
  }
} 