"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface User {
  id: string;
  _id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  profilePicture?: string;
}

interface CommunicationTabProps {
  user: User;
}

// UserAvatar component
const UserAvatar: React.FC<{ user: any; size?: 'sm' | 'md' | 'lg' }> = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-lg'
  };

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || user?.lastName || user?.email || 'User';
  
  const initials = displayName.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase().slice(0, 2);

  const isValidProfilePicture =
    user?.profilePicture &&
    typeof user.profilePicture === 'string' &&
    user.profilePicture.trim() !== '' &&
    !user.profilePicture.includes('test-avatar.jpg') &&
    !user.profilePicture.includes('default-avatar') &&
    !user.profilePicture.includes('sample');

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0`}>
      {isValidProfilePicture ? (
        <img 
          src={user.profilePicture} 
          alt={displayName}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-white font-medium">
          {initials}
        </span>
      )}
    </div>
  );
};

export function CommunicationTab({ user }: CommunicationTabProps) {
  const { toast } = useToast();
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [noteText, setNoteText] = useState("");
  const [replyingNoteId, setReplyingNoteId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [filterByUser, setFilterByUser] = useState<string>("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableUsers();
    fetchNotes();
  }, [filterByUser]);

  const fetchAvailableUsers = async () => {
    try {
      const response = await api.get('/notes/users/available');
      setAvailableUsers(response.data ?? []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      let endpoint = '/notes/recent/20';
      if (filterByUser) {
        endpoint = `/notes?recipientId=${filterByUser}&limit=20`;
      }
      const response = await api.get(endpoint);
      setNotes(response.data.notes || response.data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleAddNote = async () => {
    if (!selectedClient || !noteText.trim() || isSubmittingNote) return;
    
    setIsSubmittingNote(true);
    try {
      await api.post('/notes', {
        recipientId: selectedClient,
        text: noteText,
      });
      
      setNoteText("");
      setSelectedClient("");
      await fetchNotes();
      
      toast({
        title: "Note added successfully",
      });
    } catch (error) {
      console.error("Error creating note:", error);
      toast({
        title: "Error creating note",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleReply = async (noteId: string) => {
    if (!replyText.trim() || isSubmittingReply) return;
    
    setIsSubmittingReply(true);
    try {
      await api.post(`/notes/${noteId}/replies`, {
        text: replyText,
      });
      
      setReplyText("");
      setReplyingNoteId(null);
      await fetchNotes();
      
      toast({
        title: "Reply added successfully",
      });
    } catch (error) {
      console.error("Error adding reply:", error);
      toast({
        title: "Error adding reply",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Note Section */}
      {user?.role !== 'client' && (
        <Card className="card-modern">
          <CardHeader>
            <CardTitle>Add Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="input-modern w-full appearance-none"
              >
                <option value="">Select the person to add note</option>
                {availableUsers.map((usr) => (
                  <option key={usr._id || usr.id} value={usr._id || usr.id}>
                    {usr.firstName} {usr.lastName} ({usr.role})
                  </option>
                ))}
              </select>
            </div>
            
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write your note here..."
              className="input-modern w-full resize-none"
              rows={4}
            />
            
            <div className="flex justify-end">
              <Button 
                onClick={handleAddNote}
                disabled={!selectedClient || !noteText.trim() || isSubmittingNote}
                className="btn-primary"
              >
                {isSubmittingNote ? 'Adding...' : 'Add Note'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Notes */}
      <Card className="card-modern">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Notes</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filter by user</span>
              <select
                value={filterByUser}
                onChange={(e) => setFilterByUser(e.target.value)}
                className="input-modern text-sm"
              >
                <option value="">All Users</option>
                {availableUsers.map((usr) => (
                  <option key={usr._id || usr.id} value={usr._id || usr.id}>
                    {usr.firstName} {usr.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
            {notes.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No notes yet. Add your first note above!
              </div>
            ) : (
              notes.map((note) => (
                <div key={note._id || note.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <UserAvatar user={note.senderId} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {note.senderId?._id === user?._id || note.senderId?.id === user?.id ? 'You' : 
                           `${note.senderId?.firstName} ${note.senderId?.lastName}`}
                        </span>
                        <span className="text-sm text-gray-500">added a note for</span>
                        <span className="font-medium text-primary">
                          {note.recipientId?._id === user?._id || note.recipientId?.id === user?.id ? 'You' : 
                           `${note.recipientId?.firstName} ${note.recipientId?.lastName}`}
                        </span>
                        <span className="text-sm text-gray-400">
                          {new Date(note.createdAt || note.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{note.text}</p>
                      
                      {/* Replies */}
                      {note.replies && note.replies.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {note.replies.map((reply: any) => (
                            <div key={reply._id || reply.id} className="border-t pt-2">
                              <div className="flex items-start space-x-2">
                                <UserAvatar user={reply.senderId} size="sm" />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-gray-900 text-sm">
                                      {reply.senderId?._id === user?._id ? 'You' : 
                                       `${reply.senderId?.firstName} ${reply.senderId?.lastName}`}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {new Date(reply.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-sm">{reply.text}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Reply Actions */}
                      <div className="mt-4">
                        {replyingNoteId === (note._id || note.id) ? (
                          <div className="space-y-2">
                            <textarea
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder="Add Reply"
                              className="input-modern w-full resize-none"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleReply(note._id || note.id)}
                                disabled={!replyText.trim() || isSubmittingReply}
                                size="sm"
                              >
                                {isSubmittingReply ? 'Submitting...' : 'Submit'}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => { 
                                  setReplyingNoteId(null); 
                                  setReplyText(""); 
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setReplyingNoteId(note._id || note.id)}
                          >
                            + Add Reply
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
