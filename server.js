import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js';

// Import Middlewares
import errorHandler from './src/middleware/errorHandler.js';

// Import Routes
import authRoutes from './src/routes/authRoutes.js';
import studentRoutes from './src/routes/studentRoutes.js';
import teacherRoutes from './src/routes/teacherRoutes.js';
import classRoutes from './src/routes/classRoutes.js';
import subjectRoutes from './src/routes/subjectRoutes.js';
import attendanceRoutes from './src/routes/attendanceRoutes.js';
import examRoutes from './src/routes/examRoutes.js';
import feeRoutes from './src/routes/feeRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';

// Resolve file paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Environment Variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for dev simplicity
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Student Management Systems API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\x1b[36m%s\x1b[0m`, `Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
