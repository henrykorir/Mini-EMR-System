// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './components/common/Toast';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import PatientManagement from './components/patients/PatientManagement';
import PatientProfile from './components/patients/PatientProfile';
import VisitManagement from './components/visits/VisitManagement';
import VisitDetails from './components/visits/VisitDetails';
import Layout from './components/layout/Layout';
import './index.css'
import './styles/globals.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading EMR System...</p>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/patients" element={
                <ProtectedRoute>
                  <Layout>
                    <PatientManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/patients/:patientId" element={
                <ProtectedRoute>
                  <Layout>
                    <PatientProfile />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/visits" element={
                <ProtectedRoute>
                  <Layout>
                    <VisitManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/visits/:visitId" element={
                <ProtectedRoute>
                  <Layout>
                    <VisitDetails />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/visits/patient/:patientId" element={
                <ProtectedRoute>
                  <Layout>
                    <VisitManagement />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
