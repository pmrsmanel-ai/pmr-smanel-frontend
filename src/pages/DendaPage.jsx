import React, {
  useMemo,
  useState,
} from 'react';

import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Coins,
  Edit3,
  Eye,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import {
  postApi,
} from '../api';


function rupiah(value) {
  return new Intl.NumberFormat(
    'id-ID',
    {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }
  ).format(Number(value || 0));
}


function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  ).format(date);
}


function inputDate(value) {
  if (!value) {
    return new Date()
      .toISOString()
      .slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date
    .toISOString()
    .slice(0, 10);
}


function dateKey(value) {
  if (!value) return '';
  const text = String(value).trim();
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];
  const slash = text.match(/^(\d{2})[\/](\d{2})[\/](\d{4})$/);
  if (slash) return `${slash[3]}-${slash[2]}-${slash[1]}`;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}


function normalize(value) {
  return String(
    value == null ? '' : value
  )
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}


function isPaid(item) {
  return normalize(item?.Status) === 'LUNAS';
}


function isAutomatic(item) {
  return Boolean(
    String(
      item?.Absensi_ID || ''
    ).trim()
  );
}


function getMemberName(
  member,
  item
) {
  return (
    member?.Nama_Lengkap ||
    member?.Nama ||
    member?.Nama_Anggota ||
    item?.Nama_Anggota ||
    item?.Nama ||
    item?.ID_Anggota ||
    '-'
  );
}


function getMemberClass(member) {
  return (
    member?.Kelas ||
    member?.Kelas_Anggota ||
    member?.Rombel ||
    '-'
  );
}


function initials(name) {
  const parts = String(name || '-')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return 'PM';
  }

  return parts
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase() || ''
    )
    .join('');
}


function buildGroups(
  data,
  anggota
) {
  const memberMap = new Map();

  (Array.isArray(anggota)
    ? anggota
    : []
  ).forEach((member) => {
    const id = String(
      member?.ID_Anggota || ''
    ).trim();

    if (id) {
      memberMap.set(
        normalize(id),
        member
      );
    }
  });

  const groups = new Map();

  (Array.isArray(data)
    ? data
    : []
  ).forEach((item) => {
    const anggotaId = String(
      item?.ID_Anggota || ''
    ).trim();

    if (!anggotaId) return;

    const key = normalize(
      anggotaId
    );

    if (!groups.has(key)) {
      const member =
        memberMap.get(key) ||
        null;

      const name =
        getMemberName(
          member,
          item
        );

      groups.set(key, {
        anggotaId,
        name,
        kelas:
          getMemberClass(member),
        items: [],
      });
    }

    groups
      .get(key)
      .items.push(item);
  });

  return Array.from(
    groups.values()
  )
    .map((group) => {
      const total =
        group.items.reduce(
          (sum, item) =>
            sum +
            Number(
              item?.Nominal || 0
            ),
          0
        );

      const unpaid =
        group.items
          .filter(
            (item) =>
              !isPaid(item)
          )
          .reduce(
            (sum, item) =>
              sum +
              Number(
                item?.Nominal || 0
              ),
            0
          );

      const paid =
        group.items
          .filter(isPaid)
          .reduce(
            (sum, item) =>
              sum +
              Number(
                item?.Nominal || 0
              ),
            0
          );

      const unpaidCount =
        group.items.filter(
          (item) =>
            !isPaid(item)
        ).length;

      return {
        ...group,
        total,
        unpaid,
        paid,
        unpaidCount,
      };
    })
    .sort((a, b) =>
      a.name.localeCompare(
        b.name,
        'id'
      )
    );
}


