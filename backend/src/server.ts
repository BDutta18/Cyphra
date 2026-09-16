import { app } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

const server = app.listen(config.port, () => {
  logger.info(`✨ Cyphra Backend running on port ${config.port} (${config.env})`);
  logger.info(`🔗 Midnight Network ID: ${config.midnight.networkId}`);
  logger.info(`🏛️ Contract Address:   ${config.midnight.contractAddress}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});
