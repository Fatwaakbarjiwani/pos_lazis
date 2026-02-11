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

export default function GrafikPage() {
  const dispatch = useDispatch()
  const { dashboard, loadingDashboard, errorDashboard } = useSelector((state) => state.pos)

  useEffect(() => {
    dispatch(getDashboard())
  }, [dispatch])

  if (loadingDashboard) {
    return (
      <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-zinc-50 pt-6">
        <div className="mx-auto w-full pr-[8%] pl-[4%]">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900">Grafik & Diagram</h1>
            <p className="mt-2 text-sm text-zinc-500">Ringkasan donasi dan statistik</p>
          </div>
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-zinc-200 bg-white py-12">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-emerald-600"></div>
              <p className="mt-4 text-sm text-zinc-500">Memuat data grafik...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (errorDashboard) {
    return (
      <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-zinc-50 pt-6">
        <div className="mx-auto w-full pr-[8%] pl-[4%]">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900">Grafik & Diagram</h1>
            <p className="mt-2 text-sm text-zinc-500">Ringkasan donasi dan statistik</p>
          </div>
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
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
  const targetPct = Number(targetSummary?.percentage ?? 0)

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-zinc-50 pt-6">
      <div className="mx-auto w-full pr-[8%] pl-[4%]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Grafik & Diagram</h1>
          <p className="mt-2 text-sm text-zinc-500">Ringkasan donasi dan statistik</p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Donasi</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-zinc-900">Rp {formatRupiah(totalNominalAll)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Transaksi</p>
                <p className="mt-1 text-xl font-bold text-zinc-900">{totalTransaksiAll}</p>
              </div>
            </div>
          </div>
        </div>

        {targetSummary && (
          <div className="mb-6 overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-9 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600" />
              <h2 className="text-lg font-bold text-zinc-900">Pencapaian Target</h2>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-2xl font-bold text-white shadow-md">
                  {targetPct.toFixed(0)}%
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-700">Total terkumpul</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-zinc-900">
                    Rp {formatRupiah(targetSummary.currentTotal)}
                    <span className="ml-2 text-sm font-normal text-zinc-500">
                      / Rp {formatRupiah(targetSummary.target)}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex-1 sm:max-w-xs">
                <div className="h-3 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-700"
                    style={{ width: `${Math.min(100, targetPct)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-semibold text-emerald-700">
                  {targetPct.toFixed(1)}% tercapai
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1 rounded-full bg-emerald-500"></div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">Nominal per Kategori</h2>
                  <p className="mt-0.5 text-xs text-zinc-500">Distribusi donasi per tipe</p>
                </div>
              </div>
            </div>
            <div className="min-h-[280px] p-5 flex flex-col items-center justify-center">
              {pieNominalData.length === 0 ? (
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="mt-2 text-sm text-zinc-500">Belum ada data</p>
                </div>
              ) : (
                <>
                  <PieChart
                    data={pieNominalData}
                    valueKey="value"
                    nameKey="name"
                    size={200}
                    formatValue={(v) => `Rp ${formatRupiah(v)}`}
                  />
                  <div className="mt-5 grid w-full max-w-xs grid-cols-1 gap-2">
                    {categoryNominal.map((d) => {
                      const pct = totalNominalAll > 0 ? ((Number(d.totalNominal) / totalNominalAll) * 100).toFixed(1) : '0'
                      return (
                        <div key={d.category} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${getCategoryColor(d.category)}`}>
                          <span className="font-semibold">{CATEGORY_LABELS[d.category] ?? d.category}</span>
                          <span className="tabular-nums font-medium">
                            Rp {formatRupiah(d.totalNominal)} <span className="opacity-70">({pct}%)</span>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1 rounded-full bg-blue-500"></div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">Jumlah Transaksi per Kategori</h2>
                  <p className="mt-0.5 text-xs text-zinc-500">Banyak transaksi per tipe</p>
                </div>
              </div>
            </div>
            <div className="min-h-[280px] p-5">
              {barCountData.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="mt-2 text-sm text-zinc-500">Belum ada data</p>
                  </div>
                </div>
              ) : (
                <BarChart
                  data={barCountData}
                  valueKey="value"
                  nameKey="name"
                  formatValue={(v) => `${v} transaksi`}
                  colors={['#7c3aed', '#0284c7', '#d97706', '#059669']}
                />
              )}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm sm:col-span-2 xl:col-span-1">
            <div className="border-b border-zinc-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1 rounded-full bg-violet-500"></div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">Metode Pembayaran</h2>
                  <p className="mt-0.5 text-xs text-zinc-500">Tunai, transfer, QRIS</p>
                </div>
              </div>
            </div>
            <div className="min-h-[280px] p-5 flex flex-col items-center justify-center">
              {piePaymentData.length === 0 ? (
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-zinc-500">Belum ada data</p>
                </div>
              ) : (
                <PieChart
                  data={piePaymentData}
                  valueKey="value"
                  nameKey="name"
                  size={180}
                  formatValue={(v) => `${v} transaksi`}
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-amber-500"></div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900">Ringkasan per Event</h2>
                <p className="mt-0.5 text-xs text-zinc-500">Total donasi per acara</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            {eventSummary.length === 0 ? (
              <div className="flex min-h-[120px] items-center justify-center">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-zinc-500">Belum ada data event</p>
                </div>
              </div>
            ) : eventSummary.length <= 4 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {eventSummary.map((row, i) => (
                  <div
                    key={i}
                    className="group rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-md"
                  >
                    <p className="truncate text-sm font-semibold text-zinc-900" title={row.eventName}>{row.eventName}</p>
                    <p className="mt-2 text-base font-bold tabular-nums text-emerald-700">
                      Rp {formatRupiah(row.totalNominal)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[300px] text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700">Event</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-700">Total Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventSummary.map((row, i) => (
                      <tr key={i} className="border-b border-zinc-100 transition-colors hover:bg-zinc-50/70">
                        <td className="px-4 py-3 text-zinc-900">{row.eventName}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold text-zinc-900">
                          Rp {formatRupiah(row.totalNominal)}
                        </td>
                      </tr>
                    ))}
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
