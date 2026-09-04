import React from 'react';
import { Link } from 'react-router-dom';

import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Coins,
  FileText,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react';

function rupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getFinance(data) {
  return {
    kas:
      data?.finance?.KAS || {
        saldo: 0,
        pemasukan: 0,
        pengeluaran: 0,
      },
    denda:
      data?.finance?.DENDA || {
        saldo: 0,
        pemasukan: 0,
        pengeluaran: 0,
      },
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  tone = 'neutral',
}) {
  return (
    <div className={`admin-simple-stat ${tone}`}>
      <div className="admin-simple-stat-icon">
        <Icon size={19} />
      </div>

      <div className="admin-simple-stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>
    </div>
  );
}

function AttentionRow({
  icon: Icon,
  title,
  description,
  value,
  tone,
  to,
}) {
  return (
    <Link
      to={to}
      className="admin-simple-attention"
    >
      <div className={`admin-simple-attention-icon ${tone}`}>
        <Icon size={17} />
      </div>

      <div className="admin-simple-attention-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <b>{value}</b>

      <ArrowRight size={16} />
    </Link>
  );
}

function AttendanceCard({
  icon: Icon,
  label,
  value,
  tone,
}) {
  return (
    <div className={`admin-simple-attendance ${tone}`}>
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  description,
  to,
  tone = 'neutral',
}) {
  return (
    <Link
      to={to}
      className={`admin-simple-quick ${tone}`}
    >
      <div className="admin-simple-quick-icon">
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

export default function AdminDashboard({
  data,
  session,
}) {
  const { kas, denda } = getFinance(data);

  const anggotaAktif =
    Number(data?.anggotaAktif || 0);

  const absensiHariIni =
    Number(data?.absensiHariIni || 0);

  const hadir =
    Number(data?.hadirHariIni || 0);

  const izin =
    Number(data?.izinHariIni || 0);

  const sakit =
    Number(data?.sakitHariIni || 0);

  const alpha =
    Number(data?.alphaHariIni || 0);

  const dendaBelumLunas =
    Number(data?.dendaBelumLunas || 0);

  const kasBelumBayar =
    Number(data?.kasBelumBayar || 0);

  const totalTerdata =
    hadir + izin + sakit + alpha;

  const coverage =
    anggotaAktif > 0
      ? Math.min(
          100,
          Math.round(
            (totalTerdata / anggotaAktif) * 100
          )
        )
      : 0;

  return (
    <div className="admin-simple-page">

      <section className="admin-simple-hero">
        <div className="admin-simple-hero-copy">
          <span>ADMIN UTAMA</span>

          <h1>
            Selamat datang,
            <br />
            {session?.username || 'Admin'}
          </h1>

          <p>
            Pantau kondisi PMR SMANEL
            dari satu halaman.
          </p>
        </div>

        <div className="admin-simple-hero-side">
          <div className="admin-simple-hero-badge">
            <span>Total Dana Aktif</span>
            <strong>{rupiah(kas.saldo)}</strong>
            <small>
              Saldo kas organisasi
            </small>
          </div>

          <Link
            to="/laporan"
            className="admin-simple-hero-button"
          >
            Lihat Laporan
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>


      <section className="admin-simple-stats">

        <StatCard
          icon={Users}
          label="Anggota Aktif"
          value={anggotaAktif}
          description="Total anggota aktif"
        />

        <StatCard
          icon={ClipboardCheck}
          label="Absensi Hari Ini"
          value={absensiHariIni}
          description={`${coverage}% data terisi`}
          tone="blue"
        />

        <StatCard
          icon={Coins}
          label="Denda Belum Lunas"
          value={rupiah(dendaBelumLunas)}
          description="Perlu ditindaklanjuti"
          tone="red"
        />

        <StatCard
          icon={Wallet}
          label="Saldo Kas"
          value={rupiah(kas.saldo)}
          description="Dana kas tersedia"
          tone="green"
        />

      </section>


      <section className="admin-simple-grid">

        <div className="admin-simple-panel">

          <div className="admin-simple-panel-head">
            <div>
              <span>KEHADIRAN</span>
              <h2>Kehadiran Hari Ini</h2>
            </div>

            <Link to="/absensi">
              Buka Absensi
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="admin-simple-attendance-grid">

            <AttendanceCard
              icon={CheckCircle2}
              label="Hadir"
              value={hadir}
              tone="green"
            />

            <AttendanceCard
              icon={ShieldCheck}
              label="Izin"
              value={izin}
              tone="blue"
            />

            <AttendanceCard
              icon={UserRound}
              label="Sakit"
              value={sakit}
              tone="orange"
            />

            <AttendanceCard
              icon={AlertTriangle}
              label="Alpha"
              value={alpha}
              tone="red"
            />

          </div>

          <div className="admin-simple-progress">
            <div className="admin-simple-progress-top">
              <span>
                Data kehadiran terisi
              </span>

              <strong>
                {totalTerdata} / {anggotaAktif}
              </strong>
            </div>

            <div className="admin-simple-progress-bar">
              <div
                style={{
                  width: `${coverage}%`,
                }}
              />
            </div>
          </div>

        </div>


        <div className="admin-simple-panel">

          <div className="admin-simple-panel-head">
            <div>
              <span>MONITORING</span>
              <h2>Perlu Perhatian</h2>
            </div>

            <AlertTriangle size={18} />
          </div>

          <div className="admin-simple-attention-list">

            <AttentionRow
              icon={Coins}
              title="Denda Belum Lunas"
              description="Piutang denda anggota"
              value={rupiah(dendaBelumLunas)}
              tone="red"
              to="/denda"
            />

            <AttentionRow
              icon={Wallet}
              title="Kas Belum Bayar"
              description="Kewajiban kas anggota"
              value={rupiah(kasBelumBayar)}
              tone="orange"
              to="/kas"
            />

            <AttentionRow
              icon={TrendingUp}
              title="Saldo Kas"
              description="Posisi dana kas saat ini"
              value={rupiah(kas.saldo)}
              tone="green"
              to="/keuangan"
            />

          </div>

        </div>

      </section>


      <section className="admin-simple-panel">

        <div className="admin-simple-panel-head">
          <div>
            <span>AKSES CEPAT</span>
            <h2>Menu Utama</h2>
          </div>
        </div>

        <div className="admin-simple-quick-grid">

          <QuickAction
            icon={CalendarDays}
            title="Kegiatan"
            description="Kelola kegiatan PMR"
            to="/kegiatan"
            tone="blue"
          />

          <QuickAction
            icon={ClipboardCheck}
            title="Absensi"
            description="Pantau kehadiran"
            to="/absensi"
            tone="green"
          />

          <QuickAction
            icon={Users}
            title="Anggota"
            description="Kelola data anggota"
            to="/anggota"
            tone="purple"
          />

          <QuickAction
            icon={FileText}
            title="Laporan"
            description="Lihat laporan lengkap"
            to="/laporan"
            tone="red"
          />

          <QuickAction
            icon={Settings}
            title="Pengaturan"
            description="Konfigurasi sistem"
            to="/pengaturan"
            tone="neutral"
          />

        </div>

      </section>

    </div>
  );
}
