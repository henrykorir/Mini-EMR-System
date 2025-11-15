// Custom error classes for medical records system

class MedicalRecordsError extends Error {
  constructor(message, statusCode = 500, errorCode = 'MEDICAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

class PatientNotFoundError extends MedicalRecordsError {
  constructor(patientId) {
    super(`Patient record not found: ${patientId}`, 404, 'PATIENT_NOT_FOUND');
    this.patientId = patientId;
  }
}

class ClinicalEncounterNotFoundError extends MedicalRecordsError {
  constructor(encounterId) {
    super(`Clinical encounter not found: ${encounterId}`, 404, 'ENCOUNTER_NOT_FOUND');
    this.encounterId = encounterId;
  }
}

class DuplicatePatientError extends MedicalRecordsError {
  constructor(identifier) {
    super(`Patient with identifier already exists: ${identifier}`, 409, 'DUPLICATE_PATIENT');
    this.identifier = identifier;
  }
}

class InvalidCredentialsError extends MedicalRecordsError {
  constructor() {
    super('Invalid healthcare provider credentials', 401, 'INVALID_CREDENTIALS');
  }
}

class UnauthorizedAccessError extends MedicalRecordsError {
  constructor(resource) {
    super(`Unauthorized access to medical records: ${resource}`, 403, 'UNAUTHORIZED_ACCESS');
    this.resource = resource;
  }
}

class DataValidationError extends MedicalRecordsError {
  constructor(validationErrors) {
    super('Medical data validation failed', 400, 'DATA_VALIDATION_FAILED');
    this.validationErrors = validationErrors;
  }
}

class DatabaseConnectionError extends MedicalRecordsError {
  constructor() {
    super('Medical records database temporarily unavailable', 503, 'DATABASE_UNAVAILABLE');
  }
}

class PrescriptionError extends MedicalRecordsError {
  constructor(details) {
    super('Medication prescription processing error', 400, 'PRESCRIPTION_ERROR');
    this.prescriptionDetails = details;
  }
}

// Global error handler middleware
function globalErrorHandler(error, req, res, next) {
  console.error('Medical Records System Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.userId,
    timestamp: new Date().toISOString()
  });

  // Handle known custom errors
  if (error instanceof MedicalRecordsError) {
    return res.status(error.statusCode).json({
      error: error.message,
      errorCode: error.errorCode,
      timestamp: error.timestamp,
      ...(error.validationErrors && { details: error.validationErrors }),
      ...(error.patientId && { patientId: error.patientId }),
      ...(error.encounterId && { encounterId: error.encounterId })
    });
  }

  // Handle MongoDB duplicate key errors
  if (error.code === 11000 || error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Duplicate record found',
      errorCode: 'DUPLICATE_RECORD',
      timestamp: new Date().toISOString()
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid authentication token',
      errorCode: 'INVALID_TOKEN',
      timestamp: new Date().toISOString()
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication token expired',
      errorCode: 'TOKEN_EXPIRED',
      timestamp: new Date().toISOString()
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Data validation failed',
      errorCode: 'VALIDATION_ERROR',
      details: error.details || error.message,
      timestamp: new Date().toISOString()
    });
  }

  // Default server error
  res.status(500).json({
    error: 'Internal medical records system error',
    errorCode: 'INTERNAL_SERVER_ERROR',
    reference: `ERR-${Date.now()}`,
    timestamp: new Date().toISOString()
  });
}

// Async error handler wrapper
function asyncErrorHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  MedicalRecordsError,
  PatientNotFoundError,
  ClinicalEncounterNotFoundError,
  DuplicatePatientError,
  InvalidCredentialsError,
  UnauthorizedAccessError,
  DataValidationError,
  DatabaseConnectionError,
  PrescriptionError,
  globalErrorHandler,
  asyncErrorHandler
};