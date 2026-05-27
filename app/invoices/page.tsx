'use client'

import { useState, useEffect, useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { FileText, MoreHorizontal, ChevronUp, ChevronDown, X, Eye, Trash2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useInvoices } from '@/hooks/useData'
import { getUserFromToken } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { toast } from 'sonner'
import api from '@/lib/api'
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'

type PopulatedUser = { _id: string; firstName?: string; lastName?: string; email?: string }

type Invoice = {
  _id: string
  invoiceNumber: string
  clientId?: PopulatedUser | string
  amount: number
  status: string
  dueDate?: string
  paidDate?: string
  type?: string
  createdAt?: string
}

function displayName(u?: PopulatedUser | string) {
  if (!u) return '—'
  if (typeof u === 'string') return u
  return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || '—'
}

function getStatusColor(status: string) {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

export default function InvoicesPage() {
  const [user, setUser] = useState<{ userId: string; role: string } | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const decoded = getUserFromToken()
    if (decoded) setUser({ userId: decoded.userId, role: decoded.role })
  }, [])

  const { data: invoices, isLoading, mutate } = useInvoices(user?.role === 'admin' ? undefined : user?.userId)
  const invoiceList: Invoice[] = Array.isArray(invoices) ? invoices : []

  const filtered = useMemo(() => {
    let result = invoiceList

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((inv) => inv.status === statusFilter)
    }

    // Apply date range filter
    if (fromDate || toDate) {
      result = result.filter((inv) => {
        const invoiceDate = inv.dueDate ? parseISO(inv.dueDate) : null
        if (!invoiceDate) return false

        if (fromDate && toDate) {
          const from = startOfDay(parseISO(fromDate))
          const to = endOfDay(parseISO(toDate))
          return isWithinInterval(invoiceDate, { start: from, end: to })
        } else if (fromDate) {
          return invoiceDate >= startOfDay(parseISO(fromDate))
        } else if (toDate) {
          return invoiceDate <= endOfDay(parseISO(toDate))
        }
        return true
      })
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })

    return result
  }, [invoiceList, statusFilter, fromDate, toDate, sortOrder])

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-foreground/80"
          onClick={() => column.toggleSorting()}
        >
          Invoice #
          {column.getIsSorted() === 'asc' && <ChevronUp className="h-3 w-3" />}
          {column.getIsSorted() === 'desc' && <ChevronDown className="h-3 w-3" />}
        </button>
      ),
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.invoiceNumber}</span>,
    },
    {
      accessorKey: 'clientId',
      header: 'Client',
      cell: ({ row }) => displayName(row.original.clientId),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => `$${row.original.amount?.toFixed(2) || '0.00'}`,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type || 'service'
        return (
          <span className="capitalize text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">
            {type.replace('_', ' ')}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.dueDate ? format(parseISO(row.original.dueDate), 'MMM dd, yyyy') : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'paidDate',
      header: 'Paid Date',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.paidDate ? format(parseISO(row.original.paidDate), 'MMM dd, yyyy') : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.location.href = `/invoices/${row.original._id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {user?.role === 'admin' && (
              <>
                <DropdownMenuItem onClick={() => setDeleteId(row.original._id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.delete(`/invoices/${deleteId}`)
      toast.success('Invoice deleted')
      setDeleteId(null)
      mutate()
    } catch {
      toast.error('Failed to delete invoice')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppLayout>
      <PageShell
        title="Invoices"
        description="View and manage all invoices"
      >
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium">From</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full sm:w-[180px]"
              />
            </div>

            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium">To</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full sm:w-[180px]"
              />
            </div>

            {(statusFilter !== 'all' || fromDate || toDate) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter('all')
                  setFromDate('')
                  setToDate('')
                }}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Data Table or Empty State */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading invoices...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No invoices yet"
              description={statusFilter !== 'all' || fromDate || toDate ? 'No invoices match your filters.' : 'No invoices found.'}
              action={statusFilter !== 'all' || fromDate || toDate ? { label: 'Clear Filters', onClick: () => {
                setStatusFilter('all')
                setFromDate('')
                setToDate('')
              }} : undefined}
            />
          ) : (
            <DataTable columns={columns} data={filtered} />
          )}
        </div>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={() => setDeleteId(null)}
          title="Delete invoice?"
          description="This action cannot be undone. The invoice will be permanently removed."
          onConfirm={handleDelete}
          confirmLabel="Delete"
          loading={deleting}
        />
      </PageShell>
    </AppLayout>
  )
}
