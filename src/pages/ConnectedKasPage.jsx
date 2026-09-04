import React, { useEffect, useState } from 'react';

import { getApi } from '../api';
import { getSession } from '../auth';

import KasPage from './KasPage';

export default function ConnectedKasPage() {
  const session = getSession();

  const [data, setData] = useState([]);
  const [anggota, setAnggota] = useState([]);
  const [error, setError] = useState('');

  async function loadData() {
    setError('');

    try {
      const [
        kasData,
        anggotaData,
      ] = await Promise.all([
        getApi('kas.list', {
          userId: session.userId,
          role: session.role,
        }),

        getApi('anggota.list', {
          userId: session.userId,
          role: session.role,
        }),
      ]);

      setData(kasData);
      setAnggota(anggotaData);
    } catch (err) {
      setError(
        err.message ||
          'Gagal memuat data Kas.'
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
    <KasPage
      data={data}
      anggota={anggota}
      session={session}
      onRefresh={loadData}
    />
  );
}