const database = require('../lib/database');

class VisitService {
  async getAllVisits() {
    const query = `
      SELECT 
        ce.encounter_id as id,
        ce.patient_record_id as patientId,
        CONCAT(pr.first_name, ' ', pr.last_name) as patientName,
        ce.treating_clinician_id,
        CONCAT(su.full_name) as clinicianName,
        ce.visit_type,
        ce.encounter_date as visitDate,
        ce.chief_complaint,
        ce.subjective_assessment,
        ce.objective_findings,
        ce.clinical_assessment,
        ce.treatment_plan,
        ce.vital_signs,
        ce.followup_instructions,
        ce.next_visit_date,
        ce.encounter_status as status,
        ce.visit_duration as duration,
        ce.created_at,
        -- Get diagnoses as JSON array
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'diagnosis_id', pd.diagnosis_id,
              'diagnosis_name', pd.diagnosis_name,
              'diagnosis_code', pd.diagnosis_code,
              'diagnosis_type', pd.diagnosis_type,
              'diagnosis_date', pd.diagnosis_date,
              'resolved_date', pd.resolved_date,
              'status', pd.status,
              'notes', pd.notes
            )
          )
          FROM patient_diagnoses pd
          WHERE pd.clinical_encounter_id = ce.encounter_id
        ) as diagnoses,
        -- Get medications as JSON array
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'prescription_id', mp.prescription_id,
              'medication_name', mp.medication_name,
              'dosage_instructions', mp.dosage_instructions,
              'dosage_value', mp.dosage_value,
              'frequency', mp.frequency,
              'duration', mp.duration,
              'special_instructions', mp.special_instructions,
              'route_of_administration', mp.route_of_administration,
              'quantity_prescribed', mp.quantity_prescribed,
              'refills_authorized', mp.refills_authorized,
              'start_date', mp.start_date,
              'end_date', mp.end_date,
              'prescription_status', mp.prescription_status
            )
          )
          FROM medication_prescriptions mp
          WHERE mp.clinical_encounter_id = ce.encounter_id
        ) as prescribedMedications
      FROM clinical_encounters ce
      JOIN patient_records pr ON ce.patient_record_id = pr.patient_id
      JOIN system_users su ON ce.treating_clinician_id = su.user_id
      ORDER BY ce.encounter_date DESC
    `;
    
    return await database.executeQuery(query);
}

  async getVisitsByPatientId(patientId) {
    const query = `
      SELECT 
        ce.encounter_id as id,
        ce.patient_record_id as patientId,
        CONCAT(pr.first_name, ' ', pr.last_name) as patientName,
        ce.treating_clinician_id,
        CONCAT(su.full_name) as clinicianName,
        ce.visit_type,
        ce.encounter_date as visitDate,
        ce.chief_complaint,
        ce.clinical_assessment,
        ce.vital_signs,
        ce.encounter_status as status,
        ce.visit_duration as duration,
        ce.subjective_assessment,
        ce.objective_findings,
        ce.treatment_plan,
        ce.followup_instructions,
        ce.next_visit_date,
        ce.created_at
      FROM clinical_encounters ce
      JOIN patient_records pr ON ce.patient_record_id = pr.patient_id
      JOIN system_users su ON ce.treating_clinician_id = su.user_id
      WHERE ce.patient_record_id = ?
      ORDER BY ce.encounter_date DESC
    `;
    
    return await database.executeQuery(query, [patientId]);
  }

