'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, type SidebarUser } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { getUserFromToken, removeToken } from '@/lib/auth'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<SidebarUser | null>(null)

  useEffect(() => {
    const decoded = getUserFromToken()
    if (!decoded) {
      router.push('/login')
      return
    }
    setUser({
      firstName: decoded.firstName || '',
      lastName: decoded.lastName || '',
      role: decoded.role || 'client',
      avatarUrl: undefined,
    })
  }, [router])

  const handleLogout = () => {
    removeToken()
    router.push('/login')
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          user={user}
          onLogout={handleLogout}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
