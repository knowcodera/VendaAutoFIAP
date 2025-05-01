import { Request, Response } from 'express';
import { DomainError } from '../../domain/errors/DomainError';

/**
 * Classe base para todos os controllers
 * Contém métodos utilitários para padronização de respostas
 */
export abstract class BaseController {
  /**
   * Executa a ação do controller e trata possíveis erros
   * @param req Request do Express
   * @param res Response do Express
   * @param action Função que implementa a lógica do controller
   */
  protected async execute(req: Request, res: Response, action: () => Promise<any>): Promise<Response> {
    try {
      const result = await action();
      return this.success(res, result);
    } catch (error) {
      if (error instanceof DomainError) {
        return this.fail(res, error);
      }
      return this.error(res, error);
    }
  }

  /**
   * Responde com sucesso (status 200 OK)
   * @param res Response do Express
   * @param data Dados a serem retornados
   */
  protected success(res: Response, data?: any): Response {
    return res.status(200).json({
      status: 'success',
      data: data || null
    });
  }

  /**
   * Responde com sucesso na criação (status 201 Created)
   * @param res Response do Express
   * @param data Dados a serem retornados
   */
  protected created(res: Response, data?: any): Response {
    return res.status(201).json({
      status: 'success',
      data: data || null
    });
  }

  /**
   * Responde com erro de domínio (status dependendo do erro)
   * @param res Response do Express
   * @param error Erro de domínio
   */
  protected fail(res: Response, error: DomainError): Response {
    return res.status(error.statusCode).json({
      status: 'error',
      code: error.code,
      message: error.message,
      details: error.details
    });
  }

  /**
   * Responde com erro interno (status 500)
   * @param res Response do Express
   * @param error Erro ocorrido
   */
  protected error(res: Response, error: any): Response {
    console.error('[Controller Error]', error);
    return res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno do servidor'
    });
  }

  /**
   * Responde com "Não encontrado" (status 404)
   * @param res Response do Express
   * @param message Mensagem a ser retornada
   */
  protected notFound(res: Response, message = 'Recurso não encontrado'): Response {
    return res.status(404).json({
      status: 'error',
      code: 'NOT_FOUND',
      message
    });
  }

  /**
   * Responde com requisição inválida (status 400)
   * @param res Response do Express
   * @param message Mensagem a ser retornada
   */
  protected badRequest(res: Response, message: string): Response {
    return res.status(400).json({
      status: 'error',
      code: 'BAD_REQUEST',
      message
    });
  }

  /**
   * Responde que não há conteúdo (status 204)
   * @param res Response do Express
   */
  protected noContent(res: Response): Response {
    return res.status(204).send();
  }
} 