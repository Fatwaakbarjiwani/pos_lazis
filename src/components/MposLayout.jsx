import React, { useEffect, useState, useRef } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import SidebarContext from '../context/SidebarContext'
import { removeToken } from '../utils/api'
import { useSelector, useDispatch } from 'react-redux'
import { getTempTransactions } from '../redux/actions/posActions'

const MENU_ITEMS = [
  { label: 'HOME', path: '/home', icon: 'home' },
  { label: 'HISTORY', path: '/home/history', icon: 'history' },
  { label: 'REPORTS', path: '/home/grafik', icon: 'reports' },
  { label: 'ADMIN', path: '/home/pending', icon: 'admin' },
]

function IconHome({ active }) {
  const c = active ? 'text-emerald-600' : 'text-white'
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${c}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}
function IconHistory({ active }) {
  const c = active ? 'text-emerald-600' : 'text-white'
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${c}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function IconReports({ active }) {
  const c = active ? 'text-emerald-600' : 'text-white'
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${c}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
function IconAdmin({ active }) {
  const c = active ? 'text-emerald-600' : 'text-white'
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${c}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function MenuIcon({ icon, active }) {
  switch (icon) {
    case 'home': return <IconHome active={active} />
    case 'history': return <IconHistory active={active} />
    case 'reports': return <IconReports active={active} />
    case 'admin': return <IconAdmin active={active} />
    default: return null
  }
}

export default function MposLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { tempTransactions } = useSelector((state) => state.pos)
  const notificationRef = useRef(null)
  const sidebarRef = useRef(null)

  useEffect(() => {
    dispatch(getTempTransactions())
  }, [dispatch])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false)
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && sidebarOpen) {
        const menuButton = document.querySelector('[data-mobile-menu-button]')
        if (menuButton && !menuButton.contains(event.target)) {
          setSidebarOpen(false)
        }
      }
    }
    if (notificationOpen || sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [notificationOpen, sidebarOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const map = { '1': '/home', '2': '/home/history', '3': '/home/grafik', '4': '/home/pending' }
      const path = map[e.key]
      if (path) {
        e.preventDefault()
        navigate(path)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  const handleLogout = () => {
    removeToken()
    navigate('/', { replace: true })
  }

  const handleNotificationClick = () => {
    setNotificationOpen(!notificationOpen)
  }

  const handleGoToPending = () => {
    setNotificationOpen(false)
    navigate('/home/pending')
  }

  const userDisplayName = user?.email || user?.name || 'AGEN1@GMAIL.COM'
  const pendingCount = tempTransactions?.length || 0

  return (
    <SidebarContext.Provider value={{ sidebarOpen: true }}>
      <div className="flex h-screen flex-col bg-zinc-50 text-zinc-900">
        <header className="sticky top-0 z-30 w-full border-b border-zinc-200 bg-white">
          <div className="mx-auto flex items-center justify-between px-4 sm:px-[8%] py-2 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                data-mobile-menu-button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="sm:hidden rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="relative">
                <div className="relative flex h-8 w-8 sm:h-8 sm:w-8 items-center justify-center overflow-hidden rounded-full border-[3px] border-emerald-500 bg-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs font-medium leading-tight text-zinc-500">Assalamu&apos;alaikum,</span>
                <span className="text-xs sm:text-sm font-bold uppercase leading-tight tracking-tight text-zinc-900 truncate max-w-[120px] sm:max-w-none">{userDisplayName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button className="hidden sm:flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm transition hover:bg-zinc-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-tight text-zinc-800">LAZIS SULTAN AGUNG</span>
              </button>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative" ref={notificationRef}>
                  <button
                    type="button"
                    onClick={handleNotificationClick}
                    className="relative rounded-full p-1.5 sm:p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {pendingCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-3.5 sm:h-4 min-w-3.5 sm:min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 sm:px-1 text-[9px] sm:text-[10px] font-bold leading-none text-white">
                        {pendingCount > 9 ? '9+' : pendingCount}
                      </span>
                    )}
                  </button>
                  {notificationOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-xl border border-zinc-200 bg-white shadow-lg">
                      <div className="border-b border-zinc-100 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-zinc-900">Notifikasi</h3>
                          {pendingCount > 0 && (
                            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                              {pendingCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {pendingCount === 0 ? (
                          <div className="px-4 py-8 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="mt-2 text-sm text-zinc-500">Tidak ada notifikasi</p>
                          </div>
                        ) : (
                          <div className="p-2">
                            <button
                              type="button"
                              onClick={handleGoToPending}
                              className="w-full rounded-lg border-2 border-amber-200 bg-amber-50 p-4 text-left transition hover:bg-amber-100"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-zinc-900">
                                    {pendingCount} Transaksi Pending
                                  </p>
                                  <p className="mt-1 text-xs text-zinc-600">
                                    Ada {pendingCount} transaksi yang perlu divalidasi
                                  </p>
                                  <p className="mt-2 text-xs font-semibold text-amber-700">
                                    Klik untuk melihat detail →
                                  </p>
                                </div>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                      {pendingCount > 0 && (
                        <div className="border-t border-zinc-100 px-4 py-3">
                          <button
                            type="button"
                            onClick={handleGoToPending}
                            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                          >
                            Lihat Semua Pending
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>



        <div className="flex min-h-0 flex-1 relative">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 bg-black/50 sm:hidden" onClick={() => setSidebarOpen(false)} />
          )}
          
          {/* Sidebar */}
          <div
            ref={sidebarRef}
            className={`fixed sm:relative inset-y-0 left-0 z-50 sm:z-auto w-[40%] sm:w-20 transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
            }`}
          >
            <div className="flex h-full w-full items-center justify-center py-8 pl-2 sm:justify-center">
              <aside className="flex w-full sm:w-auto flex-col rounded-r-3xl bg-zinc-800 py-4 shadow-lg">
              <nav className="flex flex-col items-start sm:items-center gap-1 px-2 sm:px-2">
                {MENU_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/home'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      [
                        'relative flex w-full px-3 sm:px-1 sm:flex-col items-center gap-3 sm:gap-1.5 rounded-r-xl py-2.5 sm:text-center transition-all',
                        isActive
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'text-white hover:bg-zinc-700',
                      ].join(' ')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />
                        )}
                        <MenuIcon icon={item.icon} active={isActive} />
                        <span className="text-sm sm:text-[10px] font-medium uppercase tracking-wide">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-4 border-t border-zinc-700 pt-3 px-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full flex-row sm:flex-col items-center justify-start sm:justify-center gap-3 sm:gap-1.5 rounded-xl py-2.5 text-white hover:bg-zinc-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm sm:text-[10px] font-medium">Keluar</span>
                </button>
              </div>
            </aside>
            </div>
          </div>

          <div className="min-h-0 min-w-0 flex-1 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}