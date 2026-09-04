import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Coins,
  Plus,
  Trash2,
  Wallet,
  XCircle,
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

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  tone,
}) {
  return (
    <label className={`activity-toggle-row ${tone}`}>
      <span className="activity-toggle-icon">
        <Icon size={17} />
      </span>

      <span className="activity-toggle-copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
      />

      <span className="activity-switch" />
    </label>
  );
}

function FeatureBadge({
  active,
  label,
  icon: Icon,
}) {
  return (
    <span
      className={`activity-feature-badge ${
        active ? 'active' : ''
      }`}
    >
      <Icon size={13} />
      {label}
    </span>
  );
}

export default function KegiatanPage() {
  const session = getSession();

  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    namaKegiatan: '',
    kasAktif: false,
    nominalKas: 0,
    dendaAktif: false,
    absensiAktif: true,
  });
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const result = await getApi(
      'kegiatan.list',
      {
        userId: session.userId,
        role: session.role,
      }
    );

    setItems(result);
  }

  useEffect(() => {
    load().catch((err) =>
      setMessage(err.message)
    );
  }, [
    session.role,
    session.userId,
  ]);

  async function create(event) {
    event.preventDefault();

    if (!form.namaKegiatan.trim()) {
      setMessage('Nama kegiatan wajib diisi.');
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      await postApi({
        action: 'kegiatan.create',
        userId: session.userId,
        role: session.role,
        ...form,
      });

      setForm({
        namaKegiatan: '',
        kasAktif: false,
        nominalKas: 0,
        dendaAktif: false,
        absensiAktif: true,
      });

      setMessage(
        'Kegiatan berhasil dibuat.'
      );

      await load();
    } catch (err) {
      setMessage(
        err.message ||
          'Gagal membuat kegiatan.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function deleteKegiatan(item) {
    const yakin = window.confirm(
      `Hapus kegiatan "${item.Nama_Kegiatan}"?\n\n` +
        'Kegiatan yang sudah memiliki absensi, denda, atau kas tidak dapat dihapus.'
    );

    if (!yakin) return;

    setDeletingId(item.Kegiatan_ID);
    setMessage('');

    try {
      await postApi({
        action: 'kegiatan.delete',
        userId: session.userId,
        role: session.role,
        kegiatanId: item.Kegiatan_ID,
      });

      setMessage(
        'Kegiatan berhasil dihapus.'
      );

      await load();
    } catch (err) {
      if (
        err.message ===
        'KEGIATAN_HAS_DATA'
      ) {
        setMessage(
          'Kegiatan tidak dapat dihapus karena sudah memiliki data absensi, denda, atau kas.'
        );
      } else {
        setMessage(
          err.message ||
            'Gagal menghapus kegiatan.'
        );
      }
    } finally {
      setDeletingId('');
    }
  }

  const summary = useMemo(() => {
    return {
      total: items.length,
      absensi: items.filter(
        (item) =>
          String(item.Absensi_Aktif)
            .toUpperCase() === 'TRUE' ||
          item.Absensi_Aktif === true
      ).length,
      denda: items.filter(
        (item) =>
          String(item.Denda_Aktif)
            .toUpperCase() === 'TRUE' ||
          item.Denda_Aktif === true
      ).length,
      kas: items.filter(
        (item) =>
          String(item.Kas_Aktif)
            .toUpperCase() === 'TRUE' ||
          item.Kas_Aktif === true
      ).length,
    };
  }, [items]);

  return (
    <div className="activity-page">

      <section className="activity-hero">
        <div>
          <span className="eyebrow light">
            SEKRETARIS PMR SMANEL
          </span>

          <h1>
            Kelola Kegiatan
          </h1>

          <p>
            Atur kegiatan dan tentukan
            fitur absensi, denda, serta
            Kas yang digunakan.
          </p>
        </div>

        <div className="activity-hero-metric">
          <CalendarDays size={18} />
          <div>
            <span>Kegiatan tersedia</span>
            <strong>{summary.total}</strong>
          </div>
        </div>
      </section>


      {message && (
        <div className="activity-message">
          {message}
        </div>
      )}


      <section className="activity-stat-grid">
        <div className="activity-stat-card neutral">
          <div className="activity-stat-icon">
            <CalendarDays size={19} />
          </div>
          <span>Total Kegiatan</span>
          <strong>{summary.total}</strong>
        </div>

        <div className="activity-stat-card blue">
          <div className="activity-stat-icon">
            <ClipboardCheck size={19} />
          </div>
          <span>Absensi Aktif</span>
          <strong>{summary.absensi}</strong>
        </div>

        <div className="activity-stat-card red">
          <div className="activity-stat-icon">
            <Coins size={19} />
          </div>
          <span>Denda Aktif</span>
          <strong>{summary.denda}</strong>
        </div>

        <div className="activity-stat-card green">
          <div className="activity-stat-icon">
            <Wallet size={19} />
          </div>
          <span>Kas Aktif</span>
          <strong>{summary.kas}</strong>
        </div>
      </section>


      <section className="activity-main-grid">

        <div className="activity-panel">
          <div className="activity-panel-header">
            <div>
              <span>BUAT KEGIATAN</span>
              <h2>Kegiatan Baru</h2>
            </div>

            <div className="activity-panel-header-icon">
              <Plus size={18} />
            </div>
          </div>

          <form
            className="activity-form"
            onSubmit={create}
          >
            <div className="activity-field">
              <label>
                Nama Kegiatan
              </label>

              <input
                required
                value={form.namaKegiatan}
                onChange={(event) =>
                  setForm({
                    ...form,
                    namaKegiatan:
                      event.target.value,
                  })
                }
                placeholder="Contoh: Latihan Rutin PMR"
              />
            </div>

            <div className="activity-config-list">

              <ToggleRow
                icon={ClipboardCheck}
                title="Absensi"
                description="Catat hadir, izin, sakit, dan alpha."
                checked={form.absensiAktif}
                onChange={(checked) =>
                  setForm({
                    ...form,
                    absensiAktif: checked,
                  })
                }
                tone="blue"
              />

              <ToggleRow
                icon={Coins}
                title="Denda"
                description="Buat kewajiban denda berdasarkan aturan."
                checked={form.dendaAktif}
                onChange={(checked) =>
                  setForm({
                    ...form,
                    dendaAktif: checked,
                  })
                }
                tone="red"
              />

              <ToggleRow
                icon={Wallet}
                title="Kas"
                description="Buat kewajiban pembayaran Kas kegiatan."
                checked={form.kasAktif}
                onChange={(checked) =>
                  setForm({
                    ...form,
                    kasAktif: checked,
                  })
                }
                tone="green"
              />

              {form.kasAktif && (
                <div className="activity-field inline">
                  <label>Nominal Kas</label>

                  <div className="activity-money-input">
                    <CircleDollarSign size={17} />

                    <input
                      type="number"
                      min="0"
                      value={
                        form.nominalKas
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          nominalKas:
                            Number(
                              event.target.value
                            ),
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

            </div>

            <button
              type="submit"
              className="activity-primary-btn"
              disabled={busy}
            >
              <Plus size={17} />
              {busy
                ? 'Menyimpan...'
                : 'Simpan Kegiatan'}
            </button>
          </form>
        </div>


        <div className="activity-panel">
          <div className="activity-panel-header">
            <div>
              <span>TERSEDIA</span>
              <h2>Kegiatan Aktif</h2>
            </div>

            <span className="activity-count-badge">
              {items.length} kegiatan
            </span>
          </div>

          <div className="activity-list">
            {!items.length && (
              <div className="activity-empty">
                <CalendarDays size={28} />
                <h3>Belum ada kegiatan</h3>
                <p>
                  Buat kegiatan pertama
                  menggunakan form di sebelah kiri.
                </p>
              </div>
            )}

            {items.map((item) => {
              const absensi =
                String(
                  item.Absensi_Aktif
                ).toUpperCase() === 'TRUE' ||
                item.Absensi_Aktif === true;

              const denda =
                String(
                  item.Denda_Aktif
                ).toUpperCase() === 'TRUE' ||
                item.Denda_Aktif === true;

              const kas =
                String(
                  item.Kas_Aktif
                ).toUpperCase() === 'TRUE' ||
                item.Kas_Aktif === true;

              return (
                <div
                  className="activity-item"
                  key={`${item.Kegiatan_ID}-${item.Nama_Kegiatan}`}
                >
                  <div className="activity-item-main">
                    <div className="activity-item-icon">
                      <CalendarDays size={18} />
                    </div>

                    <div>
                      <strong>
                        {item.Nama_Kegiatan}
                      </strong>

                      <span>
                        {item.Kegiatan_ID}
                      </span>
                    </div>
                  </div>

                  <div className="activity-item-features">
                    <FeatureBadge
                      active={absensi}
                      label="Absensi"
                      icon={ClipboardCheck}
                    />

                    <FeatureBadge
                      active={denda}
                      label="Denda"
                      icon={Coins}
                    />

                    <FeatureBadge
                      active={kas}
                      label={
                        kas && item.Nominal_Kas
                          ? `Kas ${rupiah(
                              item.Nominal_Kas
                            )}`
                          : 'Kas'
                      }
                      icon={Wallet}
                    />
                  </div>

                  <button
                    type="button"
                    className="activity-delete-btn"
                    disabled={
                      deletingId ===
                      item.Kegiatan_ID
                    }
                    onClick={() =>
                      deleteKegiatan(item)
                    }
                  >
                    {deletingId ===
                    item.Kegiatan_ID ? (
                      <span>Menghapus...</span>
                    ) : (
                      <>
                        <Trash2 size={15} />
                        Hapus
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </section>
    </div>
  );
}