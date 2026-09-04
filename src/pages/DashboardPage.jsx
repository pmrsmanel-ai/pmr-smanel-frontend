import React, {
  useEffect,
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import {
    Coins,
  FileText,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
      Wallet,
} from 'lucide-react';

import { getApi } from '../api';
import { getSession } from '../auth';
import WhatsAppReportButton from '../components/dashboard/WhatsAppReportButton';
import SecretaryDashboard from '../components/dashboard/SecretaryDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

function rupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function Dashboard() {
  const session = getSession();

  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState('');

  const [shareData, setShareData] =
  useState({
    kas: [],
    denda: [],
  });

const [shareLoading, setShareLoading] =
  useState(false);

  useEffect(() => {
    getApi(
      'dashboard',
      {
        userId:
          session.userId,
        role:
          session.role,
      }
    )
      .then(setData)
      .catch((err) =>
        setError(
          err.message ||
            'Gagal memuat dashboard.'
        )
      );
  }, [
    session.role,
    session.userId,
  ]);

  if (error) {
    return (
      <div className="alert error">
        {error}
      </div>
    );
  }

  if (!data) {
    return <Loading />;
  }

  const isAdmin =
    session.role === 'ADMIN';

  const isSekretaris =
    session.role === 'SEKRETARIS';

  const isBendahara =
    session.role === 'BENDAHARA';

  const kas =
    data.finance?.KAS || {
      pemasukan: 0,
      pengeluaran: 0,
      saldo: 0,
    };

  const denda =
    data.finance?.DENDA || {
      pemasukan: 0,
      pengeluaran: 0,
      saldo: 0,
    };

  const totalPemasukan =
    Number(kas.pemasukan || 0) +
    Number(denda.pemasukan || 0);

  const totalPengeluaran =
    Number(kas.pengeluaran || 0) +
    Number(denda.pengeluaran || 0);

  const totalDana =
    Number(data.finance?.totalDana || 0);

  const totalArus =
    totalPemasukan +
    totalPengeluaran;

  const incomePercent =
    totalArus > 0
      ? (totalPemasukan /
          totalArus) *
        100
      : 0;

  const expensePercent =
    totalArus > 0
      ? (totalPengeluaran /
          totalArus) *
        100
      : 0;


  return (
    <div className="dashboard-page">

      {/* ==================================================
          BENDAHARA
      ================================================== */}

      {isBendahara && (
        <div className="finance-executive-dashboard">

          {/* HERO */}

          <div className="finance-dashboard-hero">

            <div className="finance-dashboard-hero-main">

              <div className="eyebrow light">
                DASHBOARD KEUANGAN
              </div>

              <h1>
                Selamat datang,
                <br />

                <span>
                  {session.username ||
                    'Bendahara'}
                </span>
              </h1>

              <p>
                Pantau kondisi keuangan
                PMR SMANEL dari satu
                halaman.
              </p>

            </div>


            <div className="finance-dashboard-hero-actions">

              <div className="finance-dashboard-date">

                <span>
                  Hari ini
                </span>

                <strong>
                  {new Intl.DateTimeFormat(
                    'id-ID',
                    {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    }
                  ).format(new Date())}
                </strong>

              </div>

              <WhatsAppReportButton
                session={session}
                kas={kas}
                denda={denda}
              />

            </div>

          </div>


          {/* TOTAL DANA */}

          <div className="finance-total-card">

            <div className="finance-total-left">

              <div className="finance-total-icon">
                <Wallet size={21} />
              </div>

              <div>

                <span>
                  Total Dana Terkelola
                </span>

                <strong>
                  {rupiah(
                    totalDana
                  )}
                </strong>

              </div>

            </div>


            <div className="finance-total-meta">

              <span>
                {data.absensiHariIni || 0}
                {' '}
                absensi hari ini
              </span>

              <span>
                {data.anggotaAktif || 0}
                {' '}
                anggota aktif
              </span>

            </div>

          </div>


          {/* SALDO KAS / DENDA */}

          <div className="finance-balance-grid">

            <FinanceOverviewCard
              title="Saldo Kas"
              saldo={kas.saldo}
              pemasukan={
                kas.pemasukan
              }
              pengeluaran={
                kas.pengeluaran
              }
              icon={Wallet}
              tone="green"
            />

            <FinanceOverviewCard
              title="Saldo Denda"
              saldo={denda.saldo}
              pemasukan={
                denda.pemasukan
              }
              pengeluaran={
                denda.pengeluaran
              }
              icon={Coins}
              tone="blue"
            />

          </div>


          {/* ARUS + PERHATIAN */}

          <div className="finance-main-grid">

            {/* ARUS KEUANGAN */}

            <div className="finance-dashboard-panel">

              <div className="finance-panel-header">

                <div>

                  <span>
                    ANALISIS
                  </span>

                  <h2>
                    Arus Keuangan
                  </h2>

                </div>

                <TrendingUp size={18} />

              </div>


              <div className="finance-flow-total">

                <span>
                  Total Aktivitas
                </span>

                <strong>
                  {rupiah(
                    totalArus
                  )}
                </strong>

              </div>


              <div className="finance-flow-item">

                <div className="finance-flow-label">

                  <div>

                    <span>
                      Pemasukan
                    </span>

                    <strong>
                      {rupiah(
                        totalPemasukan
                      )}
                    </strong>

                  </div>

                  <span>
                    {Math.round(
                      incomePercent
                    )}
                    %
                  </span>

                </div>


                <div className="finance-flow-bar">

                  <div
                    className="income"
                    style={{
                      width:
                        `${incomePercent}%`,
                    }}
                  />

                </div>

              </div>


              <div className="finance-flow-item">

                <div className="finance-flow-label">

                  <div>

                    <span>
                      Pengeluaran
                    </span>

                    <strong>
                      {rupiah(
                        totalPengeluaran
                      )}
                    </strong>

                  </div>

                  <span>
                    {Math.round(
                      expensePercent
                    )}
                    %
                  </span>

                </div>


                <div className="finance-flow-bar">

                  <div
                    className="expense"
                    style={{
                      width:
                        `${expensePercent}%`,
                    }}
                  />

                </div>

              </div>


              <div className="finance-flow-footer">

                <div>

                  <span>
                    Kas
                  </span>

                  <strong>
                    {rupiah(
                      kas.saldo
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Denda
                  </span>

                  <strong>
                    {rupiah(
                      denda.saldo
                    )}
                  </strong>

                </div>

              </div>

            </div>


            {/* PERLU PERHATIAN */}

            <div className="finance-dashboard-panel attention">

              <div className="finance-panel-header">

                <div>

                  <span>
                    MONITORING
                  </span>

                  <h2>
                    Perlu Perhatian
                  </h2>

                </div>

                <ShieldAlert
                  size={18}
                />

              </div>


              <div className="finance-attention-list">

                <div className="finance-attention-item red">

                  <div className="finance-attention-icon">
                    <Coins
                      size={17}
                    />
                  </div>

                  <div>

                    <strong>
                      Denda Belum Lunas
                    </strong>

                    <span>
                      Segera tindak lanjuti
                      pembayaran anggota.
                    </span>

                  </div>

                  <b>
                    {rupiah(
                      data.dendaBelumLunas
                    )}
                  </b>

                </div>


                <div className="finance-attention-item orange">

                  <div className="finance-attention-icon">
                    <Wallet
                      size={17}
                    />
                  </div>

                  <div>

                    <strong>
                      Kas Belum Bayar
                    </strong>

                    <span>
                      Kewajiban Kas anggota
                      yang masih terbuka.
                    </span>

                  </div>

                  <b>
                    {rupiah(
                      data.kasBelumBayar
                    )}
                  </b>

                </div>


                <div className="finance-attention-item green">

                  <div className="finance-attention-icon">
                    <ShieldCheck
                      size={17}
                    />
                  </div>

                  <div>

                    <strong>
                      Saldo Total
                    </strong>

                    <span>
                      Posisi dana saat ini.
                    </span>

                  </div>

                  <b>
                    {rupiah(
                      totalDana
                    )}
                  </b>

                </div>

              </div>

            </div>

          </div>


          {/* AKSI CEPAT */}

          <div className="finance-dashboard-panel">

            <div className="finance-panel-header">

              <div>

                <span>
                  AKSI CEPAT
                </span>

                <h2>
                  Kelola Keuangan
                </h2>

              </div>

              <Wallet
                size={18}
              />

            </div>


            <div className="finance-quick-grid">

              <Link
                to="/kas"
                className="finance-quick-card"
              >

                <div className="finance-quick-icon green">
                  <Wallet size={20} />
                </div>

                <div>

                  <strong>
                    Kelola Kas
                  </strong>

                  <span>
                    Kewajiban & pembayaran
                    Kas anggota
                  </span>

                </div>

                <ArrowRightIcon />

              </Link>


              <Link
                to="/denda"
                className="finance-quick-card"
              >

                <div className="finance-quick-icon blue">
                  <Coins size={20} />
                </div>

                <div>

                  <strong>
                    Kelola Denda
                  </strong>

                  <span>
                    Pantau dan terima
                    pembayaran
                  </span>

                </div>

                <ArrowRightIcon />

              </Link>


              <Link
                to="/pemasukan"
                className="finance-quick-card"
              >

                <div className="finance-quick-icon income">
                  <TrendingUp
                    size={20}
                  />
                </div>

                <div>

                  <strong>
                    Pemasukan
                  </strong>

                  <span>
                    Riwayat seluruh
                    dana masuk
                  </span>

                </div>

                <ArrowRightIcon />

              </Link>


              <Link
                to="/pengeluaran"
                className="finance-quick-card"
              >

                <div className="finance-quick-icon expense">
                  <TrendingDown
                    size={20}
                  />
                </div>

                <div>

                  <strong>
                    Pengeluaran
                  </strong>

                  <span>
                    Catat dana yang
                    digunakan
                  </span>

                </div>

                <ArrowRightIcon />

              </Link>


              <Link
                to="/laporan"
                className="finance-quick-card"
              >

                <div className="finance-quick-icon purple">
                  <FileText
                    size={20}
                  />
                </div>

                <div>

                  <strong>
                    Laporan
                  </strong>

                  <span>
                    Rekap keuangan
                    lengkap
                  </span>

                </div>

                <ArrowRightIcon />

              </Link>

            </div>

          </div>

        </div>
      )}


      {/* ==================================================
          SEKRETARIS
      ================================================== */}

      {isSekretaris && (
        <SecretaryDashboard
          data={data}
        />
      )}


      {/* ==================================================
          ADMIN
      ================================================== */}

      {isAdmin && (
  <AdminDashboard
    data={data}
    session={session}
  />
)}

    </div>
  );
}


// ======================================================
// DASHBOARD COMPONENTS
// ======================================================

function FinanceOverviewCard({
  title,
  saldo,
  pemasukan,
  pengeluaran,
  icon: Icon,
  tone,
}) {
  return (
    <div
      className={`finance-balance-card ${tone}`}
    >

      <div className="finance-balance-head">

        <div className="finance-balance-title">

          <div className="finance-balance-icon">
            <Icon size={18} />
          </div>

          <span>
            {title}
          </span>

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

          <span>
            Pemasukan
          </span>

          <strong className="income-text">
            {rupiah(pemasukan)}
          </strong>

        </div>


        <div>

          <span>
            Pengeluaran
          </span>

          <strong className="expense-text">
            {rupiah(pengeluaran)}
          </strong>

        </div>

      </div>

    </div>
  );
}
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

function Loading() {
  return (
    <div className="loading">
      Memuat data…
    </div>
  );
}

export default Dashboard;