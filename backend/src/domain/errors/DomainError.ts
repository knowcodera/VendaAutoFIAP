/**
 * Classe base para erros de domínio
 * Permite melhor categorização e tratamento de erros específicos do domínio
 */
export class DomainError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, any>;

  /**
   * @param code Código do erro (único para cada tipo de erro)
   * @param message Mensagem descritiva do erro
   * @param statusCode Código HTTP relacionado (opcional, padrão 400)
   * @param details Detalhes adicionais do erro (opcional)
   */
  constructor(
    code: string,
    message: string,
    statusCode = 400,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Necessário para que instanceof funcione corretamente com classes que estendem Error
    Object.setPrototypeOf(this, DomainError.prototype);
  }

  /**
   * Converte o erro para um objeto simples para resposta da API
   */
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details
      }
    };
  }
} 