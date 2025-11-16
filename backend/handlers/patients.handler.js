const patientService = require('../services/patient.service');

async function handleGetPatients(request, response) {
  try {
    const patients = await patientService.getAllPatients();
    
    response.json({
      success: true,
      data: patients,
      count: patients.length
    });

  } catch (error) {
    console.error('Get patients error:', error.message);
    
    response.status(500).json({
      error: 'Failed to retrieve patient records',
      details: 'Please try again later'
    });
  }
}

async function handleGetPatientDetails(request, response) {
  try {
    const { id } = request.params;
    
    if (!id) {
      return response.status(400).json({
        error: 'Patient ID is required'
      });
    }

    const patient = await patientService.getPatientById(id);
    
    if (!patient) {
      return response.status(404).json({
        error: 'Patient record not found',
        details: `No patient found with ID: ${id}`
      });
    }

    response.json({
      success: true,
      data: patient
    });

  } catch (error) {
    console.error('Get patient details error:', error.message);
    
    response.status(500).json({
      error: 'Failed to retrieve patient details',
      details: 'Please try again later'
    });
  }
}

async function handleCreatePatient(request, response) {
  try {
    const {
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
      blood_type
    } = request.body;

    // Required field validation
    if (!medical_record_number || !first_name || !last_name || !date_of_birth || !gender) {
      return response.status(400).json({
        error: 'Missing required fields',
        details: 'Medical record number, first name, last name, date of birth, and gender are mandatory'
      });
    }

    const newPatient = await patientService.createPatient({
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
      created_by_user: request.user.user_id
    });

    response.status(201).json({
      success: true,
      message: 'Patient record created successfully',
      data: newPatient
    });

  } catch (error) {
    console.error('Create patient error:', error.message);
    
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      return response.status(409).json({
        error: 'Patient registration failed',
        details: error.message
      });
    }

    response.status(500).json({
      error: 'Patient registration service unavailable',
      details: 'Please try again later'
    });
  }
}

async function handleUpdatePatient(request, response) {
  try {
    const { id } = request.params;
    const updateData = request.body;

    if (!id) {
      return response.status(400).json({
        error: 'Patient ID is required'
      });
    }

    const updatedPatient = await patientService.updatePatient(id, updateData);
    
    if (!updatedPatient) {
      return response.status(404).json({
        error: 'Patient record not found',
        details: `No patient found with ID: ${id}`
      });
    }

    response.json({
      success: true,
      message: 'Patient record updated successfully',
      data: updatedPatient
    });

  } catch (error) {
    console.error('Update patient error:', error.message);
    
    response.status(500).json({
      error: 'Failed to update patient record',
      details: 'Please try again later'
    });
  }
}

async function handleDeletePatient(request, response) {
  try {
    const { id } = request.params;

    if (!id) {
      return response.status(400).json({
        error: 'Patient ID is required'
      });
    }

    const result = await patientService.deletePatient(id);
    
    if (!result) {
      return response.status(404).json({
        error: 'Patient record not found',
        details: `No patient found with ID: ${id}`
      });
    }

    response.json({
      success: true,
      message: 'Patient record deleted successfully'
    });

  } catch (error) {
    console.error('Delete patient error:', error.message);
    
    response.status(500).json({
      error: 'Failed to delete patient record',
      details: 'Please try again later'
    });
  }
}

async function handleSearchPatients(request, response) {
  try {
    const { q } = request.query;

    if (!q || q.trim().length < 2) {
      return response.status(400).json({
        error: 'Search query required',
        details: 'Please provide a search term with at least 2 characters'
      });
    }

    const patients = await patientService.searchPatients(q.trim());

    response.json({
      success: true,
      data: patients,
      count: patients.length,
      search_query: q
    });

  } catch (error) {
    console.error('Search patients error:', error.message);
    
    response.status(500).json({
      error: 'Search service unavailable',
      details: 'Please try again later'
    });
  }
}

module.exports = {
  handleGetPatients,
  handleGetPatientDetails,
  handleCreatePatient,
  handleUpdatePatient,
  handleDeletePatient,
  handleSearchPatients
};