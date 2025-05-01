import logger from "../../config/logger";
import { Seller } from "../../domain/entities/Seller";
import { ISellerRepository } from "../../domain/repositories/ISellerRepository";
import { SellerAdapter } from "../adapters/SellerAdapter";
import { CreateSellerDTO, SellerResponseDTO, UpdateSellerDTO } from "../dtos/SellerDTO";

export class SellerService {
  constructor(private sellerRepository: ISellerRepository) {}

  async findAll(): Promise<SellerResponseDTO[]> {
    const sellers = await this.sellerRepository.findAll();
    
    // Para cada vendedor, buscar seus veículos associados
    const sellersWithVehicles = await Promise.all(
      sellers.map(async (seller) => {
        if (seller.id === undefined) {
          logger.error({ sellerData: seller }, 'Seller encontrado sem ID em findAll');
          return null;
        }
        const vehicleIds = await this.sellerRepository.getVehiclesBySellerId(seller.id);
        return SellerAdapter.toDTO(seller, vehicleIds);
      })
    );

    return sellersWithVehicles.filter((s): s is SellerResponseDTO => s !== null);
  }

  async findById(id: number): Promise<SellerResponseDTO | null> {
    const seller = await this.sellerRepository.findById(id);
    if (!seller || seller.id === undefined) return null;

    const vehicleIds = await this.sellerRepository.getVehiclesBySellerId(seller.id);
    return SellerAdapter.toDTO(seller, vehicleIds);
  }

  async create(data: CreateSellerDTO): Promise<SellerResponseDTO> {
    logger.info({ email: data.email, cpf: data.cpf }, 'Tentativa de criar novo vendedor');
    // Verificar se já existe um vendedor com o mesmo email ou CPF
    const existingSellerEmail = await this.sellerRepository.findByEmail(data.email);
    if (existingSellerEmail) {
      logger.warn({ email: data.email }, 'Email já cadastrado para outro vendedor');
      const conflictError = new Error('Já existe um vendedor com este email');
      (conflictError as any).statusCode = 409;
      throw conflictError;
    }

    const existingSellerCPF = await this.sellerRepository.findByCPF(data.cpf);
    if (existingSellerCPF) {
      logger.warn({ cpf: data.cpf }, 'CPF já cadastrado para outro vendedor');
      const conflictError = new Error('Já existe um vendedor com este CPF');
      (conflictError as any).statusCode = 409;
      throw conflictError;
    }

    try {
      // Converter DTO para entidade
      const sellerEntity = SellerAdapter.toEntity(data);
      // Remover ID temporário antes de enviar para o repositório
      const { id, ...sellerDataToCreate } = sellerEntity;

      // Criar o vendedor
      const createdSellerEntity = await this.sellerRepository.create(sellerDataToCreate);
      logger.info({ sellerId: createdSellerEntity.id }, 'Vendedor criado com sucesso');
      // Converter entidade criada para DTO (sem veículos inicialmente)
      return SellerAdapter.toDTO(createdSellerEntity);
    } catch (error) {
      logger.error({ error }, 'Erro ao criar vendedor no repositório');
      throw error;
    }
  }

  async update(id: number, data: UpdateSellerDTO): Promise<SellerResponseDTO> {
    logger.info({ sellerId: id }, 'Tentativa de atualizar vendedor');
    // Verificar se o vendedor existe
    const existingSeller = await this.sellerRepository.findById(id);
    if (!existingSeller) {
      logger.warn({ sellerId: id }, 'Vendedor não encontrado para atualização');
      const notFoundError = new Error('Vendedor não encontrado');
      (notFoundError as any).statusCode = 404;
      throw notFoundError;
    }

    // Verificar conflitos de email e CPF
    if (data.email && data.email !== existingSeller.email) {
      const existingSellerEmail = await this.sellerRepository.findByEmail(data.email);
      if (existingSellerEmail && existingSellerEmail.id !== id) {
        logger.warn({ sellerId: id, conflictingEmail: data.email, existingSellerId: existingSellerEmail.id }, 'Conflito de email na atualização');
        const conflictError = new Error('Já existe um vendedor com este email');
        (conflictError as any).statusCode = 409;
        throw conflictError;
      }
    }

    if (data.cpf && data.cpf !== existingSeller.cpf) {
      const existingSellerCPF = await this.sellerRepository.findByCPF(data.cpf);
      if (existingSellerCPF && existingSellerCPF.id !== id) {
         logger.warn({ sellerId: id, conflictingCPF: data.cpf, existingSellerId: existingSellerCPF.id }, 'Conflito de CPF na atualização');
        const conflictError = new Error('Já existe um vendedor com este CPF');
        (conflictError as any).statusCode = 409;
        throw conflictError;
      }
    }

    try {
       // Preparar dados parciais para o repositório
       // Omitir ID do DTO de atualização
       const { id: dtoId, ...updateData } = data;
       const sellerPartialData: Partial<Omit<Seller, 'id' | 'createdAt' | 'updatedAt' | 'toJSON'>> = { ...updateData };

      // Atualizar o vendedor
      const updatedSellerEntity = await this.sellerRepository.update(id, sellerPartialData);
      logger.info({ sellerId: id }, 'Vendedor atualizado com sucesso');
      // Obter IDs de veículos e converter para DTO
      const vehicleIds = await this.sellerRepository.getVehiclesBySellerId(updatedSellerEntity.id!);
      return SellerAdapter.toDTO(updatedSellerEntity, vehicleIds);
     } catch (error) {
       logger.error({ sellerId: id, error }, 'Erro ao atualizar vendedor no repositório');
       throw error;
     }
  }

  async delete(id: number): Promise<void> {
     logger.info({ sellerId: id }, 'Tentativa de excluir vendedor');
     try {
       // A validação de veículos associados é feita no repositório
       await this.sellerRepository.delete(id);
       logger.info({ sellerId: id }, 'Vendedor excluído com sucesso');
     } catch (error: any) {
       // Capturar e logar erro específico de conflito
       if (error.statusCode === 409) {
          logger.warn({ sellerId: id, error: error.message }, 'Falha ao excluir vendedor devido a veículos associados');
       } else {
          logger.error({ sellerId: id, error }, 'Erro ao excluir vendedor');
       }
       throw error;
     }
  }
} 