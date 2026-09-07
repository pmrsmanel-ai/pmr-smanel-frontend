import React, {
  useEffect,
  useState,
} from 'react';

import {
  Navigate,
  Route,
  Routes,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardCheck,
  Coins,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  X,
} from 'lucide-react';

import { getApi, postApi } from './api';

import {
  clearSession,
  getSession,
  isAllowed,
  saveSession,
} from './auth';

import AbsensiPage from './pages/AbsensiPage';
import DendaPage from './pages/DendaPage';
import KasPage from './pages/KasPage';
import LaporanPage from './pages/LaporanPage';
import AnggotaPage from './pages/AnggotaPage';
import PemasukanPage from './pages/PemasukanPage';
import PengeluaranPage from './pages/PengeluaranPage';
import RiwayatAbsensiPage from './pages/RiwayatAbsensiPage';
import PublicDashboard from './pages/PublicDashboard';


// ======================================================
// CONSTANTS
// ======================================================

const ROLE_LABEL = {
  ADMIN: 'Admin Utama',
  SEKRETARIS: 'Sekretaris',
  BENDAHARA: 'Bendahara',
};


// ======================================================
// HELPERS
// ======================================================

function rupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}


// ======================================================
// PROTECTED ROUTE
// ======================================================

function Protected({
  roles,
  children,
}) {
  const session = getSession();

  if (!isAllowed(session, roles)) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


// ======================================================
// MAIN SHELL
// ======================================================

function Shell({
  children,
}) {
  const session = getSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] =
    useState(false);

  const navItems = [];


  if (
    ['ADMIN', 'SEKRETARIS'].includes(
      session?.role
    )
  ) {
    navItems.push(
      {
        to: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
      {
        to: '/kegiatan',
        label: 'Kegiatan',
        icon: CalendarDays,
      },
      {
        to: '/absensi',
        label: 'Absensi',
        icon: ClipboardCheck,
      },
      {
        to: '/anggota',
        label: 'Anggota',
        icon: Users,
      },
      {
        to: '/riwayat-absensi',
        label: 'Riwayat Absensi',
        icon: ClipboardCheck,
      }
    );
  }


// ======================================================
// BENDAHARA + ADMIN
// ======================================================

if (
  ['ADMIN', 'BENDAHARA'].includes(
    session?.role
  )
) {
  navItems.push(
    {
      to: '/keuangan',
      label: 'Keuangan',
      icon: Wallet,
    },
    {
      to: '/kas',
      label: 'Kas',
      icon: Wallet,
    },
    {
      to: '/denda',
      label: 'Denda',
      icon: Coins,
    },
    {
      to: '/pemasukan',
      label: 'Pemasukan',
      icon: TrendingUp,
    },
    {
      to: '/pengeluaran',
      label: 'Pengeluaran',
      icon: TrendingDown,
    },
    {
      to: '/laporan',
      label: 'Laporan',
      icon: FileText,
    }
  );
}


// ======================================================
// ADMIN UTAMA
// ======================================================

if (
  session?.role === 'ADMIN'
) {
  navItems.push({
    to: '/pengaturan',
    label: 'Pengaturan',
    icon: Settings,
  });
}


  function logout() {
    clearSession();

    navigate('/login', {
      replace: true,
    });
  }


  return (
    <div className="app-shell">

      <aside
        className={`sidebar ${
          open ? 'open' : ''
        }`}
      >

        <div className="brand">

          <div className="brand-logo-box">

            <img
  src={`${import.meta.env.BASE_URL}logo-pmr-smanel.jpg`}
  alt="Logo PMR SMANEL"
  className="login-logo-image"
              onError={(event) => {
                event.currentTarget.style.display =
                  'none';

                if (
                  event.currentTarget
                    .nextElementSibling
                ) {
                  event.currentTarget
                    .nextElementSibling
                    .style.display = 'grid';
                }
              }}
            />

            <div className="brand-logo-fallback">
              PMR
            </div>

          </div>


          <div className="brand-text">

            <strong>
              PMR SMANEL
            </strong>

            <span>
              Absensi & Keuangan
            </span>

          </div>


          <button
            type="button"
            className="icon-btn mobile-close"
            onClick={() =>
              setOpen(false)
            }
          >
            <X size={18} />
          </button>

        </div>


        <div className="sidebar-role">

          <ShieldCheck size={16} />

          {ROLE_LABEL[
            session?.role
          ] || session?.role}

        </div>


        <nav>

          {navItems.map(
            ({
              to,
              label,
              icon: Icon,
            }) => (
              <Link
                key={to}
                to={to}
                onClick={() =>
                  setOpen(false)
                }
                className={`nav-item ${
                  location.pathname === to
                    ? 'active'
                    : ''
                }`}
              >
                <Icon size={18} />

                <span>
                  {label}
                </span>
              </Link>
            )
          )}

        </nav>


        <button
          type="button"
          className="logout-btn"
          onClick={logout}
        >
          <LogOut size={17} />
          Keluar
        </button>

      </aside>


      {open && (
        <div
          className="sidebar-backdrop"
          onClick={() =>
            setOpen(false)
          }
        />
      )}


      <main className="main">

        <header className="topbar">

          <button
            type="button"
            className="icon-btn mobile-menu"
            onClick={() =>
              setOpen(true)
            }
          >
            <Menu />
          </button>


          <div>

            <div className="page-kicker">
              PMR SMAN 1 AIKMEL
            </div>

            <div className="page-title">
              Sistem Absensi & Keuangan
            </div>

          </div>


          <div className="user-chip">

            <UserRound size={17} />

            {session?.username ||
              ROLE_LABEL[
                session?.role
              ]}

          </div>

        </header>


        <section className="content">
          {children}
        </section>

      </main>

    </div>
  );
}


// ======================================================
// LOGIN
// ======================================================

function Login() {
  const navigate =
    useNavigate();

  const [form, setForm] =
    useState({
      username: '',
      password: '',
    });

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState('');


  async function submit(event) {
    event.preventDefault();

    setBusy(true);
    setError('');

    try {

      const result =
        await getApi(
          'login',
          {
            username:
              form.username,

            password:
              form.password,
          }
        );


      saveSession(result);


      navigate(
        '/dashboard',
        {
          replace: true,
        }
      );

    } catch (err) {

      setError(
        err.message ||
          'Login gagal.'
      );

    } finally {

      setBusy(false);

    }
  }


  return (
    <div className="login-page">

      <div className="login-panel">

        <div className="login-logo-wrap">

          <img
  src={`${import.meta.env.BASE_URL}logo-pmr-smanel.png`}
  alt="Logo PMR SMANEL"
  className="login-logo-image"
            onError={(event) => {

              event.currentTarget.style.display =
                'none';

              if (
                event.currentTarget
                  .nextElementSibling
              ) {
                event.currentTarget
                  .nextElementSibling
                  .style.display =
                  'grid';
              }

            }}
          />

          <div className="login-logo-fallback">
            PMR
          </div>

        </div>


        <div className="eyebrow">
          PMR SMAN 1 AIKMEL
        </div>

        <h1>
          Masuk ke Sistem
        </h1>

        <p>
          Kelola absensi, denda,
          kas, pembayaran, dan
          laporan dalam satu tempat.
        </p>


        <form
          onSubmit={submit}
          className="stack"
        >

          <label>
            Username

            <input
              autoComplete="username"
              value={
                form.username
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  username:
                    event.target
                      .value,
                })
              }
            />

          </label>


          <label>
            Password

            <input
              type="password"
              autoComplete="current-password"
              value={
                form.password
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  password:
                    event.target
                      .value,
                })
              }
            />

          </label>


          {error && (
            <div className="alert error">
              {error}
            </div>
          )}


          <button
            type="submit"
            className="primary-btn"
            disabled={busy}
          >
            {busy
              ? 'Memproses…'
              : 'Masuk'}
          </button>

        </form>


        <div className="login-note">

          <ShieldCheck
            size={16}
          />

          3 role: Admin Utama,
          Sekretaris, Bendahara

        </div>

      </div>

    </div>
  );
}


