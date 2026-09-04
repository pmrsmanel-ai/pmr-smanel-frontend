import React, { useEffect, useMemo, useState } from 'react';

import {
  ArrowDownToLine,
  Edit3,
  Plus,
  Trash2,
  X,
  CalendarDays,
  CreditCard,
  ReceiptText,
  Search,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import { getApi, postApi } from '../api';
import { getSession } from '../auth';

function rupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function parseDateValue(value) {
  if (!value) return null;

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date;

  const text = String(value).trim();
  const match = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    const parsed = new Date(Number(y), Number(m) - 1, Number(d));
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

function dateKey(value) {
  const date = parseDateValue(value);
  if (!date) return '';

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(value) {
  const date = parseDateValue(value);
  if (!date) return value ? String(value) : '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function todayInputValue() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

function StatCard({
  icon: Icon,
  label,
  value,
  meta,
  tone,
}) {
  return (
    <div className={`income-stat-card ${tone}`}>
      <div className="income-stat-icon">
        <Icon size={19} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {meta && <small>{meta}</small>}
      </div>
    </div>
  );
}

function SourceBadge({ source }) {
  const normalized = normalize(source);

  return (
    <span
      className={`income-source-badge ${
        normalized === 'kas'
          ? 'kas'
          : normalized === 'denda'
            ? 'denda'
            : 'lainnya'
      }`}
    >
      {source || '-'}
    </span>
  );
}

function AddIncomeModal({ busy, onClose, onSubmit, initialItem = null }) {
  const editing = Boolean(initialItem);
  const [form, setForm] = useState(() => ({
    tanggal: initialItem?.Tanggal ? dateKey(initialItem.Tanggal) : todayInputValue(),
    sumberPemasukan: initialItem?.Sumber_Pemasukan || 'Donasi',
    kategori: initialItem?.Kategori || 'DONASI',
    nominal: initialItem?.Nominal != null ? String(initialItem.Nominal) : '',
    metode: initialItem?.Metode || 'TUNAI',
    keterangan: initialItem?.Keterangan || '',
  }));

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="income-modal-backdrop">
      <div className="income-modal">
        <div className="income-modal-header">
          <div>
            <span>{editing ? 'EDIT PEMASUKAN' : 'PEMASUKAN MANUAL'}</span>
            <h2>{editing ? 'Edit Pemasukan' : 'Tambah Pemasukan'}</h2>
            <p>Catat pemasukan selain Kas dan Denda.</p>
          </div>
          <button type="button" className="income-modal-close" onClick={onClose} disabled={busy}>
            <X size={18} />
          </button>
        </div>

        <form className="income-form" onSubmit={submit}>
          <div className="income-form-grid">
            <label>
              Tanggal
              <input type="date" value={form.tanggal} onChange={(e) => update('tanggal', e.target.value)} required />
            </label>

            <label>
              Sumber Pemasukan
              <select value={form.sumberPemasukan} onChange={(e) => update('sumberPemasukan', e.target.value)}>
                <option>Donasi</option>
                <option>Sponsor</option>
                <option>Sumbangan Alumni</option>
                <option>Bantuan Sekolah</option>
                <option>Hasil Kegiatan</option>
                <option>Penjualan</option>
                <option>Lainnya</option>
              </select>
            </label>

            <label>
              Kategori
              <select value={form.kategori} onChange={(e) => update('kategori', e.target.value)}>
                <option value="DONASI">DONASI</option>
                <option value="SPONSOR">SPONSOR</option>
                <option value="SUMBANGAN">SUMBANGAN</option>
                <option value="BANTUAN">BANTUAN</option>
                <option value="HASIL KEGIATAN">HASIL KEGIATAN</option>
                <option value="PENJUALAN">PENJUALAN</option>
                <option value="LAINNYA">LAINNYA</option>
              </select>
            </label>

            <label>
              Nominal
              <input type="number" min="1" step="1" value={form.nominal} onChange={(e) => update('nominal', e.target.value)} placeholder="Contoh: 500000" required />
            </label>

            <label>
              Metode
              <select value={form.metode} onChange={(e) => update('metode', e.target.value)}>
                <option value="TUNAI">Tunai</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </label>

            <label className="income-form-full">
              Keterangan
              <textarea value={form.keterangan} onChange={(e) => update('keterangan', e.target.value)} rows={3} placeholder="Contoh: donasi alumni untuk kegiatan PMR" />
            </label>
          </div>

          <div className="income-modal-actions">
            <button type="button" className="secondary" onClick={onClose} disabled={busy}>Batal</button>
            <button type="submit" className="primary" disabled={busy}>
              {editing ? <Edit3 size={16} /> : <Plus size={16} />}
              {busy ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Simpan Pemasukan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PemasukanPage() {
  const session = getSession();

  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('SEMUA');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');
  const [sortTanggal, setSortTanggal] = useState('TERBARU');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const result = await getApi(
      'pemasukan.list',
      {
        userId: session.userId,
        role: session.role,
      }
    );

    setData(result);
  }

  useEffect(() => {
    load().catch((err) =>
      setError(
        err.message ||
          'Gagal memuat pemasukan.'
      )
    );
  }, [
    session.userId,
    session.role,
  ]);

  const filtered = useMemo(() => {
    const q = normalize(search);

    const rows = data.filter((item) => {
      const itemSource = String(
        item.Sumber_Dana || ''
      ).toUpperCase();

      if (
        source !== 'SEMUA' &&
        itemSource !== source
      ) {
        return false;
      }

      const itemDate = dateKey(item.Tanggal);

      if (tanggalMulai && (!itemDate || itemDate < tanggalMulai)) {
        return false;
      }

      if (tanggalAkhir && (!itemDate || itemDate > tanggalAkhir)) {
        return false;
      }

      if (!q) {
        return true;
      }

      return [
        item.Sumber_Dana,
        item.Jenis_Transaksi,
        item.Referensi_ID,
        item.ID_Anggota,
        item.Keterangan,
        item.Metode,
        item.Kategori,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });

    rows.sort((a, b) => {
      const aKey = dateKey(a.Tanggal);
      const bKey = dateKey(b.Tanggal);
      return sortTanggal === 'TERLAMA'
        ? aKey.localeCompare(bKey)
        : bKey.localeCompare(aKey);
    });

    return rows;
  }, [
    data,
    search,
    source,
    tanggalMulai,
    tanggalAkhir,
    sortTanggal,
  ]);

  const summary = useMemo(() => {
    const kas = filtered.filter(
      (item) =>
        normalize(item.Sumber_Dana) === 'kas'
    );

    const denda = filtered.filter(
      (item) =>
        normalize(item.Sumber_Dana) === 'denda'
    );

    const total = filtered.reduce(
      (sum, item) =>
        sum + Number(item.Nominal || 0),
      0
    );

    const kasTotal = kas.reduce(
      (sum, item) =>
        sum + Number(item.Nominal || 0),
      0
    );

    const dendaTotal = denda.reduce(
      (sum, item) =>
        sum + Number(item.Nominal || 0),
      0
    );

    return {
      total,
      transaksi: filtered.length,
      kasTotal,
      dendaTotal,
      kasCount: kas.length,
      dendaCount: denda.length,
    };
  }, [filtered]);

  async function handleCreate(form) {
    setBusy(true);
    setError('');
    setSuccess('');

    try {
      const result = await postApi({
        action: 'pemasukan.create',
        userId: session.userId,
        role: session.role,
        tanggal: form.tanggal,
        sumberPemasukan: form.sumberPemasukan,
        kategori: form.kategori,
        nominal: Number(form.nominal || 0),
        metode: form.metode,
        keterangan: form.keterangan,
      });

      setSuccess(`Pemasukan berhasil dicatat (${result.pemasukanId}).`);
      setAddOpen(false);
      await load();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan pemasukan.');
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(form) {
    if (!editing?.Pemasukan_ID && !editing?.Referensi_ID) return;
    const pemasukanId = editing.Pemasukan_ID || editing.Referensi_ID;
    setBusy(true); setError(''); setSuccess('');
    try {
      const result = await postApi({
        action: 'pemasukan.update', userId: session.userId, role: session.role,
        pemasukanId, tanggal: form.tanggal, sumberPemasukan: form.sumberPemasukan,
        kategori: form.kategori, nominal: Number(form.nominal || 0), metode: form.metode,
        keterangan: form.keterangan,
      });
      setSuccess(`Pemasukan berhasil diperbarui (${result.pemasukanId}).`);
      setAddOpen(false); setEditing(null); await load();
    } catch (err) { setError(err.message || 'Gagal memperbarui pemasukan.'); }
    finally { setBusy(false); }
  }

  async function handleDelete(item) {
    const sourceName = normalize(item.Sumber_Dana);
    if (sourceName !== 'lainnya') {
      setError('Pemasukan Kas dan Denda berasal dari pembayaran otomatis dan tidak dapat dihapus dari sini.');
      return;
    }
    const pemasukanId = item.Referensi_ID;
    if (!pemasukanId) { setError('ID pemasukan tidak ditemukan.'); return; }
    if (!window.confirm(`Hapus pemasukan ${rupiah(item.Nominal)}?\n\nData juga akan dihapus dari ledger.`)) return;
    setBusy(true); setError(''); setSuccess('');
    try {
      await postApi({ action:'pemasukan.delete', userId:session.userId, role:session.role, pemasukanId });
      setSuccess('Pemasukan berhasil dihapus.'); await load();
    } catch (err) { setError(err.message || 'Gagal menghapus pemasukan.'); }
    finally { setBusy(false); }
  }


  return (
    <div className="income-page">

      <section className="income-hero">
        <div>
          <span className="eyebrow light">
            BENDAHARA PMR SMANEL
          </span>

          <h1>
            Pemasukan
          </h1>

          <p>
            Pantau seluruh dana masuk
            yang tercatat dari Kas dan
            Denda dalam satu halaman.
          </p>
        </div>

        <div className="income-hero-actions">
          <div className="income-hero-metric">
            <TrendingUp size={19} />
            <div>
              <span>Total pemasukan</span>
              <strong>{rupiah(summary.total)}</strong>
            </div>
          </div>
          <button type="button" className="income-add-btn" onClick={() => setAddOpen(true)}>
            <Plus size={17} />
            Tambah Pemasukan
          </button>
        </div>
      </section>


      {error && (
        <div className="income-message error">
          <ReceiptText size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="income-message success">
          <ReceiptText size={16} />
          {success}
        </div>
      )}


      <section className="income-stat-grid">

        <StatCard
          icon={ReceiptText}
          label="Transaksi"
          value={summary.transaksi}
          meta="Transaksi ditampilkan"
          tone="neutral"
        />

        <StatCard
          icon={TrendingUp}
          label="Total Pemasukan"
          value={rupiah(summary.total)}
          meta="Semua sumber"
          tone="green"
        />

        <StatCard
          icon={Wallet}
          label="Pemasukan Kas"
          value={rupiah(summary.kasTotal)}
          meta={`${summary.kasCount} transaksi`}
          tone="blue"
        />

        <StatCard
          icon={CreditCard}
          label="Pemasukan Denda"
          value={rupiah(summary.dendaTotal)}
          meta={`${summary.dendaCount} transaksi`}
          tone="red"
        />

      </section>


      <section className="income-panel">

        <div className="income-toolbar">

          <div>
            <span>
              LEDGER PEMASUKAN
            </span>

            <h2>
              Daftar Pemasukan
            </h2>

            <p>
              Semua transaksi dana masuk
              dari sistem keuangan PMR SMANEL.
            </p>
          </div>


          <div className="income-filter-group">

            <div className="income-search">
              <Search size={17} />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Cari sumber, referensi, anggota..."
              />
            </div>

            <select
              className="income-source-select"
              value={source}
              onChange={(event) =>
                setSource(
                  event.target.value
                )
              }
            >
              <option value="SEMUA">
                Semua Sumber
              </option>

              <option value="KAS">
                KAS
              </option>

              <option value="DENDA">
                DENDA
              </option>

              <option value="LAINNYA">
                LAINNYA
              </option>
            </select>

            <label className="income-date-filter">
              <span>Dari</span>
              <input type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} />
            </label>

            <label className="income-date-filter">
              <span>Sampai</span>
              <input type="date" value={tanggalAkhir} onChange={(e) => setTanggalAkhir(e.target.value)} />
            </label>

            <select className="income-sort-select" value={sortTanggal} onChange={(e) => setSortTanggal(e.target.value)}>
              <option value="TERBARU">Tanggal Terbaru</option>
              <option value="TERLAMA">Tanggal Terlama</option>
            </select>

          </div>
        </div>


        <div className="income-table-wrap">

          <table className="income-table">

            <thead>
              <tr>
                <th>TANGGAL</th>
                <th>SUMBER</th>
                <th>JENIS</th>
                <th>REFERENSI</th>
                <th>ANGGOTA</th>
                <th>NOMINAL</th>
                <th>METODE</th>
                <th>KETERANGAN</th>
                <th>AKSI</th>
              </tr>
            </thead>

            <tbody>

              {filtered.map(
                (item, index) => (
                  <tr
                    key={
                      item.Transaksi_ID ||
                      item.Pembayaran_ID ||
                      index
                    }
                  >
                    <td>
                      <div className="income-date">
                        <CalendarDays size={14} />
                        {formatDisplayDate(
                          item.Tanggal
                        )}
                      </div>
                    </td>

                    <td>
                      <SourceBadge
                        source={
                          item.Sumber_Dana
                        }
                      />
                    </td>

                    <td>
                      <span className="income-type">
                        {item.Jenis_Transaksi ||
                          'PEMASUKAN'}
                      </span>
                    </td>

                    <td>
                      <code className="income-reference">
                        {item.Referensi_ID ||
                          '-'}
                      </code>
                    </td>

                    <td>
                      <span className="income-member">
                        {item.ID_Anggota ||
                          '-'}
                      </span>
                    </td>

                    <td>
                      <strong className="income-amount">
                        {rupiah(
                          item.Nominal
                        )}
                      </strong>
                    </td>

                    <td>
                      <span className="income-method">
                        {item.Metode || '-'}
                      </span>
                    </td>

                    <td>
                      <span className="income-note">
                        {item.Keterangan || '-'}
                      </span>
                    </td>
                    <td>
                      {normalize(item.Sumber_Dana) === 'lainnya' ? (
                        <div className="income-row-actions">
                          <button type="button" className="income-action-btn edit" onClick={() => { setEditing(item); setAddOpen(true); }} disabled={busy} title="Edit pemasukan">
                            <Edit3 size={14} />
                          </button>
                          <button type="button" className="income-action-btn delete" onClick={() => handleDelete(item)} disabled={busy} title="Hapus pemasukan">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : <span className="income-system-label">Otomatis</span>}
                    </td>
                  </tr>
                )
              )}


              {!filtered.length && (
                <tr>
                  <td
                    colSpan="9"
                    className="income-empty-cell"
                  >
                    <div>
                      <ArrowDownToLine size={26} />

                      <strong>
                        Belum ada data pemasukan
                      </strong>

                      <span>
                        Coba ubah pencarian
                        atau sumber dana.
                      </span>
                    </div>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>


        <div className="income-footer">
          Menampilkan{' '}
          <strong>
            {filtered.length}
          </strong>{' '}
          transaksi dari{' '}
          <strong>
            {data.length}
          </strong>{' '}
          total transaksi pemasukan.
        </div>

      </section>
      {addOpen && (
        <AddIncomeModal
          busy={busy}
          initialItem={editing}
          onClose={() => { if (!busy) { setAddOpen(false); setEditing(null); } }}
          onSubmit={editing ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
}
