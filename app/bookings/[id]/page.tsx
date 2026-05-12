'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageShell } from '@/components/layout/PageShell'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useBooking } from '@/hooks/useData'
import { getUserFromToken } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [user, setUser] = useState<{ role: string; userId: string } | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const decoded = getUserFromToken()
    if (decoded) setUser({ role: decoded.role, userId: decoded.userId })
  }, [])

  const { data: booking, isLoading, mutate } = useBooking(id)

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await api.put(`/bookings/${id}`, { status: 'cancelled' })
      toast.success('Booking cancelled')
      setCancelOpen(false)
      mutate()
    } catch {
      toast.error('Failed to cancel booking')
    } finally {
      setCancelling(false)
    }
  }

  if (!user) return null

  return (
    <AppLayout>
      <PageShell
        title={`Booking ${id.slice(-6).toUpperCase()}`}
        action={
          <Link href="/bookings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      >
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        ) : !booking ? (
          <p className="text-muted-foreground">Booking not found.</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main details */}
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Booking Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <StatusBadge status={booking.status} />
                  </div>
                  <Separator />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Service</p>
                      <p className="text-sm font-medium">{booking.serviceType || 'Pet Sitting'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-sm font-medium">
                        {booking.totalAmount != null ? `$${booking.totalAmount.toFixed(2)}` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="text-sm font-medium">
                        {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <p className="text-sm font-medium">
                        {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                  {booking.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground">Notes</p>
                        <p className="mt-1 text-sm">{booking.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(user.role === 'client' || user.role === 'admin') &&
                    booking.status !== 'cancelled' &&
                    booking.status !== 'completed' && (
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => setCancelOpen(true)}
                      >
                        Cancel Booking
                      </Button>
                    )}
                </CardContent>
              </Card>

              {/* Client / Sitter info */}
              {(user.role === 'sitter' || user.role === 'admin') && booking.clientName && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Client</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">{booking.clientName}</p>
                    {booking.clientEmail && (
                      <p className="text-xs text-muted-foreground">{booking.clientEmail}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {(user.role === 'client' || user.role === 'admin') && booking.sitterName && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Assigned Sitter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">{booking.sitterName}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        <ConfirmDialog
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          title="Cancel this booking?"
          description="This action cannot be undone. The booking will be marked as cancelled."
          onConfirm={handleCancel}
          confirmLabel="Cancel Booking"
          loading={cancelling}
        />
      </PageShell>
    </AppLayout>
  )
}
