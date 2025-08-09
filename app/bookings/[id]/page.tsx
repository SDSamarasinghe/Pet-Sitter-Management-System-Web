'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import api from '@/lib/api';
import { isAuthenticated, getUserFromToken } from '@/lib/auth';
import { ArrowLeft, Calendar, Clock, MapPin, PawPrint, User, MessageCircle, Send, Edit, Trash2 } from 'lucide-react';

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

interface Booking {
  _id: string;
  startDate: string;
  endDate: string;
  serviceType: string;
  status: string;
  notes?: string;
  pets?: Pet[];
  userId?: User;
  sitterId?: User;
  specialInstructions?: string;
  emergencyInstructions?: string;
  veterinarianInfo?: {
    name: string;
    phone: string;
    address: string;
  };//ss
  createdAt: string;
  updatedAt: string;
  totalAmount?: number;
  paidAmount?: number;
  paymentStatus?: string;
}

interface Comment {
  _id: string;
  bookingId: string;
  addedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  body: string;
  role: string;
  attachments: any[];
  isInternal: boolean;
  readBy: Array<{
    user: string;
    readAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CommentsResponse {
  comments: Comment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalComments: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  const bookingId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = getUserFromToken();
    setCurrentUser(user);
    if (user?.role === 'sitter') {
      fetchSitterBookingDetails(user.userId);
    } else {
      fetchBookingDetails();
    }
    fetchComments();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data);
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch booking details',
        variant: 'destructive',
      });
      if (error.response?.status === 404) {
        router.push('/bookings');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch booking for sitter by sitterId
  const fetchSitterBookingDetails = async (sitterId: string) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/bookings/sitter/${sitterId}`);
      // If the API returns an array, find the booking with the current bookingId
      let bookingData = response.data;
      if (Array.isArray(bookingData)) {
        bookingData = bookingData.find((b: any) => b._id === bookingId);
      }
      setBooking(bookingData || null);
    } catch (error: any) {
      console.error('Error fetching sitter booking:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch sitter booking details',
        variant: 'destructive',
      });
      if (error.response?.status === 404) {
        router.push('/bookings');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setIsLoadingComments(true);
      const response = await api.get(`/comments/booking/${bookingId}`);
      const data: CommentsResponse = response.data;
      setComments(data.comments);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch comments',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      const response = await api.post('/comments', {
        bookingId,
        body: newComment.trim(),
        isInternal: false
      });
      
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editCommentText.trim()) return;

    try {
      const response = await api.put(`/comments/${commentId}`, {
        body: editCommentText.trim()
      });
      
      setComments(prev => prev.map(comment => 
        comment._id === commentId ? response.data : comment
      ));
      setEditingComment(null);
      setEditCommentText('');
      toast({
        title: 'Success',
        description: 'Comment updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating comment:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update comment',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(comment => comment._id !== commentId));
      toast({
        title: 'Success',
        description: 'Comment deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'sitter':
        return 'bg-green-100 text-green-800';
      case 'client':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Always render header and layout, show spinner if not authenticated
  const authenticated = isAuthenticated();
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Alert>
            <AlertDescription>
              Booking not found or you don't have permission to view it.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const startDateTime = formatDateTime(booking.startDate);
  const endDateTime = formatDateTime(booking.endDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/bookings')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {booking.serviceType}
              </h1>
              <p className="text-gray-600 mt-1">
                Booking ID: {booking._id}
              </p>
            </div>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Start</span>
                  </div>
                  <p className="text-gray-900">{startDateTime.date}</p>
                  <p className="text-gray-600">{startDateTime.time}</p>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">End</span>
                  </div>
                  <p className="text-gray-900">{endDateTime.date}</p>
                  <p className="text-gray-600">{endDateTime.time}</p>
                </div>
                {/* Sitter status update dropdown */}
                {currentUser && booking.sitterId && booking.sitterId._id === currentUser.userId && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update Booking Status</label>
                    <select
                      value={booking.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          const response = await api.put(`/bookings/${bookingId}`, { status: newStatus });
                          setBooking(response.data);
                          toast({
                            title: 'Status updated',
                            description: `Booking status changed to ${newStatus}`,
                          });
                        } catch (error: any) {
                          toast({
                            title: 'Error',
                            description: error.response?.data?.message || 'Failed to update status',
                            variant: 'destructive',
                          });
                        }
                      }}
                      className="border rounded px-3 py-2 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PawPrint className="h-5 w-5" />
                  Pets ({booking.pets?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(booking.pets || []).map((pet) => (
                    <div key={pet._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <PawPrint className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{pet.name}</p>
                        <p className="text-sm text-gray-600">
                          {pet.species} {pet.breed && `• ${pet.breed}`} {pet.age && `• ${pet.age} years`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span role="img" aria-label="payment" className="h-5 w-5">💳</span>
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Total Amount:</span>
                    <span className="text-gray-900">${booking.totalAmount?.toFixed(2) ?? '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Paid Amount:</span>
                    <span className="text-gray-900">${booking.paidAmount?.toFixed(2) ?? '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Payment Status:</span>
                    <span className="text-gray-900">{booking.paymentStatus ?? 'pending'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes & Instructions */}
            {(booking.notes || booking.specialInstructions || booking.emergencyInstructions) && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes & Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">General Notes</h4>
                      <p className="text-gray-700">{booking.notes}</p>
                    </div>
                  )}
                  {booking.specialInstructions && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                      <p className="text-gray-700">{booking.specialInstructions}</p>
                    </div>
                  )}
                  {booking.emergencyInstructions && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Emergency Instructions</h4>
                      <p className="text-gray-700">{booking.emergencyInstructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {booking.userId?.firstName?.[0] || 'U'}{booking.userId?.lastName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.userId?.firstName || 'Unknown'} {booking.userId?.lastName || 'User'}
                    </p>
                    <p className="text-sm text-gray-600">{booking.userId?.email || 'No email provided'}</p>
                  </div>
                </div>
                
                {booking.userId?.address && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Address</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {booking.userId.address.street}<br />
                      {booking.userId.address.city}, {booking.userId.address.state} {booking.userId.address.zipCode}
                    </p>
                  </div>
                )}

                {booking.userId?.emergencyContact && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Emergency Contact</h4>
                    <p className="text-sm text-gray-700">{booking.userId.emergencyContact.name}</p>
                    <p className="text-sm text-gray-600">{booking.userId.emergencyContact.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sitter Information */}
            {booking.sitterId && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Sitter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {booking.sitterId?.firstName?.[0] || 'S'}{booking.sitterId?.lastName?.[0] || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.sitterId?.firstName || 'Unknown'} {booking.sitterId?.lastName || 'Sitter'}
                      </p>
                      <p className="text-sm text-gray-600">{booking.sitterId?.email || 'No email provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Veterinarian Info */}
            {booking.veterinarianInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Veterinarian</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">{booking.veterinarianInfo?.name || 'Not provided'}</p>
                    <p className="text-sm text-gray-600">{booking.veterinarianInfo?.phone || 'No phone provided'}</p>
                    <p className="text-sm text-gray-700">{booking.veterinarianInfo?.address || 'No address provided'}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Comment */}
            <div className="mb-6">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-3"
                rows={3}
              />
              <Button 
                onClick={handleSubmitComment}
                disabled={isSubmittingComment || !newComment.trim()}
                className="w-full sm:w-auto"
              >
                {isSubmittingComment ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </>
                )}
              </Button>
            </div>

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {comment.addedBy.firstName[0]}{comment.addedBy.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {comment.addedBy.firstName} {comment.addedBy.lastName}
                            </p>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getRoleBadgeColor(comment.role)}`}
                            >
                              {comment.role}
                            </Badge>
                            {comment.isInternal && (
                              <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
                                Internal
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                            {comment.updatedAt !== comment.createdAt && ' (edited)'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Edit/Delete buttons for comment author */}
                      {currentUser && comment.addedBy._id === currentUser.userId && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingComment(comment._id);
                              setEditCommentText(comment.body);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {editingComment === comment._id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="w-full"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleEditComment(comment._id)}
                          >
                            Save
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingComment(null);
                              setEditCommentText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.body}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
