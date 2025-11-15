const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authHandlers = require('./handlers/auth.handler');
const patientHandlers = require('./handlers/patients.handler');
const visitHandlers = require('./handlers/visits.handler');
const { authenticateToken, validateClinicalAccess } = require('./middleware/security');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "same-site" }
}));

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    error: 'Too many requests from this IP',
    details: 'Please try again after 15 minutes'
  }
});

app.use(apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((request, response, next) => {
  console.log(`${new Date().toISOString()} - ${request.method} ${request.path}`);
  next();
});

// Health check endpoint
app.get('/system/health', async (request, response) => {
  const database = require('./lib/database');
  
  try {
    await database.healthCheck();
    response.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      service: 'Medical Records API',
      version: '1.0.0'
    });
  } catch (healthError) {
    response.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      service: 'Medical Records API',
      database: 'unavailable'
    });
  }
});

// Authentication routes
app.post('/auth/register', authHandlers.handleUserRegistration);
app.post('/auth/login', authHandlers.handleUserLogin);

// Protected routes
app.use(authenticateToken);

app.get('/auth/verify', authHandlers.validateAuthenticationToken);
app.put('/auth/password', authHandlers.handlePasswordChange);

// Patient management routes
app.post('/patients', validateClinicalAccess, patientHandlers.handleCreatePatient);
app.get('/patients', patientHandlers.handleGetPatients);
app.get('/patients/:patientId', patientHandlers.handleGetPatientDetails);
app.put('/patients/:patientId', validateClinicalAccess, patientHandlers.handleUpdatePatient);

// Clinical encounters routes
app.post('/encounters', validateClinicalAccess, visitHandlers.handleCreateEncounter);
app.get('/encounters/patient/:patientId', visitHandlers.handleGetPatientEncounters);
app.get('/encounters/:encounterId', visitHandlers.handleGetEncounterDetails);
app.get('/dashboard/metrics', visitHandlers.handleGetDashboardMetrics);

// 404 handler for undefined routes
app.use((request, response) => {
  response.status(404).json({
    status: 'error',
    message: 'Medical API endpoint not found',
    path: request.originalUrl,
    method: request.method,
    timestamp: new Date().toISOString(),
    suggestion: 'Check the API documentation for available endpoints'
  });
});

// Global error handler
app.use((error, request, response, next) => {
  console.error('Unhandled application error:', error);
  
  response.status(500).json({
    error: 'Internal system error occurred',
    reference: `ERR-${Date.now()}`
  });
});

module.exports = app;