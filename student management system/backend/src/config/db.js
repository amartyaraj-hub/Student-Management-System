import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student-management-system');
    console.log(`\x1b[32m%s\x1b[0m`, `MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\x1b[31m%s\x1b[0m`, `Database connection error: ${error.message}`);
    // Do not crash the application in dev, log and allow offline/mock capabilities if DB fails
    console.warn('Running with database connection issues. Please check if MongoDB is active.');
  }
};

export default connectDB;
