'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { PageShell } from '@/components/layout/PageShell'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsersTab } from '@/components/admin/UsersTab'
import { SittersTab } from '@/components/admin/SittersTab'
import { BookingsTab } from '@/components/admin/BookingsTab'
import { PetsTab } from '@/components/admin/PetsTab'

export default function AdminPage() {
  return (
    <AppLayout>
      <PageShell title="Admin Panel" description="Manage users, bookings, and pets.">
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="sitters">Sitters</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="pets">Pets</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          <TabsContent value="sitters">
            <SittersTab />
          </TabsContent>
          <TabsContent value="bookings">
            <BookingsTab />
          </TabsContent>
          <TabsContent value="pets">
            <PetsTab />
          </TabsContent>
        </Tabs>
      </PageShell>
    </AppLayout>
  )
}
