import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { printReceipt } from '../utils/printReceipt'
import { getTempTransactions, validateTempTransaction } from '../redux/actions/posActions'

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

export default function PendingPage() {
  const dispatch = useDispatch()
  const { tempTransactions, loadingTemp, validating } = useSelector((state) => state.pos)
  const { user } = useSelector((state) => state.auth)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    dispatch(getTempTransactions())
  }, [dispatch])

  const handleValidate = async (nomorBukti) => {
    setMessage({ type: '', text: '' })
    const result = await dispatch(validateTempTransaction(nomorBukti))
    if (result.success) {
      setMessage({ type: 'success', text: 'Transaksi berhasil divalidasi dan masuk ke history.' })
      dispatch(getTempTransactions())
    } else {
      setMessage({ type: 'error', text: result.error || 'Validasi gagal' })
    }
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-zinc-50 pt-6">
      <div className="mx-auto w-full pr-[8%] pl-[4%]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Transaksi Pending</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Transaksi yang belum divalidasi — cetak struk lalu validasi untuk masuk ke history
          </p>
        </div>

        {message.text && (
          <div
            role="alert"
            className={`mb-6 rounded-xl border px-5 py-4 text-sm shadow-sm ${
              message.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {loadingTemp ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-zinc-200 bg-white py-12">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-emerald-600"></div>
              <p className="mt-4 text-sm text-zinc-500">Memuat data transaksi pending...</p>
            </div>
          </div>
        ) : tempTransactions.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-zinc-600">Tidak ada transaksi pending</p>
            <p className="text-xs text-zinc-400">Transaksi baru akan muncul di sini setelah dicatat di halaman Transaksi</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 rounded-full bg-amber-500"></div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-700">
                  {tempTransactions.length} Transaksi Pending
                </h3>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tempTransactions.map((row) => (
                <div
                  key={row.id}
                  className="group rounded-xl border-2 border-amber-200 bg-white p-5 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
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

                  <div className="space-y-2">
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
                    <button
                      type="button"
                      onClick={() => handleValidate(row.nomorBukti)}
                      disabled={validating === row.nomorBukti}
                      className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition hover:shadow-emerald-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
                    >
                      {validating === row.nomorBukti ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Memproses...
                        </span>
                      ) : (
                        'Validasi Transaksi'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
