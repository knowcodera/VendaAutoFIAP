import { Vehicle } from "../../domain/entities/Vehicle";
import { CreateVehicleDTO, /* UpdateVehicleDTO, */ VehicleResponseDTO } from "../dtos/VehicleDTO";
import { VehicleImageAdapter } from "./VehicleImageAdapter";
import { VehicleImageResponseDTO } from "../dtos/VehicleImageDTO";
import { ConfigService } from "../services/ConfigService";

/**
 * Adaptador para converter entre entidades de domínio e DTOs
 */
export class VehicleAdapter {
  /**
   * Converte uma entidade Vehicle para VehicleResponseDTO
   */
  static toDTO(vehicle: Vehicle): VehicleResponseDTO {
    return {
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      price: vehicle.price,
      isSold: vehicle.isSold,
      buyerCPF: vehicle.buyerCPF,
      saleDate: vehicle.saleDate ? vehicle.saleDate.toISOString() : undefined,
      mileage: vehicle.mileage,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      condition: vehicle.condition,
      numberOfDoors: vehicle.numberOfDoors,
      sellerId: vehicle.sellerId,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
      primaryImageUrl: (() => {
        const primaryImage = vehicle.images?.find(img => img.isPrimary);
        if (!primaryImage) return null;
        
        const url = primaryImage.url;
        if (url.startsWith('http')) return url;
        
        const configService = ConfigService.getInstance();
        const baseUrl = configService.get('API_BASE_URL', configService.get('BACKEND_URL', 'http://localhost:3000'));
        return url.startsWith('/') 
          ? `${baseUrl}${url}` 
          : `${baseUrl}/${url}`;
      })(),
      images: vehicle.images?.map(img => ({
        id: img.id,
        url: img.url,
        filename: img.filename,
        description: img.description || undefined,
        isPrimary: img.isPrimary,
        vehicleId: img.vehicleId,
        createdAt: img.createdAt,
        updatedAt: img.updatedAt
      } as VehicleImageResponseDTO)),
      paymentStatus: vehicle.payment?.status,
      paymentId: vehicle.payment?.id,
      paymentExternalId: vehicle.payment?.externalId
    };
  }

  /**
   * Converte um VehicleResponseDTO para entidade Vehicle
   */
  static toDomain(dto: VehicleResponseDTO): Vehicle {
    return new Vehicle({
      id: dto.id,
      brand: dto.brand,
      model: dto.model,
      year: dto.year,
      color: dto.color,
      price: dto.price,
      isSold: dto.isSold,
      buyerCPF: dto.buyerCPF || null,
      saleDate: dto.saleDate ? new Date(dto.saleDate) : undefined,
      mileage: dto.mileage,
      fuelType: dto.fuelType,
      transmission: dto.transmission,
      condition: dto.condition,
      numberOfDoors: dto.numberOfDoors,
      sellerId: dto.sellerId,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    });
  }

  static toEntity(dto: CreateVehicleDTO): Vehicle {
    // Se for CreateVehicleDTO
    return new Vehicle({
      id: 0, // ID será gerado pelo banco de dados
      brand: dto.brand,
      model: dto.model,
      year: dto.year,
      color: dto.color,
      price: dto.price,
      mileage: dto.mileage,
      fuelType: dto.fuelType,
      transmission: dto.transmission,
      condition: dto.condition,
      numberOfDoors: dto.numberOfDoors,
      sellerId: dto.sellerId,
      isSold: false // Valor inicial
      // Outros campos como payment, images, buyerCPF, saleDate não são definidos na criação via DTO
    });
  }
} 