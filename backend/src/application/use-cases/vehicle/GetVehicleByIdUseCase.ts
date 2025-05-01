import { IUseCase } from '../../interfaces/IUseCase';
import { VehicleResponseDTO } from '../../dtos/VehicleDTO';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { VehicleAdapter } from '../../adapters/VehicleAdapter';

export interface GetVehicleByIdInput {
  id: number;
}

export class GetVehicleByIdUseCase implements IUseCase<number, VehicleResponseDTO | null> {
  constructor(private vehicleRepository: IVehicleRepository) {}

  async execute(id: number): Promise<VehicleResponseDTO | null> {
    const vehicle = await this.vehicleRepository.findById(id);
    
    if (!vehicle) {
      return null;
    }
    
    return VehicleAdapter.toDTO(vehicle);
  }
} 