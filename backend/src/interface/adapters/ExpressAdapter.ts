import { Request, Response, NextFunction, RequestHandler } from 'express';
import { HttpRequest, HttpResponse } from '../presenters/HttpPresenter';
import { Logger } from '../../infrastructure/logging/Logger';
import { DomainError } from '../../domain/errors/DomainError';

const logger = Logger.getInstance().setContext('ExpressAdapter');

/**
 * Tipo que representa um controlador abstrato
 */
export type Controller = (httpRequest: HttpRequest) => Promise<HttpResponse>;

/**
 * Adaptador que converte um controlador abstrato para um handler do Express
 * @param controller Controlador abstrato que será adaptado
 */
export const adaptRoute = (controller: Controller): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.debug('Recebida requisição:', { 
        method: req.method, 
        path: req.path, 
        query: req.query 
      });

      // Converte a requisição do Express para o formato abstrato
      const httpRequest: HttpRequest = {
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers as Record<string, string>,
        user: (req as any).user // Usuário autenticado (se disponível)
      };

      // Executa o controlador abstrato
      const httpResponse: HttpResponse = await controller(httpRequest);

      // Aplica os headers (se existirem)
      if (httpResponse.headers) {
        Object.entries(httpResponse.headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
      }

      // Envia a resposta
      if (httpResponse.statusCode === 204) {
        res.status(httpResponse.statusCode).end();
      } else {
        res.status(httpResponse.statusCode).json(httpResponse.body);
      }

      logger.debug('Resposta enviada:', { statusCode: httpResponse.statusCode });
    } catch (error) {
      // Tratamento seguro do erro para logging
      const errorData = error instanceof Error 
        ? { name: error.name, message: error.message, stack: error.stack } 
        : { message: String(error) };
      
      logger.error('Erro no controlador:', errorData);
      next(error);
    }
  };
};

/**
 * Middleware para tratamento de erros específico para rotas adaptadas
 */
export const adaptedErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
      details: err.details
    });
  }

  // Se não for um erro de domínio, passa para o próximo middleware de erro
  next(err);
}; 