import { VehicleImage } from "../../domain/entities/VehicleImage";
import {
    CreateVehicleImageDTO,
    VehicleImageResponseDTO
} from "../dtos/VehicleImageDTO";

export class VehicleImageAdapter {
  public static toEntity(dto: CreateVehicleImageDTO): VehicleImage {
    return new VehicleImage({
      id: 0, // ID temporário, será ignorado
      filename: dto.filename,
      path: dto.path,
      url: dto.url,
      description: dto.description,
      isPrimary: dto.isPrimary,
      vehicleId: dto.vehicleId,
      createdAt: new Date(), // Temporário
      updatedAt: new Date()  // Temporário
    });
  }

  public static toDTO(entity: VehicleImage): VehicleImageResponseDTO {
    return {
      id: entity.id,
      filename: entity.filename,
      url: entity.url,
      description: entity.description,
      isPrimary: entity.isPrimary,
      vehicleId: entity.vehicleId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  public static toDomain(dto: any): VehicleImage {
    return new VehicleImage({
      id: dto.id,
      filename: dto.filename,
      path: dto.path,
      url: dto.url,
      description: dto.description,
      isPrimary: dto.isPrimary,
      vehicleId: dto.vehicleId,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    });
  }
} 