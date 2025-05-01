import { IUseCase } from '../../interfaces/IUseCase';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';

export interface DeleteVehicleInput {
  id: number;
}

export class DeleteVehicleUseCase implements IUseCase<number, void> {
  constructor(private vehicleRepository: IVehicleRepository) {}

  async execute(id: number): Promise<void> {
    await this.vehicleRepository.delete(id);
  }
} 