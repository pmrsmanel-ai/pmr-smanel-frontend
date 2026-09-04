import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowUpRight,
  CheckCircle2,
  Edit3,
  RefreshCw,
  Trash2,
  Search,
  TrendingDown,
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

function formatTanggal(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

export default function PengeluaranPage() {
  const session = getSession();

  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('SEMUA');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    sumberDana: 'KAS',
    keperluan: '',
    kategori: 'OPERASIONAL',
    nominal: '',
    metode: 'TUNAI',
  });

  async function load(silent = false) {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await getApi(
        'pengeluaran.list',
        {
          userId: session.userId,
          role: session.role,
        }
      );

      setData(
        Array.isArray(result)
          ? result
          : []
      );
    } catch (err) {
      setMessage(
        err?.message ||
          'Gagal memuat pengeluaran.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, [
    session.userId,
    session.role,
  ]);

  const filtered = useMemo(() => {
    const keyword = normalize(search);

    return data.filter((item) => {
      const itemSource =
        String(
          item.Sumber_Dana || ''
        ).toUpperCase();

      if (
        source !== 'SEMUA' &&
        itemSource !== source
      ) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return [
        item.Pengeluaran_ID,
        item.Keperluan,
        item.Kategori,
        item.Sumber_Dana,
        item.Metode,
        item.Bukti,
      ]
        .map(normalize)
        .join(' ')
        .includes(keyword);
    });
  }, [
    data,
    search,
    source,
  ]);

  const total = filtered.reduce(
    (sum, item) =>
      sum + Number(item.Nominal || 0),
    0
  );

  async function save(event) {
    event.preventDefault();

    if (
      !form.keperluan.trim() ||
      Number(form.nominal) <= 0
    ) {
      setMessage(
        'Keperluan dan nominal wajib diisi.'
      );
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      await postApi({
        action:
          'pengeluaran.create',
        userId:
          session.userId,
        role:
          session.role,
        sumberDana:
          form.sumberDana,
        keperluan:
          form.keperluan.trim(),
        kategori:
          form.kategori.trim() ||
          'OPERASIONAL',
        nominal:
          Number(form.nominal),
        metode:
          form.metode,
      });

      setForm({
        sumberDana:
          form.sumberDana,
        keperluan: '',
        kategori: 'OPERASIONAL',
        nominal: '',
        metode: 'TUNAI',
      });

      setMessage(
        'Pengeluaran berhasil dicatat.'
      );

      await load(true);
    } catch (err) {
      setMessage(
        err?.message ||
          'Pengeluaran gagal dicatat.'
      );
    } finally {
      setBusy(false);
    }
  }


  async function handleUpdate(item, form) {
    setBusy(true);
    setMessage('');
    try {
      await postApi({
        action: 'pengeluaran.update',
        userId: session.userId,
        role: session.role,
        pengeluaranId: item.Pengeluaran_ID,
        tanggal: form.tanggal,
        sumberDana: form.sumberDana,
        keperluan: form.keperluan.trim(),
        kategori: form.kategori.trim() || 'Lainnya',
        nominal: Number(form.nominal),
        metode: form.metode,
        bukti: form.bukti || '',
      });
      setEditing(null);
      setMessage('Pengeluaran berhasil diperbarui.');
      await load(true);
    } catch (err) {
      setMessage(err?.message || 'Pengeluaran gagal diperbarui.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item) {
    const ok = window.confirm(
      `Hapus pengeluaran ${item.Pengeluaran_ID || ''} sebesar ${rupiah(item.Nominal)}?\n\nTransaksi ledger terkait juga akan dihapus.`
    );
    if (!ok) return;

    setBusy(true);
    setMessage('');
    try {
      await postApi({
        action: 'pengeluaran.delete',
        userId: session.userId,
        role: session.role,
        pengeluaranId: item.Pengeluaran_ID,
      });
      setMessage('Pengeluaran berhasil dihapus.');
      await load(true);
    } catch (err) {
      setMessage(err?.message || 'Pengeluaran gagal dihapus.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="money-page money-expense-page">

      <section className="money-hero expense">
        <div>
          <span className="eyebrow light">
            BENDAHARA · PENGELUARAN
          </span>

          <h1>
            Pengeluaran
          </h1>

          <p>
            Catat penggunaan dana organisasi
            dan pantau seluruh riwayat
            pengeluaran dalam satu halaman.
          </p>
        </div>

        <div className="money-hero-total">
          <TrendingDown size={20} />
          <span>Total ditampilkan</span>
          <strong>{rupiah(total)}</strong>
        </div>
      </section>

      {message && (
        <div className="money-alert">
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      <section className="money-stat-grid">
        <div className="money-stat">
          <div className="money-stat-icon red">
            <TrendingDown size={18} />
          </div>

          <div>
            <span>Transaksi</span>
            <strong>{filtered.length}</strong>
            <small>pengeluaran ditampilkan</small>
          </div>
        </div>

        <div className="money-stat">
          <div className="money-stat-icon orange">
            <Wallet size={18} />
          </div>

          <div>
            <span>Total Pengeluaran</span>
            <strong>{rupiah(total)}</strong>
            <small>sesuai filter aktif</small>
          </div>
        </div>
      </section>

      <section className="money-form-panel">
        <div className="money-panel-head">
          <div>
            <span>TRANSAKSI BARU</span>
            <h2>Catat Pengeluaran</h2>
            <p>
              Setiap transaksi akan tercatat
              ke `09_Pengeluaran` dan ledger.
            </p>
          </div>
        </div>

        <form
          className="money-form-grid"
          onSubmit={save}
        >
          <label>
            <span>Sumber Dana</span>

            <select
              value={
                form.sumberDana
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  sumberDana:
                    event.target.value,
                })
              }
            >
              <option value="KAS">
                KAS
              </option>
              <option value="DENDA">
                DENDA
              </option>
            </select>
          </label>

          <label>
            <span>Keperluan</span>

            <input
              required
              value={form.keperluan}
              onChange={(event) =>
                setForm({
                  ...form,
                  keperluan:
                    event.target.value,
                })
              }
              placeholder="Contoh: pembelian perlengkapan PMR"
            />
          </label>

          <label>
            <span>Kategori</span>

            <input
              value={form.kategori}
              onChange={(event) =>
                setForm({
                  ...form,
                  kategori:
                    event.target.value,
                })
              }
              placeholder="OPERASIONAL"
            />
          </label>

          <label>
            <span>Nominal</span>

            <input
              required
              type="number"
              min="1"
              value={form.nominal}
              onChange={(event) =>
                setForm({
                  ...form,
                  nominal:
                    event.target.value,
                })
              }
              placeholder="0"
            />
          </label>

          <label>
            <span>Metode</span>

            <select
              value={form.metode}
              onChange={(event) =>
                setForm({
                  ...form,
                  metode:
                    event.target.value,
                })
              }
            >
              <option value="TUNAI">
                TUNAI
              </option>
              <option value="TRANSFER">
                TRANSFER
              </option>
            </select>
          </label>

          <div className="money-form-end">
            <button
              type="submit"
              className="money-primary-btn"
              disabled={busy}
            >
              <ArrowUpRight size={16} />

              {busy
                ? 'Menyimpan...'
                : 'Simpan Pengeluaran'}
            </button>
          </div>
        </form>
      </section>

      <section className="money-panel">
        <div className="money-panel-head">
          <div>
            <span>DATABASE KEUANGAN</span>
            <h2>Riwayat Pengeluaran</h2>
            <p>
              Riwayat pengeluaran yang tercatat
              pada sistem.
            </p>
          </div>

          <button
            type="button"
            className="money-refresh-btn"
            onClick={() => load(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={15}
              className={
                refreshing
                  ? 'spin'
                  : ''
              }
            />
            {refreshing
              ? 'Memuat...'
              : 'Perbarui'}
          </button>
        </div>

        <div className="money-toolbar">
          <label className="money-search">
            <Search size={17} />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Cari keperluan, kategori..."
            />
          </label>

          <select
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
          </select>
        </div>

        {loading ? (
          <div className="money-empty">
            <div className="money-loading">
              Memuat data pengeluaran...
            </div>
          </div>
        ) : (
          <div className="money-table-wrap">
            <table className="money-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Pengeluaran</th>
                  <th>Sumber</th>
                  <th>Kategori</th>
                  <th>Metode</th>
                  <th className="right">
                    Nominal
                  </th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(
                  (item) => (
                    <tr
                      key={
                        item.Pengeluaran_ID
                      }
                    >
                      <td>
                        {formatTanggal(
                          item.Tanggal
                        )}
                      </td>

                      <td>
                        <strong>
                          {item.Pengeluaran_ID ||
                            '-'}
                        </strong>

                        <small>
                          {item.Keperluan ||
                            '-'}
                        </small>
                      </td>

                      <td>
                        <span
                          className={`money-badge ${
                            normalize(
                              item.Sumber_Dana
                            ) === 'denda'
                              ? 'purple'
                              : 'orange'
                          }`}
                        >
                          {item.Sumber_Dana ||
                            '-'}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {item.Kategori ||
                            'Lainnya'}
                        </strong>

                        <small>
                          {item.Bukti ||
                            '-'}
                        </small>
                      </td>

                      <td>
                        {item.Metode || '-'}
                      </td>

                      <td className="right">
                        <strong className="money-negative">
                          {rupiah(
                            item.Nominal
                          )}
                        </strong>
                      </td>
                      <td>
                        <div className="money-row-actions">
                          <button type="button" className="money-action-btn edit" onClick={() => setEditing(item)} disabled={busy} title="Edit pengeluaran">
                            <Edit3 size={14} />
                          </button>
                          <button type="button" className="money-action-btn delete" onClick={() => handleDelete(item)} disabled={busy} title="Hapus pengeluaran">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}

                {!filtered.length && (
                  <tr>
                    <td
                      colSpan="7"
                      className="table-empty"
                    >
                      Belum ada data
                      pengeluaran.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="money-footer">
          Menampilkan{' '}
          <strong>
            {filtered.length}
          </strong>{' '}
          transaksi dengan total{' '}
          <strong>
            {rupiah(total)}
          </strong>.
        </div>
      </section>


      {editing && (
        <EditExpenseModal
          item={editing}
          busy={busy}
          onClose={() => !busy && setEditing(null)}
          onSubmit={(form) => handleUpdate(editing, form)}
        />
      )}
    </div>
  );
}


function inputDate(value) {
  if (!value) return '';
  const raw = String(value);
  const iso = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function EditExpenseModal({ item, busy, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({
    tanggal: inputDate(item?.Tanggal),
    sumberDana: item?.Sumber_Dana || 'KAS',
    keperluan: item?.Keperluan || '',
    kategori: item?.Kategori || 'OPERASIONAL',
    nominal: item?.Nominal != null ? String(item.Nominal) : '',
    metode: item?.Metode || 'TUNAI',
    bukti: item?.Bukti || '',
  }));

  function update(key, value) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.keperluan.trim() || Number(form.nominal) <= 0) return;
    onSubmit(form);
  }

  return (
    <div className="money-modal-backdrop">
      <div className="money-edit-modal">
        <div className="money-edit-head">
          <div>
            <span>EDIT PENGELUARAN</span>
            <h2>Perbarui Pengeluaran</h2>
            <p>{item?.Pengeluaran_ID || '-'}</p>
          </div>
          <button type="button" className="money-edit-close" onClick={onClose} disabled={busy}>×</button>
        </div>
        <form className="money-edit-form" onSubmit={submit}>
          <div className="money-edit-grid">
            <label><span>Tanggal</span><input type="date" value={form.tanggal} onChange={e => update('tanggal', e.target.value)} required /></label>
            <label><span>Sumber Dana</span><select value={form.sumberDana} onChange={e => update('sumberDana', e.target.value)}><option value="KAS">KAS</option><option value="DENDA">DENDA</option><option value="LAINNYA">LAINNYA</option></select></label>
            <label><span>Keperluan</span><input value={form.keperluan} onChange={e => update('keperluan', e.target.value)} required /></label>
            <label><span>Kategori</span><input value={form.kategori} onChange={e => update('kategori', e.target.value)} /></label>
            <label><span>Nominal</span><input type="number" min="1" value={form.nominal} onChange={e => update('nominal', e.target.value)} required /></label>
            <label><span>Metode</span><select value={form.metode} onChange={e => update('metode', e.target.value)}><option value="TUNAI">TUNAI</option><option value="TRANSFER">TRANSFER</option></select></label>
            <label className="money-edit-full"><span>Bukti / Referensi</span><input value={form.bukti} onChange={e => update('bukti', e.target.value)} placeholder="Opsional" /></label>
          </div>
          <div className="money-edit-actions">
            <button type="button" className="secondary" onClick={onClose} disabled={busy}>Batal</button>
            <button type="submit" className="primary" disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
