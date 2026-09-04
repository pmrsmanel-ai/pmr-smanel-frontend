import React from 'react';

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  UserRound,
  Users,
  UserX,
  XCircle,
} from 'lucide-react';

function percent(value, total) {
  if (!total) return 0;

  return Math.min(
    100,
    Math.round(
      (Number(value || 0) /
        Number(total || 0)) *
        100
    )
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  meta,
}) {
  return (
    <div className={`secretary-stat-card ${tone}`}>
      <div className="secretary-stat-icon">
        <Icon size={19} />
      </div>

      <div className="secretary-stat-content">
        <span>{label}</span>

        <strong>{value}</strong>

        {meta && (
          <small>{meta}</small>
        )}
      </div>
    </div>
  );
}

function AttendanceRow({
  icon: Icon,
  label,
  value,
  total,
  tone,
}) {
  const percentage = percent(
    value,
    total
  );

  return (
    <div className="secretary-attendance-row">
      <div className="secretary-attendance-label">
        <div className={`secretary-attendance-icon ${tone}`}>
          <Icon size={16} />
        </div>

        <span>{label}</span>

        <strong>{value}</strong>
      </div>

      <div className="secretary-progress">
        <div
          className={`secretary-progress-bar ${tone}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <span className="secretary-progress-value">
        {percentage}%
      </span>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  subtitle,
}) {
  return (
    <a
      href={to}
      className="secretary-quick-action"
    >
      <div className="secretary-quick-icon">
        <Icon size={19} />
      </div>

      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>

      <ArrowRight size={17} />
    </a>
  );
}

export default function SecretaryDashboard({
  data,
}) {
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

  const statusTotal =
    hadir +
    izin +
    sakit +
    alpha;

  const completion =
    percent(
      absensiHariIni,
      anggotaAktif
    );

  const attendanceRate =
    percent(
      hadir,
      statusTotal
    );

  const today =
    new Intl.DateTimeFormat(
      'id-ID',
      {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    ).format(new Date());

  return (
    <div className="secretary-dashboard">

      <section className="secretary-hero">
        <div className="secretary-hero-copy">
          <span className="eyebrow">
            SEKRETARIS PMR SMANEL
          </span>

          <h1>
            Kehadiran &amp;
            <br />
            aktivitas hari ini
          </h1>

          <p>
            Pantau kondisi kehadiran anggota
            dan aktivitas organisasi dari
            satu halaman.
          </p>

          <div className="secretary-hero-meta">
            <span>
              <CalendarDays size={15} />
              {today}
            </span>

            <span>
              <Users size={15} />
              {anggotaAktif} anggota aktif
            </span>
          </div>
        </div>

        <div className="secretary-hero-action">
          <a
            href="/absensi"
            className="secretary-primary-action"
          >
            <ClipboardCheck size={18} />
            Buka Absensi
          </a>

          <a
            href="/kegiatan"
            className="secretary-secondary-action"
          >
            Kelola Kegiatan
            <ArrowRight size={16} />
          </a>
        </div>
      </section>


      <section className="secretary-stat-grid">

        <StatCard
          icon={Users}
          label="Anggota Aktif"
          value={anggotaAktif}
          tone="neutral"
          meta="Anggota terdaftar"
        />

        <StatCard
          icon={ClipboardCheck}
          label="Absensi Hari Ini"
          value={absensiHariIni}
          tone="blue"
          meta={`${completion}% data terisi`}
        />

        <StatCard
          icon={CheckCircle2}
          label="Hadir"
          value={hadir}
          tone="green"
          meta={`${attendanceRate}% dari status`}
        />

        <StatCard
          icon={UserRound}
          label="Izin"
          value={izin}
          tone="blue"
          meta="Perlu dokumentasi"
        />

        <StatCard
          icon={XCircle}
          label="Sakit"
          value={sakit}
          tone="orange"
          meta="Pantau kondisi"
        />

        <StatCard
          icon={UserX}
          label="Alpha"
          value={alpha}
          tone="red"
          meta="Perlu tindak lanjut"
        />

      </section>


      <section className="secretary-main-grid">

        <div className="secretary-panel">

          <div className="secretary-panel-header">
            <div>
              <span>
                ANALISIS KEHADIRAN
              </span>

              <h2>
                Ringkasan Kehadiran
              </h2>
            </div>

            <div className="secretary-panel-badge">
              {statusTotal} status
            </div>
          </div>


          <div className="secretary-attendance-list">

            <AttendanceRow
              icon={CheckCircle2}
              label="Hadir"
              value={hadir}
              total={statusTotal}
              tone="green"
            />

            <AttendanceRow
              icon={UserRound}
              label="Izin"
              value={izin}
              total={statusTotal}
              tone="blue"
            />

            <AttendanceRow
              icon={XCircle}
              label="Sakit"
              value={sakit}
              total={statusTotal}
              tone="orange"
            />

            <AttendanceRow
              icon={UserX}
              label="Alpha"
              value={alpha}
              total={statusTotal}
              tone="red"
            />

          </div>


          <div className="secretary-attendance-summary">

            <div>
              <span>
                Tingkat kehadiran
              </span>

              <strong>
                {attendanceRate}%
              </strong>
            </div>

            <div>
              <span>
                Data terisi
              </span>

              <strong>
                {absensiHariIni}/{anggotaAktif}
              </strong>
            </div>

            <div>
              <span>
                Belum tercatat
              </span>

              <strong>
                {Math.max(
                  0,
                  anggotaAktif -
                    absensiHariIni
                )}
              </strong>
            </div>

          </div>

        </div>


        <div className="secretary-panel">

          <div className="secretary-panel-header">
            <div>
              <span>
                STATUS HARI INI
              </span>

              <h2>
                Monitoring Cepat
              </h2>
            </div>

            <Clock3 size={19} />
          </div>


          <div className="secretary-status-stack">

            <div className="secretary-status-card green">
              <div>
                <strong>
                  Kehadiran positif
                </strong>

                <span>
                  Anggota hadir hari ini
                </span>
              </div>

              <b>{hadir}</b>
            </div>

            <div className="secretary-status-card blue">
              <div>
                <strong>
                  Izin
                </strong>

                <span>
                  Perlu dokumentasi
                </span>
              </div>

              <b>{izin}</b>
            </div>

            <div className="secretary-status-card orange">
              <div>
                <strong>
                  Sakit
                </strong>

                <span>
                  Pantau kondisi anggota
                </span>
              </div>

              <b>{sakit}</b>
            </div>

            <div className="secretary-status-card red">
              <div>
                <strong>
                  Alpha
                </strong>

                <span>
                  Perlu tindak lanjut
                </span>
              </div>

              <b>{alpha}</b>
            </div>

          </div>

        </div>

      </section>


      <section className="secretary-bottom-grid">

        <div className="secretary-panel secretary-activity-panel">

          <div className="secretary-panel-header">
            <div>
              <span>
                AKTIVITAS SEKRETARIS
              </span>

              <h2>
                Pusat Operasional
              </h2>
            </div>
          </div>

          <div className="secretary-quick-grid">

            <QuickAction
              to="/absensi"
              icon={ClipboardCheck}
              title="Absensi"
              subtitle="Catat kehadiran anggota"
            />

            <QuickAction
              to="/kegiatan"
              icon={CalendarDays}
              title="Kegiatan"
              subtitle="Kelola kegiatan aktif"
            />

            <QuickAction
              to="/anggota"
              icon={Users}
              title="Anggota"
              subtitle="Lihat data anggota"
            />

            <QuickAction
              to="/laporan"
              icon={FileText}
              title="Laporan"
              subtitle="Rekap administrasi"
            />

          </div>

        </div>


        <div className="secretary-panel secretary-completion-panel">

          <div className="secretary-panel-header">
            <div>
              <span>
                PROGRES
              </span>

              <h2>
                Pengisian Absensi
              </h2>
            </div>
          </div>

          <div
        className="secretary-completion-circle"
        style={{
          '--completion': completion,
        }}
      >
            <div>
              <strong>
                {completion}%
              </strong>

              <span>
                selesai
              </span>
            </div>
          </div>

          <p>
            {absensiHariIni >= anggotaAktif
              ? 'Seluruh anggota sudah memiliki status kehadiran.'
              : `${Math.max(
                  0,
                  anggotaAktif -
                    absensiHariIni
                )} anggota belum memiliki status kehadiran.`}
          </p>

          <a
            href="/absensi"
            className="secretary-outline-action"
          >
            Lanjutkan Absensi
            <ArrowRight size={16} />
          </a>

        </div>

      </section>

    </div>
  );
}