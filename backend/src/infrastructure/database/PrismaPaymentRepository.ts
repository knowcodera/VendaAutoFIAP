import { Prisma, PrismaClient } from '@prisma/client';
import { Payment, PaymentStatus } from '../../domain/entities/Payment';
import { IPaymentRepository } from '../../domain/repositories/PaymentRepository';
// Remover importações de DTOs e Adapter
// import { CreatePaymentDTO, PaymentResponseDTO, UpdatePaymentDTO } from '../../application/dtos/PaymentDTO';
// import { PaymentAdapter } from '../../application/adapters/PaymentAdapter';

// Extender o PrismaClient para reconhecer o modelo Payment (Pode não ser estritamente necessário com tipos Prisma)
// type PrismaClientWithPayment = PrismaClient & {
//   payment: {
//     create: any;
//     findMany: any;
//     findUnique: any;
//     findFirst: any;
//     update: any;
//     delete: any;
//   }
// }

export class PrismaPaymentRepository implements IPaymentRepository {
  private prisma: PrismaClient;

  // Receber PrismaClient injetado
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Receber entidade parcial, retornar entidade completa
  async create(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'toJSON' | 'validate' | 'updateStatus' | 'setExternalInfo' | 'setBuyerCPF' | 'isValidCPF'>): Promise<Payment> {
    try {
      // Verificar se já existe um pagamento para este veículo
      const existingPaymentRecord = await this.prisma.payment.findUnique({
        where: { vehicleId: payment.vehicleId },
      });

      // Se já existe um pagamento e é APPROVED ou PENDING, lance um erro
      if (existingPaymentRecord && (existingPaymentRecord.status === PaymentStatus.APPROVED || existingPaymentRecord.status === PaymentStatus.PENDING)) {
        const conflictError = new Error(`Já existe um pagamento ${existingPaymentRecord.status} para este veículo.`);
        (conflictError as any).statusCode = 409;
        throw conflictError;
      }

      // Mapear entidade para dados do Prisma
      const dataToUpsert: Prisma.PaymentUncheckedCreateInput = {
        vehicleId: payment.vehicleId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status, // Usar o status da entidade (geralmente PENDING por padrão)
        buyerCPF: payment.buyerCPF,
        // Outros campos podem ser definidos como null ou undefined explicitamente se necessário
        externalId: payment.externalId,
        paymentLink: payment.paymentLink,
        paymentDate: payment.paymentDate,
        additionalInfo: payment.additionalInfo,
      };

       const updateData: Prisma.PaymentUncheckedUpdateInput = {
        status: payment.status, // Atualiza para PENDING se existir um CANCELLED/REFUNDED
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        buyerCPF: payment.buyerCPF,
        // Limpar campos que podem ter sido preenchidos anteriormente
        externalId: null,
        paymentDate: null,
        paymentLink: null,
        additionalInfo: null, // Limpar também
      };

      // Usar upsert com update para casos de pagamentos CANCELLED ou REFUNDED
      const result = await this.prisma.payment.upsert({
        where: {
          vehicleId: payment.vehicleId
        },
        create: dataToUpsert,
        update: updateData, // Atualizar para PENDING se já existir
      });

      // ---- MODIFICAÇÃO ----
      // Em vez de mapear 'result' diretamente, vamos usar a entidade original
      // 'payment' que já tem o externalId definido pelo Service, e adicionar o ID retornado.
      // Isso garante que o externalId esteja presente, mesmo que o upsert não o retorne.
      const createdOrUpdatedPayment = new Payment(
        payment.vehicleId,
        payment.amount,
        payment.paymentMethod,
        result.id, // Usar o ID retornado pelo upsert
        result.status as PaymentStatus, // Usar o status retornado (pode ter sido atualizado)
        payment.externalId, // Usar o externalId da entidade original
        result.paymentLink ?? undefined,
        result.paymentDate ?? undefined,
        result.buyerCPF ?? undefined,
        result.additionalInfo ?? undefined,
        result.createdAt, 
        result.updatedAt
      );
      return createdOrUpdatedPayment;
      // ---- FIM MODIFICAÇÃO ----

      // Código antigo: return this.mapToEntity(result);
    } catch (error: any) {
      // Manter tratamento de erro P2002 se o upsert falhar de forma inesperada
      if (error.code === 'P2002') {
         const conflictError = new Error('Erro de concorrência ao criar/atualizar pagamento para este veículo.');
        (conflictError as any).statusCode = 409;
        throw conflictError;
      }
      // Relançar outros erros
      throw error;
    }
  }

