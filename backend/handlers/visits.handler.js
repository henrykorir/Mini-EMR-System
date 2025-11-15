const clinicalService = require('../services/clinical.service');

async function handleCreateEncounter(request, response) {
  try {
    const clinicianId = request.user.userId;
    const encounterData = request.body;

    // Validate required fields
    const requiredFields = ['patient_record_id', 'chief_complaint', 'clinical_assessment'];
    const missingFields = requiredFields.filter(field => !encounterData[field]);

    if (missingFields.length > 0) {
      return response.status(400).json({
        error: 'Missing required clinical documentation',
        missing_fields: missingFields
      });
    }

    const creationResult = await clinicalService.recordClinicalEncounter(
      encounterData, 
      clinicianId
    );

    response.status(201).json({
      success: true,
      message: 'Clinical encounter documented successfully',
      encounter: creationResult
    });

  } catch (error) {
    console.error('Encounter creation error:', error.message);
    
    response.status(500).json({
      error: 'Failed to document clinical encounter',
      details: 'System encountered an unexpected error'
    });
  }
}

async function handleGetPatientEncounters(request, response) {
  try {
    const patientId = parseInt(request.params.patientId);
    const {
      page = 1,
      limit = 20,
      start_date = null,
      end_date = null
    } = request.query;

    if (isNaN(patientId)) {
      return response.status(400).json({
        error: 'Invalid patient identifier provided'
      });
    }

    const encountersResult = await clinicalService.getPatientEncounterHistory(patientId, {
      page_number: parseInt(page),
      items_per_page: parseInt(limit),
      date_from: start_date,
      date_to: end_date
    });

    response.json({
      success: true,
      data: encountersResult.encounters,
      pagination: encountersResult.pagination
    });

  } catch (error) {
    console.error('Encounters retrieval error:', error.message);
    
    response.status(500).json({
      error: 'Failed to retrieve clinical encounters',
      details: 'Database query failed'
    });
  }
}

async function handleGetEncounterDetails(request, response) {
  try {
    const encounterId = parseInt(request.params.encounterId);
    
    if (isNaN(encounterId)) {
      return response.status(400).json({
        error: 'Invalid encounter identifier provided'
      });
    }

    const encounterDetails = await clinicalService.getEncounterDetailedView(encounterId);

    response.json({
      success: true,
      encounter: encounterDetails.encounter_details,
      medications: encounterDetails.prescribed_medications
    });

  } catch (error) {
    console.error('Encounter details error:', error.message);
    
    if (error.message.includes('not found')) {
      return response.status(404).json({
        error: 'Clinical encounter not found'
      });
    }

    response.status(500).json({
      error: 'Failed to retrieve encounter details'
    });
  }
}

async function handleGetDashboardMetrics(request, response) {
  try {
    const clinicianId = request.user.role === 'administrator' ? null : request.user.userId;
    
    const dashboardData = await clinicalService.getSystemDashboardMetrics(clinicianId);

    response.json({
      success: true,
      metrics: dashboardData
    });

  } catch (error) {
    console.error('Dashboard metrics error:', error.message);
    
    response.status(500).json({
      error: 'Failed to retrieve system metrics',
      details: 'Analytics service unavailable'
    });
  }
}

module.exports = {
  handleCreateEncounter,
  handleGetPatientEncounters,
  handleGetEncounterDetails,
  handleGetDashboardMetrics
};