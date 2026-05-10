'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageShell } from '@/components/layout/PageShell'
import { ClientDashboard } from '@/components/dashboard/ClientDashboard'
import { SitterDashboard } from '@/components/dashboard/SitterDashboard'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { getUserFromToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const [user, setUser] = useState<{ userId: string; role: string; firstName: string } | null>(null)

  useEffect(() => {
    const decoded = getUserFromToken()
    if (decoded) {
      setUser({ userId: decoded.userId, role: decoded.role, firstName: decoded.firstName })
    }
  }, [])

  if (!user) return null

  return (
    <AppLayout>
      <PageShell
        title={`Welcome back, ${user.firstName}`}
        description="Here's an overview of your account."
      >
        {user.role === 'admin' && <AdminDashboard />}
        {user.role === 'sitter' && <SitterDashboard userId={user.userId} />}
        {user.role === 'client' && <ClientDashboard userId={user.userId} />}
      </PageShell>
    </AppLayout>
  )
}