  async getVisitById(visitId) {
    // const query = `
    //   SELECT 
    //     ce.encounter_id as id,
    //     ce.patient_record_id as patientId,
    //     CONCAT(pr.first_name, ' ', pr.last_name) as patientName,
    //     ce.treating_clinician_id,
    //     CONCAT(su.full_name) as clinicianName,
    //     ce.visit_type,
    //     ce.encounter_date as visitDate,
    //     ce.chief_complaint,
    //     ce.subjective_assessment,
    //     ce.objective_findings,
    //     ce.clinical_assessment,
    //     ce.treatment_plan,
    //     ce.vital_signs,
    //     ce.followup_instructions,
    //     ce.next_visit_date,
    //     ce.encounter_status as status,
    //     ce.visit_duration as duration,
    //     ce.created_at,
    //     ce.updated_at
    //   FROM clinical_encounters ce
    //   JOIN patient_records pr ON ce.patient_record_id = pr.patient_id
    //   JOIN system_users su ON ce.treating_clinician_id = su.user_id
    //   WHERE ce.encounter_id = ?
    // `;
    const query = `
      SELECT 
        ce.encounter_id as id,
        ce.patient_record_id as patientId,
        CONCAT(pr.first_name, ' ', pr.last_name) as patientName,
        ce.treating_clinician_id,
        CONCAT(su.full_name) as clinicianName,
        ce.visit_type,
        ce.encounter_date as visitDate,
        ce.chief_complaint,
        ce.subjective_assessment,
        ce.objective_findings,
        ce.clinical_assessment,
        ce.treatment_plan,
        ce.vital_signs,
        ce.followup_instructions,
        ce.next_visit_date,
        ce.encounter_status as status,
        ce.visit_duration as duration,
        ce.created_at,
        -- Get diagnoses as JSON array
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'diagnosis_id', pd.diagnosis_id,
              'diagnosis_name', pd.diagnosis_name,
              'diagnosis_code', pd.diagnosis_code,
              'diagnosis_type', pd.diagnosis_type,
              'diagnosis_date', pd.diagnosis_date,
              'resolved_date', pd.resolved_date,
              'status', pd.status,
              'notes', pd.notes
            )
          )
          FROM patient_diagnoses pd
          WHERE pd.clinical_encounter_id = ce.encounter_id
        ) as diagnoses,
        -- Get medications as JSON array
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'prescription_id', mp.prescription_id,
              'medication_name', mp.medication_name,
              'dosage_instructions', mp.dosage_instructions,
              'dosage_value', mp.dosage_value,
              'frequency', mp.frequency,
              'duration', mp.duration,
              'special_instructions', mp.special_instructions,
              'route_of_administration', mp.route_of_administration,
              'quantity_prescribed', mp.quantity_prescribed,
              'refills_authorized', mp.refills_authorized,
              'start_date', mp.start_date,
              'end_date', mp.end_date,
              'prescription_status', mp.prescription_status
            )
          )
          FROM medication_prescriptions mp
          WHERE mp.clinical_encounter_id = ce.encounter_id
        ) as prescribedMedications
      FROM clinical_encounters ce
      JOIN patient_records pr ON ce.patient_record_id = pr.patient_id
      JOIN system_users su ON ce.treating_clinician_id = su.user_id
      WHERE ce.encounter_id = ?
    `;
    
    
    const visits = await database.executeQuery(query, [visitId]);
    
    if (visits.length === 0) {
      return null;
    }

    const visit = visits[0];
    
    // Get diagnoses for this visit
    const diagnosesQuery = `
      SELECT diagnosis_name 
      FROM patient_diagnoses 
      WHERE clinical_encounter_id = ? AND status != 'resolved'
    `;
    const diagnoses = await database.executeQuery(diagnosesQuery, [visitId]);
    visit.diagnosis = diagnoses.map(d => d.diagnosis_name);

    // Get prescriptions for this visit
    const prescriptionsQuery = `
      SELECT 
        medication_name as name,
        dosage_value as dosage,
        frequency,
        duration,
        special_instructions as instructions
      FROM medication_prescriptions 
      WHERE clinical_encounter_id = ? AND prescription_status = 'active'
    `;
    const prescriptions = await database.executeQuery(prescriptionsQuery, [visitId]);
    visit.prescribedMedications = prescriptions;

    return visit;
  }

