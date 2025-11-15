const patientService = require('../services/patient.service');

async function handleCreatePatient(request, response) {
  try {
    const clinicianId = request.user.userId;
    const patientData = request.body;

    const requiredFields = ['first_name', 'last_name', 'date_of_birth', 'gender'];
    const missingFields = requiredFields.filter(field => !patientData[field]);

    if (missingFields.length > 0) {
      return response.status(400).json({
        error: 'Missing required patient information',
        missing_fields: missingFields
      });
    }

    const creationResult = await patientService.createNewPatientRecord(patientData, clinicianId);

    response.status(201).json({
      success: true,
      message: 'Patient record created successfully',
      patient: creationResult
    });

  } catch (error) {
    console.error('Patient creation error:', error.message);
    
    response.status(500).json({
      error: 'Failed to create patient record',
      details: 'System encountered an unexpected error'
    });
  }
}

async function handleGetPatients(request, response) {
  try {
    const {
      page = 1,
      limit = 25,
      search = '',
      provider = null
    } = request.query;

    const patientsResult = await patientService.retrievePatientList({
      page_number: parseInt(page),
      items_per_page: parseInt(limit),
      search_query: search,
      provider_filter: provider
    });

    response.json({
      success: true,
      data: patientsResult.patients,
      pagination: patientsResult.pagination
    });

  } catch (error) {
    console.error('Patient retrieval error:', error.message);
    
    response.status(500).json({
      error: 'Failed to retrieve patient records',
      details: 'Database query failed'
    });
  }
}

async function handleGetPatientDetails(request, response) {
  try {
    const patientId = parseInt(request.params.patientId);
    
    if (isNaN(patientId)) {
      return response.status(400).json({
        error: 'Invalid patient identifier provided'
      });
    }

    const patientDetails = await patientService.getPatientDetailedRecord(patientId);
    const clinicalSummary = await patientService.getPatientClinicalSummary(patientId);

    response.json({
      success: true,
      patient: patientDetails,
      clinical_summary: clinicalSummary
    });

  } catch (error) {
    console.error('Patient details error:', error.message);
    
    if (error.message.includes('not found')) {
      return response.status(404).json({
        error: 'Patient record not found'
      });
    }

    response.status(500).json({
      error: 'Failed to retrieve patient information'
    });
  }
}

async function handleUpdatePatient(request, response) {
  try {
    const patientId = parseInt(request.params.patientId);
    const updateData = request.body;
    const clinicianId = request.user.userId;

    if (isNaN(patientId)) {
      return response.status(400).json({
        error: 'Invalid patient identifier provided'
      });
    }

    const updateResult = await patientService.updatePatientInformation(
      patientId, 
      updateData, 
      clinicianId
    );

    response.json({
      success: true,
      message: 'Patient information updated successfully',
      update_result: updateResult
    });

  } catch (error) {
    console.error('Patient update error:', error.message);
    
    if (error.message.includes('non-existent')) {
      return response.status(404).json({
        error: 'Cannot update non-existent patient record'
      });
    }

    response.status(500).json({
      error: 'Failed to update patient record',
      details: error.message
    });
  }
}

module.exports = {
  handleCreatePatient,
  handleGetPatients,
  handleGetPatientDetails,
  handleUpdatePatient
};