import { Payment, PaymentStatus } from '@/domain/entities/Payment';
import { Vehicle } from '@/domain/entities/Vehicle';
import { VehicleImage } from '@/domain/entities/VehicleImage';
import { IVehicleRepository, VehicleFilters, VehicleOrderBy } from '@/domain/repositories/IVehicleRepository';
import { Prisma, PrismaClient } from '@prisma/client';

// Extender o PrismaClient para reconhecer o modelo Vehicle
type PrismaClientWithVehicle = PrismaClient & {
  vehicle: {
    create: any;
    findMany: any;
    findUnique: any;
    findFirst: any;
    update: any;
    delete: any;
  }
}

export class PrismaVehicleRepository implements IVehicleRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'isSold' | 'buyerCPF' | 'saleDate' | 'toJSON' | 'validate' | 'sell' | 'update'>): Promise<Vehicle> {
    // Mapear explicitamente para o tipo esperado pelo Prisma
    const dataToCreate: Prisma.VehicleCreateInput = {
      brand: vehicleData.brand,
      model: vehicleData.model,
      year: vehicleData.year,
      color: vehicleData.color,
      price: vehicleData.price,
      isSold: false, // Definido na criação
      mileage: vehicleData.mileage,
      fuelType: vehicleData.fuelType,
      transmission: vehicleData.transmission,
      condition: vehicleData.condition,
      numberOfDoors: vehicleData.numberOfDoors,
      // Conectar ao vendedor se sellerId for fornecido
      seller: vehicleData.sellerId ? { connect: { id: vehicleData.sellerId } } : undefined
    };

    const createdVehicle = await this.prisma.vehicle.create({
      data: dataToCreate
    });

