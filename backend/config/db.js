const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/collegefinder';
    
    console.log(`[MongoDB] Connecting to: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.warn(`[MongoDB Warning] Ensure MongoDB is running locally at mongodb://127.0.0.1:27017 or provide a valid MONGODB_URI in backend/.env`);
    // Do not terminate process immediately so developer can see API endpoints and status
  }
};

module.exports = { connectDB };
