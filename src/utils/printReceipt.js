/**
 * Normalize data from either history item or success response to receipt payload.
 * @param {object} data - History item or create-transaction success response
 * @param {object} user - Current logged in user (optional)
 * @returns {object} Normalized { tanggal, nomorBukti, nama, noHp, email, alamat, kategori, subKategori, nominal, terbilang, metodePembayaran, namaEvent, lokasiEvent, kasir }
 */
function resolveNominal(data) {
  const fromTotal = Number(data.totalNominal)
  if (fromTotal > 0) return fromTotal
  const fromFirst = data.donasi?.[0] && Number(data.donasi[0].nominal)
  if (fromFirst > 0) return fromFirst
  const fromSum = data.donasi?.reduce((s, d) => s + Number(d.nominal || 0), 0) ?? 0
  if (fromSum > 0) return fromSum
  return Number(data.nominal) || 0
}

export function normalizeReceiptData(data, user = null) {
  if (!data) return null
  
  const kasirName = user?.name || user?.email || 'SYSTEM'
  const nominal = resolveNominal(data)
  
  // History item shape (punya nomorBukti, e.g. dari API success atau history list)
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
      nominal,
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
    nominal,
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
      font-weight: bold; 
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
    .logo-img {
      display: block;
      margin: 0 auto 2mm;
      max-width: 18mm;
      height: auto;
    }
    @media print { 
      body { 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact;
        margin: 0;
        padding: 4mm 3mm;
      }
      .logo-img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 0; }
    }
  </style>
