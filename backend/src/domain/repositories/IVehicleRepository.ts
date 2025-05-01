import { Vehicle } from '@/domain/entities/Vehicle';

/**
 * Filtros opcionais para busca de veículos
 */
export interface VehicleFilters {
  onlySold?: boolean;
  brand?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  minMileage?: number;
  maxMileage?: number;
  fuelType?: string;
  transmission?: string;
  condition?: string;
}

/**
 * Opções de ordenação para busca de veículos
 */
export interface VehicleOrderBy {
  field: 'price' | 'year' | 'createdAt' | 'mileage';
  direction: 'asc' | 'desc';
}

/**
 * Interface para o repositório de veículos
 */
export interface IVehicleRepository {
  /**
   * Encontra todos os veículos com filtros e ordenação opcionais
   */
  findAll(filters?: VehicleFilters, orderBy?: VehicleOrderBy): Promise<Vehicle[]>;

  /**
   * Encontra um veículo pelo ID
   * @param id ID do veículo
   */
  findById(id: number): Promise<Vehicle | null>;

  /**
   * Cria um novo veículo
   * @param vehicle Dados do veículo (entidade parcial sem id/timestamps)
   */
  create(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'isSold' | 'buyerCPF' | 'saleDate' | 'toJSON' | 'validate' | 'sell' | 'update'>): Promise<Vehicle>;

  /**
   * Atualiza um veículo existente
   * @param id ID do veículo
   * @param vehicle Dados parciais do veículo para atualizar (entidade parcial)
   */
  update(id: number, vehicle: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'toJSON' | 'validate' | 'sell' | 'update'>>): Promise<Vehicle>;

  /**
   * Remove um veículo
   * @param id ID do veículo
   */
  delete(id: number): Promise<void>;

  /**
   * Encontra veículos com base no status de venda.
   * @param isSold Status de venda (true para vendidos, false para não vendidos).
   */
  findBySoldStatus(isSold: boolean): Promise<Vehicle[]>;

  /**
   * Marca um veículo como vendido.
   * @param id ID do veículo.
   * @param buyerCPF CPF do comprador.
   * @returns A entidade Vehicle atualizada.
   */
  sellVehicle(id: number, buyerCPF: string): Promise<Vehicle>;

  // Métodos específicos podem ser adicionados aqui se necessário,
  // como markAsSold, mas idealmente a lógica de negócio fica nos UseCases.
} 