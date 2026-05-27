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
    [],
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
