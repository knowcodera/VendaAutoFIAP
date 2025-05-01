import { Payment } from "../entities/Payment";

export interface IPaymentRepository {
  /**
   * Cria um novo registro de pagamento.
   * @param payment Entidade Payment (sem id, createdAt, updatedAt).
   * @returns A entidade Payment criada.
   */
  create(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'toJSON' | 'validate' | 'updateStatus' | 'setExternalInfo' | 'setBuyerCPF' | 'isValidCPF'>): Promise<Payment>;

  /**
   * Encontra um pagamento pelo ID.
   * @param id ID do pagamento.
   * @returns A entidade Payment encontrada ou null.
   */
  findById(id: number): Promise<Payment | null>;

  /**
   * Encontra um pagamento pelo ID do veículo associado.
   * @param vehicleId ID do veículo.
   * @returns A entidade Payment encontrada ou null.
   */
  findByVehicleId(vehicleId: number): Promise<Payment | null>;

  /**
   * Encontra um pagamento pelo ID externo (ex: gateway de pagamento).
   * @param externalId ID externo.
   * @returns A entidade Payment encontrada ou null.
   */
  findByExternalId(externalId: string): Promise<Payment | null>;

  /**
   * Atualiza um registro de pagamento existente.
   * @param id ID do pagamento a ser atualizado.
   * @param paymentData Dados parciais da entidade Payment para atualizar.
   * @returns A entidade Payment atualizada.
   */
  update(id: number, paymentData: Partial<Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'toJSON' | 'validate' | 'updateStatus' | 'setExternalInfo' | 'setBuyerCPF' | 'isValidCPF'>>): Promise<Payment>;
} 