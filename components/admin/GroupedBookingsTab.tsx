'use client'

import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePaginatedGroupedBookings } from '@/hooks/useData'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import api from '@/lib/api'
import { CalendarDays, CheckCircle2, XCircle } from 'lucide-react'

type PopulatedUser = { _id: string; firstName?: string; lastName?: string; email?: string }

type BookingGroup = {
  bookingGroupId: string | null
  isGrouped: boolean
  bookings: Array<{ _id: string; startDate?: string; endDate?: string; status: string }>
  userId?: PopulatedUser | string
  sitterId?: PopulatedUser | string
  serviceType?: string
  startDate?: string
  endDate?: string
  totalAmount?: number
  status: string
  paymentStatus: string
  dayCount: number
}

function displayName(u?: PopulatedUser | string) {
  if (!u) return '—'
  if (typeof u === 'string') return u
  return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || '—'
}

function formatRange(start?: string, end?: string) {
  if (!start) return '—'
  const s = new Date(start).toLocaleDateString()
  if (!end) return s
  const e = new Date(end).toLocaleDateString()
  return s === e ? s : `${s} → ${e}`
}

export function GroupedBookingsTab() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')

  const { data, isLoading, isValidating, mutate } = usePaginatedGroupedBookings({
    page,
    limit: pageSize,
    search,
    status: status === 'all' ? undefined : status,
  })
  const groups: BookingGroup[] = data?.data ?? []

  const [selected, setSelected] = useState<BookingGroup | null>(null)
  const [action, setAction] = useState<'confirmed' | 'cancelled' | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const openAction = (group: BookingGroup, next: 'confirmed' | 'cancelled') => {
    setSelected(group)
    setAction(next)
  }

  const closeDialog = () => {
    if (submitting) return
    setSelected(null)
    setAction(null)
  }

  const applyAction = async () => {
    if (!selected || !action) return
    setSubmitting(true)
    try {
      if (selected.isGrouped && selected.bookingGroupId) {
        await api.put(`/bookings/group/${selected.bookingGroupId}/status`, { status: action })
      } else {
        // Single-day standalone booking — fall back to per-booking update
        const id = selected.bookings[0]?._id
        if (!id) throw new Error('No booking id')
        await api.put(`/bookings/${id}`, { status: action })
      }
      toast.success(
        action === 'confirmed'
          ? `Approved ${selected.dayCount} booking day(s)`
          : `Rejected ${selected.dayCount} booking day(s)`,
      )
      await mutate()
      closeDialog()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update booking group')
    } finally {
      setSubmitting(false)
    }
  }

  // Track which group row is mid-update so we can disable that select without flicker
  const [updatingPaymentFor, setUpdatingPaymentFor] = useState<string | null>(null)
  const [updatingStatusFor, setUpdatingStatusFor] = useState<string | null>(null)

  const handleStatusSelectChange = async (group: BookingGroup, nextStatus: string) => {
    if (!nextStatus || nextStatus === group.status) return
    const rowKey = group.bookingGroupId || group.bookings[0]?._id || ''
    setUpdatingStatusFor(rowKey)
    try {
      if (group.isGrouped && group.bookingGroupId) {
        // Group endpoint — fires at most one email for the whole group (e.g. one
        // rejection email covering all days), not one per day record.
        await api.put(`/bookings/group/${group.bookingGroupId}/status`, { status: nextStatus })
      } else {
        const id = group.bookings[0]?._id
        if (!id) throw new Error('No booking id')
        await api.put(`/bookings/${id}`, { status: nextStatus })
      }
      toast.success(
        group.isGrouped
          ? `Booking status updated for ${group.dayCount} day(s)`
          : 'Booking status updated',
      )
      await mutate()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update booking status')
    } finally {
      setUpdatingStatusFor(null)
    }
  }

  const handlePaymentStatusChange = async (group: BookingGroup, nextPaymentStatus: string) => {
    if (!nextPaymentStatus || nextPaymentStatus === group.paymentStatus) return
    const rowKey = group.bookingGroupId || group.bookings[0]?._id || ''
    setUpdatingPaymentFor(rowKey)
    try {
      if (group.isGrouped && group.bookingGroupId) {
        await api.put(`/bookings/group/${group.bookingGroupId}/payment-status`, {
          paymentStatus: nextPaymentStatus,
        })
      } else {
        const id = group.bookings[0]?._id
        if (!id) throw new Error('No booking id')
        await api.put(`/bookings/${id}/payment-status`, { paymentStatus: nextPaymentStatus })
      }
      toast.success(
        group.isGrouped
          ? `Payment status updated for ${group.dayCount} day(s)`
          : 'Payment status updated',
      )
      await mutate()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update payment status')
    } finally {
      setUpdatingPaymentFor(null)
    }
  }

  const columns: ColumnDef<BookingGroup, unknown>[] = useMemo(
    () => [
      {
        id: 'client',
        header: 'Client',
        cell: ({ row }) => displayName(row.original.userId),
      },
      {
        id: 'sitter',
        header: 'Sitter',
        cell: ({ row }) => displayName(row.original.sitterId) || 'Unassigned',
      },
      {
        accessorKey: 'serviceType',
        header: 'Service',
        cell: ({ row }) => row.original.serviceType || 'Pet Sitting',
      },
      {
        id: 'range',
        header: 'Date Range',
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            {formatRange(row.original.startDate, row.original.endDate)}
          </span>
        ),
      },
      {
        id: 'dayCount',
        header: 'Days',
        cell: ({ row }) => (
          <Badge variant={row.original.isGrouped ? 'default' : 'outline'}>
            {row.original.dayCount} {row.original.dayCount === 1 ? 'day' : 'days'}
          </Badge>
        ),
      },
      {
        id: 'total',
        header: 'Total',
        cell: ({ row }) =>
          row.original.totalAmount != null ? (
            <span className="font-semibold text-green-600">
              ${row.original.totalAmount.toFixed(2)}
            </span>
          ) : (
            '—'
          ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'bookingStatus',
        header: 'Booking Status',
        enableSorting: false,
        cell: ({ row }) => {
          const g = row.original
          const rowKey = g.bookingGroupId || g.bookings[0]?._id || ''
          const isUpdating = updatingStatusFor === rowKey
          const isMixed = g.status === 'mixed'
          return (
            <Select
              value={isMixed ? undefined : g.status}
              onValueChange={(v) => handleStatusSelectChange(g, v)}
              disabled={isUpdating}
            >
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder={isMixed ? 'Mixed' : 'Pending'} />
              </SelectTrigger>
              <SelectContent>
                {['pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'].map(
                  (s) => (
                    <SelectItem key={s} value={s} className="text-xs capitalize">
                      {s.replace('_', ' ')}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          )
        },
      },
      {
        id: 'paymentStatus',
        header: 'Payment',
        enableSorting: false,
        cell: ({ row }) => {
          const g = row.original
          const rowKey = g.bookingGroupId || g.bookings[0]?._id || ''
          const isUpdating = updatingPaymentFor === rowKey
          const isMixed = g.paymentStatus === 'mixed'
          return (
            <div className="flex items-center gap-2">
              <Select
                // When mixed, leave the value empty so the placeholder shows
                value={isMixed ? undefined : g.paymentStatus}
                onValueChange={(v) => handlePaymentStatusChange(g, v)}
                disabled={isUpdating}
              >
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue placeholder={isMixed ? 'Mixed' : 'Pending'} />
                </SelectTrigger>
                <SelectContent>
                  {['pending', 'partial', 'paid', 'refunded'].map((s) => (
                    <SelectItem key={s} value={s} className="text-xs capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isMixed && <StatusBadge status={g.paymentStatus} type="payment" />}
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const g = row.original
          const isFinalized = ['cancelled', 'completed'].includes(g.status)
          const canApprove = g.status === 'pending' || g.status === 'mixed'
          return (
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="default"
                disabled={isFinalized || !canApprove}
                onClick={() => openAction(g, 'confirmed')}
              >
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                Approve All
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isFinalized}
                onClick={() => openAction(g, 'cancelled')}
              >
                <XCircle className="mr-1 h-3.5 w-3.5" />
                Reject
              </Button>
            </div>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updatingPaymentFor, updatingStatusFor],
  )

  return (
    <>
      <div className="mb-3 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
        Multi-day bookings created from a single request are collapsed into one row here so you can
        approve or reject all days together. Single-day bookings appear as one-day groups.
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={groups}
        isLoading={isLoading}
        searchPlaceholder="Search by client, sitter, or service..."
        serverPagination={{
          page,
          pageSize,
          total: data?.total ?? 0,
          totalPages: data?.totalPages ?? 1,
          search,
          isValidating,
          onPageChange: setPage,
          onPageSizeChange: (s) => {
            setPageSize(s)
            setPage(1)
          },
          onSearchChange: (s) => {
            setSearch(s)
            setPage(1)
          },
        }}
      />

      <ConfirmDialog
        open={Boolean(selected && action)}
        onOpenChange={(o) => !o && closeDialog()}
        title={
          action === 'confirmed'
            ? `Approve ${selected?.dayCount ?? 0} booking day(s)?`
            : `Reject ${selected?.dayCount ?? 0} booking day(s)?`
        }
        description={
          action === 'confirmed'
            ? 'All days in this booking group will be marked confirmed.'
            : 'All days in this booking group will be cancelled and the client will be notified.'
        }
        confirmLabel={action === 'confirmed' ? 'Approve All' : 'Reject All'}
        variant={action === 'cancelled' ? 'destructive' : 'default'}
        loading={submitting}
        onConfirm={applyAction}
      />
    </>
  )
}
