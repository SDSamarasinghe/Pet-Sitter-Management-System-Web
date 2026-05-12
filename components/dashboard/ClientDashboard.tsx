'use client'

import Link from 'next/link'
import { Calendar, PawPrint, Receipt, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/StatCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useBookings, usePets } from '@/hooks/useData'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

type Props = { userId: string }

export function ClientDashboard({ userId }: Props) {
  const { data: bookings, isLoading: loadingBookings } = useBookings('client', userId)
  const { data: pets, isLoading: loadingPets } = usePets(userId)

  const bookingList = Array.isArray(bookings) ? bookings : []
  const petList = Array.isArray(pets) ? pets : []
  const activeBookings = bookingList.filter(
    (b: { status: string }) => !['completed', 'cancelled'].includes(b.status)
  )

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingBookings || loadingPets ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))
        ) : (
          <>
            <StatCard label="Active Bookings" value={activeBookings.length} icon={Calendar} />
            <StatCard label="My Pets" value={petList.length} icon={PawPrint} variant="success" />
            <StatCard label="Invoices Due" value={0} icon={Receipt} variant="warning" />
            <StatCard label="Unread Messages" value={0} icon={MessageSquare} />
          </>
        )}
      </div>

      {/* Two-column cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Upcoming Bookings</CardTitle>
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
            ) : activeBookings.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No upcoming bookings</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeBookings.slice(0, 5).map((b: { _id: string; serviceType?: string; startDate?: string; status: string }) => (
                    <TableRow key={b._id}>
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

        {/* My Pets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">My Pets</CardTitle>
            <Link href="/pets" className="text-sm text-primary hover:underline">
              Manage pets
            </Link>
          </CardHeader>
          <CardContent>
            {loadingPets ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : petList.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No pets added yet</p>
            ) : (
              <div className="space-y-3">
                {petList.slice(0, 5).map((p: { _id: string; name: string; type?: string; breed?: string }) => (
                  <div key={p._id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                      <PawPrint className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.type} {p.breed ? `· ${p.breed}` : ''}
                      </p>
                    </div>
                    {p.type && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {p.type}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
