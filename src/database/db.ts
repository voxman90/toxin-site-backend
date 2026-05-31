import mongoose from 'mongoose';

async function setupDatabase() {
  if (process.env.NODE_ENV ==='production') {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('Critical error: MONGODB_URI not set!');
    }

    await mongoose.connect(uri);
  }
}

export { setupDatabase }
