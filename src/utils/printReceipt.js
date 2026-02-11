/**
 * Normalize data from either history item or success response to receipt payload.
 * @param {object} data - History item or create-transaction success response
 * @returns {object} Normalized { tanggal, nomorBukti, nama, noHp, email, alamat, kategori, subKategori, nominal, terbilang, metodePembayaran, namaEvent, lokasiEvent }
 */
export function normalizeReceiptData(data) {
  if (!data) return null
  // History item shape
  if (data.nomorBukti !== undefined) {
    return {
      tanggal: data.tanggal,
      nomorBukti: data.nomorBukti,
      nama: data.nama,
      noHp: data.noHp,
      email: data.email,
      alamat: data.alamat ?? '',
      kategori: data.kategori,
      subKategori: data.subKategori ?? '',
      nominal: data.nominal,
      terbilang: data.terbilang ?? '',
      metodePembayaran: data.metodePembayaran,
      namaEvent: data.namaEvent ?? '',
      lokasiEvent: data.lokasiEvent ?? '',
    }
  }
  // Success response shape (donasi array + terbilang)
  const firstDonasi = data.donasi?.[0]
  return {
    tanggal: data.tanggal,
    nomorBukti: data.nomorBukti ?? '—',
    nama: data.nama,
    noHp: data.noHp,
    email: data.email,
    alamat: data.alamat ?? '',
    kategori: firstDonasi?.kategori ?? '',
    subKategori: firstDonasi?.subKategori ?? '',
    nominal: firstDonasi?.nominal ?? 0,
    terbilang: data.terbilang ?? '',
    metodePembayaran: data.metodePembayaran ?? 'tunai',
    namaEvent: data.namaEvent ?? '',
    lokasiEvent: data.lokasiEvent ?? '',
  }
}

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'decimal', maximumFractionDigits: 0 }).format(Number(n))
}

function escapeHtml(s) {
  if (s == null) return ''
  const str = String(s)
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildThermalHtml(r) {
  const w = '80mm'
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Struk Donasi</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: ${w}; max-width: ${w}; font-family: monospace; font-size: 12px; line-height: 1.35; padding: 8px; color: #000; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .mt { margin-top: 6px; }
    .mt2 { margin-top: 10px; }
    hr { border: none; border-top: 1px dashed #333; margin: 6px 0; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="center bold">LAZIS - STRUK DONASI</div>
  <div class="center" style="font-size:10px;">${escapeHtml(r.namaEvent)} ${r.lokasiEvent ? ` | ${escapeHtml(r.lokasiEvent)}` : ''}</div>
  <hr>
  <div>No. Bukti : ${escapeHtml(r.nomorBukti)}</div>
  <div>Tanggal   : ${escapeHtml(r.tanggal)}</div>
  <hr>
  <div>Nama      : ${escapeHtml(r.nama)}</div>
  <div>No. HP    : ${escapeHtml(r.noHp)}</div>
  <div>Email     : ${escapeHtml(r.email)}</div>
  <div>Alamat    : ${escapeHtml(r.alamat)}</div>
  <hr>
  <div>Kategori  : ${escapeHtml(r.kategori)}</div>
  <div>Sub Kat   : ${escapeHtml(r.subKategori)}</div>
  <div class="mt">Nominal   : Rp ${formatRupiah(r.nominal)}</div>
  ${r.terbilang ? `<div style="font-size:10px;">Terbilang : ${escapeHtml(r.terbilang)}</div>` : ''}
  <div class="mt">Bayar     : ${escapeHtml(r.metodePembayaran)}</div>
  <hr>
  <div class="center mt2" style="font-size:10px;">Terima kasih atas donasi Anda</div>
</body>
</html>`
}

function buildNormalHtml(r) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bukti Donasi - ${escapeHtml(r.nomorBukti)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; font-size: 14px; line-height: 1.5; padding: 20px; color: #333; max-width: 210mm; margin: 0 auto; }
    h1 { font-size: 18px; margin-bottom: 16px; color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { text-align: left; padding: 8px 12px; border: 1px solid #e5e7eb; }
    th { background: #f0fdfa; font-weight: 600; width: 140px; }
    .nominal { font-weight: bold; font-size: 16px; color: #0d9488; }
    .footer { margin-top: 24px; font-size: 12px; color: #6b7280; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>BUKTI PENCATATAN DONASI</h1>
  <table>
    <tr><th>No. Bukti</th><td>${escapeHtml(r.nomorBukti)}</td></tr>
    <tr><th>Tanggal</th><td>${escapeHtml(r.tanggal)}</td></tr>
    <tr><th>Nama</th><td>${escapeHtml(r.nama)}</td></tr>
    <tr><th>No. HP</th><td>${escapeHtml(r.noHp)}</td></tr>
    <tr><th>Email</th><td>${escapeHtml(r.email)}</td></tr>
    <tr><th>Alamat</th><td>${escapeHtml(r.alamat)}</td></tr>
    <tr><th>Kategori</th><td>${escapeHtml(r.kategori)}</td></tr>
    <tr><th>Sub Kategori</th><td>${escapeHtml(r.subKategori)}</td></tr>
    <tr><th>Nominal</th><td class="nominal">Rp ${formatRupiah(r.nominal)}</td></tr>
    ${r.terbilang ? `<tr><th>Terbilang</th><td>${escapeHtml(r.terbilang)}</td></tr>` : ''}
    <tr><th>Pembayaran</th><td>${escapeHtml(r.metodePembayaran)}</td></tr>
    <tr><th>Event</th><td>${escapeHtml(r.namaEvent)} ${r.lokasiEvent ? ` — ${escapeHtml(r.lokasiEvent)}` : ''}</td></tr>
  </table>
  <div class="footer">Dokumen ini dicetak dari MPOS LAZIS. Terima kasih atas donasi Anda.</div>
</body>
</html>`
}

/**
 * Open print dialog with receipt content.
 * @param {object} data - History item or success response (will be normalized)
 * @param {'thermal'|'normal'} mode - 'thermal' for thermal printer (80mm), 'normal' for A4
 */
export function printReceipt(data, mode = 'normal') {
  const r = normalizeReceiptData(data)
  if (!r) return

  const html = mode === 'thermal' ? buildThermalHtml(r) : buildNormalHtml(r)
  const win = window.open('', '_blank', 'width=400,height=600')
  if (!win) {
    alert('Izinkan pop-up untuk mencetak.')
    return
  }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => {
    win.print()
    win.onafterprint = () => win.close()
    // Fallback close if afterprint not fired
    setTimeout(() => win.close(), 500)
  }, 250)
}
