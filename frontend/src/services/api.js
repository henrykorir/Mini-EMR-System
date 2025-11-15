// src/services/api.js
// Mock API service - replace with actual backend calls

const API_BASE_URL = 'http://localhost:3001/api';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
import { mockData } from './mockData';

export const authAPI = {
  async login(email, password) {
    await delay(1000);
    console.log("logiiiiin")
    // Mock validation
    if (email === 'doctor@emr.com' && password === 'password') {
      return {
        user: {
          id: '1',
          name: 'Dr. Sarah Johnson',
          email: 'doctor@emr.com',
          role: 'clinician'
        },
        token: 'mock-jwt-token'
      };
    }
    
    throw new Error('Invalid email or password');
  },

  async register(userData) {
    await delay(1000);
    return {
      user: {
        id: '2',
        name: userData.name,
        email: userData.email,
        role: 'clinician'
      },
      token: 'mock-jwt-token'
    };
  },

  async validateToken(token) {
    await delay(500);
    return {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'doctor@emr.com',
      role: 'clinician'
    };
  }
};

export const patientsAPI = {
  async getAll() {
    await delay(800);
    return mockData.patients;
  },

  async getById(id) {
    await delay(500);
    const patient = mockData.patients.find(p => p.id === id);
    if (!patient) throw new Error('Patient not found');
    return patient;
  },

  async create(patientData) {
    await delay(1000);
    const newPatient = {
      id: `P${Date.now()}`,
      ...patientData,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    return newPatient;
  },

  async update(id, patientData) {
    await delay(800);
    return { id, ...patientData };
  },

  async delete(id) {
    await delay(500);
    return { success: true };
  },

  async getById(id) {
    await delay(500);
    const patient = mockData.patients.find(p => p.id === id);
    if (!patient) throw new Error('Patient not found');
    return patient;
  },
};

export const visitsAPI = {
  async getAll() {
    await delay(800);
    return mockData.visits;
  },

  async getByPatientId(patientId) {
    await delay(500);
    return mockData.visits.filter(v => v.patientId === patientId);
  },

  async create(visitData) {
    await delay(1000);
    const newVisit = {
      id: `V${Date.now()}`,
      ...visitData,
      createdAt: new Date().toISOString()
    };
    return newVisit;
  },

  async update(id, visitData) {
    await delay(800);
    return { id, ...visitData };
  },

  async delete(id) {
    await delay(500);
    return { success: true };
  },

  async getByPatientId(patientId) {
    await delay(500);
    return mockData.visits.filter(v => v.patientId === patientId);
  },
  
  async getById(id) {
    await delay(500);
    const visit = mockData.visits.find(v => v.id === id);
    if (!visit) throw new Error('Visit not found');
    return visit;
  },
};

export const dashboardAPI = {
  async getDashboardData() {
    await delay(600);
    return mockData.dashboard;
  }
};