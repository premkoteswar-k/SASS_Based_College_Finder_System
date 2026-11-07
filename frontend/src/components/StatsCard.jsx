import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
  return (
    <div className={`stats-card border-${color}`}>
      <div className="stats-card-main">
        <div className="stats-card-info">
          <p className="stats-card-title">{title}</p>
          <h3 className="stats-card-value">{value}</h3>
          {subtitle && <p className="stats-card-subtitle">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`stats-icon-box bg-${color}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
      {trend && (
        <div className="stats-card-footer">
          <span className={`trend-badge ${trend.isPositive ? 'trend-up' : 'trend-neutral'}`}>
            {trend.text}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;

