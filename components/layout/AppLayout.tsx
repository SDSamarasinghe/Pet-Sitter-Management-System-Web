'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, type SidebarUser } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { getUserFromToken, removeToken } from '@/lib/auth'
import { useProfile } from '@/hooks/useData'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<SidebarUser | null>(null)
  const { data: profileData } = useProfile()

  useEffect(() => {
    const decoded = getUserFromToken()
    if (!decoded) {
      router.push('/')
      return
    }
    setUser({
      firstName: decoded.firstName || '',
      lastName: decoded.lastName || '',
      role: decoded.role || 'client',
      avatarUrl: decoded.avatarUrl,
    })
  }, [router])

  // Update avatar from profile data when available
  useEffect(() => {
    if (profileData?.profilePicture) {
      setUser((current) => (current ? { ...current, avatarUrl: profileData.profilePicture } : current))
    }
  }, [profileData?.profilePicture])

  useEffect(() => {
    const handleProfilePictureUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ avatarUrl?: string }>
      setUser((current) => (current ? { ...current, avatarUrl: customEvent.detail?.avatarUrl } : current))
    }

    window.addEventListener('profile-picture-updated', handleProfilePictureUpdate)
    return () => {
      window.removeEventListener('profile-picture-updated', handleProfilePictureUpdate)
    }
  }, [])

  const handleLogout = () => {
    removeToken()
    router.push('/')
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
