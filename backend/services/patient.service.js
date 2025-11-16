const database = require('../lib/database');

class PatientService {
  async getAllPatients() {
    const query = `
      SELECT 
        patient_id as id,
        medical_record_number,
        id_number,
        primary_provider_id,
        first_name,
        last_name,
        date_of_birth,
        gender,
        contact_phone,
        email,
        residential_address,
        emergency_contact_name,
        emergency_contact_phone,
        insurance_provider,
        insurance_policy_number,
        significant_medical_history,
        known_allergies,
        blood_type,
        patient_status as status,
        last_visit_date,
        created_at,
        updated_at
      FROM patient_records 
      ORDER BY last_name, first_name
    `;
    
    return await database.executeQuery(query);
  }

  async getPatientById(patientId) {
    const query = `
      SELECT 
        patient_id as id,
        medical_record_number,
        id_number,
        primary_provider_id,
        first_name,
        last_name,
        date_of_birth,
        gender,
        contact_phone,
        email,
        residential_address,
        emergency_contact_name,
        emergency_contact_phone,
        insurance_provider,
        insurance_policy_number,
        significant_medical_history,
        known_allergies,
        blood_type,
        patient_status as status,
        last_visit_date,
        created_at,
        updated_at
      FROM patient_records 
      WHERE patient_id = ?
    `;
    
    const patients = await database.executeQuery(query, [patientId]);
    return patients.length > 0 ? patients[0] : null;
  }

  async createPatient(patientData) {
    const checkMrnQuery = `
      SELECT patient_id FROM patient_records WHERE medical_record_number = ?
    `;
    
    const existingPatients = await database.executeQuery(checkMrnQuery, [patientData.medical_record_number]);
    
    if (existingPatients.length > 0) {
      throw new Error('Medical record number already exists in the system');
    }

    if (patientData.id_number) {
      const checkIdQuery = `SELECT patient_id FROM patient_records WHERE id_number = ?`;
      const existingIdPatients = await database.executeQuery(checkIdQuery, [patientData.id_number]);
      
      if (existingIdPatients.length > 0) {
        throw new Error('ID number already registered for another patient');
      }
    }

    const insertQuery = `
      INSERT INTO patient_records (
        medical_record_number, id_number, primary_provider_id, first_name, last_name,
        date_of_birth, gender, contact_phone, email, residential_address,
        emergency_contact_name, emergency_contact_phone, insurance_provider,
        insurance_policy_number, significant_medical_history, known_allergies,
        blood_type, created_by_user
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await database.executeQuery(insertQuery, [
      patientData.medical_record_number,
      patientData.id_number || null,
      patientData.primary_provider_id || null,
      patientData.first_name,
      patientData.last_name,
      patientData.date_of_birth,
      patientData.gender,
      patientData.contact_phone || null,
      patientData.email || null,
      patientData.residential_address || null,
      patientData.emergency_contact_name || null,
      patientData.emergency_contact_phone || null,
      patientData.insurance_provider || null,
      patientData.insurance_policy_number || null,
      patientData.significant_medical_history || null,
      patientData.known_allergies || null,
      patientData.blood_type || null,
      patientData.created_by_user
    ]);

    return this.getPatientById(result.insertId);
  }

  async updatePatient(patientId, updateData) {
    const existingPatient = await this.getPatientById(patientId);
    if (!existingPatient) {
      return null;
    }

    // Check for duplicate MRN if being updated
    if (updateData.medical_record_number && updateData.medical_record_number !== existingPatient.medical_record_number) {
      const checkMrnQuery = `SELECT patient_id FROM patient_records WHERE medical_record_number = ? AND patient_id != ?`;
      const existingPatients = await database.executeQuery(checkMrnQuery, [updateData.medical_record_number, patientId]);
      
      if (existingPatients.length > 0) {
        throw new Error('Medical record number already exists for another patient');
      }
    }

    // Check for duplicate ID number if being updated
    if (updateData.id_number && updateData.id_number !== existingPatient.id_number) {
      const checkIdQuery = `SELECT patient_id FROM patient_records WHERE id_number = ? AND patient_id != ?`;
      const existingIdPatients = await database.executeQuery(checkIdQuery, [updateData.id_number, patientId]);
      
      if (existingIdPatients.length > 0) {
        throw new Error('ID number already registered for another patient');
      }
    }

    const updateFields = [];
    const updateValues = [];

    const fieldMappings = {
      medical_record_number: 'medical_record_number',
      id_number: 'id_number',
      primary_provider_id: 'primary_provider_id',
      first_name: 'first_name',
      last_name: 'last_name',
      date_of_birth: 'date_of_birth',
      gender: 'gender',
      contact_phone: 'contact_phone',
      email: 'email',
      residential_address: 'residential_address',
      emergency_contact_name: 'emergency_contact_name',
      emergency_contact_phone: 'emergency_contact_phone',
      insurance_provider: 'insurance_provider',
      insurance_policy_number: 'insurance_policy_number',
      significant_medical_history: 'significant_medical_history',
      known_allergies: 'known_allergies',
      blood_type: 'blood_type',
      patient_status: 'patient_status',
      last_visit_date: 'last_visit_date'
    };

    Object.keys(fieldMappings).forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields.push(`${fieldMappings[field]} = ?`);
        updateValues.push(updateData[field]);
      }
    });

    if (updateFields.length === 0) {
      return existingPatient;
    }

    updateValues.push(patientId);

    const updateQuery = `
      UPDATE patient_records 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE patient_id = ?
    `;

    await database.executeQuery(updateQuery, updateValues);
    return this.getPatientById(patientId);
  }

  async deletePatient(patientId) {
    const existingPatient = await this.getPatientById(patientId);
    if (!existingPatient) {
      return null;
    }

    // Check if patient has existing visits
    const checkVisitsQuery = `SELECT COUNT(*) as visit_count FROM clinical_encounters WHERE patient_record_id = ?`;
    const visitResult = await database.executeQuery(checkVisitsQuery, [patientId]);
    
    if (visitResult[0].visit_count > 0) {
      throw new Error('Cannot delete patient with existing clinical visits. Archive instead.');
    }

    const deleteQuery = `DELETE FROM patient_records WHERE patient_id = ?`;
    const result = await database.executeQuery(deleteQuery, [patientId]);
    
    return result.affectedRows > 0;
  }

  async searchPatients(searchTerm) {
    const query = `
      SELECT 
        patient_id as id,
        medical_record_number,
        id_number,
        first_name,
        last_name,
        date_of_birth,
        gender,
        contact_phone,
        email,
        patient_status as status,
        last_visit_date
      FROM patient_records 
      WHERE 
        first_name LIKE ? OR 
        last_name LIKE ? OR 
        medical_record_number LIKE ? OR 
        id_number LIKE ? OR
        email LIKE ? OR
        contact_phone LIKE ?
      ORDER BY last_name, first_name
      LIMIT 50
    `;

    const searchPattern = `%${searchTerm}%`;
    return await database.executeQuery(query, [
      searchPattern, searchPattern, searchPattern, 
      searchPattern, searchPattern, searchPattern
    ]);
  }

  async updateLastVisitDate(patientId, visitDate) {
    const updateQuery = `
      UPDATE patient_records 
      SET last_visit_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE patient_id = ?
    `;
    
    await database.executeQuery(updateQuery, [visitDate, patientId]);
  }
}

module.exports = new PatientService();