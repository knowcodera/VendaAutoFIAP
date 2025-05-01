import pino from 'pino';

// Configuração básica do Pino
// Em desenvolvimento, usa pino-pretty para logs mais legíveis
// Em produção, usa JSON para melhor integração com sistemas de log
const logger = pino({
  level: process.env.LOG_LEVEL || 'info', // Define o nível de log (trace, debug, info, warn, error, fatal)
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,       // Colorir output
        levelFirst: true,     // Mostrar nível de log primeiro
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l', // Formato de data/hora local
        ignore: 'pid,hostname', // Ignorar campos padrão
      },
    },
  }),
});

export default logger; 