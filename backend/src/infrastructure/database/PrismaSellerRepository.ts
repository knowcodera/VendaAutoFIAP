import { Prisma, PrismaClient } from '@prisma/client';
import { Seller } from '../../domain/entities/Seller';
import { ISellerRepository } from '../../domain/repositories/ISellerRepository';

export class PrismaSellerRepository implements ISellerRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(): Promise<Seller[]> {
    const sellerRecords = await this.prisma.seller.findMany();
    return sellerRecords.map(seller => this.mapToEntity(seller));
  }

  async findById(id: number): Promise<Seller | null> {
    const sellerRecord = await this.prisma.seller.findUnique({
      where: { id }
    });

    if (!sellerRecord) return null;
    return this.mapToEntity(sellerRecord);
  }

  async findByEmail(email: string): Promise<Seller | null> {
    const sellerRecord = await this.prisma.seller.findUnique({
      where: { email }
    });

    if (!sellerRecord) return null;
    return this.mapToEntity(sellerRecord);
  }

  async findByCPF(cpf: string): Promise<Seller | null> {
    const sellerRecord = await this.prisma.seller.findUnique({
      where: { cpf }
    });

    if (!sellerRecord) return null;
    return this.mapToEntity(sellerRecord);
  }

  async create(seller: Omit<Seller, 'id' | 'createdAt' | 'updatedAt' | 'toJSON'>): Promise<Seller> {
    const dataToCreate: Prisma.SellerCreateInput = {
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
      cpf: seller.cpf,
      gender: seller.gender,
      birthDate: seller.birthDate,
      zipCode: seller.zipCode,
    };

    const createdSellerRecord = await this.prisma.seller.create({
      data: dataToCreate
    });

    return this.mapToEntity(createdSellerRecord);
  }

  async update(id: number, sellerData: Partial<Omit<Seller, 'id' | 'createdAt' | 'updatedAt' | 'toJSON'>>): Promise<Seller> {
    const existingSeller = await this.prisma.seller.findUnique({ where: { id } });
    if (!existingSeller) {
      throw new Error('Vendedor não encontrado');
    }

    const dataToUpdate: Prisma.SellerUpdateInput = {};
    if (sellerData.name !== undefined) dataToUpdate.name = sellerData.name;
    if (sellerData.email !== undefined) dataToUpdate.email = sellerData.email;
    if (sellerData.phone !== undefined) dataToUpdate.phone = sellerData.phone;
    if (sellerData.gender !== undefined) dataToUpdate.gender = sellerData.gender;
    if (sellerData.birthDate !== undefined) dataToUpdate.birthDate = sellerData.birthDate;
    if (sellerData.cpf !== undefined) dataToUpdate.cpf = sellerData.cpf;
    if (sellerData.zipCode !== undefined) dataToUpdate.zipCode = sellerData.zipCode;

    if (Object.keys(dataToUpdate).length === 0) {
       return this.mapToEntity(existingSeller);
    }

    const updatedSellerRecord = await this.prisma.seller.update({
      where: { id },
      data: dataToUpdate
    });

    return this.mapToEntity(updatedSellerRecord);
  }

  async delete(id: number): Promise<void> {
    const existingSeller = await this.prisma.seller.findUnique({ where: { id } });
    if (!existingSeller) {
      throw new Error('Vendedor não encontrado');
    }

    const vehicleCount = await this.prisma.vehicle.count({
      where: { sellerId: id }
    });

    if (vehicleCount > 0) {
      const conflictError = new Error('Não é possível excluir um vendedor que possui veículos associados.');
      (conflictError as any).statusCode = 409;
      throw conflictError;
    }

    await this.prisma.seller.delete({
      where: { id }
    });
  }

  async getVehiclesBySellerId(sellerId: number): Promise<number[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { sellerId },
      select: { id: true }
    });

    return vehicles.map(vehicle => vehicle.id);
  }

  private mapToEntity(prismaSeller: any): Seller {
    return new Seller({
      id: prismaSeller.id,
      name: prismaSeller.name,
      email: prismaSeller.email,
      phone: prismaSeller.phone,
      gender: prismaSeller.gender ?? undefined,
      birthDate: prismaSeller.birthDate ?? undefined,
      cpf: prismaSeller.cpf,
      zipCode: prismaSeller.zipCode ?? undefined,
      createdAt: prismaSeller.createdAt,
      updatedAt: prismaSeller.updatedAt
    });
  }
} 