// ======================================================
// ======================================================
// DASHBOARD
// ======================================================

function Dashboard() {
  const session =
    getSession();

  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState('');

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
    session.role ===
    'SEKRETARIS';

  const isBendahara =
    session.role ===
    'BENDAHARA';

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
    Number(
      data.finance?.totalDana ??
        (Number(kas.saldo || 0) +
          Number(denda.saldo || 0))
    );

  const totalPiutang =
    Number(
      data.finance?.totalPiutang ??
        (Number(
          data.kasBelumBayar || 0
        ) +
        Number(
          data.dendaBelumLunas || 0
        ))
    );

  return (
    <div className="dashboard-page">

      <div className="dashboard-hero">

        <div className="dashboard-hero-content">

          <div className="eyebrow light">
            DASHBOARD
          </div>

          <h1>
            Selamat datang,
            <br />

            <span>
              {session.username ||
                ROLE_LABEL[
                  session.role
                ]}
            </span>
          </h1>

          <p>
            Sistem Absensi &
            Keuangan PMR SMANEL
          </p>

        </div>

        <div className="dashboard-role-badge">

          <ShieldCheck size={18} />

          <div>

            <small>
              Akses sistem
            </small>

            <strong>
              {ROLE_LABEL[
                session.role
              ]}
            </strong>

          </div>

        </div>

      </div>


      {/* SEKRETARIS */}

      {isSekretaris && (
        <>
          <div className="dashboard-section-title">

            <div>

              <h2>
                Kehadiran Hari Ini
              </h2>

              <p>
                Pantau kehadiran
                anggota PMR pada
                hari ini.
              </p>

            </div>


            <Link
              to="/absensi"
              className="dashboard-action"
            >
              <ClipboardCheck size={17} />
              Buka Absensi
            </Link>

          </div>


          <div className="dashboard-stat-grid secretary">

            <DashboardStat
              icon={Users}
              label="Anggota Aktif"
              value={
                data.anggotaAktif
              }
              tone="neutral"
            />

            <DashboardStat
              icon={ClipboardCheck}
              label="Absensi Hari Ini"
              value={
                data.absensiHariIni
              }
              tone="blue"
            />

            <DashboardStat
              icon={UserRound}
              label="Hadir"
              value={
                data.hadirHariIni
              }
              tone="green"
            />

            <DashboardStat
              icon={ShieldCheck}
              label="Izin"
              value={
                data.izinHariIni
              }
              tone="blue"
            />

            <DashboardStat
              icon={ClipboardCheck}
              label="Sakit"
              value={
                data.sakitHariIni
              }
              tone="orange"
            />

            <DashboardStat
              icon={Coins}
              label="Alpha"
              value={
                data.alphaHariIni
              }
              tone="red"
            />

          </div>

          <div className="dashboard-secretary-insights">

            <div className="dashboard-panel dashboard-attendance-panel">
              <div className="dashboard-panel-head">
                <div>
                  <span className="dashboard-panel-kicker">RINGKASAN</span>
                  <h3>Distribusi Kehadiran</h3>
                  <p>Perbandingan status dari absensi yang sudah dicatat hari ini.</p>
                </div>
                <ClipboardCheck size={19} />
              </div>

              {(() => {
                const total = Number(data.absensiHariIni || 0);
                const pct = (value) => total ? Math.round((Number(value || 0) / total) * 100) : 0;
                const rows = [
                  { label: 'Hadir', value: data.hadirHariIni, tone: 'green' },
                  { label: 'Izin', value: data.izinHariIni, tone: 'blue' },
                  { label: 'Sakit', value: data.sakitHariIni, tone: 'orange' },
                  { label: 'Alpha', value: data.alphaHariIni, tone: 'red' },
                ];

                return (
                  <div className="dashboard-progress-list">
                    {rows.map((item) => (
                      <div className="dashboard-progress-row" key={item.label}>
                        <div className="dashboard-progress-meta">
                          <span>{item.label}</span>
                          <strong>{Number(item.value || 0)} <small>({pct(item.value)}%)</small></strong>
                        </div>
                        <div className="dashboard-progress-track">
                          <div
                            className={`dashboard-progress-fill ${item.tone}`}
                            style={{ width: `${pct(item.value)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="dashboard-panel dashboard-readiness-panel">
              <div className="dashboard-panel-head">
                <div>
                  <span className="dashboard-panel-kicker">STATUS DATA</span>
                  <h3>Kelengkapan Absensi</h3>
                  <p>Pantau progres pencatatan anggota pada hari ini.</p>
                </div>
                <Users size={19} />
              </div>

              {(() => {
                const active = Number(data.anggotaAktif || 0);
                const recorded = Number(data.absensiHariIni || 0);
                const remaining = Math.max(active - recorded, 0);
                const completion = active ? Math.min(Math.round((recorded / active) * 100), 100) : 0;

                return (
                  <>
                    <div className="dashboard-completion-value">
                      <strong>{completion}%</strong>
                      <span>data anggota sudah tercatat</span>
                    </div>

                    <div className="dashboard-completion-track">
                      <div
                        className="dashboard-completion-fill"
                        style={{ width: `${completion}%` }}
                      />
                    </div>

                    <div className="dashboard-mini-grid">
                      <div>
                        <span>Sudah tercatat</span>
                        <strong>{recorded}</strong>
                      </div>
                      <div>
                        <span>Belum tercatat</span>
                        <strong>{remaining}</strong>
                      </div>
                      <div>
                        <span>Total anggota</span>
                        <strong>{active}</strong>
                      </div>
                    </div>

                    <div className="dashboard-panel-note">
                      <ShieldCheck size={16} />
                      <span>{remaining > 0 ? `${remaining} anggota belum memiliki catatan absensi hari ini.` : 'Seluruh anggota aktif sudah memiliki catatan absensi hari ini.'}</span>
                    </div>
                  </>
                );
              })()}
            </div>

          </div>

          <div className="dashboard-quick-actions">
            <div>
              <span className="dashboard-panel-kicker">AKSES CEPAT</span>
              <h3>Kelola Data Sekretaris</h3>
              <p>Gunakan pintasan berikut untuk melanjutkan pekerjaan administrasi.</p>
            </div>
            <div className="dashboard-quick-links">
              <Link to="/absensi" className="dashboard-quick-link primary">
                <ClipboardCheck size={17} />
                <span>Isi Absensi</span>
                <ArrowRight size={15} />
              </Link>
              <Link to="/anggota" className="dashboard-quick-link">
                <Users size={17} />
                <span>Kelola Anggota</span>
                <ArrowRight size={15} />
              </Link>
              <Link to="/kegiatan" className="dashboard-quick-link">
                <CalendarDays size={17} />
                <span>Lihat Kegiatan</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </>
      )}


      {/* BENDAHARA */}

      {isBendahara && (
        <>
          <div className="dashboard-section-title">

            <div>

              <h2>
                Ringkasan Keuangan
              </h2>

              <p>
                Pantau posisi dana,
                arus kas, dan
                kewajiban anggota
                secara cepat.
              </p>

            </div>

            <Link
              to="/keuangan"
              className="dashboard-action"
            >
              <Wallet size={17} />
              Buka Keuangan
            </Link>

          </div>


          <div className="dashboard-stat-grid finance">

            <DashboardStat
              icon={Users}
              label="Anggota Aktif"
              value={
                data.anggotaAktif
              }
              tone="neutral"
            />

            <DashboardStat
              icon={Coins}
              label="Denda Belum Lunas"
              value={rupiah(
                data.dendaBelumLunas
              )}
              tone="red"
            />

            <DashboardStat
              icon={Wallet}
              label="Kas Belum Bayar"
              value={rupiah(
                data.kasBelumBayar
              )}
              tone="orange"
            />

            <DashboardStat
              icon={Wallet}
              label="Saldo Kas"
              value={rupiah(
                kas.saldo
              )}
              tone="green"
            />

            <DashboardStat
              icon={Coins}
              label="Saldo Denda"
              value={rupiah(
                denda.saldo
              )}
              tone="blue"
            />

            <DashboardStat
              icon={LayoutDashboard}
              label="Total Dana"
              value={rupiah(
                totalDana
              )}
              tone="dark"
            />

          </div>


          <div className="dashboard-bendahara-grid">

            <div className="dashboard-panel">

              <div className="dashboard-panel-head">

                <div>
                  <span>
                    ARUS DANA
                  </span>
                  <h3>
                    Ringkasan Pemasukan & Pengeluaran
                  </h3>
                </div>

                <Wallet size={19} />

              </div>

              <div className="dashboard-money-list">

                <div className="dashboard-money-row">
                  <div>
                    <span>
                      Pemasukan Kas
                    </span>
                    <small>
                      Dana masuk dari pembayaran kas
                    </small>
                  </div>
                  <strong className="income-text">
                    {rupiah(kas.pemasukan)}
                  </strong>
                </div>

                <div className="dashboard-money-row">
                  <div>
                    <span>
                      Pengeluaran Kas
                    </span>
                    <small>
                      Penggunaan dana dari kas
                    </small>
                  </div>
                  <strong className="expense-text">
                    {rupiah(kas.pengeluaran)}
                  </strong>
                </div>

                <div className="dashboard-money-row">
                  <div>
                    <span>
                      Pemasukan Denda
                    </span>
                    <small>
                      Denda yang sudah dibayar
                    </small>
                  </div>
                  <strong className="income-text">
                    {rupiah(denda.pemasukan)}
                  </strong>
                </div>

                <div className="dashboard-money-row">
                  <div>
                    <span>
                      Pengeluaran Denda
                    </span>
                    <small>
                      Pengeluaran dari sumber denda
                    </small>
                  </div>
                  <strong className="expense-text">
                    {rupiah(denda.pengeluaran)}
                  </strong>
                </div>

                <div className="dashboard-money-total">
                  <div>
                    <span>
                      Pemasukan Bersih
                    </span>
                    <small>
                      Seluruh sumber dana
                    </small>
                  </div>
                  <strong>
                    {rupiah(
                      totalPemasukan
                    )}
                  </strong>
                </div>

                <div className="dashboard-money-total expense">
                  <div>
                    <span>
                      Pengeluaran Bersih
                    </span>
                    <small>
                      Seluruh penggunaan dana
                    </small>
                  </div>
                  <strong>
                    {rupiah(
                      totalPengeluaran
                    )}
                  </strong>
                </div>

              </div>

              <Link
                to="/laporan"
                className="dashboard-panel-link"
              >
                Lihat laporan keuangan
                <ArrowRight size={15} />
              </Link>

            </div>


            <div className="dashboard-panel">

              <div className="dashboard-panel-head">

                <div>
                  <span>
                    POSISI KEUANGAN
                  </span>
                  <h3>
                    Saldo & Piutang
                  </h3>
                </div>

                <Coins size={19} />

              </div>

              <div className="dashboard-position-list">

                <div className="dashboard-position-card">
                  <div className="dashboard-position-icon green">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <span>
                      Saldo Kas
                    </span>
                    <strong>
                      {rupiah(kas.saldo)}
                    </strong>
                  </div>
                </div>

                <div className="dashboard-position-card">
                  <div className="dashboard-position-icon blue">
                    <Coins size={18} />
                  </div>
                  <div>
                    <span>
                      Saldo Denda
                    </span>
                    <strong>
                      {rupiah(denda.saldo)}
                    </strong>
                  </div>
                </div>

                <div className="dashboard-position-card">
                  <div className="dashboard-position-icon orange">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <span>
                      Piutang Kas
                    </span>
                    <strong>
                      {rupiah(
                        data.kasBelumBayar
                      )}
                    </strong>
                  </div>
                </div>

                <div className="dashboard-position-card">
                  <div className="dashboard-position-icon red">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <span>
                      Piutang Denda
                    </span>
                    <strong>
                      {rupiah(
                        data.dendaBelumLunas
                      )}
                    </strong>
                  </div>
                </div>

              </div>

              <div className="dashboard-grand-total">
                <span>
                  Total Dana Aktual
                </span>
                <strong>
                  {rupiah(totalDana)}
                </strong>
              </div>

              <div className="dashboard-grand-total warning">
                <span>
                  Total Piutang
                </span>
                <strong>
                  {rupiah(totalPiutang)}
                </strong>
              </div>

            </div>

          </div>


          <div className="dashboard-bendahara-actions">

            <div className="dashboard-panel">

              <div className="dashboard-panel-head">

                <div>
                  <span>
                    PERLU DITINDAKLANJUTI
                  </span>
                  <h3>
                    Kewajiban Anggota
                  </h3>
                </div>

                <ShieldAlert size={19} />

              </div>

              <div className="dashboard-attention">

                <div className="dashboard-attention-item kas">
                  <div>
                    <strong>
                      Kas belum bayar
                    </strong>
                    <span>
                      {rupiah(data.kasBelumBayar)}
                    </span>
                  </div>

                  <Link to="/kas">
                    Kelola
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="dashboard-attention-item denda">
                  <div>
                    <strong>
                      Denda belum lunas
                    </strong>
                    <span>
                      {rupiah(data.dendaBelumLunas)}
                    </span>
                  </div>

                  <Link to="/denda">
                    Kelola
                    <ArrowRight size={14} />
                  </Link>
                </div>

              </div>

            </div>


            <div className="dashboard-panel">

              <div className="dashboard-panel-head">

                <div>
                  <span>
                    AKSES CEPAT
                  </span>
                  <h3>
                    Kelola Keuangan
                  </h3>
                </div>

                <LayoutDashboard size={19} />

              </div>

              <div className="dashboard-quick-grid">

                <Link
                  to="/kas"
                  className="dashboard-quick-item"
                >
                  <Wallet size={18} />
                  <div>
                    <strong>Kas</strong>
                    <span>
                      Kewajiban & pembayaran
                    </span>
                  </div>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  to="/denda"
                  className="dashboard-quick-item"
                >
                  <Coins size={18} />
                  <div>
                    <strong>Denda</strong>
                    <span>
                      Denda & pembayaran
                    </span>
                  </div>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  to="/pemasukan"
                  className="dashboard-quick-item"
                >
                  <TrendingUp size={18} />
                  <div>
                    <strong>Pemasukan</strong>
                    <span>
                      Dana yang sudah masuk
                    </span>
                  </div>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  to="/pengeluaran"
                  className="dashboard-quick-item"
                >
                  <TrendingDown size={18} />
                  <div>
                    <strong>Pengeluaran</strong>
                    <span>
                      Penggunaan dana
                    </span>
                  </div>
                  <ArrowRight size={14} />
                </Link>

              </div>

              <Link
                to="/laporan"
                className="dashboard-panel-link"
              >
                Buka pusat laporan
                <ArrowRight size={15} />
              </Link>

            </div>

          </div>

        </>
      )}


      {/* ADMIN */}

      {isAdmin && (
        <>
          <div className="dashboard-section-title">

            <div>

              <h2>
                Ringkasan Sistem
              </h2>

              <p>
                Monitoring aktivitas
                dan keuangan PMR SMANEL.
              </p>

            </div>

          </div>


          <div className="dashboard-stat-grid admin">

            <DashboardStat
              icon={Users}
              label="Anggota Aktif"
              value={
                data.anggotaAktif
              }
              tone="neutral"
            />

            <DashboardStat
              icon={ClipboardCheck}
              label="Absensi Hari Ini"
              value={
                data.absensiHariIni
              }
              tone="blue"
            />

            <DashboardStat
              icon={Coins}
              label="Denda Belum Lunas"
              value={rupiah(
                data.dendaBelumLunas
              )}
              tone="red"
            />

            <DashboardStat
              icon={Wallet}
              label="Kas Belum Bayar"
              value={rupiah(
                data.kasBelumBayar
              )}
              tone="orange"
            />

            <DashboardStat
              icon={Wallet}
              label="Saldo Kas"
              value={rupiah(
                kas.saldo
              )}
              tone="green"
            />

            <DashboardStat
              icon={Coins}
              label="Saldo Denda"
              value={rupiah(
                denda.saldo
              )}
              tone="blue"
            />

          </div>
        </>
      )}

    </div>
  );
}


// ======================================================
// DASHBOARD COMPONENTS
// ======================================================

function DashboardStat({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
}) {
  return (
    <div
      className={`dashboard-stat ${tone}`}
    >

      <div className="dashboard-stat-icon">
        <Icon size={19} />
      </div>

      <div className="dashboard-stat-content">

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}


// ======================================================
// KEGIATAN
// ======================================================

function KegiatanPage() {
  const session = getSession();

  const [items, setItems] =
    useState([]);

  const [form, setForm] =
    useState({
      namaKegiatan: '',
      kasAktif: false,
      nominalKas: 0,
      dendaAktif: false,
      absensiAktif: true,
    });

  const [busy, setBusy] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState('');

  const [message, setMessage] =
    useState('');

  async function load() {
    const result = await getApi(
      'kegiatan.list',
      {
        userId: session.userId,
        role: session.role,
      }
    );

    setItems(result);
  }

  useEffect(() => {
    load().catch((err) =>
      setMessage(err.message)
    );
  }, []);

  async function create(event) {
    event.preventDefault();

    setBusy(true);
    setMessage('');

    try {
      await postApi({
        action: 'kegiatan.create',
        userId: session.userId,
        role: session.role,
        ...form,
      });

      setForm({
        namaKegiatan: '',
        kasAktif: false,
        nominalKas: 0,
        dendaAktif: false,
        absensiAktif: true,
      });

      setMessage(
        'Kegiatan berhasil dibuat.'
      );

      await load();

    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteKegiatan(item) {
    const yakin = window.confirm(
      `Hapus kegiatan "${item.Nama_Kegiatan}"?\n\n` +
      `Kegiatan yang sudah memiliki absensi, denda, atau kas tidak dapat dihapus.`
    );

    if (!yakin) return;

    setDeletingId(item.Kegiatan_ID);
    setMessage('');

    try {
      await postApi({
        action: 'kegiatan.delete',
        userId: session.userId,
        role: session.role,
        kegiatanId: item.Kegiatan_ID,
      });

      setMessage(
        'Kegiatan berhasil dihapus.'
      );

      await load();

    } catch (err) {
      if (
        err.message ===
        'KEGIATAN_HAS_DATA'
      ) {
        setMessage(
          'Kegiatan tidak dapat dihapus karena sudah memiliki data absensi, denda, atau kas.'
        );
      } else {
        setMessage(err.message);
      }
    } finally {
      setDeletingId('');
    }
  }

  return (
    <div className="stack-lg">

      <SectionHeader
        title="Kegiatan"
        subtitle="Atur apakah kegiatan menggunakan absensi, denda, dan kas."
      />

      {message && (
        <div className="alert">
          {message}
        </div>
      )}

      <div className="two-col">

        <Card title="Tambah Kegiatan">

          <form
            className="stack"
            onSubmit={create}
          >

            <label>
              Nama Kegiatan

              <input
                required
                value={form.namaKegiatan}
                onChange={(event) =>
                  setForm({
                    ...form,
                    namaKegiatan:
                      event.target.value,
                  })
                }
              />
            </label>

            <label className="check">
              <input
                type="checkbox"
                checked={
                  form.absensiAktif
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    absensiAktif:
                      event.target.checked,
                  })
                }
              />
              Absensi aktif
            </label>

            <label className="check">
              <input
                type="checkbox"
                checked={
                  form.dendaAktif
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    dendaAktif:
                      event.target.checked,
                  })
                }
              />
              Denda aktif
            </label>

            <label className="check">
              <input
                type="checkbox"
                checked={
                  form.kasAktif
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    kasAktif:
                      event.target.checked,
                  })
                }
              />
              Kas aktif
            </label>

            {form.kasAktif && (
              <label>
                Nominal Kas

                <input
                  type="number"
                  min="0"
                  value={
                    form.nominalKas
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      nominalKas:
                        Number(
                          event.target.value
                        ),
                    })
                  }
                />
              </label>
            )}

            <button
              type="submit"
              className="primary-btn"
              disabled={busy}
            >
              {busy
                ? 'Menyimpan…'
                : 'Simpan Kegiatan'}
            </button>

          </form>
        </Card>

        <Card title="Kegiatan Tersedia">

          <div className="list">

            {items.map((item) => (
              <div
                className="list-row kegiatan-row"
                key={`${item.Kegiatan_ID}-${item.Nama_Kegiatan}`}
              >

                <div className="kegiatan-info">
                  <strong>
                    {item.Nama_Kegiatan}
                  </strong>

                  <small>
                    {item.Kegiatan_ID}
                  </small>
                </div>

                <div className="kegiatan-actions">

                  <div className="tags">

                    <Tag
                      on={item.Absensi_Aktif}
                      text="Absensi"
                    />

                    <Tag
                      on={item.Denda_Aktif}
                      text="Denda"
                    />

                    <Tag
                      on={item.Kas_Aktif}
                      text={
                        item.Nominal_Kas
                          ? `Kas ${rupiah(
                              item.Nominal_Kas
                            )}`
                          : 'Kas'
                      }
                    />

                  </div>

                  <button
                    type="button"
                    className="delete-kegiatan-btn"
                    disabled={
                      deletingId ===
                      item.Kegiatan_ID
                    }
                    onClick={() =>
                      deleteKegiatan(item)
                    }
                    title="Hapus kegiatan"
                  >
                    {deletingId ===
                    item.Kegiatan_ID
                      ? 'Menghapus…'
                      : 'Hapus'}
                  </button>

                </div>

              </div>
            ))}

            {!items.length && (
              <Empty
                text="Belum ada kegiatan."
              />
            )}

          </div>

        </Card>

      </div>
    </div>
  );
}

// ======================================================
// ABSENSI CONNECTED
// ======================================================

function sleep_(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ConnectedAbsensiPage() {
  const session = getSession();

  const [kegiatan, setKegiatan] =
    useState([]);

  const [anggota, setAnggota] =
    useState([]);

  const [selected, setSelected] =
    useState('');

  const [tanggalKegiatan, setTanggalKegiatan] =
    useState('');

  const [statusMap, setStatusMap] =
    useState({});

  const [busy, setBusy] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [sending, setSending] =
    useState({
      open: false,
      progress: 0,
      step: 'MENYIAPKAN',
      error: '',
    });


  async function loadData() {
    setMessage('');

    try {
      const [
        kegiatanData,
        anggotaData,
      ] = await Promise.all([
        getApi(
          'kegiatan.list',
          {
            userId: session.userId,
            role: session.role,
            status: 'AKTIF',
          }
        ),

        getApi(
          'anggota.list',
          {
            userId: session.userId,
            role: session.role,
          }
        ),
      ]);

      setKegiatan(kegiatanData);
      setAnggota(anggotaData);

    } catch (err) {
      setMessage(
        err.message ||
          'Gagal mengambil data.'
      );
    }
  }


  useEffect(() => {
    loadData();
  }, [
    session.role,
    session.userId,
  ]);


  /*
   * Hanya anggota yang benar-benar
   * dipilih statusnya yang dihitung.
   */
  const selectedEntries =
    Object.entries(statusMap);


  const selectedCount =
    selectedEntries.length;


  const summary =
    selectedEntries.reduce(
      (result, [, status]) => {
        if (
          Object.prototype.hasOwnProperty.call(
            result,
            status
          )
        ) {
          result[status]++;
        }

        return result;
      },
      {
        HADIR: 0,
        IZIN: 0,
        SAKIT: 0,
        ALPHA: 0,
      }
    );


  function todayInputDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


  function activityDateToInput(value) {
    if (!value) return todayInputDate();

    const raw = String(value);
    const datePart =
      raw.includes('T')
        ? raw.slice(0, 10)
        : raw;

    return /^\d{4}-\d{2}-\d{2}$/.test(
      datePart
    )
      ? datePart
      : todayInputDate();
  }


  function handleActivityChange(value) {
    setSelected(value);
    setStatusMap({});
    setMessage('');

    const activity = kegiatan.find(
      (item) =>
        item.Kegiatan_ID === value
    );

    setTanggalKegiatan(
      value
        ? activityDateToInput(activity?.Tanggal)
        : ''
    );
  }


  function openConfirmation() {
    if (!selected) {
      setMessage(
        'Pilih kegiatan terlebih dahulu.'
      );
      return;
    }

    if (!tanggalKegiatan) {
      setMessage(
        'Tentukan tanggal kegiatan terlebih dahulu.'
      );
      return;
    }

    if (!selectedCount) {
      setMessage(
        'Pilih minimal satu anggota terlebih dahulu.'
      );
      return;
    }

    setMessage('');
    setConfirmOpen(true);
  }


  async function submitAbsensi() {
    const records =
      Object.entries(statusMap).map(
        ([anggotaId, status]) => ({
          anggotaId,
          status,
          keterangan: '',
        })
      );


    if (!records.length) {
      setMessage(
        'Tidak ada anggota yang dipilih.'
      );
      setConfirmOpen(false);
      return;
    }


    const progressState = (
      progress,
      step,
      error = ''
    ) => {
      setSending({
        open: true,
        progress,
        step,
        error,
      });
    };

    setBusy(true);
    setConfirmOpen(false);
    setMessage('');

    progressState(
      8,
      'MENYIAPKAN'
    );

    try {
      await sleep_(250);

      progressState(
        22,
        'MENGIRIM'
      );

      const requestPromise = postApi({
        action: 'absensi.submit',

        userId:
          session.userId,

        role:
          session.role,

        kegiatanId:
          selected,

        tanggalKegiatan,

        records,
      });

      await sleep_(350);

      progressState(
        42,
        'SERVER'
      );

      await sleep_(450);

      progressState(
        62,
        'ABSENSI'
      );

      await sleep_(350);

      progressState(
        78,
        'KEWAJIBAN'
      );

      const result =
        await requestPromise;

      progressState(
        92,
        'PENYELESAIAN'
      );

      await sleep_(350);

      progressState(
        100,
        'SELESAI'
      );

      await sleep_(650);

      setSending({
        open: false,
        progress: 0,
        step: 'MENYIAPKAN',
        error: '',
      });

      setMessage(
        `Berhasil: ${result.saved} absensi, ${result.finesCreated} denda, ${result.kasDuesCreated} kewajiban kas.`
      );

      setStatusMap({});

    } catch (err) {
      setSending({
        open: true,
        progress: 100,
        step: 'GAGAL',
        error:
          err?.message ||
          'Gagal mengirim absensi.',
      });

      setMessage(
        err?.message ||
          'Gagal mengirim absensi.'
      );
    } finally {
      setBusy(false);
    }
  }


  const selectedActivity =
    kegiatan.find(
      (item) =>
        item.Kegiatan_ID ===
        selected
    );


  return (
    <>
      <AbsensiPage
        kegiatan={kegiatan}
        anggota={anggota}
        selected={selected}
        setSelected={handleActivityChange}
        tanggalKegiatan={tanggalKegiatan}
        setTanggalKegiatan={setTanggalKegiatan}
        statusMap={statusMap}
        setStatusMap={setStatusMap}
        busy={busy}
        message={message}
        onSubmit={openConfirmation}
      />


      {confirmOpen && (
        <AbsensiConfirmationModal
          kegiatan={
            selectedActivity
          }

          tanggalKegiatan={tanggalKegiatan}

          total={
            selectedCount
          }

          summary={
            summary
          }

          onCancel={() =>
            setConfirmOpen(false)
          }

          onConfirm={
            submitAbsensi
          }

          busy={busy}
        />
      )}


      {sending.open && (
        <AbsensiSendingModal
          kegiatan={selectedActivity}
          tanggalKegiatan={tanggalKegiatan}
          total={selectedCount}
          progress={sending.progress}
          step={sending.step}
          error={sending.error}
        />
      )}
    </>
  );
}


// ======================================================
// ABSENSI CONFIRMATION MODAL
// ======================================================

function AbsensiConfirmationModal({
  kegiatan,
  tanggalKegiatan,
  total,
  summary,
  onCancel,
  onConfirm,
  busy,
}) {
  return (
    <div className="modal-backdrop">

      <div className="confirmation-modal">

        <div className="confirmation-icon">

          <ShieldAlert
            size={27}
          />

        </div>


        <div className="confirmation-content">

          <h2>
            Konfirmasi Absensi
          </h2>

          <p>
            Pastikan data kehadiran
            sudah benar sebelum
            dikirim.
          </p>


          <div className="confirmation-activity">

            <span>
              Kegiatan
            </span>

            <strong>
              {kegiatan?.Nama_Kegiatan ||
                '-'}
            </strong>

          </div>

          <div className="confirmation-activity">

            <span>
              Tanggal Kegiatan
            </span>

            <strong>
              {tanggalKegiatan || '-'}
            </strong>

          </div>


          <div className="confirmation-summary">

            <ConfirmationStat
              label="Hadir"
              value={
                summary.HADIR
              }
              className="green"
            />

            <ConfirmationStat
              label="Izin"
              value={
                summary.IZIN
              }
              className="blue"
            />

            <ConfirmationStat
              label="Sakit"
              value={
                summary.SAKIT
              }
              className="orange"
            />

            <ConfirmationStat
              label="Alpha"
              value={
                summary.ALPHA
              }
              className="red"
            />

          </div>


          <div className="confirmation-total">

            <span>
              Total Anggota
            </span>

            <strong>
              {total}
            </strong>

          </div>


          <div className="confirmation-warning">

            <ShieldAlert size={17} />

            <span>
              Setelah dikirim, absensi
              akan dicatat ke sistem.
              Jika kegiatan menggunakan
              Denda atau Kas, sistem
              akan membuat kewajiban
              secara otomatis.
            </span>

          </div>


          <div className="confirmation-actions">

            <button
              type="button"
              className="confirmation-cancel"
              onClick={onCancel}
              disabled={busy}
            >
              Batal
            </button>


            <button
              type="button"
              className="confirmation-confirm"
              onClick={onConfirm}
              disabled={busy}
            >

              <Check size={17} />

              {busy
                ? 'Mengirim...'
                : 'Konfirmasi & Kirim'}

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


function AbsensiSendingModal({
  kegiatan,
  tanggalKegiatan,
  total,
  progress,
  step,
  error,
}) {
  const failed = step === 'GAGAL';

  const steps = [
    {
      key: 'MENYIAPKAN',
      label: 'Menyiapkan data',
    },
    {
      key: 'MENGIRIM',
      label: 'Mengirim ke server',
    },
    {
      key: 'SERVER',
      label: 'Server menerima data',
    },
    {
      key: 'ABSENSI',
      label: 'Menyimpan absensi',
    },
    {
      key: 'KEWAJIBAN',
      label: 'Memproses denda & kas',
    },
    {
      key: 'PENYELESAIAN',
      label: 'Menyelesaikan proses',
    },
    {
      key: 'SELESAI',
      label: 'Pengiriman selesai',
    },
  ];

  const order = steps.map(
    (item) => item.key
  );

  const activeIndex =
    order.indexOf(step);

  return (
    <div className="absensi-sending-backdrop">
      <div className={`absensi-sending-modal ${
        failed
          ? 'is-error'
          : 'is-running'
      }`}>
        <div className="absensi-sending-top">
          <div className="absensi-sending-icon">
            {failed ? (
              <ShieldAlert size={24} />
            ) : (
              <div className="absensi-sending-spinner" />
            )}
          </div>

          <div>
            <span className="absensi-sending-eyebrow">
              STATUS PENGIRIMAN
            </span>

            <h2>
              {failed
                ? 'Pengiriman Gagal'
                : step === 'SELESAI'
                  ? 'Pengiriman Selesai'
                  : 'Mengirim Data Absensi'}
            </h2>

            <p>
              {failed
                ? 'Data belum dipastikan tersimpan. Periksa pesan error.'
                : 'Mohon tunggu, sistem sedang memproses data Anda.'}
            </p>
          </div>
        </div>


        <div className="absensi-sending-meta">
          <div>
            <span>Kegiatan</span>
            <strong>
              {kegiatan?.Nama_Kegiatan || '-'}
            </strong>
          </div>

          <div>
            <span>Tanggal</span>
            <strong>
              {tanggalKegiatan || '-'}
            </strong>
          </div>

          <div>
            <span>Anggota</span>
            <strong>
              {total}
            </strong>
          </div>
        </div>


        <div className="absensi-sending-progress-head">
          <strong>
            {progress}%
          </strong>

          <span>
            {failed
              ? 'Proses berhenti'
              : step === 'SELESAI'
                ? 'Selesai'
                : 'Sedang diproses...'}
          </span>
        </div>


        <div
          className="absensi-sending-progress"
          aria-label={`Progress ${progress}%`}
        >
          <div
            className="absensi-sending-progress-bar"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>


        <div className="absensi-sending-steps">
          {steps.map((item, index) => {
            const isDone =
              step === 'SELESAI'
                ? true
                : index < activeIndex;

            const isActive =
              index === activeIndex &&
              !failed;

            return (
              <div
                key={item.key}
                className={`absensi-sending-step ${
                  isDone
                    ? 'done'
                    : ''
                } ${
                  isActive
                    ? 'active'
                    : ''
                }`}
              >
                <div className="absensi-sending-step-dot">
                  {isDone
                    ? <Check size={12} />
                    : index + 1}
                </div>

                <span>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>


        {failed && (
          <div className="absensi-sending-error">
            <ShieldAlert size={17} />

            <div>
              <strong>
                Proses tidak selesai
              </strong>

              <span>
                {error ||
                  'Terjadi kesalahan saat mengirim data.'}
              </span>
            </div>
          </div>
        )}


        {!failed && (
          <div className="absensi-sending-note">
            Jangan menutup atau me-refresh
            halaman selama proses berlangsung.
          </div>
        )}
      </div>
    </div>
  );
}


function ConfirmationStat({
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


// ======================================================
// KEUANGAN
// ======================================================

function KeuanganPage() {
  const session = getSession();

  const [summaryData, setSummaryData] =
    useState(null);

  const [dendaData, setDendaData] =
    useState([]);

  const [kasData, setKasData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [message, setMessage] =
    useState('');

  function num(value) {
    return Number(value || 0);
  }

  function isLunas(value) {
    return String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toUpperCase() === 'LUNAS';
  }

  function isKasLunas(value) {
    return String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toUpperCase() === 'LUNAS';
  }

  async function loadData(silent = false) {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setMessage('');

    try {
      /*
       * Jangan hanya bergantung pada keuangan.summary.
       * Dashboard ini juga membaca sumber kewajiban
       * langsung dari 06_Denda dan 07_Kewajiban_Kas.
       */
      const [
        summary,
        denda,
        kas,
      ] = await Promise.all([
        getApi(
          'keuangan.summary',
          {
            userId:
              session.userId,
            role:
              session.role,
          }
        ),

        getApi(
          'denda.list',
          {
            userId:
              session.userId,
            role:
              session.role,
          }
        ),

        getApi(
          'kas.list',
          {
            userId:
              session.userId,
            role:
              session.role,
          }
        ),
      ]);

      setSummaryData(summary || {});
      setDendaData(
        Array.isArray(denda)
          ? denda
          : []
      );
      setKasData(
        Array.isArray(kas)
          ? kas
          : []
      );
    } catch (err) {
      setMessage(
        err?.message ||
          'Gagal memuat data keuangan.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    session.userId,
    session.role,
  ]);

  if (loading) {
    return (
      <div className="finance-data-loading">
        Memuat data keuangan...
      </div>
    );
  }

  const kasSummary =
    summaryData?.KAS || {
      pemasukan: 0,
      pengeluaran: 0,
      saldo: 0,
    };

  const dendaSummary =
    summaryData?.DENDA || {
      pemasukan: 0,
      pengeluaran: 0,
      saldo: 0,
    };

  /*
   * Piutang dihitung langsung dari daftar kewajiban.
   * Ini tetap bekerja walaupun deployment backend
   * masih mengembalikan financialSummary versi lama.
   */
  const piutangDenda =
    dendaData
      .filter(
        item =>
          !isLunas(
            item.Status
          )
      )
      .reduce(
        (sum, item) =>
          sum +
          num(
            item.Nominal
          ),
        0
      );

  const piutangKas =
    kasData
      .filter(
        item =>
          !isKasLunas(
            item.Status
          )
      )
      .reduce(
        (sum, item) =>
          sum +
          num(
            item.Nominal
          ),
        0
      );

  const dendaBelumLunasCount =
    dendaData.filter(
      item =>
        !isLunas(
          item.Status
        )
    ).length;

  const kasBelumBayarCount =
    kasData.filter(
      item =>
        !isKasLunas(
          item.Status
        )
    ).length;

  const totalPiutang =
    piutangKas +
    piutangDenda;

  const totalPemasukan =
    num(kasSummary.pemasukan) +
    num(dendaSummary.pemasukan);

  const totalPengeluaran =
    num(kasSummary.pengeluaran) +
    num(dendaSummary.pengeluaran);

  const saldoBersih =
    num(kasSummary.saldo) +
    num(dendaSummary.saldo);

  const totalDana =
    summaryData?.totalDana != null
      ? num(summaryData.totalDana)
      : saldoBersih;

  return (
    <div className="finance-data-page">

      <section className="finance-data-hero">

        <div>
          <span>
            BENDAHARA · KEUANGAN
          </span>

          <h1>
            Dashboard Keuangan
          </h1>

          <p>
            Pantau saldo aktual, arus
            dana, dan piutang organisasi
            secara terpisah.
          </p>
        </div>

        <div className="finance-data-hero-side">

          <div className="finance-data-hero-total">
            <span>
              SALDO BERSIH
            </span>

            <strong>
              {rupiah(
                saldoBersih
              )}
            </strong>

            <small>
              Total dana aktual
            </small>
          </div>

          <button
            type="button"
            className="finance-data-refresh"
            onClick={() =>
              loadData(true)
            }
            disabled={
              refreshing
            }
          >
            <TrendingUp
              size={15}
            />

            {refreshing
              ? 'Memuat...'
              : 'Perbarui Data'}
          </button>

        </div>

      </section>


      {message && (
        <div className="alert error">
          {message}
        </div>
      )}


      <div className="finance-data-stats">

        <div className="finance-data-stat green">
          <Wallet size={19} />

          <div>
            <span>
              Saldo Kas
            </span>

            <strong>
              {rupiah(
                kasSummary.saldo
              )}
            </strong>

            <small>
              Dana kas aktual
            </small>
          </div>
        </div>


        <div className="finance-data-stat purple">
          <Coins size={19} />

          <div>
            <span>
              Saldo Denda
            </span>

            <strong>
              {rupiah(
                dendaSummary.saldo
              )}
            </strong>

            <small>
              Dana denda yang sudah masuk
            </small>
          </div>
        </div>


        <div className="finance-data-stat orange">
          <Wallet size={19} />

          <div>
            <span>
              Piutang Kas
            </span>

            <strong>
              {rupiah(
                piutangKas
              )}
            </strong>

            <small>
              {kasBelumBayarCount} kewajiban
              belum bayar
            </small>
          </div>
        </div>


        <div className="finance-data-stat red">
          <ShieldAlert size={19} />

          <div>
            <span>
              Piutang Denda
            </span>

            <strong>
              {rupiah(
                piutangDenda
              )}
            </strong>

            <small>
              {dendaBelumLunasCount} denda
              belum lunas
            </small>
          </div>
        </div>

      </div>


      <div className="finance-data-two-col">

        <div className="card finance-data-card">

          <div className="finance-data-card-head">
            <div>
              <span>
                ARUS DANA
              </span>

              <h2>
                Ringkasan Pemasukan
              </h2>
            </div>

            <TrendingUp
              size={19}
            />
          </div>

          <div className="finance-data-list">
            <div>
              <span>
                Pemasukan Kas
              </span>

              <strong className="income-text">
                {rupiah(
                  kasSummary.pemasukan
                )}
              </strong>
            </div>

            <div>
              <span>
                Pemasukan Denda
              </span>

              <strong className="income-text">
                {rupiah(
                  dendaSummary.pemasukan
                )}
              </strong>
            </div>

            <div className="total">
              <span>
                Total Pemasukan
              </span>

              <strong>
                {rupiah(
                  totalPemasukan
                )}
              </strong>
            </div>
          </div>

          <Link
            to="/pemasukan"
            className="finance-data-link"
          >
            Lihat pemasukan
            <TrendingUp size={14} />
          </Link>

        </div>


        <div className="card finance-data-card">

          <div className="finance-data-card-head">
            <div>
              <span>
                ARUS DANA
              </span>

              <h2>
                Ringkasan Pengeluaran
              </h2>
            </div>

            <TrendingDown
              size={19}
            />
          </div>

          <div className="finance-data-list">
            <div>
              <span>
                Pengeluaran Kas
              </span>

              <strong className="expense-text">
                {rupiah(
                  kasSummary.pengeluaran
                )}
              </strong>
            </div>

            <div>
              <span>
                Pengeluaran Denda
              </span>

              <strong className="expense-text">
                {rupiah(
                  dendaSummary.pengeluaran
                )}
              </strong>
            </div>

            <div className="total">
              <span>
                Total Pengeluaran
              </span>

              <strong>
                {rupiah(
                  totalPengeluaran
                )}
              </strong>
            </div>
          </div>

          <Link
            to="/pengeluaran"
            className="finance-data-link"
          >
            Lihat pengeluaran
            <TrendingDown size={14} />
          </Link>

        </div>

      </div>


      <div className="finance-data-two-col">

        <div className="card finance-data-card">

          <div className="finance-data-card-head">
            <div>
              <span>
                PIUTANG
              </span>

              <h2>
                Kewajiban Anggota
              </h2>
            </div>

            <ShieldAlert
              size={19}
            />
          </div>


          <div className="finance-data-debt-list">

            <Link
              to="/kas"
              className="finance-data-debt kas"
            >
              <Wallet
                size={18}
              />

              <div>
                <strong>
                  Kas Belum Bayar
                </strong>

                <span>
                  {kasBelumBayarCount}{' '}
                  kewajiban anggota
                </span>
              </div>

              <b>
                {rupiah(
                  piutangKas
                )}
              </b>

              <ArrowRight
                size={14}
              />
            </Link>


            <Link
              to="/denda"
              className="finance-data-debt denda"
            >
              <Coins
                size={18}
              />

              <div>
                <strong>
                  Denda Belum Lunas
                </strong>

                <span>
                  {dendaBelumLunasCount}{' '}
                  denda anggota
                </span>
              </div>

              <b>
                {rupiah(
                  piutangDenda
                )}
              </b>

              <ArrowRight
                size={14}
              />
            </Link>


            <div className="finance-data-debt-total">
              <span>
                Total Piutang
              </span>

              <strong>
                {rupiah(
                  totalPiutang
                )}
              </strong>
            </div>

          </div>

        </div>


        <div className="card finance-data-card">

          <div className="finance-data-card-head">
            <div>
              <span>
                POSISI DANA
              </span>

              <h2>
                Sumber Dana
              </h2>
            </div>

            <Wallet
              size={19}
            />
          </div>


          <div className="finance-data-source-list">

            <div>
              <div>
                <span>
                  KAS
                </span>

                <strong>
                  {rupiah(
                    kasSummary.saldo
                  )}
                </strong>
              </div>

              <div>
                <small>
                  Masuk
                </small>

                <b className="income-text">
                  {rupiah(
                    kasSummary.pemasukan
                  )}
                </b>
              </div>

              <div>
                <small>
                  Keluar
                </small>

                <b className="expense-text">
                  {rupiah(
                    kasSummary.pengeluaran
                  )}
                </b>
              </div>
            </div>


            <div>
              <div>
                <span>
                  DENDA
                </span>

                <strong>
                  {rupiah(
                    dendaSummary.saldo
                  )}
                </strong>
              </div>

              <div>
                <small>
                  Masuk
                </small>

                <b className="income-text">
                  {rupiah(
                    dendaSummary.pemasukan
                  )}
                </b>
              </div>

              <div>
                <small>
                  Keluar
                </small>

                <b className="expense-text">
                  {rupiah(
                    dendaSummary.pengeluaran
                  )}
                </b>
              </div>
            </div>

          </div>


          <div className="finance-data-total-strip">
            <span>
              Total Dana Aktual
            </span>

            <strong>
              {rupiah(
                totalDana
              )}
            </strong>
          </div>

        </div>

      </div>


      <div className="card finance-data-card">

        <div className="finance-data-card-head">
          <div>
            <span>
              AKSES CEPAT
            </span>

            <h2>
              Kelola Keuangan
            </h2>
          </div>

          <FileText
            size={19}
          />
        </div>


        <div className="finance-data-quick">

          <Link
            to="/kas"
            className="finance-data-quick-item"
          >
            <Wallet size={18} />
            <div>
              <strong>
                Kas
              </strong>

              <span>
                Kewajiban & pembayaran
              </span>
            </div>

            <ArrowRight size={14} />
          </Link>


          <Link
            to="/denda"
            className="finance-data-quick-item"
          >
            <Coins size={18} />
            <div>
              <strong>
                Denda
              </strong>

              <span>
                Denda & pembayaran
              </span>
            </div>

            <ArrowRight size={14} />
          </Link>


          <Link
            to="/pemasukan"
            className="finance-data-quick-item"
          >
            <TrendingUp size={18} />
            <div>
              <strong>
                Pemasukan
              </strong>

              <span>
                Dana yang sudah masuk
              </span>
            </div>

            <ArrowRight size={14} />
          </Link>


          <Link
            to="/pengeluaran"
            className="finance-data-quick-item"
          >
            <TrendingDown size={18} />
            <div>
              <strong>
                Pengeluaran
              </strong>

              <span>
                Penggunaan dana
              </span>
            </div>

            <ArrowRight size={14} />
          </Link>


          <Link
            to="/laporan"
            className="finance-data-quick-item"
          >
            <FileText size={18} />
            <div>
              <strong>
                Laporan
              </strong>

              <span>
                Laporan keuangan lengkap
              </span>
            </div>

            <ArrowRight size={14} />
          </Link>

        </div>

      </div>

    </div>
  );
}

// ======================================================
// ANGGOTA
// ======================================================

function Anggota() {
  const session =
    getSession();

  const [data, setData] =
    useState([]);

  const [error, setError] =
    useState('');


  useEffect(() => {

    getApi(
      'anggota.list',
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
          err.message
        )
      );

  }, [
    session.role,
    session.userId,
  ]);


  return (
    <div className="stack-lg">

      <SectionHeader
        title="Anggota"
        subtitle={`${data.length} anggota aktif`}
      />


      {error && (
        <div className="alert error">
          {error}
        </div>
      )}


      <Card>

        <div className="table-wrap">

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Kelas</th>
                <th>Status</th>
              </tr>

            </thead>


            <tbody>

              {data.map(
                (item) => (
                  <tr
                    key={
                      item.ID_Anggota
                    }
                  >

                    <td>
                      {
                        item.ID_Anggota
                      }
                    </td>

                    <td>
                      {
                        item.Nama_Lengkap
                      }
                    </td>

                    <td>
                      {item.Kelas}
                    </td>

                    <td>
                      <span className="status-pill">
                        Aktif
                      </span>
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </Card>

    </div>
  );
}


// ======================================================
// DENDA
// ======================================================

function Denda() {
  const session = getSession();

  const [data, setData] =
    useState([]);

  const [anggota, setAnggota] =
    useState([]);

  const [error, setError] =
    useState('');

  async function loadData() {
    const [
      dendaData,
      anggotaData,
    ] = await Promise.all([
      getApi(
        'denda.list',
        {
          userId:
            session.userId,
          role:
            session.role,
        }
      ),

      getApi(
        'anggota.list',
        {
          userId:
            session.userId,
          role:
            session.role,
        }
      ),
    ]);

    setData(dendaData);
    setAnggota(anggotaData);
  }

  useEffect(() => {
    loadData().catch((err) =>
      setError(
        err.message ||
          'Gagal memuat data denda.'
      )
    );
  }, [
    session.userId,
    session.role,
  ]);

  if (error) {
    return (
      <div className="alert error">
        {error}
      </div>
    );
  }

  return (
    <DendaPage
      data={data}
      anggota={anggota}
      session={session}
      onRefresh={loadData}
    />
  );
}

// ======================================================
// KAS
// ======================================================

function KasPageWrapper() {
  const session = getSession();

  const [data, setData] =
    useState([]);

  const [anggota, setAnggota] =
    useState([]);

  const [error, setError] =
    useState('');

  async function loadData() {
    const [
      kasData,
      anggotaData,
    ] = await Promise.all([
      getApi(
        'kas.list',
        {
          userId:
            session.userId,
          role:
            session.role,
        }
      ),

      getApi(
        'anggota.list',
        {
          userId:
            session.userId,
          role:
            session.role,
        }
      ),
    ]);

    setData(kasData);
    setAnggota(anggotaData);
  }

  useEffect(() => {
    loadData().catch((err) =>
      setError(
        err.message ||
          'Gagal memuat data Kas.'
      )
    );
  }, [
    session.userId,
    session.role,
  ]);

  if (error) {
    return (
      <div className="alert error">
        {error}
      </div>
    );
  }

  return (
    <KasPage
      data={data}
      anggota={anggota}
      session={session}
      onRefresh={loadData}
    />
  );
}

// ======================================================
// LAPORAN
// ======================================================

function Laporan() {
  return (
    <div className="stack-lg">

      <SectionHeader
        title="Laporan"
        subtitle="Modul laporan akan menggunakan data absensi dan ledger."
      />

      <Card>

        <Empty
          text="Tahap berikutnya: laporan absensi, laporan kas, laporan denda, dan ekspor."
        />

      </Card>

    </div>
  );
}


// ======================================================
// PENGATURAN
// ======================================================

function Pengaturan() {
  return (
    <div className="stack-lg">

      <SectionHeader
        title="Pengaturan"
        subtitle="Administrasi sistem PMR SMANEL."
      />

      <Card>

        <Empty
          text="Tahap berikutnya: manajemen user dan pengaturan aturan denda."
        />

      </Card>

    </div>
  );
}


// ======================================================
// UI COMPONENTS
// ======================================================

function Card({
  title,
  children,
}) {
  return (
    <div className="card">

      {title && (
        <div className="card-title">
          {title}
        </div>
      )}

      {children}

    </div>
  );
}


function SectionHeader({
  title,
  subtitle,
}) {
  return (
    <div className="section-header">

      <div>

        <div className="eyebrow">
          PMR SMANEL
        </div>

        <h1>
          {title}
        </h1>

        <p>
          {subtitle}
        </p>

      </div>

    </div>
  );
}


function FinanceCard({
  title,
  data,
}) {
  return (
    <div className="stat-card">

      <span>
        {title}
      </span>

      <strong>
        {rupiah(
          data.saldo
        )}
      </strong>

      <small>
        Pemasukan{' '}
        {rupiah(
          data.pemasukan
        )}

        {' · '}

        Pengeluaran{' '}
        {rupiah(
          data.pengeluaran
        )}
      </small>

    </div>
  );
}


function Tag({
  on,
  text,
}) {
  return (
    <span
      className={`tag ${
        on ? 'on' : ''
      }`}
    >
      {text}
    </span>
  );
}


function Empty({
  text,
}) {
  return (
    <div className="empty">
      {text}
    </div>
  );
}


function Loading() {
  return (
    <div className="loading">
      Memuat data…
    </div>
  );
}


// ======================================================
// ROUTES
// ======================================================

export default function App() {
  return (
    <Routes>

      <Route
        path="/login"
        element={<Login />}
      />


     <Route
  path="/"
  element={<PublicDashboard />}
/>


      <Route
        path="/dashboard"
        element={
          <Protected
            roles={[
              'ADMIN',
              'SEKRETARIS',
              'BENDAHARA',
            ]}
          >
            <Shell>
              <Dashboard />
            </Shell>
          </Protected>
        }
      />


      <Route
        path="/kegiatan"
        element={
          <Protected
            roles={[
              'ADMIN',
              'SEKRETARIS',
            ]}
          >
            <Shell>
              <KegiatanPage />
            </Shell>
          </Protected>
        }
      />


      <Route
        path="/absensi"
        element={
          <Protected
            roles={[
              'ADMIN',
              'SEKRETARIS',
            ]}
          >
            <Shell>
              <ConnectedAbsensiPage />
            </Shell>
          </Protected>
        }
      />


      <Route
        path="/riwayat-absensi"
        element={
          <Protected
            roles={[
              'ADMIN',
              'SEKRETARIS',
            ]}
          >
            <Shell>
              <RiwayatAbsensiPage />
            </Shell>
          </Protected>
        }
      />


      <Route
        path="/anggota"
        element={
          <Protected
            roles={[
              'ADMIN',
              'SEKRETARIS',
            ]}
          >
            <Shell>
              <AnggotaPage />
            </Shell>
          </Protected>
        }
      />


      <Route
        path="/keuangan"
        element={
          <Protected
            roles={[
              'ADMIN',
              'BENDAHARA',
            ]}
          >
            <Shell>
              <KeuanganPage />
            </Shell>
          </Protected>
        }
      />

<Route
  path="/kas"
  element={
    <Protected
      roles={[
        'ADMIN',
        'BENDAHARA',
      ]}
    >
      <Shell>
        <KasPageWrapper />
      </Shell>
    </Protected>
  }
/>

      <Route
        path="/denda"
        element={
          <Protected
            roles={[
              'ADMIN',
              'BENDAHARA',
            ]}
          >
            <Shell>
              <Denda />
            </Shell>
          </Protected>
        }
      />


      <Route
        path="/pemasukan"
        element={
          <Protected
            roles={[
              'ADMIN',
              'BENDAHARA',
            ]}
          >
            <Shell>
              <PemasukanPage />
            </Shell>
          </Protected>
        }
      />


      <Route
        path="/pengeluaran"
        element={
          <Protected
            roles={[
              'ADMIN',
              'BENDAHARA',
            ]}
          >
            <Shell>
              <PengeluaranPage />
            </Shell>
          </Protected>
        }
      />


      <Route
        path="/laporan"
        element={
          <Protected
            roles={[
              'ADMIN',
              'BENDAHARA',
            ]}
          >
            <Shell>
              <LaporanPage />
            </Shell>
          </Protected>
        }
      />


      <Route
        path="/pengaturan"
        element={
          <Protected
            roles={['ADMIN']}
          >
            <Shell>
              <Pengaturan />
            </Shell>
          </Protected>
        }
      />


      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}