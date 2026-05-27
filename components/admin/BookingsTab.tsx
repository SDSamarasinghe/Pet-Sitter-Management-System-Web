'use client'

import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { usePaginatedBookings } from '@/hooks/useData'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type PopulatedUser = { _id: string; firstName?: string; lastName?: string; email?: string }

type Booking = {
  _id: string
  userId?: PopulatedUser | string
  sitterId?: PopulatedUser | string
  serviceType?: string
  startDate?: string
  endDate?: string
  status: string
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

export function BookingsTab() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')

  const { data, isLoading, isValidating } = usePaginatedBookings({
    page,
    limit: pageSize,
    search,
    status: status === 'all' ? undefined : status,
  })
  const bookings: Booking[] = data?.data ?? []

  const columns: ColumnDef<Booking, unknown>[] = useMemo(
    () => [
      { id: 'client', header: 'Client', cell: ({ row }) => displayName(row.original.userId) },
      { id: 'sitter', header: 'Sitter', cell: ({ row }) => displayName(row.original.sitterId) || 'Unassigned' },
      { accessorKey: 'serviceType', header: 'Service', cell: ({ row }) => row.original.serviceType || 'Pet Sitting' },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) => row.original.startDate ? new Date(row.original.startDate).toLocaleDateString() : '—',
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        cell: ({ row }) => row.original.endDate ? new Date(row.original.endDate).toLocaleDateString() : '—',
      },
      {
        id: 'duration',
        header: 'Duration',
        cell: ({ row }) => calcDuration(row.original.startDate, row.original.endDate),
      },
      {
        accessorKey: 'totalAmount',
        header: 'Amount',
        cell: ({ row }) => row.original.totalAmount != null ? (
          <span className="font-semibold text-green-600">${row.original.totalAmount.toFixed(2)}</span>
        ) : '—',
      },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <Link href={`/bookings/${row.original._id}`}>
            <Button variant="ghost" size="sm">View</Button>
          </Link>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
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
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        isLoading={isLoading}
        searchPlaceholder="Search by service, status, or payment..."
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
    </div>
  )
}
