// src/components/visits/VisitForm.js
import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';

const VisitForm = ({ patient, patients, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    visitDate: new Date().toISOString().split('T')[0],
    diagnosis: [],
    prescribedMedications: [],
    notes: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      oxygenSaturation: ''
    }
  });
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patientId: patient.id
      }));
    }
  }, [patient]);

  const commonDiagnoses = [
    'Hypertension',
    'Diabetes Type II',
    'Asthma',
    'Upper Respiratory Infection',
    'Common Cold',
    'Influenza',
    'Pneumonia',
    'Bronchitis',
    'Arthritis',
    'Migraine'
  ];

  const commonMedications = [
    'Lisinopril', 'Metformin', 'Albuterol', 'Amoxicillin', 'Atorvastatin',
    'Levothyroxine', 'Metoprolol', 'Omeprazole', 'Losartan', 'Sertraline'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Patient selection is required';
    }

    if (!formData.visitDate) {
      newErrors.visitDate = 'Visit date is required';
    }

    if (formData.diagnosis.length === 0) {
      newErrors.diagnosis = 'At least one diagnosis is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleAddDiagnosis = () => {
    if (newDiagnosis.trim() && !formData.diagnosis.includes(newDiagnosis.trim())) {
      setFormData(prev => ({
        ...prev,
        diagnosis: [...prev.diagnosis, newDiagnosis.trim()]
      }));
      setNewDiagnosis('');
    }
  };

  const handleRemoveDiagnosis = (diagnosisToRemove) => {
    setFormData(prev => ({
      ...prev,
      diagnosis: prev.diagnosis.filter(d => d !== diagnosisToRemove)
    }));
  };

  const handleAddMedication = () => {
    if (newMedication.name && newMedication.dosage && newMedication.frequency && newMedication.duration) {
      setFormData(prev => ({
        ...prev,
        prescribedMedications: [...prev.prescribedMedications, { ...newMedication }]
      }));
      setNewMedication({
        name: '',
        dosage: '',
        frequency: '',
        duration: ''
      });
    }
  };

  const handleRemoveMedication = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      prescribedMedications: prev.prescribedMedications.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('vitalSigns.')) {
      const vitalSign = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vitalSigns: {
          ...prev.vitalSigns,
          [vitalSign]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
console.log("visitfordata: ", formData);
  const selectedPatient = patients.find(p => p.id === formData.patientId);

  return (
    <Modal isOpen={true} onClose={onClose} size="xlarge">
      <div className="modal-header">
        <div className="modal-title">
          <h2>New Clinical Visit</h2>
          {selectedPatient && (
            <span className="patient-subtitle">for {selectedPatient.name}</span>
          )}
        </div>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="visit-form">
        <div className="form-section">
          <h3>Patient Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="patientId">Select Patient *</label>
              <select
                id="patientId"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className={errors.patientId ? 'error' : ''}
                disabled={!!patient}
              >
                <option value="">Choose a patient...</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} (ID: {patient.id})
                  </option>
                ))}
              </select>
              {errors.patientId && <span className="error-message">{errors.patientId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="visitDate">Visit Date *</label>
              <input
                type="date"
                id="visitDate"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleChange}
                className={errors.visitDate ? 'error' : ''}
              />
              {errors.visitDate && <span className="error-message">{errors.visitDate}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Vital Signs</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bloodPressure">Blood Pressure</label>
              <input
                type="text"
                id="bloodPressure"
                name="vitalSigns.bloodPressure"
                value={formData.vitalSigns.bloodPressure}
                onChange={handleChange}
                placeholder="e.g., 120/80"
              />
            </div>
            <div className="form-group">
              <label htmlFor="heartRate">Heart Rate (BPM)</label>
              <input
                type="number"
                id="heartRate"
                name="vitalSigns.heartRate"
                value={formData.vitalSigns.heartRate}
                onChange={handleChange}
                placeholder="e.g., 72"
              />
            </div>
            <div className="form-group">
              <label htmlFor="temperature">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                id="temperature"
                name="vitalSigns.temperature"
                value={formData.vitalSigns.temperature}
                onChange={handleChange}
                placeholder="e.g., 36.6"
              />
            </div>
            <div className="form-group">
              <label htmlFor="oxygenSaturation">O₂ Saturation (%)</label>
              <input
                type="number"
                id="oxygenSaturation"
                name="vitalSigns.oxygenSaturation"
                value={formData.vitalSigns.oxygenSaturation}
                onChange={handleChange}
                placeholder="e.g., 98"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Diagnosis</h3>
          {errors.diagnosis && <span className="error-message">{errors.diagnosis}</span>}
          
          <div className="diagnosis-selection">
            <div className="common-diagnoses">
              <label>Common Diagnoses:</label>
              <div className="diagnosis-tags">
                {commonDiagnoses.map(diagnosis => (
                  <button
                    key={diagnosis}
                    type="button"
                    className={`diagnosis-tag ${formData.diagnosis.includes(diagnosis) ? 'selected' : ''}`}
                    onClick={() => {
                      if (formData.diagnosis.includes(diagnosis)) {
                        handleRemoveDiagnosis(diagnosis);
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          diagnosis: [...prev.diagnosis, diagnosis]
                        }));
                      }
                    }}
                  >
                    {diagnosis}
                    {formData.diagnosis.includes(diagnosis) && ' ✓'}
                  </button>
                ))}
              </div>
            </div>

            <div className="custom-diagnosis">
              <label htmlFor="newDiagnosis">Custom Diagnosis</label>
              <div className="input-with-button">
                <input
                  type="text"
                  id="newDiagnosis"
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  placeholder="Enter custom diagnosis..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDiagnosis();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddDiagnosis}
                  disabled={!newDiagnosis.trim()}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {formData.diagnosis.length > 0 && (
            <div className="selected-diagnoses">
              <label>Selected Diagnoses:</label>
              <div className="selected-tags">
                {formData.diagnosis.map(diagnosis => (
                  <span key={diagnosis} className="selected-tag">
                    {diagnosis}
                    <button
                      type="button"
                      onClick={() => handleRemoveDiagnosis(diagnosis)}
                      className="remove-tag"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Prescribed Medications</h3>
          
          <div className="medication-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="medName">Medication</label>
                <input
                  type="text"
                  id="medName"
                  list="commonMeds"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Medication name"
                />
                <datalist id="commonMeds">
                  {commonMedications.map(med => (
                    <option key={med} value={med} />
                  ))}
                </datalist>
              </div>
              
              <div className="form-group">
                <label htmlFor="medDosage">Dosage</label>
                <input
                  type="text"
                  id="medDosage"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                  placeholder="e.g., 10mg, 500mg"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="medFrequency">Frequency</label>
                <select
                  id="medFrequency"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                >
                  <option value="">Select frequency</option>
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Four times daily">Four times daily</option>
                  <option value="As needed">As needed</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="medDuration">Duration</label>
                <input
                  type="text"
                  id="medDuration"
                  value={newMedication.duration}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 7 days, 30 days"
                />
              </div>
              
              <div className="form-group">
                <label>&nbsp;</label>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddMedication}
                  disabled={!newMedication.name || !newMedication.dosage || !newMedication.frequency || !newMedication.duration}
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>
          </div>

          {formData.prescribedMedications.length > 0 && (
            <div className="medications-list">
              <table className="medications-table">
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.prescribedMedications.map((med, index) => (
                    <tr key={index}>
                      <td>{med.name}</td>
                      <td>{med.dosage}</td>
                      <td>{med.frequency}</td>
                      <td>{med.duration}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-icon btn-danger"
                          onClick={() => handleRemoveMedication(index)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Clinical Notes</h3>
          <div className="form-group">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter clinical notes, observations, treatment plan, follow-up instructions..."
              rows="6"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            <Save size={20} />
            Save Visit Record
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default VisitForm;