// src/components/visits/VisitDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, User, Stethoscope, Pill, FileText, 
  Edit, Printer, Download, Heart, TrendingUp, Clock,
  MapPin, Phone, Mail, AlertTriangle
} from 'lucide-react';
import { visitsAPI, patientsAPI } from '../../services/api';
import { useToast } from '../common/Toast';

const VisitDetails = () => {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const [visit, setVisit] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchVisitDetails();
  }, [visitId]);

  const fetchVisitDetails = async () => {
    try {
      setLoading(true);
      const visitData = await visitsAPI.getById(visitId);
      const patientData = await patientsAPI.getById(visitData.patientId);
      
      setVisit(visitData);
      setPatient(patientData);
    } catch (error) {
      showToast('Error loading visit details', 'error');
      navigate('/visits');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    showToast('Export feature coming soon', 'info');
  };

  if (loading) {
    return (
      <div className="visit-details-loading">
        <div className="loading-spinner large"></div>
        <p>Loading visit details...</p>
      </div>
    );
  }

  if (!visit || !patient) {
    return (
      <div className="visit-not-found">
        <AlertTriangle size={48} />
        <h2>Visit Not Found</h2>
        <p>The visit record you're looking for doesn't exist.</p>
        <Link to="/visits" className="btn btn-primary">
          <ArrowLeft size={20} />
          Back to Visits
        </Link>
      </div>
    );
  }

  return (
    <div className="visit-details">
      {/* Header */}
      <div className="visit-header">
        <div className="header-left">
          <Link to="/visits" className="btn btn-outline btn-sm">
            <ArrowLeft size={16} />
            Back to Visits
          </Link>
          <div className="visit-title">
            <h1>Clinical Visit Record</h1>
            <div className="visit-meta">
              <span className="visit-id">#{visit.id}</span>
              <span className="visit-date">
                <Calendar size={16} />
                {visit.visitDate}
              </span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={20} />
            Print
          </button>
          <button className="btn btn-outline" onClick={handleExport}>
            <Download size={20} />
            Export
          </button>
          <Link 
            to={`/visits/edit/${visitId}`}
            className="btn btn-primary"
          >
            <Edit size={20} />
            Edit Visit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="visit-content">
        <div className="content-grid">
          {/* Patient Information */}
          <div className="info-section patient-info">
            <h2>
              <User size={20} />
              Patient Information
            </h2>
            <div className="info-card">
              <div className="patient-header">
                <div className="patient-avatar large">
                  {patient.name.charAt(0)}
                </div>
                <div className="patient-details">
                  <h3>{patient.name}</h3>
                  <div className="patient-meta">
                    <span>ID: {patient.id}</span>
                    <span>•</span>
                    <span>{patient.gender}</span>
                    {patient.bloodType && (
                      <>
                        <span>•</span>
                        <span className="blood-type">
                          <Heart size={14} />
                          {patient.bloodType}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="contact-info">
                {patient.contact && (
                  <div className="contact-item">
                    <Phone size={16} />
                    <span>{patient.contact}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="contact-item">
                    <MapPin size={16} />
                    <span>{patient.address}</span>
                  </div>
                )}
              </div>
              <Link 
                to={`/patients/${patient.id}`}
                className="view-profile-link"
              >
                View Full Patient Profile →
              </Link>
            </div>
          </div>

          {/* Visit Summary */}
          <div className="info-section visit-summary">
            <h2>
              <Stethoscope size={20} />
              Visit Summary
            </h2>
            <div className="info-card">
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-icon">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <label>Visit Date</label>
                    <span>{visit.visitDate}</span>
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-icon">
                    <Clock size={20} />
                  </div>
                  <div>
                    <label>Status</label>
                    <span className={`status-badge status-${visit.status || 'completed'}`}>
                      {visit.status || 'Completed'}
                    </span>
                  </div>
                </div>
                {visit.duration && (
                  <div className="summary-item">
                    <div className="summary-icon">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <label>Duration</label>
                      <span>{visit.duration}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          {visit.vitalSigns && Object.values(visit.vitalSigns).some(val => val) && (
            <div className="info-section vital-signs">
              <h2>Vital Signs</h2>
              <div className="info-card">
                <div className="vitals-grid">
                  {visit.vitalSigns.bloodPressure && (
                    <div className="vital-item">
                      <label>Blood Pressure</label>
                      <span className="vital-value">{visit.vitalSigns.bloodPressure}</span>
                      <span className="vital-unit">mmHg</span>
                    </div>
                  )}
                  {visit.vitalSigns.heartRate && (
                    <div className="vital-item">
                      <label>Heart Rate</label>
                      <span className="vital-value">{visit.vitalSigns.heartRate}</span>
                      <span className="vital-unit">BPM</span>
                    </div>
                  )}
                  {visit.vitalSigns.temperature && (
                    <div className="vital-item">
                      <label>Temperature</label>
                      <span className="vital-value">{visit.vitalSigns.temperature}</span>
                      <span className="vital-unit">°C</span>
                    </div>
                  )}
                  {visit.vitalSigns.oxygenSaturation && (
                    <div className="vital-item">
                      <label>O₂ Saturation</label>
                      <span className="vital-value">{visit.vitalSigns.oxygenSaturation}</span>
                      <span className="vital-unit">%</span>
                    </div>
                  )}
                  {visit.vitalSigns.respiratoryRate && (
                    <div className="vital-item">
                      <label>Respiratory Rate</label>
                      <span className="vital-value">{visit.vitalSigns.respiratoryRate}</span>
                      <span className="vital-unit">breaths/min</span>
                    </div>
                  )}
                  {visit.vitalSigns.weight && (
                    <div className="vital-item">
                      <label>Weight</label>
                      <span className="vital-value">{visit.vitalSigns.weight}</span>
                      <span className="vital-unit">kg</span>
                    </div>
                  )}
                  {visit.vitalSigns.height && (
                    <div className="vital-item">
                      <label>Height</label>
                      <span className="vital-value">{visit.vitalSigns.height}</span>
                      <span className="vital-unit">cm</span>
                    </div>
                  )}
                  {visit.vitalSigns.bmi && (
                    <div className="vital-item">
                      <label>BMI</label>
                      <span className="vital-value">{visit.vitalSigns.bmi}</span>
                      <span className="vital-unit">kg/m²</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Diagnosis */}
          <div className="info-section diagnosis">
            <h2>Diagnosis</h2>
            <div className="info-card">
              <div className="diagnosis-list">
                {visit.diagnosis.map((dx, index) => (
                  <div key={index} className="diagnosis-item">
                    <Stethoscope size={16} />
                    <span>{dx}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Medications */}
          {visit.prescribedMedications && visit.prescribedMedications.length > 0 && (
            <div className="info-section medications">
              <h2>
                <Pill size={20} />
                Prescribed Medications
              </h2>
              <div className="info-card">
                <div className="medications-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Medication</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visit.prescribedMedications.map((med, index) => (
                        <tr key={index}>
                          <td>
                            <div className="med-name">
                              <Pill size={14} />
                              {med.name}
                            </div>
                          </td>
                          <td>{med.dosage}</td>
                          <td>{med.frequency}</td>
                          <td>{med.duration}</td>
                          <td>{med.instructions || 'Take as directed'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Clinical Notes */}
          {visit.notes && (
            <div className="info-section clinical-notes">
              <h2>
                <FileText size={20} />
                Clinical Notes
              </h2>
              <div className="info-card">
                <div className="notes-content">
                  {visit.notes.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Treatment Plan */}
          {visit.treatmentPlan && (
            <div className="info-section treatment-plan">
              <h2>Treatment Plan</h2>
              <div className="info-card">
                <div className="treatment-content">
                  {visit.treatmentPlan.split('\n').map((item, index) => (
                    <p key={index}>{item}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Follow-up Instructions */}
          {visit.followUp && (
            <div className="info-section follow-up">
              <h2>Follow-up Instructions</h2>
              <div className="info-card">
                <div className="follow-up-content">
                  {visit.followUp.split('\n').map((instruction, index) => (
                    <div key={index} className="instruction-item">
                      <span className="instruction-number">{index + 1}.</span>
                      <span>{instruction}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="visit-footer">
        <div className="footer-actions">
          <Link 
            to={`/visits?patientId=${patient.id}`}
            className="btn btn-primary"
          >
            New Visit for {patient.name}
          </Link>
          <Link 
            to={`/patients/${patient.id}`}
            className="btn btn-outline"
          >
            View Patient Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VisitDetails;