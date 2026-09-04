import React, { useEffect, useMemo, useState } from 'react';

import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  Search,
  ShieldCheck,
  UserRound,
  Wallet,
} from 'lucide-react';

import { getApi, postApi } from '../api';

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

function isLunas(item) {
  return normalize(item?.Status) === 'lunas';
}

function dateKey(value) {
  if (!value) return '';

  const raw = String(value).trim();
  if (!raw) return '';

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const local = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (local) {
    return `${local[3]}-${String(local[2]).padStart(2, '0')}-${String(local[1]).padStart(2, '0')}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
}

function displayDate(value) {
  const key = dateKey(value);
  if (!key) return '-';
  const [year, month, day] = key.split('-');
  return `${day}/${month}/${year}`;
}

function findMember(anggota, id) {
  return anggota.find(
    (item) =>
      normalize(item.ID_Anggota) === normalize(id)
  );
}

function memberName(anggota, id) {
  const item = findMember(anggota, id);
  return item?.Nama_Lengkap || item?.Nama || id || '-';
}

function memberClass(anggota, id) {
  return findMember(anggota, id)?.Kelas || '-';
}

function StatCard({ icon: Icon, label, value, tone, meta }) {
  return (
    <div className={`kas-stat-card ${tone}`}>
      <div className="kas-stat-icon">
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

function PaymentModal({ item, name, busy, onClose, onSubmit }) {
  const [metode, setMetode] = useState('TUNAI');
  const [keterangan, setKeterangan] = useState('');

  function submit(event) {
    event.preventDefault();
    onSubmit({ item, metode, keterangan });
  }

  return (
    <div className="kas-modal-backdrop">
      <div className="kas-payment-modal">
        <div className="kas-modal-icon">
          <CreditCard size={22} />
        </div>

        <div className="kas-modal-header">
          <div>
            <span>PEMBAYARAN KAS</span>
            <h2>Konfirmasi Pembayaran</h2>
          </div>

          <button
            type="button"
            className="kas-modal-close"
            onClick={onClose}
            disabled={busy}
            aria-label="Tutup"
          >
            ×
          </button>
        </div>

        <div className="kas-payment-summary">
          <div>
            <span>Anggota</span>
            <strong>{name}</strong>
          </div>
          <div>
            <span>Kegiatan</span>
            <strong>{item.Kegiatan_ID || '-'}</strong>
          </div>
          <div>
            <span>Nominal</span>
            <strong className="money">{rupiah(item.Nominal)}</strong>
          </div>
          <div>
            <span>Referensi</span>
            <strong>{item.Kewajiban_ID}</strong>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="kas-form-field">
            <label>Metode Pembayaran</label>

            <div className="kas-method-grid">
              <button
                type="button"
                className={metode === 'TUNAI' ? 'active' : ''}
                onClick={() => setMetode('TUNAI')}
              >
                <CircleDollarSign size={17} />
                Tunai
              </button>

              <button
                type="button"
                className={metode === 'TRANSFER' ? 'active' : ''}
                onClick={() => setMetode('TRANSFER')}
              >
                <CreditCard size={17} />
                Transfer
              </button>
            </div>
          </div>

          <div className="kas-form-field">
            <label>
              Keterangan
              <span>Opsional</span>
            </label>

            <input
              value={keterangan}
              onChange={(event) => setKeterangan(event.target.value)}
              placeholder="Contoh: pembayaran Kas diterima bendahara"
            />
          </div>

          <div className="kas-modal-actions">
            <button
              type="button"
              className="secondary"
              onClick={onClose}
              disabled={busy}
            >
              Batal
            </button>

            <button
              type="submit"
              className="primary"
              disabled={busy}
            >
              <CheckCircle2 size={17} />
              {busy ? 'Menyimpan...' : 'Konfirmasi Bayar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function KasPage({
  data: dataProp = [],
  anggota: anggotaProp = [],
  session,
  onRefresh,
}) {
  const [localData, setLocalData] =
    useState([]);

  const [localAnggota, setLocalAnggota] =
    useState([]);

  const [localLoading, setLocalLoading] =
    useState(false);

  const [localError, setLocalError] =
    useState('');

  const hasExternalData =
    Array.isArray(dataProp) &&
    dataProp.length > 0;

  const hasExternalAnggota =
    Array.isArray(anggotaProp) &&
    anggotaProp.length > 0;

  const data =
    hasExternalData
      ? dataProp
      : localData;

  const anggota =
    hasExternalAnggota
      ? anggotaProp
      : localAnggota;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('SEMUA');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateSort, setDateSort] = useState('TERBARU');
  const [expanded, setExpanded] = useState({});
  const [paymentItem, setPaymentItem] = useState(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [message, setMessage] = useState('');

  /*
   * Fallback loader:
   * KasPage tetap dapat membaca data langsung dari API
   * bila App.jsx/Wrapper belum meneruskan data Kas.
   */
  async function loadLocalData() {
    if (
      !session?.userId ||
      !session?.role
    ) {
      return;
    }

    setLocalLoading(true);
    setLocalError('');

    try {
      const [
        kasData,
        anggotaData,
      ] = await Promise.all([
        getApi(
          'kas.list',
          {
            userId:
              session.userId,
            role:
              session.role,
          }
        ),

        getApi(
          'anggota.list',
          {
            userId:
              session.userId,
            role:
              session.role,
          }
        ),
      ]);

      setLocalData(
        Array.isArray(kasData)
          ? kasData
          : []
      );

      setLocalAnggota(
        Array.isArray(anggotaData)
          ? anggotaData
          : []
      );

    } catch (error) {
      setLocalError(
        error?.message ||
          'Gagal memuat data Kas.'
      );
    } finally {
      setLocalLoading(false);
    }
  }

  useEffect(() => {
    /*
     * Hanya ambil sendiri saat parent belum
     * memberikan data. Ini mencegah request
     * duplikat ketika KasPageWrapper sudah
     * bekerja normal.
     */
    if (
      !hasExternalData ||
      !hasExternalAnggota
    ) {
      loadLocalData();
    }
  }, [
    session?.userId,
    session?.role,
    hasExternalData,
    hasExternalAnggota,
  ]);

  const summary = useMemo(() => {
    const unpaid = data.filter((item) => !isLunas(item));
    const paid = data.filter((item) => isLunas(item));

    return {
      total: data.length,
      unpaid: unpaid.length,
      paid: paid.length,
      unpaidAmount: unpaid.reduce(
        (sum, item) => sum + Number(item.Nominal || 0),
        0
      ),
      paidAmount: paid.reduce(
        (sum, item) => sum + Number(item.Nominal || 0),
        0
      ),
      members: new Set(data.map((item) => item.ID_Anggota)).size,
      unpaidMembers: new Set(
        unpaid.map((item) => item.ID_Anggota)
      ).size,
    };
  }, [data]);

  const filtered = useMemo(() => {
    const q = normalize(search);

    return data.filter((item) => {
      const name = memberName(anggota, item.ID_Anggota);

      const matchesSearch =
        !q ||
        normalize(name).includes(q) ||
        normalize(item.ID_Anggota).includes(q) ||
        normalize(item.Kegiatan_ID).includes(q) ||
        normalize(item.Kewajiban_ID).includes(q) ||
        normalize(item.Keterangan).includes(q);

      const matchesStatus =
        statusFilter === 'SEMUA' ||
        (statusFilter === 'BELUM BAYAR' && !isLunas(item)) ||
        (statusFilter === 'LUNAS' && isLunas(item));

      const itemDate = dateKey(item.Tanggal);
      const matchesStart = !startDate || (itemDate && itemDate >= startDate);
      const matchesEnd = !endDate || (itemDate && itemDate <= endDate);

      return matchesSearch && matchesStatus && matchesStart && matchesEnd;
    });
  }, [data, anggota, search, statusFilter, startDate, endDate]);

  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aDate = dateKey(a.Tanggal);
      const bDate = dateKey(b.Tanggal);

      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;

      return dateSort === 'TERLAMA'
        ? aDate.localeCompare(bDate)
        : bDate.localeCompare(aDate);
    });
  }, [filtered, dateSort]);

  const grouped = useMemo(() => {
    const groups = new Map();

    sortedFiltered.forEach((item) => {
      const key = item.ID_Anggota || item.Kewajiban_ID;

      if (!groups.has(key)) {
        groups.set(key, {
          anggotaId: item.ID_Anggota,
          nama: memberName(anggota, item.ID_Anggota),
          kelas: memberClass(anggota, item.ID_Anggota),
          items: [],
        });
      }

      groups.get(key).items.push(item);
    });

    return Array.from(groups.values());
  }, [filtered, anggota]);

  function toggle(id) {
    setExpanded((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  async function processPayment({ item, metode, keterangan }) {
    setPaymentBusy(true);
    setMessage('');

    try {
      await postApi({
        action: 'pembayaran.create',
        userId: session.userId,
        role: session.role,
        anggotaId: item.ID_Anggota,
        jenis: 'KAS',
        referensiId: item.Kewajiban_ID,
        nominal: Number(item.Nominal || 0),
        metode,
        keterangan,
      });

      setMessage(
        `Pembayaran Kas ${item.Kewajiban_ID} berhasil dicatat.`
      );

      setPaymentItem(null);

      if (onRefresh) {
        await onRefresh();
      } else {
        await loadLocalData();
      }
    } catch (error) {
      setMessage(error.message || 'Pembayaran Kas gagal.');
    } finally {
      setPaymentBusy(false);
    }
  }

  return (
    <div className="kas-page">
      <section className="kas-hero">
        <div>
          <span className="eyebrow light">BENDAHARA PMR SMANEL</span>
          <h1>Pengelolaan Kas</h1>
          <p>
            Pantau kewajiban Kas anggota dan catat pembayaran
            dengan cepat dari satu halaman.
          </p>
        </div>

        <div className="kas-hero-metric">
          <Wallet size={19} />
          <div>
            <span>Piutang Kas</span>
            <strong>{rupiah(summary.unpaidAmount)}</strong>
          </div>
        </div>
      </section>

      {(message || localError) && (
        <div className="kas-message">
          <ShieldCheck size={16} />
          {localError || message}
        </div>
      )}

      {localLoading && (
        <div className="kas-message">
          <Wallet size={16} />
          Memuat data Kas...
        </div>
      )}

      <section className="kas-stat-grid">
        <StatCard
          icon={Wallet}
          label="Total Kewajiban"
          value={summary.total}
          tone="neutral"
          meta={rupiah(summary.unpaidAmount + summary.paidAmount)}
        />
        <StatCard
          icon={ShieldCheck}
          label="Belum Bayar"
          value={summary.unpaid}
          tone="red"
          meta={rupiah(summary.unpaidAmount)}
        />
        <StatCard
          icon={CheckCircle2}
          label="Sudah Lunas"
          value={summary.paid}
          tone="green"
          meta={rupiah(summary.paidAmount)}
        />
        <StatCard
          icon={UserRound}
          label="Anggota Bertunggakan"
          value={summary.unpaidMembers}
          tone="orange"
          meta={`${summary.members} anggota memiliki Kas`}
        />
      </section>

      <section className="kas-panel">
        <div className="kas-toolbar">
          <div>
            <span>DATABASE KAS</span>
            <h2>Daftar Kewajiban Kas</h2>
            <p>
              Satu anggota ditampilkan sebagai satu laporan
              dengan seluruh kewajiban Kas.
            </p>
          </div>

          <div className="kas-filter-group kas-filter-group-date">
            <div className="kas-search">
              <Search size={17} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, ID, kegiatan..."
              />
            </div>

            <label className="kas-date-filter">
              <CalendarDays size={15} />
              <span>Dari</span>
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
                aria-label="Tanggal mulai"
              />
            </label>

            <label className="kas-date-filter">
              <CalendarDays size={15} />
              <span>Sampai</span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                aria-label="Tanggal akhir"
              />
            </label>

            <select
              className="kas-status-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="SEMUA">Semua Status</option>
              <option value="BELUM BAYAR">Belum Bayar</option>
              <option value="LUNAS">Lunas</option>
            </select>

            <select
              className="kas-status-select kas-sort-select"
              value={dateSort}
              onChange={(event) => setDateSort(event.target.value)}
              aria-label="Urutan tanggal"
            >
              <option value="TERBARU">Tanggal Terbaru</option>
              <option value="TERLAMA">Tanggal Terlama</option>
            </select>
          </div>
        </div>

        <div className="kas-list">
          {!grouped.length && (
            <div className="kas-empty">
              <Wallet size={28} />
              <h3>Tidak ada data Kas</h3>
              <p>Coba ubah pencarian atau filter status.</p>
            </div>
          )}

          {grouped.map((group) => {
            const open = !!expanded[group.anggotaId];
            const unpaid = group.items.filter((item) => !isLunas(item));

            const totalNominal = group.items.reduce(
              (sum, item) => sum + Number(item.Nominal || 0),
              0
            );

            const unpaidNominal = unpaid.reduce(
              (sum, item) => sum + Number(item.Nominal || 0),
              0
            );

            const latestDate = [...group.items]
              .map((item) => dateKey(item.Tanggal))
              .filter(Boolean)
              .sort()
              .pop() || '';

            return (
              <div
                key={group.anggotaId}
                className="kas-member-card"
              >
                <button
                  type="button"
                  className="kas-member-main"
                  onClick={() => toggle(group.anggotaId)}
                >
                  <div className="kas-member-avatar">
                    <UserRound size={19} />
                  </div>

                  <div className="kas-member-info">
                    <strong>{group.nama}</strong>
                    <span>
                      {group.anggotaId} • Kelas {group.kelas}
                    </span>
                  </div>

                  <div className="kas-member-stat">
                    <span>TOTAL</span>
                    <strong>{group.items.length}</strong>
                  </div>

                  <div className="kas-member-stat">
                    <span>BELUM BAYAR</span>
                    <strong className="red">{unpaid.length}</strong>
                  </div>

                  <div className="kas-member-amount">
                    <span>PIUTANG</span>
                    <strong>{rupiah(unpaidNominal)}</strong>
                  </div>

                  <div className="kas-member-date">
                    <span>TERAKHIR</span>
                    <strong>{displayDate(latestDate)}</strong>
                  </div>

                  <ChevronDown
                    size={17}
                    className={open ? 'rotate' : ''}
                  />
                </button>

                {open && (
                  <div className="kas-detail">
                    <div className="kas-detail-summary">
                      <div>
                        <span>Total Kewajiban</span>
                        <strong>{rupiah(totalNominal)}</strong>
                      </div>
                      <div>
                        <span>Belum Bayar</span>
                        <strong className="red">
                          {rupiah(unpaidNominal)}
                        </strong>
                      </div>
                      <div>
                        <span>Sudah Lunas</span>
                        <strong className="green">
                          {rupiah(totalNominal - unpaidNominal)}
                        </strong>
                      </div>
                    </div>

                    <div className="kas-detail-list">
                      {group.items.map((item) => {
                        const lunas = isLunas(item);

                        return (
                          <div
                            className="kas-detail-row"
                            key={item.Kewajiban_ID}
                          >
                            <div>
                              <strong>
                                {item.Kegiatan_ID || 'Kegiatan'}
                              </strong>
                              <span>
                                {item.Kewajiban_ID} • {item.Tanggal || '-'}
                              </span>
                            </div>

                            <div className="kas-detail-note">
                              {item.Keterangan ||
                                'Kewajiban kas kegiatan'}
                            </div>

                            <strong className="kas-detail-money">
                              {rupiah(item.Nominal)}
                            </strong>

                            <span
                              className={`kas-detail-status ${
                                lunas ? 'lunas' : 'belum'
                              }`}
                            >
                              {lunas ? 'LUNAS' : 'BELUM BAYAR'}
                            </span>

                            {!lunas && (
                              <button
                                type="button"
                                className="kas-pay-btn"
                                onClick={() =>
                                  setPaymentItem(item)
                                }
                              >
                                <CreditCard size={15} />
                                Bayar
                              </button>
                            )}

                            {lunas && (
                              <span className="kas-paid-icon">
                                <CheckCircle2 size={17} />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="kas-footer">
          Menampilkan <strong>{grouped.length}</strong> anggota dari{' '}
          <strong>
            {new Set(data.map((item) => item.ID_Anggota)).size}
          </strong>{' '}
          anggota yang memiliki kewajiban Kas.
        </div>
      </section>

      {paymentItem && (
        <PaymentModal
          item={paymentItem}
          name={memberName(anggota, paymentItem.ID_Anggota)}
          busy={paymentBusy}
          onClose={() => setPaymentItem(null)}
          onSubmit={processPayment}
        />
      )}
    </div>
  );
}