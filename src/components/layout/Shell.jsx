import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  Coins,
  FileText,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  X,
} from 'lucide-react';

import {
  clearSession,
  getSession,
} from '../../auth';

const ROLE_LABEL = {
  ADMIN: 'Admin Utama',
  SEKRETARIS: 'Sekretaris',
  BENDAHARA: 'Bendahara',
};

const BASE = import.meta.env.BASE_URL;

export default function Shell({
  children,
}) {
  const session = getSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const financePaths = useMemo(
    () => [
      '/keuangan',
      '/kas',
      '/denda',
      '/pemasukan',
      '/pengeluaran',
      '/laporan',
    ],
    []
  );

  const isFinancePath =
    financePaths.includes(location.pathname);

  const isSystemPath =
    location.pathname === '/pengaturan';

  const [financeOpen, setFinanceOpen] =
    useState(isFinancePath);

  const [systemOpen, setSystemOpen] =
    useState(isSystemPath);

  useEffect(() => {
    if (isFinancePath) {
      setFinanceOpen(true);
    }
  }, [isFinancePath]);

  useEffect(() => {
    if (isSystemPath) {
      setSystemOpen(true);
    }
  }, [isSystemPath]);

  const canOperate =
    ['ADMIN', 'SEKRETARIS'].includes(session?.role);

  const canFinance =
    ['ADMIN', 'BENDAHARA'].includes(session?.role);

  const mainItems = canOperate
    ? [
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
        },
      ]
    : [];

  const financeItems = canFinance
    ? [
        {
          to: '/keuangan',
          label: 'Ringkasan',
          icon: LayoutDashboard,
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
        },
      ]
    : [];

  function logout() {
    clearSession();

    navigate('/login', {
      replace: true,
    });
  }

  function closeSidebar() {
    setMobileOpen(false);
  }

  function toggleFinance() {
    setFinanceOpen((value) => !value);
  }

  function toggleSystem() {
    setSystemOpen((value) => !value);
  }

  const roleLabel =
    ROLE_LABEL[session?.role] ||
    session?.role ||
    'Pengguna';

  return (
    <div className="app-shell">

      <aside
        className={`sidebar sidebar-compact ${
          mobileOpen ? 'open' : ''
        }`}
      >

        <div className="brand">

          <Link
            to="/dashboard"
            className="brand-home-link"
            onClick={closeSidebar}
          >
            <div className="brand-logo-box">
              <img
                src={`${BASE}logo-pmr-smanel.png`}
                alt="Logo PMR SMANEL"
                className="brand-logo"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';

                  const fallback =
                    event.currentTarget.nextElementSibling;

                  if (fallback) {
                    fallback.style.display = 'grid';
                  }
                }}
              />

              <div
                className="brand-logo-fallback"
                style={{ display: 'none' }}
                aria-hidden="true"
              >
                PMR
              </div>
            </div>

            <div className="brand-text">
              <strong>PMR SMANEL</strong>
              <span>Absensi & Keuangan</span>
            </div>
          </Link>

          <button
            type="button"
            className="icon-btn mobile-close"
            onClick={closeSidebar}
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>

        </div>


        <div className="sidebar-role">
          <ShieldCheck size={15} />
          <span>{roleLabel}</span>
        </div>


        <nav
          className="sidebar-nav sidebar-nav-compact"
          aria-label="Navigasi utama"
        >

          {mainItems.length > 0 && (
            <div className="sidebar-nav-group">

              <div className="sidebar-nav-label">
                UTAMA
              </div>

              {mainItems.map(
                ({
                  to,
                  label,
                  icon: Icon,
                }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={closeSidebar}
                    className={`nav-item ${
                      location.pathname === to
                        ? 'active'
                        : ''
                    }`}
                  >
                    <Icon size={17} />
                    <span>{label}</span>
                  </Link>
                )
              )}

            </div>
          )}


          {canFinance && (
            <div className="sidebar-nav-group">

              <button
                type="button"
                className={`sidebar-group-toggle ${
                  isFinancePath ? 'current' : ''
                }`}
                onClick={toggleFinance}
                aria-expanded={financeOpen}
              >
                <span>
                  <Wallet size={15} />
                  <span>KEUANGAN</span>
                </span>

                <ChevronDown
                  size={15}
                  className={
                    financeOpen ? 'rotated' : ''
                  }
                />
              </button>


              <div
                className={`sidebar-subnav ${
                  financeOpen ? 'open' : ''
                }`}
              >
                {financeItems.map(
                  ({
                    to,
                    label,
                    icon: Icon,
                  }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={closeSidebar}
                      className={`nav-item finance-nav-item ${
                        location.pathname === to
                          ? 'active'
                          : ''
                      }`}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </Link>
                  )
                )}
              </div>

            </div>
          )}


          {session?.role === 'ADMIN' && (
            <div className="sidebar-nav-group">

              <button
                type="button"
                className={`sidebar-group-toggle ${
                  isSystemPath ? 'current' : ''
                }`}
                onClick={toggleSystem}
                aria-expanded={systemOpen}
              >
                <span>
                  <Settings size={15} />
                  <span>SISTEM</span>
                </span>

                <ChevronDown
                  size={15}
                  className={
                    systemOpen ? 'rotated' : ''
                  }
                />
              </button>


              <div
                className={`sidebar-subnav system-subnav ${
                  systemOpen ? 'open' : ''
                }`}
              >
                <Link
                  to="/pengaturan"
                  onClick={closeSidebar}
                  className={`nav-item ${
                    isSystemPath ? 'active' : ''
                  }`}
                >
                  <Settings size={16} />
                  <span>Pengaturan</span>
                </Link>
              </div>

            </div>
          )}

        </nav>


        <div className="sidebar-footer">

          <div className="sidebar-account">
            <div className="sidebar-account-avatar">
              <UserRound size={15} />
            </div>

            <div className="sidebar-account-copy">
              <strong>
                {session?.username || roleLabel}
              </strong>
              <span>{roleLabel}</span>
            </div>
          </div>


          <button
            type="button"
            className="logout-btn"
            onClick={logout}
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>

        </div>

      </aside>


      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}


      <main className="main">

        <header className="topbar">

          <button
            type="button"
            className="icon-btn mobile-menu"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu"
          >
            <Menu />
          </button>


          <div className="topbar-brand">
            <div className="page-kicker">
              PMR SMAN 1 AIKMEL
            </div>

            <div className="page-title">
              Sistem Absensi & Keuangan
            </div>
          </div>


          <div className="user-chip">
            <UserRound size={17} />
            <span>
              {session?.username || roleLabel}
            </span>
          </div>

        </header>


        <section className="content">
          {children}
        </section>

      </main>

    </div>
  );
}
