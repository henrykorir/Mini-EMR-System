// src/components/patients/PatientProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, Calendar, Phone, Mail, MapPin, Heart, AlertTriangle, 
  Edit, Plus, FileText, ArrowLeft, Calendar as CalendarIcon,
  Pill, Stethoscope, Clock
} from 'lucide-react';
import { patientsAPI, visitsAPI } from '../../services/api';
import { useToast } from '../common/Toast';
import { calculateAge } from '../../utils/dateUtils';
import { getBloodTypeColor } from '../../utils/bloodTypeUtils'

const PatientProfile = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const [patientData, visitsData] = await Promise.all([
        patientsAPI.getById(patientId),
        visitsAPI.getByPatientId(patientId)
      ]);
      setPatient(patientData);
      setVisits(visitsData);
    } catch (error) {
      showToast('Error loading patient data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="patient-profile-loading">
        <div className="loading-spinner large"></div>
        <p>Loading patient profile...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patient-not-found">
        <AlertTriangle size={48} />
        <h2>Patient Not Found</h2>
        <p>The patient you're looking for doesn't exist.</p>
        <Link to="/patients" className="btn btn-primary">
          <ArrowLeft size={20} />
          Back to Patients
        </Link>
      </div>
    );
  }

  return (
    <div className="patient-profile">
      {/* Header */}
      <div className="profile-header">
        <div className="header-left">
          <Link to="/patients" className="btn btn-outline btn-sm">
            <ArrowLeft size={16} />
            Back to Patients
          </Link>
          <div className="patient-basic-info">
            <div className="patient-avatar large">
              {patient.name.charAt(0)}
            </div>
            <div className="patient-details">
              <h1>{patient.name}</h1>
              <div className="patient-meta">
                <span className="patient-id">ID: {patient.id}</span>
                <span className="patient-age">
                  {calculateAge(patient.dateOfBirth)} years • {patient.gender}
                </span>
                {patient.bloodType && (
                  <span className={`blood-type ${getBloodTypeColor(patient.bloodType)}`}>
                    <Heart size={14} />
                    {patient.bloodType}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <Link 
            to={`/visits?patientId=${patientId}`}
            className="btn btn-primary"
          >
            <Plus size={20} />
            New Visit
          </Link>
          <Link 
            to={`/patients/edit/${patientId}`}
            className="btn btn-outline"
          >
            <Edit size={20} />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <User size={18} />
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'visits' ? 'active' : ''}`}
          onClick={() => setActiveTab('visits')}
        >
          <Stethoscope size={18} />
          Clinical Visits ({visits.length})
        </button>
        <button 
          className={`tab ${activeTab === 'medical' ? 'active' : ''}`}
          onClick={() => setActiveTab('medical')}
        >
          <FileText size={18} />
          Medical History
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && <OverviewTab patient={patient} visits={visits} />}
        {activeTab === 'visits' && <VisitsTab visits={visits} patientId={patientId} />}
        {activeTab === 'medical' && <MedicalTab patient={patient} />}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ patient, visits }) => {
  const recentVisits = visits.slice(0, 5);
  const lastVisit = visits[0];

  return (
    <div className="overview-tab">
      <div className="overview-grid">
        {/* Patient Information Card */}
        <div className="info-card">
          <h3>Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <Calendar size={18} />
              <div>
                <label>Date of Birth</label>
                <span>{patient.dateOfBirth} ({calculateAge(patient.dateOfBirth)} years)</span>
              </div>
            </div>
            <div className="info-item">
              <User size={18} />
              <div>
                <label>Gender</label>
                <span>{patient.gender}</span>
              </div>
            </div>
            <div className="info-item">
              <Phone size={18} />
              <div>
                <label>Contact</label>
                <span>{patient.contact}</span>
              </div>
            </div>
            {patient.emergencyContact && (
              <div className="info-item">
                <AlertTriangle size={18} />
                <div>
                  <label>Emergency Contact</label>
                  <span>{patient.emergencyContact}</span>
                </div>
              </div>
            )}
            {patient.address && (
              <div className="info-item full-width">
                <MapPin size={18} />
                <div>
                  <label>Address</label>
                  <span>{patient.address}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Medical Summary Card */}
        <div className="info-card">
          <h3>Medical Summary</h3>
          <div className="medical-summary">
            {patient.bloodType && (
              <div className="medical-item">
                <Heart size={18} />
                <div>
                  <label>Blood Type</label>
                  <span className={`blood-type-badge ${getBloodTypeColor(patient.bloodType)}`}>
                    {patient.bloodType}
                  </span>
                </div>
              </div>
            )}
            {patient.allergies && (
              <div className="medical-item">
                <AlertTriangle size={18} />
                <div>
                  <label>Allergies</label>
                  <span>{patient.allergies}</span>
                </div>
              </div>
            )}
            <div className="medical-item">
              <Stethoscope size={18} />
              <div>
                <label>Total Visits</label>
                <span>{visits.length} visits</span>
              </div>
            </div>
            {lastVisit && (
              <div className="medical-item">
                <Clock size={18} />
                <div>
                  <label>Last Visit</label>
                  <span>{lastVisit.visitDate}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="info-card full-width">
          <div className="card-header">
            <h3>Recent Clinical Visits</h3>
            <Link to={`/patients/${patient.id}?tab=visits`} className="view-all-link">
              View All
            </Link>
          </div>
          {recentVisits.length > 0 ? (
            <div className="recent-visits-list">
              {recentVisits.map(visit => (
                <div key={visit.id} className="recent-visit-item">
                  <div className="visit-date">
                    <CalendarIcon size={16} />
                    {visit.visitDate}
                  </div>
                  <div className="visit-diagnosis">
                    {visit.diagnosis.slice(0, 2).map(dx => (
                      <span key={dx} className="diagnosis-tag small">{dx}</span>
                    ))}
                    {visit.diagnosis.length > 2 && (
                      <span className="more-tag">+{visit.diagnosis.length - 2} more</span>
                    )}
                  </div>
                  <Link 
                    to={`/visits/${visit.id}`}
                    className="btn btn-sm btn-outline"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Stethoscope size={32} />
              <p>No clinical visits recorded</p>
              <Link 
                to={`/visits?patientId=${patient.id}`}
                className="btn btn-primary btn-sm"
              >
                <Plus size={16} />
                Record First Visit
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Visits Tab Component
const VisitsTab = ({ visits, patientId }) => {
  return (
    <div className="visits-tab">
      <div className="tab-header">
        <h3>Clinical Visit History</h3>
        <Link 
          to={`/visits?patientId=${patientId}`}
          className="btn btn-primary"
        >
          <Plus size={20} />
          New Visit
        </Link>
      </div>

      {visits.length > 0 ? (
        <div className="visits-timeline">
          {visits.map(visit => (
            <div key={visit.id} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="visit-header">
                  <div className="visit-date-badge">
                    <CalendarIcon size={16} />
                    {visit.visitDate}
                  </div>
                  <span className="visit-id">#{visit.id}</span>
                </div>
                
                <div className="visit-details">
                  <div className="diagnosis-section">
                    <strong>Diagnosis:</strong>
                    <div className="diagnosis-tags">
                      {visit.diagnosis.map(dx => (
                        <span key={dx} className="diagnosis-tag">{dx}</span>
                      ))}
                    </div>
                  </div>

                  {visit.prescribedMedications && visit.prescribedMedications.length > 0 && (
                    <div className="medications-section">
                      <strong>Medications:</strong>
                      <div className="medications-list">
                        {visit.prescribedMedications.map((med, index) => (
                          <div key={index} className="medication-item">
                            <Pill size={14} />
                            <span>
                              <strong>{med.name}</strong> {med.dosage} - {med.frequency} - {med.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {visit.notes && (
                    <div className="notes-section">
                      <strong>Clinical Notes:</strong>
                      <p className="visit-notes">{visit.notes}</p>
                    </div>
                  )}
                </div>

                <div className="visit-actions">
                  <Link 
                    to={`/visits/${visit.id}`}
                    className="btn btn-sm btn-outline"
                  >
                    <FileText size={16} />
                    View Full Record
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state large">
          <Stethoscope size={48} />
          <h3>No Clinical Visits</h3>
          <p>This patient hasn't had any clinical visits yet.</p>
          <Link 
            to={`/visits?patientId=${patientId}`}
            className="btn btn-primary"
          >
            <Plus size={20} />
            Record First Visit
          </Link>
        </div>
      )}
    </div>
  );
};

// Medical Tab Component
const MedicalTab = ({ patient }) => {
  return (
    <div className="medical-tab">
      <div className="medical-grid">
        {/* Allergies */}
        <div className="info-card">
          <h3>Allergies</h3>
          {patient.allergies ? (
            <div className="allergies-list">
              {patient.allergies.split(',').map((allergy, index) => (
                <div key={index} className="allergy-item">
                  <AlertTriangle size={16} />
                  <span>{allergy.trim()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state small">
              <p>No allergies recorded</p>
            </div>
          )}
        </div>

        {/* Medical History */}
        <div className="info-card">
          <h3>Medical History</h3>
          {patient.medicalHistory ? (
            <div className="medical-history">
              <p>{patient.medicalHistory}</p>
            </div>
          ) : (
            <div className="empty-state small">
              <p>No medical history recorded</p>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="info-card full-width">
          <h3>Additional Information</h3>
          <div className="additional-info">
            <div className="info-row">
              <label>Patient Since</label>
              <span>{patient.createdAt}</span>
            </div>
            <div className="info-row">
              <label>Status</label>
              <span className={`status-badge status-${patient.status?.toLowerCase() || 'active'}`}>
                {patient.status || 'Active'}
              </span>
            </div>
            {patient.idNumber && (
              <div className="info-row">
                <label>ID Number</label>
                <span>{patient.idNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;