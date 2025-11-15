// src/components/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Users, Calendar, Pill } from 'lucide-react';
import StatsCards from './StatsCards';
import Charts from './Charts';
import { dashboardAPI } from '../../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentVisits: [],
    charts: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await dashboardAPI.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner large"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>EMR Dashboard</h1>
          <p>Welcome back! Here's your clinical overview.</p>
        </div>
        <div className="dashboard-actions">
          <Link to="/patients?action=new" className="btn btn-primary">
            <Plus size={20} />
            New Patient
          </Link>
          <Link to="/visits?action=new" className="btn btn-secondary">
            <Plus size={20} />
            New Visit
          </Link>
        </div>
      </div>

      <StatsCards stats={dashboardData.stats} />

      <div className="dashboard-content">
        <div className="charts-section">
          <Charts data={dashboardData.charts} />
        </div>

        <div className="recent-activity-section">
          <div className="section-header">
            <h3>Recent Clinical Visits</h3>
            <Link to="/visits" className="view-all-link">
              View All
            </Link>
          </div>
          
          <div className="recent-visits">
            {dashboardData.recentVisits.map(visit => (
              <div key={visit.id} className="visit-card">
                <div className="visit-header">
                  <div className="patient-info">
                    <div className="patient-avatar">
                      {visit.patientName.charAt(0)}
                    </div>
                    <div>
                      <h4>{visit.patientName}</h4>
                      <p className="visit-date">{visit.visitDate}</p>
                    </div>
                  </div>
                  <span className={`visit-status status-${visit.status}`}>
                    {visit.status}
                  </span>
                </div>
                
                <div className="visit-details">
                  <div className="diagnosis">
                    <strong>Diagnosis:</strong>
                    <div className="diagnosis-tags">
                      {visit.diagnosis.map(dx => (
                        <span key={dx} className="diagnosis-tag">{dx}</span>
                      ))}
                    </div>
                  </div>
                  
                  {visit.notes && (
                    <p className="visit-notes">{visit.notes}</p>
                  )}
                </div>

                <div className="visit-actions">
                  <Link 
                    to={`/visits/${visit.id}`}
                    className="btn btn-sm btn-outline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;