import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
  ClipboardCheck,
  Coins,
} from 'lucide-react';
import { getApi } from '../api';
import { getSession } from '../auth';

const TABS = [
  { id: 'keuangan', label: 'Keuangan', icon: Wallet },
  { id: 'absensi', label: 'Absensi', icon: ClipboardCheck },
  { id: 'kas', label: 'Kas', icon: Wallet },
  { id: 'denda', label: 'Denda', icon: Coins },
];

function rupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function tanggalKey(value) {
  if (!value) return '';
  const text = String(value).trim();
  const iso = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const offset = d.getTime() - d.getTimezoneOffset() * 60000;
  return new Date(offset).toISOString().slice(0, 10);
}

function formatTanggal(value) {
  const key = tanggalKey(value);
  if (!key) return '-';
  const [y, m, d] = key.split('-');
  return `${d}/${m}/${y}`;
}

function todayInput() {
  const today = new Date();
  const offset = today.getTime() - today.getTimezoneOffset() * 60000;
  return new Date(offset).toISOString().slice(0, 10);
}

function firstDayOfMonth() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
}

function csvCell(value) {
  const text = value == null ? '' : String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function downloadCsv(filename, rows) {
  const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function inPeriod(value, start, end) {
  const key = tanggalKey(value);
  return !!key && key >= start && key <= end;
}

function Badge({ children, tone = 'neutral' }) {
  return <span className={`report-badge-v3 ${tone}`}>{children}</span>;
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <div className={`report-summary-card-v3 ${tone}`}>
      <div className="report-summary-icon-v3"><Icon size={18} /></div>
      <div><span>{label}</span><strong>{value}</strong></div>
    </div>
  );
}

export default function LaporanPage() {
  const session = getSession();
  const [tab, setTab] = useState('keuangan');
  const [tanggalMulai, setTanggalMulai] = useState(firstDayOfMonth());
  const [tanggalAkhir, setTanggalAkhir] = useState(todayInput());
  const [sumberDana, setSumberDana] = useState('SEMUA');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function load(silent = false) {
    silent ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const [keuangan, denda, kas, anggota] = await Promise.all([
        getApi('laporan.keuangan', { userId: session.userId, role: session.role, tanggalMulai, tanggalAkhir, sumberDana }),
        getApi('denda.list', { userId: session.userId, role: session.role }),
        getApi('kas.list', { userId: session.userId, role: session.role }),
        getApi('anggota.list', { userId: session.userId, role: session.role }),
      ]);
      let absensi = [];
      try {
        absensi = await getApi('absensi.list', { userId: session.userId, role: session.role });
      } catch (err) {
        absensi = [];
      }
      setData({ keuangan: keuangan || {}, denda: Array.isArray(denda) ? denda : [], kas: Array.isArray(kas) ? kas : [], absensi: Array.isArray(absensi) ? absensi : [], anggota: Array.isArray(anggota) ? anggota : [] });
    } catch (err) {
      setError(err?.message || 'Gagal memuat laporan.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, [session.userId, session.role]);

  const anggotaMap = useMemo(() => {
    const map = {};
    (data?.anggota || []).forEach(item => { map[String(item.ID_Anggota || '').toUpperCase()] = item; });
    return map;
  }, [data?.anggota]);

  const transaksi = useMemo(() => Array.isArray(data?.keuangan?.transaksi) ? data.keuangan.transaksi : [], [data]);
  const ringkasan = data?.keuangan?.ringkasan || { totalPemasukan: 0, totalPengeluaran: 0, saldo: 0, KAS: {}, DENDA: {}, jumlahTransaksi: 0 };

  const absensi = useMemo(() => (data?.absensi || []).filter(x => inPeriod(x.Tanggal, tanggalMulai, tanggalAkhir)).sort((a,b) => tanggalKey(b.Tanggal).localeCompare(tanggalKey(a.Tanggal))), [data?.absensi, tanggalMulai, tanggalAkhir]);
  const denda = useMemo(() => (data?.denda || []).filter(x => inPeriod(x.Tanggal_Terbit || x.Tanggal, tanggalMulai, tanggalAkhir)).sort((a,b) => tanggalKey(b.Tanggal_Terbit || b.Tanggal).localeCompare(tanggalKey(a.Tanggal_Terbit || a.Tanggal))), [data?.denda, tanggalMulai, tanggalAkhir]);
  const kas = useMemo(() => (data?.kas || []).filter(x => inPeriod(x.Tanggal, tanggalMulai, tanggalAkhir)).sort((a,b) => tanggalKey(b.Tanggal).localeCompare(tanggalKey(a.Tanggal))), [data?.kas, tanggalMulai, tanggalAkhir]);

  const absensiSummary = useMemo(() => absensi.reduce((s, x) => { const k = String(x.Status || '').toUpperCase(); if (s[k] != null) s[k]++; return s; }, { HADIR: 0, IZIN: 0, SAKIT: 0, ALPHA: 0 }), [absensi]);
  const dendaSummary = useMemo(() => ({ total: denda.reduce((s,x)=>s+Number(x.Nominal||0),0), lunas: denda.filter(x=>String(x.Status||'').toUpperCase()==='LUNAS').reduce((s,x)=>s+Number(x.Nominal||0),0), belum: denda.filter(x=>String(x.Status||'').toUpperCase()!=='LUNAS').reduce((s,x)=>s+Number(x.Nominal||0),0) }), [denda]);
  const kasSummary = useMemo(() => ({ total: kas.reduce((s,x)=>s+Number(x.Nominal||0),0), lunas: kas.filter(x=>String(x.Status||'').toUpperCase()==='LUNAS').reduce((s,x)=>s+Number(x.Nominal||0),0), belum: kas.filter(x=>String(x.Status||'').toUpperCase()!=='LUNAS').reduce((s,x)=>s+Number(x.Nominal||0),0) }), [kas]);

  function exportCurrent() {
    if (tab === 'keuangan') {
      downloadCsv(`laporan-keuangan-${tanggalMulai}-${tanggalAkhir}.csv`, [
        ['Tanggal','Jenis Transaksi','Sumber Dana','Referensi','ID Anggota','Kategori','Nominal','Metode','Keterangan'],
        ...transaksi.map(x => [formatTanggal(x.Tanggal), x.Jenis_Transaksi, x.Sumber_Dana, x.Referensi_ID, x.ID_Anggota, x.Kategori, Number(x.Nominal||0), x.Metode, x.Keterangan]),
      ]);
      return;
    }
    if (tab === 'absensi') downloadCsv(`laporan-absensi-${tanggalMulai}-${tanggalAkhir}.csv`, [['Tanggal','Kegiatan ID','ID Anggota','Nama','Status','Keterangan'], ...absensi.map(x => [formatTanggal(x.Tanggal), x.Kegiatan_ID, x.ID_Anggota, anggotaMap[String(x.ID_Anggota||'').toUpperCase()]?.Nama_Lengkap || '', x.Status, x.Keterangan])]);
    if (tab === 'kas') downloadCsv(`laporan-kas-${tanggalMulai}-${tanggalAkhir}.csv`, [['Tanggal','Kewajiban ID','Kegiatan ID','ID Anggota','Nama','Nominal','Status','Keterangan'], ...kas.map(x => [formatTanggal(x.Tanggal), x.Kewajiban_ID, x.Kegiatan_ID, x.ID_Anggota, anggotaMap[String(x.ID_Anggota||'').toUpperCase()]?.Nama_Lengkap || '', Number(x.Nominal||0), x.Status, x.Keterangan])]);
    if (tab === 'denda') downloadCsv(`laporan-denda-${tanggalMulai}-${tanggalAkhir}.csv`, [['Tanggal Terbit','Denda ID','Kegiatan ID','ID Anggota','Nama','Jenis Denda','Nominal','Status','Keterangan'], ...denda.map(x => [formatTanggal(x.Tanggal_Terbit || x.Tanggal), x.Denda_ID, x.Kegiatan_ID, x.ID_Anggota, anggotaMap[String(x.ID_Anggota||'').toUpperCase()]?.Nama_Lengkap || '', x.Jenis_Denda, Number(x.Nominal||0), x.Status, x.Keterangan])]);
  }

  function renderKeuangan() {
    return <>
      <section className="report-summary-grid-v3">
        <SummaryCard icon={TrendingUp} label="Total Pemasukan" value={rupiah(ringkasan.totalPemasukan)} tone="income" />
        <SummaryCard icon={TrendingDown} label="Total Pengeluaran" value={rupiah(ringkasan.totalPengeluaran)} tone="expense" />
        <SummaryCard icon={Wallet} label="Saldo Bersih" value={rupiah(ringkasan.saldo)} tone="balance" />
        <SummaryCard icon={FileSpreadsheet} label="Jumlah Transaksi" value={ringkasan.jumlahTransaksi || 0} tone="transaction" />
      </section>
      <section className="report-source-grid-v3">
        {['KAS','DENDA','LAINNYA'].map(source => <div key={source} className={`report-source-card-v3 ${source.toLowerCase()}`}><span>{source}</span><div><small>Pemasukan</small><strong>{rupiah(ringkasan[source]?.pemasukan)}</strong></div><div><small>Pengeluaran</small><strong>{rupiah(ringkasan[source]?.pengeluaran)}</strong></div><div className="source-total"><small>Saldo</small><strong>{rupiah(ringkasan[source]?.saldo)}</strong></div></div>)}
      </section>
      <section className="report-table-card-v3"><div className="report-table-head-v3"><div><span>RINCIAN</span><h2>Daftar Transaksi</h2></div><small>{transaksi.length} transaksi</small></div><div className="report-table-wrap-v3"><table><thead><tr><th>Tanggal</th><th>Jenis</th><th>Sumber</th><th>Referensi</th><th>Anggota</th><th>Nominal</th><th>Keterangan</th></tr></thead><tbody>{transaksi.map((x,i)=><tr key={x.Transaksi_ID || i}><td>{formatTanggal(x.Tanggal)}</td><td>{x.Jenis_Transaksi || '-'}</td><td><Badge tone={String(x.Sumber_Dana||'').toLowerCase()}>{x.Sumber_Dana || '-'}</Badge></td><td>{x.Referensi_ID || '-'}</td><td>{x.ID_Anggota || '-'}</td><td className="money-cell">{rupiah(x.Nominal)}</td><td>{x.Keterangan || '-'}</td></tr>)}{!transaksi.length && <tr><td colSpan="7"><div className="report-empty-v3">Tidak ada transaksi pada periode ini.</div></td></tr>}</tbody></table></div></section>
    </>;
  }

  function renderAbsensi() {
    return <>
      <section className="report-summary-grid-v3 compact">
        <SummaryCard icon={ClipboardCheck} label="Total Absensi" value={absensi.length} tone="transaction" />
        <SummaryCard icon={TrendingUp} label="Hadir" value={absensiSummary.HADIR} tone="income" />
        <SummaryCard icon={FileText} label="Izin + Sakit" value={absensiSummary.IZIN + absensiSummary.SAKIT} tone="balance" />
        <SummaryCard icon={TrendingDown} label="Alpha" value={absensiSummary.ALPHA} tone="expense" />
      </section>
      <section className="report-table-card-v3"><div className="report-table-head-v3"><div><span>REKAP KEHADIRAN</span><h2>Daftar Absensi</h2></div><small>{absensi.length} catatan</small></div><div className="report-table-wrap-v3"><table><thead><tr><th>Tanggal</th><th>Kegiatan</th><th>ID Anggota</th><th>Nama</th><th>Status</th><th>Keterangan</th></tr></thead><tbody>{absensi.map((x,i)=>{const member=anggotaMap[String(x.ID_Anggota||'').toUpperCase()]; const tone=String(x.Status||'').toLowerCase(); return <tr key={x.Absensi_ID||i}><td>{formatTanggal(x.Tanggal)}</td><td>{x.Kegiatan_ID || '-'}</td><td>{x.ID_Anggota||'-'}</td><td>{member?.Nama_Lengkap||'-'}</td><td><Badge tone={tone}>{x.Status||'-'}</Badge></td><td>{x.Keterangan||'-'}</td></tr>})}{!absensi.length&&<tr><td colSpan="6"><div className="report-empty-v3">Belum ada data absensi pada periode ini.</div></td></tr>}</tbody></table></div></section>
    </>;
  }

  function renderKas() {
    return <>
      <section className="report-summary-grid-v3 compact"><SummaryCard icon={Wallet} label="Total Kewajiban" value={rupiah(kasSummary.total)} tone="transaction" /><SummaryCard icon={TrendingUp} label="Sudah Bayar" value={rupiah(kasSummary.lunas)} tone="income" /><SummaryCard icon={TrendingDown} label="Belum Bayar" value={rupiah(kasSummary.belum)} tone="expense" /><SummaryCard icon={FileSpreadsheet} label="Jumlah Kewajiban" value={kas.length} tone="balance" /></section>
      <section className="report-table-card-v3"><div className="report-table-head-v3"><div><span>KEWAJIBAN KAS</span><h2>Daftar Kas Anggota</h2></div><small>{kas.length} kewajiban</small></div><div className="report-table-wrap-v3"><table><thead><tr><th>Tanggal</th><th>Kewajiban</th><th>ID Anggota</th><th>Nama</th><th>Nominal</th><th>Status</th><th>Keterangan</th></tr></thead><tbody>{kas.map((x,i)=>{const member=anggotaMap[String(x.ID_Anggota||'').toUpperCase()]; const paid=String(x.Status||'').toUpperCase()==='LUNAS'; return <tr key={x.Kewajiban_ID||i}><td>{formatTanggal(x.Tanggal)}</td><td>{x.Kewajiban_ID||'-'}</td><td>{x.ID_Anggota||'-'}</td><td>{member?.Nama_Lengkap||'-'}</td><td className="money-cell">{rupiah(x.Nominal)}</td><td><Badge tone={paid?'lunas':'belum'}>{x.Status||'-'}</Badge></td><td>{x.Keterangan||'-'}</td></tr>})}{!kas.length&&<tr><td colSpan="7"><div className="report-empty-v3">Belum ada kewajiban kas pada periode ini.</div></td></tr>}</tbody></table></div></section>
    </>;
  }

  function renderDenda() {
    return <>
      <section className="report-summary-grid-v3 compact"><SummaryCard icon={Coins} label="Total Denda" value={rupiah(dendaSummary.total)} tone="transaction" /><SummaryCard icon={TrendingUp} label="Sudah Lunas" value={rupiah(dendaSummary.lunas)} tone="income" /><SummaryCard icon={TrendingDown} label="Belum Lunas" value={rupiah(dendaSummary.belum)} tone="expense" /><SummaryCard icon={FileSpreadsheet} label="Jumlah Denda" value={denda.length} tone="balance" /></section>
      <section className="report-table-card-v3"><div className="report-table-head-v3"><div><span>REKAP DENDA</span><h2>Daftar Denda Anggota</h2></div><small>{denda.length} denda</small></div><div className="report-table-wrap-v3"><table><thead><tr><th>Tanggal</th><th>Denda</th><th>ID Anggota</th><th>Nama</th><th>Jenis</th><th>Nominal</th><th>Status</th></tr></thead><tbody>{denda.map((x,i)=>{const member=anggotaMap[String(x.ID_Anggota||'').toUpperCase()]; const paid=String(x.Status||'').toUpperCase()==='LUNAS'; return <tr key={x.Denda_ID||i}><td>{formatTanggal(x.Tanggal_Terbit || x.Tanggal)}</td><td>{x.Denda_ID||'-'}</td><td>{x.ID_Anggota||'-'}</td><td>{member?.Nama_Lengkap||'-'}</td><td>{x.Jenis_Denda||'-'}</td><td className="money-cell">{rupiah(x.Nominal)}</td><td><Badge tone={paid?'lunas':'belum'}>{x.Status||'-'}</Badge></td></tr>})}{!denda.length&&<tr><td colSpan="7"><div className="report-empty-v3">Belum ada denda pada periode ini.</div></td></tr>}</tbody></table></div></section>
    </>;
  }

  return <div className="report-page-v3">
    <section className="report-hero-v3"><div><span>BENDAHARA · LAPORAN</span><h1>Pusat Laporan</h1><p>Rekap keuangan, absensi, kas, dan denda dalam satu halaman.</p></div><div className="report-hero-actions-v3"><button type="button" className="report-secondary-btn" onClick={() => window.print()}><FileText size={15}/>Cetak</button><button type="button" className="report-primary-btn" onClick={exportCurrent} disabled={loading}><Download size={15}/>Ekspor CSV</button></div></section>
    {error && <div className="report-alert-v3">{error}</div>}
    <section className="report-tabs-v3">{TABS.map(({id,label,icon:Icon})=><button key={id} type="button" className={tab===id?'active':''} onClick={()=>setTab(id)}><Icon size={16}/>{label}</button>)}</section>
    <section className="report-filter-card-v3"><div className="report-filter-title-v3"><div className="report-filter-icon-v3"><CalendarDays size={17}/></div><div><strong>Filter Laporan</strong><span>Pilih periode yang akan ditampilkan pada laporan aktif.</span></div></div><div className="report-filter-grid-v3"><label><span>Tanggal Mulai</span><input type="date" value={tanggalMulai} max={tanggalAkhir} onChange={e=>setTanggalMulai(e.target.value)}/></label><label><span>Tanggal Akhir</span><input type="date" value={tanggalAkhir} min={tanggalMulai} onChange={e=>setTanggalAkhir(e.target.value)}/></label>{tab==='keuangan'&&<label><span>Sumber Dana</span><select value={sumberDana} onChange={e=>setSumberDana(e.target.value)}><option value="SEMUA">Semua Sumber</option><option value="KAS">KAS</option><option value="DENDA">DENDA</option><option value="LAINNYA">LAINNYA</option></select></label>}<div className="report-filter-submit-v3"><button type="button" className="report-primary-btn" onClick={()=>load(true)} disabled={refreshing}><RefreshCw size={15} className={refreshing?'spin':''}/>{refreshing?'Memuat...':'Perbarui Laporan'}</button></div></div></section>
    {loading ? <div className="report-loading-v3">Memuat data laporan...</div> : <>{tab==='keuangan'&&renderKeuangan()}{tab==='absensi'&&renderAbsensi()}{tab==='kas'&&renderKas()}{tab==='denda'&&renderDenda()}</>}
  </div>;
}
