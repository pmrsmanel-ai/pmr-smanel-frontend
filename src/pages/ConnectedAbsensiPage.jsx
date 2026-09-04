import React, { useEffect, useState } from 'react';

import { getApi, postApi } from '../api';
import { getSession } from '../auth';

import AbsensiPage from './AbsensiPage';
import AbsensiConfirmationModal from '../components/absensi/AbsensiConfirmationModal';

export default function ConnectedAbsensiPage() {
  const session = getSession();

  const [kegiatan, setKegiatan] = useState([]);
  const [anggota, setAnggota] = useState([]);
  const [selected, setSelected] = useState('');
  const [statusMap, setStatusMap] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function loadData() {
    setMessage('');

    try {
      const [kegiatanData, anggotaData] =
        await Promise.all([
          getApi('kegiatan.list', {
            userId: session.userId,
            role: session.role,
            status: 'AKTIF',
          }),

          getApi('anggota.list', {
            userId: session.userId,
            role: session.role,
          }),
        ]);

      setKegiatan(kegiatanData);
      setAnggota(anggotaData);
    } catch (err) {
      setMessage(
        err.message ||
          'Gagal mengambil data.'
      );
    }
  }

  useEffect(() => {
    loadData();
  }, [
    session.role,
    session.userId,
  ]);

  /*
   * Hanya anggota yang benar-benar
   * dipilih statusnya yang dihitung.
   */
  const selectedEntries =
    Object.entries(statusMap);

  const selectedCount =
    selectedEntries.length;

  const summary =
    selectedEntries.reduce(
      (result, [, status]) => {
        if (
          Object.prototype.hasOwnProperty.call(
            result,
            status
          )
        ) {
          result[status]++;
        }

        return result;
      },
      {
        HADIR: 0,
        IZIN: 0,
        SAKIT: 0,
        ALPHA: 0,
      }
    );

  function openConfirmation() {
    if (!selected) {
      setMessage(
        'Pilih kegiatan terlebih dahulu.'
      );
      return;
    }

    if (!selectedCount) {
      setMessage(
        'Pilih minimal satu anggota terlebih dahulu.'
      );
      return;
    }

    setMessage('');
    setConfirmOpen(true);
  }

  async function submitAbsensi() {
    /*
     * Hanya statusMap yang dikirim.
     * Jika hanya 4 anggota dipilih,
     * records hanya berisi 4 anggota.
     */
    const records =
      Object.entries(statusMap).map(
        ([anggotaId, status]) => ({
          anggotaId,
          status,
          keterangan: '',
        })
      );

    if (!records.length) {
      setMessage(
        'Tidak ada anggota yang dipilih.'
      );
      setConfirmOpen(false);
      return;
    }

    setBusy(true);
    setConfirmOpen(false);
    setMessage('');

    try {
      const result =
        await postApi({
          action: 'absensi.submit',
          userId: session.userId,
          role: session.role,
          kegiatanId: selected,
          records,
        });

      setMessage(
        `Berhasil: ${result.saved} absensi, ${result.finesCreated} denda, ${result.kasDuesCreated} kewajiban kas.`
      );

      setStatusMap({});
    } catch (err) {
      setMessage(
        err.message ||
          'Gagal mengirim absensi.'
      );
    } finally {
      setBusy(false);
    }
  }

  const selectedActivity =
    kegiatan.find(
      (item) =>
        item.Kegiatan_ID === selected
    );

  return (
    <>
      <AbsensiPage
        kegiatan={kegiatan}
        anggota={anggota}
        selected={selected}
        setSelected={(value) => {
          setSelected(value);
          setStatusMap({});
          setMessage('');
        }}
        statusMap={statusMap}
        setStatusMap={setStatusMap}
        busy={busy}
        message={message}
        onSubmit={openConfirmation}
      />

      {confirmOpen && (
        <AbsensiConfirmationModal
          kegiatan={selectedActivity}
          total={selectedCount}
          summary={summary}
          onCancel={() =>
            setConfirmOpen(false)
          }
          onConfirm={submitAbsensi}
          busy={busy}
        />
      )}
    </>
  );
}