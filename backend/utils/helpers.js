// Utility functions for medical records system

/**
 * Validates email format for healthcare professionals
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
function isValidHealthcareEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;
  
  // Additional healthcare domain check (optional)
  const healthcareDomains = ['hospital', 'clinic', 'medical', 'healthcare', 'health'];
  const domain = email.split('@')[1]?.toLowerCase();
  
  return healthcareDomains.some(healthcareDomain => 
    domain.includes(healthcareDomain)
  ) || true; // Allow all valid emails for flexibility
}

/**
 * Formats patient name for display (Last, First)
 * @param {string} firstName - Patient first name
 * @param {string} lastName - Patient last name
 * @returns {string} - Formatted name
 */
function formatPatientName(firstName, lastName) {
  if (!firstName || !lastName) return 'Unknown Patient';
  
  return `${lastName}, ${firstName}`.trim();
}

/**
 * Calculates patient age from date of birth
 * @param {string|Date} dateOfBirth - Patient's date of birth
 * @returns {number} - Age in years
 */
function calculatePatientAge(dateOfBirth) {
  if (!dateOfBirth) return 0;
  
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) return 0;
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Sanitizes clinical notes by removing potentially harmful characters
 * @param {string} clinicalText - Raw clinical notes
 * @returns {string} - Sanitized text
 */
function sanitizeClinicalText(clinicalText) {
  if (!clinicalText) return '';
  
  return clinicalText
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/\r\n/g, '\n') // Normalize line endings
    .trim();
}

/**
 * Generates a unique identifier for medical records
 * @param {string} prefix - Prefix for the identifier
 * @returns {string} - Unique identifier
 */
function generateMedicalIdentifier(prefix = 'MED') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Validates phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
function isValidPhoneNumber(phone) {
  if (!phone) return false;
  
  // Basic phone validation - allows international formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  return phoneRegex.test(cleaned);
}

/**
 * Formats date for display in medical records
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatMedicalDate(date) {
  if (!date) return 'Unknown Date';
  
  const medicalDate = new Date(date);
  if (isNaN(medicalDate.getTime())) return 'Invalid Date';
  
  return medicalDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

/**
 * Checks if a date is a valid future date (for appointments)
 * @param {string|Date} date - Date to check
 * @returns {boolean} - True if valid future date
 */
function isValidFutureDate(date) {
  if (!date) return false;
  
  const checkDate = new Date(date);
  const today = new Date();
  
  if (isNaN(checkDate.getTime())) return false;
  
  // Clear time components for accurate date comparison
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate >= today;
}

/**
 * Capitalizes words in medical terms (handles hyphenated names)
 * @param {string} text - Text to capitalize
 * @returns {string} - Properly capitalized text
 */
function capitalizeMedicalTerm(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(/[\s-]+/)
    .map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .replace(/\s-\s/g, '-'); // Restore hyphens
}

/**
 * Validates medication dosage format
 * @param {string} dosage - Dosage string to validate
 * @returns {boolean} - True if valid dosage format
 */
function isValidMedicationDosage(dosage) {
  if (!dosage || typeof dosage !== 'string') return false;
  
  // Basic dosage validation - can be extended based on requirements
  const dosageRegex = /^[\d\.]+\s*(mg|mcg|g|ml|L|tablet|tab|capsule|cap|spray|puff)(?:\s*[\-\/]\s*[\d\.]+\s*(mg|mcg|g|ml|L|tablet|tab|capsule|cap|spray|puff))?$/i;
  
  return dosageRegex.test(dosage.trim());
}

/**
 * Truncates long text for display with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text
 */
function truncateClinicalText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || '';
  
  return text.substr(0, maxLength).trim() + '...';
}

/**
 * Converts object to JSON string with error handling
 * @param {object} obj - Object to stringify
 * @returns {string} - JSON string or empty object string
 */
function safeStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error('JSON stringification error:', error);
    return '{}';
  }
}

/**
 * Parses JSON string with error handling
 * @param {string} jsonString - JSON string to parse
 * @returns {object} - Parsed object or empty object
 */
function safeParse(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parsing error:', error);
    return {};
  }
}

/**
 * Generates search-friendly text from clinical data
 * @param {object} clinicalData - Clinical data object
 * @returns {string} - Search-friendly text
 */
function generateSearchIndex(clinicalData) {
  if (!clinicalData) return '';
  
  const searchFields = [
    clinicalData.firstName,
    clinicalData.lastName,
    clinicalData.medicalRecordNumber,
    clinicalData.diagnosis,
    clinicalData.medicationName
  ];
  
  return searchFields
    .filter(field => field && typeof field === 'string')
    .join(' ')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = {
  isValidHealthcareEmail,
  formatPatientName,
  calculatePatientAge,
  sanitizeClinicalText,
  generateMedicalIdentifier,
  isValidPhoneNumber,
  formatMedicalDate,
  isValidFutureDate,
  capitalizeMedicalTerm,
  isValidMedicationDosage,
  truncateClinicalText,
  safeStringify,
  safeParse,
  generateSearchIndex
};