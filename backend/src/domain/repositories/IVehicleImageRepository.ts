import { VehicleImage } from "../entities/VehicleImage";

export interface IVehicleImageRepository {
  findAll(): Promise<VehicleImage[]>;
  findByVehicleId(vehicleId: number): Promise<VehicleImage[]>;
  findById(id: number): Promise<VehicleImage | null>;

  /**
   * Cria um novo registro de imagem de veículo.
   * @param image Entidade VehicleImage (sem id, createdAt, updatedAt).
   * @returns A entidade VehicleImage criada.
   */
  create(image: Omit<VehicleImage, 'id' | 'createdAt' | 'updatedAt'>): Promise<VehicleImage>;

  /**
   * Atualiza um registro de imagem de veículo.
   * @param id ID da imagem a ser atualizada.
   * @param imageData Dados parciais da entidade VehicleImage para atualizar (description, isPrimary).
   * @returns A entidade VehicleImage atualizada.
   */
  update(id: number, imageData: Partial<Pick<VehicleImage, 'description' | 'isPrimary'>>): Promise<VehicleImage>;

  delete(id: number): Promise<void>;

  /**
   * Define uma imagem como primária para um veículo,
   * garantindo que apenas uma seja primária.
   * @param vehicleId ID do veículo.
   * @param imageId ID da imagem a ser definida como primária.
   */
  setPrimaryImage(vehicleId: number, imageId: number): Promise<void>;
} 