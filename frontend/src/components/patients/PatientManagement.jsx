// src/components/patients/PatientManagement.js
import React, { useState, useEffect } from 'react';
import { Plus, Download, Filter } from 'lucide-react';
import PatientForm from './PatientForm';
import PatientList from './PatientList';
import SearchBar from '../common/SearchBar';
import { useToast } from '../common/Toast';
import { patientsAPI } from '../../services/api';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    gender: 'all'
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, filters]);

  const fetchPatients = async () => {
    try {
      const data = await patientsAPI.getAll();
      setPatients(data);
    } catch (error) {
      showToast('Error fetching patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.idNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.contact.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(patient => patient.status === filters.status);
    }

    // Gender filter
    if (filters.gender !== 'all') {
      filtered = filtered.filter(patient => patient.gender === filters.gender);
    }

    setFilteredPatients(filtered);
  };

  const handleSavePatient = async (patientData) => {
    try {
      if (editingPatient) {
        const updatedPatient = await patientsAPI.update(editingPatient.id, patientData);
        setPatients(patients.map(p => p.id === editingPatient.id ? updatedPatient : p));
        showToast('Patient updated successfully', 'success');
      } else {
        const newPatient = await patientsAPI.create(patientData);
        setPatients([...patients, newPatient]);
        showToast('Patient created successfully', 'success');
      }
      setShowForm(false);
      setEditingPatient(null);
    } catch (error) {
      showToast('Error saving patient', 'error');
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        await patientsAPI.delete(patientId);
        setPatients(patients.filter(p => p.id !== patientId));
        showToast('Patient deleted successfully', 'success');
      } catch (error) {
        showToast('Error deleting patient', 'error');
      }
    }
  };

  const handleExport = () => {
    // Export functionality
    showToast('Export feature coming soon', 'info');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Patient Management</h1>
          <p>Manage patient records and profiles</p>
        </div>
        <div className="page-actions">
          {/* <button className="btn btn-outline" onClick={handleExport}>
            <Download size={20} />
            Export
          </button> */}
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Add Patient
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-left">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search patients by name, ID, or contact..."
          />
        </div>
        <div className="filters-right">
          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select 
            value={filters.gender}
            onChange={(e) => setFilters({...filters, gender: e.target.value})}
            className="filter-select"
          >
            <option value="all">All Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <button className="btn btn-outline">
            <Filter size={20} />
            More Filters
          </button>
        </div>
      </div>

      <PatientList
        patients={filteredPatients}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {showForm && (
        <PatientForm
          patient={editingPatient}
          onSubmit={handleSavePatient}
          onClose={() => {
            setShowForm(false);
            setEditingPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default PatientManagement;