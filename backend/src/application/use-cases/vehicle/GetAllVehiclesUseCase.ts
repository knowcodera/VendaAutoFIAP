import { VehicleResponseDTO } from '@/application/dtos/VehicleDTO';
import { IUseCase } from '@/application/interfaces/IUseCase';
import { Vehicle } from '@/domain/entities/Vehicle';
import { IVehicleRepository, VehicleFilters, VehicleOrderBy } from '@/domain/repositories/IVehicleRepository';
import { VehicleAdapter } from '@/infrastructure/adapters/VehicleAdapter';

export class GetAllVehiclesUseCase implements IUseCase<{ filters?: VehicleFilters, orderBy?: VehicleOrderBy }, VehicleResponseDTO[]> {
  constructor(private vehicleRepository: IVehicleRepository) {}

  async execute(params?: { filters?: VehicleFilters, orderBy?: VehicleOrderBy }): Promise<VehicleResponseDTO[]> {
    const filters = params?.filters;
    const orderBy = params?.orderBy;
    const vehicles: Vehicle[] = await this.vehicleRepository.findAll(filters, orderBy);

    const vehicleDTOs = vehicles.map(vehicle => VehicleAdapter.toDTO(vehicle));

    return vehicleDTOs;
  }
} 