export default function DendaPage({
  data = [],
  anggota = [],
  session,
  onRefresh,
}) {
  const [
    search,
    setSearch,
  ] = useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('SEMUA');

  const [
    dateFrom,
    setDateFrom,
  ] = useState('');

  const [
    dateTo,
    setDateTo,
  ] = useState('');

  const [
    dateSort,
    setDateSort,
  ] = useState('TERBARU');

  const [
    expanded,
    setExpanded,
  ] = useState({});

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    editing,
    setEditing,
  ] = useState(null);

  const [
    busy,
    setBusy,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState('');

  const [
    paymentItem,
    setPaymentItem,
  ] = useState(null);


  const dateFilteredData = useMemo(() => {
    const from = dateKey(dateFrom);
    const to = dateKey(dateTo);

    return (Array.isArray(data) ? data : []).filter((item) => {
      const current = dateKey(item?.Tanggal);
      if (!current) return !from && !to;
      if (from && current < from) return false;
      if (to && current > to) return false;
      return true;
    });
  }, [data, dateFrom, dateTo]);

  const groups = useMemo(
    () => buildGroups(dateFilteredData, anggota),
    [dateFilteredData, anggota]
  );

  const filteredGroups = useMemo(() => {
    const keyword = normalize(search);

    const result = groups.filter((group) => {
      const matchesSearch =
        !keyword ||
        normalize(group.name).includes(keyword) ||
        normalize(group.anggotaId).includes(keyword);

      const matchesStatus =
        statusFilter === 'SEMUA' ||
        (statusFilter === 'BELUM LUNAS'
          ? group.unpaidCount > 0
          : group.unpaidCount === 0);

      return matchesSearch && matchesStatus;
    });

    const latestDate = (group) =>
      group.items.reduce((latest, item) => {
        const value = dateKey(item?.Tanggal);
        return value > latest ? value : latest;
      }, '');

    return result.sort((a, b) => {
      const aDate = latestDate(a);
      const bDate = latestDate(b);
      if (aDate !== bDate) {
        return dateSort === 'TERLAMA'
          ? aDate.localeCompare(bDate)
          : bDate.localeCompare(aDate);
      }
      return a.name.localeCompare(b.name, 'id');
    });
  }, [groups, search, statusFilter, dateSort]);



  const summary =
    useMemo(() => {
      const all =
        Array.isArray(data)
          ? data
          : [];

      const total =
        all.reduce(
          (sum, item) =>
            sum +
            Number(
              item?.Nominal || 0
            ),
          0
        );

      const unpaid =
        all
          .filter(
            (item) =>
              !isPaid(item)
          )
          .reduce(
            (sum, item) =>
              sum +
              Number(
                item?.Nominal || 0
              ),
            0
          );

      const paid =
        all
          .filter(isPaid)
          .reduce(
            (sum, item) =>
              sum +
              Number(
                item?.Nominal || 0
              ),
            0
          );

      return {
        total,
        unpaid,
        paid,
        memberCount:
          groups.length,
        unpaidItems:
          all.filter(
            (item) =>
              !isPaid(item)
          ).length,
      };
    }, [data, groups]);


  function showMessage(
    text
  ) {
    setMessage(text);
    setError('');
  }


  function showError(
    text
  ) {
    setError(text);
    setMessage('');
  }


  function toggleGroup(
    anggotaId
  ) {
    setExpanded(
      (current) => ({
        ...current,
        [anggotaId]:
          !current[anggotaId],
      })
    );
  }


  function openCreate() {
    setEditing(null);
    setError('');
    setMessage('');
    setFormOpen(true);
  }


  function openEdit(item) {
    if (isPaid(item)) {
      showError(
        'Denda yang sudah LUNAS tidak dapat diedit.'
      );
      return;
    }

    if (isAutomatic(item)) {
      showError(
        'Denda otomatis dari absensi tidak dapat diedit manual.'
      );
      return;
    }

    setEditing(item);
    setError('');
    setMessage('');
    setFormOpen(true);
  }


  async function submitForm(
    form
  ) {
    if (
      !form.anggotaId ||
      !form.nominal
    ) {
      showError(
        'Anggota dan nominal wajib diisi.'
      );
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');

    try {
      if (editing) {
        await postApi({
          action:
            'denda.update',

          userId:
            session.userId,

          role:
            session.role,

          dendaId:
            editing.Denda_ID,

          anggotaId:
            form.anggotaId,

          tanggal:
            form.tanggal,

          nominal:
            Number(
              form.nominal
            ),

          keterangan:
            form.keterangan
              .trim(),
        });

        showMessage(
          'Denda berhasil diperbarui.'
        );
      } else {
        await postApi({
          action:
            'denda.create',

          userId:
            session.userId,

          role:
            session.role,

          anggotaId:
            form.anggotaId,

          tanggal:
            form.tanggal,

          nominal:
            Number(
              form.nominal
            ),

          keterangan:
            form.keterangan
              .trim(),
        });

        showMessage(
          'Denda berhasil ditambahkan.'
        );
      }

      setFormOpen(false);
      setEditing(null);

      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      showError(
        err?.message ||
          'Gagal menyimpan denda.'
      );
    } finally {
      setBusy(false);
    }
  }


  async function removeItem(
    item
  ) {
    if (isPaid(item)) {
      showError(
        'Denda yang sudah LUNAS tidak dapat dihapus.'
      );
      return;
    }

    if (isAutomatic(item)) {
      showError(
        'Denda otomatis dari absensi tidak dapat dihapus manual.'
      );
      return;
    }

    const ok =
      window.confirm(
        `Hapus denda ${rupiah(
          item?.Nominal
        )}?`
      );

    if (!ok) return;

    setBusy(true);
    setError('');
    setMessage('');

    try {
      await postApi({
        action:
          'denda.delete',

        userId:
          session.userId,

        role:
          session.role,

        dendaId:
          item.Denda_ID,
      });

      showMessage(
        'Denda berhasil dihapus.'
      );

      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      showError(
        err?.message ||
          'Gagal menghapus denda.'
      );
    } finally {
      setBusy(false);
    }
  }


  return (
    <div className="denda-crud-page">

      <section className="denda-crud-hero">
        <div>
          <span className="denda-crud-eyebrow">
            BENDAHARA · DENDA
          </span>

          <h1>
            Kelola Denda Anggota
          </h1>

          <p>
            Semua denda anggota
            dikelompokkan berdasarkan
            ID anggota agar data lebih
            rapi dan mudah dipantau.
          </p>
        </div>

        <button
          type="button"
          className="denda-crud-primary"
          onClick={openCreate}
          disabled={busy}
        >
          <Plus size={17} />
          Tambah Denda
        </button>
      </section>


      {(message || error) && (
        <div
          className={
            `denda-crud-alert ${
              error
                ? 'error'
                : 'success'
            }`
          }
        >
          {error || message}
        </div>
      )}


      <section className="denda-crud-summary">

        <div className="denda-crud-summary-card">
          <Coins size={19} />

          <span>Total Denda</span>

          <strong>
            {rupiah(
              summary.total
            )}
          </strong>

          <small>
            {summary.memberCount}{' '}
            anggota
          </small>
        </div>

        <div className="denda-crud-summary-card danger">
          <AlertTriangle size={19} />

          <span>Belum Lunas</span>

          <strong>
            {rupiah(
              summary.unpaid
            )}
          </strong>

          <small>
            {summary.unpaidItems}{' '}
            item
          </small>
        </div>

        <div className="denda-crud-summary-card success">
          <Eye size={19} />

          <span>Sudah Lunas</span>

          <strong>
            {rupiah(
              summary.paid
            )}
          </strong>

          <small>
            Total pembayaran
          </small>
        </div>

      </section>


      <section className="denda-crud-panel">

        <div className="denda-crud-toolbar">

          <div>
            <span>
              DATA DENDA
            </span>

            <h2>
              Denda per Anggota
            </h2>

            <p>
              Klik Detail untuk melihat
              seluruh riwayat denda.
            </p>
          </div>


          <div className="denda-crud-toolbar-actions">

<div className="denda-crud-filters">

              <label className="denda-crud-search">
              <Search size={16} />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Cari nama / ID anggota..."
              />
            </label>

            <label className="denda-crud-date">
              <span>Dari</span>
              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(event) => setDateFrom(event.target.value)}
              />
            </label>

            <label className="denda-crud-date">
              <span>Sampai</span>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="denda-crud-select"
            >
              <option value="SEMUA">
                Semua
              </option>

              <option value="BELUM LUNAS">
                Masih Menunggak
              </option>

              <option value="LUNAS">
                Sudah Lunas
              </option>
            </select>

            <select
              value={dateSort}
              onChange={(event) => setDateSort(event.target.value)}
              className="denda-crud-select denda-crud-sort"
            >
              <option value="TERBARU">Tanggal Terbaru</option>
              <option value="TERLAMA">Tanggal Terlama</option>
            </select>

            <button
              type="button"
              className="denda-crud-primary"
              onClick={openCreate}
              disabled={busy}
            >
              <Plus size={15} />
              Tambah Denda
            </button>

            </div>

          </div>

        </div>


        <div className="denda-crud-list">

          {filteredGroups.length === 0 ? (
            <div className="denda-crud-empty">
              <Coins size={28} />

              <strong>
                Tidak ada data denda
              </strong>

              <span>
                Coba ubah pencarian atau
                filter yang digunakan.
              </span>
            </div>
          ) : (
            filteredGroups.map(
              (group) => {
                const isOpen =
                  Boolean(
                    expanded[
                      group.anggotaId
                    ]
                  );

                return (
                  <article
                    key={
                      group.anggotaId
                    }
                    className={
                      `denda-member-crud-card ${
                        isOpen
                          ? 'expanded'
                          : ''
                      }`
                    }
                  >

                    <div className="denda-member-crud-main">

                      <div className="denda-member-crud-person">
                        <div className="denda-member-crud-avatar">
                          {initials(
                            group.name
                          )}
                        </div>

                        <div>
                          <strong>
                            {group.name}
                          </strong>

                          <span>
                            {group.anggotaId}
                            {' · '}
                            {group.kelas}
                          </span>
                        </div>
                      </div>


                      <div className="denda-member-crud-stat">
                        <span>
                          TOTAL
                        </span>

                        <strong>
                          {rupiah(
                            group.total
                          )}
                        </strong>
                      </div>


                      <div className="denda-member-crud-stat">
                        <span>
                          BELUM LUNAS
                        </span>

                        <strong className="danger">
                          {rupiah(
                            group.unpaid
                          )}
                        </strong>
                      </div>


                      <div className="denda-member-crud-actions">

                        <button
                          type="button"
                          className="denda-crud-secondary"
                          onClick={() =>
                            toggleGroup(
                              group.anggotaId
                            )
                          }
                        >
                          {isOpen ? (
                            <ChevronUp
                              size={15}
                            />
                          ) : (
                            <ChevronDown
                              size={15}
                            />
                          )}

                          {isOpen
                            ? 'Tutup'
                            : 'Detail'}
                        </button>


                      </div>

                    </div>


                    {isOpen && (
                      <div className="denda-member-crud-detail">

                        <div className="denda-detail-crud-head">
                          <div>
                            <strong>
                              Riwayat Denda
                            </strong>

                            <span>
                              {group.items.length}{' '}
                              item
                            </span>
                          </div>

                          <span className="denda-detail-total">
                            Belum lunas:{' '}
                            {rupiah(
                              group.unpaid
                            )}
                          </span>
                        </div>


                        <div className="denda-detail-crud-list">

                          {group.items
                            .slice()
                            .sort(
                              (a, b) =>
                                String(
                                  b?.Tanggal ||
                                    ''
                                ).localeCompare(
                                  String(
                                    a?.Tanggal ||
                                      ''
                                  )
                                )
                            )
                            .map(
                              (item) => {
                                const paid =
                                  isPaid(
                                    item
                                  );

                                const automatic =
                                  isAutomatic(
                                    item
                                  );

                                return (
                                  <div
                                    key={
                                      item.Denda_ID
                                    }
                                    className="denda-detail-crud-row"
                                  >

                                    <div className="denda-detail-crud-info">
                                      <strong>
                                        {item?.Status_Absensi ||
                                          'MANUAL'}
                                      </strong>

                                      <span>
                                        {formatDate(
                                          item?.Tanggal
                                        )}
                                        {' · '}
                                        {item?.Keterangan ||
                                          (
                                            automatic
                                              ? 'Denda otomatis dari absensi'
                                              : 'Denda manual'
                                          )}
                                      </span>

                                      <small>
                                        {item?.Denda_ID}
                                      </small>
                                    </div>


                                    <div className="denda-detail-crud-amount">
                                      {rupiah(
                                        item?.Nominal
                                      )}
                                    </div>


                                    <div>
                                      <span
                                        className={
                                          `denda-crud-status ${
                                            paid
                                              ? 'paid'
                                              : 'unpaid'
                                          }`
                                        }
                                      >
                                        {paid
                                          ? 'LUNAS'
                                          : 'BELUM LUNAS'}
                                      </span>
                                    </div>


                                    <div className="denda-detail-crud-actions">

                                      {!paid && (
                                        <>
                                          <button
                                            type="button"
                                            className="denda-icon-action edit"
                                            onClick={() =>
                                              openEdit(
                                                item
                                              )
                                            }
                                            title={
                                              automatic
                                                ? 'Denda otomatis tidak dapat diedit'
                                                : 'Edit denda'
                                            }
                                            disabled={
                                              automatic ||
                                              busy
                                            }
                                          >
                                            <Edit3
                                              size={15}
                                            />
                                          </button>

                                          <button
                                            type="button"
                                            className="denda-icon-action delete"
                                            onClick={() =>
                                              removeItem(
                                                item
                                              )
                                            }
                                            title={
                                              automatic
                                                ? 'Denda otomatis tidak dapat dihapus'
                                                : 'Hapus denda'
                                            }
                                            disabled={
                                              automatic ||
                                              busy
                                            }
                                          >
                                            <Trash2
                                              size={15}
                                            />
                                          </button>

                                          <button
                                            type="button"
                                            className="denda-pay-crud-btn"
                                            onClick={() =>
                                              setPaymentItem(
                                                item
                                              )
                                            }
                                            disabled={
                                              busy
                                            }
                                          >
                                            Bayar
                                          </button>
                                        </>
                                      )}

                                      {paid && (
                                        <span className="denda-paid-label">
                                          Sudah dibayar
                                        </span>
                                      )}

                                    </div>

                                  </div>
                                );
                              }
                            )}

                        </div>

                      </div>
                    )}

                  </article>
                );
              }
            )
          )}

        </div>

      </section>


      {formOpen && (
        <DendaFormModal
          anggota={
            Array.isArray(
              anggota
            )
              ? anggota
              : []
          }
          initialItem={
            editing
          }
          busy={busy}
          onClose={() => {
            if (!busy) {
              setFormOpen(false);
              setEditing(null);
            }
          }}
          onSubmit={
            submitForm
          }
        />
      )}


      {paymentItem && (
        <PaymentModal
          item={paymentItem}
          member={
            (anggota || []).find(
              (member) =>
                normalize(
                  member?.ID_Anggota
                ) ===
                normalize(
                  paymentItem?.ID_Anggota
                )
            )
          }
          busy={busy}
          session={session}
          onClose={() => {
            if (!busy) {
              setPaymentItem(null);
            }
          }}
          onSuccess={async () => {
            setPaymentItem(null);

            showMessage(
              'Pembayaran denda berhasil dicatat.'
            );

            if (onRefresh) {
              await onRefresh();
            }
          }}
          onError={
            showError
          }
          setBusy={
            setBusy
          }
        />
      )}

    </div>
  );
}


