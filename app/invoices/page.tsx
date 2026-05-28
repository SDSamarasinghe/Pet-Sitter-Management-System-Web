'use client'

import { useState, useEffect, useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { FileText, MoreHorizontal, Eye, Download, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StatCard } from '@/components/ui/StatCard'
import { useInvoices } from '@/hooks/useData'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format, parseISO } from 'date-fns'

type PopulatedUser = { _id?: string; firstName?: string; lastName?: string; email?: string }

type DerivedInvoice = {
  _id: string
  invoiceNumber: string
  bookingGroupId: string | null
  isGrouped: boolean
  clientId?: PopulatedUser | string
  sitterId?: PopulatedUser | string
  serviceType?: string
  amount: number
  status: string
  paymentStatus: string
  bookingStatus: string
  startDate?: string
  endDate?: string
  dueDate?: string
  paidDate?: string
  dayCount: number
  createdAt?: string
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

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partial' },
  { value: 'due', label: 'Due' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function InvoicesPage() {
  const [user, setUser] = useState<{ userId: string; role: string } | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const decoded = getUserFromToken()
    if (decoded) setUser({ userId: decoded.userId, role: decoded.role })
  }, [])

  // Admin sees all invoices; clients/sitters see their own
  const scopedUserId = user?.role === 'admin' ? undefined : user?.userId
  const { data, isLoading, isValidating } = useInvoices(scopedUserId, {
    page,
    limit: pageSize,
    search,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const invoices: DerivedInvoice[] = data?.data ?? []

  const stats = useMemo(() => {
    const acc = { total: 0, paid: 0, due: 0, overdue: 0 }
    for (const inv of invoices) {
      acc.total += inv.amount || 0
      if (inv.status === 'paid') acc.paid += inv.amount || 0
      if (inv.status === 'due') acc.due += inv.amount || 0
      if (inv.status === 'overdue') acc.overdue += inv.amount || 0
    }
    return acc
  }, [invoices])

  const columns: ColumnDef<DerivedInvoice>[] = useMemo(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: 'Invoice #',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium">{row.original.invoiceNumber}</span>
        ),
      },
      {
        id: 'client',
        header: 'Client',
        cell: ({ row }) => displayName(row.original.clientId),
      },
      {
        accessorKey: 'serviceType',
        header: 'Service',
        cell: ({ row }) => row.original.serviceType || 'Pet Sitting',
      },
      {
        id: 'range',
        header: 'Service Dates',
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
          <span className="text-sm">
            {row.original.dayCount} {row.original.dayCount === 1 ? 'day' : 'days'}
          </span>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <span className="font-semibold text-green-600">
            ${(row.original.amount ?? 0).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} type="payment" />,
      },
      {
        accessorKey: 'dueDate',
        header: 'Due',
        cell: ({ row }) =>
          row.original.dueDate
            ? format(parseISO(row.original.dueDate), 'MMM dd, yyyy')
            : '—',
      },
      {
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
                <Link href={`/invoices/${row.original._id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/invoices/${row.original._id}?print=1`}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  )

  if (!user) return null

  return (
    <AppLayout>
      <PageShell title="Invoices" description="Every booking generates an invoice. Status reflects the booking's payment state.">
        {/* Summary cards */}
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total invoices"
            value={String(data?.total ?? 0)}
            icon={FileText}
          />
          <StatCard
            label="Total billed (page)"
            value={`$${stats.total.toFixed(2)}`}
            icon={FileText}
          />
          <StatCard
            label="Paid (page)"
            value={`$${stats.paid.toFixed(2)}`}
            icon={FileText}
            variant="success"
          />
          <StatCard
            label="Due + Overdue (page)"
            value={`$${(stats.due + stats.overdue).toFixed(2)}`}
            icon={FileText}
            variant="warning"
          />
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={invoices}
          isLoading={isLoading}
          searchPlaceholder="Search by invoice #, client, or service..."
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
      </PageShell>
    </AppLayout>
  )
}
