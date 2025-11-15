// Application constants and configuration values

// User roles and permissions
const USER_ROLES = {
  PHYSICIAN: 'physician',
  NURSE: 'nurse',
  ADMINISTRATOR: 'administrator',
  MEDICAL_ASSISTANT: 'medical_assistant'
};

// Patient gender options
const GENDER_OPTIONS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  UNKNOWN: 'unknown',
  PREFER_NOT_TO_SAY: 'prefer_not_to_say'
};

// Clinical encounter types
const ENCOUNTER_TYPES = {
  INITIAL_CONSULTATION: 'initial_consultation',
  FOLLOW_UP: 'follow_up',
  URGENT_CARE: 'urgent_care',
  ROUTINE_CHECKUP: 'routine_checkup',
  EMERGENCY: 'emergency',
  TELEHEALTH: 'telehealth'
};

// Medication administration routes
const MEDICATION_ROUTES = {
  ORAL: 'oral',
  TOPICAL: 'topical',
  INJECTION: 'injection',
  INTRAVENOUS: 'intravenous',
  INHALATION: 'inhalation',
  SUBCUTANEOUS: 'subcutaneous',
  INTRAMUSCULAR: 'intramuscular'
};

// Prescription statuses
const PRESCRIPTION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DISCONTINUED: 'discontinued',
  EXPIRED: 'expired',
  PENDING: 'pending'
};

// Vital signs measurement units
const VITAL_SIGNS_UNITS = {
  BLOOD_PRESSURE: 'mmHg',
  HEART_RATE: 'bpm',
  RESPIRATORY_RATE: 'breaths/min',
  TEMPERATURE: '°F',
  OXYGEN_SATURATION: '%',
  HEIGHT: 'cm',
  WEIGHT: 'kg'
};

// Common medical specialties
const MEDICAL_SPECIALTIES = {
  CARDIOLOGY: 'cardiology',
  DERMATOLOGY: 'dermatology',
  ENDOCRINOLOGY: 'endocrinology',
  GASTROENTEROLOGY: 'gastroenterology',
  NEUROLOGY: 'neurology',
  ONCOLOGY: 'oncology',
  ORTHOPEDICS: 'orthopedics',
  PEDIATRICS: 'pediatrics',
  PSYCHIATRY: 'psychiatry',
  RADIOLOGY: 'radiology'
};

// Insurance provider types
const INSURANCE_TYPES = {
  PRIVATE: 'private',
  MEDICARE: 'medicare',
  MEDICAID: 'medicaid',
  TRICARE: 'tricare',
  SELF_PAY: 'self_pay',
  WORKERS_COMP: 'workers_compensation'
};

// Application settings and limits
const APPLICATION_CONSTANTS = {
  MAX_PATIENTS_PER_PAGE: 50,
  MAX_ENCOUNTERS_PER_PAGE: 25,
  MAX_PRESCRIPTIONS_PER_ENCOUNTER: 10,
  MAX_CLINICAL_NOTES_LENGTH: 5000,
  PASSWORD_MIN_LENGTH: 8,
  SESSION_TIMEOUT_MINUTES: 120,
  MAX_FILE_UPLOAD_SIZE_MB: 10,
  AUTO_LOGOUT_WARNING_MINUTES: 5
};

// Database table names
const DATABASE_TABLES = {
  USERS: 'system_users',
  PATIENTS: 'patient_records',
  ENCOUNTERS: 'clinical_encounters',
  PRESCRIPTIONS: 'medication_prescriptions',
  LAB_RESULTS: 'laboratory_results',
  ALLERGIES: 'patient_allergies'
};

// HTTP status codes with medical context
const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Error messages for medical context
const ERROR_MESSAGES = {
  PATIENT_NOT_FOUND: 'Patient record not found in the system',
  ENCOUNTER_NOT_FOUND: 'Clinical encounter documentation not found',
  DUPLICATE_PATIENT: 'Patient with this identifier already exists',
  INVALID_CREDENTIALS: 'Invalid healthcare provider credentials',
  UNAUTHORIZED_ACCESS: 'Unauthorized access to medical records',
  DATA_VALIDATION_FAILED: 'Medical data validation failed',
  DATABASE_UNAVAILABLE: 'Medical records database temporarily unavailable',
  PRESCRIPTION_ERROR: 'Medication prescription processing error'
};

// Success messages
const SUCCESS_MESSAGES = {
  PATIENT_CREATED: 'Patient medical record created successfully',
  ENCOUNTER_RECORDED: 'Clinical encounter documented successfully',
  PRESCRIPTION_ADDED: 'Medication prescription added to patient record',
  RECORD_UPDATED: 'Medical record updated successfully',
  USER_AUTHENTICATED: 'Healthcare provider authenticated successfully'
};

// Validation patterns
const VALIDATION_PATTERNS = {
  MEDICAL_RECORD_NUMBER: /^MRN-\d{6,8}-[A-Z0-9]{4,6}$/,
  PHONE_NUMBER: /^[\+]?[1-9][\d]{0,15}$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/
};

// Audit log actions
const AUDIT_ACTIONS = {
  PATIENT_CREATE: 'PATIENT_CREATE',
  PATIENT_UPDATE: 'PATIENT_UPDATE',
  PATIENT_VIEW: 'PATIENT_VIEW',
  ENCOUNTER_CREATE: 'ENCOUNTER_CREATE',
  ENCOUNTER_UPDATE: 'ENCOUNTER_UPDATE',
  PRESCRIPTION_CREATE: 'PRESCRIPTION_CREATE',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT'
};

// Export all constants
module.exports = {
  USER_ROLES,
  GENDER_OPTIONS,
  ENCOUNTER_TYPES,
  MEDICATION_ROUTES,
  PRESCRIPTION_STATUS,
  VITAL_SIGNS_UNITS,
  MEDICAL_SPECIALTIES,
  INSURANCE_TYPES,
  APPLICATION_CONSTANTS,
  DATABASE_TABLES,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_PATTERNS,
  AUDIT_ACTIONS
};