  async createVisit(visitData) {
    // Verify patient exists
    const patientQuery = `SELECT patient_id FROM patient_records WHERE patient_id = ?`;
    const patients = await database.executeQuery(patientQuery, [visitData.patient_record_id]);
    
    if (patients.length === 0) {
      throw new Error('Patient not found');
    }

    const insertQuery = `
      INSERT INTO clinical_encounters (
        patient_record_id, treating_clinician_id, visit_type, encounter_date,
        chief_complaint, subjective_assessment, objective_findings,
        clinical_assessment, treatment_plan, vital_signs, followup_instructions,
        next_visit_date, encounter_status, visit_duration
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await database.executeQuery(insertQuery, [
      visitData.patient_record_id,
      visitData.treating_clinician_id,
      visitData.visit_type || 'routine',
      visitData.encounter_date || new Date(),
      visitData.chief_complaint || null,
      visitData.subjective_assessment || null,
      visitData.objective_findings || null,
      visitData.clinical_assessment || null,
      visitData.treatment_plan || null,
      visitData.vital_signs ? JSON.stringify(visitData.vital_signs) : null,
      visitData.followup_instructions || null,
      visitData.next_visit_date || null,
      visitData.encounter_status || 'completed',
      visitData.visit_duration || null
    ]);

    const visitId = result.insertId;

    //Insert dignosis
    if (visitData.diagnosis && Array.isArray(visitData.diagnosis)) {
      for (const diagnosisName of visitData.diagnosis) {
        const diagnosisQuery = `
          INSERT INTO patient_diagnoses (
            patient_record_id, clinical_encounter_id, diagnosis_name, 
            diagnosis_date, status, diagnosis_type
          ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        await database.executeQuery(diagnosisQuery, [
          visitData.patient_record_id,
          visitId,
          diagnosisName,
          visitData.encounter_date || new Date(),
          'active',
          'primary'
        ]);
      }
    }
    //Insert prescriptions
    if (visitData.prescribedMedications && Array.isArray(visitData.prescribedMedications)) {
      for (const medication of visitData.prescribedMedications) {
        const medicationQuery = `
          INSERT INTO medication_prescriptions (
            clinical_encounter_id, medication_name, dosage_instructions,
            dosage_value, frequency, duration, special_instructions,
            route_of_administration, quantity_prescribed, refills_authorized,
            start_date, end_date, prescription_status, prescribed_by_clinician
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const dosageInstructions = `${medication.dosage} ${medication.frequency} for ${medication.duration}`;
        
        await database.executeQuery(medicationQuery, [
          visitId,
          medication.name,
          dosageInstructions,
          medication.dosage,
          medication.frequency,
          medication.duration,
          medication.special_instructions || null,
          medication.route || 'oral', // Default to oral if not specified
          medication.quantity || null,
          medication.refills || 0,
          visitData.encounter_date || new Date(),
          medication.end_date || null,
          'active',
          visitData.treating_clinician_id
        ]);
      }
    }
    // Update patient's last visit date
    const patientService = require('./patient.service');
    await patientService.updateLastVisitDate(visitData.patient_record_id, new Date());

    return this.getVisitById(visitId);
  }

  async updateVisit(visitId, updateData) {
    const existingVisit = await this.getVisitById(visitId);
    if (!existingVisit) {
      return null;
    }

    const updateFields = [];
    const updateValues = [];

    const fieldMappings = {
      visit_type: 'visit_type',
      chief_complaint: 'chief_complaint',
      subjective_assessment: 'subjective_assessment',
      objective_findings: 'objective_findings',
      clinical_assessment: 'clinical_assessment',
      treatment_plan: 'treatment_plan',
      vital_signs: 'vital_signs',
      followup_instructions: 'followup_instructions',
      next_visit_date: 'next_visit_date',
      encounter_status: 'encounter_status',
      visit_duration: 'visit_duration'
    };

    Object.keys(fieldMappings).forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields.push(`${fieldMappings[field]} = ?`);
        if (field === 'vital_signs' && updateData[field]) {
          updateValues.push(JSON.stringify(updateData[field]));
        } else {
          updateValues.push(updateData[field]);
        }
      }
    });

    if (updateFields.length === 0) {
      return existingVisit;
    }

    updateValues.push(visitId);

    const updateQuery = `
      UPDATE clinical_encounters 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE encounter_id = ?
    `;

    await database.executeQuery(updateQuery, updateValues);
    return this.getVisitById(visitId);
  }

  async deleteVisit(visitId) {
    const existingVisit = await this.getVisitById(visitId);
    if (!existingVisit) {
      return null;
    }

    // Delete associated prescriptions
    const deletePrescriptionsQuery = `DELETE FROM medication_prescriptions WHERE clinical_encounter_id = ?`;
    await database.executeQuery(deletePrescriptionsQuery, [visitId]);

    // Delete associated diagnoses
    const deleteDiagnosesQuery = `DELETE FROM patient_diagnoses WHERE clinical_encounter_id = ?`;
    await database.executeQuery(deleteDiagnosesQuery, [visitId]);

    // Delete the visit
    const deleteQuery = `DELETE FROM clinical_encounters WHERE encounter_id = ?`;
    const result = await database.executeQuery(deleteQuery, [visitId]);
    
    return result.affectedRows > 0;
  }

  async getRecentVisits(limit = 10) {
    const query = `
      SELECT 
        ce.encounter_id as id,
        ce.patient_record_id as patientId,
        CONCAT(pr.first_name, ' ', pr.last_name) as patientName,
        ce.encounter_date as visitDate,
        ce.clinical_assessment,
        ce.encounter_status as status,
        ce.visit_duration as duration
      FROM clinical_encounters ce
      JOIN patient_records pr ON ce.patient_record_id = pr.patient_id
      ORDER BY ce.encounter_date DESC
      LIMIT ?
    `;
    
    return await database.executeQuery(query, [limit]);
  }

  async getDashboardData() {
    const stats = await this.getDashboardStats();
    const recentVisits = await this.getRecentVisits(5);
    
    // Get chart data
    const visitsChartQuery = `
      SELECT 
        DATE_FORMAT(encounter_date, '%Y-%m-%d') as name,
        COUNT(*) as visits
      FROM clinical_encounters 
      WHERE encounter_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(encounter_date)
      ORDER BY encounter_date
      LIMIT 7
    `;
    
    const diagnosisChartQuery = `
      SELECT 
        diagnosis_name as name,
        COUNT(*) as value
      FROM patient_diagnoses 
      WHERE status = 'active'
      GROUP BY diagnosis_name
      ORDER BY COUNT(*) DESC
      LIMIT 5
    `;
    
    const medicationsChartQuery = `
      SELECT 
        medication_name as name,
        COUNT(*) as prescriptions
      FROM medication_prescriptions 
      WHERE prescription_status = 'active'
      GROUP BY medication_name
      ORDER BY COUNT(*) DESC
      LIMIT 5
    `;

    const [visitsChart, diagnosisChart, medicationsChart] = await Promise.all([
      database.executeQuery(visitsChartQuery),
      database.executeQuery(diagnosisChartQuery),
      database.executeQuery(medicationsChartQuery)
    ]);

    return {
      stats,
      recentVisits,
      charts: {
        visits: visitsChart,
        diagnosis: diagnosisChart,
        medications: medicationsChart
      }
    };
  }

  async getDashboardStats() {
    const patientCountQuery = `SELECT COUNT(*) as count FROM patient_records WHERE patient_status = 'Active'`;
    const visitsTodayQuery = `
      SELECT COUNT(*) as count FROM clinical_encounters 
      WHERE DATE(encounter_date) = CURDATE()
    `;
    const prescriptionsQuery = `SELECT COUNT(*) as count FROM medication_prescriptions WHERE prescription_status = 'active'`;
    
    const [patientResult, visitsResult, prescriptionsResult] = await Promise.all([
      database.executeQuery(patientCountQuery),
      database.executeQuery(visitsTodayQuery),
      database.executeQuery(prescriptionsQuery)
    ]);

    // Calculate growth (mock data for now - in real app, compare with previous period)
    const growth = 15; // This would be calculated based on previous period data

    return {
      patients: patientResult[0].count,
      visitsToday: visitsResult[0].count,
      prescriptions: prescriptionsResult[0].count,
      growth: growth
    };
  }

  async addDiagnosisToVisit(visitId, diagnosisData) {
    const insertQuery = `
      INSERT INTO patient_diagnoses (
        patient_record_id, clinical_encounter_id, diagnosis_name, 
        diagnosis_type, diagnosis_date, status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const visit = await this.getVisitById(visitId);
    if (!visit) {
      throw new Error('Visit not found');
    }

    await database.executeQuery(insertQuery, [
      visit.patientId,
      visitId,
      diagnosisData.diagnosis_name,
      diagnosisData.diagnosis_type || 'primary',
      diagnosisData.diagnosis_date || new Date(),
      diagnosisData.status || 'active'
    ]);
  }

  async addPrescriptionToVisit(visitId, prescriptionData) {
    const insertQuery = `
      INSERT INTO medication_prescriptions (
        clinical_encounter_id, medication_name, dosage_instructions,
        dosage_value, frequency, duration, special_instructions,
        route_of_administration, quantity_prescribed, refills_authorized,
        start_date, end_date, prescription_status, prescribed_by_clinician
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const visit = await this.getVisitById(visitId);
    if (!visit) {
      throw new Error('Visit not found');
    }

    await database.executeQuery(insertQuery, [
      visitId,
      prescriptionData.medication_name,
      prescriptionData.dosage_instructions || `${prescriptionData.dosage_value} ${prescriptionData.frequency} for ${prescriptionData.duration}`,
      prescriptionData.dosage_value,
      prescriptionData.frequency,
      prescriptionData.duration,
      prescriptionData.special_instructions,
      prescriptionData.route_of_administration || 'oral',
      prescriptionData.quantity_prescribed,
      prescriptionData.refills_authorized || 0,
      prescriptionData.start_date || new Date(),
      prescriptionData.end_date,
      prescriptionData.prescription_status || 'active',
      prescriptionData.prescribed_by_clinician || visit.treating_clinician_id
    ]);
  }
}

module.exports = new VisitService();