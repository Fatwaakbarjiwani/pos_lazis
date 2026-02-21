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
  { value: 'TUNAI', label: 'Tunai' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'QRIS AGEN', label: 'QRIS AGEN' },
]

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000]

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'decimal', maximumFractionDigits: 0 }).format(n)
}

function maskPhone(phone) {
  if (!phone || phone.length < 8) return phone || ''
  const s = String(phone).replace(/\D/g, '')
  return `${s.slice(0, 4)} **** ${s.slice(-4)}`
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
  const [profilePhase, setProfilePhase] = useState('idle') // 'idle' | 'profile' | 'event' | 'done'
  const [profileSource, setProfileSource] = useState(null) // null | 'search' | 'new'
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 1024)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1023px)')
    const handle = () => setIsMobile(mql.matches)
    mql.addEventListener('change', handle)
    handle()
    return () => mql.removeEventListener('change', handle)
  }, [])

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
    paymentMethod: 'TUNAI',
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
      paymentMethod: 'TUNAI',
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
    setProfilePhase('idle')
    setProfileSource(null)
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
    setProfileSource('search')
    setProfilePhase('profile')
  }

  const handleTambahDonatur = () => {
    setProfileSource('new')
    setProfilePhase('profile')
    setForm((prev) => ({
      ...prev,
      name: '',
      phoneNumber: '',
      email: '',
      address: '',
    }))
    setDonorSearchResults([])
    setOldDonorSearch('')
  }

  const handleGantiDonatur = () => {
    setProfilePhase('idle')
    setProfileSource(null)
    setDonorSearchResults([])
    setOldDonorSearch('')
  }

  const eventStepComplete = !!(form.eventId && form.categoryType) && (!(categories?.length) || !!form.categoryId)
  const profileStepComplete = !!(String(form.name || '').trim() && String(form.phoneNumber || '').trim())
  // Cari donatur & Tambah donatur: menu hanya Donatur → Pembayaran (Event & Kategori hanya untuk tambah donatur, lewat tombol Next)
  const steps = profileSource === 'new' || profileSource === 'search'
    ? [
        { id: 'profile', label: 'Donatur', phase: 'profile' },
        { id: 'done', label: 'Pembayaran', phase: 'done' },
      ]
    : [
        { id: 'profile', label: 'Donatur', phase: 'profile' },
        { id: 'event', label: 'Event & Kategori', phase: 'event' },
        { id: 'done', label: 'Pembayaran', phase: 'done' },
      ]
  const currentStepIndex = profileSource === 'new' || profileSource === 'search'
    ? (profilePhase === 'profile' ? 0 : 1)
    : Math.max(0, steps.findIndex((s) => s.phase === profilePhase))
  const canGoToStep = (index) => {
    if (profileSource === 'new') {
      if (index === 0) return true
      if (index === 1) return (profilePhase === 'event' || profilePhase === 'done') && eventStepComplete
      return false
    }
    if (profileSource === 'search') {
      if (index === 0) return true
      if (index === 1) return (profilePhase === 'profile' || profilePhase === 'done') && eventStepComplete
      return false
    }
    if (index <= currentStepIndex) return true
    if (index === 1) return profilePhase === 'profile' && profileStepComplete
    if (index === 2) return (profilePhase === 'event' || profilePhase === 'done') && eventStepComplete
    return false
  }
  const isStepComplete = (index) => {
    if (index === 0) return profileSource === 'search' ? true : profileStepComplete
    if (profileSource === 'new') {
      if (index === 1) return profilePhase === 'done' || eventStepComplete
      return false
    }
    if (profileSource === 'search') {
      if (index === 1) return profilePhase === 'done' || eventStepComplete
      return false
    }
    if (index === 1) return eventStepComplete
    if (index === 2) return profilePhase === 'done'
    return false
  }

  return (
    <>
      <main className="flex min-h-0 flex-1 flex-col w-full h-full max-h-full bg-zinc-50 pt-4 sm:pt-6 xl:overflow-auto">
        <div className="mx-auto w-full px-4 sm:pr-[8%] sm:pl-[4%]">
          {transactionSuccess ? (
            <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-100 bg-white shadow-xl shadow-zinc-200/40 ring-1 ring-zinc-200/50">
              <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 px-4 py-6 sm:px-8 sm:py-8 text-center">
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
                {(form.paymentMethod === 'TRANSFER' || form.paymentMethod === 'QRIS AGEN') && (
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
              <div className="space-y-4 px-4 py-5 sm:px-8 sm:py-7 text-sm text-zinc-800">
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
                          Rp {formatRupiah(
                            transactionSuccess.totalNominal
                              ?? transactionSuccess.donasi?.reduce((s, d) => s + Number(d.nominal || 0), 0)
                              ?? 0
                          )}
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
              <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-4 sm:px-8 sm:py-5 space-y-3">
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
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              {/* Kolom 1–3: Today's Collection + New Donation */}
              <div className="flex min-w-0 flex-col gap-4 lg:col-span-3">
                <TodaysCollection targetSummary={dashboard?.targetSummary} />
                <div className="overflow-hidden rounded-2xl bg-white shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 bg-white px-6 py-4">
                    <div className="flex flex-wrap items-center gap-3 min-w-0">
                      <div className="h-8 w-1 shrink-0 rounded-r-full bg-emerald-500" aria-hidden />
                      <h2 className="text-xl font-bold tracking-tight text-zinc-900">New Donation Transaction</h2>
                      {/* Stepper: sembunyikan di mobile (form lengkap 1 halaman) */}
                      {!transactionSuccess && profilePhase !== 'idle' && !isMobile && (
                        <div className="flex items-center gap-2 ml-2">
                          {steps.map((step, index) => {
                            const isActive = profilePhase === step.phase
                            const isPast = currentStepIndex > index
                            const complete = isPast || (isActive && isStepComplete(index))
                            const canClick = canGoToStep(index)
                            return (
                              <React.Fragment key={step.id}>
                                <div className="flex items-center gap-2">
                                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${isActive ? 'bg-emerald-500 text-white shadow-sm' : complete ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`} aria-hidden>
                                    {complete ? '✓' : index + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => canClick && setProfilePhase(step.phase)}
                                    disabled={!canClick}
                                    className={`flex items-center rounded-lg border-2 px-3 py-2 text-[11px] font-bold transition focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 ${canClick ? 'cursor-pointer bg-white shadow hover:shadow-md active:scale-[0.98]' : 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 opacity-80'} ${isActive ? '!border-emerald-500 !bg-emerald-50 text-zinc-900 shadow-sm ring-2 ring-emerald-200' : ''} ${canClick && complete && !isActive ? 'border-emerald-300 text-emerald-700 hover:!border-emerald-400 hover:!bg-emerald-50' : ''} ${canClick && !complete && !isActive ? 'border-zinc-300 text-zinc-700 hover:!border-zinc-400 hover:!bg-zinc-50' : ''}`}
                                  >
                                    {step.label}
                                  </button>
                                </div>
                                {index < steps.length - 1 && (
                                  <div className={`h-px w-2.5 shrink-0 ${complete ? 'bg-emerald-200' : 'bg-zinc-200'}`} aria-hidden />
                                )}
                              </React.Fragment>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-normal">{formatTanggalIndonesia(form.date)}</span>
                    </div>
                  </div>
                  <div className="p-6">
                  <form
                    id="mpos-form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {/* Fase 1: Idle - search + Cari + Tambah (mobile: selalu tampil) */}
                    {(profilePhase === 'idle' || isMobile) && (
                    <div className="relative">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-800">Cari donatur</p>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                        <div className="relative flex-1">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </span>
                          <input
                            type="text"
                            value={oldDonorSearch}
                            onChange={(e) => setOldDonorSearch(e.target.value)}
                            placeholder="Nomor HP (contoh: 0812...)"
                            className="w-full rounded-lg border border-zinc-200 bg-zinc-100 pl-11 pr-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm outline-none transition focus:border-zinc-300 focus:bg-white"
                          />
                        </div>
                        <div className="flex gap-2 sm:flex-none">
                          <button
                            type="button"
                            onClick={handleSearchDonor}
                            disabled={loadingDonorSearch}
                            className="flex-1 rounded-xl border border-zinc-200 bg-white px-5 py-3.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-50 sm:flex-none"
                          >
                            {loadingDonorSearch ? 'Mencari...' : 'Cari'}
                          </button>
                          <button
                            type="button"
                            onClick={handleTambahDonatur}
                            className="flex-1 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-600 hover:shadow-lg sm:flex-none"
                          >
                            + Tambah Donatur
                          </button>
                        </div>
                      </div>
                      {(loadingDonorSearch || donorSearchResults.length > 0 || oldDonorSearch) && (
                        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl max-h-48 overflow-y-auto">
                          {loadingDonorSearch ? (
                            <p className="py-2 px-2 text-xs text-zinc-500">Mencari...</p>
                          ) : donorSearchResults.length === 0 ? (
                            <p className="py-2 px-2 text-xs text-zinc-500 italic">Tidak ada donatur. Coba kata kunci lain.</p>
                          ) : (
                            <ul className="divide-y divide-zinc-100/80 py-0.5">
                              {donorSearchResults.map((row, idx) => (
                                <li key={row.id ?? row.nomorBukti ?? `donor-${idx}`}>
                                  <button
                                    type="button"
                                    onClick={() => selectDonor(row)}
                                    className="w-full px-4 py-3 text-left text-sm text-zinc-800 transition hover:bg-emerald-50/80"
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
                    )}

                    {/* Fase 2: Profile - donatur dari search / form donatur baru (mobile: tampil jika sudah ada donatur) */}
                    {(profilePhase === 'profile' || (isMobile && (profileSource || form.name))) && (
                    <div className="space-y-4">
                      {profileSource === 'search' ? (
                        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </span>
                            <div className="min-w-0 space-y-0.5">
                              <p className="text-sm font-bold text-zinc-900">{form.name}</p>
                              <p className="text-sm text-zinc-500">
                                {form.phoneNumber ? maskPhone(form.phoneNumber) : ''}
                                {form.email && <span className="text-zinc-600"> · </span>}
                                {form.email && <span className="text-zinc-500">{form.email}</span>}
                              </p>
                              {form.address && <p className="text-xs text-zinc-500">{form.address}</p>}
                            </div>
                          </div>
                          {!isMobile && (
                          <div className="flex shrink-0 gap-2">
                            <button type="button" onClick={handleGantiDonatur} className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50">Ganti</button>
                          </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-800">Data donatur baru</p>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <label className="block">
                              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-800">Nama</span>
                              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Nama lengkap" className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-zinc-300 focus:bg-white" required />
                            </label>
                            <label className="block">
                              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-800">No. HP</span>
                              <input type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="08xxxx" className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-zinc-300 focus:bg-white" required />
                            </label>
                            <label className="block">
                              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-800">Email (opsional)</span>
                              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@contoh.com" className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-zinc-300 focus:bg-white" />
                            </label>
                            <label className="block">
                              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-800">Alamat</span>
                              <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Alamat" className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-zinc-300 focus:bg-white" />
                            </label>
                          </div>
                        </div>
                      )}
                      {profileSource === 'new' && !isMobile && (
                        <div className="flex flex-wrap items-center gap-3">
                          <button type="button" onClick={handleGantiDonatur} className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-600 shadow-sm transition hover:bg-zinc-50">Ganti</button>
                          <button
                            type="button"
                            onClick={() => setProfilePhase('event')}
                            disabled={!profileStepComplete}
                            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                    )}

                    {/* Fase Event: kartu donatur (hanya desktop; mobile pakai form lengkap) */}
                    {profilePhase === 'event' && !isMobile && (
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </span>
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-sm font-bold text-zinc-800">{form.name}</p>
                          <p className="text-sm text-zinc-600">
                            {form.phoneNumber ? maskPhone(form.phoneNumber) : ''}
                            {form.email && <span> · {form.email}</span>}
                          </p>
                          {form.address && <p className="text-sm text-zinc-600">{form.address}</p>}
                        </div>
                      </div>
                      <button type="button" onClick={() => setProfilePhase('profile')} className="shrink-0 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-900 shadow-sm transition hover:bg-zinc-200">Ganti</button>
                    </div>
                    )}

                    {/* Event + Catatan + Tipe donasi + Sub kategori (mobile: selalu tampil) */}
                    {(profilePhase === 'idle' || profilePhase === 'event' || (profilePhase === 'profile' && profileSource === 'search') || isMobile) && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-800">Event location</span>
                          <select name="eventId" value={form.eventId} onChange={handleChange} className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-zinc-300 focus:bg-white" required>
                            <option value="">Pilih Event Location</option>
                            {loadingEvents ? <option>...</option> : events?.length > 0 ? events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name} {ev.location ? `(${ev.location})` : ''}</option>) : <option disabled>—</option>}
                          </select>
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-800">Keterangan / Notes</span>
                          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Add additional information..." rows={2} className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm placeholder-zinc-400 shadow-sm outline-none resize-none transition focus:border-zinc-300 focus:bg-white" />
                        </label>
                      </div>

                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-800">Select Donation Type</p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {CATEGORY_TYPES.map((opt) => {
                            const active = form.categoryType === opt.value
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleChange({ target: { name: 'categoryType', value: opt.value } })}
                                className={`flex flex-col items-center gap-2.5 rounded-lg border-2 py-4 text-xs font-bold uppercase shadow-sm transition ${active ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'}`}
                              >
                                {opt.value === 'zakat' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={`h-6 w-6 ${active ? 'text-emerald-500' : 'text-zinc-500'}`}><path fill="currentColor" d="M21 18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1h-9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2m0-2h10V8H12m4 5.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5"/></svg>}
                                {opt.value === 'infak' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={`h-6 w-6 ${active ? 'text-emerald-500' : 'text-zinc-500'}`}><path fill="currentColor" d="M16 2c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5m0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3s3 1.34 3 3s-1.34 3-3 3m3 6h-2c0-1.2-.75-2.28-1.87-2.7L8.97 11H1v11h6v-1.44l7 1.94l8-2.5v-1c0-1.66-1.34-3-3-3M5 20H3v-7h2zm8.97.41L7 18.5V13h1.61l5.82 2.17c.34.13.57.46.57.83c0 0-2-.05-2.3-.15l-2.38-.79l-.63 1.9l2.38.79c.51.17 1.04.25 1.58.25H19c.39 0 .74.24.9.57z"/></svg>}
                                {opt.value === 'dskl' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={`h-6 w-6 ${active ? 'text-emerald-500' : 'text-zinc-500'}`}><path fill="currentColor" d="m19.83 7.5l-2.27-2.27c.07-.42.18-.81.32-1.15A1.498 1.498 0 0 0 16.5 2c-1.64 0-3.09.79-4 2h-5C4.46 4 2 6.46 2 9.5S4.5 21 4.5 21H10v-2h2v2h5.5l1.68-5.59l2.82-.94V7.5zM13 9H8V7h5zm3 2c-.55 0-1-.45-1-1s.45-1 1-1s1 .45 1 1s-.45 1-1 1"/></svg>}
                                {opt.value === 'campaign' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={`h-6 w-6 ${active ? 'text-emerald-500' : 'text-zinc-500'}`}><path fill="currentColor" d="M18 13v-2h4v2zm1.2 7L16 17.6l1.2-1.6l3.2 2.4zm-2-12L16 6.4L19.2 4l1.2 1.6zM5 19v-4H4q-.825 0-1.412-.587T2 13v-2q0-.825.588-1.412T4 9h4l5-3v12l-5-3H7v4zm9-3.65v-6.7q.675.6 1.088 1.463T15.5 12t-.413 1.888T14 15.35"/></svg>}
                                {opt.label}
                              </button>
                            )
                          })}
                        </div>
                        {form.categoryType && (
                          <div className="mt-4">
                            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-800">Sub kategori</span>
                            <select name="categoryId" value={form.categoryId} onChange={handleChange} className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-zinc-300 focus:bg-white">
                              <option value="">Pilih</option>
                              {loadingCategories ? <option>...</option> : categories.map((cat) => <option key={cat[categoryIdField]} value={cat[categoryIdField]}>{cat[categoryNameField] || cat.categoryName || cat.campaignName}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                    )}

                    {/* Fase Done: kartu donatur + pembayaran + nominal + submit (mobile: selalu tampil) */}
                    {(profilePhase === 'done' || isMobile) && (
                    <>
                    {!isMobile && (
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </span>
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-sm font-bold text-zinc-900">{form.name}</p>
                          <p className="text-sm text-zinc-600">
                            {form.phoneNumber ? maskPhone(form.phoneNumber) : ''}
                            {form.email && <span> · {form.email}</span>}
                          </p>
                          {form.address && <p className="text-sm text-zinc-600">{form.address}</p>}
                        </div>
                      </div>
                      <button type="button" onClick={handleGantiDonatur} className="shrink-0 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-900 shadow-sm transition hover:bg-zinc-200">Ganti</button>
                    </div>
                    )}

                    {/* Payment + Nominal + Process Transaction */}
                    <div>
                      <p className="mb-3 text-sm font-bold text-zinc-900">Select Payment Type</p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {PAYMENT_METHODS.map((opt) => {
                          const active = form.paymentMethod === opt.value
                          const descriptions = {
                            TUNAI: 'Terima tunai langsung',
                            TRANSFER: 'Verifikasi manual',
                            'QRIS AGEN': 'Scan QR transfer instan'
                          }
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setPaymentMethod(opt.value)}
                              className={`relative flex items-start gap-3 rounded-xl border-2 px-4 py-4 text-left shadow-sm transition ${active ? 'border-emerald-500 bg-white' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}
                            >
                              {active && (
                                <span className="absolute right-3 top-3 text-emerald-500">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </span>
                              )}
                              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-zinc-100' : 'bg-zinc-100'}`}>
                                {opt.value === 'TUNAI' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${active ? 'text-emerald-500' : 'text-zinc-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                )}
                                {opt.value === 'TRANSFER' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${active ? 'text-emerald-500' : 'text-zinc-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                )}
                                {opt.value === 'QRIS AGEN' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${active ? 'text-emerald-500' : 'text-zinc-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                  </svg>
                                )}
                              </span>
                              <div className="min-w-0 flex-1 pr-6">
                                <p className="text-sm font-bold text-zinc-900">{opt.label}</p>
                                <p className="mt-0.5 text-xs text-zinc-500">{descriptions[opt.value]}</p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    
                    {form.paymentMethod !== 'TUNAI' && (
                      <div>
                        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-800">Bukti bayar</span>
                        <input
                          id="input-image"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm file:mr-2 file:rounded file:border-0 file:bg-emerald-500 file:px-3 file:py-1 file:text-white file:text-xs file:hover:bg-emerald-600"
                        />
                      </div>
                    )}

                    <div>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-zinc-900">Total Donation Amount</span>
                        <div className="flex gap-1.5">
                          {[100000, 500000, 1000000].map((amt) => {
                            const active = form.amount === String(amt)
                            return (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => setQuickAmount(amt)}
                                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${active ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'}`}
                              >
                                {amt >= 1000000 ? '1M' : `${amt / 1000}k`}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex items-center rounded-xl bg-zinc-800 px-5 py-4 shadow-sm">
                        <span className="text-sm text-zinc-400">Rp</span>
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
                          className="ml-3 flex-1 bg-transparent text-left text-2xl font-semibold tabular-nums text-white placeholder-zinc-500 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !form.name || !form.phoneNumber || !form.amount}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 text-base font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-emerald-600 disabled:opacity-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {submitting ? 'Memproses...' : 'Process Transaction'}
                    </button>
                    </>
                    )}
                  </form>
                  </div>
                </div>
              </div>

              {/* Kolom 4: Type Distribution ke bawah + Ongoing + Recent */}
              <div className="flex min-w-0 flex-col gap-4 lg:col-span-1">
                <TypeDistribution categoryNominal={dashboard?.categoryNominalSummary} />
                <OngoingCampaigns />
                <RecentActivity historyContent={
                  history?.content?.slice(0, 3).map((item) => {
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
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal pesan error */}
      {(error || errorTransaction) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="error-modal-title">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setError(''); dispatch(clearTransactionSuccess()) }} aria-hidden />
          <div className="relative w-full max-w-sm rounded-xl border border-red-200 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h3 id="error-modal-title" className="text-sm font-bold text-zinc-900">Terjadi kesalahan</h3>
            </div>
            <p className="mb-5 text-sm text-red-700">{error || errorTransaction}</p>
            <button
              type="button"
              onClick={() => { setError(''); dispatch(clearTransactionSuccess()) }}
              className="w-full rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </>
  )
}
