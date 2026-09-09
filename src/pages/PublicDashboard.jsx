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
  Info,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserRound,
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

function MetricCard({ icon: Icon, title, value, caption, tone = 'red', onClick }) {
  const clickable = Boolean(onClick);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`public-v9-kpi public-v9-${tone} ${clickable ? 'is-clickable' : ''}`}
    >
      <div className="public-v9-kpi-icon"><Icon size={20} /></div>
      <div className="public-v9-kpi-copy">
        <span>{title}</span>
        <strong>{value}</strong>
        {caption && <small>{caption}</small>}
      </div>
      {clickable && <ChevronRight size={17} className="public-v9-kpi-arrow" />}
    </button>
  );
}

function FeatureCard({ icon: Icon, title, description, to, tone, action }) {
  return (
    <div className={`public-v9-feature public-v9-feature-${tone}`}>
      <div className="public-v9-feature-icon"><Icon size={24} /></div>
      <div className="public-v9-feature-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <Link to={to} className="public-v9-feature-btn">
        {action}<ArrowRight size={15} />
      </Link>
      <div className="public-v9-feature-decoration" aria-hidden="true" />
    </div>
  );
}

function AttendanceStat({ label, value, tone, onClick }) {
  const icon = tone === 'green' ? CheckCircle2 : tone === 'red' ? TrendingDown : tone === 'orange' ? Info : Users;
  const Icon = icon;
  return (
    <button type="button" className={`public-v9-attendance-stat ${tone}`} onClick={onClick}>
      <Icon size={17} />
      <span>{label}</span>
      <strong>{value}</strong>
    </button>
  );
}

