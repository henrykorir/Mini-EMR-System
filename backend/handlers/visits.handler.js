const visitService = require('../services/visit.service');

async function handleGetVisits(request, response) {
  try {
    const visits = await visitService.getAllVisits();
    
    response.json({
      success: true,
      data: visits,
      count: visits.length
    });

  } catch (error) {
    console.error('Get visits error:', error.message);
    
    response.status(500).json({
      error: 'Failed to retrieve clinical visits',
      details: 'Please try again later'
    });
  }
}

async function handleGetPatientVisits(request, response) {
  try {
    const { patientId } = request.params;
    
    if (!patientId) {
      return response.status(400).json({
        error: 'Patient ID is required'
      });
    }

    const visits = await visitService.getVisitsByPatientId(patientId);

    response.json({
      success: true,
      data: visits,
      count: visits.length,
      patient_id: patientId
    });

  } catch (error) {
    console.error('Get patient visits error:', error.message);
    
    response.status(500).json({
      error: 'Failed to retrieve patient visits',
      details: 'Please try again later'
    });
  }
}

async function handleGetVisitDetails(request, response) {
  try {
    const { id } = request.params;
    
    if (!id) {
      return response.status(400).json({
        error: 'Visit ID is required'
      });
    }

    const visit = await visitService.getVisitById(id);
    
    if (!visit) {
      return response.status(404).json({
        error: 'Clinical visit not found',
        details: `No visit found with ID: ${id}`
      });
    }

    response.json({
      success: true,
      data: visit
    });

  } catch (error) {
    console.error('Get visit details error:', error.message);
    
    response.status(500).json({
      error: 'Failed to retrieve visit details',
      details: 'Please try again later'
    });
  }
}

async function handleCreateVisit(request, response) {
  try {
    const {
      patient_record_id,
      treating_clinician_id,
      visit_type,
      chief_complaint,
      subjective_assessment,
      objective_findings,
      clinical_assessment,
      treatment_plan,
      vital_signs,
      followup_instructions,
      next_visit_date,
      visit_duration
    } = request.body;

    // Required field validation
    if (!patient_record_id || !treating_clinician_id) {
      return response.status(400).json({
        error: 'Missing required fields',
        details: 'Patient ID and treating clinician ID are mandatory'
      });
    }

    const newVisit = await visitService.createVisit({
      patient_record_id,
      treating_clinician_id: treating_clinician_id || request.user.user_id,
      visit_type,
      chief_complaint,
      subjective_assessment,
      objective_findings,
      clinical_assessment,
      treatment_plan,
      vital_signs,
      followup_instructions,
      next_visit_date,
      visit_duration
    });

    response.status(201).json({
      success: true,
      message: 'Clinical visit recorded successfully',
      data: newVisit
    });

  } catch (error) {
    console.error('Create visit error:', error.message);
    
    if (error.message.includes('Patient not found')) {
      return response.status(404).json({
        error: 'Visit creation failed',
        details: error.message
      });
    }

    response.status(500).json({
      error: 'Visit recording service unavailable',
      details: 'Please try again later'
    });
  }
}

async function handleUpdateVisit(request, response) {
  try {
    const { id } = request.params;
    const updateData = request.body;

    if (!id) {
      return response.status(400).json({
        error: 'Visit ID is required'
      });
    }

    const updatedVisit = await visitService.updateVisit(id, updateData);
    
    if (!updatedVisit) {
      return response.status(404).json({
        error: 'Clinical visit not found',
        details: `No visit found with ID: ${id}`
      });
    }

    response.json({
      success: true,
      message: 'Clinical visit updated successfully',
      data: updatedVisit
    });

  } catch (error) {
    console.error('Update visit error:', error.message);
    
    response.status(500).json({
      error: 'Failed to update clinical visit',
      details: 'Please try again later'
    });
  }
}

async function handleDeleteVisit(request, response) {
  try {
    const { id } = request.params;

    if (!id) {
      return response.status(400).json({
        error: 'Visit ID is required'
      });
    }

    const result = await visitService.deleteVisit(id);
    
    if (!result) {
      return response.status(404).json({
        error: 'Clinical visit not found',
        details: `No visit found with ID: ${id}`
      });
    }

    response.json({
      success: true,
      message: 'Clinical visit deleted successfully'
    });

  } catch (error) {
    console.error('Delete visit error:', error.message);
    
    response.status(500).json({
      error: 'Failed to delete clinical visit',
      details: 'Please try again later'
    });
  }
}

async function handleGetRecentVisits(request, response) {
  try {
    const { limit = 10 } = request.query;
    
    const visits = await visitService.getRecentVisits(parseInt(limit));

    response.json({
      success: true,
      data: visits,
      count: visits.length,
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('Get recent visits error:', error.message);
    
    response.status(500).json({
      error: 'Failed to retrieve recent visits',
      details: 'Please try again later'
    });
  }
}

async function handleGetDashboardData(request, response) {
  try {
    const dashboardData = await visitService.getDashboardData();

    response.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard data error:', error.message);
    
    response.status(500).json({
      error: 'Failed to retrieve dashboard data',
      details: 'Please try again later'
    });
  }
}

async function handleGetDashboardStats(request, response) {
  try {
    const stats = await visitService.getDashboardStats();

    response.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error.message);
    
    response.status(500).json({
      error: 'Failed to retrieve dashboard statistics',
      details: 'Please try again later'
    });
  }
}

module.exports = {
  handleGetVisits,
  handleGetPatientVisits,
  handleGetVisitDetails,
  handleCreateVisit,
  handleUpdateVisit,
  handleDeleteVisit,
  handleGetRecentVisits,
  handleGetDashboardData,
  handleGetDashboardStats
};