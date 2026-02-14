import React from 'react'

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'decimal', maximumFractionDigits: 0 }).format(Number(n))
}

export function TodaysCollection({ targetSummary }) {
  const current = Number(targetSummary?.currentTotal ?? 0)
  const target = Number(targetSummary?.target ?? 15000000)
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0
  const changePct = target > 0 ? Math.round((current / target) * 100) : 0

  return (
    <div className="rounded-xl border border-zinc-200 bg-gradient-to-r from-white via-white to-emerald-50/80 px-5 py-4 shadow-sm ring-1 ring-zinc-200/60">
      <div className="flex gap-4">
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-semibold uppercase tracking-wider text-zinc-600">Today&apos;s Collection</span>
          </div>
          <p className="text-xl font-semibold text-zinc-900">Rp {formatRupiah(current)}</p>
          <span className="text-xs text-emerald-600 font-medium">~{changePct}%</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>Target harian</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-xs text-zinc-500">Rp {formatRupiah(target)}</p>
        </div>
      </div>
    </div>
  )
}

const TYPE_COLORS = { zakat: 'bg-emerald-500', infak: 'bg-blue-500', dskl: 'bg-amber-500', campaign: 'bg-violet-500' }

export function TypeDistribution({ categoryNominal }) {
  const list = categoryNominal?.length ? categoryNominal : []

  const getCategoryColor = (category) => {
    const cat = (category || '').toLowerCase()
    if (cat.includes('zakat')) return 'bg-emerald-500'
    if (cat.includes('infak')) return 'bg-blue-500'
    if (cat.includes('dskl') || cat.includes('sedekah')) return 'bg-amber-500'
    if (cat.includes('campaign')) return 'bg-violet-500'
    return 'bg-zinc-400'
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm ring-1 ring-zinc-200/60">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-6 w-1.5 rounded-full bg-emerald-500" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600">Type Distribution</h2>
      </div>
      <ul className="space-y-2.5">
        {list.length === 0 ? (
          <li className="py-3 text-center text-sm text-zinc-400">—</li>
        ) : (
          list.map((d, i) => {
            const category = d.category || d.categoryName || ''
            const totalNominal = Number(d.totalNominal || d.nominal || 0)
            return (
              <li key={d.category || i} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${getCategoryColor(category)}`} />
                  <span className="truncate text-zinc-700">{category}</span>
                </span>
                <span className="shrink-0 font-medium text-zinc-900">
                  Rp {totalNominal >= 1e6 ? `${(totalNominal / 1e6).toFixed(1)}M` : formatRupiah(totalNominal)}
                </span>
              </li>
            )
          })
        )}
      </ul>
      <a href="/home/grafik" className="mt-4 block text-sm text-zinc-500 hover:text-zinc-700">Lihat laporan</a>
    </div>
  )
}

export function OngoingCampaigns({ eventSummary }) {
  const list = eventSummary?.length ? eventSummary.slice(0, 2) : [
    { eventName: 'Pembangunan Sumur Wakaf - NTB', totalNominal: 45e6, target: 100e6 },
    { eventName: 'Emergency Relief: Palestine', totalNominal: 820e6, target: 1e9 },
  ]

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-6 w-1.5 rounded-full bg-emerald-500" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600">Ongoing Campaigns</h2>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">Live</span>
      </div>
      <ul className="space-y-4">
        {list.map((ev, i) => {
          const total = Number(ev.totalNominal ?? 0)
          const target = Number(ev.target ?? (total ? total * 2 : 1)) || 1
          const pct = Math.min(100, (total / target) * 100)
          return (
            <li key={i}>
              <p className="truncate text-sm font-medium text-zinc-800">{ev.eventName}</p>
              <p className="mt-0.5 text-xs text-zinc-500">Rp {(total / 1e6).toFixed(0)}M / {(target / 1e6).toFixed(0)}M</p>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function RecentActivity({ historyContent }) {
  const items = historyContent?.slice(0, 3) || []

  const getCategoryColor = (kategoriType) => {
    const category = (kategoriType || '').toLowerCase()
    switch (category) {
      case 'campaign':
        return 'bg-violet-100 border-violet-600'
      case 'infak':
        return 'bg-blue-100 border-blue-600'
      case 'zakat':
        return 'bg-emerald-100 border-emerald-600'
      case 'dskl':
        return 'bg-amber-100 border-amber-600'
      default:
        return 'bg-zinc-100 border-zinc-600'
    }
  }

  const getCategoryIconColor = (kategoriType) => {
    const category = (kategoriType || '').toLowerCase()
    switch (category) {
      case 'campaign':
        return 'text-violet-600'
      case 'infak':
        return 'text-blue-600'
      case 'zakat':
        return 'text-emerald-600'
      case 'dskl':
        return 'text-amber-600'
      default:
        return 'text-zinc-600'
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm ring-1 ring-zinc-200/60">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-6 w-1.5 rounded-full bg-emerald-500" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600">Recent Activity</h2>
      </div>
      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="py-3 text-center text-sm text-zinc-400">—</li>
        ) : (
          items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${getCategoryColor(item.kategoriType)}`}>
                {item.type === 'donor' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${getCategoryIconColor(item.kategoriType)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-800 leading-tight">
                  {item.type === 'donor' ? 'Donatur baru' : `${item.kategori || 'Donasi'} · Rp ${formatRupiah(item.nominal || 0)}`}
                </p>
                <p className="text-xs text-zinc-500 mt-1">{item.nama} · {item.waktu || 'recent'}</p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
