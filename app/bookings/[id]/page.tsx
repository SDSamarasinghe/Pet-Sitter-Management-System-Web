'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { eachDayOfInterval, format, isWeekend, parseISO } from 'date-fns'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageShell } from '@/components/layout/PageShell'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useBookingGroupDetail } from '@/hooks/useData'
import { getUserFromToken } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import api from '@/lib/api'

const HOLIDAY_MONTH_DAYS = new Set(['01-01', '07-01', '12-25', '12-26'])
const WEEKEND_SURCHARGE_PCT = 15
const HOLIDAY_SURCHARGE_PCT = 25

type PopulatedUser = { _id?: string; firstName?: string; lastName?: string; email?: string }

type DayRecord = {
  _id: string
  startDate: string
  endDate: string
  totalAmount?: number
  status: string
  paymentStatus?: string
}

type GroupDetail = {
  bookingGroupId: string | null
  isGrouped: boolean
  anchorId: string
  userId?: PopulatedUser
  sitterId?: PopulatedUser
  serviceType?: string
  numberOfPets?: number
  petTypes?: string[]
  notes?: string
  startDate?: string
  endDate?: string
  dayCount: number
  totalAmount?: number
  status: string
  paymentStatus?: string
  bookings: DayRecord[]
}

function displayName(u?: PopulatedUser) {
  if (!u) return null
  const full = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
  return full || u.email || null
}

function categorizeDay(dateStr: string): 'holiday' | 'weekend' | 'weekday' {
  const d = parseISO(dateStr)
  if (HOLIDAY_MONTH_DAYS.has(format(d, 'MM-dd'))) return 'holiday'
  if (isWeekend(d)) return 'weekend'
  return 'weekday'
}

function formatRange(start?: string, end?: string) {
  if (!start) return '—'
  const s = new Date(start).toLocaleDateString()
  if (!end) return s
  const e = new Date(end).toLocaleDateString()
  return s === e ? s : `${s} → ${e}`
}

