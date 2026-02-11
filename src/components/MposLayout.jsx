import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import SidebarContext from '../context/SidebarContext'
import { removeToken } from '../utils/api'

const MENU_ITEMS = [
  { label: 'Transaksi', shortcut: '1', path: '/home' },
  { label: 'Pending', shortcut: '2', path: '/home/pending' },
  { label: 'History', shortcut: '3', path: '/home/history' },
  { label: 'Grafik', shortcut: '4', path: '/home/grafik' },
]

export default function MposLayout() {
  const [sidebarOpen] = useState(true)
  const navigate = useNavigate()

  // Navigasi cepat dengan Alt+1 s/d Alt+4
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const item = MENU_ITEMS.find((m) => m.shortcut === e.key)
      if (item) {
        e.preventDefault()
        navigate(item.path)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  const handleLogout = () => {
    removeToken()
    navigate('/', { replace: true })
  }

  return (
    <SidebarContext.Provider value={{ sidebarOpen }}>
      <div className="flex h-screen bg-zinc-100 text-zinc-900">
        {/* Sidebar */}
        <aside className="flex h-full w-64 flex-col border-r border-zinc-900 bg-[#17191f] text-zinc-50">
          {/* Brand */}
          <div className="flex h-16 items-center gap-3 border-b border-zinc-800/80 px-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-black tracking-tight shadow-lg shadow-emerald-900/60">
              POS
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">
                LAZIS
              </p>
              <p className="text-sm font-semibold text-zinc-50">Terminal Donasi Mitra</p>
            </div>
          </div>

          {/* Menu */}
          <nav className="mt-4 flex-1 space-y-1 px-3">
            {MENU_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/home'}
                className={({ isActive }) =>
                  [
                    'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                      : 'text-zinc-300 hover:bg-zinc-900 hover:text-emerald-100',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center gap-2">
                      <span
                        className={[
                          'inline-block h-1.5 w-1.5 rounded-full',
                          isActive ? 'bg-white' : 'bg-zinc-600',
                        ].join(' ')}
                      />
                      <span>{item.label}</span>
                    </span>
                    <span className="rounded-md border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                      Alt+{item.shortcut}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom area */}
          <div className="border-t border-zinc-900 px-5 py-4 text-xs text-zinc-400">
            <div className="mb-3">
              <p className="truncate text-[11px] text-zinc-400">agen1@gmail.com</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
                Petugas lapangan
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-red-500 hover:bg-red-600/10 hover:text-red-200"
            >
              Keluar
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Routed pages (tanpa header tambahan) */}
          <Outlet />
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

