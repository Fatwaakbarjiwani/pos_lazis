import React, { createContext, useContext } from 'react'

const SidebarContext = createContext({ sidebarOpen: true })

export function useSidebar() {
  return useContext(SidebarContext)
}

/** Sidebar width in pixels when open (w-64 = 16rem = 256px) and when closed (w-20 = 80px) */
export function useSidebarWidth() {
  const { sidebarOpen } = useSidebar()
  return sidebarOpen ? 256 : 80 
}

export default SidebarContext
