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

export default function HistoryPage() {
  const dispatch = useDispatch()
  const { events, loadingEvents, history, loadingHistory } = useSelector((state) => state.pos)

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
  }, [dispatch, filters.startDate, filters.endDate, filters.category, filters.eventId, filters.paymentMethod, filters.search, filters.page])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      ...(key === 'page' ? { page: value } : { [key]: value, page: 0 }),
    }))
  }

  const inputClass =
    'w-full rounded-xl border border-zinc-300 bg-zinc-100 px-3.5 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition font-mono'
  const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 font-mono'

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-zinc-100 pb-6 pt-6">
      <div className="mx-auto w-full px-[2%]">
        <h1 className="mb-4 font-mono text-xl font-bold text-zinc-900">History Transaksi</h1>

        {/* Filters */}
        <div className="mb-5 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-l-4 border-emerald-500 border-y-0 border-r-0 bg-zinc-100 px-5 py-3.5">
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Filter
            </p>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-6">
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

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            {loadingHistory ? (
              <div className="p-12 text-center font-mono text-sm text-zinc-500">Memuat...</div>
            ) : history.content.length === 0 ? (
              <div className="p-12 text-center font-mono text-sm text-zinc-500">Tidak ada data</div>
            ) : (
              <table className="w-full min-w-[800px] font-mono text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-100">
                    <th className="px-4 py-3 text-left font-semibold text-zinc-700">No. Bukti</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-700">Tanggal</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-700">Nama</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-700">Kategori</th>
                    <th className="px-4 py-3 text-right font-semibold text-zinc-700">Nominal</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-700">Bayar</th>
                    <th className="px-4 py-3 text-center font-semibold text-zinc-700">Cetak</th>
                  </tr>
                </thead>
                <tbody>
                  {history.content.map((row) => (
                    <tr key={row.id} className="border-b border-zinc-100 transition hover:bg-zinc-50/50">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-800">{row.nomorBukti}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-600">{row.tanggal}</td>
                      <td className="px-4 py-3 text-zinc-800">{row.nama}</td>
                      <td className="px-4 py-3 text-zinc-600">
                        {row.kategori}
                        {row.subKategori ? ` — ${row.subKategori}` : ''}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-zinc-800">
                        Rp {formatRupiah(row.nominal)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-600">{row.metodePembayaran}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50/80 p-0.5">
                          <button
                            type="button"
                            onClick={() => printReceipt(row, 'thermal')}
                            className="rounded-md px-2.5 py-1.5 text-[10px] font-medium text-zinc-600 transition hover:bg-white hover:text-zinc-900 hover:shadow-sm"
                          >
                            Thermal
                          </button>
                          <button
                            type="button"
                            onClick={() => printReceipt(row, 'normal')}
                            className="rounded-md px-2.5 py-1.5 text-[10px] font-medium text-zinc-600 transition hover:bg-white hover:text-zinc-900 hover:shadow-sm"
                          >
                            Biasa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {history.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-100 px-5 py-3">
              <p className="font-mono text-xs text-zinc-600">
                {history.totalElements} transaksi · Halaman {history.number + 1} dari {history.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleFilterChange('page', history.number - 1)}
                  disabled={history.number <= 0}
                  className="rounded-xl border border-zinc-300 bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 font-mono transition hover:bg-zinc-50 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange('page', history.number + 1)}
                  disabled={history.number >= history.totalPages - 1}
                  className="rounded-xl border border-zinc-300 bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 font-mono transition hover:bg-zinc-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
