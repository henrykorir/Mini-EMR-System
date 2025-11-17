// src/components/visits/VisitManagement.js
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Calendar, Filter, Download } from 'lucide-react';
import VisitForm from './VisitForm';
import VisitHistory from './VisitHistory';
import SearchBar from '../common/SearchBar';
import { useToast } from '../common/Toast';
import { visitsAPI, patientsAPI } from '../../services/api';

const VisitManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [visits, setVisits] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    patient: 'all',
    status: 'all'
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterVisits();
  }, [visits, searchTerm, filters]);

  useEffect(() => {
    // Check if we should show form from URL params
    if (searchParams.get('action') === 'new') {
      setShowForm(true);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [visitsData, patientsData] = await Promise.all([
        visitsAPI.getAll(),
        patientsAPI.getAll()
      ]);
      setVisits(visitsData);
      setPatients(patientsData.data);
    } catch (error) {
      showToast('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterVisits = () => {
    let filtered = visits;
console.log("filtered: ", filtered)
    // Search filter
    if (searchTerm) {
      filtered = filtered.data.filter(visit =>
        visit.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.diagnosis?.some(dx => dx.toLowerCase().includes(searchTerm.toLowerCase())) ||
        visit.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Patient filter
    if (filters.patient !== 'all') {
      filtered = filtered.filter(visit => visit.patientId === filters.patient);
    }

    // Date range filter (simplified)
    if (filters.dateRange !== 'all') {
      const today = new Date();
      filtered = filtered.data.filter(visit => {
        const visitDate = new Date(visit.visitDate);
        switch (filters.dateRange) {
          case 'today':
            return visitDate.toDateString() === today.toDateString();
          case 'week':
            const weekAgo = new Date(today.setDate(today.getDate() - 7));
            return visitDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
            return visitDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredVisits(filtered);
  };

  const handleSaveVisit = async (visitData) => {
    try {
      const newVisit = await visitsAPI.create(visitData);
      setVisits([newVisit, ...visits]);
      setShowForm(false);
      setSelectedPatient(null);
      showToast('Visit recorded successfully', 'success');
    } catch (error) {
      showToast('Error saving visit', 'error');
    }
  };

  const handleNewVisit = (patient = null) => {
    setSelectedPatient(patient);
    setShowForm(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Clinical Visits</h1>
          <p>Manage patient visits and medical records</p>
        </div>
        <div className="page-actions">
          {/* <button className="btn btn-outline">
            <Download size={20} />
            Export
          </button> */}
          <button 
            className="btn btn-primary"
            onClick={() => handleNewVisit()}
          >
            <Plus size={20} />
            New Visit
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-left">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search visits by patient, diagnosis, or notes..."
          />
        </div>
        <div className="filters-right">
          <select 
            value={filters.patient}
            onChange={(e) => setFilters({...filters, patient: e.target.value})}
            className="filter-select"
          >
            <option value="all">All Patients</option>
            {patients.data?.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>

          <select 
            value={filters.dateRange}
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <button className="btn btn-outline">
            <Filter size={20} />
            More Filters
          </button>
        </div>
      </div>

      <VisitHistory
        visits={filteredVisits}
        onNewVisit={handleNewVisit}
        loading={loading}
      />

      {showForm && (
        <VisitForm
          patient={selectedPatient}
          patients={patients}
          onSubmit={handleSaveVisit}
          onClose={() => {
            setShowForm(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default VisitManagement;