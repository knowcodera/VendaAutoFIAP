import { CreateVehicleDTO, UpdateVehicleDTO, VehicleResponseDTO } from '../../application/dtos/VehicleDTO';
import { Vehicle } from '../../domain/entities/Vehicle';

export class VehicleAdapter {
  public static toEntity(data: CreateVehicleDTO | UpdateVehicleDTO): Vehicle {
    if ('id' in data) {
      return new Vehicle({
        id: data.id,
        brand: data.brand || '',
        model: data.model || '',
        year: data.year || 0,
        color: data.color || '',
        price: data.price || 0,
        mileage: data.mileage,
        fuelType: data.fuelType,
        transmission: data.transmission,
        condition: data.condition,
        numberOfDoors: data.numberOfDoors,
        sellerId: ('sellerId' in data && typeof data.sellerId === 'number') ? data.sellerId : undefined,
        isSold: false,
        createdAt: undefined,
        updatedAt: undefined
      });
    }

    return new Vehicle({
      id: 0,
      brand: data.brand,
      model: data.model,
      year: data.year,
      color: data.color,
      price: data.price,
      mileage: data.mileage,
      fuelType: data.fuelType,
      transmission: data.transmission,
      condition: data.condition,
      numberOfDoors: data.numberOfDoors,
      sellerId: data.sellerId,
      isSold: false,
      createdAt: undefined,
      updatedAt: undefined
    });
  }

  public static toDTO(vehicle: Vehicle): VehicleResponseDTO {
    return {
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      price: vehicle.price,
      mileage: vehicle.mileage,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      condition: vehicle.condition,
      numberOfDoors: vehicle.numberOfDoors,
      sellerId: vehicle.sellerId,
      isSold: vehicle.isSold,
      buyerCPF: vehicle.buyerCPF || null,
      saleDate: vehicle.saleDate ? vehicle.saleDate.toISOString() : undefined,
      primaryImageUrl: undefined,
      images: [],
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
      paymentStatus: undefined,
      paymentId: undefined,
      paymentExternalId: null,
    };
  }

  public static toDomain(dto: VehicleResponseDTO): Vehicle {
    return new Vehicle({
      id: dto.id,
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
      isSold: dto.isSold,
      buyerCPF: dto.buyerCPF || undefined,
      saleDate: dto.saleDate ? new Date(dto.saleDate) : undefined,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    });
  }
} 