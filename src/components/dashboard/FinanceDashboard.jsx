import React from 'react';

import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Wallet,
  TrendingDown,
  TrendingUp,
  ReceiptText,
  AlertTriangle,
} from 'lucide-react';

function rupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function Metric({
  icon: Icon,
  label,
  value,
  meta,
  tone,
}) {
  return (
    <div className={`finance-modern-metric ${tone}`}>
      <div className="finance-modern-metric-icon">
        <Icon size={19} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {meta && <small>{meta}</small>}
      </div>
    </div>
  );
}

function BalanceCard({
  label,
  data,
  tone,
}) {
  return (
    <div className={`finance-balance-card ${tone}`}>
      <div className="finance-balance-head">
        <span>{label}</span>
        <Wallet size={17} />
      </div>

      <strong>
        {rupiah(data?.saldo)}
      </strong>

      <div className="finance-balance-footer">
        <span>
          Masuk
          <b>
            {rupiah(data?.pemasukan)}
          </b>
        </span>

        <span>
          Keluar
          <b className="expense">
            {rupiah(data?.pengeluaran)}
          </b>
        </span>
      </div>
    </div>
  );
}

export default function FinanceDashboard({
  data,
}) {
  const kas = data?.KAS || {};
  const denda = data?.DENDA || {};

  const totalPemasukan =
    Number(kas.pemasukan || 0) +
    Number(denda.pemasukan || 0);

  const totalPengeluaran =
    Number(kas.pengeluaran || 0) +
    Number(denda.pengeluaran || 0);

  const totalDana =
    Number(data?.totalDana || 0);

  const saldoKas =
    Number(kas.saldo || 0);

  const saldoDenda =
    Number(denda.saldo || 0);

  return (
    <div className="finance-modern-page">

      <section className="finance-modern-hero">
        <div>
          <span className="eyebrow light">
            BENDAHARA PMR SMANEL
          </span>

          <h1>
            Dashboard Keuangan
          </h1>

          <p>
            Pantau posisi dana, arus kas,
            dan kondisi keuangan organisasi
            secara terpusat.
          </p>
        </div>

        <div className="finance-modern-hero-balance">
          <span>Total Dana Aktif</span>

          <strong>
            {rupiah(totalDana)}
          </strong>

          <small>
            Kas {rupiah(saldoKas)}
            {' • '}
            Denda {rupiah(saldoDenda)}
          </small>
        </div>
      </section>


      <section className="finance-modern-metrics">

        <Metric
          icon={TrendingUp}
          label="Total Pemasukan"
          value={rupiah(totalPemasukan)}
          meta="Kas + Denda"
          tone="green"
        />

        <Metric
          icon={TrendingDown}
          label="Total Pengeluaran"
          value={rupiah(totalPengeluaran)}
          meta="Seluruh sumber dana"
          tone="red"
        />

        <Metric
          icon={Wallet}
          label="Saldo Kas"
          value={rupiah(saldoKas)}
          meta="Dana Kas aktif"
          tone="blue"
        />

        <Metric
          icon={AlertTriangle}
          label="Saldo Denda"
          value={rupiah(saldoDenda)}
          meta="Dana Denda terpisah"
          tone="orange"
        />

      </section>


      <section className="finance-modern-grid">

        <div className="finance-modern-panel">

          <div className="finance-modern-panel-header">
            <div>
              <span>POSISI DANA</span>
              <h2>Saldo per Sumber Dana</h2>
            </div>

            <Wallet size={18} />
          </div>

          <div className="finance-balance-grid">

            <BalanceCard
              label="KAS"
              data={kas}
              tone="kas"
            />

            <BalanceCard
              label="DENDA"
              data={denda}
              tone="denda"
            />

          </div>

        </div>


        <div className="finance-modern-panel">

          <div className="finance-modern-panel-header">
            <div>
              <span>ARUS KAS</span>
              <h2>Perbandingan</h2>
            </div>

            <ReceiptText size={18} />
          </div>

          <div className="finance-flow-list">

            <div className="finance-flow-row">
              <div className="finance-flow-icon income">
                <ArrowDownLeft size={17} />
              </div>

              <div>
                <strong>
                  Pemasukan
                </strong>
                <span>
                  Total dana masuk
                </span>
              </div>

              <b className="income">
                {rupiah(totalPemasukan)}
              </b>
            </div>


            <div className="finance-flow-row">
              <div className="finance-flow-icon expense">
                <ArrowUpRight size={17} />
              </div>

              <div>
                <strong>
                  Pengeluaran
                </strong>
                <span>
                  Total dana keluar
                </span>
              </div>

              <b className="expense">
                {rupiah(totalPengeluaran)}
              </b>
            </div>


            <div className="finance-flow-total">
              <span>
                Saldo Bersih
              </span>

              <strong>
                {rupiah(
                  totalPemasukan -
                  totalPengeluaran
                )}
              </strong>
            </div>

          </div>

        </div>

      </section>


      <section className="finance-modern-quick">

        <a
          href="/kas"
          className="finance-modern-quick-card"
        >
          <Wallet size={19} />
          <div>
            <strong>Kas</strong>
            <span>
              Kelola kewajiban dan pembayaran.
            </span>
          </div>
        </a>

        <a
          href="/denda"
          className="finance-modern-quick-card"
        >
          <AlertTriangle size={19} />
          <div>
            <strong>Denda</strong>
            <span>
              Kelola denda dan pembayaran.
            </span>
          </div>
        </a>

        <a
          href="/pemasukan"
          className="finance-modern-quick-card"
        >
          <TrendingUp size={19} />
          <div>
            <strong>Pemasukan</strong>
            <span>
              Lihat seluruh dana masuk.
            </span>
          </div>
        </a>

        <a
          href="/pengeluaran"
          className="finance-modern-quick-card"
        >
          <TrendingDown size={19} />
          <div>
            <strong>Pengeluaran</strong>
            <span>
              Catat penggunaan dana.
            </span>
          </div>
        </a>

        <a
          href="/laporan"
          className="finance-modern-quick-card"
        >
          <FileText size={19} />
          <div>
            <strong>Laporan</strong>
            <span>
              Buka laporan keuangan lengkap.
            </span>
          </div>
        </a>

      </section>

    </div>
  );
}