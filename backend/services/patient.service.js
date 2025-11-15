const database = require('../lib/database');

class PatientManagementService {
  async createNewPatientRecord(patientData, createdByUserId) {
    const medicalRecordNumber = this.generateMedicalRecordNumber();
    
    const insertPatientSQL = `
      INSERT INTO patient_records (
        medical_record_number, primary_provider_id, first_name, last_name,
        date_of_birth, gender, contact_phone, email, residential_address,
        emergency_contact_name, emergency_contact_phone, insurance_provider,
        insurance_policy_number, significant_medical_history, known_allergies,
        created_by_user
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertionResult = await database.executeQuery(insertPatientSQL, [
      medicalRecordNumber,
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
      createdByUserId
    ]);

    return {
      patient_id: insertionResult.insertId,
      medical_record_number: medicalRecordNumber,
      message: 'Patient record created successfully'
    };
  }

  generateMedicalRecordNumber() {
    const timestamp = Date.now().toString();
    const randomComponent = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MRN-${timestamp.slice(-6)}-${randomComponent}`;
  }

  async retrievePatientList(options = {}) {
    const {
      page_number = 1,
      items_per_page = 25,
      search_query = '',
      provider_filter = null
    } = options;

    const offset = (page_number - 1) * items_per_page;
    
    let baseQuery = `
      FROM patient_records pr
      LEFT JOIN system_users su ON pr.primary_provider_id = su.user_id
      WHERE 1=1
    `;
    
    const queryParameters = [];

    if (search_query) {
      baseQuery += ` AND (
        pr.first_name LIKE ? OR 
        pr.last_name LIKE ? OR 
        pr.medical_record_number LIKE ?
      )`;
      const searchPattern = `%${search_query}%`;
      queryParameters.push(searchPattern, searchPattern, searchPattern);
    }

    if (provider_filter) {
      baseQuery += ` AND pr.primary_provider_id = ?`;
      queryParameters.push(provider_filter);
    }

    const countQuery = `SELECT COUNT(*) as total_records ${baseQuery}`;
    const countResult = await database.executeQuery(countQuery, queryParameters);
    const totalRecords = countResult[0].total_records;

    const dataQuery = `
      SELECT 
        pr.patient_id, pr.medical_record_number, pr.first_name, pr.last_name,
        pr.date_of_birth, pr.gender, pr.contact_phone, pr.email,
        su.full_name as primary_provider_name,
        pr.created_at
      ${baseQuery}
      ORDER BY pr.last_name, pr.first_name
      LIMIT ? OFFSET ?
    `;

    const dataParameters = [...queryParameters, items_per_page, offset];
    const patientRecords = await database.executeQuery(dataQuery, dataParameters);

    return {
      patients: patientRecords,
      pagination: {
        current_page: page_number,
        items_per_page: items_per_page,
        total_records: totalRecords,
        total_pages: Math.ceil(totalRecords / items_per_page)
      }
    };
  }

  async getPatientDetailedRecord(patientId) {
    const patientQuery = `
      SELECT 
        pr.*,
        su.full_name as primary_provider_name,
        creator.full_name as created_by_name
      FROM patient_records pr
      LEFT JOIN system_users su ON pr.primary_provider_id = su.user_id
      LEFT JOIN system_users creator ON pr.created_by_user = creator.user_id
      WHERE pr.patient_id = ?
    `;

    const patientRecords = await database.executeQuery(patientQuery, [patientId]);
    
    if (patientRecords.length === 0) {
      throw new Error('Patient record not found in the system');
    }

    return patientRecords[0];
  }

  async updatePatientInformation(patientId, updateData, updatedByUserId) {
    const existingPatient = await this.getPatientDetailedRecord(patientId);
    
    if (!existingPatient) {
      throw new Error('Cannot update non-existent patient record');
    }

    const allowedFields = [
      'first_name', 'last_name', 'date_of_birth', 'gender', 'contact_phone',
      'email', 'residential_address', 'emergency_contact_name', 
      'emergency_contact_phone', 'insurance_provider', 'insurance_policy_number',
      'significant_medical_history', 'known_allergies', 'primary_provider_id'
    ];

    const updateFields = [];
    const updateValues = [];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updateData[field]);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields provided for update');
    }

    updateValues.push(patientId);
    
    const updateSQL = `
      UPDATE patient_records 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE patient_id = ?
    `;

    const updateResult = await database.executeQuery(updateSQL, updateValues);
    
    if (updateResult.affectedRows === 0) {
      throw new Error('Patient record update failed');
    }

    return {
      success: true,
      message: 'Patient information updated successfully'
    };
  }

  async getPatientClinicalSummary(patientId) {
    const encounterQuery = `
      SELECT 
        encounter_id, visit_type, encounter_date, chief_complaint,
        clinical_assessment, encounter_status
      FROM clinical_encounters
      WHERE patient_record_id = ?
      ORDER BY encounter_date DESC
      LIMIT 10
    `;

    const recentEncounters = await database.executeQuery(encounterQuery, [patientId]);

    const prescriptionQuery = `
      SELECT 
        mp.medication_name, mp.dosage_instructions, mp.start_date,
        mp.prescription_status, su.full_name as prescriber_name
      FROM medication_prescriptions mp
      JOIN clinical_encounters ce ON mp.clinical_encounter_id = ce.encounter_id
      JOIN system_users su ON mp.prescribed_by_clinician = su.user_id
      WHERE ce.patient_record_id = ? AND mp.prescription_status = 'active'
      ORDER BY mp.start_date DESC
    `;

    const activePrescriptions = await database.executeQuery(prescriptionQuery, [patientId]);

    return {
      recent_encounters: recentEncounters,
      active_medications: activePrescriptions
    };
  }
}

module.exports = new PatientManagementService();