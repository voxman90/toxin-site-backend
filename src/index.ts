import app from './app.js';
import { FALLBACK_PORT } from './constants/constants.js';
import { closeDatabase, setupDatabase } from './database/db.js';

const PORT = process.env.PORT || FALLBACK_PORT;

setupDatabase()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`API is listening on port ${PORT}`);
    });

    const handleShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('HTTP server closed.');

        try {
          await closeDatabase();
          process.exit(0);
        } catch (error) {
          console.error('Error during database disconnection:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  })
  .catch((error) => {
    console.error('Critical error while starting the server:', error);
    process.exit(1);
  });
