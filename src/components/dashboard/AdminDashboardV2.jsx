import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Coins,
  FileText,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Info,
} from 'lucide-react';

function rupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function todayLabel() {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

function KpiCard({
  icon: Icon,
  label,
  value,
  meta,
  tone = 'red',
  to,
}) {
  const content = (
    <>
      <div className={`admin-v2-kpi-icon ${tone}`}>
        <Icon size={20} />
      </div>
      <div className="admin-v2-kpi-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{meta}</small>
      </div>
      {to && <ArrowRight className="admin-v2-kpi-arrow" size={17} />}
    </>
  );

  return to ? (
    <Link to={to} className={`admin-v2-kpi ${tone}`}>
      {content}
    </Link>
  ) : (
    <div className={`admin-v2-kpi ${tone}`}>
      {content}
    </div>
  );
}

function StatusStat({ icon: Icon, label, value, tone }) {
  return (
    <div className={`admin-v2-status ${tone}`}>
      <div className="admin-v2-status-icon">
        <Icon size={17} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function QuickLink({ icon: Icon, title, description, to, tone = 'neutral' }) {
  return (
    <Link to={to} className={`admin-v2-quick ${tone}`}>
      <div className="admin-v2-quick-icon">
        <Icon size={18} />
      </div>
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <ArrowRight size={15} />
    </Link>
  );
}

function Bar({ label, income, expense, max }) {
  const incomePct = max > 0 ? Math.max(5, Math.round((income / max) * 100)) : 5;
  const expensePct = max > 0 ? Math.max(5, Math.round((expense / max) * 100)) : 5;

  return (
    <div className="admin-v2-bar-row">
      <div className="admin-v2-bar-label">{label}</div>
      <div className="admin-v2-bar-track">
        <span className="admin-v2-bar-income" style={{ width: `${incomePct}%` }} />
        <span className="admin-v2-bar-expense" style={{ width: `${expensePct}%` }} />
      </div>
    </div>
  );
}

export default function AdminDashboardV2({ data, session }) {
  const kas = data?.finance?.KAS || {
    saldo: 0,
    pemasukan: 0,
    pengeluaran: 0,
  };

  const denda = data?.finance?.DENDA || {
    saldo: 0,
    pemasukan: 0,
    pengeluaran: 0,
  };

  const anggotaAktif = Number(data?.anggotaAktif || 0);
  const absensiHariIni = Number(data?.absensiHariIni || 0);
  const hadir = Number(data?.hadirHariIni || 0);
  const izin = Number(data?.izinHariIni || 0);
  const sakit = Number(data?.sakitHariIni || 0);
  const alpha = Number(data?.alphaHariIni || 0);
  const dendaBelumLunas = Number(data?.dendaBelumLunas || 0);
  const kasBelumBayar = Number(data?.kasBelumBayar || 0);

  const totalPemasukan =
    Number(kas.pemasukan || 0) +
    Number(denda.pemasukan || 0);

  const totalPengeluaran =
    Number(kas.pengeluaran || 0) +
    Number(denda.pengeluaran || 0);

  const totalDana = Number(
    data?.finance?.totalDana ??
      Number(kas.saldo || 0) +
      Number(denda.saldo || 0)
  );

  const totalPiutang = Number(
    data?.finance?.totalPiutang ??
      Number(kasBelumBayar || 0) +
      Number(dendaBelumLunas || 0)
  );

  const attendanceTotal =
    hadir + izin + sakit + alpha;

  const attendanceRate =
    attendanceTotal > 0
      ? Math.round((hadir / attendanceTotal) * 100)
      : 0;

  const attendanceCoverage =
    anggotaAktif > 0
      ? Math.min(
          100,
          Math.round((absensiHariIni / anggotaAktif) * 100)
        )
      : 0;

  const chartMax = Math.max(
    totalPemasukan,
    totalPengeluaran,
    kas.pemasukan,
    kas.pengeluaran,
    denda.pemasukan,
    denda.pengeluaran,
    1
  );

  return (
    <div className="admin-v2-page">
      <section className="admin-v2-hero">
        <div className="admin-v2-hero-copy">
          <span className="admin-v2-eyebrow">
            TERBUKA • AKUNTABEL • BERSAMA
          </span>

          <h1>
            Selamat datang,
            <strong>{session?.username || 'Admin'}</strong>
          </h1>

          <p>
            Kelola data absensi, keuangan, dan kegiatan PMR SMANEL
            dengan lebih cepat, rapi, dan transparan.
          </p>

          <div className="admin-v2-hero-actions">
            <Link to="/laporan" className="admin-v2-primary">
              Buka Laporan
              <ArrowRight size={16} />
            </Link>

            <Link to="/kegiatan" className="admin-v2-secondary">
              Kegiatan PMR
            </Link>
          </div>
        </div>

        <div className="admin-v2-hero-media">
          <img
            src={`${import.meta.env.BASE_URL}hero-pmr-smanel.webp`}
            alt="Kegiatan PMR SMAN 1 Aikmel"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
              event.currentTarget.parentElement.classList.add('image-fallback');
            }}
          />

          <div className="admin-v2-hero-overlay">
            <span>PMR SMAN 1 AIKMEL</span>
            <strong>Together We Can</strong>
            <small>We Are Not Alone</small>
          </div>

          <div className="admin-v2-live-badge">
            <span />
            Dashboard aktif
          </div>
        </div>
      </section>

      <section className="admin-v2-section-head">
        <div>
          <span>RINGKASAN SISTEM</span>
          <h2>Monitoring utama</h2>
          <p>Pantau kondisi operasional dan keuangan PMR dalam satu layar.</p>
        </div>

        <div className="admin-v2-date">
          <CalendarDays size={15} />
          {todayLabel()}
        </div>
      </section>

      <section className="admin-v2-kpi-grid">
        <KpiCard
          icon={Users}
          label="Anggota Aktif"
          value={anggotaAktif}
          meta="Total anggota aktif"
          tone="red"
          to="/anggota"
        />
        <KpiCard
          icon={ClipboardCheck}
          label="Absensi Hari Ini"
          value={absensiHariIni}
          meta={`${attendanceCoverage}% data tercatat`}
          tone="blue"
          to="/absensi"
        />
        <KpiCard
          icon={Coins}
          label="Denda Belum Lunas"
          value={rupiah(dendaBelumLunas)}
          meta="Perlu ditindaklanjuti"
          tone="gold"
          to="/denda"
        />
        <KpiCard
          icon={Wallet}
          label="Kas Belum Bayar"
          value={rupiah(kasBelumBayar)}
          meta="Kewajiban terbuka"
          tone="green"
          to="/kas"
        />
        <KpiCard
          icon={Wallet}
          label="Saldo Kas"
          value={rupiah(kas.saldo)}
          meta="Saldo kas saat ini"
          tone="purple"
          to="/keuangan"
        />
      </section>

      <section className="admin-v2-content-grid">
        <div className="admin-v2-card">
          <div className="admin-v2-card-head">
            <div>
              <span>STATISTIK KEHADIRAN</span>
              <h3>Absensi hari ini</h3>
            </div>
            <div className="admin-v2-card-head-icon blue">
              <ClipboardCheck size={18} />
            </div>
          </div>

          <div className="admin-v2-attendance-summary">
            <div className="admin-v2-attendance-rate">
              <strong>{attendanceRate}%</strong>
              <span>hadir</span>
            </div>

            <div className="admin-v2-attendance-stats">
              <StatusStat
                icon={CheckCircle2}
                label="Hadir"
                value={hadir}
                tone="green"
              />
              <StatusStat
                icon={ShieldCheck}
                label="Izin"
                value={izin}
                tone="blue"
              />
              <StatusStat
                icon={Info}
                label="Sakit"
                value={sakit}
                tone="gold"
              />
              <StatusStat
                icon={ShieldAlert}
                label="Alpha"
                value={alpha}
                tone="red"
              />
            </div>
          </div>

          <div className="admin-v2-progress">
            <div className="admin-v2-progress-head">
              <span>Kelengkapan data</span>
              <strong>{attendanceCoverage}%</strong>
            </div>
            <div className="admin-v2-progress-track">
              <div style={{ width: `${attendanceCoverage}%` }} />
            </div>
          </div>
        </div>

        <div className="admin-v2-card">
          <div className="admin-v2-card-head">
            <div>
              <span>ARUS DANA</span>
              <h3>Pemasukan vs Pengeluaran</h3>
            </div>
            <div className="admin-v2-card-head-icon red">
              <TrendingUp size={18} />
            </div>
          </div>

          <div className="admin-v2-chart-legend">
            <span><i className="income" /> Pemasukan</span>
            <span><i className="expense" /> Pengeluaran</span>
          </div>

          <div className="admin-v2-bars">
            <Bar
              label="Kas"
              income={Number(kas.pemasukan || 0)}
              expense={Number(kas.pengeluaran || 0)}
              max={chartMax}
            />
            <Bar
              label="Denda"
              income={Number(denda.pemasukan || 0)}
              expense={Number(denda.pengeluaran || 0)}
              max={chartMax}
            />
            <Bar
              label="Total"
              income={totalPemasukan}
              expense={totalPengeluaran}
              max={chartMax}
            />
          </div>

          <div className="admin-v2-finance-footer">
            <div>
              <span>Total pemasukan</span>
              <strong>{rupiah(totalPemasukan)}</strong>
            </div>
            <div>
              <span>Total pengeluaran</span>
              <strong>{rupiah(totalPengeluaran)}</strong>
            </div>
          </div>
        </div>

        <div className="admin-v2-card">
          <div className="admin-v2-card-head">
            <div>
              <span>INFORMASI TERKINI</span>
              <h3>Perlu perhatian</h3>
            </div>
            <ShieldAlert size={18} />
          </div>

          <div className="admin-v2-alert-list">
            <Link to="/denda" className="admin-v2-alert-item red">
              <div className="admin-v2-alert-icon"><Coins size={16} /></div>
              <div>
                <strong>Denda belum lunas</strong>
                <span>Piutang anggota</span>
              </div>
              <b>{rupiah(dendaBelumLunas)}</b>
            </Link>

            <Link to="/kas" className="admin-v2-alert-item gold">
              <div className="admin-v2-alert-icon"><Wallet size={16} /></div>
              <div>
                <strong>Kas belum bayar</strong>
                <span>Kewajiban kas anggota</span>
              </div>
              <b>{rupiah(kasBelumBayar)}</b>
            </Link>

            <Link to="/keuangan" className="admin-v2-alert-item green">
              <div className="admin-v2-alert-icon"><TrendingUp size={16} /></div>
              <div>
                <strong>Saldo kas tersedia</strong>
                <span>Posisi dana aktif</span>
              </div>
              <b>{rupiah(kas.saldo)}</b>
            </Link>

            <Link to="/laporan" className="admin-v2-alert-item blue">
              <div className="admin-v2-alert-icon"><FileText size={16} /></div>
              <div>
                <strong>Total piutang</strong>
                <span>Kas + denda</span>
              </div>
              <b>{rupiah(totalPiutang)}</b>
            </Link>
          </div>
        </div>
      </section>

      <section className="admin-v2-bottom-grid">
        <div className="admin-v2-card">
          <div className="admin-v2-card-head">
            <div>
              <span>AKSES CEPAT</span>
              <h3>Menu utama</h3>
            </div>
          </div>

          <div className="admin-v2-quick-grid">
            <QuickLink
              icon={CalendarDays}
              title="Kegiatan"
              description="Kelola agenda PMR"
              to="/kegiatan"
              tone="blue"
            />
            <QuickLink
              icon={ClipboardCheck}
              title="Absensi"
              description="Catat kehadiran"
              to="/absensi"
              tone="green"
            />
            <QuickLink
              icon={Users}
              title="Anggota"
              description="Kelola data anggota"
              to="/anggota"
              tone="purple"
            />
            <QuickLink
              icon={FileText}
              title="Laporan"
              description="Pusat laporan"
              to="/laporan"
              tone="red"
            />
          </div>
        </div>

        <div className="admin-v2-card admin-v2-quote-card">
          <span>PMR SMAN 1 AIKMEL</span>
          <blockquote>
            “Bersama dalam kemanusiaan,
            melangkah untuk perubahan yang lebih baik.”
          </blockquote>
          <div className="admin-v2-quote-mark">“</div>
        </div>
      </section>
    </div>
  );
}
