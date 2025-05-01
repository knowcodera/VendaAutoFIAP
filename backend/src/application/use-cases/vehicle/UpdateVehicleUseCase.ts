import { IUseCase } from '../../interfaces/IUseCase';
import { UpdateVehicleDTO, VehicleResponseDTO } from '../../dtos/VehicleDTO';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { VehicleAdapter } from '../../adapters/VehicleAdapter';

export interface UpdateVehicleInput {
  id: number;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  price?: number;
}

export class UpdateVehicleUseCase implements IUseCase<UpdateVehicleDTO, VehicleResponseDTO> {
  constructor(private vehicleRepository: IVehicleRepository) {}

  async execute(input: UpdateVehicleDTO): Promise<VehicleResponseDTO> {
    const { id, ...updateData } = input;
    const vehicle = await this.vehicleRepository.update(id, updateData);
    return VehicleAdapter.toDTO(vehicle);
  }
} 