import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Coins,
  FileText,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import {
  Link,
} from 'react-router-dom';

import {
  getApi,
} from '../api';

import {
  getSession,
} from '../auth';

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

function numberValue(value) {
  return Number(value || 0);
}

function safeSummary(data) {
  const kas = data?.KAS || {
    pemasukan: 0,
    pengeluaran: 0,
    saldo: 0,
  };

  const denda = data?.DENDA || {
    pemasukan: 0,
    pengeluaran: 0,
    saldo: 0,
  };

  const piutang = data?.PIUTANG || {
    kas: data?.kasBelumBayar || 0,
    denda: data?.dendaBelumLunas || 0,
    total: data?.totalPiutang || 0,
  };

  const counts = data?.COUNTS || {
    kasBelumBayar: 0,
    dendaBelumLunas: 0,
  };

  return {
    KAS: {
      pemasukan: numberValue(
        kas.pemasukan
      ),
      pengeluaran: numberValue(
        kas.pengeluaran
      ),
      saldo: numberValue(
        kas.saldo
      ),
    },

    DENDA: {
      pemasukan: numberValue(
        denda.pemasukan
      ),
      pengeluaran: numberValue(
        denda.pengeluaran
      ),
      saldo: numberValue(
        denda.saldo
      ),
    },

    PIUTANG: {
      kas: numberValue(
        piutang.kas
      ),
      denda: numberValue(
        piutang.denda
      ),
      total: numberValue(
        piutang.total
      ),
    },

    COUNTS: {
      kasBelumBayar:
        numberValue(
          counts.kasBelumBayar
        ),

      dendaBelumLunas:
        numberValue(
          counts.dendaBelumLunas
        ),
    },

    totalDana:
      numberValue(
        data?.totalDana
      ),
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
}) {
  return (
    <div
      className={`finance-final-stat ${
        tone || ''
      }`}
    >
      <div className="finance-final-stat-icon">
        <Icon size={19} />
      </div>

      <div>
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {note}
        </small>
      </div>
    </div>
  );
}

function MoneyRow({
  label,
  value,
  tone = '',
}) {
  return (
    <div className="finance-final-money-row">
      <span>
        {label}
      </span>

      <strong className={tone}>
        {rupiah(value)}
      </strong>
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  title,
  description,
  tone,
}) {
  return (
    <Link
      to={to}
      className={`finance-final-quick ${tone || ''}`}
    >
      <div className="finance-final-quick-icon">
        <Icon size={18} />
      </div>

      <div>
        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>
      </div>

      <ArrowRight size={15} />
    </Link>
  );
}

