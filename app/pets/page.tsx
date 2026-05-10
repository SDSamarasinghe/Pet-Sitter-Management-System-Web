'use client'

import { useState, useEffect } from 'react'
import { PawPrint, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageShell } from '@/components/layout/PageShell'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PetForm } from '@/components/pets/PetForm'
import { usePets } from '@/hooks/useData'
import { getUserFromToken } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import api from '@/lib/api'

export default function PetsPage() {
  const [userId, setUserId] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingPet, setEditingPet] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const decoded = getUserFromToken()
    if (decoded) setUserId(decoded.userId)
  }, [])

  const { data: pets, isLoading, mutate } = usePets(userId)
  const petList = Array.isArray(pets) ? pets : []

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.delete(`/pets/${deleteId}`)
      toast.success('Pet removed')
      setDeleteId(null)
      mutate()
    } catch {
      toast.error('Failed to delete pet')
    } finally {
      setDeleting(false)
    }
  }

  const openEdit = (pet: unknown) => {
    setEditingPet(pet)
    setSheetOpen(true)
  }

  const openAdd = () => {
    setEditingPet(null)
    setSheetOpen(true)
  }

  return (
    <AppLayout>
      <PageShell
        title="My Pets"
        action={
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Pet
          </Button>
        }
      >
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : petList.length === 0 ? (
          <EmptyState
            icon={PawPrint}
            title="No pets yet"
            description="Add your first pet to get started."
            action={{ label: 'Add Pet', onClick: openAdd }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {petList.map((pet: { _id: string; name: string; type?: string; breed?: string; gender?: string; dateOfBirth?: string }) => (
              <Card key={pet._id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                      <PawPrint className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="truncate text-base font-semibold">{pet.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {pet.type && <Badge variant="outline" className="text-xs">{pet.type}</Badge>}
                        {pet.breed && <span className="text-xs text-muted-foreground">{pet.breed}</span>}
                      </div>
                      {pet.gender && (
                        <p className="mt-1 text-xs text-muted-foreground">{pet.gender}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(pet)}>
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setDeleteId(pet._id)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add / Edit Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>{editingPet ? 'Edit Pet' : 'Add Pet'}</SheetTitle>
            </SheetHeader>
            <PetForm
              pet={editingPet}
              userId={userId}
              onSuccess={() => {
                setSheetOpen(false)
                setEditingPet(null)
                mutate()
              }}
            />
          </SheetContent>
        </Sheet>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={() => setDeleteId(null)}
          title="Delete pet?"
          description="This action cannot be undone. All data for this pet will be permanently removed."
          onConfirm={handleDelete}
          confirmLabel="Delete"
          loading={deleting}
        />
      </PageShell>
    </AppLayout>
  )
}
