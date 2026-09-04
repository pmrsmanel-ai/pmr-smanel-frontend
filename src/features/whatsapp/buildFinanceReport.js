function rupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function isLunas(item) {
  return (
    String(item?.Status || '')
      .trim()
      .toUpperCase() === 'LUNAS'
  );
}

function tanggalIndonesia(date = new Date()) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/*
 * ======================================================
 * EMOJI DIBUAT DARI CODEPOINT
 *
 * Tidak ada karakter emoji langsung di source.
 * Ini mencegah karakter menjadi "�".
 * ======================================================
 */

const EMOJI = {
  chart: String.fromCodePoint(0x1F4CA),
  money: String.fromCodePoint(0x1F4B0),
  green: String.fromCodePoint(0x1F7E2),
  red: String.fromCodePoint(0x1F534),
  blue: String.fromCodePoint(0x1F535),
  scale: String.fromCodePoint(0x2696, 0xFE0F),
  yellow: String.fromCodePoint(0x1F7E1),
  note: String.fromCodePoint(0x1F4DD),
  warning: String.fromCodePoint(0x26A0, 0xFE0F),
  link: String.fromCodePoint(0x1F517),
  pointer: String.fromCodePoint(0x1F449),
  pray: String.fromCodePoint(0x1F64F),

  one: String.fromCodePoint(0x31, 0xFE0F, 0x20E3),
  two: String.fromCodePoint(0x32, 0xFE0F, 0x20E3),
};

export function buildFinanceReport({
  kas = {},
  denda = {},
  kasRows = [],
  dendaRows = [],
  date = new Date(),
  accessUrl =
    'https://appsystem.pmrsmanel.my.id/',
  tunggakanUrl =
    'https://appsystem.pmrsmanel.my.id/?view=tunggakan',
}) {

  /*
   * ======================================================
   * TUNGGAKAN KAS
   * ======================================================
   */

  const unpaidKas = Array.isArray(kasRows)
    ? kasRows.filter(
        (item) => !isLunas(item)
      )
    : [];

  const tunggakanKas =
    unpaidKas.reduce(
      (total, item) =>
        total +
        Number(item?.Nominal || 0),
      0
    );


  /*
   * ======================================================
   * TUNGGAKAN DENDA
   * ======================================================
   */

  const unpaidDenda = Array.isArray(dendaRows)
    ? dendaRows.filter(
        (item) => !isLunas(item)
      )
    : [];

  const tunggakanDenda =
    unpaidDenda.reduce(
      (total, item) =>
        total +
        Number(item?.Nominal || 0),
      0
    );


  /*
   * ======================================================
   * TOTAL PIUTANG
   * ======================================================
   */

  const totalPiutang =
    tunggakanKas +
    tunggakanDenda;


  /*
   * ======================================================
   * TANGGAL OTOMATIS
   * ======================================================
   */

  const tanggal =
    tanggalIndonesia(date);


  /*
   * ======================================================
   * LAPORAN
   * ======================================================
   */

  const lines = [
    `*${EMOJI.chart} LAPORAN KEUANGAN PMR SMANEL*`,

    `Tanggal: ${tanggal}`,

    '',

    `*${EMOJI.money} ARUS KAS:*`,

    `${EMOJI.green} Pemasukan Uang Kas: ${rupiah(
      kas.pemasukan
    )}`,

    `${EMOJI.red} Total Pengeluaran: ${rupiah(
      kas.pengeluaran
    )}`,

    '------------------------',

    `${EMOJI.blue} *SALDO KAS AKTIF: ${rupiah(
      kas.saldo
    )}*`,

    '',

    `*${EMOJI.scale} DANA DENDA (TERPISAH):*`,

    `${EMOJI.yellow} Denda Terkumpul: ${rupiah(
      denda.pemasukan
    )}`,

    '',

    `*${EMOJI.note} TUNGGAKAN AKTIF:*`,

    `- Tunggakan Kas: ${rupiah(
      tunggakanKas
    )} (${unpaidKas.length} Item)`,

    `- Tunggakan Denda: ${rupiah(
      tunggakanDenda
    )} (${unpaidDenda.length} Item)`,

    `${EMOJI.warning} *Total Piutang: ${rupiah(
      totalPiutang
    )}*`,

    '',

    `*${EMOJI.link} LINK AKSES ANGGOTA:*`,

    `${EMOJI.one} *Cek Daftar Tunggakan:*`,

    `${EMOJI.pointer} ${tunggakanUrl}`,

    '',

    `${EMOJI.two} *Dashboard Transparansi:*`,

    `${EMOJI.pointer} ${accessUrl}`,

    '',

    `Mohon bagi anggota yang masih memiliki tunggakan kas atau denda untuk segera melunasi. Terima kasih! ${EMOJI.pray}`,

    '',

    '_Sistem Manajemen PMR SMANEL_',
  ];


  return lines.join('\n');
}