export default function KeuanganPage() {
  const session =
    getSession();

  const [
    data,
    setData,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');


  async function load(
    silent = false
  ) {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const result =
        await getApi(
          'keuangan.summary',
          {
            userId:
              session?.userId,

            role:
              session?.role,
          }
        );

      setData(result);
    } catch (err) {
      setError(
        err?.message ||
          'Gagal memuat dashboard keuangan.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }


  useEffect(() => {
    load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    session?.userId,
    session?.role,
  ]);


  const summary =
    useMemo(
      () => safeSummary(data),
      [data]
    );


  const totalPemasukan =
    summary.KAS.pemasukan +
    summary.DENDA.pemasukan;

  const totalPengeluaran =
    summary.KAS.pengeluaran +
    summary.DENDA.pengeluaran;

  const saldoBersih =
    summary.KAS.saldo +
    summary.DENDA.saldo;


  if (loading) {
    return (
      <div className="finance-final-loading">
        <RefreshCw
          size={20}
          className="spin"
        />

        <span>
          Memuat data keuangan...
        </span>
      </div>
    );
  }


  if (error && !data) {
    return (
      <div className="finance-final-error">
        <AlertTriangle
          size={20}
        />

        <div>
          <strong>
            Data keuangan tidak dapat dimuat.
          </strong>

          <span>
            {error}
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            load()
          }
        >
          Coba Lagi
        </button>
      </div>
    );
  }


  return (
    <div className="finance-final-page">

      <section className="finance-final-hero">

        <div>
          <span className="finance-final-eyebrow">
            BENDAHARA · KEUANGAN
          </span>

          <h1>
            Dashboard Keuangan
          </h1>

          <p>
            Pantau posisi dana, arus kas,
            dan piutang PMR SMANEL
            dalam satu halaman.
          </p>
        </div>


        <div className="finance-final-hero-actions">

          <div className="finance-final-hero-total">
            <span>
              SALDO BERSIH
            </span>

            <strong>
              {rupiah(
                saldoBersih
              )}
            </strong>

            <small>
              Kas + Denda
            </small>
          </div>

          <button
            type="button"
            className="finance-final-refresh"
            onClick={() =>
              load(true)
            }
            disabled={
              refreshing
            }
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
              : 'Perbarui Data'}
          </button>

        </div>

      </section>


      {error && data && (
        <div className="finance-final-inline-error">
          <AlertTriangle
            size={15}
          />
          {error}
        </div>
      )}


      <section className="finance-final-stat-grid">

        <StatCard
          icon={Wallet}
          label="Saldo Kas"
          value={rupiah(
            summary.KAS.saldo
          )}
          note="Dana kas yang tersedia"
          tone="green"
        />

        <StatCard
          icon={Coins}
          label="Saldo Denda"
          value={rupiah(
            summary.DENDA.saldo
          )}
          note="Dana denda yang sudah masuk"
          tone="purple"
        />

        <StatCard
          icon={ArrowDownRight}
          label="Piutang Kas"
          value={rupiah(
            summary.PIUTANG.kas
          )}
          note={`${summary.COUNTS.kasBelumBayar} kewajiban belum bayar`}
          tone="orange"
        />

        <StatCard
          icon={AlertTriangle}
          label="Piutang Denda"
          value={rupiah(
            summary.PIUTANG.denda
          )}
          note={`${summary.COUNTS.dendaBelumLunas} denda belum lunas`}
          tone="red"
        />

      </section>


      <section className="finance-final-flow-grid">

        <div className="finance-final-panel">

          <div className="finance-final-panel-head">

            <div>
              <span>
                ARUS DANA
              </span>

              <h2>
                Ringkasan Pemasukan
              </h2>
            </div>

            <TrendingUp
              size={19}
            />

          </div>


          <div className="finance-final-panel-body">

            <MoneyRow
              label="Pemasukan Kas"
              value={
                summary.KAS.pemasukan
              }
              tone="income"
            />

            <MoneyRow
              label="Pemasukan Denda"
              value={
                summary.DENDA.pemasukan
              }
              tone="income"
            />

            <div className="finance-final-total-row">
              <span>
                Total Pemasukan
              </span>

              <strong>
                {rupiah(
                  totalPemasukan
                )}
              </strong>
            </div>

          </div>


          <Link
            to="/pemasukan"
            className="finance-final-panel-link"
          >
            Lihat semua pemasukan

            <ArrowRight
              size={15}
            />
          </Link>

        </div>


        <div className="finance-final-panel">

          <div className="finance-final-panel-head">

            <div>
              <span>
                ARUS DANA
              </span>

              <h2>
                Ringkasan Pengeluaran
              </h2>
            </div>

            <TrendingDown
              size={19}
            />

          </div>


          <div className="finance-final-panel-body">

            <MoneyRow
              label="Pengeluaran Kas"
              value={
                summary.KAS.pengeluaran
              }
              tone="expense"
            />

            <MoneyRow
              label="Pengeluaran Denda"
              value={
                summary.DENDA.pengeluaran
              }
              tone="expense"
            />

            <div className="finance-final-total-row">
              <span>
                Total Pengeluaran
              </span>

              <strong>
                {rupiah(
                  totalPengeluaran
                )}
              </strong>
            </div>

          </div>


          <Link
            to="/pengeluaran"
            className="finance-final-panel-link"
          >
            Lihat semua pengeluaran

            <ArrowRight
              size={15}
            />
          </Link>

        </div>

      </section>


      <section className="finance-final-main-grid">

        <div className="finance-final-panel">

          <div className="finance-final-panel-head">

            <div>
              <span>
                PIUTANG
              </span>

              <h2>
                Kewajiban yang Perlu Ditindaklanjuti
              </h2>
            </div>

            <AlertTriangle
              size={19}
            />

          </div>


          <div className="finance-final-debt-body">

            <div className="finance-final-debt-card kas">

              <div className="finance-final-debt-icon">
                <Wallet
                  size={18}
                />
              </div>

              <div>
                <strong>
                  Kas Belum Bayar
                </strong>

                <span>
                  {summary.COUNTS.kasBelumBayar}{' '}
                  kewajiban anggota
                </span>
              </div>

              <b>
                {rupiah(
                  summary.PIUTANG.kas
                )}
              </b>

              <Link to="/kas">
                Lihat
              </Link>

            </div>


            <div className="finance-final-debt-card denda">

              <div className="finance-final-debt-icon">
                <Coins
                  size={18}
                />
              </div>

              <div>
                <strong>
                  Denda Belum Lunas
                </strong>

                <span>
                  {summary.COUNTS.dendaBelumLunas}{' '}
                  denda anggota
                </span>
              </div>

              <b>
                {rupiah(
                  summary.PIUTANG.denda
                )}
              </b>

              <Link to="/denda">
                Lihat
              </Link>

            </div>


            <div className="finance-final-debt-total">

              <span>
                Total Piutang
              </span>

              <strong>
                {rupiah(
                  summary.PIUTANG.total
                )}
              </strong>

            </div>

          </div>

        </div>


        <div className="finance-final-panel">

          <div className="finance-final-panel-head">

            <div>
              <span>
                POSISI DANA
              </span>

              <h2>
                Saldo per Sumber Dana
              </h2>
            </div>

            <Wallet
              size={19}
            />

          </div>


          <div className="finance-final-source-list">

            <div className="finance-final-source">

              <div>
                <span>
                  KAS
                </span>

                <strong>
                  {rupiah(
                    summary.KAS.saldo
                  )}
                </strong>
              </div>

              <div>
                <small>
                  Masuk
                </small>

                <b className="income">
                  {rupiah(
                    summary.KAS.pemasukan
                  )}
                </b>
              </div>

              <div>
                <small>
                  Keluar
                </small>

                <b className="expense">
                  {rupiah(
                    summary.KAS.pengeluaran
                  )}
                </b>
              </div>

            </div>


            <div className="finance-final-source">

              <div>
                <span>
                  DENDA
                </span>

                <strong>
                  {rupiah(
                    summary.DENDA.saldo
                  )}
                </strong>
              </div>

              <div>
                <small>
                  Masuk
                </small>

                <b className="income">
                  {rupiah(
                    summary.DENDA.pemasukan
                  )}
                </b>
              </div>

              <div>
                <small>
                  Keluar
                </small>

                <b className="expense">
                  {rupiah(
                    summary.DENDA.pengeluaran
                  )}
                </b>
              </div>

            </div>

          </div>

          <div className="finance-final-source-total">
            <span>
              Total Dana Aktif
            </span>

            <strong>
              {rupiah(
                summary.totalDana
              )}
            </strong>
          </div>

        </div>

      </section>


      <section className="finance-final-panel">

        <div className="finance-final-panel-head">

          <div>
            <span>
              AKSES CEPAT
            </span>

            <h2>
              Kelola Keuangan
            </h2>
          </div>

          <FileText
            size={19}
          />

        </div>


        <div className="finance-final-quick-grid">

          <QuickLink
            to="/kas"
            icon={Wallet}
            title="Kas"
            description="Kewajiban & pembayaran kas"
            tone="green"
          />

          <QuickLink
            to="/denda"
            icon={Coins}
            title="Denda"
            description="Denda & pembayaran anggota"
            tone="red"
          />

          <QuickLink
            to="/pemasukan"
            icon={TrendingUp}
            title="Pemasukan"
            description="Lihat seluruh dana masuk"
            tone="blue"
          />

          <QuickLink
            to="/pengeluaran"
            icon={TrendingDown}
            title="Pengeluaran"
            description="Catat penggunaan dana"
            tone="orange"
          />

          <QuickLink
            to="/laporan"
            icon={FileText}
            title="Laporan"
            description="Laporan keuangan lengkap"
            tone="purple"
          />

        </div>

      </section>


      <section className="finance-final-bottom-summary">

        <div>
          <ArrowUpRight
            size={17}
          />

          <span>
            Total Pemasukan
          </span>

          <strong>
            {rupiah(
              totalPemasukan
            )}
          </strong>
        </div>

        <div>
          <ArrowDownRight
            size={17}
          />

          <span>
            Total Pengeluaran
          </span>

          <strong>
            {rupiah(
              totalPengeluaran
            )}
          </strong>
        </div>

        <div>
          <AlertTriangle
            size={17}
          />

          <span>
            Total Piutang
          </span>

          <strong>
            {rupiah(
              summary.PIUTANG.total
            )}
          </strong>
        </div>

      </section>

    </div>
  );
}
