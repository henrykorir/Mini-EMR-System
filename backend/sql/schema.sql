-- Create Database (if not already created)
CREATE DATABASE IF NOT EXISTS medi_grind_db;
USE medi_grind_db;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if they exist
DROP TABLE IF EXISTS system_users;
DROP TABLE IF EXISTS patient_records;
DROP TABLE IF EXISTS clinical_encounters;
DROP TABLE IF EXISTS medication_prescriptions;

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
    created_by_user INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_provider_id) REFERENCES system_users(user_id),
    FOREIGN KEY (created_by_user) REFERENCES system_users(user_id),
    INDEX idx_mrn (medical_record_number),
    INDEX idx_name (last_name, first_name),
    INDEX idx_provider (primary_provider_id),
    INDEX idx_dob (date_of_birth)
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_record_id) REFERENCES patient_records(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (treating_clinician_id) REFERENCES system_users(user_id),
    INDEX idx_patient_encounters (patient_record_id, encounter_date),
    INDEX idx_clinician_encounters (treating_clinician_id, encounter_date),
    INDEX idx_encounter_date (encounter_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Medication prescriptions table
CREATE TABLE medication_prescriptions (
    prescription_id INT PRIMARY KEY AUTO_INCREMENT,
    clinical_encounter_id INT NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage_instructions TEXT NOT NULL,
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

-- Insert Sample Patient Records
INSERT INTO patient_records (medical_record_number, primary_provider_id, first_name, last_name, date_of_birth, gender, contact_phone, email, residential_address, emergency_contact_name, emergency_contact_phone, insurance_provider, insurance_policy_number, significant_medical_history, known_allergies, created_by_user)
VALUES 
('MRN0001', 1, 'Alice', 'Johnson', '1985-03-15', 'female', '555-1234', 'alice.johnson@email.com', '123 Maple Street, Springfield, IL', 'Bob Johnson', '555-5678', 'BlueCross', 'BC1234567890', 'Hypertension, Asthma', 'Peanuts', 1),
('MRN0002', 2, 'Bob', 'Williams', '1990-07-22', 'male', '555-9876', 'bob.williams@email.com', '456 Oak Avenue, Springfield, IL', 'Eve Williams', '555-6543', 'Aetna', 'AT9876543210', 'Diabetes', 'Penicillin', 1),
('MRN0003', 1, 'Charlie', 'Brown', '1979-05-10', 'male', '555-3456', 'charlie.brown@email.com', '789 Pine Road, Springfield, IL', 'Lucy Brown', '555-8765', 'UnitedHealthcare', 'UH1122334455', 'Cholesterol, Asthma', 'None', 2),
('MRN0004', 3, 'Diana', 'Green', '1995-11-30', 'female', '555-6543', 'diana.green@email.com', '123 Birch Street, Springfield, IL', 'Samantha Green', '555-4321', 'Humana', 'HU9988776655', 'Asthma', 'Shellfish', 2),
('MRN0005', 4, 'Ethan', 'Adams', '1988-09-08', 'male', '555-2345', 'ethan.adams@email.com', '234 Cedar Lane, Springfield, IL', 'Tom Adams', '555-6789', 'Cigna', 'CG1239874560', 'High blood pressure', 'Sulfa drugs', 3);

-- Insert Sample Clinical Encounters
INSERT INTO clinical_encounters (patient_record_id, treating_clinician_id, visit_type, encounter_date, chief_complaint, subjective_assessment, objective_findings, clinical_assessment, treatment_plan, vital_signs, followup_instructions, next_visit_date, encounter_status)
VALUES 
(1, 1, 'routine', '2023-11-01 09:30:00', 'Routine check-up', 'Patient feels healthy', 'No notable issues', 'Good health, monitor blood pressure', 'Continue healthy lifestyle, monitor hypertension', '{"blood_pressure": "120/80"}', 'Follow-up in 6 months', '2024-05-01', 'completed'),
(2, 2, 'initial', '2023-10-15 14:00:00', 'Diabetes management', 'Patient feels fatigued', 'Blood sugar levels high', 'Type 2 Diabetes, controlled', 'Adjust medication and lifestyle', '{"blood_sugar": "180"}', 'Follow-up in 1 month', '2023-11-15', 'completed'),
(3, 1, 'followup', '2023-11-05 10:00:00', 'Cholesterol management', 'Patient reports chest tightness', 'Elevated cholesterol levels', 'Hyperlipidemia, stable', 'Increase statin dosage, monitor levels', '{"cholesterol": "220"}', 'Follow-up in 3 months', '2024-02-05', 'completed'),
(4, 3, 'emergency', '2023-09-25 12:45:00', 'Severe asthma attack', 'Patient experiencing shortness of breath', 'Low oxygen saturation', 'Asthma exacerbation', 'Administer albuterol, oxygen therapy', '{"oxygen_saturation": "92%"}', 'Emergency care provided', '2023-10-05', 'completed'),
(5, 4, 'routine', '2023-10-18 08:30:00', 'Blood pressure monitoring', 'Patient feels lightheaded', 'Elevated blood pressure', 'Hypertension, controlled', 'Adjust medication, reduce salt intake', '{"blood_pressure": "150/90"}', 'Follow-up in 1 month', '2023-11-18', 'completed');

-- Insert Sample Medication Prescriptions
INSERT INTO medication_prescriptions (clinical_encounter_id, medication_name, dosage_instructions, route_of_administration, quantity_prescribed, refills_authorized, start_date, end_date, prescription_status, prescribed_by_clinician)
VALUES 
(1, 'Atenolol', '50 mg daily', 'oral', '30 tablets', 1, '2023-11-01', '2024-05-01', 'active', 1),
(2, 'Metformin', '500 mg twice daily', 'oral', '60 tablets', 2, '2023-10-15', '2024-04-15', 'active', 2),
(3, 'Simvastatin', '20 mg nightly', 'oral', '30 tablets', 1, '2023-11-05', '2024-02-05', 'active', 1),
(4, 'Albuterol', '2 puffs as needed', 'inhalation', '1 inhaler', 0, '2023-09-25', '2024-09-25', 'active', 3),
(5, 'Lisinopril', '10 mg daily', 'oral', '30 tablets', 1, '2023-10-18', '2024-10-18', 'active', 4);