function DendaFormModal({
  anggota,
  initialItem,
  busy,
  onClose,
  onSubmit,
}) {
  const [
    form,
    setForm,
  ] = useState(() => ({
    anggotaId:
      initialItem?.ID_Anggota ||
      '',
    tanggal:
      inputDate(
        initialItem?.Tanggal
      ),
    nominal:
      initialItem?.Nominal != null
        ? String(
            initialItem.Nominal
          )
        : '',
    keterangan:
      initialItem?.Keterangan ||
      '',
  }));

  const editing =
    Boolean(initialItem);


  function update(
    key,
    value
  ) {
    setForm(
      (current) => ({
        ...current,
        [key]: value,
      })
    );
  }


  return (
    <div className="denda-modal-backdrop">

      <div className="denda-crud-modal">

        <div className="denda-modal-head">

          <div>
            <span>
              {editing
                ? 'EDIT DENDA'
                : 'TAMBAH DENDA'}
            </span>

            <h2>
              {editing
                ? 'Perbarui Denda'
                : 'Tambah Denda Manual'}
            </h2>
          </div>

          <button
            type="button"
            className="denda-modal-close"
            onClick={onClose}
            disabled={busy}
          >
            <X size={18} />
          </button>

        </div>


        <div className="denda-form-grid">

          <label>
            <span>
              Anggota
            </span>

            <select
              value={
                form.anggotaId
              }
              onChange={(event) =>
                update(
                  'anggotaId',
                  event.target.value
                )
              }
              disabled={
                busy || editing
              }
            >
              <option value="">
                Pilih anggota
              </option>

              {anggota.map(
                (member) => (
                  <option
                    key={
                      member.ID_Anggota
                    }
                    value={
                      member.ID_Anggota
                    }
                  >
                    {
                      getMemberName(
                        member
                      )
                    }
                    {' — '}
                    {
                      member.ID_Anggota
                    }
                  </option>
                )
              )}
            </select>
          </label>


          <label>
            <span>
              Tanggal
            </span>

            <input
              type="date"
              value={
                form.tanggal
              }
              onChange={(event) =>
                update(
                  'tanggal',
                  event.target.value
                )
              }
              disabled={busy}
            />
          </label>


          <label>
            <span>
              Nominal
            </span>

            <input
              type="number"
              min="1"
              step="1"
              value={
                form.nominal
              }
              onChange={(event) =>
                update(
                  'nominal',
                  event.target.value
                )
              }
              placeholder="Contoh: 10000"
              disabled={busy}
            />
          </label>


          <label className="full">
            <span>
              Keterangan
            </span>

            <textarea
              rows="3"
              value={
                form.keterangan
              }
              onChange={(event) =>
                update(
                  'keterangan',
                  event.target.value
                )
              }
              placeholder="Contoh: Denda terlambat / pelanggaran..."
              disabled={busy}
            />
          </label>

        </div>


        <div className="denda-form-note">
          <AlertTriangle
            size={15}
          />

          <span>
            Denda manual akan masuk ke
            kelompok anggota berdasarkan
            ID_Anggota.
          </span>
        </div>


        <div className="denda-modal-actions">

          <button
            type="button"
            className="denda-modal-secondary"
            onClick={onClose}
            disabled={busy}
          >
            Batal
          </button>

          <button
            type="button"
            className="denda-modal-primary"
            onClick={() =>
              onSubmit(form)
            }
            disabled={busy}
          >
            {busy
              ? 'Menyimpan...'
              : editing
                ? 'Simpan Perubahan'
                : 'Simpan Denda'}
          </button>

        </div>

      </div>

    </div>
  );
}


