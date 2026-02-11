import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { printReceipt } from '../utils/printReceipt'
import { getEvents, getCategories, createTransaction, clearTransactionSuccess, searchDonors } from '../redux/actions/posActions'

const CATEGORY_TYPES = [
  { value: 'zakat', label: 'Zakat' },
  { value: 'infak', label: 'Infak' },
  { value: 'dskl', label: 'DSKL' },
  { value: 'campaign', label: 'Campaign' },
]

const PAYMENT_METHODS = [
  { value: 'tunai', label: 'Tunai' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'qris', label: 'QRIS' },
]

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000]

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'decimal', maximumFractionDigits: 0 }).format(n)
}

export default function HomePage() {
  const dispatch = useDispatch()
  const { events, categories, loadingEvents, loadingCategories, submitting, transactionSuccess, errorTransaction } = useSelector((state) => state.pos)
  const [error, setError] = useState('')
  const [oldDonorSearch, setOldDonorSearch] = useState('')
  const [donorSearchResults, setDonorSearchResults] = useState([])
  const [loadingDonorSearch, setLoadingDonorSearch] = useState(false)

  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
    categoryType: 'campaign',
    categoryId: '',
    amount: '',
    paymentMethod: 'tunai',
    eventId: '',
    image: null,
  })

  useEffect(() => {
    dispatch(getEvents())
  }, [dispatch])

  useEffect(() => {
    if (form.categoryType) {
      dispatch(getCategories(form.categoryType))
    }
  }, [dispatch, form.categoryType])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => {
      const newForm = { ...prev, [name]: value }
      // Reset categoryId when categoryType changes
      if (name === 'categoryType' && prev.categoryType !== value) {
        newForm.categoryId = ''
      }
      return newForm
    })
    setError('')
    if (transactionSuccess) dispatch(clearTransactionSuccess())
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null
    setForm((prev) => ({ ...prev, image: file }))
    setError('')
    if (transactionSuccess) dispatch(clearTransactionSuccess())
  }

  const setQuickAmount = (value) => {
    setForm((prev) => ({ ...prev, amount: String(value) }))
    setError('')
    if (transactionSuccess) dispatch(clearTransactionSuccess())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await dispatch(createTransaction(form))
    if (result.success) {
      setForm((prev) => ({
        ...prev,
        description: '',
        amount: '',
        image: null,
      }))
      const inputImage = document.getElementById('input-image')
      if (inputImage) inputImage.value = ''
    } else {
      setError(result.error || 'Terjadi kesalahan')
    }
  }

  const handleCatatLagi = () => {
    dispatch(clearTransactionSuccess())
    setForm((prev) => ({
      ...prev,
      description: '',
      amount: '',
      image: null,
    }))
    const inputImage = document.getElementById('input-image')
    if (inputImage) inputImage.value = ''
  }

  const categoryIdField = form.categoryType === 'campaign' ? 'campaignId' : 'id'
  const categoryNameField = form.categoryType === 'campaign' ? 'campaignName' : 'categoryName'

  const totalAmount = form.amount ? Number(form.amount.replace(/\D/g, '')) || 0 : 0

  const inputClass =
    'w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition font-mono'
  const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 font-mono'

  const setPaymentMethod = (value) => {
    setForm((prev) => ({ ...prev, paymentMethod: value }))
    setError('')
    if (transactionSuccess) dispatch(clearTransactionSuccess())
  }

  const handleSearchDonor = async () => {
    const q = String(oldDonorSearch || '').trim()
    if (!q) {
      setDonorSearchResults([])
      return
    }
    setLoadingDonorSearch(true)
    setDonorSearchResults([])
    const result = await dispatch(searchDonors(q))
    setLoadingDonorSearch(false)
    if (result.success && result.content) setDonorSearchResults(result.content)
    else setDonorSearchResults([])
  }

  const selectDonor = (row) => {
    setForm((prev) => ({
      ...prev,
      name: row.nama ?? prev.name,
      phoneNumber: row.noHp ?? row.phoneNumber ?? prev.phoneNumber,
      email: row.email ?? prev.email,
      address: row.alamat ?? prev.address,
    }))
    setDonorSearchResults([])
    setOldDonorSearch('')
  }

  return (
    <>
      <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-zinc-100 pb-[88px] pt-6">
        <div className="mx-auto w-full px-[2%]">
          {transactionSuccess ? (
            /* Success - receipt style */
            <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg">
              <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-600 px-8 py-6 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-2 ring-white/60">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-emerald-50">
                  Struk donasi tercatat
                </p>
                <p className="mt-1 font-mono text-xl font-bold text-white">
                  Terima kasih, donasi berhasil disimpan.
                </p>
                {(form.paymentMethod === 'transfer' || form.paymentMethod === 'qris') && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 shadow-sm">
                    <svg className="h-4 w-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs font-medium text-amber-800">
                      Transaksi masuk ke Pending. Validasi di menu Pending agar masuk ke history.
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-4 px-8 py-7 font-mono text-sm text-zinc-800">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-zinc-50 p-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                      Data donatur
                    </p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Nama</span>
                        <span className="font-semibold text-zinc-900">{transactionSuccess.nama}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">No. HP</span>
                        <span className="font-semibold text-zinc-900">{transactionSuccess.noHp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Email</span>
                        <span className="font-semibold text-zinc-900">{transactionSuccess.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Tanggal</span>
                        <span className="font-semibold text-zinc-900">{transactionSuccess.tanggal}</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 p-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                      Ringkasan donasi
                    </p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Metode pembayaran</span>
                        <span className="font-semibold capitalize text-zinc-900">
                          {PAYMENT_METHODS.find((p) => p.value === form.paymentMethod)?.label || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Total donasi</span>
                        <span className="font-bold text-emerald-600">
                          Rp {formatRupiah(transactionSuccess.totalNominal || 0)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-zinc-500">
                      Terbilang:{' '}
                      <span className="font-semibold text-zinc-900">{transactionSuccess.terbilang}</span>
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Rincian per kategori
                  </p>
                  {transactionSuccess.donasi?.map((d, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-zinc-200 py-2 last:border-0">
                      <span className="text-sm text-zinc-800">
                        {d.kategori}
                        {d.subKategori ? ` — ${d.subKategori}` : ''}
                      </span>
                      <span className="font-mono text-sm font-semibold text-emerald-600">
                        Rp {formatRupiah(Number(d.nominal))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-zinc-200 bg-zinc-50 px-8 py-5 space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => printReceipt({ ...transactionSuccess, metodePembayaran: form.paymentMethod }, 'thermal')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-3 font-mono text-xs font-bold uppercase tracking-wide text-zinc-800 shadow-sm transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span>Cetak thermal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => printReceipt({ ...transactionSuccess, metodePembayaran: form.paymentMethod }, 'normal')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-3 font-mono text-xs font-bold uppercase tracking-wide text-zinc-800 shadow-sm transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span>Cetak biasa</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCatatLagi}
                  className="w-full rounded-xl bg-emerald-600 py-3.5 font-mono text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-emerald-500 hover:shadow-xl active:scale-[0.99]"
                >
                  Transaksi baru
                </button>
              </div>
            </div>
          ) : (
            <form
              id="mpos-form"
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(0,1fr)]"
            >
              {/* Data donatur */}
              <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-lg shadow-zinc-200/70">
                <div className="relative flex items-center border-b border-zinc-100 px-5 py-3.5">
                  <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full border border-emerald-500 bg-white text-[10px] font-mono font-semibold text-emerald-600">
                    1
                  </span>
                  <p className="font-mono text-xs font-semibold text-zinc-800">Data donatur</p>
                </div>
                <div className="relative space-y-4 p-5">
                  {/* Donatur lama (lookup) */}
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-3.5">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                        Donatur lama
                      </p>
                      <span className="font-mono text-[10px] text-zinc-500">Cari berdasarkan nama atau no. HP</span>
                    </div>
                    <div className="relative mt-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={oldDonorSearch}
                          onChange={(e) => setOldDonorSearch(e.target.value)}
                          placeholder="Contoh: Ahmad / 0812xxxxx"
                          className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-mono text-zinc-800 placeholder-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={handleSearchDonor}
                          disabled={loadingDonorSearch}
                          className="shrink-0 rounded-xl border border-emerald-500 bg-emerald-600 px-3 py-2 text-[11px] font-mono font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-60"
                        >
                          {loadingDonorSearch ? 'Cari…' : 'Cari'}
                        </button>
                      </div>

                      {/* Dropdown hasil pencarian (floating, tidak mengubah tinggi card) */}
                      {(loadingDonorSearch || donorSearchResults.length > 0 || oldDonorSearch) && (
                        <div className="absolute left-0 right-0 z-20 mt-1 rounded-xl border border-zinc-200 bg-white px-2.5 py-2 shadow-lg max-h-52 overflow-y-auto">
                          {loadingDonorSearch ? (
                            <p className="font-mono text-[10px] text-zinc-500">Mencari…</p>
                          ) : donorSearchResults.length === 0 ? (
                            <p className="font-mono text-[10px] text-zinc-500 italic">
                              Tidak ada donatur yang cocok. Coba ganti kata kunci.
                            </p>
                          ) : (
                            <ul className="divide-y divide-zinc-100">
                              {donorSearchResults.map((row, idx) => (
                                <li key={row.id ?? row.nomorBukti ?? `donor-${idx}`}>
                                  <button
                                    type="button"
                                    onClick={() => selectDonor(row)}
                                    className="w-full px-1.5 py-2 text-left text-[11px] font-mono text-zinc-800 transition hover:bg-emerald-50/70 hover:text-zinc-900"
                                  >
                                    <span className="font-semibold">{row.nama}</span>
                                    {(row.noHp || row.phoneNumber) && (
                                      <span className="ml-1 text-zinc-500">· {row.noHp || row.phoneNumber}</span>
                                    )}
                                    {row.email && (
                                      <span className="block truncate text-[10px] text-zinc-500">{row.email}</span>
                                    )}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <label className="block">
                    <span className={labelClass + ' text-zinc-600'}>Nama</span>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass + ' text-zinc-600'}>No. HP</span>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass + ' text-zinc-600'}>Email</span>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass + ' text-zinc-600'}>Alamat</span>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={2}
                      className={inputClass + ' resize-none'}
                      required
                    />
                  </label>
                </div>
              </div>

              {/* Acara & kategori */}
              <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-lg shadow-zinc-200/70">
                <div className="flex items-center border-b border-zinc-100 bg-zinc-50 px-5 py-3.5">
                  <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full border border-emerald-500 bg-white text-[10px] font-mono font-semibold text-emerald-600">
                    2
                  </span>
                  <p className="font-mono text-xs font-semibold text-zinc-800">Acara & kategori</p>
                </div>
                <div className="space-y-4 p-5">
                  <label className="block">
                    <span className={labelClass + ' text-zinc-600'}>Tanggal</span>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass + ' text-zinc-600'}>Event</span>
                    <select
                      name="eventId"
                      value={form.eventId}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">— Pilih —</option>
                      {loadingEvents ? (
                        <option>Memuat...</option>
                      ) : (
                        events.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.name} {ev.location ? `(${ev.location})` : ''}
                          </option>
                        ))
                      )}
                    </select>
                  </label>
                  <label className="block">
                    <span className={labelClass + ' text-zinc-600'}>Keterangan</span>
                    <input
                      type="text"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Opsional"
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass + ' text-zinc-600'}>Tipe</span>
                    <select
                      name="categoryType"
                      value={form.categoryType}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {CATEGORY_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className={labelClass + ' text-zinc-600'}>Sub kategori</span>
                    <select
                      name="categoryId"
                      value={form.categoryId}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">— Pilih —</option>
                      {loadingCategories ? (
                        <option>Memuat...</option>
                      ) : (
                        categories.map((cat) => (
                          <option key={cat[categoryIdField]} value={cat[categoryIdField]}>
                            {cat[categoryNameField] || cat.categoryName || cat.campaignName}
                          </option>
                        ))
                      )}
                    </select>
                  </label>
                </div>
              </div>

              {/* Nominal & pembayaran */}
              <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-lg shadow-zinc-200/70">
                <div className="flex items-center border-b border-zinc-100 bg-zinc-50 px-5 py-3.5">
                  <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full border border-emerald-500 bg-white text-[10px] font-mono font-semibold text-emerald-600">
                    3
                  </span>
                  <p className="font-mono text-xs font-semibold text-zinc-800">Nominal & pembayaran</p>
                </div>
                <div className="p-5">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setQuickAmount(amt)}
                        className={`rounded-full border px-3.5 py-2 text-[11px] font-mono font-semibold tracking-wide transition ${
                          form.amount === String(amt)
                            ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                            : 'border-zinc-200 bg-zinc-50 text-zinc-700 shadow-sm hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {amt >= 1000000 ? `${amt / 1000000}jt` : formatRupiah(amt)}
                      </button>
                    ))}
                  </div>
                  <label className="block mb-4">
                    <span className={labelClass + ' text-zinc-600'}>Nominal (Rp)</span>
                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      min={0}
                      placeholder="0"
                      className={
                        inputClass + ' text-right text-lg font-bold tabular-nums text-emerald-700'
                      }
                      required
                    />
                  </label>
                  <div className="mb-1.5">
                    <span className={labelClass + ' text-zinc-600'}>Pembayaran</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {PAYMENT_METHODS.map((opt) => {
                        const active = form.paymentMethod === opt.value
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setPaymentMethod(opt.value)}
                            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-mono font-medium transition ${
                              active
                                ? 'bg-emerald-600 text-white border border-emerald-600 shadow-sm'
                                : 'bg-white text-zinc-600 border border-zinc-200 hover:border-emerald-400 hover:text-zinc-900 hover:shadow-sm'
                            }`}
                          >
                            {opt.value === 'tunai' && (
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-emerald-400/70 bg-emerald-50 text-[9px] font-semibold text-emerald-700">
                                Rp
                              </span>
                            )}
                            {opt.value === 'qris' && (
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-emerald-200 bg-emerald-50 text-[9px] font-semibold text-emerald-700">
                                QR
                              </span>
                            )}
                            {opt.value === 'transfer' && (
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-emerald-200 bg-emerald-50 text-[9px] font-semibold text-emerald-700">
                                TF
                              </span>
                            )}
                            <span>{opt.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  {form.paymentMethod !== 'tunai' && (
                    <label className="block mt-4">
                      <span className={labelClass + ' text-zinc-600'}>Bukti bayar</span>
                      <input
                        id="input-image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-emerald-700 file:font-medium"
                      />
                    </label>
                  )}
                </div>
              </div>

              {(error || errorTransaction) && (
                <div className="rounded-2xl border border-red-300 bg-red-50 px-5 py-4 font-mono text-sm text-red-700 lg:col-span-3">
                  {error || errorTransaction}
                </div>
              )}
            </form>
          )}
        </div>
      </main>

      {/* Sticky bottom bar - aligned with content (sidebar 16rem) */}
      {!transactionSuccess && (
        <footer
          className="fixed bottom-0 right-0 z-20 border-t border-zinc-800 bg-[#17191f] shadow-[0_-4px_20px_rgba(0,0,0,0.45)]"
          style={{ left: '16rem' }}
        >
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Total
              </p>
              <p className="font-mono text-2xl font-bold tabular-nums text-white">
                Rp {formatRupiah(totalAmount)}
              </p>
            </div>
            <button
              type="submit"
              form="mpos-form"
              disabled={submitting || !form.name || !form.phoneNumber || !form.email || !form.address || !form.amount}
              className="shrink-0 rounded-lg bg-emerald-600 px-8 py-3.5 font-mono text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
            >
              {submitting ? 'Menyimpan...' : 'CATAT DONASI'}
            </button>
          </div>
        </footer>
      )}
    </>
  )
}
