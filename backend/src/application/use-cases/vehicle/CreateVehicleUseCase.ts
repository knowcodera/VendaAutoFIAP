import { Vehicle } from '@/domain/entities/Vehicle';
import { IVehicleRepository } from '@/domain/repositories/IVehicleRepository';
import { VehicleAdapter } from '@/infrastructure/adapters/VehicleAdapter';
import { createVehicleSchema } from '@/validators/vehicle.validators';
import { ZodError } from 'zod';
import { CreateVehicleDTO, VehicleResponseDTO } from '../../dtos/VehicleDTO';
import { AppError } from '../../errors/AppError';
import { IUseCase } from '../../interfaces/IUseCase';

export class CreateVehicleUseCase implements IUseCase<CreateVehicleDTO, VehicleResponseDTO> {
  constructor(private vehicleRepository: IVehicleRepository) {}

  async execute(data: CreateVehicleDTO): Promise<VehicleResponseDTO> {
    try {
      // 1. Validar DTO de entrada
      const validatedData = createVehicleSchema.parse(data);

      // 2. Mapear DTO validado para a entidade parcial esperada pelo repositório
      // O adapter toEntity pode precisar de ajustes se não gerar o tipo Omit<...> correto
      // Por enquanto, vamos assumir que ele retorna os campos necessários.
      // O tipo Omit<...> da interface IVehicleRepository.create é complexo,
      // simplificando aqui para passar os dados básicos.
      const vehicleEntityData = {
        brand: validatedData.brand,
        model: validatedData.model,
        year: validatedData.year,
        color: validatedData.color,
        price: validatedData.price,
        mileage: validatedData.mileage,
        fuelType: validatedData.fuelType,
        transmission: validatedData.transmission,
        condition: validatedData.condition,
        numberOfDoors: validatedData.numberOfDoors,
        sellerId: validatedData.sellerId
        // isSold, buyerCPF, saleDate são definidos pelo sistema/repositório
      };

      // 3. Chamar o repositório para criar a entidade
      const createdVehicle: Vehicle = await this.vehicleRepository.create(vehicleEntityData);

      // 4. Mapear a entidade retornada para o DTO de resposta
      const responseDTO = VehicleAdapter.toDTO(createdVehicle);

      // 5. Retornar DTO
      return responseDTO;

    } catch (error: any) {
      if (error instanceof ZodError) {
        // Reformatar erros do Zod para uma estrutura mais amigável
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        throw new AppError('Erro de validação', 400, validationErrors);
      }
      // Relançar outros erros (ou tratar especificamente erros do repositório)
      console.error("Erro ao criar veículo:", error); // Log para depuração
      throw new AppError(error.message || 'Erro interno ao criar veículo', 500);
    }
  }
} 