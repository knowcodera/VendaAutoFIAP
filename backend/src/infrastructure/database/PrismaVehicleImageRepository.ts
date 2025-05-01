import { Prisma, PrismaClient } from '@prisma/client';
import { VehicleImage } from '../../domain/entities/VehicleImage';
import { IVehicleImageRepository } from '../../domain/repositories/IVehicleImageRepository';

export class PrismaVehicleImageRepository implements IVehicleImageRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(): Promise<VehicleImage[]> {
    const imageRecords = await this.prisma.vehicleImage.findMany();
    return imageRecords.map(image => this.mapToEntity(image));
  }

  async findByVehicleId(vehicleId: number): Promise<VehicleImage[]> {
    const imageRecords = await this.prisma.vehicleImage.findMany({
      where: { vehicleId },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'asc' }
      ]
    });
    return imageRecords.map(image => this.mapToEntity(image));
  }

  async findById(id: number): Promise<VehicleImage | null> {
    const imageRecord = await this.prisma.vehicleImage.findUnique({
      where: { id }
    });

    if (!imageRecord) return null;
    return this.mapToEntity(imageRecord);
  }

  async create(image: Omit<VehicleImage, 'id' | 'createdAt' | 'updatedAt'>): Promise<VehicleImage> {
    if (image.isPrimary) {
      await this.prisma.vehicleImage.updateMany({
        where: { vehicleId: image.vehicleId },
        data: { isPrimary: false }
      });
    }

    const dataToCreate: Prisma.VehicleImageUncheckedCreateInput = {
      filename: image.filename,
      path: image.path,
      url: image.url,
      description: image.description,
      isPrimary: image.isPrimary,
      vehicleId: image.vehicleId
    };

    const createdImageRecord = await this.prisma.vehicleImage.create({
      data: dataToCreate
    });

    return this.mapToEntity(createdImageRecord);
  }

  async update(id: number, imageData: Partial<Pick<VehicleImage, 'description' | 'isPrimary'>>): Promise<VehicleImage> {
    const existingImage = await this.prisma.vehicleImage.findUnique({ where: { id } });
    if (!existingImage) {
      throw new Error('Imagem não encontrada');
    }

    await this.prisma.$transaction(async (tx) => {
      if (imageData.isPrimary === true) {
        await tx.vehicleImage.updateMany({
          where: {
            vehicleId: existingImage.vehicleId,
            id: { not: id }
          },
          data: { isPrimary: false }
        });
      }

      await tx.vehicleImage.update({
        where: { id },
        data: {
          description: imageData.description,
          isPrimary: imageData.isPrimary
        }
      });
    });

    const updatedImageRecord = await this.prisma.vehicleImage.findUnique({ where: { id } });
    if (!updatedImageRecord) {
      throw new Error('Erro ao buscar imagem após atualização.');
    }

    return this.mapToEntity(updatedImageRecord);
  }

  async delete(id: number): Promise<void> {
    const image = await this.prisma.vehicleImage.findUnique({ where: { id } });
    if (!image) {
      const notFoundError = new Error('Imagem não encontrada');
      (notFoundError as any).statusCode = 404;
      throw notFoundError;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.vehicleImage.delete({ where: { id } });

      if (image.isPrimary) {
        const nextPrimaryImage = await tx.vehicleImage.findFirst({
          where: { vehicleId: image.vehicleId },
          orderBy: { createdAt: 'asc' }
        });

        if (nextPrimaryImage) {
          await tx.vehicleImage.update({
            where: { id: nextPrimaryImage.id },
            data: { isPrimary: true }
          });
        }
      }
    });
  }

  async setPrimaryImage(vehicleId: number, imageId: number): Promise<void> {
    const image = await this.prisma.vehicleImage.findFirst({
      where: { id: imageId, vehicleId: vehicleId }
    });
    if (!image) {
      const notFoundError = new Error('Imagem não encontrada ou não pertence ao veículo especificado');
      (notFoundError as any).statusCode = 404;
      throw notFoundError;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.vehicleImage.updateMany({
        where: { vehicleId: vehicleId, id: { not: imageId } },
        data: { isPrimary: false }
      });

      await tx.vehicleImage.update({
        where: { id: imageId },
        data: { isPrimary: true }
      });
    });
  }

  private mapToEntity(prismaImage: Prisma.VehicleImageGetPayload<null>): VehicleImage {
    return new VehicleImage({
      id: prismaImage.id,
      filename: prismaImage.filename,
      path: prismaImage.path,
      url: prismaImage.url,
      description: prismaImage.description ?? undefined,
      isPrimary: prismaImage.isPrimary,
      vehicleId: prismaImage.vehicleId,
      createdAt: prismaImage.createdAt,
      updatedAt: prismaImage.updatedAt
    });
  }
} 