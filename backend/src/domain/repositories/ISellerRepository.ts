import { Seller } from "../entities/Seller";

export interface ISellerRepository {
  findAll(): Promise<Seller[]>;
  findById(id: number): Promise<Seller | null>;
  findByEmail(email: string): Promise<Seller | null>;
  findByCPF(cpf: string): Promise<Seller | null>;

  /**
   * Cria um novo vendedor.
   * @param seller Entidade Seller (sem id, createdAt, updatedAt).
   * @returns A entidade Seller criada.
   */
  create(seller: Omit<Seller, 'id' | 'createdAt' | 'updatedAt' | 'toJSON'>): Promise<Seller>;

  /**
   * Atualiza um vendedor existente.
   * @param id ID do vendedor a ser atualizado.
   * @param sellerData Dados parciais da entidade Seller para atualizar.
   * @returns A entidade Seller atualizada.
   */
  update(id: number, sellerData: Partial<Omit<Seller, 'id' | 'createdAt' | 'updatedAt' | 'toJSON'>>): Promise<Seller>;

  delete(id: number): Promise<void>;

  /**
   * Obtém os IDs dos veículos associados a um vendedor.
   * @param sellerId ID do vendedor.
   * @returns Array de IDs dos veículos.
   */
  getVehiclesBySellerId(sellerId: number): Promise<number[]>;
} 