function DetailModal({ title, description, rows, kind, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = normalize(search);
    if (!q) return rows;
    return rows.filter((row) => [
      row.nama, row.idAnggota, row.kelas, row.status, row.jenis,
      row.kegiatan, row.keperluan, row.sumber, row.referensi,
    ].join(' ').toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <div className="public-v9-modal-backdrop">
      <div className="public-v9-modal">
        <div className="public-v9-modal-head">
          <div>
            <span>TRANSPARANSI PUBLIK</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <button type="button" className="public-v9-modal-close" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>
        <div className="public-v9-modal-tools">
          <div className="public-v9-search">
            <Search size={15} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, ID anggota, kelas..." />
          </div>
          <span>{filtered.length} record</span>
        </div>
        <div className="public-v9-table-wrap">
          <table className="public-v9-table">
            <thead>
              <tr>
                <th>ANGGOTA</th>
                <th>KELAS</th>
                {kind === 'attendance' && <><th>KEGIATAN</th><th>STATUS</th><th>TANGGAL</th></>}
                {kind === 'finance' && <><th>DETAIL</th><th>NOMINAL</th><th>STATUS</th><th>TANGGAL</th></>}
                {kind === 'expense' && <><th>SUMBER</th><th>KEPERLUAN</th><th>NOMINAL</th><th>TANGGAL</th></>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, index) => (
                <tr key={`${row.referensi || row.absensiId || index}-${index}`}>
                  <td><div className="public-v9-person"><div className="public-v9-avatar"><Users size={15} /></div><div><strong>{row.nama || '-'}</strong><span>{row.idAnggota || '-'}</span></div></div></td>
                  <td>{row.kelas || '-'}</td>
                  {kind === 'attendance' && <><td>{row.kegiatan || '-'}</td><td><span className={`public-v9-status ${normalize(row.status)}`}>{row.status || '-'}</span></td><td>{formatDate(row.tanggal)}</td></>}
                  {kind === 'finance' && <><td>{row.kegiatan || row.jenis || '-'}</td><td><strong className="public-v9-money">{rupiah(row.nominal)}</strong></td><td><span className={`public-v9-status ${normalize(row.status)}`}>{row.status || '-'}</span></td><td>{formatDate(row.tanggal)}</td></>}
                  {kind === 'expense' && <><td>{row.sumber || '-'}</td><td>{row.keperluan || '-'}</td><td><strong className="public-v9-money danger">{rupiah(row.nominal)}</strong></td><td>{formatDate(row.tanggal)}</td></>}
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan="8" className="public-v9-empty">Data tidak ditemukan.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function monthKey(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
  const [y, m] = String(key).split('-').map(Number);
  if (!y || !m) return '-';
  return new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(y, m - 1, 1));
}

export default function PublicDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);

  async function load() {
    setError('');
    try {
      setData(await getApi('public.dashboard', {}));
    } catch (err) {
      setError(err.message || 'Gagal memuat laporan publik.');
    }
  }

  useEffect(() => { load(); }, []);

  if (error) {
    return <div className="public-v9-state"><ShieldCheck size={32} /><h2>Laporan publik tidak tersedia</h2><p>{error}</p><button type="button" onClick={load}>Coba Lagi</button></div>;
  }
  if (!data) {
    return <div className="public-v9-state"><div className="public-v9-state-icon"><Sparkles size={24} /></div><strong>Menyiapkan Laporan Publik</strong><span>Mengambil data terbaru PMR SMANEL...</span></div>;
  }

  const finance = data?.finance || {};
  const kas = finance.KAS || {};
  const denda = finance.DENDA || {};
  const attendance = data.presensiTerakhir || {};
  const details = data.details || {};
  const totalPiutang = Number(data.tunggakanKas?.total || 0) + Number(data.tunggakanDenda?.total || 0);
  const totalAttendance = Number(attendance.hadir || 0) + Number(attendance.izin || 0) + Number(attendance.sakit || 0) + Number(attendance.alpha || 0);
  const attendanceRate = totalAttendance > 0 ? Math.round((Number(attendance.hadir || 0) / totalAttendance) * 100) : 0;
  const heroDate = data.updatedAt ? formatLongDate(data.updatedAt) : formatLongDate(new Date());

  const incomeRows = details.KAS_LUNAS || [];
  const expenseRows = details.PENGELUARAN || [];
  const buckets = {};
  [...incomeRows, ...expenseRows].forEach((row) => {
    const key = monthKey(row.tanggal);
    if (!key) return;
    if (!buckets[key]) buckets[key] = { income: 0, expense: 0 };
    const amount = Number(row.nominal || 0);
    if (incomeRows.includes(row)) buckets[key].income += amount;
    else buckets[key].expense += amount;
  });
  const chartKeys = Object.keys(buckets).sort().slice(-6);
  const chart = chartKeys.length
    ? chartKeys.map((key) => ({ key, label: monthLabel(key), ...buckets[key] }))
    : [{ key: 'current', label: 'Kini', income: Number(kas.pemasukan || 0), expense: Number(data?.totalPengeluaran || 0) }];

  const maxChart = Math.max(1, ...chart.map((x) => Math.max(x.income, x.expense)));

  const donut = totalAttendance > 0 ? {
    hadir: Math.round((Number(attendance.hadir || 0) / totalAttendance) * 100),
    izin: Math.round((Number(attendance.izin || 0) / totalAttendance) * 100),
    sakit: Math.round((Number(attendance.sakit || 0) / totalAttendance) * 100),
    alpha: Math.max(0, 100 - Math.round((Number(attendance.hadir || 0) / totalAttendance) * 100) - Math.round((Number(attendance.izin || 0) / totalAttendance) * 100) - Math.round((Number(attendance.sakit || 0) / totalAttendance) * 100)),
  } : { hadir: 0, izin: 0, sakit: 0, alpha: 0 };

  function openDetail(type) {
    const map = {
      KAS_LUNAS: ['Laporan KAS', 'Riwayat pembayaran Kas anggota yang tercatat.', 'finance'],
      DENDA_LUNAS: ['Laporan Denda', 'Riwayat pembayaran Denda anggota yang telah lunas.', 'finance'],
      KAS_TUNGGAKAN: ['Tunggakan Kas', 'Daftar kewajiban Kas anggota yang masih aktif.', 'finance'],
      DENDA_TUNGGAKAN: ['Tunggakan Denda', 'Daftar Denda anggota yang masih belum lunas.', 'finance'],
      PENGELUARAN: ['Pengeluaran', 'Daftar penggunaan dana yang telah dicatat.', 'expense'],
      PRESENSI_HADIR: ['Kehadiran', 'Anggota yang hadir pada presensi terbaru.', 'attendance'],
      PRESENSI_ALPHA: ['Anggota Alpha', 'Anggota yang tercatat Alpha pada presensi terbaru.', 'attendance'],
      PRESENSI_SAKIT: ['Anggota Sakit', 'Anggota yang tercatat Sakit pada presensi terbaru.', 'attendance'],
      PRESENSI_IZIN: ['Anggota Izin', 'Anggota yang tercatat Izin pada presensi terbaru.', 'attendance'],
    };
    const [title, description, kind] = map[type];
    setDetail({ title, description, kind, rows: details[type] || [] });
  }

  return (
    <div className="public-v9-page">
      <header className="public-v9-header">
        <Link to="/" className="public-v9-brand" aria-label="PMR SMANEL">
          <img src={`${import.meta.env.BASE_URL}logo-pmr-smanel.png`} alt="Logo PMR SMANEL" />
          <div><strong>PMR SMANEL</strong><span>SMAN 1 AIKMEL</span></div>
        </Link>
        <nav className="public-v9-nav" aria-label="Navigasi publik">
          <a className="active" href="#beranda">Beranda</a>
          <a href="#laporan-kas">Laporan KAS</a>
          <a href="#kehadiran">Kehadiran</a>
          <a href="#denda">Denda</a>
          <a href="#informasi">Informasi</a>
          <a href="#tentang">Tentang</a>
        </nav>
        <div className="public-v9-header-actions">
          <button type="button" className="public-v9-search-btn" aria-label="Pencarian tidak tersedia di halaman utama"><Search size={17} /></button>
          <Link to="/login" className="public-v9-login-btn"><LockKeyhole size={15} /> Masuk <ArrowRight size={15} /></Link>
        </div>
      </header>

      <main id="beranda">
        <section className="public-v9-hero">
          <div className="public-v9-hero-copy">
            <span className="public-v9-eyebrow">TRANSPARANSI ORGANISASI</span>
            <h1><span>TRANSPARANSI</span><strong>PMR SMANEL</strong></h1>
            <div className="public-v9-motto">Terbuka <i>•</i> Akuntabel <i>•</i> Bersama</div>
            <p>Portal transparansi PMR SMAN 1 Aikmel yang menyediakan informasi keuangan, kehadiran anggota, denda, serta aktivitas organisasi secara terbuka dan berkala.</p>
            <div className="public-v9-hero-meta"><Clock3 size={14} /> Data diperbarui {heroDate}</div>
            <a href="#laporan-kas" className="public-v9-primary-btn">Lihat Laporan KAS <ArrowRight size={16} /></a>
          </div>
          <div className="public-v9-hero-media">
            <img
              src={`${import.meta.env.BASE_URL}hero-pmr-smanel.jpg`}
              alt="Kegiatan PMR SMAN 1 Aikmel"
              className="public-v9-hero-image"
            />
            <div className="public-v9-hero-tagline">
              <span>Together We Can</span>
              <strong>We Are Not Alone</strong>
            </div>
            <div className="public-v9-hero-badge">
              <ShieldCheck size={14} />
              <span>DATA TERBUKA</span>
            </div>
          </div>
        </section>

        <section className="public-v9-kpi-grid" id="laporan-kas">
          <MetricCard icon={Wallet} title="Saldo KAS" value={rupiah(kas.saldo)} caption="Saldo kas aktif" tone="red" onClick={() => openDetail('KAS_LUNAS')} />
          <MetricCard icon={Users} title="Total Anggota" value={`${data.anggotaAktif || 0} Orang`} caption="Anggota aktif" tone="blue" />
          <MetricCard icon={BarChart3} title="Kehadiran Terakhir" value={`${attendanceRate}%`} caption={attendance.kegiatan || 'Belum ada kegiatan'} tone="green" onClick={() => openDetail('PRESENSI_HADIR')} />
          <MetricCard icon={ShieldCheck} title="Total Denda" value={rupiah(denda.saldo)} caption={`${data.transaksi?.dendaTunggakan || 0} belum lunas`} tone="gold" onClick={() => openDetail('DENDA_TUNGGAKAN')} />
        </section>

        <section className="public-v9-feature-grid">
          <FeatureCard icon={Wallet} title="Laporan KAS" description="Lihat detail pemasukan, pengeluaran, saldo, dan riwayat transaksi PMR SMANEL secara transparan." to="#laporan-kas" tone="red" action="Lihat Laporan KAS" />
          <FeatureCard icon={Users} title="Kehadiran" description="Rekap kehadiran anggota, termasuk hadir, izin, sakit, dan alpha, beserta detailnya." to="#kehadiran" tone="blue" action="Lihat Kehadiran" />
          <FeatureCard icon={ShieldCheck} title="Denda" description="Informasi denda anggota berdasarkan ketentuan yang berlaku di PMR SMANEL." to="#denda" tone="gold" action="Lihat Denda" />
        </section>

        <section className="public-v9-analytics-grid">
          <div className="public-v9-panel">
            <div className="public-v9-panel-head"><div><span>KEUANGAN</span><h2>Pergerakan Pemasukan & Pengeluaran</h2></div><span className="public-v9-year">Data publik</span></div>
            <div className="public-v9-bar-chart">
              {chart.map((item) => <div className="public-v9-bar-col" key={item.key}><div className="public-v9-bars"><span className="income" style={{ height: `${Math.max(4, (item.income / maxChart) * 120)}px` }} /><span className="expense" style={{ height: `${Math.max(4, (item.expense / maxChart) * 120)}px` }} /></div><small>{item.label}</small></div>)}
            </div>
            <div className="public-v9-legend"><span><i className="income-dot" /> Pemasukan</span><span><i className="expense-dot" /> Pengeluaran</span></div>
          </div>

          <div className="public-v9-panel" id="kehadiran">
            <div className="public-v9-panel-head"><div><span>KEHADIRAN</span><h2>Statistik Kehadiran</h2></div><span className="public-v9-soft-badge">Terakhir</span></div>
            <div className="public-v9-donut-wrap">
              <div className="public-v9-donut" style={{ '--a': `${donut.hadir}%`, '--b': `${donut.hadir + donut.izin}%`, '--c': `${donut.hadir + donut.izin + donut.sakit}%` }}><div><strong>{donut.hadir}%</strong><span>Hadir</span></div></div>
              <div className="public-v9-donut-legend"><span><i className="dot-hadir" /> Hadir <b>{donut.hadir}%</b></span><span><i className="dot-izin" /> Izin <b>{donut.izin}%</b></span><span><i className="dot-sakit" /> Sakit <b>{donut.sakit}%</b></span><span><i className="dot-alpha" /> Alpha <b>{donut.alpha}%</b></span></div>
            </div>
          </div>
        </section>

        <section className="public-v9-bottom-grid" id="informasi">
          <div className="public-v9-panel">
            <div className="public-v9-panel-head"><div><span>INFORMASI</span><h2>Ringkasan Terbaru</h2></div><span className="public-v9-soft-badge">Update</span></div>
            <div className="public-v9-info-list">
              <div><div className="public-v9-info-icon red"><Wallet size={16} /></div><div><strong>Laporan KAS</strong><span>{data.transaksi?.kasLunas || 0} transaksi KAS lunas tercatat.</span></div><small>{formatDate(data.updatedAt)}</small></div>
              <div><div className="public-v9-info-icon blue"><Users size={16} /></div><div><strong>Kehadiran Terbaru</strong><span>{attendance.kegiatan || 'Belum ada kegiatan'}.</span></div><small>{formatDate(attendance.tanggal)}</small></div>
              <div><div className="public-v9-info-icon gold"><ShieldCheck size={16} /></div><div><strong>Pembayaran Denda</strong><span>{data.transaksi?.dendaLunas || 0} transaksi denda lunas.</span></div><small>{formatDate(data.updatedAt)}</small></div>
              <div><div className="public-v9-info-icon purple"><CalendarDays size={16} /></div><div><strong>Kondisi Organisasi</strong><span>{data.anggotaAktif || 0} anggota aktif dan {totalPiutang > 0 ? rupiah(totalPiutang) : 'tidak ada'} piutang.</span></div><small>Live</small></div>
            </div>
          </div>

          <div className="public-v9-panel" id="denda">
            <div className="public-v9-panel-head"><div><span>MONITORING ORGANISASI</span><h2>Posisi Dana</h2></div><span className="public-v9-soft-badge">Real-time</span></div>
            <div className="public-v9-position-grid">
              <div><span>Saldo KAS</span><strong>{rupiah(kas.saldo)}</strong></div>
              <div><span>Saldo Denda</span><strong>{rupiah(denda.saldo)}</strong></div>
              <div><span>Piutang KAS</span><strong>{rupiah(data.tunggakanKas?.total)}</strong></div>
              <div><span>Piutang Denda</span><strong>{rupiah(data.tunggakanDenda?.total)}</strong></div>
            </div>
            <div className="public-v9-panel-action"><button type="button" onClick={() => openDetail('DENDA_TUNGGAKAN')}>Lihat Detail Denda <ArrowRight size={15} /></button></div>
          </div>
        </section>

        <section className="public-v9-about" id="tentang">
          <div><span>PMR SMAN 1 AIKMEL</span><h2>Terbuka. Akuntabel. Bersama.</h2><p>Portal ini menyajikan ringkasan informasi organisasi untuk mendukung budaya transparansi, kepedulian, dan pengelolaan yang bertanggung jawab.</p></div>
          <div className="public-v9-about-mark"><Heart size={25} /><strong>Together We Can,<br />We Are Not Alone</strong></div>
        </section>
      </main>

      <footer className="public-v9-footer">
        <div><strong>PMR SMANEL</strong><span>SMAN 1 AIKMEL</span></div>
        <div><em>Together We Can, We Are Not Alone</em><span>Terbuka • Akuntabel • Bersama</span></div>
        <div><span>© {new Date().getFullYear()} PMR SMAN 1 Aikmel</span></div>
      </footer>

      {detail && <DetailModal title={detail.title} description={detail.description} rows={detail.rows} kind={detail.kind} onClose={() => setDetail(null)} />}
    </div>
  );
}
