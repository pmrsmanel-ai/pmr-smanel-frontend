import React from 'react';

export default function DashboardStat({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
}) {
  return (
    <div className={`dashboard-stat ${tone}`}>
      <div className="dashboard-stat-icon">
        <Icon size={19} />
      </div>

      <div className="dashboard-stat-content">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