export default function BookingDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [user, setUser] = useState<{ role: string; userId: string } | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const decoded = getUserFromToken()
    if (decoded) setUser({ role: decoded.role, userId: decoded.userId })
  }, [])

  const { data: group, isLoading, mutate } = useBookingGroupDetail(id) as {
    data: GroupDetail | undefined
    isLoading: boolean
    mutate: () => void
  }

  const breakdown = useMemo(() => {
    if (!group?.bookings?.length) {
      return { weekday: [] as DayRecord[], weekend: [] as DayRecord[], holiday: [] as DayRecord[] }
    }
    const acc = {
      weekday: [] as DayRecord[],
      weekend: [] as DayRecord[],
      holiday: [] as DayRecord[],
    }
    for (const b of group.bookings) {
      acc[categorizeDay(b.startDate)].push(b)
    }
    return acc
  }, [group])

  const sumAmount = (rows: DayRecord[]) =>
    rows.reduce((sum, r) => sum + (r.totalAmount || 0), 0)

  // Estimate the base per-day rate so we can label the surcharge on the breakdown.
  // Weekday rows store the raw per-day amount; if none exist, back it out from the
  // first weekend / holiday row using the known surcharge percentages.
  const basePerDay = useMemo(() => {
    if (breakdown.weekday.length > 0) {
      return breakdown.weekday[0].totalAmount || 0
    }
    if (breakdown.weekend.length > 0) {
      return Math.round((breakdown.weekend[0].totalAmount || 0) / (1 + WEEKEND_SURCHARGE_PCT / 100))
    }
    if (breakdown.holiday.length > 0) {
      return Math.round((breakdown.holiday[0].totalAmount || 0) / (1 + HOLIDAY_SURCHARGE_PCT / 100))
    }
    return 0
  }, [breakdown])

  const handleCancel = async () => {
    if (!group) return
    setCancelling(true)
    try {
      if (group.isGrouped && group.bookingGroupId) {
        // Admin-only bulk endpoint; clients fall back to per-day cancel.
        if (user?.role === 'admin') {
          await api.put(`/bookings/group/${group.bookingGroupId}/status`, { status: 'cancelled' })
        } else {
          await Promise.all(
            group.bookings.map((b) => api.put(`/bookings/${b._id}`, { status: 'cancelled' })),
          )
        }
      } else {
        await api.put(`/bookings/${group.anchorId}`, { status: 'cancelled' })
      }
      toast.success(
        group.isGrouped ? `Cancelled ${group.dayCount} booking day(s)` : 'Booking cancelled',
      )
      setCancelOpen(false)
      mutate()
    } catch {
      toast.error('Failed to cancel booking')
    } finally {
      setCancelling(false)
    }
  }

  if (!user) return null

  const titleSuffix = group?.bookingGroupId
    ? group.bookingGroupId.slice(-6).toUpperCase()
    : id.slice(-6).toUpperCase()

  return (
    <AppLayout>
      <PageShell
        title={`Booking ${titleSuffix}`}
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
        ) : !group ? (
          <p className="text-muted-foreground">Booking not found.</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main details */}
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-base">Booking Details</CardTitle>
                  {group.isGrouped && (
                    <Badge variant="default" className="text-xs">
                      Multi-day booking · {group.dayCount} days
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <StatusBadge status={group.status} />
                    {group.paymentStatus && (
                      <>
                        <span className="text-sm text-muted-foreground ml-2">Payment:</span>
                        <StatusBadge status={group.paymentStatus} type="payment" />
                      </>
                    )}
                  </div>
                  <Separator />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Service</p>
                      <p className="text-sm font-medium">{group.serviceType || 'Pet Sitting'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="text-sm font-semibold text-green-600">
                        {group.totalAmount != null ? `CAD $${group.totalAmount.toFixed(2)}` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date Range</p>
                      <p className="inline-flex items-center gap-1.5 text-sm font-medium">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatRange(group.startDate, group.endDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Days</p>
                      <p className="text-sm font-medium">{group.dayCount}</p>
                    </div>
                    {group.numberOfPets != null && (
                      <div>
                        <p className="text-xs text-muted-foreground">Number of Pets</p>
                        <p className="text-sm font-medium">{group.numberOfPets}</p>
                      </div>
                    )}
                    {group.petTypes && group.petTypes.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Pet Types</p>
                        <p className="text-sm font-medium">{group.petTypes.join(', ')}</p>
                      </div>
                    )}
                  </div>

                  {group.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground">Notes</p>
                        <p className="mt-1 text-sm whitespace-pre-line">{group.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Price breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Price Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {basePerDay > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Base rate (per day)</span>
                      <span>CAD ${basePerDay.toFixed(2)}</span>
                    </div>
                  )}
                  {breakdown.weekday.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">
                        Weekdays · {breakdown.weekday.length} ×{' '}
                        {basePerDay > 0 ? `CAD $${basePerDay.toFixed(2)}` : 'rate'}
                      </span>
                      <span className="font-medium">CAD ${sumAmount(breakdown.weekday).toFixed(2)}</span>
                    </div>
                  )}
                  {breakdown.weekend.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-amber-700">
                        Weekend days · {breakdown.weekend.length}
                        <span className="ml-1 text-xs text-amber-600">(+{WEEKEND_SURCHARGE_PCT}%)</span>
                      </span>
                      <span className="font-medium text-amber-800">
                        CAD ${sumAmount(breakdown.weekend).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {breakdown.holiday.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-rose-700">
                        Holiday days · {breakdown.holiday.length}
                        <span className="ml-1 text-xs text-rose-600">(+{HOLIDAY_SURCHARGE_PCT}%)</span>
                      </span>
                      <span className="font-medium text-rose-800">
                        CAD ${sumAmount(breakdown.holiday).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Estimated Total</span>
                    <span className="font-bold text-primary text-lg">
                      CAD ${(group.totalAmount ?? 0).toFixed(2)}
                    </span>
                  </div>
                  {(breakdown.weekend.length > 0 || breakdown.holiday.length > 0) && (
                    <p className="pt-1 text-xs text-muted-foreground">
                      Weekend rate: +{WEEKEND_SURCHARGE_PCT}%, Holiday rate: +{HOLIDAY_SURCHARGE_PCT}%.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Per-day list — only when multi-day */}
              {group.isGrouped && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Day-by-Day</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="divide-y">
                      {group.bookings.map((b) => {
                        const cat = categorizeDay(b.startDate)
                        return (
                          <li
                            key={b._id}
                            className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                          >
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                              {new Date(b.startDate).toLocaleDateString()}
                              {cat === 'weekend' && (
                                <Badge variant="outline" className="text-xs text-amber-700 border-amber-300">
                                  Weekend
                                </Badge>
                              )}
                              {cat === 'holiday' && (
                                <Badge variant="outline" className="text-xs text-rose-700 border-rose-300">
                                  Holiday
                                </Badge>
                              )}
                            </span>
                            <span className="flex items-center gap-3">
                              <StatusBadge status={b.status} />
                              <span className="font-medium">
                                CAD ${(b.totalAmount ?? 0).toFixed(2)}
                              </span>
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(user.role === 'client' || user.role === 'admin') &&
                    group.status !== 'cancelled' &&
                    group.status !== 'completed' && (
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => setCancelOpen(true)}
                      >
                        {group.isGrouped
                          ? `Cancel All ${group.dayCount} Day${group.dayCount === 1 ? '' : 's'}`
                          : 'Cancel Booking'}
                      </Button>
                    )}
                </CardContent>
              </Card>

              {(user.role === 'sitter' || user.role === 'admin') && displayName(group.userId) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Client</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">{displayName(group.userId)}</p>
                    {group.userId?.email && (
                      <p className="text-xs text-muted-foreground">{group.userId.email}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {(user.role === 'client' || user.role === 'admin') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Assigned Sitter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {displayName(group.sitterId) ? (
                      <p className="text-sm font-medium">{displayName(group.sitterId)}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Unassigned</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        <ConfirmDialog
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          title={
            group?.isGrouped
              ? `Cancel all ${group.dayCount} day(s)?`
              : 'Cancel this booking?'
          }
          description={
            group?.isGrouped
              ? 'Every day in this booking group will be cancelled. This action cannot be undone.'
              : 'This action cannot be undone. The booking will be marked as cancelled.'
          }
          onConfirm={handleCancel}
          confirmLabel={group?.isGrouped ? 'Cancel All Days' : 'Cancel Booking'}
          loading={cancelling}
        />
      </PageShell>
    </AppLayout>
  )
}
