// src/components/patients/PatientForm.js
import React, { useState, useEffect } from 'react';
import { X, Save, User } from 'lucide-react';
import Modal from '../common/Modal';

const PatientForm = ({ patient, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    dateOfBirth: '',
    gender: '',
    contact: '',
    address: '',
    emergencyContact: '',
    bloodType: '',
    allergies: '',
    medicalHistory: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        idNumber: patient.idNumber || '',
        dateOfBirth: patient.dateOfBirth || '',
        gender: patient.gender || '',
        contact: patient.contact || '',
        address: patient.address || '',
        emergencyContact: patient.emergencyContact || '',
        bloodType: patient.bloodType || '',
        allergies: patient.allergies || '',
        medicalHistory: patient.medicalHistory || ''
      });
    }
  }, [patient]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = 'ID number is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact information is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="large">
      <div className="modal-header">
        <div className="modal-title">
          <User size={24} />
          <h2>{patient ? 'Edit Patient' : 'Add New Patient'}</h2>
        </div>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="patient-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter patient's full name"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="idNumber">ID Number *</label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder="Enter national ID number"
                className={errors.idNumber ? 'error' : ''}
              />
              {errors.idNumber && <span className="error-message">{errors.idNumber}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth *</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={errors.dateOfBirth ? 'error' : ''}
              />
              {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={errors.gender ? 'error' : ''}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <span className="error-message">{errors.gender}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contact">Contact Info *</label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Email or phone number"
                className={errors.contact ? 'error' : ''}
              />
              {errors.contact && <span className="error-message">{errors.contact}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContact">Emergency Contact</label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Emergency contact details"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter patient's address"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Medical Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bloodType">Blood Type</label>
              <select
                id="bloodType"
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="allergies">Allergies</label>
            <textarea
              id="allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="List any known allergies"
              rows="2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="medicalHistory">Medical History</label>
            <textarea
              id="medicalHistory"
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              placeholder="Relevant medical history"
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                {patient ? 'Update Patient' : 'Create Patient'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PatientForm;