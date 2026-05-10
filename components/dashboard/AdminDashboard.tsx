'use client'

import { useState } from 'react'
import { Users, UserCheck, Calendar, AlertTriangle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/StatCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useBookings, usePendingUsers, useSitters } from '@/hooks/useData'
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

export function AdminDashboard() {
  const { data: pendingUsers, isLoading: loadingPending, mutate: mutatePending } = usePendingUsers()
  const { data: sitters, isLoading: loadingSitters } = useSitters()
  const { data: bookings, isLoading: loadingBookings } = useBookings('admin', '')

  const pendingList = Array.isArray(pendingUsers) ? pendingUsers : []
  const sitterList = Array.isArray(sitters) ? sitters : []
  const bookingList = Array.isArray(bookings) ? bookings : []
  const activeSitters = sitterList.filter((s: { status: string }) => s.status === 'active')

  // Approve dialog state
  const [approveUser, setApproveUser] = useState<{ _id: string; firstName: string; lastName: string } | null>(null)
  const [approvePassword, setApprovePassword] = useState('')
  const [approving, setApproving] = useState(false)

  // Reject dialog state
  const [rejectUser, setRejectUser] = useState<{ _id: string; firstName: string; lastName: string } | null>(null)
  const [rejecting, setRejecting] = useState(false)

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
        {loadingPending || loadingSitters || loadingBookings ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))
        ) : (
          <>
            <StatCard label="Total Users" value={sitterList.length + pendingList.length} icon={Users} />
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
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBookings ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingList.slice(0, 5).map((b: { _id: string; clientName?: string; serviceType?: string; status: string }) => (
                    <TableRow key={b._id}>
                      <TableCell className="text-sm">{b.clientName || '—'}</TableCell>
                      <TableCell className="text-sm">{b.serviceType || 'Pet Sitting'}</TableCell>
                      <TableCell>
                        <StatusBadge status={b.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
