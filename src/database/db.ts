import type { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { consoleSuccess } from '../utils/helpers.js';

let memoryServerInstance: MongoMemoryServer | null = null;

async function connectProduction() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Critical error: MONGODB_URI is not set in production environment!');
  }

  await mongoose.connect(uri);
  consoleSuccess('Production MongoDB connection established');
}

async function connectDevelopment() {
  const { MongoMemoryServer } = await import('mongodb-memory-server');

  memoryServerInstance = await MongoMemoryServer.create();
  const uri = memoryServerInstance.getUri();

  await mongoose.connect(uri);
  consoleSuccess('In-memory development MongoDB server started');
}

export async function setupDatabase() {
  if (process.env.NODE_ENV === 'production') {
    await connectProduction();
  } else {
    await connectDevelopment();
  }
}

export async function closeDatabase() {
  await mongoose.disconnect();

  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
}
