import 'dotenv/config';

import { buildDocs } from '../utils/contract.js';
import { consoleSuccess } from '../utils/helpers.js';
import '../v1/routes/auth.routes.js';
import '../v1/routes/booking.routes.js';
import '../v1/routes/rating.routes.js';
import '../v1/routes/review.routes.js';
import '../v1/routes/room.routes.js';
import '../v1/routes/user.routes.js';

try {
  buildDocs();
  consoleSuccess('Contract file openapi.json successfully generated.');
} catch (error) {
  console.error('Failed to generate OpenAPI contract:', error);
}
