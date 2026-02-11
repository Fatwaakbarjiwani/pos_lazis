/**
 * Normalize data from either history item or success response to receipt payload.
 * @param {object} data - History item or create-transaction success response
 * @param {object} user - Current logged in user (optional)
 * @returns {object} Normalized { tanggal, nomorBukti, nama, noHp, email, alamat, kategori, subKategori, nominal, terbilang, metodePembayaran, namaEvent, lokasiEvent, kasir }
 */
export function normalizeReceiptData(data, user = null) {
  if (!data) return null
  
  const kasirName = user?.name || user?.email || 'SYSTEM'
  
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
      kasir: kasirName,
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
    kasir: kasirName,
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

/**
 * Potong string sesuai lebar kolom (32 untuk 58mm)
 */
function cutText(text, len) {
  const t = String(text || '')
  if (t.length <= len) return t
  return t.substring(0, len)
}

/**
 * Format baris kiri-kanan sejajar untuk lebar 32 kolom
 */
function lineLR(left, right, width = 32) {
  const leftStr = String(left || '')
  const rightStr = String(right || '')
  const leftLen = leftStr.length
  const rightLen = rightStr.length
  const space = Math.max(1, width - leftLen - rightLen)
  return leftStr + ' '.repeat(space) + rightStr
}

/**
 * Garis horizontal
 */
function hr(width = 32, char = '-') {
  return char.repeat(width)
}

/**
 * Wrap text untuk nama barang/kategori panjang
 */
function wordWrap(text, width) {
  const words = String(text || '').split(' ')
  const lines = []
  let currentLine = ''
  
  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word
    if (testLine.length <= width) {
      currentLine = testLine
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word.length > width ? word.substring(0, width) : word
    }
  }
  if (currentLine) lines.push(currentLine)
  
  return lines.length > 0 ? lines : ['']
}

function buildThermalHtml(r) {
  const W = 32 // Total kolom untuk thermal 58mm
  const storeName = 'LAZIS SULTAN AGUNG'
  const storeCV = 'YAYASAN LAZIS SULTAN AGUNG'
  const storeAddr = 'JL. SOEKARNO HATTA NO 97A, TLOGOSARI KULON, PEDURUNGAN SEMARANG'
  
  // Format tanggal
  const tanggal = r.tanggal || ''
  const lokasi = r.lokasiEvent || 'Semarang'
  const kasir = r.kasir || 'SYSTEM'
  const customer = r.nama || ''
  
  // Item donasi
  const kategoriFull = r.subKategori ? `${r.kategori} - ${r.subKategori}` : r.kategori
  const nominal = Number(r.nominal) || 0
  
  // Summary (untuk donasi sederhana)
  const netto = nominal
  const bayar = nominal
  const metodeBayar = (r.metodePembayaran || 'TUNAI').toUpperCase()
  
  // Build HTML
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Struk Donasi</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: 58mm auto; margin: 0; }
    body { 
      width: 58mm; 
      max-width: 58mm; 
      font-family: 'Courier New', monospace; 
      font-size: 11px; 
      line-height: 1.2; 
      padding: 4mm 3mm; 
      color: #000; 
      margin: 0 auto;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .left { text-align: left; }
    pre { 
      font-family: 'Courier New', monospace; 
      font-size: 11px; 
      line-height: 1.2; 
      white-space: pre-wrap; 
      word-wrap: break-word;
      margin: 0;
    }
    @media print { 
      body { 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact;
        margin: 0;
        padding: 4mm 3mm;
      }
      @page { margin: 0; }
    }
  </style>
</head>
<body>
<pre class="center bold">${cutText(storeName, W)}</pre>
<pre class="center">${cutText(storeCV, W)}</pre>
<pre class="center" style="font-size: 9px;">${cutText(storeAddr, W)}</pre>
<pre></pre>
<pre>${hr(W)}</pre>
<pre>${lineLR('NOMOR   : ' + cutText(r.nomorBukti || '', W - 11), '', W)}</pre>
<pre>${lineLR('TANGGAL : ' + cutText(tanggal, W - 11), '', W)}</pre>
<pre>${lineLR('LOKASI  : ' + cutText(lokasi, W - 11), '', W)}</pre>
<pre>${lineLR('KASIR   : ' + cutText(kasir, W - 11), '', W)}</pre>
<pre>${lineLR('CUSTOMER: ' + cutText(customer, W - 11), '', W)}</pre>
<pre>${hr(W)}</pre>
<pre></pre>`

  // Print item (kategori donasi)
  const kategoriLines = wordWrap(kategoriFull, W)
  kategoriLines.forEach(line => {
    html += `<pre>${cutText(line, W)}</pre>`
  })
  html += `<pre>${lineLR('1 PCS @ ' + formatRupiah(nominal), formatRupiah(nominal), W)}</pre>`
  html += `<pre></pre>`
  
  html += `<pre>${hr(W)}</pre>
<pre></pre>
<pre class="bold">${lineLR('NETTO  :', formatRupiah(netto), W)}</pre>
<pre></pre>
<pre>${lineLR('BAYAR  :', formatRupiah(bayar), W)}</pre>
<pre>${lineLR('METODE :', cutText(metodeBayar, 15), W)}</pre>
<pre></pre>
<pre>${hr(W)}</pre>
<pre></pre>
<pre class="center" style="font-size: 9px;">Terima kasih atas donasi anda.</pre>
<pre class="center" style="font-size: 9px;">Semoga menjadi amal jariyah</pre>
<pre class="center" style="font-size: 9px;">yang berkah dan bermanfaat.</pre>
<pre></pre>
<pre></pre>
<pre></pre>
</body>
</html>`

  return html
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
 * @param {'thermal'|'normal'} mode - 'thermal' for thermal printer (58mm), 'normal' for A4
 * @param {object} user - Current logged in user (optional, for kasir name)
 */
export function printReceipt(data, mode = 'normal', user = null) {
  const r = normalizeReceiptData(data, user)
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
