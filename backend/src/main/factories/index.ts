import { ConfigService } from '@/application/services/ConfigService';
import { PaymentService } from '@/application/services/PaymentService';
import { SellerService } from '@/application/services/SellerService';
import { VehicleImageService } from '@/application/services/VehicleImageService';
import { VehicleService } from '@/application/services/VehicleService';
import { VehicleImageController } from '@/controllers/vehicle-image.controller';
import { VehicleController } from '@/controllers/vehicle.controller';
import { WebhookController } from '@/controllers/webhook.controller';
import { PrismaPaymentRepository } from '@/infrastructure/database/PrismaPaymentRepository';
import { PrismaSellerRepository } from '@/infrastructure/database/PrismaSellerRepository';
import { PrismaVehicleImageRepository } from '@/infrastructure/database/PrismaVehicleImageRepository';
import { PrismaVehicleRepository } from '@/infrastructure/database/PrismaVehicleRepository';
import { MercadoPagoGateway } from '@/infrastructure/payment/MercadoPagoGateway';
import { PrismaClient } from '@prisma/client';

// Singleton para instâncias compartilhadas
let prismaClient: PrismaClient | null = null;

/**
 * Factory para criar instâncias de serviços e repositórios
 * Centraliza a criação de objetos e facilita testes com mocks
 */
export class Factory {
  /**
   * Retorna a instância do cliente Prisma
   */
  static getPrismaClient(): PrismaClient {
    if (!prismaClient) {
      prismaClient = new PrismaClient();
    }
    return prismaClient;
  }

  /**
   * Retorna a instância do serviço de configuração
   */
  static getConfigService(): ConfigService {
    return ConfigService.getInstance();
  }

  /**
   * Cria um repositório de veículos
   */
  static createVehicleRepository() {
    return new PrismaVehicleRepository(this.getPrismaClient());
  }

  /**
   * Cria um repositório de pagamentos
   */
  static createPaymentRepository() {
    return new PrismaPaymentRepository(this.getPrismaClient());
  }

  /**
   * Cria um repositório de vendedores
   */
  static createSellerRepository() {
    return new PrismaSellerRepository(this.getPrismaClient());
  }

  /**
   * Cria um repositório de imagens de veículos
   */
  static createVehicleImageRepository() {
    return new PrismaVehicleImageRepository(this.getPrismaClient());
  }

  /**
   * Cria um gateway de pagamento do Mercado Pago
   */
  static createPaymentGateway() {
    const config = this.getConfigService();
    return new MercadoPagoGateway(config);
  }

  /**
   * Cria um serviço de veículos
   */
  static createVehicleService() {
    return new VehicleService(
      this.createVehicleRepository(),
      this.createPaymentService(),
      this.createVehicleImageRepository()
    );
  }

  /**
   * Cria um serviço de pagamentos
   */
  static createPaymentService() {
    return new PaymentService(
      this.createPaymentRepository(),
      this.createPaymentGateway()
    );
  }

  /**
   * Cria um serviço de vendedores
   */
  static createSellerService() {
    return new SellerService(
      this.createSellerRepository()
    );
  }

  /**
   * Cria um serviço de imagens de veículos
   */
  static createVehicleImageService() {
    return new VehicleImageService(
      this.createVehicleImageRepository(),
      this.createVehicleRepository()
    );
  }

  /**
   * Cria um controller de veículos
   */
  static createVehicleController() {
    return new VehicleController(
      this.createVehicleService()
    );
  }

  /**
   * Cria um controller de webhooks
   */
  static createWebhookController() {
    return new WebhookController(
      this.createPaymentService(),
      this.createVehicleService()
    );
  }

  /**
   * Cria um controller de imagens de veículos
   */
  static createVehicleImageController() {
    return new VehicleImageController(
      this.createVehicleImageService()
    );
  }
} 