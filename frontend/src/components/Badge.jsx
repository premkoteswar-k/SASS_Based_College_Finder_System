import React from 'react';
import './Badge.css';

const Badge = ({ type = 'info', label, icon: Icon, size = 'md' }) => {
  return (
    <span className={`custom-badge badge-${type} badge-${size}`}>
      {Icon && <Icon size={size === 'sm' ? 12 : 14} className="badge-icon" />}
      <span className="badge-text">{label}</span>
    </span>
  );
};

export default Badge;

