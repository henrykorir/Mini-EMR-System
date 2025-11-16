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
const corsOptions = {
  origin: 'https://ubiquitous-rotary-phone-q65q5g9j7r3w5x-3000.app.github.dev', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // If you need to send cookies or authorization headers
};

// Enable CORS middleware with the specific options
// app.use(cors(corsOptions));
app.use(cors({origin: '*'}));

// Helmet security configuration
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: 'same-site' },  // Ensure resources are not leaked across origins
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"], // Allow only same-origin content
//       scriptSrc: ["'self'"], // Only allow scripts from same origin
//       styleSrc: ["'self'"],  // Only allow styles from same origin
//       imgSrc: ["'self'"],    // Only allow images from same origin
//     },
//   },
//   frameguard: { action: 'deny' }, // Prevent embedding in an iframe (clickjacking protection)
//   xssFilter: true,               // Enable XSS protection
//   noSniff: true,                 // Prevent sniffing the MIME type
//   hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // HTTP Strict Transport Security
// }));

// Log failed CORS requests manually
app.use((req, res, next) => {
  // Catching preflight OPTIONS requests which are automatically handled by CORS
  if (req.method === 'OPTIONS') {
    console.log(`[CORS Preflight] Failed OPTIONS request: ${req.originalUrl}`);
  }

  // Catch CORS errors when accessing resources (if CORS is violated)
  res.on('finish', () => {
    if (res.statusCode === 403) {
      console.log(`[CORS Error] Forbidden request due to CORS policy: ${req.method} ${req.originalUrl}`);
    }
  });

  next();
});

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

// Visit routes (matching the API service)
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