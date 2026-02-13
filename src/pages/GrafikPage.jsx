import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getDashboard } from '../redux/actions/posActions'
import PieChart from '../components/charts/PieChart'
import BarChart from '../components/charts/BarChart'

const CATEGORY_LABELS = { zakat: 'Zakat', infak: 'Infak', dskl: 'DSKL', campaign: 'Campaign' }
const PAYMENT_LABELS = { tunai: 'Tunai', transfer: 'Transfer', qris: 'QRIS' }

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'decimal', maximumFractionDigits: 0 }).format(Number(n))
}

function getCategoryColor(category) {
  const cat = (category || '').toLowerCase()
  switch (cat) {
    case 'campaign':
      return { bg: 'bg-violet-500', light: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' }
    case 'infak':
      return { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' }
    case 'zakat':
      return { bg: 'bg-emerald-500', light: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' }
    case 'dskl':
      return { bg: 'bg-amber-500', light: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' }
    default:
      return { bg: 'bg-zinc-500', light: 'bg-zinc-100', text: 'text-zinc-700', border: 'border-zinc-200' }
  }
}

export default function GrafikPage() {
  const dispatch = useDispatch()
  const { dashboard, loadingDashboard, errorDashboard } = useSelector((state) => state.pos)

  useEffect(() => {
    dispatch(getDashboard())
  }, [dispatch])

  if (loadingDashboard) {
    return (
      <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-zinc-50 pt-6">
        <div className="mx-auto w-full px-4 sm:pr-[8%] sm:pl-[4%]">
          <div className="mb-8 flex flex-col gap-2">
            <div className="h-9 w-20 animate-pulse rounded-lg bg-zinc-200" />
            <div className="h-4 w-48 animate-pulse rounded bg-zinc-200" />
          </div>
          <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-zinc-200 bg-white py-16 shadow-sm">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-emerald-600" />
              <p className="mt-4 text-sm font-medium text-zinc-500">Memuat data grafik...</p>
              <p className="mt-1 text-xs text-zinc-400">Ringkasan donasi & statistik</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (errorDashboard) {
    return (
      <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-zinc-50 pt-6">
        <div className="mx-auto w-full px-4 sm:pr-[8%] sm:pl-[4%]">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900">Grafik & Laporan</h1>
            <p className="mt-2 text-sm text-zinc-500">Ringkasan donasi dan statistik</p>
          </div>
          <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errorDashboard}
          </div>
        </div>
      </main>
    )
  }

  const categoryNominal = dashboard?.categoryNominalSummary ?? []
  const categoryCount = dashboard?.categoryCountSummary ?? []
  const paymentSummary = dashboard?.paymentMethodSummary ?? []
  const eventSummary = dashboard?.eventSummary ?? []
  const targetSummary = dashboard?.targetSummary

  const pieNominalData = categoryNominal.map((d) => ({
    name: CATEGORY_LABELS[d.category] ?? d.category,
    value: Number(d.totalNominal),
  }))
  const barCountData = categoryCount.map((d) => ({
    name: CATEGORY_LABELS[d.category] ?? d.category,
    value: Number(d.totalCount),
  }))
  const piePaymentData = paymentSummary.map((d) => ({
    name: PAYMENT_LABELS[d.method] ?? d.method,
    value: Number(d.totalCount),
  }))

  const totalNominalAll = categoryNominal.reduce((s, d) => s + Number(d.totalNominal || 0), 0)
  const totalTransaksiAll = categoryCount.reduce((s, d) => s + Number(d.totalCount || 0), 0)
  const avgPerTransaksi = totalTransaksiAll > 0 ? Math.round(totalNominalAll / totalTransaksiAll) : 0
  const targetPct = Number(targetSummary?.percentage ?? 0)
  const topCategory = categoryNominal.length > 0
    ? categoryNominal.reduce((a, b) => (Number(a.totalNominal) >= Number(b.totalNominal) ? a : b))
    : null

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-zinc-50 pt-6">
      <div className="mx-auto w-full px-4 sm:pr-[8%] sm:pl-[4%]">
        {/* Hero header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Laporan & Analitik</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Grafik & Statistik Donasi</h1>
          <p className="mt-2 max-w-xl text-xs sm:text-sm text-zinc-500">
            Ringkasan donasi per kategori, metode pembayaran, dan pencapaian target. Data diperbarui dari dashboard.
          </p>
        </div>

        {/* KPI cards - 4 columns */}
        <div className="mb-4 sm:mb-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-emerald-100 opacity-60" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Donasi</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900">Rp {formatRupiah(totalNominalAll)}</p>
                <p className="mt-1 text-xs text-zinc-500">Seluruh kategori</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-blue-100 opacity-60" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Transaksi</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900">{totalTransaksiAll}</p>
                <p className="mt-1 text-xs text-zinc-500">Keseluruhan</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-violet-100 opacity-60" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Rata-rata / Transaksi</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900">Rp {formatRupiah(avgPerTransaksi)}</p>
                <p className="mt-1 text-xs text-zinc-500">Per donasi</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white shadow-lg shadow-violet-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-amber-100 opacity-60" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Pencapaian Target</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900">{targetPct.toFixed(1)}%</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {targetSummary ? `Rp ${formatRupiah(targetSummary.currentTotal)}` : '—'}
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Target progress - full width */}
        {targetSummary && (
          <div className="mb-4 sm:mb-6 overflow-hidden rounded-xl sm:rounded-2xl border border-emerald-200 bg-white shadow-sm">
            <div className="grid gap-4 sm:gap-6 bg-gradient-to-br from-emerald-50 via-white to-white p-4 sm:p-6 sm:grid-cols-[auto_1fr_auto]">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-500 text-xl sm:text-2xl font-bold text-white shadow-lg shadow-emerald-500/30">
                  {targetPct.toFixed(0)}%
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Target Donasi</h3>
                  <p className="mt-1 text-lg font-bold tabular-nums text-zinc-800">
                    Rp {formatRupiah(targetSummary.currentTotal)}
                    <span className="ml-2 text-sm font-normal text-zinc-500">/ Rp {formatRupiah(targetSummary.target)}</span>
                  </p>
                  <p className="mt-1 text-xs font-medium text-emerald-700">{targetPct.toFixed(1)}% tercapai</p>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-2 px-2">
                <div className="h-4 w-full overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-700"
                    style={{ width: `${Math.min(100, targetPct)}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500">Progress menuju target</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-zinc-500">Sisa</p>
                <p className="mt-1 font-bold tabular-nums text-zinc-900">
                  Rp {formatRupiah(Math.max(0, Number(targetSummary.target) - Number(targetSummary.currentTotal)))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Charts grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Nominal per kategori */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm lg:col-span-2">
            <div className="border-b border-zinc-100 px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-zinc-900">Nominal per Kategori</h2>
                    <p className="text-xs text-zinc-500">Distribusi donasi menurut tipe donasi</p>
                  </div>
                </div>
                {topCategory && (
                  <div className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${getCategoryColor(topCategory.category).light} ${getCategoryColor(topCategory.category).text}`}>
                    Terbesar: {CATEGORY_LABELS[topCategory.category] ?? topCategory.category}
                  </div>
                )}
              </div>
            </div>
            <div className="min-h-[300px] p-6">
              {pieNominalData.length === 0 ? (
                <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-zinc-100 p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="mt-4 text-sm font-medium text-zinc-600">Belum ada data</p>
                  <p className="mt-1 text-xs text-zinc-400">Data akan muncul setelah ada transaksi</p>
                </div>
              ) : (
                <div className="flex flex-col items-center lg:flex-row lg:items-start lg:justify-between lg:gap-8">
                  <div className="shrink-0">
                    <PieChart
                      data={pieNominalData}
                      valueKey="value"
                      nameKey="name"
                      size={220}
                      formatValue={(v) => `Rp ${formatRupiah(v)}`}
                    />
                  </div>
                  <div className="mt-6 w-full max-w-sm space-y-2 lg:mt-0">
                    {categoryNominal.map((d) => {
                      const pct = totalNominalAll > 0 ? ((Number(d.totalNominal) / totalNominalAll) * 100).toFixed(1) : '0'
                      const c = getCategoryColor(d.category)
                      return (
                        <div
                          key={d.category}
                          className={`flex items-center justify-between rounded-xl border ${c.border} ${c.light} px-4 py-3`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${c.bg}`} />
                            <span className={`text-sm font-semibold ${c.text}`}>{CATEGORY_LABELS[d.category] ?? d.category}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-sm font-bold tabular-nums text-zinc-900">Rp {formatRupiah(d.totalNominal)}</span>
                            <span className="text-xs text-zinc-500">{pct}% dari total</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metode pembayaran */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900">Metode Pembayaran</h2>
                  <p className="text-xs text-zinc-500">Tunai, Transfer, QRIS</p>
                </div>
              </div>
            </div>
            <div className="min-h-[300px] p-6 flex flex-col items-center justify-center">
              {piePaymentData.length === 0 ? (
                <div className="text-center">
                  <div className="mx-auto rounded-full bg-zinc-100 p-4 w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="mt-4 text-sm font-medium text-zinc-600">Belum ada data</p>
                </div>
              ) : (
                <>
                  <PieChart
                    data={piePaymentData}
                    valueKey="value"
                    nameKey="name"
                    size={200}
                    formatValue={(v) => `${v} transaksi`}
                  />
                  <p className="mt-4 text-center text-xs text-zinc-500">
                    Total {paymentSummary.reduce((s, d) => s + Number(d.totalCount || 0), 0)} transaksi
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Jumlah transaksi per kategori - full width below */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm lg:col-span-3">
            <div className="border-b border-zinc-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900">Jumlah Transaksi per Kategori</h2>
                  <p className="text-xs text-zinc-500">Banyak transaksi menurut tipe donasi</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {barCountData.length === 0 ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <p className="text-sm text-zinc-500">Belum ada data</p>
                </div>
              ) : (
                <div className="max-w-2xl">
                  <BarChart
                    data={barCountData}
                    valueKey="value"
                    nameKey="name"
                    formatValue={(v) => `${v} transaksi`}
                    colors={['#7c3aed', '#0284c7', '#d97706', '#059669']}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event summary */}
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900">Ringkasan per Event</h2>
                <p className="text-xs text-zinc-500">Total donasi per acara / lokasi</p>
              </div>
              {eventSummary.length > 0 && (
                <span className="ml-auto rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                  {eventSummary.length} event
                </span>
              )}
            </div>
          </div>
          <div className="p-6">
            {eventSummary.length === 0 ? (
              <div className="flex min-h-[140px] flex-col items-center justify-center text-center">
                <div className="rounded-full bg-zinc-100 p-4 w-fit">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="mt-4 text-sm font-medium text-zinc-600">Belum ada data event</p>
              </div>
            ) : eventSummary.length <= 6 ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {eventSummary.map((row, i) => {
                  const pct = totalNominalAll > 0 ? ((Number(row.totalNominal) / totalNominalAll) * 100).toFixed(0) : '0'
                  return (
                    <div
                      key={i}
                      className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition-all hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-sm"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-emerald-600 shadow-sm">
                        #{i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-zinc-900" title={row.eventName}>{row.eventName}</p>
                        <p className="mt-1 text-xs text-zinc-500">{pct}% dari total donasi</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold tabular-nums text-emerald-700">Rp {formatRupiah(row.totalNominal)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[400px] text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">Event</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-700">Total Nominal</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-700">% Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventSummary.map((row, i) => {
                      const pct = totalNominalAll > 0 ? ((Number(row.totalNominal) / totalNominalAll) * 100).toFixed(1) : '0'
                      return (
                        <tr key={i} className="border-b border-zinc-100 transition-colors hover:bg-zinc-50/70">
                          <td className="px-4 py-3 font-medium text-zinc-500">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-zinc-900">{row.eventName}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-semibold text-zinc-900">Rp {formatRupiah(row.totalNominal)}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-zinc-600">{pct}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
