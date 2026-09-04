import React from 'react';

export default function Stat({
  icon: Icon,
  label,
  value,
  meta,
  tone = 'neutral',
}) {
  return (
    <div className={`stat ${tone}`}>
      <div className="stat-icon">
        {Icon && <Icon size={19} />}
      </div>

      <div className="stat-copy">
        <span className="stat-label">
          {label}
        </span>

        <strong className="stat-value">
          {value}
        </strong>

        {meta && (
          <small className="stat-meta">
            {meta}
          </small>
        )}
      </div>
    </div>
  );
}