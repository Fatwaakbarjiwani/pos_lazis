import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { printReceipt } from '../utils/printReceipt'
import { getTempTransactions, validateTempTransaction } from '../redux/actions/posActions'

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'decimal', maximumFractionDigits: 0 }).format(Number(n))
}

export default function PendingPage() {
  const dispatch = useDispatch()
  const { tempTransactions, loadingTemp, validating } = useSelector((state) => state.pos)
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
    <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-zinc-100 pb-6 pt-6">
      <div className="mx-auto w-full px-[2%]">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-900">Transaksi Pending</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Transaksi yang belum divalidasi — cetak struk lalu validasi untuk masuk ke history
          </p>
        </div>

        {message.text && (
          <div
            role="alert"
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            {loadingTemp ? (
              <div className="flex min-h-[280px] items-center justify-center py-12 text-sm text-zinc-500">
                Memuat…
              </div>
            ) : tempTransactions.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 py-12 text-center">
                <p className="text-sm text-zinc-500">Tidak ada transaksi pending</p>
                <p className="text-xs text-zinc-400">Transaksi baru akan muncul di sini setelah dicatat di halaman Transaksi</p>
              </div>
            ) : (
              <>
                <div className="border-b border-zinc-200 bg-zinc-50/80 px-4 py-2.5">
                  <p className="text-xs font-medium text-zinc-600">
                    {tempTransactions.length} transaksi pending
                  </p>
                </div>
                <table className="w-full min-w-[800px] text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50">
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        No. Bukti
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Tanggal
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Nama
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Kategori
                      </th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Nominal
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Bayar
                      </th>
                      <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tempTransactions.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-zinc-100 transition-colors hover:bg-zinc-50/70"
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-800">
                          {row.nomorBukti}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-zinc-600">{row.tanggal}</td>
                        <td className="px-4 py-3 text-zinc-800">{row.nama}</td>
                        <td className="max-w-[220px] px-4 py-3 text-zinc-600">
                          {row.kategori}
                          {row.subKategori ? ` — ${row.subKategori}` : ''}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-zinc-800">
                          Rp {formatRupiah(row.nominal)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 capitalize text-zinc-600">
                          {row.metodePembayaran}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex flex-col items-stretch gap-2.5">
                            <div className="flex rounded-lg border border-zinc-200 bg-zinc-50/50 p-0.5">
                              <button
                                type="button"
                                onClick={() => printReceipt(row, 'thermal')}
                                className="flex-1 rounded-md px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-white hover:text-zinc-900 hover:shadow-sm"
                              >
                                Thermal
                              </button>
                              <button
                                type="button"
                                onClick={() => printReceipt(row, 'normal')}
                                className="flex-1 rounded-md px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-white hover:text-zinc-900 hover:shadow-sm"
                              >
                                Biasa
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleValidate(row.nomorBukti)}
                              disabled={validating === row.nomorBukti}
                              className="rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                            >
                              {validating === row.nomorBukti ? 'Memproses…' : 'Validasi'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
