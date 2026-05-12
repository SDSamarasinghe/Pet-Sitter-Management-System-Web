'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageShell } from '@/components/layout/PageShell'
import { useAvailabilitySlots, useBookings } from '@/hooks/useData'
import { getUserFromToken } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function SchedulingPage() {
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const decoded = getUserFromToken()
    if (decoded) setUserId(decoded.userId)
  }, [])

  const { data: slots, isLoading: slotsLoading } = useAvailabilitySlots(userId)
  const { data: bookings, isLoading: bookingsLoading } = useBookings('sitter', userId)

  const upcomingBookings = Array.isArray(bookings)
    ? bookings
        .filter((b: any) => b.status === 'confirmed' || b.status === 'pending')
        .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 10)
    : []

  const isLoading = slotsLoading || bookingsLoading

  return (
    <AppLayout>
      <PageShell title="My Schedule" description="Your availability and upcoming bookings.">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Availability Slots</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10" />
                  ))}
                </div>
              ) : !Array.isArray(slots) || slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No availability slots configured.</p>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span className="font-medium capitalize">{slot.day || slot.dayOfWeek}</span>
                      <span className="text-muted-foreground">
                        {slot.startTime} – {slot.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : upcomingBookings.length === 0 ? (
                <EmptyState icon={Calendar} title="No upcoming bookings" description="Your upcoming bookings will appear here." />
              ) : (
                <div className="space-y-2">
                  {upcomingBookings.map((b: any) => (
                    <div key={b._id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <div>
                        <p className="font-medium">{b.clientName || 'Client'}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.startDate ? new Date(b.startDate).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageShell>
    </AppLayout>
  )
}
