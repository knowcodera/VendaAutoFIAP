export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, statusCode: number = 400, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;

    // Mantém o stack trace correto para onde nosso erro foi lançado (apenas V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    // Garante que o nome da classe seja exibido corretamente nos logs de erro
    this.name = this.constructor.name;
  }
} 