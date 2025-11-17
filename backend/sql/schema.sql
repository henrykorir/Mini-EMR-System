-- Create Database (if not already created)
CREATE DATABASE IF NOT EXISTS medi_grind_db;
USE medi_grind_db;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if they exist
DROP TABLE IF EXISTS system_users;
DROP TABLE IF EXISTS patient_records;
DROP TABLE IF EXISTS clinical_encounters;
DROP TABLE IF EXISTS medication_prescriptions;
DROP TABLE IF EXISTS patient_diagnoses;

SET FOREIGN_KEY_CHECKS = 1;

-- Create Healthcare providers table
CREATE TABLE system_users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email_address VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    professional_license VARCHAR(100),
    user_role ENUM('physician', 'nurse', 'administrator') DEFAULT 'physician',
    account_status ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email_address),
    INDEX idx_role (user_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Patient records table
CREATE TABLE patient_records (
    patient_id INT PRIMARY KEY AUTO_INCREMENT,
    medical_record_number VARCHAR(50) UNIQUE NOT NULL,
    id_number VARCHAR(100) UNIQUE NOT NULL,
    primary_provider_id INT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'unknown', 'other') NOT NULL,
    contact_phone VARCHAR(20),
    email VARCHAR(255),
    residential_address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    insurance_provider VARCHAR(100),
    insurance_policy_number VARCHAR(100),
    significant_medical_history TEXT,
    known_allergies TEXT,
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    patient_status ENUM('Active', 'Inactive') DEFAULT 'Active',
    last_visit_date DATE,
    created_by_user INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_provider_id) REFERENCES system_users(user_id),
    FOREIGN KEY (created_by_user) REFERENCES system_users(user_id),
    INDEX idx_mrn (medical_record_number),
    INDEX idx_id_number (id_number),
    INDEX idx_name (last_name, first_name),
    INDEX idx_provider (primary_provider_id),
    INDEX idx_dob (date_of_birth),
    INDEX idx_status (patient_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Clinical encounters table
CREATE TABLE clinical_encounters (
    encounter_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_record_id INT NOT NULL,
    treating_clinician_id INT NOT NULL,
    visit_type ENUM('initial', 'followup', 'emergency', 'routine') DEFAULT 'routine',
    encounter_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    chief_complaint TEXT,
    subjective_assessment TEXT,
    objective_findings TEXT,
    clinical_assessment TEXT,
    treatment_plan TEXT,
    vital_signs JSON,
    followup_instructions TEXT,
    next_visit_date DATE,
    encounter_status ENUM('scheduled', 'in-progress', 'completed', 'cancelled') DEFAULT 'completed',
    visit_duration VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_record_id) REFERENCES patient_records(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (treating_clinician_id) REFERENCES system_users(user_id),
    INDEX idx_patient_encounters (patient_record_id, encounter_date),
    INDEX idx_clinician_encounters (treating_clinician_id, encounter_date),
    INDEX idx_encounter_date (encounter_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Patient Diagnoses table
CREATE TABLE patient_diagnoses (
    diagnosis_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_record_id INT NOT NULL,
    clinical_encounter_id INT,
    diagnosis_name VARCHAR(255) NOT NULL,
    diagnosis_code VARCHAR(50),
    diagnosis_type ENUM('primary', 'secondary', 'chronic', 'acute') DEFAULT 'primary',
    diagnosis_date DATE NOT NULL,
    resolved_date DATE NULL,
    status ENUM('active', 'resolved', 'chronic') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_record_id) REFERENCES patient_records(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (clinical_encounter_id) REFERENCES clinical_encounters(encounter_id) ON DELETE SET NULL,
    INDEX idx_patient_diagnoses (patient_record_id, diagnosis_date),
    INDEX idx_encounter_diagnoses (clinical_encounter_id),
    INDEX idx_diagnosis_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Medication prescriptions table
CREATE TABLE medication_prescriptions (
    prescription_id INT PRIMARY KEY AUTO_INCREMENT,
    clinical_encounter_id INT NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage_instructions TEXT NOT NULL,
    dosage_value VARCHAR(50),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    special_instructions TEXT,
    route_of_administration ENUM('oral', 'topical', 'injection', 'inhalation') DEFAULT 'oral',
    quantity_prescribed VARCHAR(100),
    refills_authorized INT DEFAULT 0,
    start_date DATE,
    end_date DATE,
    prescription_status ENUM('active', 'completed', 'discontinued') DEFAULT 'active',
    prescribed_by_clinician INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinical_encounter_id) REFERENCES clinical_encounters(encounter_id) ON DELETE CASCADE,
    FOREIGN KEY (prescribed_by_clinician) REFERENCES system_users(user_id),
    INDEX idx_encounter_meds (clinical_encounter_id),
    INDEX idx_medication_status (prescription_status),
    INDEX idx_prescribing_clinician (prescribed_by_clinician)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Sample System Users (Healthcare Providers)
INSERT INTO system_users (email_address, password_hash, full_name, user_role, professional_license)
VALUES 
('dr.john.doe@healthcare.com', '$2b$10$ExampleHashForPassword123', 'Dr. John Doe', 'physician', 'MD123456'),
('nurse.jane.smith@healthcare.com', '$2b$10$ExampleHashForPassword456', 'Nurse Jane Smith', 'nurse', 'RN654321'),
('admin@medicalsystem.com', '$2b$10$ExampleHashForPassword123', 'System Administrator', 'administrator', NULL),
('dr.mary.james@healthcare.com', '$2b$10$ExampleHashForPassword789', 'Dr. Mary James', 'physician', 'MD654321'),
('nurse.paul.jones@healthcare.com', '$2b$10$ExampleHashForPassword111', 'Nurse Paul Jones', 'nurse', 'RN987654');

-- Insert Sample Patient Records matching mock data with id_number
INSERT INTO patient_records (medical_record_number, id_number, primary_provider_id, first_name, last_name, date_of_birth, gender, contact_phone, email, residential_address, emergency_contact_name, emergency_contact_phone, insurance_provider, insurance_policy_number, significant_medical_history, known_allergies, blood_type, patient_status, last_visit_date, created_by_user)
VALUES 
('P001', 'ID123456', 1, 'John', 'Doe', '1979-05-15', 'male', NULL, 'john.doe@email.com', '123 Main St, Anytown, USA', 'Jane Doe', '(555) 123-4567', NULL, NULL, 'Hypertension, Type 2 Diabetes', 'Penicillin, Peanuts', 'A+', 'Active', '2024-01-15', 1),
('P002', 'ID123457', 2, 'Sarah', 'Smith', '1992-08-22', 'female', NULL, 'sarah.smith@email.com', '456 Oak Ave, Somewhere, USA', 'Mike Smith', '(555) 987-6543', NULL, NULL, 'Asthma', 'None', 'O-', 'Active', '2024-01-10', 1),
('P003', 'ID123458', 1, 'Mike', 'Johnson', '1985-12-03', 'male', NULL, 'mike.johnson@email.com', '789 Pine Rd, Nowhere, USA', 'Lisa Johnson', '(555) 456-7890', NULL, NULL, 'High Cholesterol', 'Shellfish', 'B+', 'Inactive', '2024-01-08', 2);

-- Insert Sample Clinical Encounters matching mock data
INSERT INTO clinical_encounters (patient_record_id, treating_clinician_id, visit_type, encounter_date, clinical_assessment, treatment_plan, vital_signs, followup_instructions, next_visit_date, encounter_status, visit_duration)
VALUES 
(1, 1, 'followup', '2024-01-15 09:00:00', 'Hypertension, Diabetes Type II', '• Continue current antihypertensive medication\n• Start Metformin for glucose control\n• Implement DASH diet principles\n• 30 minutes moderate exercise 5x/week\n• Home BP monitoring twice daily\n• Stress reduction techniques', '{"bloodPressure": "140/90", "heartRate": "72", "temperature": "36.6", "oxygenSaturation": "98", "respiratoryRate": "16", "weight": "85", "height": "175", "bmi": "27.8"}', 'Return in 2 weeks for BP recheck\nFasting blood work in 1 month\nCall if BP > 160/100 or symptoms worsen\nSchedule ophthalmology exam for diabetic screening', '2024-01-29', 'completed', '30 minutes'),
(2, 2, 'followup', '2024-01-10 10:30:00', 'Asthma, Upper Respiratory Infection', 'Administer albuterol, prescribe antibiotics and inhaler. Advised to use humidifier.', '{}', 'Follow up if symptoms persist or worsen', NULL, 'completed', NULL),
(1, 1, 'routine', '2024-01-15 11:00:00', 'Hypertension, Diabetes Type II', 'Patient presents with elevated blood pressure. Recommended lifestyle changes including reduced sodium diet and regular exercise.', '{}', 'Follow up in 2 weeks', '2024-01-29', 'completed', NULL);

-- Insert Sample Diagnoses
INSERT INTO patient_diagnoses (patient_record_id, clinical_encounter_id, diagnosis_name, diagnosis_date, status, diagnosis_type)
VALUES 
(1, 1, 'Hypertension', '2024-01-15', 'chronic', 'chronic'),
(1, 1, 'Diabetes Type II', '2024-01-15', 'chronic', 'chronic'),
(2, 2, 'Asthma', '2024-01-10', 'chronic', 'chronic'),
(2, 2, 'Upper Respiratory Infection', '2024-01-10', 'active', 'acute');

-- Insert Sample Medication Prescriptions matching mock data
INSERT INTO medication_prescriptions (clinical_encounter_id, medication_name, dosage_instructions, dosage_value, frequency, duration, special_instructions, route_of_administration, quantity_prescribed, refills_authorized, start_date, end_date, prescription_status, prescribed_by_clinician)
VALUES 
(1, 'Lisinopril', '10mg Daily for 30 days', '10mg', 'Daily', '30 days', 'Take in the morning with food', 'oral', '30 tablets', 0, '2024-01-15', '2024-02-14', 'active', 1),
(1, 'Metformin', '500mg Twice Daily for 90 days', '500mg', 'Twice Daily', '90 days', 'Take with meals', 'oral', '180 tablets', 0, '2024-01-15', '2024-04-14', 'active', 1),
(2, 'Albuterol', '2 puffs As needed for 30 days', '2 puffs', 'As needed', '30 days', NULL, 'inhalation', '1 inhaler', 0, '2024-01-10', '2024-02-09', 'active', 2),
(2, 'Amoxicillin', '500mg Three times daily for 10 days', '500mg', 'Three times daily', '10 days', NULL, 'oral', '30 tablets', 0, '2024-01-10', '2024-01-20', 'completed', 2),
(3, 'Lisinopril', '10mg Daily for 30 days', '10mg', 'Daily', '30 days', NULL, 'oral', '30 tablets', 0, '2024-01-15', '2024-02-14', 'active', 1),
(3, 'Metformin', '500mg Twice Daily for 90 days', '500mg', 'Twice Daily', '90 days', NULL, 'oral', '180 tablets', 0, '2024-01-15', '2024-04-14', 'active', 1);