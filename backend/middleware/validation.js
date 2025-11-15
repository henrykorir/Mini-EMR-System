const { body, param, query, validationResult } = require('express-validator');
const { GENDER_OPTIONS, ENCOUNTER_TYPES, MEDICATION_ROUTES } = require('../utils/constants');

// Validation middleware for patient creation
const validatePatientCreation = [
  body('first_name')
    .notEmpty()
    .withMessage('Patient first name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters')
    .trim()
    .escape(),
  
  body('last_name')
    .notEmpty()
    .withMessage('Patient last name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters')
    .trim()
    .escape(),
  
  body('date_of_birth')
    .isDate()
    .withMessage('Valid date of birth is required')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      if (birthDate >= today) {
        throw new Error('Date of birth must be in the past');
      }
      return true;
    }),
  
  body('gender')
    .isIn(Object.values(GENDER_OPTIONS))
    .withMessage('Valid gender selection is required'),
  
  body('contact_phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number format is required'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email address is required')
    .normalizeEmail()
];

// Validation middleware for clinical encounters
const validateClinicalEncounter = [
  body('patient_record_id')
    .isInt({ min: 1 })
    .withMessage('Valid patient identifier is required'),
  
  body('visit_type')
    .optional()
    .isIn(Object.values(ENCOUNTER_TYPES))
    .withMessage('Valid encounter type is required'),
  
  body('chief_complaint')
    .notEmpty()
    .withMessage('Chief complaint documentation is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Chief complaint must be between 5 and 500 characters')
    .trim(),
  
  body('clinical_assessment')
    .notEmpty()
    .withMessage('Clinical assessment is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Clinical assessment must be between 10 and 2000 characters')
    .trim(),
  
  body('vital_signs')
    .optional()
    .isObject()
    .withMessage('Vital signs must be a valid object')
];

// Validation middleware for medication prescriptions
const validateMedicationPrescription = [
  body('medication_name')
    .notEmpty()
    .withMessage('Medication name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Medication name must be between 2 and 255 characters')
    .trim()
    .escape(),
  
  body('dosage_instructions')
    .notEmpty()
    .withMessage('Dosage instructions are required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Dosage instructions must be between 5 and 500 characters')
    .trim(),
  
  body('route')
    .optional()
    .isIn(Object.values(MEDICATION_ROUTES))
    .withMessage('Valid medication route is required'),
  
  body('quantity')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Quantity description is too long'),
  
  body('refills')
    .optional()
    .isInt({ min: 0, max: 12 })
    .withMessage('Refills must be between 0 and 12')
];

// Validation middleware for user registration
const validateUserRegistration = [
  body('email_address')
    .isEmail()
    .withMessage('Valid email address is required')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('full_name')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters')
    .trim()
    .escape()
];

// Validation middleware for query parameters
const validatePaginationParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Validation middleware for date range queries
const validateDateRange = [
  query('start_date')
    .optional()
    .isDate()
    .withMessage('Start date must be a valid date'),
  
  query('end_date')
    .optional()
    .isDate()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (req.query.start_date && value < req.query.start_date) {
        throw new Error('End date cannot be before start date');
      }
      return true;
    })
];

// Middleware to check validation results
const checkValidationResults = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      error: 'Data validation failed',
      details: errorMessages
    });
  }
  
  next();
};

module.exports = {
  validatePatientCreation,
  validateClinicalEncounter,
  validateMedicationPrescription,
  validateUserRegistration,
  validatePaginationParams,
  validateDateRange,
  checkValidationResults
};