  // Retornar entidade ou null
  async findById(id: number): Promise<Payment | null> {
    const paymentRecord = await this.prisma.payment.findUnique({
      where: { id }
    });

    if (!paymentRecord) {
      return null;
    }

    // Mapear para entidade
    return this.mapToEntity(paymentRecord);
  }

  // Retornar entidade ou null
  async findByVehicleId(vehicleId: number): Promise<Payment | null> {
    const paymentRecord = await this.prisma.payment.findUnique({
      where: { vehicleId }
    });

    if (!paymentRecord) {
      return null;
    }

    // Mapear para entidade
    return this.mapToEntity(paymentRecord);
  }

  // Retornar entidade ou null
  async findByExternalId(externalId: string): Promise<Payment | null> {
    const paymentRecord = await this.prisma.payment.findFirst({
      where: { externalId }
    });

    if (!paymentRecord) {
      return null;
    }

    // Mapear para entidade
    return this.mapToEntity(paymentRecord);
  }

  // Receber ID e entidade parcial, retornar entidade completa
  async update(id: number, paymentData: Partial<Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'toJSON' | 'validate' | 'updateStatus' | 'setExternalInfo' | 'setBuyerCPF' | 'isValidCPF'>>): Promise<Payment> {
    // Verificar se o pagamento existe
    const existingPayment = await this.prisma.payment.findUnique({ where: { id } });
    if (!existingPayment) {
      throw new Error(`Pagamento com ID ${id} não encontrado.`);
    }

    // Mapear entidade parcial para dados de atualização do Prisma
    // Usar Prisma.PaymentUpdateInput para tipagem mais segura
    const dataToUpdate: Prisma.PaymentUpdateInput = {};
    if (paymentData.status !== undefined) dataToUpdate.status = paymentData.status;
    if (paymentData.externalId !== undefined) dataToUpdate.externalId = paymentData.externalId;
    if (paymentData.paymentLink !== undefined) dataToUpdate.paymentLink = paymentData.paymentLink;
    if (paymentData.paymentDate !== undefined) dataToUpdate.paymentDate = paymentData.paymentDate;
    if (paymentData.additionalInfo !== undefined) dataToUpdate.additionalInfo = paymentData.additionalInfo;
    if (paymentData.buyerCPF !== undefined) dataToUpdate.buyerCPF = paymentData.buyerCPF;
    // Não permitir atualização direta de amount, paymentMethod, vehicleId aqui geralmente

    if (Object.keys(dataToUpdate).length === 0) {
      // Se não há dados para atualizar, retorna a entidade existente mapeada
      return this.mapToEntity(existingPayment);
    }

    const updatedPaymentRecord = await this.prisma.payment.update({
      where: { id: id },
      data: dataToUpdate
    });

    // Mapear para entidade
    return this.mapToEntity(updatedPaymentRecord);
  }

  // Função auxiliar para mapear do Prisma para a Entidade Payment
  // A entrada 'prismaPayment' deve ter o tipo inferido do Prisma (ex: resultado de findUnique)
  private mapToEntity(prismaPayment: any): Payment {
    // Garantir que o status seja um valor válido do enum PaymentStatus
    const status = Object.values(PaymentStatus).includes(prismaPayment.status as PaymentStatus)
                   ? prismaPayment.status as PaymentStatus
                   : PaymentStatus.PENDING; // Ou lançar um erro se o status do DB for inválido

    return new Payment(
      prismaPayment.vehicleId,
      prismaPayment.amount,
      prismaPayment.paymentMethod,
      prismaPayment.id,
      status, // Usar o status validado
      prismaPayment.externalId ?? undefined, // Usar ?? para tratar null/undefined
      prismaPayment.paymentLink ?? undefined,
      prismaPayment.paymentDate ?? undefined,
      prismaPayment.buyerCPF ?? undefined,
      prismaPayment.additionalInfo ?? undefined,
      prismaPayment.createdAt,
      prismaPayment.updatedAt
    );
  }
} 