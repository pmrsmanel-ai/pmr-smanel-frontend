import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Edit3,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { getApi, postApi } from '../api';
import { getSession } from '../auth';

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

function getName(item) {
  return item?.Nama_Lengkap || item?.Nama || item?.Nama_Anggota || '-';
}

function getClassName(item) {
  return item?.Kelas || item?.Kelas_Anggota || item?.Kelas_Siswa || '-';
}

function getId(item) {
  return item?.ID_Anggota || item?.Anggota_ID || '-';
}

function isActive(item) {
  return normalize(item?.Status_Anggota || item?.Status) === 'aktif';
}

function emptyForm() {
  return {
    nama: '',
    kelas: '',
    status: 'AKTIF',
  };
}

export default function AnggotaPage() {
  const session = getSession();

  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());

  async function loadData() {
    setError('');
    try {
      const result = await getApi('anggota.list', {
        userId: session.userId,
        role: session.role,
      });
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err?.message || 'Gagal memuat data anggota.');
    }
  }

  useEffect(() => {
    loadData();
  }, [session.userId, session.role]);

  const filtered = useMemo(() => {
    const q = normalize(search);
    if (!q) return data;

    return data.filter((item) =>
      [getId(item), getName(item), getClassName(item), item?.Status_Anggota]
        .map(normalize)
        .some((value) => value.includes(q))
    );
  }, [data, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setError('');
    setMessage('');
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      nama: getName(item) === '-' ? '' : getName(item),
      kelas: getClassName(item) === '-' ? '' : getClassName(item),
      status: isActive(item) ? 'AKTIF' : 'NONAKTIF',
    });
    setError('');
    setMessage('');
    setModalOpen(true);
  }

  function closeModal() {
    if (busy) return;
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm());
  }

  async function submitForm(event) {
    event.preventDefault();

    const nama = form.nama.trim();
    const kelas = form.kelas.trim();

    if (!nama || !kelas) {
      setError('Nama lengkap dan kelas wajib diisi.');
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');

    try {
      if (editing) {
        await postApi({
          action: 'anggota.update',
          userId: session.userId,
          role: session.role,
          anggotaId: getId(editing),
          nama,
          kelas,
          status: form.status,
        });
        setMessage('Data anggota berhasil diperbarui.');
      } else {
        await postApi({
          action: 'anggota.create',
          userId: session.userId,
          role: session.role,
          nama,
          kelas,
          status: form.status,
        });
        setMessage('Anggota berhasil ditambahkan.');
      }

      setModalOpen(false);
      setEditing(null);
      setForm(emptyForm());
      await loadData();
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan data anggota.');
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(item) {
    const id = getId(item);
    const name = getName(item);

    const ok = window.confirm(
      `Hapus anggota ${name} (${id})?\n\nData akan dinonaktifkan agar riwayat absensi dan keuangan tetap aman.`
    );
    if (!ok) return;

    setBusy(true);
    setError('');
    setMessage('');

    try {
      await postApi({
        action: 'anggota.delete',
        userId: session.userId,
        role: session.role,
        anggotaId: id,
      });
      setMessage(`${name} berhasil dinonaktifkan.`);
      await loadData();
    } catch (err) {
      setError(err?.message || 'Gagal menghapus anggota.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="anggota-page">
      <section className="anggota-hero">
        <div>
          <span className="anggota-eyebrow">SEKRETARIS PMR SMANEL</span>
          <h1>Anggota</h1>
          <p>Kelola data anggota PMR secara teratur dan aman.</p>
        </div>

        <button
          type="button"
          className="anggota-add-btn"
          onClick={openCreate}
          disabled={busy}
        >
          <Plus size={17} />
          Tambah Anggota
        </button>
      </section>

      <div className="anggota-summary-row">
        <div className="anggota-summary-card">
          <div className="anggota-summary-icon"><Users size={18} /></div>
          <div>
            <span>Anggota Aktif</span>
            <strong>{data.length}</strong>
          </div>
        </div>
        <div className="anggota-summary-card soft">
          <div className="anggota-summary-icon"><UserPlus size={18} /></div>
          <div>
            <span>Ditampilkan</span>
            <strong>{filtered.length}</strong>
          </div>
        </div>
      </div>

      {(error || message) && (
        <div className={`anggota-message ${error ? 'error' : 'success'}`}>
          <AlertCircle size={17} />
          <span>{error || message}</span>
        </div>
      )}

      <section className="anggota-table-card">
        <div className="anggota-toolbar">
          <div>
            <span className="anggota-section-label">DATA ANGGOTA</span>
            <h2>Daftar Anggota</h2>
            <p>{filtered.length} data ditampilkan</p>
          </div>

          <div className="anggota-search-wrap">
            <Search size={17} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, ID, atau kelas..."
            />
          </div>
        </div>

        <div className="anggota-table-wrap">
          <table className="anggota-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Kelas</th>
                <th>Status</th>
                <th className="anggota-action-head">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const id = getId(item);
                return (
                  <tr key={id}>
                    <td className="anggota-id-cell">{id}</td>
                    <td className="anggota-name-cell">{getName(item)}</td>
                    <td>{getClassName(item)}</td>
                    <td>
                      <span className={`anggota-status-pill ${isActive(item) ? 'active' : 'inactive'}`}>
                        {isActive(item) ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="anggota-actions">
                        <button
                          type="button"
                          className="anggota-icon-btn edit"
                          onClick={() => openEdit(item)}
                          disabled={busy}
                          title="Edit anggota"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          className="anggota-icon-btn delete"
                          onClick={() => removeMember(item)}
                          disabled={busy}
                          title="Hapus / nonaktifkan anggota"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan="5" className="anggota-empty-cell">
                    Belum ada data anggota yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="anggota-modal-backdrop" onMouseDown={closeModal}>
          <div className="anggota-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="anggota-modal-head">
              <div>
                <span>{editing ? 'EDIT ANGGOTA' : 'TAMBAH ANGGOTA'}</span>
                <h2>{editing ? 'Perbarui Data Anggota' : 'Tambah Anggota Baru'}</h2>
              </div>
              <button type="button" className="anggota-modal-close" onClick={closeModal} disabled={busy}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitForm} className="anggota-form">
              {editing && (
                <div className="anggota-readonly-id">
                  <span>ID Anggota</span>
                  <strong>{getId(editing)}</strong>
                </div>
              )}

              <label>
                Nama Lengkap
                <input
                  value={form.nama}
                  onChange={(event) => setForm({ ...form, nama: event.target.value })}
                  placeholder="Nama lengkap anggota"
                  autoFocus
                />
              </label>

              <label>
                Kelas
                <input
                  value={form.kelas}
                  onChange={(event) => setForm({ ...form, kelas: event.target.value })}
                  placeholder="Contoh: XII"
                />
              </label>

              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                >
                  <option value="AKTIF">Aktif</option>
                  <option value="NONAKTIF">Nonaktif</option>
                </select>
              </label>

              <div className="anggota-modal-actions">
                <button type="button" className="anggota-cancel-btn" onClick={closeModal} disabled={busy}>
                  Batal
                </button>
                <button type="submit" className="anggota-save-btn" disabled={busy}>
                  {busy ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Anggota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
