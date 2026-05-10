'use client'

import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useClients, useSitters } from '@/hooks/useData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

type User = {
  _id: string
  firstName?: string
  lastName?: string
  name?: string
  email: string
  phoneNumber?: string
  cellPhoneNumber?: string
  role: string
  status?: string
  formStatus?: string
  assignedSitterId?: string
}

type Sitter = { _id: string; firstName?: string; lastName?: string }

function userName(u: User) {
  if (u.firstName || u.lastName) return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
  return u.name || u.email
}

function userPhone(u: User) {
  return u.cellPhoneNumber || u.phoneNumber || '—'
}

function FormStatusBadge({ status }: { status?: string }) {
  if (!status || status === 'not complete') {
    return <Badge variant="outline" className="text-xs text-muted-foreground">Incomplete</Badge>
  }
  return <Badge variant="outline" className="text-xs text-green-600 border-green-300">Form Complete</Badge>
}

export function UsersTab() {
  const { data: clientsData, mutate: mutateClients } = useClients()
  const { data: sittersData } = useSitters()

  const clients: User[] = Array.isArray(clientsData) ? clientsData : []
  const sitters: Sitter[] = Array.isArray(sittersData) ? sittersData : []

  const [approveId, setApproveId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    if (!approveId || !password) return
    setLoading(true)
    try {
      await api.put(`/users/approve/${approveId}`, { password })
      toast.success('User approved')
      setApproveId(null)
      setPassword('')
      mutateClients()
    } catch {
      toast.error('Failed to approve user')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectId) return
    setLoading(true)
    try {
      await api.delete(`/users/${rejectId}`)
      toast.success('User rejected')
      setRejectId(null)
      mutateClients()
    } catch {
      toast.error('Failed to reject user')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignSitter = async (clientId: string, sitterId: string) => {
    try {
      await api.put(`/users/${clientId}/assign-sitter`, { sitterId: sitterId === 'none' ? null : sitterId })
      toast.success('Sitter assigned')
      mutateClients()
    } catch {
      toast.error('Failed to assign sitter')
    }
  }

  const columns: ColumnDef<User, unknown>[] = useMemo(() => [
    {
      accessorKey: 'firstName',
      header: 'Name',
      cell: ({ row }) => <span className="font-medium">{userName(row.original)}</span>,
    },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone',
      cell: ({ row }) => userPhone(row.original),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <span className="capitalize">{row.original.role}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status || 'active'} />,
    },
    {
      accessorKey: 'formStatus',
      header: 'Form Status',
      cell: ({ row }) => <FormStatusBadge status={row.original.formStatus} />,
    },
    {
      id: 'assignedSitter',
      header: 'Assigned Sitter',
      enableSorting: false,
      cell: ({ row }) => (
        <Select
          defaultValue={row.original.assignedSitterId || 'none'}
          onValueChange={(val) => handleAssignSitter(row.original._id, val)}
        >
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Select Sitter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select Sitter</SelectItem>
            {sitters.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {s.firstName} {s.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => {
        if (row.original.status !== 'pending') return null
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setApproveId(row.original._id)}>Approve</Button>
            <Button size="sm" variant="destructive" onClick={() => setRejectId(row.original._id)}>Reject</Button>
          </div>
        )
      },
    },
  ], [sitters])

  return (
    <>
      <DataTable columns={columns} data={clients} searchPlaceholder="Search users..." searchKey="email" />

      <Dialog open={!!approveId} onOpenChange={(o) => !o && setApproveId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve User</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Set initial password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Temporary password" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveId(null)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={!password || loading}>{loading ? 'Approving...' : 'Approve'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!rejectId}
        onOpenChange={(o) => !o && setRejectId(null)}
        title="Reject this user?"
        description="This will permanently remove the user account."
        onConfirm={handleReject}
        confirmLabel="Reject"
        loading={loading}
      />
    </>
  )
}
