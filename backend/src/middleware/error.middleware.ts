import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../domain/errors/DomainError';
import { ZodError } from 'zod';

/**
 * Middleware para tratamento centralizado de erros
 * Converte diferentes tipos de erro em respostas HTTP padronizadas
 */
export const errorMiddleware = (
  err: Error | DomainError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[ERROR] ${err.name}: ${err.message}`, err);
  
  // Definir variável de ambiente no início da função
  const isProduction = process.env.NODE_ENV === 'production';

  // Erros de domínio (lançados explicitamente pela aplicação)
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
      details: err.details
    });
  }

  // Erros de validação do Zod
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message
    }));

    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Dados de entrada inválidos',
      details: formattedErrors
    });
  }

  // Erros de tipagem do Prisma
  if (err.name === 'PrismaClientKnownRequestError') {
    // Verificar erros específicos do Prisma
    const prismaError = err as any;
    
    // P2002 é o código para violação de restrição única
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        status: 'error',
        code: 'CONFLICT',
        message: 'Já existe um registro com os mesmos dados únicos',
        details: {
          target: prismaError.meta?.target,
          constraint: 'unique'
        }
      });
    }
    
    return res.status(400).json({
      status: 'error',
      code: 'DATABASE_ERROR',
      message: 'Erro ao processar operação no banco de dados',
      details: isProduction ? undefined : {
        code: prismaError.code,
        meta: prismaError.meta
      }
    });
  }

  // Erros não tratados (500 Internal Server Error)
  
  // Verificar se o erro possui um statusCode customizado
  const statusCode = (err as any).statusCode || 500;

  return res.status(statusCode).json({
    status: 'error',
    code: statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : (err.name || 'UNKNOWN_ERROR'), // Usar nome do erro se não for 500
    message: statusCode === 500 ? 'Erro interno do servidor' : err.message, // Usar mensagem original se não for 500
    // Em produção, não retornamos detalhes do erro 500
    ...(isProduction && statusCode === 500 ? {} : { 
      details: {
        name: err.name,
        message: err.message,
        stack: err.stack
      }
    })
  });
}; 