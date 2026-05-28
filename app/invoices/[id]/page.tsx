'use client'

import { useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Printer, CalendarDays } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageShell } from '@/components/layout/PageShell'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useInvoiceDetail } from '@/hooks/useData'

type PopulatedUser = {
  _id?: string
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  address?: string
}

type DerivedInvoice = {
  _id: string
  invoiceNumber: string
  bookingGroupId: string | null
  isGrouped: boolean
  clientId?: PopulatedUser
  sitterId?: PopulatedUser
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
  numberOfPets?: number
  petTypes?: string[]
  notes?: string
  serviceAddress?: string
  createdAt?: string
  bookings: Array<{
    _id: string
    startDate: string
    endDate: string
    totalAmount: number
    status: string
    paymentStatus: string
  }>
}

function displayName(u?: PopulatedUser) {
  if (!u) return null
  return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || null
}

function formatDate(d?: string) {
  if (!d) return '—'
  try {
    return format(parseISO(d), 'MMM dd, yyyy')
  } catch {
    return '—'
  }
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const id = params.id as string
  const searchParams = useSearchParams()
  const autoPrint = searchParams.get('print') === '1'

  const { data, isLoading } = useInvoiceDetail(id) as {
    data: DerivedInvoice | undefined
    isLoading: boolean
  }

  // When ?print=1 is in the URL (e.g. from the Download PDF action), open the print
  // dialog once the data is rendered. Browsers will let the user "Save as PDF" from there.
  useEffect(() => {
    if (autoPrint && data) {
      const t = setTimeout(() => window.print(), 350)
      return () => clearTimeout(t)
    }
  }, [autoPrint, data])

  const breakdown = useMemo(() => {
    if (!data?.bookings?.length) return { lineItems: [] as DerivedInvoice['bookings'] }
    return {
      lineItems: [...data.bookings].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      ),
    }
  }, [data])

  return (
    <AppLayout>
      <PageShell
        title={data?.invoiceNumber ?? 'Invoice'}
        description="Detailed breakdown of the booking that generated this invoice."
        action={
          <div className="flex items-center gap-2 print:hidden">
            <Link href="/invoices">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        }
      >
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        ) : !data ? (
          <p className="text-muted-foreground">Invoice not found.</p>
        ) : (
          <div id="invoice-print-root" className="space-y-6">
            {/* Header card */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Invoice
                    </p>
                    <h2 className="font-mono text-2xl font-bold">{data.invoiceNumber}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Issued {formatDate(data.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Whiskarz Pet-Sitting
                    </p>
                    <p className="text-sm font-medium">Trusted in-home pet care</p>
                    <p className="text-xs text-muted-foreground">
                      admin@whiskarz.com
                    </p>
                  </div>
                </div>
              </div>

              <CardContent className="space-y-4 p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Billed To
                    </p>
                    <p className="text-sm font-medium">{displayName(data.clientId) ?? '—'}</p>
                    {data.clientId?.email && (
                      <p className="text-xs text-muted-foreground">{data.clientId.email}</p>
                    )}
                    {data.clientId?.phoneNumber && (
                      <p className="text-xs text-muted-foreground">{data.clientId.phoneNumber}</p>
                    )}
                    {(data.serviceAddress || data.clientId?.address) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {data.serviceAddress || data.clientId?.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Status
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusBadge status={data.status} type="payment" />
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
                      Due Date
                    </p>
                    <p className="text-sm font-medium">{formatDate(data.dueDate)}</p>
                    {data.paidDate && (
                      <>
                        <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
                          Paid On
                        </p>
                        <p className="text-sm font-medium">{formatDate(data.paidDate)}</p>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Service</p>
                    <p className="text-sm font-medium">{data.serviceType || 'Pet Sitting'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date Range</p>
                    <p className="inline-flex items-center gap-1 text-sm font-medium">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatDate(data.startDate)} → {formatDate(data.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium">
                      {data.dayCount} {data.dayCount === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                  {data.numberOfPets != null && (
                    <div>
                      <p className="text-xs text-muted-foreground">Number of Pets</p>
                      <p className="text-sm font-medium">{data.numberOfPets}</p>
                    </div>
                  )}
                  {data.petTypes && data.petTypes.length > 0 && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Pet Types</p>
                      <p className="text-sm font-medium">{data.petTypes.join(', ')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Line items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Line Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2.5 pl-6 pr-2 text-left">Date</th>
                      <th className="px-2 py-2.5 text-left">Description</th>
                      <th className="px-2 py-2.5 text-center">Booking Status</th>
                      <th className="px-2 py-2.5 text-center">Payment</th>
                      <th className="py-2.5 pl-2 pr-6 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdown.lineItems.map((li) => (
                      <tr key={li._id} className="border-b last:border-b-0">
                        <td className="py-2.5 pl-6 pr-2 text-left">
                          {formatDate(li.startDate)}
                        </td>
                        <td className="px-2 py-2.5">{data.serviceType || 'Pet Sitting'}</td>
                        <td className="px-2 py-2.5 text-center">
                          <StatusBadge status={li.status} />
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          <StatusBadge status={li.paymentStatus} type="payment" />
                        </td>
                        <td className="py-2.5 pl-2 pr-6 text-right font-medium">
                          ${li.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/30">
                      <td colSpan={4} className="py-3 pl-6 pr-2 text-right font-semibold">
                        Total
                      </td>
                      <td className="py-3 pl-2 pr-6 text-right text-lg font-bold text-primary">
                        ${data.amount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>

            {data.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm">{data.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </PageShell>

      {/* Print-only styles: hide app chrome and shrink padding so the invoice prints cleanly. */}
      <style jsx global>{`
        @media print {
          /* Hide anything outside the invoice card stack */
          body * {
            visibility: hidden !important;
          }
          #invoice-print-root,
          #invoice-print-root * {
            visibility: visible !important;
          }
          #invoice-print-root {
            position: absolute;
            inset: 0;
            margin: 0;
            padding: 24px;
            background: white !important;
          }
          /* Remove page background gradient */
          html, body {
            background: white !important;
          }
        }
      `}</style>
    </AppLayout>
  )
}
