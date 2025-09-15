const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const tenantRoutes = require('./routes/tenantRoutes');

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});

app.use(limiter);

const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/tenants', tenantRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));




// module.exports = app;
// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
// import dotenv from 'dotenv';

// import authRoutes from './routes/authRoutes.js';
// import noteRoutes from './routes/noteRoutes.js';
// import tenantRoutes from './routes/tenantRoutes.js';

// dotenv.config();

// const app = express();

// app.use(helmet());

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: 'Too many requests, please try again later.'
// });
// app.use(limiter);

// const corsOptions = {
//   origin: [
//     process.env.FRONTEND_URL || 'http://localhost:3000',
//     /\.vercel\.app$/
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// };
// app.use(cors(corsOptions));
// app.use(express.json({ limit: '10mb' }));

// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('✅ Connected to MongoDB'))
//   .catch(err => {
//     console.error('MongoDB connection error:', err);
//     process.exit(1);
//   });

// app.get('/health', (req, res) => {
//   res.json({ status: 'ok' });
// });

// app.use('/api/auth', authRoutes);
// app.use('/api/notes', noteRoutes);
// app.use('/api/tenants', tenantRoutes);

// app.use('*', (req, res) => {
//   res.status(404).json({ success: false, message: 'Route not found' });
// });

// app.use((err, req, res, next) => {
//   console.error('Error:', err);
//   if (err.name === 'ValidationError') {
//     return res.status(400).json({
//       success: false,
//       message: 'Validation Error',
//       errors: Object.values(err.errors).map(e => e.message)
//     });
//   }
//   if (err.name === 'JsonWebTokenError') {
//     return res.status(401).json({ success: false, message: 'Invalid token' });
//   }
//   if (err.name === 'TokenExpiredError') {
//     return res.status(401).json({ success: false, message: 'Token expired' });
//   }
//   res.status(err.statusCode || 500).json({
//     success: false,
//     message: err.message || 'Internal Server Error'
//   });
// });

// // **Remove app.listen() for Vercel**
// // export default app for Vercel serverless
// export default app;
