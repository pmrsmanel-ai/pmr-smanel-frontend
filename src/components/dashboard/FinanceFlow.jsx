import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function FinanceFlow({
  kas,
  denda,
  totalArus,
  totalPemasukan,
  totalPengeluaran,
  incomePercent,
  expensePercent,
  rupiah,
}) {
  return (
    <div className="finance-dashboard-panel">
      <div className="finance-panel-header">
        <div>
          <span>ANALISIS</span>
          <h2>Arus Keuangan</h2>
        </div>
        <TrendingUp size={18} />
      </div>

      <div className="finance-flow-total">
        <span>Total Aktivitas</span>
        <strong>{rupiah(totalArus)}</strong>
      </div>

      <div className="finance-flow-item">
        <div className="finance-flow-label">
          <div>
            <span>Pemasukan</span>
            <strong>{rupiah(totalPemasukan)}</strong>
          </div>
          <span>{Math.round(incomePercent)}%</span>
        </div>

        <div className="finance-flow-bar">
          <div
            className="income"
            style={{ width: `${incomePercent}%` }}
          />
        </div>
      </div>

      <div className="finance-flow-item">
        <div className="finance-flow-label">
          <div>
            <span>Pengeluaran</span>
            <strong>{rupiah(totalPengeluaran)}</strong>
          </div>
          <span>{Math.round(expensePercent)}%</span>
        </div>

        <div className="finance-flow-bar">
          <div
            className="expense"
            style={{ width: `${expensePercent}%` }}
          />
        </div>
      </div>

      <div className="finance-flow-footer">
        <div>
          <span>Kas</span>
          <strong>{rupiah(kas.saldo)}</strong>
        </div>

        <div>
          <span>Denda</span>
          <strong>{rupiah(denda.saldo)}</strong>
        </div>
      </div>
    </div>
  );
}