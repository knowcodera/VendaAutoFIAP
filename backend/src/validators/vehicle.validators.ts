import { z } from 'zod';

// Schema de validação para criação de veículo
export const createVehicleSchema = z.object({
  brand: z.string().min(1, 'A marca é obrigatória'),
  model: z.string().min(1, 'O modelo é obrigatório'),
  year: z.number().int().min(1886, 'O ano deve ser pelo menos 1886 (primeiro carro)').max(new Date().getFullYear() + 1, 'O ano não pode ser futuro'),
  color: z.string().min(1, 'A cor é obrigatória'),
  price: z.number().positive('O preço deve ser positivo'),
  mileage: z.number().nonnegative('A quilometragem não pode ser negativa').optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  condition: z.string().optional(),
  numberOfDoors: z.number().int().positive().optional(),
  sellerId: z.number().int().positive().optional(),
});

// Schema de validação para registro de venda - USANDO REGEX
export const sellVehicleSchema = z.object({
  buyerCPF: z.string().regex(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido. Use 11 dígitos ou o formato 000.000.000-00')
});

// Schema de validação para atualização de veículo
export const updateVehicleSchema = createVehicleSchema.partial();

// Tipo inferido para criação de veículo
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;

// Tipo inferido para venda de veículo
export type SellVehicleInput = z.infer<typeof sellVehicleSchema>;

// Tipo inferido para atualização de veículo
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>; 