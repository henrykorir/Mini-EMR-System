const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authHandlers = require('./handlers/auth.handler');
const patientHandlers = require('./handlers/patients.handler');
const visitHandlers = require('./handlers/visits.handler');
const { authenticateToken, validateClinicalAccess } = require('./middleware/security');

const app = express();

app.set('trust proxy', 1); // Trust first proxy
// Temporary development CORS setup
app.use(cors({
  origin: true, // Allow any origin in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security middleware
// app.use(helmet());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    error: 'Too many requests from this IP',
    details: 'Please try again after 15 minutes'
  }
});

app.use(apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware with CORS debug info
app.use((request, response, next) => {
  console.log(`${new Date().toISOString()} - ${request.method} ${request.path}`);
  console.log('CORS Debug:', {
    origin: request.headers.origin,
    'access-control-request-method': request.headers['access-control-request-method'],
    'access-control-request-headers': request.headers['access-control-request-headers']
  });
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

// Authentication routes (should be before authenticateToken middleware)
app.post('/api/auth/register', authHandlers.handleUserRegistration);
app.post('/api/auth/login', authHandlers.handleUserLogin);
app.post('/api/auth/logout', authHandlers.handleUserLogout);

// Protected routes - all under /api
app.use('/api', authenticateToken);

// Auth verification
app.get('/api/auth/validate', authHandlers.validateAuthenticationToken);
app.put('/api/auth/password', authHandlers.handlePasswordChange);

// Patient management routes
app.get('/api/patients', patientHandlers.handleGetPatients);
app.post('/api/patients', validateClinicalAccess, patientHandlers.handleCreatePatient);
app.get('/api/patients/:id', patientHandlers.handleGetPatientDetails);
app.put('/api/patients/:id', validateClinicalAccess, patientHandlers.handleUpdatePatient);
app.delete('/api/patients/:id', validateClinicalAccess, patientHandlers.handleDeletePatient);
app.get('/api/patients/search', patientHandlers.handleSearchPatients);

// Visit routes
app.get('/api/visits', visitHandlers.handleGetVisits);
app.post('/api/visits', validateClinicalAccess, visitHandlers.handleCreateVisit);
app.get('/api/visits/patient/:patientId', visitHandlers.handleGetPatientVisits);
app.get('/api/visits/:id', visitHandlers.handleGetVisitDetails);
app.put('/api/visits/:id', validateClinicalAccess, visitHandlers.handleUpdateVisit);
app.delete('/api/visits/:id', validateClinicalAccess, visitHandlers.handleDeleteVisit);
app.get('/api/visits/recent', visitHandlers.handleGetRecentVisits);

// Dashboard routes
app.get('/api/dashboard', visitHandlers.handleGetDashboardData);
app.get('/api/dashboard/stats', visitHandlers.handleGetDashboardStats);

// 404 handler for undefined routes
app.use('/api', (request, response) => {
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