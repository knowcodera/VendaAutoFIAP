import { VehicleService } from '@/application/services/VehicleService';
import logger from '@/config/logger'; // Importar o logger
import { createVehicleSchema, sellVehicleSchema, updateVehicleSchema } from '@/validators/vehicle.validators';
import { NextFunction, Request, Response } from 'express';

export class VehicleController {
  private vehicleService: VehicleService;

  // Adicionar construtor para injeção de dependência
  constructor(vehicleService: VehicleService) {
    this.vehicleService = vehicleService;
  }

  // Criar um novo veículo
  async createVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Requisição para criar veículo recebida');
      // Validação dos dados de entrada
      const validatedData = createVehicleSchema.parse(req.body);
      logger.debug({ vehicleData: validatedData }, 'Dados de criação validados');
      
      // Usar o serviço injetado
      const vehicle = await this.vehicleService.create(validatedData);
      logger.info({ vehicleId: vehicle.id }, 'Veículo criado com sucesso');
      
      return res.status(201).json({
        status: 'success',
        data: vehicle
      });
    } catch (error) {
      logger.error(error, 'Erro ao criar veículo');
      next(error);
    }
  }

  // Listar todos os veículos
  async getAllVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Requisição para listar veículos recebida');
      // Extrair parâmetros de filtragem da query
      const {
        sold,
        brand,
        model,
        minYear,
        maxYear,
        minPrice,
        maxPrice,
        color,
        minMileage,
        maxMileage,
        fuelType,
        transmission,
        condition,
        sortBy,
        sortDirection
      } = req.query;

      // Construir objeto de filtros
      const filters: any = {};
      logger.debug({ queryParams: req.query }, 'Parâmetros de filtro recebidos');
      
      // Filtro de vendidos/não vendidos
      // Por padrão, mostrar apenas veículos não vendidos quando não especificado
      if (sold !== undefined) {
        filters.onlySold = sold === 'true';
      } else {
        // Importante: Quando não especificado, mostrar apenas disponíveis
        filters.onlySold = false;
      }
      
      // Filtros de texto
      if (brand) filters.brand = brand as string;
      if (model) filters.model = model as string;
      if (color) filters.color = color as string;
      
      // Filtros numéricos
      if (minYear) filters.minYear = Number(minYear);
      if (maxYear) filters.maxYear = Number(maxYear);
      if (minPrice) filters.minPrice = Number(minPrice);
      if (maxPrice) filters.maxPrice = Number(maxPrice);
      if (minMileage) filters.minMileage = Number(minMileage);
      if (maxMileage) filters.maxMileage = Number(maxMileage);
      
      // Filtros exatos
      if (fuelType) filters.fuelType = fuelType as string;
      if (transmission) filters.transmission = transmission as string;
      if (condition) filters.condition = condition as string;
      
      // Construir objeto de ordenação
      let orderBy;
      if (sortBy) {
        const validFields = ['price', 'year', 'createdAt', 'mileage'];
        const validDirections = ['asc', 'desc'];
        
        const field = validFields.includes(sortBy as string) ? sortBy as 'price' | 'year' | 'createdAt' | 'mileage' : 'price';
        const direction = validDirections.includes(sortDirection as string) ? sortDirection as 'asc' | 'desc' : 'asc';
        
        orderBy = { field, direction };
      }
      
      logger.debug({ filters, orderBy }, 'Filtros e ordenação aplicados');
      // Buscar veículos com filtros
      const vehicles = await this.vehicleService.findAll(filters, orderBy);
      logger.info({ count: vehicles.length }, 'Busca de veículos concluída');
      
      return res.json({
        status: 'success',
        results: vehicles.length,
        data: vehicles
      });
    } catch (error) {
      logger.error(error, 'Erro ao listar veículos');
      next(error);
    }
  }

  // Buscar veículo por ID
  async getVehicleById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      logger.info({ vehicleId: id }, 'Requisição para buscar veículo por ID');
      
      const vehicle = await this.vehicleService.findById(id);
      
      logger.info({ vehicleId: id }, 'Veículo encontrado com sucesso');
      return res.json({
        status: 'success',
        data: vehicle
      });
    } catch (error) {
      logger.error(error, 'Erro ao buscar veículo por ID');
      next(error);
    }
  }

  // Iniciar processo de venda (Cria pagamento PENDING)
  async initiateSale(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);
    logger.info({ vehicleId: id }, 'Requisição para INICIAR processo de venda');
    
    try {
      // 1. Validar os dados de entrada (CPF)
      const validatedData = sellVehicleSchema.parse(req.body);
      logger.debug({ vehicleId: id, sellData: validatedData }, 'Dados de início de venda validados');

      // 2. Chamar o serviço para criar o pagamento PENDING
      // (Validações de existência e status do veículo/pagamento são feitas no serviço)
      logger.debug({ vehicleId: id }, 'Chamando service.startSaleProcess');
      const payment = await this.vehicleService.startSaleProcess(id, validatedData);
      logger.info({ vehicleId: id, paymentId: payment.id }, 'Processo de venda iniciado, pagamento PENDING criado');
      
      // Retornar os detalhes do pagamento criado (PENDING)
      return res.json({
        status: 'success',
        message: 'Processo de venda iniciado. Pagamento pendente.',
        data: { 
          payment: payment // Enviar o objeto de pagamento PENDING
        }
      });

    } catch (error: any) {
      logger.error({ vehicleId: id, error }, 'Erro ao iniciar processo de venda');
      next(error);
    }
  }

  // Atualizar veículo
  async updateVehicle(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);
    logger.info({ vehicleId: id }, 'Requisição para atualizar veículo');
    
    try {
      // 1. Validar dados de atualização
      const validatedData = updateVehicleSchema.parse(req.body);
      logger.debug({ vehicleId: id, updateData: validatedData }, 'Dados de atualização validados');
      
      // 2. Chamar o serviço de atualização
      logger.debug({ vehicleId: id }, 'Chamando service.update');
      const vehicle = await this.vehicleService.update({
        id,
        ...validatedData
      });
      logger.info({ vehicleId: id }, 'Veículo atualizado com sucesso');
      
      return res.json({
        status: 'success',
        data: vehicle
      });
    } catch (error) {
      logger.error({ vehicleId: id, error }, 'Erro ao atualizar veículo');
      next(error);
    }
  }

  // Excluir veículo
  async deleteVehicle(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);
    logger.info({ vehicleId: id }, 'Requisição para excluir veículo');
    
    try {
      // 2. Chamar o serviço de exclusão
      logger.debug({ vehicleId: id }, 'Chamando service.delete');
      await this.vehicleService.delete(id);
      logger.info({ vehicleId: id }, 'Veículo excluído com sucesso');
      
      return res.status(204).send();
    } catch (error) {
      logger.error({ vehicleId: id, error }, 'Erro ao excluir veículo');
      next(error);
    }
  }
} 