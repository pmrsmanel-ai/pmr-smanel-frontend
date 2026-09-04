import React from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  FileText,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

function ArrowRightIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export default function FinanceQuickActions() {
  const actions = [
    {
      to: '/kas',
      title: 'Kelola Kas',
      description: 'Kewajiban & pembayaran Kas anggota',
      icon: Wallet,
      tone: 'green',
    },
    {
      to: '/denda',
      title: 'Kelola Denda',
      description: 'Pantau dan terima pembayaran',
      icon: Coins,
      tone: 'blue',
    },
    {
      to: '/pemasukan',
      title: 'Pemasukan',
      description: 'Riwayat seluruh dana masuk',
      icon: TrendingUp,
      tone: 'income',
    },
    {
      to: '/pengeluaran',
      title: 'Pengeluaran',
      description: 'Catat dana yang digunakan',
      icon: TrendingDown,
      tone: 'expense',
    },
    {
      to: '/laporan',
      title: 'Laporan',
      description: 'Rekap keuangan lengkap',
      icon: FileText,
      tone: 'purple',
    },
  ];

  return (
    <div className="finance-dashboard-panel">
      <div className="finance-panel-header">
        <div>
          <span>AKSI CEPAT</span>
          <h2>Kelola Keuangan</h2>
        </div>
        <Wallet size={18} />
      </div>

      <div className="finance-quick-grid">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="finance-quick-card"
            >
              <div
                className={`finance-quick-icon ${item.tone}`}
              >
                <Icon size={20} />
              </div>

              <div>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </div>

              <ArrowRightIcon />
            </Link>
          );
        })}
      </div>
    </div>
  );
}