</head>
<body>
<img src="/logo.png" alt="LAZIS Sultan Agung" class="logo-img" />
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
  const kategoriLower = (r.kategori || '').toLowerCase()
  const isZakat = kategoriLower === 'zakat'
  const isInfak = kategoriLower === 'infak'
  const isDskl = kategoriLower === 'dskl'
  const isCampaign = kategoriLower === 'campaign'
  
  const zakatAmount = isZakat ? r.nominal : 0
  const infakTerikatAmount = isInfak && r.subKategori && r.subKategori.toLowerCase().includes('terikat') ? r.nominal : 0
  const infakBebasAmount = isInfak && (!r.subKategori || !r.subKategori.toLowerCase().includes('terikat')) ? r.nominal : 0
  const dsklAmount = isDskl ? r.nominal : 0
  const wakafAmount = 0
  const lainnyaAmount = isCampaign ? r.nominal : 0
  
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      const day = d.getDate()
      const month = d.getMonth() + 1
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return dateStr
    }
  }
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>BUKTI TANDA TERIMA - ${escapeHtml(r.nomorBukti)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 landscape; margin: 12mm; }
    html, body {
      width: 297mm;
      min-height: 210mm;
      font-family: 'Times New Roman', serif;
      font-size: 10pt;
      line-height: 1.3;
      color: #000;
      background: white;
      padding: 0 12mm;
      page-break-inside: avoid;
    }
    .receipt-page {
      width: 100%;
      height: 100%;
      page-break-inside: avoid;
    }
    .kop-wrapper {
      position: relative;
      margin-bottom: 8px;
    }
    .kop-img {
      width: 100%;
      height: auto;
      display: block;
    }
    .receipt-no-overlay {
      position: absolute;
      top: 40%;
      right: 6%;
      font-size: 10pt;
      font-weight: bold;
    }
    .main-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 6px;
    }
    .main-col { page-break-inside: avoid; }
    .title {
      font-size: 12pt;
      font-weight: bold;
      text-align: center;
      text-decoration: underline;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    .bismillah {
      font-style: italic;
      text-align: center;
      font-size: 8pt;
      margin-bottom: 8px;
    }
    .field-group { margin-bottom: 6px; }
    .field-label { font-weight: bold; margin-bottom: 1px; font-size: 9pt; }
    .field-line {
      border-bottom: 1px solid #000;
      min-height: 16px;
      padding: 1px 4px;
      font-size: 9pt;
    }
    .declaration {
      margin-top: 8px;
      font-size: 8pt;
      line-height: 1.4;
    }
    .declaration-title { font-weight: bold; margin-bottom: 4px; }
    .declaration-item {
      display: flex;
      gap: 6px;
      margin-bottom: 4px;
      align-items: flex-start;
    }
    .declaration-checkbox {
      width: 12px;
      height: 12px;
      border: 1px solid #000;
      margin-top: 1px;
      flex-shrink: 0;
    }
    .prayer {
      margin-top: 6px;
      font-size: 8pt;
      line-height: 1.4;
      text-align: justify;
      font-style: italic;
    }
    .donation-title { font-weight: bold; margin-bottom: 6px; font-size: 9pt; }
    .donation-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 4px;
      font-size: 9pt;
      gap: 6px;
    }
    .donation-label { flex-shrink: 0; }
    .donation-line {
      border-bottom: 1px solid #000;
      flex: 1;
      min-height: 14px;
    }
    .donation-amount {
      text-align: right;
      min-width: 80px;
    }
    .total-box {
      border: 1px solid #000;
      padding: 4px 8px;
      margin-top: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 6px;
    }
    .total-label { font-weight: bold; }
    .total-line {
      border-bottom: 1px solid #000;
      flex: 1;
      min-height: 16px;
    }
    .total-amount { font-weight: bold; min-width: 95px; text-align: right; }
    .terbilang-group { margin-top: 6px; }
    .terbilang-label { font-weight: bold; margin-bottom: 2px; font-size: 9pt; }
    .terbilang-line {
      border-bottom: 1px solid #000;
      min-height: 16px;
      padding: 1px 4px;
      font-size: 9pt;
    }
    .signatures {
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      gap: 24px;
    }
    .signature-box { flex: 1; text-align: left; }
    .signature-date { font-weight: bold; margin-bottom: 24px; font-size: 9pt; }
    .signature-label { font-weight: bold; margin-bottom: 4px; font-size: 9pt; }
    .signature-line {
      border-bottom: 1px solid #000;
      min-height: 18px;
      margin-bottom: 2px;
    }
    .signature-name { font-size: 8pt; }
    @media print {
      @page { size: A4 landscape; margin: 12mm; }
      html, body {
        margin: 0 !important;
        padding: 0 12mm !important;
      }
      .no-print { display: none; }
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body>
  <div class="receipt-page">
  <div class="kop-wrapper">
    <img src="/kopcetakbiasa.png" alt="Kop LAZIS Sultan Agung" class="kop-img" />
    <div class="receipt-no-overlay">No. ${escapeHtml(r.nomorBukti || '—')}</div>
  </div>

  <div class="main-content">
    <div class="main-col left-column">
      <div class="title">BUKTI TANDA TERIMA</div>
      <div class="bismillah">Bismillahirrahmanirrahim...</div>
      
      <div class="field-group">
        <div class="field-label">Telah Terima Dari</div>
        <div class="field-line">${escapeHtml(r.nama || '')}</div>
      </div>
      
      <div class="field-group">
        <div class="field-label">Nama</div>
        <div class="field-line">${escapeHtml(r.nama || '')}</div>
      </div>
      
      <div class="field-group">
        <div class="field-label">Alamat</div>
        <div class="field-line">${escapeHtml(r.alamat || '')}</div>
      </div>
      
      <div class="field-group">
        <div class="field-label">Telp./HP.</div>
        <div class="field-line">${escapeHtml(r.noHp || '')}</div>
      </div>
      
      <div class="field-group">
        <div class="field-label">Email</div>
        <div class="field-line">${escapeHtml(r.email || '')}</div>
      </div>
      
      <div class="declaration">
        <div class="declaration-title">Dengan ini saya menyatakan:</div>
        <div class="declaration-item">
          <div class="declaration-checkbox"></div>
          <div>Harta yang ditunaikan bukan berasal dari dana pencucian uang, hasil korupsi, tindak kriminal atau dana non halal</div>
        </div>
        <div class="declaration-item">
          <div class="declaration-checkbox"></div>
          <div>Harta yang ditunaikan dimiliki secara sempurna oleh Muzzaki (Kepemilikan Penuh), telah mencapai nishab dan haul</div>
        </div>
      </div>
      
      <div class="prayer">
        Semoga Alloh memberikan pahala atas apa yang telah Anda berikan, menjadikannya suci dan mensucikan, serta Alloh memberikan keberkahan atas harta Anda yang tersisa.
      </div>
    </div>
    
    <div class="main-col right-column">
      <div class="donation-title">Digunakan Untuk Donasi :</div>
      
      <div class="donation-item">
        <span class="donation-label">a. Zakat</span>
        <span class="donation-line"></span>
        <span class="donation-amount">${zakatAmount > 0 ? 'Rp ' + formatRupiah(zakatAmount) : ''}</span>
      </div>
      
      <div class="donation-item">
        <span class="donation-label">b. Infak / Shodaqoh Terikat</span>
        <span class="donation-line"></span>
        <span class="donation-amount">${infakTerikatAmount > 0 ? 'Rp ' + formatRupiah(infakTerikatAmount) : ''}</span>
      </div>
      
      <div class="donation-item">
        <span class="donation-label">c. Infak / Shodaqoh Bebas</span>
        <span class="donation-line"></span>
        <span class="donation-amount">${infakBebasAmount > 0 ? 'Rp ' + formatRupiah(infakBebasAmount) : ''}</span>
      </div>
      
      <div class="donation-item">
        <span class="donation-label">d. DSKL</span>
        <span class="donation-line"></span>
        <span class="donation-amount">${dsklAmount > 0 ? 'Rp ' + formatRupiah(dsklAmount) : ''}</span>
      </div>
      
      <div class="donation-item">
        <span class="donation-label">e. Wakaf</span>
        <span class="donation-line"></span>
        <span class="donation-amount">${wakafAmount > 0 ? 'Rp ' + formatRupiah(wakafAmount) : ''}</span>
      </div>
      
      <div class="donation-item">
        <span class="donation-label">f. ...............</span>
        <span class="donation-line"></span>
        <span class="donation-amount">${lainnyaAmount > 0 ? 'Rp ' + formatRupiah(lainnyaAmount) : ''}</span>
      </div>
      
      <div class="total-box">
        <span class="total-label">Total</span>
        <span class="total-line"></span>
        <span class="total-amount">Rp ${formatRupiah(r.nominal)}</span>
      </div>
      
      <div class="terbilang-group">
        <div class="terbilang-label">Terbilang</div>
        <div class="terbilang-line">${escapeHtml(r.terbilang || '')}</div>
      </div>
      
      <div class="signatures">
        <div class="signature-box">
          <div class="signature-date">Semarang, ${formatDate(r.tanggal)}</div>
          <div class="signature-label">Donatur,</div>
          <div class="signature-line"></div>
          <div class="signature-name">(${escapeHtml(r.nama || '')})</div>
        </div>
        <div class="signature-box">
          <div class="signature-date">&nbsp;</div>
          <div class="signature-label">Penerima</div>
          <div class="signature-line"></div>
          <div class="signature-name">(LAZIS Sultan Agung)</div>
        </div>
      </div>
    </div>
  </div>
  </div>
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
  const win = window.open('', '_blank', mode === 'thermal' ? 'width=400,height=600' : 'width=900,height=600')
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
