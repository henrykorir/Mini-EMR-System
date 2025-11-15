// src/components/visits/VisitHistory.js
import React from 'react';
import { Calendar, User, FileText, Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const VisitHistory = ({ visits, onNewVisit, loading }) => {
  if (loading) {
    return (
      <div className="table-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading visits...</p>
        </div>
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <FileText size={48} className="empty-icon" />
          <h3>No visits recorded</h3>
          <p>Start by creating a new clinical visit.</p>
          <button 
            className="btn btn-primary"
            onClick={() => onNewVisit()}
          >
            <Plus size={20} />
            New Visit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="visits-container">
      {visits.map(visit => (
        <div key={visit.id} className="visit-card detailed">
          <div className="visit-header">
            <div className="visit-patient">
              <div className="patient-avatar small">
                {visit.patientName.charAt(0)}
              </div>
              <div>
                <h4>{visit.patientName}</h4>
                <div className="visit-meta">
                  <Calendar size={14} />
                  <span>{visit.visitDate}</span>
                  <span className="visit-id">#{visit.id}</span>
                </div>
              </div>
            </div>
            <span className={`visit-status status-${visit.status}`}>
              {visit.status}
            </span>
          </div>

          <div className="visit-content">
            <div className="visit-section">
              <h5>Diagnosis</h5>
              <div className="diagnosis-tags">
                {visit.diagnosis.map(dx => (
                  <span key={dx} className="diagnosis-tag">
                    {dx}
                  </span>
                ))}
              </div>
            </div>

            {visit.prescribedMedications && visit.prescribedMedications.length > 0 && (
              <div className="visit-section">
                <h5>Medications</h5>
                <div className="medications-list">
                  {visit.prescribedMedications.map((med, index) => (
                    <div key={index} className="medication-item">
                      <strong>{med.name}</strong> {med.dosage} - {med.frequency} - {med.duration}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {visit.vitalSigns && (
              <div className="visit-section">
                <h5>Vital Signs</h5>
                <div className="vital-signs">
                  {visit.vitalSigns.bloodPressure && (
                    <div className="vital-sign">
                      <span className="label">BP:</span>
                      <span className="value">{visit.vitalSigns.bloodPressure}</span>
                    </div>
                  )}
                  {visit.vitalSigns.heartRate && (
                    <div className="vital-sign">
                      <span className="label">HR:</span>
                      <span className="value">{visit.vitalSigns.heartRate} BPM</span>
                    </div>
                  )}
                  {visit.vitalSigns.temperature && (
                    <div className="vital-sign">
                      <span className="label">Temp:</span>
                      <span className="value">{visit.vitalSigns.temperature}°C</span>
                    </div>
                  )}
                  {visit.vitalSigns.oxygenSaturation && (
                    <div className="vital-sign">
                      <span className="label">SpO₂:</span>
                      <span className="value">{visit.vitalSigns.oxygenSaturation}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {visit.notes && (
              <div className="visit-section">
                <h5>Clinical Notes</h5>
                <p className="visit-notes">{visit.notes}</p>
              </div>
            )}
          </div>

          <div className="visit-actions">
            <Link 
              to={`/visits/${visit.id}`}
              className="btn btn-sm btn-outline"
            >
              <Eye size={16} />
              View Details
            </Link>
            <button className="btn btn-sm btn-outline">
              Edit
            </button>
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => onNewVisit(visit.patientId)}
            >
              <Plus size={16} />
              New Visit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VisitHistory;