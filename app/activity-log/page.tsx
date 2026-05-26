'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Activity, Calendar, FileText, PawPrint, Shield, User, Bell } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageShell } from '@/components/layout/PageShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { getUserFromToken } from '@/lib/auth'
import api from '@/lib/api'

type ActivityLogItem = {
  _id: string
  userId?: {
    _id: string
    firstName?: string
    lastName?: string
    email?: string
    role?: string
  }
  action: string
  category: string
  description: string
  metadata?: Record<string, any>
  isRead: boolean
  createdAt: string
}

const categoryIconMap: Record<string, React.ReactNode> = {
  booking: <Calendar className="h-4 w-4" />,
  pet: <PawPrint className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
  invoice: <FileText className="h-4 w-4" />,
  report: <FileText className="h-4 w-4" />,
  auth: <Shield className="h-4 w-4" />,
  profile: <User className="h-4 w-4" />,
  system: <Bell className="h-4 w-4" />,
}

const categoryColorMap: Record<string, string> = {
  booking: 'bg-blue-100 text-blue-800 border-blue-200',
  pet: 'bg-amber-100 text-amber-800 border-amber-200',
  user: 'bg-green-100 text-green-800 border-green-200',
  invoice: 'bg-purple-100 text-purple-800 border-purple-200',
  report: 'bg-orange-100 text-orange-800 border-orange-200',
  auth: 'bg-red-100 text-red-800 border-red-200',
  profile: 'bg-teal-100 text-teal-800 border-teal-200',
  system: 'bg-gray-100 text-gray-800 border-gray-200',
}

export default function ActivityLogPage() {
  const [role, setRole] = useState<string>('client')
  const [logs, setLogs] = useState<ActivityLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const limit = 20

  const fetchLogs = async (nextPage = 1) => {
    try {
      setLoading(true)
      const decoded = getUserFromToken()
      const currentRole = decoded?.role || 'client'
      setRole(currentRole)

      const endpoint = currentRole === 'admin'
        ? `/activity-log?page=${nextPage}&limit=${limit}`
        : `/activity-log/my?page=${nextPage}&limit=${limit}`

      const { data } = await api.get(endpoint)
      setLogs(data.logs || [])
      setTotal(data.total || 0)
      setPage(nextPage)
    } catch {
      setLogs([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs(1)
  }, [])

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase()

    return logs.filter((log) => {
      const categoryMatch = category === 'all' || log.category === category

      if (!q) {
        return categoryMatch
      }

      const userName = `${log.userId?.firstName || ''} ${log.userId?.lastName || ''}`.trim().toLowerCase()
      const textMatch =
        log.action.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        userName.includes(q) ||
        (log.userId?.email || '').toLowerCase().includes(q)

      return categoryMatch && textMatch
    })
  }, [logs, category, search])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <AppLayout>
      <PageShell
        title="Activity Log"
        description={
          role === 'admin'
            ? 'Monitor system-wide activity across users, bookings, and operations.'
            : 'Track your account and booking activity in one place.'
        }
        action={
          <Button variant="outline" size="sm" onClick={() => fetchLogs(page)}>
            Refresh
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Visible Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{filteredLogs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Your Role</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="capitalize">{role}</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 grid gap-3 md:grid-cols-[220px_1fr]">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="pet">Pet</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="profile">Profile</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search action, description, user name or email"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="rounded-lg border border-dashed p-10 text-center">
                <Activity className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No activity found</p>
                <p className="text-xs text-muted-foreground mt-1">Try changing filters or perform actions to generate logs.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div key={log._id} className="rounded-lg border p-4 transition-colors hover:bg-muted/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full border p-2">
                          {categoryIconMap[log.category] || <Bell className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold">{log.action}</p>
                            <Badge
                              variant="outline"
                              className={`capitalize ${categoryColorMap[log.category] || categoryColorMap.system}`}
                            >
                              {log.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                          {role === 'admin' && log.userId && (
                            <p className="text-xs text-muted-foreground mt-1">
                              by {`${log.userId.firstName || ''} ${log.userId.lastName || ''}`.trim() || log.userId.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1 || loading}
                  onClick={() => fetchLogs(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages || loading}
                  onClick={() => fetchLogs(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageShell>
    </AppLayout>
  )
}
