import React from 'react';

export default function ConfirmationStat({
  label,
  value,
  className,
}) {
  return (
    <div
      className={`confirmation-stat ${className}`}
    >
      <strong>
        {value}
      </strong>

      <span>
        {label}
      </span>
    </div>
  );
}