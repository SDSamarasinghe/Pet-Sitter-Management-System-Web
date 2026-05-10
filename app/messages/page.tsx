'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageShell } from '@/components/layout/PageShell'
import { useRecentNotes, useAvailableNoteUsers } from '@/hooks/useData'
import { getUserFromToken } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import api from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'

type NoteUser = { _id: string; firstName: string; lastName: string; email: string; role: string }
type NoteReply = { senderId: any; text: string; createdAt: string }
type Note = {
  _id: string
  senderId: any
  recipientId: any
  text: string
  replies: NoteReply[]
  createdAt: string
}

function initials(u: any) {
  if (!u) return '?'
  if (typeof u === 'string') return u[0]?.toUpperCase() ?? '?'
  return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || '?'
}

function displayName(u: any) {
  if (!u) return 'Unknown'
  if (typeof u === 'string') return u
  return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || 'Unknown'
}

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<{ userId: string; role: string } | null>(null)
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [noteText, setNoteText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [filterUser, setFilterUser] = useState('all')
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [submittingReply, setSubmittingReply] = useState(false)

  useEffect(() => {
    const decoded = getUserFromToken()
    if (decoded) setCurrentUser({ userId: decoded.userId, role: decoded.role })
  }, [])

  const { data: recentNotes, isLoading: notesLoading, mutate: mutateNotes } = useRecentNotes(50)
  const { data: availableUsers } = useAvailableNoteUsers()

  const notes: Note[] = Array.isArray(recentNotes) ? recentNotes : []
  const users: NoteUser[] = Array.isArray(availableUsers) ? availableUsers : []

  const filteredNotes =
    filterUser === 'all'
      ? notes
      : notes.filter(
          (n) =>
            n.senderId?._id === filterUser ||
            n.recipientId?._id === filterUser ||
            n.senderId === filterUser ||
            n.recipientId === filterUser
        )

  const handleAddNote = async () => {
    if (!selectedRecipient || !noteText.trim()) return
    setSubmitting(true)
    try {
      await api.post('/notes', { recipientId: selectedRecipient, text: noteText.trim() })
      toast.success('Note added')
      setNoteText('')
      setSelectedRecipient('')
      mutateNotes()
    } catch {
      toast.error('Failed to add note')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddReply = async (noteId: string) => {
    const text = replyTexts[noteId]?.trim()
    if (!text) return
    setSubmittingReply(true)
    try {
      await api.post(`/notes/${noteId}/replies`, { text })
      toast.success('Reply added')
      setReplyTexts((prev) => ({ ...prev, [noteId]: '' }))
      setReplyingTo(null)
      mutateNotes()
    } catch {
      toast.error('Failed to add reply')
    } finally {
      setSubmittingReply(false)
    }
  }

  if (!currentUser) return null

  return (
    <AppLayout>
      <PageShell title="Communication" description="Send notes and messages to users.">
        {/* Add Note */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="Select the person to add note" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u._id} value={u._id}>
                    {u.firstName} {u.lastName} — {u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              rows={5}
              placeholder="Write your note here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />

            <div className="flex justify-end">
              <Button
                onClick={handleAddNote}
                disabled={!selectedRecipient || !noteText.trim() || submitting}
              >
                {submitting ? 'Adding...' : 'Add Note'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Notes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Notes</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Filter by user</span>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.firstName} {u.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {notesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No notes yet.</p>
            ) : (
              filteredNotes.map((note) => (
                <div key={note._id} className="space-y-2">
                  {/* Note */}
                  <div className="flex gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {initials(note.senderId)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="text-sm">
                        <span className="font-semibold">{displayName(note.senderId)}</span>
                        <span className="text-muted-foreground"> added a note for </span>
                        <span className="font-semibold text-primary">
                          {displayName(note.recipientId)}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {note.createdAt
                            ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })
                            : ''}
                        </span>
                      </div>
                      <p className="text-sm">{note.text}</p>

                      {/* Replies */}
                      {note.replies?.length > 0 && (
                        <div className="ml-4 mt-2 space-y-2 border-l-2 border-border pl-3">
                          {note.replies.map((reply, i) => (
                            <div key={i} className="text-sm">
                              <span className="font-semibold">{displayName(reply.senderId)}</span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                {reply.createdAt
                                  ? formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })
                                  : ''}
                              </span>
                              <p className="text-sm mt-0.5">{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Reply */}
                      {replyingTo === note._id ? (
                        <div className="flex gap-2 mt-2">
                          <Textarea
                            rows={2}
                            placeholder="Write a reply..."
                            className="text-sm"
                            value={replyTexts[note._id] ?? ''}
                            onChange={(e) =>
                              setReplyTexts((prev) => ({ ...prev, [note._id]: e.target.value }))
                            }
                          />
                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleAddReply(note._id)}
                              disabled={submittingReply || !replyTexts[note._id]?.trim()}
                            >
                              Reply
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setReplyingTo(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(note._id)}
                          className="text-xs text-primary hover:underline mt-1"
                        >
                          + Add Reply
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="border-b border-border last:border-b-0" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </PageShell>
    </AppLayout>
  )
}
