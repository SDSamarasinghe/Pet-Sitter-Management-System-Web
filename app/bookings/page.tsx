'use client'

import { useState, useEffect, useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Calendar, MoreHorizontal } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useBookings } from '@/hooks/useData'
import { getUserFromToken } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { toast } from 'sonner'
import api from '@/lib/api'

type PopulatedUser = { _id: string; firstName?: string; lastName?: string; email?: string }

type Booking = {
  _id: string
  userId?: PopulatedUser | string
  sitterId?: PopulatedUser | string
  serviceType?: string
  startDate?: string
  endDate?: string
  status: string
  paymentStatus?: string
  totalAmount?: number
  createdAt?: string
}

function displayName(u?: PopulatedUser | string) {
  if (!u) return '—'
  if (typeof u === 'string') return u
  return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || '—'
}

function calcDuration(start?: string, end?: string) {
  if (!start || !end) return '—'
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (isNaN(ms) || ms <= 0) return '—'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return `${h}h ${m}m`
}

export default function BookingsPage() {
  const [user, setUser] = useState<{ userId: string; role: string } | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const decoded = getUserFromToken()
    if (decoded) setUser({ userId: decoded.userId, role: decoded.role })
  }, [])

  const { data: bookings, isLoading, mutate } = useBookings(user?.role || '', user?.userId || '')
  const bookingList: Booking[] = Array.isArray(bookings) ? bookings : []

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return bookingList
    return bookingList.filter((b) => b.status === statusFilter)
  }, [bookingList, statusFilter])

  const handleUnassign = async (id: string) => {
    try {
      await api.put(`/bookings/${id}/unassign-sitter`)
      toast.success('Sitter unassigned')
      mutate()
    } catch {
      toast.error('Failed to unassign sitter')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.delete(`/bookings/${deleteId}`)
      toast.success('Booking deleted')
      setDeleteId(null)
      mutate()
    } catch {
      toast.error('Failed to delete booking')
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/bookings/${id}`, { status })
      toast.success('Status updated')
      mutate()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handlePaymentStatusChange = async (id: string, paymentStatus: string) => {
    try {
      await api.put(`/bookings/${id}/payment-status`, { paymentStatus })
      toast.success('Payment status updated')
      mutate()
    } catch {
      toast.error('Failed to update payment status')
    }
  }

  const columns: ColumnDef<Booking, unknown>[] = useMemo(() => {
    const cols: ColumnDef<Booking, unknown>[] = []

    if (user?.role === 'admin' || user?.role === 'sitter') {
      cols.push({
        id: 'client',
        header: 'Client',
        cell: ({ row }) => displayName(row.original.userId),
      })
    }

    if (user?.role === 'admin' || user?.role === 'client') {
      cols.push({
        id: 'sitter',
        header: 'Sitter',
        cell: ({ row }) => displayName(row.original.sitterId) || 'Unassigned',
      })
    }

    cols.push(
      {
        accessorKey: 'serviceType',
        header: 'Service Type',
        cell: ({ row }) => row.original.serviceType || 'Pet Sitting',
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) =>
          row.original.startDate
            ? new Date(row.original.startDate).toLocaleString('en-US', {
                month: 'short', day: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })
            : '—',
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        cell: ({ row }) =>
          row.original.endDate
            ? new Date(row.original.endDate).toLocaleString('en-US', {
                month: 'short', day: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })
            : '—',
      },
      {
        id: 'duration',
        header: 'Duration',
        enableSorting: false,
        cell: ({ row }) => calcDuration(row.original.startDate, row.original.endDate),
      },
      {
        accessorKey: 'totalAmount',
        header: 'Amount',
        cell: ({ row }) =>
          row.original.totalAmount != null ? (
            <span className="font-semibold text-green-600">${row.original.totalAmount.toFixed(2)}</span>
          ) : '—',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    )

    if (user?.role === 'admin') {
      cols.push(
        {
          accessorKey: 'createdAt',
          header: 'Created At',
          cell: ({ row }) =>
            row.original.createdAt
              ? new Date(row.original.createdAt).toLocaleString('en-US', {
                  month: 'short', day: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })
              : '—',
        },
        {
          id: 'adminActions',
          header: 'Actions',
          enableSorting: false,
          cell: ({ row }) => {
            const b = row.original
            return (
              <div className="flex flex-col gap-1 min-w-[160px]">
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleUnassign(b._id)}>
                    Unassign Sitter
                  </Button>
                  <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => setDeleteId(b._id)}>
                    Delete
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">Booking Status</div>
                <Select defaultValue={b.status} onValueChange={(v) => handleStatusChange(b._id, v)}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'].map((s) => (
                      <SelectItem key={s} value={s} className="text-xs capitalize">{s.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground">Payment Status</div>
                <Select defaultValue={b.paymentStatus || 'pending'} onValueChange={(v) => handlePaymentStatusChange(b._id, v)}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['pending', 'partial', 'paid', 'refunded'].map((s) => (
                      <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          },
        }
      )
    } else {
      cols.push({
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/bookings/${row.original._id}`}>View Detail</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      })
    }

    return cols
  }, [user?.role])

  if (!user) return null

  return (
    <AppLayout>
      <PageShell title="Bookings">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!isLoading && filtered.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No bookings"
            description="Bookings will appear here once created."
          />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            isLoading={isLoading}
            searchPlaceholder="Search bookings by client name, service type, status, or sitter..."
            searchKey="serviceType"
          />
        )}
      </PageShell>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete this booking?"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        confirmLabel="Delete"
        loading={deleting}
      />
    </AppLayout>
  )
}
