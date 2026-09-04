import React, { useMemo, useState } from 'react';

import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Search,
  CalendarDays,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UserX,
  Users,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { key: 'HADIR', label: 'Hadir', icon: CheckCircle2, tone: 'green' },
  { key: 'IZIN', label: 'Izin', icon: ShieldCheck, tone: 'blue' },
  { key: 'SAKIT', label: 'Sakit', icon: Stethoscope, tone: 'orange' },
  { key: 'ALPHA', label: 'Alpha', icon: UserX, tone: 'red' },
];

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

function getClassName(item) {
  return item?.Kelas || item?.Kelas_Anggota || item?.Kelas_Siswa || '-';
}

function getMemberName(item) {
  return item?.Nama_Lengkap || item?.Nama || item?.Nama_Anggota || '-';
}

function getMemberId(item) {
  return item?.ID_Anggota || item?.Anggota_ID || '-';
}

function StatusButton({ option, active, onClick }) {
  const Icon = option.icon;

  return (
    <button
      type="button"
      className={`attendance-status-btn ${option.tone} ${active ? 'active' : ''}`}
      onClick={onClick}
      title={`Tandai ${option.label}`}
    >
      <Icon size={15} />
      <span>{option.label}</span>
      {active && <Check size={13} className="status-check" />}
    </button>
  );
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <div className={`attendance-summary-card ${tone}`}>
      <div className="attendance-summary-icon">
        <Icon size={18} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default function AbsensiPage({
  kegiatan,
  anggota,
  selected,
  setSelected,
  tanggalKegiatan,
  setTanggalKegiatan,
  statusMap,
  setStatusMap,
  busy,
  message,
  onSubmit,
}) {
  const [search, setSearch] = useState('');
  const [kelas, setKelas] = useState('SEMUA');

  const selectedActivity = kegiatan.find(
    (item) => item.Kegiatan_ID === selected
  );

  function formatActivityDate(value) {
    if (!value) return '-';
    const raw = String(value);
    const datePart = raw.includes('T') ? raw.slice(0, 10) : raw;
    const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return raw;
    return `${match[3]}-${match[2]}-${match[1]}`;
  }

  const classOptions = useMemo(() => {
    const values = anggota
      .map(getClassName)
      .filter((value) => value && value !== '-');

    return ['SEMUA', ...Array.from(new Set(values)).sort()];
  }, [anggota]);

  const visibleMembers = anggota.filter((item) => {
    const q = normalize(search);

    const matchesSearch =
      !q ||
      normalize(getMemberName(item)).includes(q) ||
      normalize(getMemberId(item)).includes(q) ||
      normalize(getClassName(item)).includes(q);

    const matchesClass =
      kelas === 'SEMUA' || getClassName(item) === kelas;

    return matchesSearch && matchesClass;
  });

  const selectedEntries = Object.entries(statusMap);

  const summary = selectedEntries.reduce(
    (result, [, status]) => {
      if (Object.prototype.hasOwnProperty.call(result, status)) {
        result[status]++;
      }
      return result;
    },
    { HADIR: 0, IZIN: 0, SAKIT: 0, ALPHA: 0 }
  );

  const totalAnggota = anggota.length;
  const filled = selectedEntries.length;

  const completion =
    totalAnggota > 0
      ? Math.round((filled / totalAnggota) * 100)
      : 0;

  function setStatus(anggotaId, status) {
    setStatusMap((current) => ({
      ...current,
      [anggotaId]: status,
    }));
  }

  function clearStatus(anggotaId) {
    setStatusMap((current) => {
      const next = { ...current };
      delete next[anggotaId];
      return next;
    });
  }

  function markAll(status) {
    const next = {};

    anggota.forEach((item) => {
      const id = getMemberId(item);

      if (id && id !== '-') {
        next[id] = status;
      }
    });

    setStatusMap(next);
  }

  function resetAll() {
    setStatusMap({});
  }

  return (
    <div className="attendance-page">
      <section className="attendance-hero">
        <div className="attendance-hero-copy">
          <span className="eyebrow">SEKRETARIS PMR SMANEL</span>

          <h1>
            Absensi
            <br />
            Kehadiran Anggota
          </h1>

          <p>
            Catat kehadiran anggota dengan cepat, jelas, dan terkontrol.
          </p>

          {selectedActivity && (
            <div className="attendance-hero-activity">
              <ClipboardCheck size={16} />
              <div>
                <span>Kegiatan aktif</span>
                <strong>
                  {selectedActivity.Nama_Kegiatan || '-'}
                </strong>
                <small>
                  Tanggal: {formatActivityDate(tanggalKegiatan)}
                </small>
              </div>
            </div>
          )}
        </div>

        <div className="attendance-hero-progress">
          <span>PENGISIAN ABSENSI</span>
          <strong>
            {filled}/{totalAnggota}
          </strong>

          <div className="attendance-hero-progress-bar">
            <div style={{ width: `${completion}%` }} />
          </div>

          <small>{completion}% data terisi</small>
        </div>
      </section>

      {message && (
        <div className="attendance-message">
          <AlertCircle size={17} />
          <span>{message}</span>
        </div>
      )}

      <section className="attendance-control-panel">
        <div className="attendance-control-top">
          <div className="attendance-field large">
            <label>Kegiatan</label>
            <div className="attendance-select-wrap">
              <ClipboardCheck size={17} />

              <select
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
              >
                <option value="">Pilih kegiatan...</option>

                {kegiatan.map((item) => (
                  <option
                    key={item.Kegiatan_ID}
                    value={item.Kegiatan_ID}
                  >
                    {item.Nama_Kegiatan}
                  </option>
                ))}
              </select>

              <ChevronDown size={16} />
            </div>
          </div>

          <div className="attendance-field attendance-date-field">
            <label>Tanggal Kegiatan</label>

            <div className="attendance-date-wrap">
              <CalendarDays size={17} />

              <input
                type="date"
                value={tanggalKegiatan || ''}
                onChange={(event) => setTanggalKegiatan(event.target.value)}
                disabled={!selected}
                required
              />
            </div>

            <small className="attendance-field-hint">
              Tanggal ini digunakan untuk pencatatan absensi.
            </small>
          </div>

          <div className="attendance-field">
            <label>Cari Anggota</label>

            <div className="attendance-search-wrap">
              <Search size={17} />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nama, ID, atau kelas..."
              />
            </div>
          </div>

          <div className="attendance-field class-filter">
            <label>Kelas</label>

            <div className="attendance-select-wrap">
              <Users size={16} />

              <select
                value={kelas}
                onChange={(event) => setKelas(event.target.value)}
              >
                {classOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'SEMUA' ? 'Semua Kelas' : option}
                  </option>
                ))}
              </select>

              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <div className="attendance-summary-grid">
          <SummaryCard
            icon={CheckCircle2}
            label="Hadir"
            value={summary.HADIR}
            tone="green"
          />

          <SummaryCard
            icon={ShieldCheck}
            label="Izin"
            value={summary.IZIN}
            tone="blue"
          />

          <SummaryCard
            icon={Stethoscope}
            label="Sakit"
            value={summary.SAKIT}
            tone="orange"
          />

          <SummaryCard
            icon={UserX}
            label="Alpha"
            value={summary.ALPHA}
            tone="red"
          />

          <SummaryCard
            icon={Users}
            label="Belum Dipilih"
            value={Math.max(0, totalAnggota - filled)}
            tone="neutral"
          />
        </div>
      </section>

      <section className="attendance-list-panel">
        <div className="attendance-list-header">
          <div>
            <span>DATA ANGGOTA</span>
            <h2>Daftar Anggota</h2>
            <p>{visibleMembers.length} anggota ditampilkan</p>
          </div>

          <div className="attendance-header-actions">
            <button
              type="button"
              className="attendance-tool-btn green"
              onClick={() => markAll('HADIR')}
              disabled={!totalAnggota}
            >
              <CheckCircle2 size={15} />
              Hadir Semua
            </button>

            <button
              type="button"
              className="attendance-tool-btn"
              onClick={resetAll}
              disabled={!filled}
            >
              Reset
            </button>
          </div>
        </div>

        {!selected && (
          <div className="attendance-empty-state">
            <div>
              <ClipboardCheck size={28} />
            </div>
            <h3>Pilih kegiatan terlebih dahulu</h3>
            <p>Setelah kegiatan dipilih, daftar anggota siap diisi.</p>
          </div>
        )}

        {selected && visibleMembers.length === 0 && (
          <div className="attendance-empty-state">
            <div>
              <Search size={28} />
            </div>
            <h3>Anggota tidak ditemukan</h3>
            <p>Coba ubah kata pencarian atau filter kelas.</p>
          </div>
        )}

        {selected && visibleMembers.length > 0 && (
          <div className="attendance-member-list">
            {visibleMembers.map((item, index) => {
              const id = getMemberId(item);
              const currentStatus = statusMap[id];

              return (
                <div
                  key={id}
                  className={`attendance-member-card ${
                    currentStatus ? 'is-filled' : ''
                  }`}
                >
                  <div className="attendance-member-index">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="attendance-member-avatar">
                    <UserRound size={19} />
                  </div>

                  <div className="attendance-member-info">
                    <strong>{getMemberName(item)}</strong>
                    <span>
                      {id} • Kelas {getClassName(item)}
                    </span>
                  </div>

                  <div className="attendance-status-actions">
                    {STATUS_OPTIONS.map((option) => (
                      <StatusButton
                        key={option.key}
                        option={option}
                        active={currentStatus === option.key}
                        onClick={() =>
                          currentStatus === option.key
                            ? clearStatus(id)
                            : setStatus(id, option.key)
                        }
                      />
                    ))}
                  </div>

                  <div
                    className={`attendance-current-status ${
                      currentStatus
                        ? currentStatus.toLowerCase()
                        : 'empty'
                    }`}
                  >
                    {currentStatus || 'Belum dipilih'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="attendance-submit-bar">
        <div className="attendance-submit-progress">
          <div>
            <span>Kesiapan Absensi</span>
            <strong>
              {filled}/{totalAnggota}
            </strong>
          </div>

          <div className="attendance-submit-line">
            <div style={{ width: `${completion}%` }} />
          </div>

          <small>
            {completion === 100
              ? 'Semua anggota sudah memiliki status.'
              : 'Lengkapi status sebelum mengirim absensi.'}
          </small>
        </div>

        <button
          type="button"
          className="attendance-submit-btn"
          onClick={onSubmit}
          disabled={busy || !selected || !tanggalKegiatan || !filled}
        >
          <Check size={17} />
          {busy ? 'Mengirim...' : 'Konfirmasi & Kirim'}
        </button>
      </section>
    </div>
  );
}
