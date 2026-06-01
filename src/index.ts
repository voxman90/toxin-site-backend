import app from './app.js';
import { FALLBACK_PORT } from './constants/constants.js';
import { setupDatabase } from './database/db.js';

const PORT = process.env.PORT || FALLBACK_PORT;

setupDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API is listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Critical error while starting the server:', error);
    process.exit(1);
  });
