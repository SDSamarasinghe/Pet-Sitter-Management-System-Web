'use client'

import { useState, useMemo } from 'react'
import { Users, UserCheck, Calendar, AlertTriangle, Loader2, ChevronUp, ChevronDown, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/StatCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useBookings, usePendingUsers, useSitters, useClients } from '@/hooks/useData'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import api from '@/lib/api'
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'

export function AdminDashboard() {
  const { data: pendingUsers, isLoading: loadingPending, mutate: mutatePending } = usePendingUsers()
  const { data: sitters, isLoading: loadingSitters } = useSitters()
  const { data: clients, isLoading: loadingClients } = useClients()
  const { data: bookings, isLoading: loadingBookings } = useBookings('admin', '')

  const pendingList = Array.isArray(pendingUsers) ? pendingUsers : []
  const sitterList = Array.isArray(sitters) ? sitters : []
  const clientList = Array.isArray(clients) ? clients : []
  const bookingList = Array.isArray(bookings) ? bookings : []
  const activeSitters = sitterList.filter((s: { status: string }) => s.status === 'active')
  const totalUsers = sitterList.length + clientList.length

  // Approve dialog state
  const [approveUser, setApproveUser] = useState<{ _id: string; firstName: string; lastName: string } | null>(null)
  const [approvePassword, setApprovePassword] = useState('')
  const [approving, setApproving] = useState(false)

  // Reject dialog state
  const [rejectUser, setRejectUser] = useState<{ _id: string; firstName: string; lastName: string } | null>(null)
  const [rejecting, setRejecting] = useState(false)

  // Date filter state for bookings
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filter and sort bookings by date
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookingList

    // Apply date range filter if dates are set
    if (fromDate || toDate) {
      filtered = filtered.filter((b: any) => {
        const bookingDate = b.startDate ? parseISO(b.startDate) : null
        if (!bookingDate) return false

        if (fromDate && toDate) {
          const from = startOfDay(parseISO(fromDate))
          const to = endOfDay(parseISO(toDate))
          return isWithinInterval(bookingDate, { start: from, end: to })
        } else if (fromDate) {
          const from = startOfDay(parseISO(fromDate))
          return bookingDate >= from
        } else if (toDate) {
          const to = endOfDay(parseISO(toDate))
          return bookingDate <= to
        }
        return true
      })
    }

    // Sort by booking date
    const sorted = [...filtered].sort((a: any, b: any) => {
      const dateA = a.startDate ? parseISO(a.startDate).getTime() : 0
      const dateB = b.startDate ? parseISO(b.startDate).getTime() : 0
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    return sorted
  }, [bookingList, fromDate, toDate, sortOrder])

  const handleApprove = async () => {
    if (!approveUser || !approvePassword) return
    setApproving(true)
    try {
      await api.put(`/users/${approveUser._id}/approve`, {
        password: approvePassword,
        confirmPassword: approvePassword,
      })
      toast.success(`${approveUser.firstName} approved`)
      setApproveUser(null)
      setApprovePassword('')
      mutatePending()
    } catch {
      toast.error('Approval failed')
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectUser) return
    setRejecting(true)
    try {
      await api.put(`/users/${rejectUser._id}/reject`)
      toast.success(`${rejectUser.firstName} rejected`)
      setRejectUser(null)
      mutatePending()
    } catch {
      toast.error('Rejection failed')
    } finally {
      setRejecting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingPending || loadingSitters || loadingClients || loadingBookings ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))
        ) : (
          <>
            <StatCard label="Total Users" value={totalUsers} icon={Users} />
            <StatCard label="Active Sitters" value={activeSitters.length} icon={UserCheck} variant="success" />
            <StatCard label="Bookings This Month" value={bookingList.length} icon={Calendar} />
            <StatCard label="Pending Approvals" value={pendingList.length} icon={AlertTriangle} variant="warning" />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Approvals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPending ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : pendingList.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No pending approvals</p>
            ) : (
              <div className="space-y-3">
                {pendingList.map((u: { _id: string; firstName: string; lastName: string; email: string; role: string }) => (
                  <div key={u._id} className="flex items-center gap-3 rounded-lg border p-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{u.firstName} {u.lastName}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="default" onClick={() => setApproveUser(u)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setRejectUser(u)}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Filter Controls */}
            <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">From Date</label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">To Date</label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Sort and Reset Controls */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={sortOrder === 'desc' ? 'default' : 'outline'}
                  onClick={() => setSortOrder('desc')}
                  className="flex-1 h-8 text-xs gap-1"
                >
                  <ChevronDown className="h-3 w-3" />
                  Newest First
                </Button>
                <Button
                  size="sm"
                  variant={sortOrder === 'asc' ? 'default' : 'outline'}
                  onClick={() => setSortOrder('asc')}
                  className="flex-1 h-8 text-xs gap-1"
                >
                  <ChevronUp className="h-3 w-3" />
                  Oldest First
                </Button>
                {(fromDate || toDate) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setFromDate(''); setToDate('') }}
                    className="h-8 text-xs gap-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Bookings Table */}
            {loadingBookings ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : filteredAndSortedBookings.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {fromDate || toDate ? 'No bookings found for the selected dates' : 'No bookings available'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs">Service</TableHead>
                      <TableHead className="text-xs">Start Date</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedBookings.slice(0, 8).map((b: any) => (
                      <TableRow key={b._id} className="text-xs">
                        <TableCell className="text-xs">
                          {b.clientName || `${b.userId?.firstName || ''} ${b.userId?.lastName || ''}`.trim() || '—'}
                        </TableCell>
                        <TableCell className="text-xs">{b.serviceType || 'Pet Sitting'}</TableCell>
                        <TableCell className="text-xs">
                          {b.startDate ? format(parseISO(b.startDate), 'MMM dd, yyyy') : '—'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={b.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Summary */}
            {!loadingBookings && filteredAndSortedBookings.length > 0 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                Showing {Math.min(8, filteredAndSortedBookings.length)} of {filteredAndSortedBookings.length} bookings
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approve Dialog */}
      <Dialog open={!!approveUser} onOpenChange={() => { setApproveUser(null); setApprovePassword(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve {approveUser?.firstName} {approveUser?.lastName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set an initial password for this user.
            </p>
            <Input
              type="password"
              placeholder="Initial password"
              value={approvePassword}
              onChange={(e) => setApprovePassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveUser(null)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={!approvePassword || approving}>
              {approving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <ConfirmDialog
        open={!!rejectUser}
        onOpenChange={() => setRejectUser(null)}
        title={`Reject ${rejectUser?.firstName} ${rejectUser?.lastName}?`}
        description="This user will be notified that their application was rejected."
        onConfirm={handleReject}
        confirmLabel="Reject"
        loading={rejecting}
      />
    </div>
  )
}
