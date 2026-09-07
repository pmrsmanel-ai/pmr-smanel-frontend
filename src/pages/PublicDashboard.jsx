import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileSearch,
  FileText,
  Heart,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react';

import { getApi } from '../api';

function rupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

function formatDate(value) {
  if (!value) return '-';

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

function formatLongDate(value) {
  if (!value) return '-';

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

function MetricCard({
  icon: Icon,
  title,
  value,
  tone,
  clickable,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`public-v3-metric ${tone} ${clickable ? 'clickable' : ''}`}
    >
      <div className="public-v3-metric-icon">
        <Icon size={19} />
      </div>

      <div className="public-v3-metric-copy">
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

      {clickable && (
        <ChevronRight
          size={16}
          className="public-v3-metric-arrow"
        />
      )}
    </button>
  );
}

function AttendanceCard({
  label,
  value,
  tone,
  onClick,
}) {
  const Icon =
    tone === 'green'
      ? CheckCircle2
      : tone === 'red'
        ? Heart
        : tone === 'orange'
          ? Sparkles
          : Users;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`public-v3-attendance ${tone}`}
    >
      <div className="public-v3-attendance-icon">
        <Icon size={22} />
      </div>

      <span>{label}</span>
      <strong>{value}</strong>

      <small>
        <FileSearch size={12} />
        Detail
      </small>
    </button>
  );
}

function TransactionRow({
  title,
  count,
  tone,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="public-v3-transaction"
    >
      <div className={`public-v3-transaction-icon ${tone}`}>
        <FileText size={16} />
      </div>

      <div className="public-v3-transaction-copy">
        <strong>{title}</strong>
        <span> Lihat rincian data publik</span>
      </div>

      <b className={tone}>
        {count} Record
      </b>

      <ChevronRight size={17} />
    </button>
  );
}