    return this.mapToEntity(createdVehicle);
  }

  async findAll(
    filters?: VehicleFilters,
    orderBy?: VehicleOrderBy
  ): Promise<Vehicle[]> {
    const where: any = {};
    
    if (filters?.onlySold !== undefined) {
      where.isSold = filters.onlySold;
    }
    if (filters?.brand) {
      where.brand = { contains: filters.brand, mode: 'insensitive' };
    }
    if (filters?.model) {
      where.model = { contains: filters.model, mode: 'insensitive' };
    }
    if (filters?.color) {
      where.color = { contains: filters.color, mode: 'insensitive' };
    }
    if (filters?.minYear !== undefined || filters?.maxYear !== undefined) {
      where.year = {};
      if (filters?.minYear !== undefined) {
        where.year.gte = filters.minYear;
      }
      if (filters?.maxYear !== undefined) {
        where.year.lte = filters.maxYear;
      }
    }
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters?.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters?.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }
    if (filters?.minMileage !== undefined || filters?.maxMileage !== undefined) {
      where.mileage = {};
      if (filters?.minMileage !== undefined) {
        where.mileage.gte = filters.minMileage;
      }
      if (filters?.maxMileage !== undefined) {
        where.mileage.lte = filters.maxMileage;
      }
    }
    if (filters?.fuelType) {
      where.fuelType = filters.fuelType;
    }
    if (filters?.transmission) {
      where.transmission = filters.transmission;
    }
    if (filters?.condition) {
      where.condition = filters.condition;
    }

    const orderByObj: any = {};
    if (orderBy) {
      orderByObj[orderBy.field] = orderBy.direction;
    } else {
      orderByObj.createdAt = 'desc';
    }

    const vehicles = await this.prisma.vehicle.findMany({
      where,
      orderBy: orderByObj,
      include: { 
        images: true,
        payment: true
      }
    });

    return vehicles.map(vehicle => this.mapToEntity(vehicle));
  }

  async findById(id: number): Promise<Vehicle | null> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { 
        images: true,
        payment: true
      }
    });

    if (!vehicle) {
      return null;
    }

    return this.mapToEntity(vehicle);
  }

  async update(id: number, vehicleData: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'toJSON' | 'validate' | 'sell' | 'update'>>): Promise<Vehicle> {
    const existingVehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!existingVehicle) {
      throw new Error(`Veículo com id ${id} não encontrado`);
    }

    // Mapear explicitamente os dados para o tipo Prisma.VehicleUpdateInput
    const dataToUpdate: Prisma.VehicleUpdateInput = {};
    if (vehicleData.brand !== undefined) dataToUpdate.brand = vehicleData.brand;
    if (vehicleData.model !== undefined) dataToUpdate.model = vehicleData.model;
    if (vehicleData.year !== undefined) dataToUpdate.year = vehicleData.year;
    if (vehicleData.color !== undefined) dataToUpdate.color = vehicleData.color;
    if (vehicleData.price !== undefined) dataToUpdate.price = vehicleData.price;
    if (vehicleData.mileage !== undefined) dataToUpdate.mileage = vehicleData.mileage;
    if (vehicleData.fuelType !== undefined) dataToUpdate.fuelType = vehicleData.fuelType;
    if (vehicleData.transmission !== undefined) dataToUpdate.transmission = vehicleData.transmission;
    if (vehicleData.condition !== undefined) dataToUpdate.condition = vehicleData.condition;
    if (vehicleData.numberOfDoors !== undefined) dataToUpdate.numberOfDoors = vehicleData.numberOfDoors;
    // Lógica para conectar/desconectar vendedor se necessário
    if (vehicleData.sellerId !== undefined) {
       dataToUpdate.seller = vehicleData.sellerId === null 
           ? { disconnect: true } 
           : { connect: { id: vehicleData.sellerId } };
    } 
    // Não permitir atualizar isSold, buyerCPF, saleDate diretamente aqui
    // Esses campos devem ser atualizados por métodos específicos como sellVehicle

    if (Object.keys(dataToUpdate).length === 0) {
      // Se não há dados para atualizar, retorna a entidade existente mapeada
      // Busca novamente para incluir relações
       const currentVehicleWithRelations = await this.prisma.vehicle.findUnique({
          where: { id },
          include: { images: true, payment: true }
       });
       if (!currentVehicleWithRelations) throw new Error(`Veículo com id ${id} não encontrado após verificação.`);
       return this.mapToEntity(currentVehicleWithRelations);
    }

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data: dataToUpdate
    });

    const updatedVehicleWithRelations = await this.prisma.vehicle.findUnique({
        where: { id: updatedVehicle.id },
        include: { images: true, payment: true }
      });

    if (!updatedVehicleWithRelations) {
      throw new Error('Erro ao buscar veículo atualizado com relações.');
    }
  
    return this.mapToEntity(updatedVehicleWithRelations);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.$transaction(async (tx: any) => {
      await tx.payment.deleteMany({
        where: { vehicleId: id },
      });

      await tx.vehicle.delete({
        where: { id },
      });
    });
  }

  async findBySoldStatus(isSold: boolean): Promise<Vehicle[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        isSold: isSold
      },
      include: {
        images: true,
        payment: true
      }
    });

    return vehicles.map(vehicle => this.mapToEntity(vehicle));
  }

  async sellVehicle(id: number, buyerCPF: string): Promise<Vehicle> {
    const vehicleData = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { images: true, payment: true }
    });

    if (!vehicleData) {
      throw new Error(`Veículo com id ${id} não encontrado.`);
    }

    if (vehicleData.isSold) {
      throw new Error(`Veículo com id ${id} já foi vendido.`);
    }

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        isSold: true,
        buyerCPF: buyerCPF,
        saleDate: new Date(),
      }
    });
    
    const soldVehicleWithRelations = await this.prisma.vehicle.findUnique({
      where: { id: updatedVehicle.id },
      include: { images: true, payment: true }
    });

    if (!soldVehicleWithRelations) {
      throw new Error('Erro ao buscar veículo vendido com relações.');
    }

    return this.mapToEntity(soldVehicleWithRelations);
  }

  private mapToEntity(prismaVehicle: any): Vehicle {
    // Mapear dados do veículo
    const vehicleProps = {
      id: prismaVehicle.id,
      brand: prismaVehicle.brand,
      model: prismaVehicle.model,
      year: prismaVehicle.year,
      color: prismaVehicle.color,
      price: prismaVehicle.price,
      mileage: prismaVehicle.mileage,
      fuelType: prismaVehicle.fuelType,
      transmission: prismaVehicle.transmission,
      condition: prismaVehicle.condition,
      numberOfDoors: prismaVehicle.numberOfDoors,
      sellerId: prismaVehicle.sellerId,
      isSold: prismaVehicle.isSold,
      buyerCPF: prismaVehicle.buyerCPF,
      saleDate: prismaVehicle.saleDate,
      createdAt: prismaVehicle.createdAt,
      updatedAt: prismaVehicle.updatedAt,
      // Inicialmente sem payment, será adicionado abaixo se existir
      payment: undefined as Payment | undefined 
    };

    const vehicle = new Vehicle(vehicleProps);

    // Mapear Pagamento, se existir
    if (prismaVehicle.payment && prismaVehicle.payment.length > 0) {
       const prismaPayment = prismaVehicle.payment[0]; // Pega o primeiro pagamento
       try {
         vehicle.payment = new Payment(
           prismaPayment.vehicleId, // vehicleId
           prismaPayment.amount, // amount
           prismaPayment.paymentMethod, // paymentMethod
           prismaPayment.id, // id?
           prismaPayment.status as PaymentStatus, // status?
           prismaPayment.externalId, // externalId?
           prismaPayment.paymentLink, // paymentLink?
           prismaPayment.paymentDate, // paymentDate?
           prismaPayment.buyerCPF, // buyerCPF?
           prismaPayment.additionalInfo, // additionalInfo?
           prismaPayment.createdAt, // createdAt?
           prismaPayment.updatedAt // updatedAt?
         );
       } catch (error: any) {
         // Logar erro se a instanciação do Payment falhar (ex: dados inválidos)
         console.error(`Erro ao mapear pagamento para veículo ${vehicle.id}: ${error.message}`);
         // Continuar sem o pagamento mapeado ou lançar erro, dependendo da política
       }
    }

    // Mapear Imagens para a entidade Vehicle
    if (prismaVehicle.images && prismaVehicle.images.length > 0) {
      vehicle.images = prismaVehicle.images.map((img: any) => new VehicleImage({
        id: img.id,
        filename: img.filename,
        path: img.path,
        url: img.url,
        description: img.description,
        isPrimary: img.isPrimary,
        vehicleId: img.vehicleId,
        createdAt: img.createdAt,
        updatedAt: img.updatedAt
      }));
    }

    return vehicle;
  }
} 