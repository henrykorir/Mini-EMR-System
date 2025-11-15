const database = require('../lib/database');

class ClinicalDocumentationService {
  async recordClinicalEncounter(encounterData, clinicianId) {
    const insertEncounterSQL = `
      INSERT INTO clinical_encounters (
        patient_record_id, treating_clinician_id, visit_type,
        chief_complaint, subjective_assessment, objective_findings,
        clinical_assessment, treatment_plan, vital_signs,
        followup_instructions, next_visit_date, encounter_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertionResult = await database.executeQuery(insertEncounterSQL, [
      encounterData.patient_record_id,
      clinicianId,
      encounterData.visit_type || 'routine',
      encounterData.chief_complaint,
      encounterData.subjective_assessment || null,
      encounterData.objective_findings || null,
      encounterData.clinical_assessment,
      encounterData.treatment_plan || null,
      encounterData.vital_signs ? JSON.stringify(encounterData.vital_signs) : null,
      encounterData.followup_instructions || null,
      encounterData.next_visit_date || null,
      encounterData.encounter_status || 'completed'
    ]);

    const newEncounterId = insertionResult.insertId;

    if (encounterData.medication_prescriptions && encounterData.medication_prescriptions.length > 0) {
      await this.recordMedicationPrescriptions(
        encounterData.medication_prescriptions, 
        newEncounterId, 
        clinicianId
      );
    }

    return {
      encounter_id: newEncounterId,
      message: 'Clinical encounter documented successfully'
    };
  }

  async recordMedicationPrescriptions(prescriptions, encounterId, clinicianId) {
    const insertPrescriptionSQL = `
      INSERT INTO medication_prescriptions (
        clinical_encounter_id, medication_name, dosage_instructions,
        route_of_administration, quantity_prescribed, refills_authorized,
        start_date, end_date, prescribed_by_clinician
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const prescriptionPromises = prescriptions.map(prescription => {
      return database.executeQuery(insertPrescriptionSQL, [
        encounterId,
        prescription.medication_name,
        prescription.dosage_instructions,
        prescription.route || 'oral',
        prescription.quantity || null,
        prescription.refills || 0,
        prescription.start_date || new Date(),
        prescription.end_date || null,
        clinicianId
      ]);
    });

    await Promise.all(prescriptionPromises);
  }

  async getPatientEncounterHistory(patientId, options = {}) {
    const {
      page_number = 1,
      items_per_page = 20,
      date_from = null,
      date_to = null
    } = options;

    const offset = (page_number - 1) * items_per_page;
    
    let baseQuery = `
      FROM clinical_encounters ce
      JOIN system_users su ON ce.treating_clinician_id = su.user_id
      WHERE ce.patient_record_id = ?
    `;
    
    const queryParameters = [patientId];

    if (date_from && date_to) {
      baseQuery += ` AND DATE(ce.encounter_date) BETWEEN ? AND ?`;
      queryParameters.push(date_from, date_to);
    }

    const countQuery = `SELECT COUNT(*) as total_encounters ${baseQuery}`;
    const countResult = await database.executeQuery(countQuery, queryParameters);
    const totalEncounters = countResult[0].total_encounters;

    const dataQuery = `
      SELECT 
        ce.encounter_id, ce.visit_type, ce.encounter_date,
        ce.chief_complaint, ce.clinical_assessment, ce.encounter_status,
        su.full_name as clinician_name
      ${baseQuery}
      ORDER BY ce.encounter_date DESC
      LIMIT ? OFFSET ?
    `;

    const dataParameters = [...queryParameters, items_per_page, offset];
    const encounterRecords = await database.executeQuery(dataQuery, dataParameters);

    return {
      encounters: encounterRecords,
      pagination: {
        current_page: page_number,
        items_per_page: items_per_page,
        total_encounters: totalEncounters,
        total_pages: Math.ceil(totalEncounters / items_per_page)
      }
    };
  }

  async getEncounterDetailedView(encounterId) {
    const encounterQuery = `
      SELECT 
        ce.*, 
        su.full_name as clinician_name,
        pr.first_name, pr.last_name, pr.medical_record_number
      FROM clinical_encounters ce
      JOIN system_users su ON ce.treating_clinician_id = su.user_id
      JOIN patient_records pr ON ce.patient_record_id = pr.patient_id
      WHERE ce.encounter_id = ?
    `;

    const encounterRecords = await database.executeQuery(encounterQuery, [encounterId]);
    
    if (encounterRecords.length === 0) {
      throw new Error('Clinical encounter not found');
    }

    const prescriptionQuery = `
      SELECT mp.*, su.full_name as prescriber_name
      FROM medication_prescriptions mp
      JOIN system_users su ON mp.prescribed_by_clinician = su.user_id
      WHERE mp.clinical_encounter_id = ?
      ORDER BY mp.medication_name
    `;

    const medicationRecords = await database.executeQuery(prescriptionQuery, [encounterId]);

    return {
      encounter_details: encounterRecords[0],
      prescribed_medications: medicationRecords
    };
  }

  async getSystemDashboardMetrics(clinicianId = null) {
    const patientCountQuery = `
      SELECT COUNT(*) as total_patients 
      FROM patient_records 
      ${clinicianId ? 'WHERE primary_provider_id = ?' : ''}
    `;
    
    const patientCountParams = clinicianId ? [clinicianId] : [];
    const patientCountResult = await database.executeQuery(patientCountQuery, patientCountParams);

    const encounterCountQuery = `
      SELECT COUNT(*) as recent_encounters 
      FROM clinical_encounters 
      WHERE encounter_date >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
      ${clinicianId ? 'AND treating_clinician_id = ?' : ''}
    `;
    
    const encounterCountParams = clinicianId ? [clinicianId] : [];
    const encounterCountResult = await database.executeQuery(encounterCountQuery, encounterCountParams);

    const weeklyTrendsQuery = `
      SELECT 
        DATE(encounter_date) as encounter_day,
        COUNT(*) as daily_encounters
      FROM clinical_encounters
      WHERE encounter_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
      ${clinicianId ? 'AND treating_clinician_id = ?' : ''}
      GROUP BY DATE(encounter_date)
      ORDER BY encounter_day DESC
      LIMIT 30
    `;
    
    const weeklyTrendsResult = await database.executeQuery(weeklyTrendsQuery, encounterCountParams);

    return {
      total_patients: patientCountResult[0].total_patients,
      recent_encounters: encounterCountResult[0].recent_encounters,
      encounter_trends: weeklyTrendsResult
    };
  }
}

module.exports = new ClinicalDocumentationService();