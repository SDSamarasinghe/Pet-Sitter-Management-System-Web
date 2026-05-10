'use client'

import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useSitters } from '@/hooks/useData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import api from '@/lib/api'

type Sitter = {
  _id: string
  firstName?: string
  lastName?: string
  email: string
  phoneNumber?: string
  cellPhoneNumber?: string
  address?: string
  role: string
  status?: string
  about?: string
  experience?: string
  emergencyContact?: string
  createdAt?: string
}

function sitterName(s: Sitter) {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || s.email
}

function sitterPhone(s: Sitter) {
  return s.cellPhoneNumber || s.phoneNumber || '—'
}

export function SittersTab() {
  const { data: sittersData, mutate } = useSitters()
  const sitters: Sitter[] = Array.isArray(sittersData) ? sittersData : []

  const [approveId, setApproveId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [detailSitter, setDetailSitter] = useState<Sitter | null>(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    if (!approveId || !password) return
    setLoading(true)
    try {
      await api.put(`/users/approve/${approveId}`, { password })
      toast.success('Sitter approved')
      setApproveId(null)
      setPassword('')
      mutate()
    } catch {
      toast.error('Failed to approve sitter')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectId) return
    setLoading(true)
    try {
      await api.delete(`/users/${rejectId}`)
      toast.success('Sitter rejected')
      setRejectId(null)
      mutate()
    } catch {
      toast.error('Failed to reject sitter')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setLoading(true)
    try {
      await api.delete(`/users/${deleteId}`)
      toast.success('Sitter deleted')
      setDeleteId(null)
      mutate()
    } catch {
      toast.error('Failed to delete sitter')
    } finally {
      setLoading(false)
    }
  }

  const columns: ColumnDef<Sitter, unknown>[] = useMemo(() => [
    {
      accessorKey: 'firstName',
      header: 'Name',
      cell: ({ row }) => <span className="font-medium">{sitterName(row.original)}</span>,
    },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone',
      cell: ({ row }) => sitterPhone(row.original),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status || 'active'} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Applied Date',
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
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const s = row.original
        return (
          <div className="flex flex-wrap gap-1">
            {s.status === 'pending' && (
              <>
                <Button size="sm" onClick={() => setApproveId(s._id)}>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => setRejectId(s._id)}>Reject</Button>
              </>
            )}
            <Button size="sm" variant="outline" onClick={() => setDetailSitter(s)}>View Details</Button>
            <Button size="sm" variant="destructive" onClick={() => setDeleteId(s._id)}>Delete</Button>
          </div>
        )
      },
    },
  ], [])

  return (
    <>
      <DataTable
        columns={columns}
        data={sitters}
        searchPlaceholder="Search sitters by name, email, phone, or status..."
        searchKey="email"
      />

      {/* Approve Dialog */}
      <Dialog open={!!approveId} onOpenChange={(o) => !o && setApproveId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Approve Sitter</DialogTitle></DialogHeader>
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

      {/* Reject confirm */}
      <ConfirmDialog
        open={!!rejectId}
        onOpenChange={(o) => !o && setRejectId(null)}
        title="Reject this sitter?"
        description="This will remove the sitter application."
        onConfirm={handleReject}
        confirmLabel="Reject"
        loading={loading}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete this sitter?"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        confirmLabel="Delete"
        loading={loading}
      />

      {/* View Details Dialog */}
      {detailSitter && (
        <Dialog open onOpenChange={() => setDetailSitter(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Sitter Details</DialogTitle>
              <p className="text-sm text-muted-foreground">{sitterName(detailSitter)}</p>
            </DialogHeader>

            {/* Basic Information */}
            <div className="space-y-3 rounded-lg border p-4">
              <h3 className="text-sm font-semibold text-primary">Basic Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">First Name</Label>
                  <div className="rounded border px-3 py-2 text-sm">{detailSitter.firstName || '—'}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Last Name</Label>
                  <div className="rounded border px-3 py-2 text-sm">{detailSitter.lastName || '—'}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="rounded border px-3 py-2 text-sm">{detailSitter.email}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <div className="rounded border px-3 py-2 text-sm">{sitterPhone(detailSitter)}</div>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <div className="rounded border px-3 py-2 text-sm">{detailSitter.address || '—'}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <div className="rounded border px-3 py-2 text-sm capitalize">{detailSitter.role}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="rounded border px-3 py-2">
                    <StatusBadge status={detailSitter.status || 'active'} />
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="text-sm font-semibold text-red-600">Emergency Contact</h3>
              <div className="rounded border bg-white px-3 py-2 text-sm">
                {detailSitter.emergencyContact || '—'}
              </div>
            </div>

            {/* Experience & Qualifications */}
            <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="text-sm font-semibold text-blue-600">Experience &amp; Qualifications</h3>
              <div className="rounded border bg-white px-3 py-2 text-sm">
                {detailSitter.about || detailSitter.experience || '—'}
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-3 rounded-lg border p-4">
              <h3 className="text-sm font-semibold">Account Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Applied/Created At</Label>
                  <div className="rounded border px-3 py-2 text-sm">
                    {detailSitter.createdAt
                      ? new Date(detailSitter.createdAt).toLocaleString('en-US', {
                          month: 'short', day: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : '—'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Sitter ID</Label>
                  <div className="rounded border px-3 py-2 text-sm font-mono text-xs">{detailSitter._id}</div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailSitter(null)}>Close</Button>
              <Button
                onClick={() => {
                  window.location.href = `mailto:${detailSitter.email}`
                }}
              >
                Contact Sitter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
