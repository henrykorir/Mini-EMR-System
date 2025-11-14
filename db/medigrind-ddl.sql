-- ==========================================
-- Database: Medigrind
-- ==========================================
-- Create Database (if not already created)
CREATE DATABASE IF NOT EXISTS medigrind;
USE medigrind;

-- ==========================================
-- 1. Users Table (for Authentication)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,  -- For storing hashed passwords
    role ENUM('admin', 'clinician') DEFAULT 'clinician',  -- To distinguish user roles
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. Patients Table
-- ==========================================
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,  -- Reference to the user (clinician who created the record)
    name VARCHAR(255) NOT NULL,
    patient_id VARCHAR(50) NOT NULL UNIQUE,  -- Unique ID for each patient
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    contact VARCHAR(255) NOT NULL,  -- Contact information (phone, email, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- 3. Clinical Visits Table
-- ==========================================
CREATE TABLE IF NOT EXISTS clinical_visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,  -- Reference to the patient
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diagnosis TEXT NOT NULL,
    prescribed_medications TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- ==========================================
-- 4. Prescriptions Table
-- ==========================================
CREATE TABLE IF NOT EXISTS prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visit_id INT NOT NULL,  -- Reference to the clinical visit
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES clinical_visits(id) ON DELETE CASCADE
);

-- ==========================================
-- 5. Sessions Table (for JWT or session-based authentication)
-- ==========================================
CREATE TABLE IF NOT EXISTS `sessions` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,  -- Reference to the user (clinician)
    session_token VARCHAR(255) NOT NULL UNIQUE,  -- Session token or JWT token
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,  -- Expiration time for the session
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- 6. Indexes for Faster Queries
-- ==========================================
-- Index for searching patients by name
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients (name);

-- Index for searching patients by unique patient_id
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients (patient_id);

-- Index for filtering visits by date range
CREATE INDEX IF NOT EXISTS idx_clinical_visits_visit_date ON clinical_visits (visit_date);

-- ==========================================
-- 7. Views for Data Visualization (Dashboard)
-- ==========================================
-- View for the number of patients
CREATE VIEW IF NOT EXISTS patient_count_view AS
SELECT COUNT(*) AS total_patients
FROM patients;

-- View for recent visits
CREATE VIEW IF NOT EXISTS recent_visits_view AS
SELECT v.id, p.name AS patient_name, v.visit_date, v.diagnosis
FROM clinical_visits v
JOIN patients p ON v.patient_id = p.id
ORDER BY v.visit_date DESC
LIMIT 5;  -- Adjust based on your needs

-- View for most common diagnoses
CREATE VIEW IF NOT EXISTS common_diagnoses_view AS
SELECT diagnosis, COUNT(*) AS count
FROM clinical_visits
GROUP BY diagnosis
ORDER BY count DESC
LIMIT 5;
