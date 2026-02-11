import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { printReceipt } from '../utils/printReceipt'
import { getEvents, getHistory } from '../redux/actions/posActions'

const CATEGORY_OPTIONS = [
  { value: '', label: 'Semua' },
  { value: 'zakat', label: 'Zakat' },
  { value: 'infak', label: 'Infak' },
  { value: 'dskl', label: 'DSKL' },
  { value: 'campaign', label: 'Campaign' },
]

const PAYMENT_OPTIONS = [
  { value: '', label: 'Semua' },
  { value: 'tunai', label: 'Tunai' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'qris', label: 'QRIS' },
]

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'decimal', maximumFractionDigits: 0 }).format(Number(n))
}

function getCategoryColor(kategori) {
  const category = (kategori || '').toLowerCase()
  switch (category) {
    case 'campaign':
      return 'bg-violet-100 text-violet-700 border-violet-200'
    case 'infak':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'zakat':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'dskl':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    default:
      return 'bg-zinc-100 text-zinc-700 border-zinc-200'
  }
}

function getPaymentIcon(method) {
  const m = (method || '').toLowerCase()
  switch (m) {
    case 'tunai':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    case 'transfer':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    case 'qris':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      )
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
  }
}

export default function HistoryPage() {
  const dispatch = useDispatch()
  const { events, loadingEvents, history, loadingHistory } = useSelector((state) => state.pos)
  const { user } = useSelector((state) => state.auth)

  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    category: '',
    eventId: '',
    paymentMethod: '',
    search: '',
    page: 0,
  })

  useEffect(() => {
    dispatch(getEvents())
  }, [dispatch])

  useEffect(() => {
    dispatch(getHistory(filters))
  }, [dispatch, filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      ...(key === 'page' ? { page: value } : { [key]: value, page: 0 }),
    }))
  }

  const inputClass =
    'w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition'
  const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-700'

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-zinc-50 pt-6">
      <div className="mx-auto w-full pr-[8%] pl-[4%]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">History Transaksi</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Riwayat donasi yang sudah divalidasi — filter dan cetak struk
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-9 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600" />
            <h2 className="text-lg font-bold text-zinc-900">Filter Transaksi</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <label className="block lg:col-span-2">
              <span className={labelClass}>Cari (nama / no. HP)</span>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Nama atau no. HP"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Dari</span>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Sampai</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Kategori</span>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className={inputClass}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value || 'all'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Event</span>
              <select
                value={filters.eventId}
                onChange={(e) => handleFilterChange('eventId', e.target.value)}
                className={inputClass}
              >
                <option value="">Semua</option>
                {loadingEvents ? (
                  <option>...</option>
                ) : (
                  events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Pembayaran</span>
              <select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                className={inputClass}
              >
                {PAYMENT_OPTIONS.map((opt) => (
                  <option key={opt.value || 'all'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {loadingHistory ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-zinc-200 bg-white py-12">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-emerald-600"></div>
              <p className="mt-4 text-sm text-zinc-500">Memuat data transaksi...</p>
            </div>
          </div>
        ) : history.content.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium text-zinc-600">Tidak ada data transaksi</p>
            <p className="text-xs text-zinc-400">Ubah filter atau periode untuk melihat riwayat</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 rounded-full bg-emerald-500"></div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-700">
                  {history.totalElements} Transaksi
                </h3>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {history.content.map((row) => (
                <div
                  key={row.id}
                  className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        {row.nomorBukti}
                      </p>
                      <p className="text-sm text-zinc-400">{row.tanggal}</p>
                    </div>
                    <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${getCategoryColor(row.kategori)}`}>
                      {row.kategori}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="mb-1 text-base font-bold text-zinc-900">{row.nama}</p>
                    {row.subKategori && (
                      <p className="text-xs text-zinc-500">{row.subKategori}</p>
                    )}
                  </div>

                  <div className="mb-4 flex items-center justify-between border-t border-zinc-100 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                        {getPaymentIcon(row.metodePembayaran)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-700 capitalize">{row.metodePembayaran}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-zinc-900">Rp {formatRupiah(row.nominal)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => printReceipt(row, 'thermal', user)}
                      className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      Thermal
                    </button>
                    <button
                      type="button"
                      onClick={() => printReceipt(row, 'normal', user)}
                      className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      Biasa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {history.totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-6 py-4 shadow-sm">
                <p className="text-xs text-zinc-600">
                  Menampilkan <span className="font-semibold">{history.content.length}</span> dari{' '}
                  <span className="font-semibold">{history.totalElements}</span> transaksi · Halaman{' '}
                  <span className="font-semibold">{history.number + 1}</span> dari{' '}
                  <span className="font-semibold">{history.totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleFilterChange('page', history.number - 1)}
                    disabled={history.number <= 0}
                    className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFilterChange('page', history.number + 1)}
                    disabled={history.number >= history.totalPages - 1}
                    className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
