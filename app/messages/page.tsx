'use client'

import { useEffect, useState, useRef } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageShell } from '@/components/layout/PageShell'
import { useRecentNotes, useAvailableNoteUsers } from '@/hooks/useData'
import { getUserFromToken } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Paperclip, X } from 'lucide-react'
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
type NoteAttachment = { type: 'image' | 'document'; url: string; filename: string }
type NoteReply = { senderId: any; text: string; createdAt: string; attachments?: NoteAttachment[] }
type Note = {
  _id: string
  senderId: any
  recipientId: any
  text: string
  attachments?: NoteAttachment[]
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

function AttachmentList({ attachments }: { attachments?: NoteAttachment[] }) {
  if (!attachments?.length) return null

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {attachments.map((attachment, index) => (
        <a
          key={`${attachment.url}-${index}`}
          href={attachment.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-primary hover:bg-muted"
        >
          <Paperclip className="h-3 w-3" />
          <span className="max-w-40 truncate">{attachment.filename}</span>
          <span className="rounded-full bg-background px-1.5 py-0.5 uppercase text-[10px] text-muted-foreground">
            {attachment.type}
          </span>
        </a>
      ))}
    </div>
  )
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
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [replyAttachedFile, setReplyAttachedFile] = useState<Record<string, File | null>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const replyFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

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
      const attachments: Array<{ type: 'image' | 'document'; url: string; filename: string }> = []
      
      // If file is attached, upload it first
      if (attachedFile) {
        const fileFormData = new FormData()
        fileFormData.append('file', attachedFile)
        
        const uploadRes = await api.post('/upload/note-attachment', fileFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        const uploadData = uploadRes.data
        attachments.push({
          type: attachedFile.type.startsWith('image') ? 'image' : 'document',
          url: uploadData.url,
          filename: attachedFile.name,
        })
      }
      
      // Send note with attachment metadata
      await api.post('/notes', {
        recipientId: selectedRecipient,
        text: noteText.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
      })
      
      toast.success('Note added')
      setNoteText('')
      setSelectedRecipient('')
      setAttachedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      mutateNotes()
    } catch (error) {
      const err = error as any
      const msg = err?.response?.data?.message || 'Failed to add note'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB')
        return
      }
      setAttachedFile(file)
    }
  }

  const handleReplyFileSelect = (noteId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB')
        return
      }
      setReplyAttachedFile((prev) => ({ ...prev, [noteId]: file }))
    }
  }

  const handleAddReply = async (noteId: string) => {
    const text = replyTexts[noteId]?.trim()
    if (!text) return
    setSubmittingReply(true)
    try {
      const attachments: Array<{ type: 'image' | 'document'; url: string; filename: string }> = []
      const file = replyAttachedFile[noteId]
      
      // If file is attached, upload it first
      if (file) {
        const fileFormData = new FormData()
        fileFormData.append('file', file)
        
        const uploadRes = await api.post('/upload/note-attachment', fileFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        const uploadData = uploadRes.data
        attachments.push({
          type: file.type.startsWith('image') ? 'image' : 'document',
          url: uploadData.url,
          filename: file.name,
        })
      }
      
      // Send reply with attachment metadata
      await api.post(`/notes/${noteId}/replies`, {
        text,
        attachments: attachments.length > 0 ? attachments : undefined,
      })
      
      toast.success('Reply added')
      setReplyTexts((prev) => ({ ...prev, [noteId]: '' }))
      setReplyAttachedFile((prev) => ({ ...prev, [noteId]: null }))
      if (replyFileInputRefs.current[noteId]) replyFileInputRefs.current[noteId]!.value = ''
      setReplyingTo(null)
      mutateNotes()
    } catch (error) {
      const err = error as any
      const msg = err?.response?.data?.message || 'Failed to add reply'
      toast.error(msg)
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

            {/* File attachment */}
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <Paperclip className="h-4 w-4" />
                Attach File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
              {attachedFile && (
                <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                  <span>{attachedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

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
                      <AttachmentList attachments={note.attachments} />

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
                              <AttachmentList attachments={reply.attachments} />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Reply */}
                      {replyingTo === note._id ? (
                        <div className="space-y-2 mt-2">
                          <div className="flex gap-2">
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
                          {/* File attachment for reply */}
                          <div className="flex items-center gap-2 text-sm">
                            <button
                              type="button"
                              onClick={() => replyFileInputRefs.current[note._id]?.click()}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            >
                              <Paperclip className="h-3 w-3" />
                              Attach
                            </button>
                            <input
                              ref={(el) => {
                                if (el) replyFileInputRefs.current[note._id] = el
                              }}
                              type="file"
                              className="hidden"
                              onChange={(e) => handleReplyFileSelect(note._id, e)}
                            />
                            {replyAttachedFile[note._id] && (
                              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                                <span>{replyAttachedFile[note._id]!.name}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplyAttachedFile((prev) => ({ ...prev, [note._id]: null }))
                                    if (replyFileInputRefs.current[note._id]) replyFileInputRefs.current[note._id]!.value = ''
                                  }}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            )}
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
