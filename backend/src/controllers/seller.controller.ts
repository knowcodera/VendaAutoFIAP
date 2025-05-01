import { Request, Response } from 'express';
import { SellerService } from '../application/services/SellerService';
import { PrismaClient } from '@prisma/client';
import { PrismaSellerRepository } from '../infrastructure/database/PrismaSellerRepository';

// Inicializar o Prisma e o repositório
const prisma = new PrismaClient();
const sellerRepository = new PrismaSellerRepository(prisma);
const sellerService = new SellerService(sellerRepository);

export class SellerController {
  // Listar todos os vendedores
  async getAllSellers(req: Request, res: Response) {
    try {
      const sellers = await sellerService.findAll();
      
      return res.json({
        status: 'success',
        results: sellers.length,
        data: sellers
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Erro ao buscar vendedores'
      });
    }
  }

  // Buscar um vendedor pelo ID
  async getSellerById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'ID inválido'
        });
      }

      const seller = await sellerService.findById(id);
      if (!seller) {
        return res.status(404).json({
          status: 'error',
          message: 'Vendedor não encontrado'
        });
      }

      return res.json({
        status: 'success',
        data: seller
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Erro ao buscar vendedor'
      });
    }
  }

  // Criar um novo vendedor
  async createSeller(req: Request, res: Response) {
    try {
      const { name, email, phone, gender, birthDate, cpf, zipCode } = req.body;

      // Validações básicas
      if (!name || !email || !phone || !cpf) {
        return res.status(400).json({
          status: 'error',
          message: 'Campos obrigatórios: nome, email, telefone e CPF'
        });
      }

      const seller = await sellerService.create({
        name,
        email,
        phone,
        gender,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        cpf,
        zipCode
      });

      return res.status(201).json({
        status: 'success',
        data: seller
      });
    } catch (error: any) {
      // Se for erro de duplicidade (email ou CPF)
      if (error.message.includes('existe um vendedor com este')) {
        return res.status(409).json({
          status: 'error',
          message: error.message
        });
      }

      return res.status(500).json({
        status: 'error',
        message: error.message || 'Erro ao criar vendedor'
      });
    }
  }

  // Atualizar um vendedor existente
  async updateSeller(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'ID inválido'
        });
      }

      const { name, email, phone, gender, birthDate, cpf, zipCode } = req.body;

      const updatedSeller = await sellerService.update(id, {
        id,
        name,
        email,
        phone,
        gender,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        cpf,
        zipCode
      });

      return res.json({
        status: 'success',
        data: updatedSeller
      });
    } catch (error: any) {
      // Se for erro de duplicidade (email ou CPF)
      if (error.message.includes('existe um vendedor com este')) {
        return res.status(409).json({
          status: 'error',
          message: error.message
        });
      }

      // Se for erro de vendedor não encontrado
      if (error.message.includes('Vendedor não encontrado')) {
        return res.status(404).json({
          status: 'error',
          message: error.message
        });
      }

      return res.status(500).json({
        status: 'error',
        message: error.message || 'Erro ao atualizar vendedor'
      });
    }
  }

  // Excluir um vendedor
  async deleteSeller(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'ID inválido'
        });
      }

      await sellerService.delete(id);

      return res.status(204).send();
    } catch (error: any) {
      // Se for erro de vendedor não encontrado
      if (error.message.includes('Vendedor não encontrado')) {
        return res.status(404).json({
          status: 'error',
          message: error.message
        });
      }

      // Se for erro de vendedor com veículos associados
      if (error.message.includes('Não é possível excluir um vendedor que possui veículos')) {
        return res.status(409).json({
          status: 'error',
          message: error.message
        });
      }

      return res.status(500).json({
        status: 'error',
        message: error.message || 'Erro ao excluir vendedor'
      });
    }
  }
} 