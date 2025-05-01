/**
 * Serviço para centralizar acesso a configurações
 * Implementa o padrão Singleton para compartilhar a instância
 */
export class ConfigService {
  private static instance: ConfigService;
  private config: Record<string, string | undefined> = {};

  private constructor() {
    // Configurações padrão
    this.config = {
      ...process.env,
      // Valores padrão caso não estejam definidos nas variáveis de ambiente
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT || '3000',
      DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
      BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000'
    };
  }

  /**
   * Retorna a instância singleton do ConfigService
   */
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Obtém um valor de configuração
   * @param key Chave da configuração
   * @param defaultValue Valor padrão caso a configuração não exista
   * @returns Valor da configuração ou defaultValue
   */
  public get(key: string, defaultValue?: string): string {
    return this.config[key] || defaultValue || '';
  }

  /**
   * Define um valor de configuração
   * @param key Chave da configuração
   * @param value Valor da configuração
   */
  public set(key: string, value: string): void {
    this.config[key] = value;
  }

  /**
   * Verifica se o ambiente é de desenvolvimento
   */
  public isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  /**
   * Verifica se o ambiente é de produção
   */
  public isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  /**
   * Verifica se o ambiente é de teste
   */
  public isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }
} 