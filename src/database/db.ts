import mongoose from 'mongoose';

async function setupDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Critical error: MONGODB_URI not set!');
  }

  await mongoose.connect(uri);
  console.log('\x1b[32m%s\x1b[0m', 'Сonnection to mongoDB database established');
}

export { setupDatabase };
