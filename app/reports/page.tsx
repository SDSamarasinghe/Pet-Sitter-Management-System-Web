'use client'

import { useEffect, useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { FileText } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { useReports } from '@/hooks/useData'
import { getUserFromToken } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import api from '@/lib/api'

type Report = {
  _id: string
  bookingId?: string
  clientName?: string
  date?: string
  summary?: string
  createdAt?: string
}

export default function ReportsPage() {
  const [userId, setUserId] = useState('')
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ bookingId: '', summary: '' })

  useEffect(() => {
    const decoded = getUserFromToken()
    if (decoded) setUserId(decoded.userId)
  }, [])

  const { data, isLoading, mutate } = useReports()
  const reports: Report[] = Array.isArray(data) ? data : []

  const handleSubmit = async () => {
    if (!form.bookingId || !form.summary) return
    setSubmitting(true)
    try {
      await api.post('/reports', { bookingId: form.bookingId, summary: form.summary })
      toast.success('Report submitted')
      setOpen(false)
      setForm({ bookingId: '', summary: '' })
      mutate()
    } catch {
      toast.error('Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnDef<Report, unknown>[] = useMemo(
    () => [
      { accessorKey: 'clientName', header: 'Client', cell: ({ row }) => row.original.clientName || '—' },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '—',
      },
      {
        accessorKey: 'summary',
        header: 'Summary',
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-xs">{row.original.summary || '—'}</span>
        ),
      },
    ],
    []
  )

  return (
    <AppLayout>
      <PageShell
        title="Reports"
        description="Visit reports for your bookings."
        action={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="sm">New Report</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>New Report</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Booking ID</Label>
                  <Input
                    value={form.bookingId}
                    onChange={(e) => setForm((p) => ({ ...p, bookingId: e.target.value }))}
                    placeholder="Enter booking ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Summary</Label>
                  <Textarea
                    rows={6}
                    value={form.summary}
                    onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
                    placeholder="Describe the visit..."
                  />
                </div>
                <Button onClick={handleSubmit} disabled={!form.bookingId || !form.summary || submitting} className="w-full">
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        }
      >
        {!isLoading && reports.length === 0 ? (
          <EmptyState icon={FileText} title="No reports" description="Your visit reports will appear here." />
        ) : (
          <DataTable columns={columns} data={reports} isLoading={isLoading} searchPlaceholder="Search reports..." searchKey="clientName" />
        )}
      </PageShell>
    </AppLayout>
  )
}