function DetailModal({
  title,
  description,
  rows,
  kind,
  onClose,
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = normalize(search);

    if (!q) return rows;

    return rows.filter((row) =>
      [
        row.nama,
        row.idAnggota,
        row.kelas,
        row.status,
        row.jenis,
        row.kegiatan,
        row.keperluan,
        row.sumber,
        row.referensi,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  return (
    <div className="public-v3-modal-backdrop">
      <div className="public-v3-modal">
        <div className="public-v3-modal-head">
          <div>
            <span>TRANSPARANSI PUBLIK</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>

          <button
            type="button"
            className="public-v3-modal-close"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="public-v3-modal-tools">
          <div className="public-v3-search">
            <Search size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, ID anggota, kelas..."
            />
          </div>

          <span>{filtered.length} record</span>
        </div>

        <div className="public-v3-table-wrap">
          <table className="public-v3-table">
            <thead>
              <tr>
                <th>ANGGOTA</th>
                <th>KELAS</th>
                {kind === 'attendance' && (
                  <>
                    <th>KEGIATAN</th>
                    <th>STATUS</th>
                    <th>TANGGAL</th>
                  </>
                )}
                {kind === 'finance' && (
                  <>
                    <th>DETAIL</th>
                    <th>NOMINAL</th>
                    <th>STATUS</th>
                    <th>TANGGAL</th>
                  </>
                )}
                {kind === 'expense' && (
                  <>
                    <th>SUMBER</th>
                    <th>KEPERLUAN</th>
                    <th>NOMINAL</th>
                    <th>TANGGAL</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {filtered.map((row, index) => (
                <tr key={`${row.referensi || row.absensiId || index}-${index}`}>
                  <td>
                    <div className="public-v3-person">
                      <div className="public-v3-avatar">
                        <Users size={15} />
                      </div>

                      <div>
                        <strong>{row.nama || '-'}</strong>
                        <span>{row.idAnggota || '-'}</span>
                      </div>
                    </div>
                  </td>

                  <td>{row.kelas || '-'}</td>

                  {kind === 'attendance' && (
                    <>
                      <td>{row.kegiatan || '-'}</td>
                      <td>
                        <span className={`public-v3-status ${normalize(row.status)}`}>
                          {row.status || '-'}
                        </span>
                      </td>
                      <td>{formatDate(row.tanggal)}</td>
                    </>
                  )}

                  {kind === 'finance' && (
                    <>
                      <td>
                        {row.kegiatan || row.jenis || '-'}
                      </td>
                      <td>
                        <strong className={normalize(row.status).includes('belum') ? 'public-v3-money danger' : 'public-v3-money'}>
                          {rupiah(row.nominal)}
                        </strong>
                      </td>
                      <td>
                        <span className={`public-v3-status ${normalize(row.status)}`}>
                          {row.status || '-'}
                        </span>
                      </td>
                      <td>{formatDate(row.tanggal)}</td>
                    </>
                  )}

                  {kind === 'expense' && (
                    <>
                      <td>{row.sumber || '-'}</td>
                      <td>{row.keperluan || '-'}</td>
                      <td>
                        <strong className="public-v3-money danger">
                          {rupiah(row.nominal)}
                        </strong>
                      </td>
                      <td>{formatDate(row.tanggal)}</td>
                    </>
                  )}
                </tr>
              ))}

              {!filtered.length && (
                <tr>
                  <td
                    colSpan="8"
                    className="public-v3-empty"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function PublicDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);

  async function load() {
    setError('');

    try {
      const result = await getApi('public.dashboard', {});
      setData(result);
    } catch (err) {
      setError(
        err.message || 'Gagal memuat laporan publik.'
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return (
      <div className="public-v3-error">
        <div>
          <ShieldCheck size={30} />
          <h2>Laporan publik tidak tersedia</h2>
          <p>{error}</p>
          <button type="button" onClick={load}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="public-v3-loading">
        <div className="public-v3-loading-orb">
          <Sparkles size={24} />
        </div>
        <strong>Menyiapkan Laporan Publik</strong>
        <span>Mengambil data terbaru PMR SMANEL...</span>
      </div>
    );
  }

  const finance = data.finance || {};
  const kas = finance.KAS || {};
  const denda = finance.DENDA || {};
  const attendance = data.presensiTerakhir || {};

  const heroDate =
    data.updatedAt
      ? formatLongDate(data.updatedAt)
      : formatLongDate(new Date());

  function openDetail(type) {
    const rows = data.details?.[type] || [];

    const map = {
      KAS_LUNAS: {
        title: 'Dana Kas (Lunas)',
        description:
          'Riwayat pembayaran Kas anggota yang telah tercatat.',
        kind: 'finance',
      },
      DENDA_LUNAS: {
        title: 'Dana Denda (Lunas)',
        description:
          'Riwayat pembayaran Denda anggota yang telah lunas.',
        kind: 'finance',
      },
      KAS_TUNGGAKAN: {
        title: 'Tunggakan Kas',
        description:
          'Daftar kewajiban Kas anggota yang masih aktif.',
        kind: 'finance',
      },
      DENDA_TUNGGAKAN: {
        title: 'Tunggakan Denda',
        description:
          'Daftar Denda anggota yang masih belum lunas.',
        kind: 'finance',
      },
      PENGELUARAN: {
        title: 'Log Pengeluaran',
        description:
          'Daftar penggunaan dana yang telah dicatat.',
        kind: 'expense',
      },
      PRESENSI_HADIR: {
        title: 'Anggota Hadir',
        description:
          'Anggota yang hadir pada presensi terbaru.',
        kind: 'attendance',
      },
      PRESENSI_ALPHA: {
        title: 'Anggota Alpha',
        description:
          'Anggota yang tercatat Alpha pada presensi terbaru.',
        kind: 'attendance',
      },
      PRESENSI_SAKIT: {
        title: 'Anggota Sakit',
        description:
          'Anggota yang tercatat Sakit pada presensi terbaru.',
        kind: 'attendance',
      },
      PRESENSI_IZIN: {
        title: 'Anggota Izin',
        description:
          'Anggota yang tercatat Izin pada presensi terbaru.',
        kind: 'attendance',
      },
    };

    setDetail({
      type,
      rows,
      ...map[type],
    });
  }

  return (
    <div className="public-v3-page">
      <header className="public-v3-topbar">
     <Link
  to="/"
  className="public-v3-brand"
  aria-label="PMR SMANEL"
>
  <img
    src={`${import.meta.env.BASE_URL}logo-pmr-smanel.png`}
    alt="Logo PMR SMANEL"
    className="public-v3-brand-logo"
    onError={(event) => {
      event.currentTarget.style.display = 'none';
      event.currentTarget.nextElementSibling?.classList.add('is-visible');
    }}
  />
  <span className="public-v3-brand-fallback" aria-hidden="true">PMR</span>

  <div className="public-v3-brand-text">
    <strong>PMR SMANEL</strong>
    <span>PALANG MERAH REMAJA</span>
  </div>
</Link>

        <Link to="/login" className="public-v3-login">
          <LockKeyhole size={15} />
          Login Pengurus
          <ArrowRight size={15} />
        </Link>
      </header>

      <main>
        <section
          id="beranda"
          className="public-v3-hero"
        >
          <div className="public-v3-hero-copy">
            <span className="public-v3-pill">
              <Sparkles size={12} />
              Portal Transparansi PMR SMANEL
            </span>

            <h1>
              Laporan Publik
              <br />
              <strong>PMR SMANEL</strong>
            </h1>

            <p>
              Informasi kehadiran anggota dan ringkasan
              arus kas organisasi disajikan secara terbuka,
              ringkas, dan mudah dipahami.
            </p>

            <div className="public-v3-update-chip">
              <Clock3 size={14} />
              Data diperbarui {heroDate}
            </div>

            <div className="public-v3-hero-actions">
              <a href="#laporan" className="public-v3-primary-btn">
                Lihat Laporan
                <ArrowRight size={16} />
              </a>

              <a href="#tentang" className="public-v3-secondary-btn">
                Tentang Sistem
              </a>
            </div>
          </div>

          <div className="public-v3-hero-art" aria-hidden="true">
            <div className="public-v4-orbit orbit-one" />
            <div className="public-v4-orbit orbit-two" />

            <div className="public-v4-board">
              <div className="public-v4-board-head">
                <div>
                  <span>PMR SMANEL</span>
                  <strong>Transparency Overview</strong>
                </div>
                <span className="public-v4-live-dot">LIVE</span>
              </div>

              <div className="public-v4-board-balance">
                <span>Saldo organisasi</span>
                <strong>{rupiah(Number(kas.saldo || 0) + Number(denda.saldo || 0))}</strong>
                <small>Kas + Denda tercatat</small>
              </div>

              <div className="public-v4-board-grid">
                <div className="public-v4-mini-card">
                  <Wallet size={16} />
                  <span>Kas</span>
                  <strong>{rupiah(kas.saldo)}</strong>
                </div>
                <div className="public-v4-mini-card">
                  <Users size={16} />
                  <span>Anggota</span>
                  <strong>{data.anggotaAktif || 0}</strong>
                </div>
                <div className="public-v4-mini-card">
                  <BarChart3 size={16} />
                  <span>Pemasukan</span>
                  <strong>{rupiah(data.totalPemasukan)}</strong>
                </div>
                <div className="public-v4-mini-card">
                  <ShieldCheck size={16} />
                  <span>Piutang</span>
                  <strong>{rupiah(Number(data.tunggakanKas?.total || 0) + Number(data.tunggakanDenda?.total || 0))}</strong>
                </div>
              </div>
            </div>

            <div className="public-v4-float-card float-top">
              <CheckCircle2 size={15} />
              <div>
                <span>Kehadiran terakhir</span>
                <strong>{attendance.hadir || 0} hadir</strong>
              </div>
            </div>

            <div className="public-v4-float-card float-bottom">
              <LockKeyhole size={14} />
              <div>
                <span>Data publik</span>
                <strong>Terverifikasi</strong>
              </div>
            </div>
          </div>
        </section>

        <section
          id="laporan"
          className="public-v3-metrics-wrap"
        >
          <MetricCard
            icon={Wallet}
            title="Saldo Kas Aktif"
            value={rupiah(kas.saldo)}
            tone="purple"
          />

          <MetricCard
            icon={Wallet}
            title="Saldo Denda Terkumpul"
            value={rupiah(denda.saldo)}
            tone="pink"
          />

          <MetricCard
            icon={TrendingUp}
            title="Pemasukan Kas"
            value={rupiah(kas.pemasukan)}
            tone="green"
            clickable
            onClick={() => openDetail('KAS_LUNAS')}
          />

          <MetricCard
            icon={ArrowDownLeft}
            title="Tunggakan Kas"
            value={rupiah(data.tunggakanKas?.total)}
            tone="orange"
            clickable
            onClick={() => openDetail('KAS_TUNGGAKAN')}
          />

          <MetricCard
            icon={ShieldCheck}
            title="Tunggakan Denda"
            value={rupiah(data.tunggakanDenda?.total)}
            tone="red"
            clickable
            onClick={() => openDetail('DENDA_TUNGGAKAN')}
          />

          <MetricCard
            icon={ArrowUpRight}
            title="Total Pengeluaran"
            value={rupiah(data.totalPengeluaran)}
            tone="violet"
            clickable
            onClick={() => openDetail('PENGELUARAN')}
          />
        </section>

        <section className="public-v3-content-grid">
          <div className="public-v3-panel">
            <div className="public-v3-panel-head">
              <div>
                <span>AKTIVITAS TERBARU</span>
                <h2>
                  <CalendarDays size={18} />
                  Ringkasan Presensi Terakhir
                </h2>
              </div>

              <span className="public-v3-count-pill">
                {data.anggotaAktif} Anggota
              </span>
            </div>

            <div className="public-v3-attendance-title">
              <strong>
                {attendance.kegiatan || 'Belum ada kegiatan'}
              </strong>
              <span>
                <CalendarDays size={13} />
                {formatDate(attendance.tanggal)}
              </span>
            </div>

            <div className="public-v3-attendance-grid">
              <AttendanceCard
                label="HADIR"
                value={attendance.hadir || 0}
                tone="green"
                onClick={() => openDetail('PRESENSI_HADIR')}
              />

              <AttendanceCard
                label="ALPHA"
                value={attendance.alpha || 0}
                tone="red"
                onClick={() => openDetail('PRESENSI_ALPHA')}
              />

              <AttendanceCard
                label="SAKIT"
                value={attendance.sakit || 0}
                tone="orange"
                onClick={() => openDetail('PRESENSI_SAKIT')}
              />

              <AttendanceCard
                label="IZIN"
                value={attendance.izin || 0}
                tone="blue"
                onClick={() => openDetail('PRESENSI_IZIN')}
              />
            </div>

            <div className="public-v3-panel-foot">
              <span>
                <Users size={13} />
                Data kehadiran ditampilkan untuk
                keterbukaan informasi organisasi.
              </span>
            </div>
          </div>

          <div className="public-v3-panel">
            <div className="public-v3-panel-head">
              <div>
                <span>KEUANGAN ORGANISASI</span>
                <h2>
                  <BarChart3 size={18} />
                  Rincian Total Transaksi
                </h2>
              </div>

              <span className="public-v3-soft-label">
                Real-time
              </span>
            </div>

            <div className="public-v3-panel-desc">
              Klik salah satu baris untuk melihat
              data rinci publik.
            </div>

            <div className="public-v3-transaction-list">
              <TransactionRow
                title="Dana Kas (Lunas)"
                count={data.transaksi?.kasLunas || 0}
                tone="green"
                onClick={() => openDetail('KAS_LUNAS')}
              />

              <TransactionRow
                title="Dana Denda (Lunas)"
                count={data.transaksi?.dendaLunas || 0}
                tone="pink"
                onClick={() => openDetail('DENDA_LUNAS')}
              />

              <TransactionRow
                title="Tunggakan Kas"
                count={data.transaksi?.kasTunggakan || 0}
                tone="orange"
                onClick={() => openDetail('KAS_TUNGGAKAN')}
              />

              <TransactionRow
                title="Tunggakan Denda"
                count={data.transaksi?.dendaTunggakan || 0}
                tone="red"
                onClick={() => openDetail('DENDA_TUNGGAKAN')}
              />

              <TransactionRow
                title="Log Pengeluaran"
                count={data.transaksi?.pengeluaran || 0}
                tone="violet"
                onClick={() => openDetail('PENGELUARAN')}
              />
            </div>
          </div>
        </section>

        <section className="public-v3-stat-strip">
          <div>
            <div className="public-v3-strip-icon purple">
              <Users size={17} />
            </div>
            <span>Anggota Aktif</span>
            <strong>{data.anggotaAktif || 0}</strong>
          </div>

          <div>
            <div className="public-v3-strip-icon pink">
              <CalendarDays size={17} />
            </div>
            <span>Kegiatan Terakhir</span>
            <strong>{attendance.total || 0}</strong>
          </div>

          <div>
            <div className="public-v3-strip-icon green">
              <TrendingUp size={17} />
            </div>
            <span>Total Pemasukan</span>
            <strong>{rupiah(data.totalPemasukan)}</strong>
          </div>

          <div>
            <div className="public-v3-strip-icon orange">
              <ShieldCheck size={17} />
            </div>
            <span>Total Piutang</span>
            <strong>
              {rupiah(
                Number(data.tunggakanKas?.total || 0) +
                Number(data.tunggakanDenda?.total || 0)
              )}
            </strong>
          </div>
        </section>

        <section
          id="tentang"
          className="public-v3-cta"
        >
          <div className="public-v3-cta-icon">
            <Heart size={28} />
          </div>

          <div className="public-v3-cta-copy">
            <span>TRANSPARANSI, KEPEDULIAN, AKSI</span>
            <h2>
              Bersama PMR SMANEL, transparansi menjadi
              bagian dari budaya organisasi.
            </h2>
            <p>
              Informasi kehadiran dan ringkasan keuangan
              disajikan agar seluruh anggota dapat
              mengetahui perkembangan organisasi.
            </p>
          </div>

          <a
            href="#laporan"
            className="public-v3-cta-button"
          >
            Lihat Laporan
            <ArrowRight size={16} />
          </a>

          <div className="public-v3-cta-decoration">
            <div className="bubble bubble-one" />
            <div className="bubble bubble-two" />
            <div className="bubble bubble-three" />
          </div>
        </section>
      </main>

      <footer className="public-v3-footer">
        <span>PMR SMANEL MANAGEMENT SYSTEM</span>
        <span>
          Transparan • Terpercaya • Menginspirasi
        </span>
      </footer>

      {detail && (
        <DetailModal
          title={detail.title}
          description={detail.description}
          rows={detail.rows}
          kind={detail.kind}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}