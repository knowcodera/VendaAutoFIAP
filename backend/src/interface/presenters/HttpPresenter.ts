/**
 * Interface que representa uma requisição HTTP abstrata
 * Desacopla a camada de apresentação do framework (Express)
 */
export interface HttpRequest {
  body: any;
  params: Record<string, string>;
  query: Record<string, any>;
  headers: Record<string, string>;
  user?: Record<string, any>; // Informações do usuário autenticado (quando disponível)
}

/**
 * Interface que representa uma resposta HTTP abstrata
 * Desacopla a camada de apresentação do framework (Express)
 */
export interface HttpResponse {
  statusCode: number;
  body: any;
  headers?: Record<string, string>;
}

/**
 * Classe que encapsula a lógica de apresentação das respostas HTTP
 */
export class HttpPresenter {
  /**
   * Resposta de sucesso padrão (200 OK)
   * @param data Dados a serem retornados
   */
  static ok<T>(data?: T): HttpResponse {
    return {
      statusCode: 200,
      body: {
        status: 'success',
        data: data || null
      }
    };
  }

  /**
   * Resposta para recurso criado (201 Created)
   * @param data Dados do recurso criado
   */
  static created<T>(data: T): HttpResponse {
    return {
      statusCode: 201,
      body: {
        status: 'success',
        data
      }
    };
  }

  /**
   * Resposta sem conteúdo (204 No Content)
   */
  static noContent(): HttpResponse {
    return {
      statusCode: 204,
      body: null
    };
  }

  /**
   * Resposta de requisição inválida (400 Bad Request)
   * @param message Mensagem de erro
   * @param code Código de erro (opcional)
   * @param details Detalhes do erro (opcional)
   */
  static badRequest(message: string, code?: string, details?: any): HttpResponse {
    return {
      statusCode: 400,
      body: {
        status: 'error',
        code: code || 'BAD_REQUEST',
        message,
        details
      }
    };
  }

  /**
   * Resposta de não autorizado (401 Unauthorized)
   * @param message Mensagem de erro
   */
  static unauthorized(message = 'Não autorizado'): HttpResponse {
    return {
      statusCode: 401,
      body: {
        status: 'error',
        code: 'UNAUTHORIZED',
        message
      }
    };
  }

  /**
   * Resposta de acesso proibido (403 Forbidden)
   * @param message Mensagem de erro
   */
  static forbidden(message = 'Acesso proibido'): HttpResponse {
    return {
      statusCode: 403,
      body: {
        status: 'error',
        code: 'FORBIDDEN',
        message
      }
    };
  }

  /**
   * Resposta de recurso não encontrado (404 Not Found)
   * @param message Mensagem de erro
   */
  static notFound(message = 'Recurso não encontrado'): HttpResponse {
    return {
      statusCode: 404,
      body: {
        status: 'error',
        code: 'NOT_FOUND',
        message
      }
    };
  }

  /**
   * Resposta de erro de validação (422 Unprocessable Entity)
   * @param errors Lista de erros de validação
   */
  static validationError(errors: Array<{ field: string; message: string }>): HttpResponse {
    return {
      statusCode: 422,
      body: {
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Dados de entrada inválidos',
        details: errors
      }
    };
  }

  /**
   * Resposta de erro interno (500 Internal Server Error)
   * @param error Erro original (usado apenas em ambientes de desenvolvimento)
   */
  static serverError(error?: Error): HttpResponse {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return {
      statusCode: 500,
      body: {
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro interno do servidor',
        ...(isProduction || !error ? {} : { 
          details: {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        })
      }
    };
  }
} 