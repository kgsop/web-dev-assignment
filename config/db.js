const mongoose = require('mongoose');

async function connectDB() {
  const connectionString = process.env.MONGODB_URI;

  if (!connectionString) {
    throw new Error('MONGODB_URI is not set in the environment.');
  }

  await mongoose.connect(connectionString);
  console.log('Connected to MongoDB.');
}

module.exports = connectDB;
