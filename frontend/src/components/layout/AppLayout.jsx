import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

/**
 * Main app shell — sidebar + content area with CRT overlay effect.
 */
export default function AppLayout() {
  return (
    <div className="flex min-h-screen crt-overlay">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 bg-rpg-bg">
        <Outlet />
      </main>
    </div>
  )
}
