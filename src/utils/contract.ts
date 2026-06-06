import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import * as fs from 'fs';

export const apiRegistry = new OpenAPIRegistry();

apiRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Enter the JWT token in the format: Bearer <token>',
});

export function documentEndpoint(config: Parameters<typeof apiRegistry.registerPath>[0]) {
  apiRegistry.registerPath(config);
}

export function buildDocs() {
  const generator = new OpenApiGeneratorV3(apiRegistry.definitions);

  const docs = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Hotel Booking API',
      description: 'Contract between the Express backend and frontend',
      version: '1.0.0',
    },
  });

  fs.writeFileSync('./openapi.json', JSON.stringify(docs, null, 2));
}
