import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { printReceipt } from '../utils/printReceipt'
import { getEvents, getCategories, createTransaction, clearTransactionSuccess, searchDonors, getDashboard, getHistory } from '../redux/actions/posActions'
import { TodaysCollection, TypeDistribution, OngoingCampaigns, RecentActivity } from '../components/DashboardWidgets'

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

function formatTanggalIndonesia(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const bulan = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getMonth()]
  return `${d.getDate()} ${bulan} ${d.getFullYear()}`
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'recent'
  try {
    const now = new Date()
    let date = new Date(dateStr)
    
    if (isNaN(date.getTime())) {
      const dateParts = dateStr.split(/[-/]/)
      if (dateParts.length === 3) {
        date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
      } else {
        return 'recent'
      }
    }
    
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} mins ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return formatTanggalIndonesia(dateStr.split('T')[0] || dateStr.split(' ')[0])
  } catch {
    return 'recent'
  }
}

export default function HomePage() {
  const dispatch = useDispatch()
  const { events, categories, loadingEvents, loadingCategories, submitting, transactionSuccess, errorTransaction, dashboard, history } = useSelector((state) => state.pos)
  const { user } = useSelector((state) => state.auth)
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
    dispatch(getDashboard())
    const today = new Date()
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
    dispatch(getHistory({
      startDate: lastMonth.toISOString().slice(0, 10),
      endDate: today.toISOString().slice(0, 10),
      category: '',
      eventId: '',
      paymentMethod: '',
      search: '',
      page: 0,
    }))
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
    
    if (!form.eventId) {
      setError('Event ID harus diisi')
      return
    }
    
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
      <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-zinc-50 pt-6">
        <div className="mx-auto w-full pr-[8%] pl-[4%]">
          {transactionSuccess ? (
            <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl shadow-zinc-200/40 ring-1 ring-zinc-200/50">
              <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 px-8 py-8 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-2 ring-white/60">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-50">
                  Struk donasi tercatat
                </p>
                <p className="mt-1 text-xl font-bold text-white">
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
              <div className="space-y-4 px-8 py-7 text-sm text-zinc-800">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-zinc-50 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
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
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
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
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Rincian per kategori
                  </p>
                  {transactionSuccess.donasi?.map((d, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-zinc-200 py-2 last:border-0">
                      <span className="text-sm text-zinc-800">
                        {d.kategori}
                        {d.subKategori ? ` — ${d.subKategori}` : ''}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-emerald-600">
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
                    onClick={() => printReceipt({ ...transactionSuccess, metodePembayaran: form.paymentMethod }, 'thermal', user)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span>Cetak thermal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => printReceipt({ ...transactionSuccess, metodePembayaran: form.paymentMethod }, 'normal', user)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span>Cetak biasa</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCatatLagi}
                  className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-500 active:scale-[0.99]"
                >
                  Transaksi baru
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <TodaysCollection targetSummary={dashboard?.targetSummary} />

              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="flex-1 min-w-0">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-md">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-1.5 rounded-full bg-emerald-500" />
                      <h2 className="text-xl font-bold text-zinc-900">New Donation Transaction</h2>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatTanggalIndonesia(form.date)}</span>
                    </div>
                  </div>

                  <form
                    id="mpos-form"
                    onSubmit={handleSubmit}
                    className="space-y-8"
                  >
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-700">
                        Donor Search (Phone Number)
                      </label>
                      <div className="relative flex items-center gap-0">
                        <div className="relative flex-1">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </span>
                          <input
                            type="text"
                            value={oldDonorSearch}
                            onChange={(e) => setOldDonorSearch(e.target.value)}
                            placeholder="Search by phone number (e.g. 0812...)"
                            className="w-full rounded-l-xl border border-r-0 border-zinc-200 bg-white pl-12 pr-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSearchDonor}
                          disabled={loadingDonorSearch}
                          className="rounded-r-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                        >
                          {loadingDonorSearch ? 'Searching...' : 'Find Donor'}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-zinc-500">Tip: Leave empty for new donor registration.</p>
                      
                      {(loadingDonorSearch || donorSearchResults.length > 0 || oldDonorSearch) && (
                        <div className="relative z-20 mt-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-lg max-h-52 overflow-y-auto">
                          {loadingDonorSearch ? (
                            <p className="text-xs text-zinc-500">Searching...</p>
                          ) : donorSearchResults.length === 0 ? (
                            <p className="text-xs text-zinc-500 italic">
                              No donor found. Try different keywords.
                            </p>
                          ) : (
                            <ul className="divide-y divide-zinc-100">
                              {donorSearchResults.map((row, idx) => (
                                <li key={row.id ?? row.nomorBukti ?? `donor-${idx}`}>
                                  <button
                                    type="button"
                                    onClick={() => selectDonor(row)}
                                    className="w-full px-2 py-2 text-left text-sm text-zinc-800 transition hover:bg-emerald-50/70 hover:text-zinc-900"
                                  >
                                    <span className="font-semibold">{row.nama}</span>
                                    {(row.noHp || row.phoneNumber) && (
                                      <span className="ml-1 text-zinc-500">· {row.noHp || row.phoneNumber}</span>
                                    )}
                                    {row.email && (
                                      <span className="block truncate text-xs text-zinc-500">{row.email}</span>
                                    )}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-5">
                          <label className="block">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                              FULL NAME
                            </span>
                            <input
                              type="text"
                              name="name"
                              value={form.name}
                              onChange={handleChange}
                              placeholder="Enter donor name"
                              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                              required
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                              PHONE NUMBER
                            </span>
                            <input
                              type="text"
                              name="phoneNumber"
                              value={form.phoneNumber}
                              onChange={handleChange}
                              placeholder="08xxxx"
                              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                              required
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                              EMAIL <span className="normal-case font-normal text-zinc-400">(OPTIONAL)</span>
                            </span>
                            <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              placeholder="example@mail.com"
                              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                            />
                          </label>
                        </div>

                        <div className="space-y-5">
                          <label className="block">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                              ADDRESS <span className="normal-case font-normal text-zinc-400">(OPTIONAL)</span>
                            </span>
                            <input
                              type="text"
                              name="address"
                              value={form.address}
                              onChange={handleChange}
                              placeholder="Enter complete address"
                              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                              EVENT LOCATION
                            </span>
                            <select
                              name="eventId"
                              value={form.eventId}
                              onChange={handleChange}
                              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                              required
                            >
                              <option value="">Pilih Event Location</option>
                              {loadingEvents ? (
                                <option>Loading events...</option>
                              ) : events && events.length > 0 ? (
                                events.map((ev) => (
                                  <option key={ev.id} value={ev.id}>
                                    {ev.name} {ev.location ? `(${ev.location})` : ''}
                                  </option>
                                ))
                              ) : (
                                <option disabled>No events available</option>
                              )}
                            </select>
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                              KETERANGAN / NOTES
                            </span>
                            <textarea
                              name="description"
                              value={form.description}
                              onChange={handleChange}
                              placeholder="Add additional information..."
                              rows={3}
                              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition resize-none"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-4 block text-sm font-medium text-zinc-700">
                        Select Donation Type
                      </label>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {CATEGORY_TYPES.map((opt) => {
                          const active = form.categoryType === opt.value
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleChange({ target: { name: 'categoryType', value: opt.value } })}
                              className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition ${
                                active
                                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                                  : 'border-zinc-200 bg-white hover:border-zinc-300'
                              }`}
                            >
                              {opt.value === 'zakat' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={`h-8 w-8 ${active ? 'text-emerald-500' : 'text-zinc-400'}`}>
                                  <path fill="currentColor" d="M21 18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1h-9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2m0-2h10V8H12m4 5.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5"/>
                                </svg>
                              )}
                              {opt.value === 'infak' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={`h-8 w-8 ${active ? 'text-emerald-500' : 'text-zinc-400'}`}>
                                  <path fill="currentColor" d="M16 2c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5m0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3s3 1.34 3 3s-1.34 3-3 3m3 6h-2c0-1.2-.75-2.28-1.87-2.7L8.97 11H1v11h6v-1.44l7 1.94l8-2.5v-1c0-1.66-1.34-3-3-3M5 20H3v-7h2zm8.97.41L7 18.5V13h1.61l5.82 2.17c.34.13.57.46.57.83c0 0-2-.05-2.3-.15l-2.38-.79l-.63 1.9l2.38.79c.51.17 1.04.25 1.58.25H19c.39 0 .74.24.9.57z"/>
                                </svg>
                              )}
                              {opt.value === 'dskl' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={`h-8 w-8 ${active ? 'text-emerald-500' : 'text-zinc-400'}`}>
                                  <path fill="currentColor" d="m19.83 7.5l-2.27-2.27c.07-.42.18-.81.32-1.15A1.498 1.498 0 0 0 16.5 2c-1.64 0-3.09.79-4 2h-5C4.46 4 2 6.46 2 9.5S4.5 21 4.5 21H10v-2h2v2h5.5l1.68-5.59l2.82-.94V7.5zM13 9H8V7h5zm3 2c-.55 0-1-.45-1-1s.45-1 1-1s1 .45 1 1s-.45 1-1 1"/>
                                </svg>
                              )}
                              {opt.value === 'campaign' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={`h-8 w-8 ${active ? 'text-emerald-500' : 'text-zinc-400'}`}>
                                  <path fill="currentColor" d="M18 13v-2h4v2zm1.2 7L16 17.6l1.2-1.6l3.2 2.4zm-2-12L16 6.4L19.2 4l1.2 1.6zM5 19v-4H4q-.825 0-1.412-.587T2 13v-2q0-.825.588-1.412T4 9h4l5-3v12l-5-3H7v4zm9-3.65v-6.7q.675.6 1.088 1.463T15.5 12t-.413 1.888T14 15.35"/>
                                </svg>
                              )}
                              <span className={`text-xs font-semibold uppercase ${active ? 'text-emerald-500' : 'text-zinc-600'}`}>
                                {opt.label.toUpperCase()}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      
                      {form.categoryType && (
                        <div className="mt-4">
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                            Sub Category
                          </label>
                          <select
                            name="categoryId"
                            value={form.categoryId}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                          >
                            <option value="">Select sub category</option>
                            {loadingCategories ? (
                              <option>Loading...</option>
                            ) : (
                              categories.map((cat) => (
                                <option key={cat[categoryIdField]} value={cat[categoryIdField]}>
                                  {cat[categoryNameField] || cat.categoryName || cat.campaignName}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="mb-4 block text-sm font-medium text-zinc-700">
                        Select Payment Type
                      </label>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {PAYMENT_METHODS.map((opt) => {
                          const active = form.paymentMethod === opt.value
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setPaymentMethod(opt.value)}
                              className={`relative flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition ${
                                active
                                  ? 'border-emerald-500 bg-white shadow-[0_0_0_1px_rgba(16,185,129,0.35)]'
                                  : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'
                              }`}
                            >
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                                {opt.value === 'tunai' && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-6 w-6 ${active ? 'text-emerald-500' : 'text-zinc-400'}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                  </svg>
                                )}
                                {opt.value === 'transfer' && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-6 w-6 ${active ? 'text-emerald-500' : 'text-zinc-400'}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                  </svg>
                                )}
                                {opt.value === 'qris' && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-6 w-6 ${active ? 'text-emerald-500' : 'text-zinc-400'}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                                    />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm font-semibold ${active ? 'text-zinc-900' : 'text-zinc-800'}`}>
                                  {opt.value === 'tunai'
                                    ? 'Cash Payment'
                                    : opt.value === 'transfer'
                                    ? 'Bank Transfer'
                                    : 'QRIS'}
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                  {opt.value === 'tunai'
                                    ? 'Accept cash directly from donor'
                                    : opt.value === 'transfer'
                                    ? 'Manual verification required'
                                    : 'Scan QR code for instant transfer'}
                                </p>
                              </div>
                              {active && (
                                <div className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    
                    {form.paymentMethod !== 'tunai' && (
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                          Payment Proof
                        </label>
                        <input
                          id="input-image"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-4 file:py-2 file:text-emerald-700 file:font-medium"
                        />
                      </div>
                    )}

                    <div>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <label className="block text-sm font-semibold text-zinc-800">
                          Total Donation Amount
                        </label>
                        <div className="flex items-center gap-2">
                          {[100000, 500000, 1000000].map((amt) => {
                            const active = form.amount === String(amt)
                            return (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => setQuickAmount(amt)}
                                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                  active
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : 'border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                }`}
                              >
                                {amt >= 1000000 ? '1M' : `${amt / 1000}k`}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div className="relative flex items-center rounded-2xl bg-slate-950 px-6 py-5">
                        <span className="text-base font-medium text-slate-400">Rp</span>
                        <input
                          type="text"
                          name="amount"
                          value={form.amount ? formatRupiah(Number(String(form.amount).replace(/\D/g, ''))) : ''}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/\D/g, '')
                            setForm((prev) => ({ ...prev, amount: numericValue }))
                            setError('')
                            if (transactionSuccess) dispatch(clearTransactionSuccess())
                          }}
                          placeholder="0"
                          className="ml-2 flex-1 bg-transparent text-left text-3xl font-bold tabular-nums text-slate-50 placeholder-slate-600 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !form.name || !form.phoneNumber || !form.amount}
                      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-6 py-4 text-base font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-emerald-600 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {submitting ? 'PROCESSING...' : 'PROCESS TRANSACTION'}
                    </button>

                    {(error || errorTransaction) && (
                      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                        {error || errorTransaction}
                      </div>
                    )}
                  </form>
                  </div>
                </div>

                <aside className="w-full lg:w-80 shrink-0 space-y-6">
                  <TypeDistribution categoryNominal={dashboard?.categoryNominalSummary} />
                  <OngoingCampaigns eventSummary={dashboard?.eventSummary} />
                  <RecentActivity historyContent={
                    history?.content?.slice(0, 5).map((item) => {
                      const kategoriLower = (item.kategori || '').toLowerCase()
                      const subKategori = item.subKategori || ''
                      return {
                        kategori: `${kategoriLower}${subKategori ? ` - ${subKategori}` : ''}`,
                        kategoriType: kategoriLower,
                        nominal: item.nominal,
                        nama: item.nama,
                        waktu: formatTimeAgo(item.tanggal),
                      }
                    }) || []
                  } />
                </aside>
              </div>
            </div>
          )}
        </div>
      </main>

    </>
  )
}
