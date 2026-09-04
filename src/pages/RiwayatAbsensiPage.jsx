import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Filter,
  Printer,
  RefreshCw,
  Search,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { getApi } from '../api';
import { getSession } from '../auth';

function formatDate(value) {
  if (!value) return '-';
  const raw = String(value);
  const datePart = raw.includes('T') ? raw.slice(0, 10) : raw;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return raw;
  const [y, m, d] = datePart.split('-');
  return `${d}/${m}/${y}`;
}

function inputDate(value) {
  if (!value) return '';
  const raw = String(value);
  const datePart = raw.includes('T') ? raw.slice(0, 10) : raw;
  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : '';
}

function today() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

function csvEscape(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

export default function RiwayatAbsensiPage() {
  const session = getSession();

  const [rows, setRows] = useState([]);
  const [anggota, setAnggota] = useState([]);
  const [kegiatan, setKegiatan] = useState([]);

  const [tanggal, setTanggal] = useState('');
  const [kegiatanId, setKegiatanId] = useState('');
  const [status, setStatus] = useState('');
  const [keyword, setKeyword] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function loadData(silent = false) {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const [absensiData, anggotaData, kegiatanData] = await Promise.all([
        getApi('absensi.list', {
          userId: session.userId,
          role: session.role,
        }),
        getApi('anggota.list', {
          userId: session.userId,
          role: session.role,
        }),
        getApi('kegiatan.list', {
          userId: session.userId,
          role: session.role,
        }),
      ]);

      setRows(Array.isArray(absensiData) ? absensiData : []);
      setAnggota(Array.isArray(anggotaData) ? anggotaData : []);
      setKegiatan(Array.isArray(kegiatanData) ? kegiatanData : []);
    } catch (err) {
      setError(err?.message || 'Gagal memuat riwayat absensi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.userId, session.role]);

  const anggotaMap = useMemo(
    () =>
      Object.fromEntries(
        anggota.map((item) => [String(item.ID_Anggota), item])
      ),
    [anggota]
  );

  const kegiatanMap = useMemo(
    () =>
      Object.fromEntries(
        kegiatan.map((item) => [String(item.Kegiatan_ID), item])
      ),
    [kegiatan]
  );

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return [...rows]
      .filter((row) => {
        if (tanggal && inputDate(row.Tanggal) !== tanggal) return false;
        if (kegiatanId && String(row.Kegiatan_ID) !== String(kegiatanId)) return false;
        if (status && String(row.Status).toUpperCase() !== status) return false;

        if (!q) return true;

        const member = anggotaMap[String(row.ID_Anggota)] || {};
        const activity = kegiatanMap[String(row.Kegiatan_ID)] || {};

        return [
          row.Absensi_ID,
          row.ID_Anggota,
          row.Status,
          row.Keterangan,
          member.Nama_Lengkap,
          member.Kelas,
          activity.Nama_Kegiatan,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => {
        const da = inputDate(a.Tanggal);
        const db = inputDate(b.Tanggal);
        if (da !== db) return db.localeCompare(da);
        return String(a.Absensi_ID || '').localeCompare(
          String(b.Absensi_ID || '')
        );
      });
  }, [rows, tanggal, kegiatanId, status, keyword, anggotaMap, kegiatanMap]);

  const summary = useMemo(() => {
    const result = {
      total: filteredRows.length,
      HADIR: 0,
      IZIN: 0,
      SAKIT: 0,
      ALPHA: 0,
    };
    filteredRows.forEach((row) => {
      const key = String(row.Status || '').toUpperCase();
      if (Object.prototype.hasOwnProperty.call(result, key)) result[key] += 1;
    });
    return result;
  }, [filteredRows]);

  function resetFilters() {
    setTanggal('');
    setKegiatanId('');
    setStatus('');
    setKeyword('');
  }

  function exportCsv() {
    const header = [
      'Tanggal',
      'Kegiatan',
      'ID Anggota',
      'Nama',
      'Kelas',
      'Status',
      'Keterangan',
    ];

    const lines = [
      header.map(csvEscape).join(','),
      ...filteredRows.map((row) => {
        const member = anggotaMap[String(row.ID_Anggota)] || {};
        const activity = kegiatanMap[String(row.Kegiatan_ID)] || {};
        return [
          formatDate(row.Tanggal),
          activity.Nama_Kegiatan || row.Kegiatan_ID || '',
          row.ID_Anggota || '',
          member.Nama_Lengkap || '',
          member.Kelas || '',
          row.Status || '',
          row.Keterangan || '',
        ]
          .map(csvEscape)
          .join(',');
      }),
    ];

    const blob = new Blob(['\uFEFF' + lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `riwayat-absensi-${today()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-loading">Memuat riwayat absensi...</div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <section className="history-hero">
        <div>
          <span className="history-kicker">SEKRETARIS · ABSENSI</span>
          <h1>Riwayat Absensi</h1>
          <p>
            Lihat kembali seluruh catatan kehadiran berdasarkan tanggal,
            kegiatan, dan status anggota.
          </p>
        </div>

        <div className="history-hero-actions">
          <button
            type="button"
            className="history-btn secondary"
            onClick={() => loadData(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Memuat...' : 'Perbarui'}
          </button>
          <button
            type="button"
            className="history-btn primary"
            onClick={() => window.print()}
            disabled={!filteredRows.length}
          >
            <Printer size={16} />
            Cetak
          </button>
        </div>
      </section>

      {error && <div className="alert error">{error}</div>}

      <section className="history-summary">
        <div className="history-stat total">
          <ClipboardCheck size={18} />
          <div>
            <span>Total</span>
            <strong>{summary.total}</strong>
          </div>
        </div>
        <div className="history-stat hadir">
          <CheckCircle2 size={18} />
          <div>
            <span>Hadir</span>
            <strong>{summary.HADIR}</strong>
          </div>
        </div>
        <div className="history-stat izin">
          <CalendarDays size={18} />
          <div>
            <span>Izin</span>
            <strong>{summary.IZIN}</strong>
          </div>
        </div>
        <div className="history-stat sakit">
          <UserRound size={18} />
          <div>
            <span>Sakit</span>
            <strong>{summary.SAKIT}</strong>
          </div>
        </div>
        <div className="history-stat alpha">
          <X size={18} />
          <div>
            <span>Alpha</span>
            <strong>{summary.ALPHA}</strong>
          </div>
        </div>
      </section>

      <section className="history-filter-card">
        <div className="history-filter-head">
          <div>
            <span>FILTER DATA</span>
            <h2>Temukan Riwayat</h2>
          </div>
          <Filter size={18} />
        </div>

        <div className="history-filters">
          <label>
            <span>Tanggal</span>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
          </label>

          <label>
            <span>Kegiatan</span>
            <select
              value={kegiatanId}
              onChange={(e) => setKegiatanId(e.target.value)}
            >
              <option value="">Semua kegiatan</option>
              {kegiatan.map((item) => (
                <option key={item.Kegiatan_ID} value={item.Kegiatan_ID}>
                  {item.Nama_Kegiatan}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Semua status</option>
              <option value="HADIR">Hadir</option>
              <option value="IZIN">Izin</option>
              <option value="SAKIT">Sakit</option>
              <option value="ALPHA">Alpha</option>
            </select>
          </label>

          <label className="history-search">
            <span>Pencarian</span>
            <div className="history-search-wrap">
              <Search size={16} />
              <input
                type="search"
                placeholder="Nama, ID, kelas..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </label>
        </div>

        <div className="history-filter-actions">
          <span>
            Menampilkan <strong>{filteredRows.length}</strong> data
          </span>
          <div>
            <button type="button" className="history-text-btn" onClick={resetFilters}>
              Reset filter
            </button>
            <button
              type="button"
              className="history-btn export"
              onClick={exportCsv}
              disabled={!filteredRows.length}
            >
              <Download size={15} />
              Ekspor CSV
            </button>
          </div>
        </div>
      </section>

      <section className="history-table-card">
        <div className="history-table-head">
          <div>
            <span>DATA KEHADIRAN</span>
            <h2>Daftar Absensi</h2>
          </div>
          <small>{filteredRows.length} catatan</small>
        </div>

        {!filteredRows.length ? (
          <div className="history-empty">
            <ClipboardCheck size={28} />
            <strong>Belum ada data yang sesuai</strong>
            <span>Ubah filter atau lakukan input absensi terlebih dahulu.</span>
          </div>
        ) : (
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Kegiatan</th>
                  <th>Anggota</th>
                  <th>Kelas</th>
                  <th>Status</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const member = anggotaMap[String(row.ID_Anggota)] || {};
                  const activity = kegiatanMap[String(row.Kegiatan_ID)] || {};
                  return (
                    <tr key={row.Absensi_ID || `${row.Kegiatan_ID}-${row.ID_Anggota}-${row.Tanggal}`}>
                      <td className="history-date">{formatDate(row.Tanggal)}</td>
                      <td>
                        <div className="history-activity">
                          <strong>{activity.Nama_Kegiatan || row.Kegiatan_ID || '-'}</strong>
                          <small>{row.Kegiatan_ID || '-'}</small>
                        </div>
                      </td>
                      <td>
                        <div className="history-member">
                          <strong>{member.Nama_Lengkap || row.ID_Anggota || '-'}</strong>
                          <small>{row.ID_Anggota || '-'}</small>
                        </div>
                      </td>
                      <td>{member.Kelas || '-'}</td>
                      <td>
                        <span className={`history-status ${String(row.Status || '').toLowerCase()}`}>
                          {row.Status || '-'}
                        </span>
                      </td>
                      <td>{row.Keterangan || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
