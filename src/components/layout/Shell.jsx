import React, {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  CalendarDays,
  ClipboardCheck,
  Coins,
  FileText,
  LayoutDashboard,
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

export default function Shell({
  children,
}) {
  const session = getSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);

  const financePaths = [
    '/keuangan',
    '/kas',
    '/denda',
    '/pemasukan',
    '/pengeluaran',
    '/laporan',
  ];

  const isFinancePath =
    financePaths.includes(
      location.pathname
    );

  const [
    financeOpen,
    setFinanceOpen,
  ] = useState(isFinancePath);

  useEffect(() => {
    if (isFinancePath) {
      setFinanceOpen(true);
    }
  }, [isFinancePath]);

  const mainItems = [];

  if (
    ['ADMIN', 'SEKRETARIS'].includes(
      session?.role
    )
  ) {
    mainItems.push(
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
      }
    );
  }

  const canFinance =
    ['ADMIN', 'BENDAHARA'].includes(
      session?.role
    );

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
    setOpen(false);
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
              src="/logo-pmr-smanel.png"
              alt="Logo PMR SMANEL"
              className="brand-logo"
              onError={(event) => {
                event.currentTarget.style.display =
                  'none';

                const fallback =
                  event.currentTarget
                    .nextElementSibling;

                if (fallback) {
                  fallback.style.display =
                    'grid';
                }
              }}
            />

            <div
              className="brand-logo-fallback"
              style={{
                display: 'none',
              }}
            >
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
            onClick={closeSidebar}
            aria-label="Tutup menu"
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


        <nav className="sidebar-nav">

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
                    <Icon size={18} />

                    <span>
                      {label}
                    </span>
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
                  isFinancePath
                    ? 'current'
                    : ''
                }`}
                onClick={() =>
                  setFinanceOpen(
                    (value) => !value
                  )
                }
                aria-expanded={
                  financeOpen
                }
              >
                <span>
                  KEUANGAN
                </span>

                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={
                    financeOpen
                      ? 'rotated'
                      : ''
                  }
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>

              </button>


              <div
                className={`sidebar-subnav ${
                  financeOpen
                    ? 'open'
                    : ''
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
                      <Icon size={17} />

                      <span>
                        {label}
                      </span>
                    </Link>
                  )
                )}
              </div>

            </div>
          )}


          {session?.role === 'ADMIN' && (
            <div className="sidebar-nav-group system-group">

              <div className="sidebar-nav-label">
                SISTEM
              </div>

              <Link
                to="/pengaturan"
                onClick={closeSidebar}
                className={`nav-item ${
                  location.pathname ===
                  '/pengaturan'
                    ? 'active'
                    : ''
                }`}
              >
                <Settings size={18} />

                <span>
                  Pengaturan
                </span>
              </Link>

            </div>
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
          onClick={closeSidebar}
          aria-hidden="true"
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
