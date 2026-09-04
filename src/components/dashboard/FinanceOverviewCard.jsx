import React from 'react';

export default function FinanceOverviewCard({
  title,
  saldo,
  pemasukan,
  pengeluaran,
  icon: Icon,
  tone,
  rupiah,
}) {
  return (
    <div className={`finance-balance-card ${tone}`}>
      <div className="finance-balance-head">
        <div className="finance-balance-title">
          <div className="finance-balance-icon">
            <Icon size={18} />
          </div>
          <span>{title}</span>
        </div>

        <span className="finance-balance-label">
          SALDO
        </span>
      </div>

      <strong className="finance-balance-value">
        {rupiah(saldo)}
      </strong>

      <div className="finance-balance-breakdown">
        <div>
          <span>Pemasukan</span>
          <strong className="income-text">
            {rupiah(pemasukan)}
          </strong>
        </div>

        <div>
          <span>Pengeluaran</span>
          <strong className="expense-text">
            {rupiah(pengeluaran)}
          </strong>
        </div>
      </div>
    </div>
  );
}