function PaymentModal({
  item,
  member,
  busy,
  session,
  onClose,
  onSuccess,
  onError,
  setBusy,
}) {
  const [
    method,
    setMethod,
  ] = useState('TUNAI');

  const [
    note,
    setNote,
  ] = useState('');

  const name =
    getMemberName(
      member,
      item
    );


  async function submit() {
    setBusy(true);

    try {
      await postApi({
        action:
          'pembayaran.create',

        userId:
          session.userId,

        role:
          session.role,

        anggotaId:
          item.ID_Anggota,

        jenis:
          'DENDA',

        referensiId:
          item.Denda_ID,

        nominal:
          Number(
            item.Nominal || 0
          ),

        metode:
          method,

        keterangan:
          note.trim(),
      });

      await onSuccess();
    } catch (err) {
      onError(
        err?.message ||
          'Pembayaran gagal.'
      );
    } finally {
      setBusy(false);
    }
  }


  return (
    <div className="denda-modal-backdrop">

      <div className="denda-payment-crud-modal">

        <div className="denda-modal-head">

          <div>
            <span>
              PEMBAYARAN DENDA
            </span>

            <h2>
              Konfirmasi Pembayaran
            </h2>
          </div>

          <button
            type="button"
            className="denda-modal-close"
            onClick={onClose}
            disabled={busy}
          >
            <X size={18} />
          </button>

        </div>


        <div className="denda-payment-member">
          <strong>
            {name}
          </strong>

          <span>
            {item?.ID_Anggota}
          </span>
        </div>


        <div className="denda-payment-summary">

          <div>
            <span>
              Denda ID
            </span>

            <strong>
              {item?.Denda_ID}
            </strong>
          </div>

          <div>
            <span>
              Nominal
            </span>

            <strong className="money">
              {rupiah(
                item?.Nominal
              )}
            </strong>
          </div>

        </div>


        <div className="denda-payment-method">

          <span>
            Metode Pembayaran
          </span>

          <div>

            <button
              type="button"
              className={
                method === 'TUNAI'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setMethod(
                  'TUNAI'
                )
              }
              disabled={busy}
            >
              Tunai
            </button>

            <button
              type="button"
              className={
                method ===
                'TRANSFER'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setMethod(
                  'TRANSFER'
                )
              }
              disabled={busy}
            >
              Transfer
            </button>

          </div>

        </div>


        <label className="denda-payment-note">
          <span>
            Keterangan
          </span>

          <textarea
            rows="3"
            value={note}
            onChange={(event) =>
              setNote(
                event.target.value
              )
            }
            placeholder="Opsional"
            disabled={busy}
          />
        </label>


        <div className="denda-payment-warning">
          Pastikan pembayaran sudah
          benar sebelum disimpan.
          Setelah berhasil, denda akan
          berubah menjadi LUNAS.
        </div>


        <div className="denda-modal-actions">

          <button
            type="button"
            className="denda-modal-secondary"
            onClick={onClose}
            disabled={busy}
          >
            Batal
          </button>

          <button
            type="button"
            className="denda-modal-primary"
            onClick={submit}
            disabled={busy}
          >
            {busy
              ? 'Memproses...'
              : 'Konfirmasi Bayar'}
          </button>

        </div>

      </div>

    </div>
  );
}
