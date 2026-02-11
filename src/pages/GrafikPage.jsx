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

export default function GrafikPage() {
  const dispatch = useDispatch()
  const { dashboard, loadingDashboard, errorDashboard } = useSelector((state) => state.pos)

  useEffect(() => {
    dispatch(getDashboard())
  }, [dispatch])

  if (loadingDashboard) {
    return (
      <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-zinc-100 pb-6 pt-6">
        <div className="mx-auto w-full px-[2%]">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-zinc-900">Grafik & Diagram</h1>
            <p className="mt-1 text-sm text-zinc-500">Ringkasan donasi dan statistik</p>
          </div>
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-zinc-500">Memuat data…</p>
          </div>
        </div>
      </main>
    )
  }

  if (errorDashboard) {
    return (
      <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-zinc-100 pb-6 pt-6">
        <div className="mx-auto w-full px-[2%]">
          <div className="mb-5">
            <h1 className="mb-1 font-mono text-xl font-bold text-zinc-900">Grafik & Diagram</h1>
          </div>
          <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 font-mono text-sm text-red-700 shadow-sm">
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
    <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-zinc-100 pb-6 pt-6">
      <div className="mx-auto w-full px-[2%]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">Grafik & Diagram</h1>
            <p className="mt-1 text-sm text-zinc-500">Ringkasan donasi dan statistik</p>
          </div>
          <div className="flex flex-wrap gap-4 font-mono text-sm">
            <div className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 shadow-sm">
              <span className="text-zinc-500">Total donasi</span>
              <p className="mt-0.5 font-semibold text-zinc-900">Rp {formatRupiah(totalNominalAll)}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 shadow-sm">
              <span className="text-zinc-500">Total transaksi</span>
              <p className="mt-0.5 font-semibold text-zinc-900">{totalTransaksiAll}</p>
            </div>
          </div>
        </div>

        {/* Target - hero card */}
        {targetSummary && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-xl font-bold text-white shadow-md">
                  {targetPct.toFixed(0)}%
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-700">Pencapaian target</h2>
                  <p className="mt-0.5 font-mono text-lg font-bold text-zinc-900">
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
                <p className="mt-2 text-xs font-medium text-emerald-700">
                  {targetPct.toFixed(1)}% tercapai
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {/* Nominal per Kategori */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-zinc-800">Nominal per kategori</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Distribusi donasi per tipe</p>
            </div>
            <div className="min-h-[240px] p-5 flex flex-col items-center justify-center">
              {pieNominalData.length === 0 ? (
                <p className="text-sm text-zinc-500">Belum ada data</p>
              ) : (
                <>
                  <PieChart
                    data={pieNominalData}
                    valueKey="value"
                    nameKey="name"
                    size={200}
                    formatValue={(v) => `Rp ${formatRupiah(v)}`}
                  />
                  <div className="mt-4 grid w-full max-w-xs grid-cols-1 gap-2 text-xs font-mono">
                    {categoryNominal.map((d) => {
                      const pct = totalNominalAll > 0 ? ((Number(d.totalNominal) / totalNominalAll) * 100).toFixed(1) : '0'
                      return (
                        <div key={d.category} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
                          <span className="text-zinc-700">{CATEGORY_LABELS[d.category] ?? d.category}</span>
                          <span className="tabular-nums text-zinc-600">
                            Rp {formatRupiah(d.totalNominal)} <span className="text-zinc-400">({pct}%)</span>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Jumlah Transaksi per Kategori */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-zinc-800">Jumlah transaksi per kategori</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Banyak transaksi per tipe</p>
            </div>
            <div className="min-h-[240px] p-5">
              {barCountData.length === 0 ? (
                <p className="text-sm text-zinc-500">Belum ada data</p>
              ) : (
                <BarChart
                  data={barCountData}
                  valueKey="value"
                  nameKey="name"
                  formatValue={(v) => `${v} transaksi`}
                  colors={['#059669', '#0284c7', '#d97706', '#7c3aed']}
                />
              )}
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm sm:col-span-2 xl:col-span-1">
            <div className="border-b border-zinc-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-zinc-800">Metode pembayaran</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Tunai, transfer, QRIS</p>
            </div>
            <div className="min-h-[240px] p-5 flex flex-col items-center justify-center">
              {piePaymentData.length === 0 ? (
                <p className="text-sm text-zinc-500">Belum ada data</p>
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

        {/* Ringkasan per Event - card grid jika sedikit, table jika banyak */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-zinc-800">Ringkasan per event</h2>
            <p className="mt-0.5 text-xs text-zinc-500">Total donasi per acara</p>
          </div>
          <div className="p-5">
            {eventSummary.length === 0 ? (
              <p className="text-sm text-zinc-500">Belum ada data event</p>
            ) : eventSummary.length <= 4 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {eventSummary.map((row, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/50"
                  >
                    <p className="truncate font-medium text-zinc-900" title={row.eventName}>{row.eventName}</p>
                    <p className="mt-2 font-mono text-sm font-semibold text-emerald-700">
                      Rp {formatRupiah(row.totalNominal)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[300px] font-mono text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left">
                      <th className="pb-2 font-semibold text-zinc-600">Event</th>
                      <th className="pb-2 text-right font-semibold text-zinc-600">Total nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventSummary.map((row, i) => (
                      <tr key={i} className="border-b border-zinc-100">
                        <td className="py-2.5 text-zinc-800">{row.eventName}</td>
                        <td className="py-2.5 text-right tabular-nums font-medium text-zinc-800">
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
