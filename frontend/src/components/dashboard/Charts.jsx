// src/components/dashboard/Charts.js
import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const Charts = ({ data }) => {
  const visitData = data.visits || [];
  const diagnosisData = data.diagnosis || [];
  const medicationData = data.medications || [];

  const COLORS = ['#1e40af', '#059669', '#d97706', '#7c3aed', '#dc2626'];

  return (
    <div className="charts-container">
      <div className="chart-row">
        <div className="chart-card">
          <h4>Visits Trend (Last 30 Days)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visitData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="visits" 
                stroke="#1e40af" 
                strokeWidth={2}
                name="Clinical Visits"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h4>Top Diagnoses</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={diagnosisData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {diagnosisData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-row">
        <div className="chart-card full-width">
          <h4>Medication Usage</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={medicationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="prescriptions" 
                fill="#059669" 
                name="Prescriptions"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;