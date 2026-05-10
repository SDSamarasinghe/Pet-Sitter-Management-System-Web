'use client'

import Link from 'next/link'
import { Calendar, Clock, Users, ClipboardList } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/StatCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useBookings, useClients } from '@/hooks/useData'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type Props = { userId: string }

export function SitterDashboard({ userId }: Props) {
  const { data: bookings, isLoading: loadingBookings } = useBookings('sitter', userId)
  const { data: clients, isLoading: loadingClients } = useClients()

  const bookingList = Array.isArray(bookings) ? bookings : []
  const clientList = Array.isArray(clients) ? clients : []

  const today = new Date().toDateString()
  const todaysVisits = bookingList.filter(
    (b: { startDate?: string; status: string }) =>
      b.startDate && new Date(b.startDate).toDateString() === today && b.status !== 'cancelled'
  )
  const pendingBookings = bookingList.filter((b: { status: string }) => b.status === 'pending')

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingBookings ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))
        ) : (
          <>
            <StatCard label="Today's Visits" value={todaysVisits.length} icon={Clock} />
            <StatCard label="Pending Bookings" value={pendingBookings.length} icon={Calendar} variant="warning" />
            <StatCard label="Active Clients" value={clientList.length} icon={Users} variant="success" />
            <StatCard label="Reports Due" value={0} icon={ClipboardList} />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBookings ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : todaysVisits.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No visits scheduled today
              </p>
            ) : (
              <div className="space-y-3">
                {todaysVisits.map((b: { _id: string; startDate?: string; serviceType?: string; clientName?: string; numberOfPets?: number; status: string }) => (
                  <div key={b._id} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="text-sm font-medium text-primary">
                      {b.startDate
                        ? new Date(b.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{b.serviceType || 'Pet Sitting'}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.clientName || 'Client'} · {b.numberOfPets || 1} pet(s)
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Clients */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">My Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingClients ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : clientList.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No clients yet</p>
            ) : (
              <div className="space-y-3">
                {clientList.slice(0, 6).map((c: { _id: string; firstName: string; lastName: string }) => (
                  <div key={c._id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {c.firstName?.[0]}{c.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">{c.firstName} {c.lastName}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recent Bookings</CardTitle>
          <Link href="/bookings" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {loadingBookings ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingList.slice(0, 5).map((b: { _id: string; clientName?: string; serviceType?: string; startDate?: string; status: string }) => (
                  <TableRow key={b._id}>
                    <TableCell className="text-sm">{b.clientName || '—'}</TableCell>
                    <TableCell className="text-sm">{b.serviceType || 'Pet Sitting'}</TableCell>
                    <TableCell className="text-sm">
                      {b.startDate ? new Date(b.startDate).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
