// src/components/dashboard/StatsCards.js
import React from 'react';
import { Users, Calendar, Pill, TrendingUp } from 'lucide-react';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Patients',
      value: stats.patients || 0,
      icon: Users,
      color: 'primary',
      trend: '+12%'
    },
    {
      title: "Today's Visits",
      value: stats.visitsToday || 0,
      icon: Calendar,
      color: 'secondary',
      trend: '+5%'
    },
    {
      title: 'Active Prescriptions',
      value: stats.prescriptions || 0,
      icon: Pill,
      color: 'accent',
      trend: '+8%'
    },
    {
      title: 'Monthly Growth',
      value: `${stats.growth || 0}%`,
      icon: TrendingUp,
      color: 'success',
      trend: '+15%'
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className={`stat-card stat-${card.color}`}>
            <div className="stat-icon">
              <Icon size={24} />
            </div>
            <div className="stat-content">
              <h3>{card.value}</h3>
              <p>{card.title}</p>
              <span className="stat-trend">
                <TrendingUp size={16} />
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;