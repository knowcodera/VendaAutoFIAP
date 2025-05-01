import { Seller } from "../../domain/entities/Seller";
import {
    CreateSellerDTO,
    SellerResponseDTO
} from "../dtos/SellerDTO";

export class SellerAdapter {
  public static toEntity(dto: CreateSellerDTO): Seller {
    // Se for CreateSellerDTO
    return new Seller({
      id: 0, // ID será gerado pelo banco de dados
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      gender: dto.gender,
      birthDate: dto.birthDate,
      cpf: dto.cpf,
      zipCode: dto.zipCode,
      // createdAt e updatedAt serão definidos pelo DB/construtor
    });
  }

  public static toDTO(entity: Seller, vehicleIds?: number[]): SellerResponseDTO {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
      gender: entity.gender,
      birthDate: entity.birthDate,
      cpf: entity.cpf,
      zipCode: entity.zipCode,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      vehicles: vehicleIds
    };
  }
} 