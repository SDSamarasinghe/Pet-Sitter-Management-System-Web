'use client'

import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/DataTable'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAllPets } from '@/hooks/useData'

type Pet = {
  _id: string
  name: string
  type: string
  breed?: string
  age?: string
  emergencyContact?: string
  userId?: { email?: string; firstName?: string; lastName?: string } | string
  createdAt?: string
}

function ownerDisplay(u: Pet['userId']) {
  if (!u) return '—'
  if (typeof u === 'string') return u
  const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
  return u.email ? `${name} (${u.email})` : name || u.email || '—'
}

export function PetsTab() {
  const { data, isLoading, mutate } = useAllPets()
  const pets: Pet[] = Array.isArray(data) ? data : []
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  const columns: ColumnDef<Pet, unknown>[] = useMemo(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'type', header: 'Type' },
      { accessorKey: 'breed', header: 'Breed', cell: ({ row }) => row.original.breed || '—' },
      { accessorKey: 'age', header: 'Age', cell: ({ row }) => row.original.age || 'N/A' },
      {
        id: 'owner',
        header: 'Owner',
        cell: ({ row }) => ownerDisplay(row.original.userId),
      },
      {
        accessorKey: 'emergencyContact',
        header: 'Emergency Contact',
        cell: ({ row }) => row.original.emergencyContact || '—',
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) =>
          row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleString('en-US', {
                month: 'short', day: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })
            : '—',
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(row.original._id)}>
            Delete
          </Button>
        ),
      },
    ],
    []
  )

  return (
    <>
      <DataTable columns={columns} data={pets} isLoading={isLoading} searchPlaceholder="Search pets by name, type, breed, age, or owner..." searchKey="name" />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete this pet?"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        confirmLabel="Delete"
        loading={deleting}
      />
    </>
  )
}
