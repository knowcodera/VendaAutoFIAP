import { ConfigService } from '../../application/services/ConfigService';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: Record<string, any>;
}

/**
 * Serviço de logging que formata e estrutura logs da aplicação
 */
export class Logger {
  private static instance: Logger;
  private context: string = 'App';
  private configService: ConfigService;

  private constructor() {
    this.configService = ConfigService.getInstance();
  }

  /**
   * Retorna a instância singleton do Logger
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Define o contexto do logger (módulo/classe de onde vem o log)
   * @param context Contexto a ser definido
   * @returns Instância do logger para encadeamento
   */
  public setContext(context: string): Logger {
    this.context = context;
    return this;
  }

  /**
   * Log de nível debug (apenas em desenvolvimento)
   * @param message Mensagem a ser logada
   * @param data Dados adicionais para o log
   */
  public debug(message: string, data?: Record<string, any>): void {
    this.log('debug', message, data);
  }

  /**
   * Log de nível info (informações gerais da aplicação)
   * @param message Mensagem a ser logada
   * @param data Dados adicionais para o log
   */
  public info(message: string, data?: Record<string, any>): void {
    this.log('info', message, data);
  }

  /**
   * Log de nível warn (alertas, possíveis problemas)
   * @param message Mensagem a ser logada
   * @param data Dados adicionais para o log
   */
  public warn(message: string, data?: Record<string, any>): void {
    this.log('warn', message, data);
  }

  /**
   * Log de nível error (erros da aplicação)
   * @param message Mensagem a ser logada
   * @param data Dados adicionais para o log
   */
  public error(message: string, data?: Record<string, any>): void {
    this.log('error', message, data);
  }

  /**
   * Método interno para formatar e enviar logs
   * @param level Nível do log
   * @param message Mensagem a ser logada
   * @param data Dados adicionais para o log
   */
  private log(level: LogLevel, message: string, data?: Record<string, any>): void {
    // Não logar debug em produção
    if (level === 'debug' && this.configService.isProduction()) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logMessage: LogMessage = {
      level,
      message,
      timestamp,
      context: this.context
    };

    if (data) {
      // Tratar casos especiais como Error
      if (data instanceof Error) {
        logMessage.data = {
          name: data.name,
          message: data.message,
          stack: data.stack
        };
      } else {
        try {
          // Verificar se o objeto pode ser serializado
          JSON.stringify(data);
          logMessage.data = data;
        } catch (error) {
          logMessage.data = { serialization_error: 'Não foi possível serializar os dados' };
        }
      }
    }

    // Em produção, serializar como JSON para facilitar coleta por ferramentas como ELK
    if (this.configService.isProduction()) {
      console.log(JSON.stringify(logMessage));
      return;
    }

    // Em desenvolvimento, formatar de maneira legível
    const colorize = (text: string, colorCode: number): string => `\x1b[${colorCode}m${text}\x1b[0m`;
    
    // Cores para diferentes níveis de log
    const colors: Record<LogLevel, number> = {
      debug: 34, // azul
      info: 32,  // verde
      warn: 33,  // amarelo
      error: 31  // vermelho
    };

    const formattedLevel = colorize(level.toUpperCase().padEnd(5), colors[level]);
    const formattedContext = colorize(`[${this.context}]`, 36); // ciano
    const formattedTimestamp = colorize(timestamp, 90); // cinza claro

    // Mensagem formatada
    console.log(`${formattedTimestamp} ${formattedLevel} ${formattedContext}: ${message}`);
    
    // Se tiver dados adicionais, mostrar em forma de tabela ou estrutura
    if (logMessage.data) {
      console.dir(logMessage.data, { depth: 5, colors: true });
    }
  }
} 