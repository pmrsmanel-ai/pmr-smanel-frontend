import React, { useEffect, useState } from 'react';

import { getApi } from '../api';
import { getSession } from '../auth';

import DendaPage from './DendaPage';

export default function ConnectedDendaPage() {
  const session = getSession();

  const [data, setData] = useState([]);
  const [anggota, setAnggota] = useState([]);
  const [error, setError] = useState('');

  async function loadData() {
    setError('');

    try {
      const [
        dendaData,
        anggotaData,
      ] = await Promise.all([
        getApi('denda.list', {
          userId: session.userId,
          role: session.role,
        }),

        getApi('anggota.list', {
          userId: session.userId,
          role: session.role,
        }),
      ]);

      setData(dendaData);
      setAnggota(anggotaData);
    } catch (err) {
      setError(
        err.message ||
          'Gagal memuat data denda.'
      );
    }
  }

  useEffect(() => {
    loadData();
  }, [
    session.userId,
    session.role,
  ]);

  if (error) {
    return (
      <div className="alert error">
        {error}
      </div>
    );
  }

  return (
    <DendaPage
      data={data}
      anggota={anggota}
      session={session}
      onRefresh={loadData}
    />
  );
}