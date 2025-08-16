'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TableBody,Table, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { Dialog,DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { isAuthenticated, getUserRole } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  homeCareInfo?: string;
  pendingAddressChange?: string;
}

interface Sitter {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  homeCareInfo?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Booking {
  _id: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  serviceType: string;
  status: string;
  clientName: string;
  pets: Array<{ name: string; }>;
  assignedSitter?: string | null;
  sitterId?: string | {
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  sitterName?: string | null;
  paymentStatus?: string;
}

interface Pet {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  breed?: string;
  age?: string;
  weight?: number;
  allergies?: string;
  medications?: string;
  emergencyContact?: string;
  veterinarianInfo?: string;
  createdAt?: string;
  userId?: {
    _id: string;
    email: string;
  };
}

interface ApprovalFormData {
  password: string;
  confirmPassword: string;
  notes?: string;
}




export default function AdminPage() {
  console.log('AdminPage component rendered');
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedSitter, setSelectedSitter] = useState<Sitter | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'bookings' | 'address-changes' | 'sitters' | 'pets' | 'communication'>('users');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [formData, setFormData] = useState<ApprovalFormData>({
    password: '',
    confirmPassword: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Communication tab state
  const [selectedClient, setSelectedClient] = useState("");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [replyingNoteId, setReplyingNoteId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [filterByUser, setFilterByUser] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    console.log('AdminPage useEffect: isAuthenticated', isAuthenticated());
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userRole = getUserRole();
    console.log('AdminPage useEffect: userRole', userRole);
    if (userRole !== 'admin') {
      // Redirect non-admin users to their appropriate dashboard
      if (userRole === 'sitter') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    console.log('AdminPage useEffect: calling fetchData');
    fetchData();
  }, [router]);

  // Log data changes
  useEffect(() => {
    console.log('Data updated - Users:', users.length, 'Bookings:', bookings.length, 'Sitters:', sitters.length, 'Pets:', pets.length);
    console.log('Pets data:', pets);
  }, [users, bookings, sitters, pets]);

  // Refresh notes when communication tab is active or filter changes
  useEffect(() => {
    if (activeTab === 'communication') {
      refreshNotes();
    }
  }, [selectedClient, activeTab]);

  const fetchData = async () => {
    try {
      console.log('fetchData: fetching admin data...');
      const [clientsResponse, bookingsResponse, sittersResponse, petsResponse, usersResponse, notesResponse, profileResponse] = await Promise.all([
        api.get('/users/admin/clients'), // Fetch clients for Users tab
        api.get('/bookings'),
        api.get('/users/admin/sitters'),
        api.get('/pets'),
        api.get('/notes/users/available'), // For communication tab
        api.get('/notes/recent/20'), // For communication tab
        api.get('/users/profile') // Get current admin user
      ]);

      console.log('fetchData: clientsResponse', clientsResponse.data);
      console.log('fetchData: bookingsResponse', bookingsResponse.data);
      console.log('fetchData: sittersResponse', sittersResponse.data);
      console.log('fetchData: petsResponse', petsResponse.data);

      setUsers(clientsResponse.data || []);
      setBookings(bookingsResponse.data || []);
      setSitters(sittersResponse.data || []);
      setPets(petsResponse.data || []);
      setAvailableUsers(usersResponse.data || []);
      setNotes(notesResponse.data || []);
      setCurrentUser(profileResponse.data || null);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (actionType === 'approve') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }
    return true;
  };

  const handleSitterAction = async () => {
    if (!selectedSitter || !selectedSitter._id) {
      setError('Sitter ID is missing. Cannot process approval/rejection.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (actionType === 'approve') {
        await api.put(`/users/${selectedSitter._id}/approve`, {
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });
        setSuccess(`Sitter ${selectedSitter.firstName} ${selectedSitter.lastName} has been approved`);
      } else {
        await api.put(`/users/${selectedSitter._id}/reject`, {});
        setSuccess(`Sitter ${selectedSitter.firstName} ${selectedSitter.lastName} has been rejected`);
      }

      // Refresh the sitters list
      await fetchData();
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      setSelectedSitter(null);
      setFormData({ password: '', confirmPassword: '', notes: '' });
    } catch (error: any) {
      setError(error.response?.data?.message || `Failed to ${actionType} sitter`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSitterDialog = (sitter: Sitter, action: 'approve' | 'reject') => {
    // Ensure sitter has an id property
    setSelectedSitter({
      ...sitter,
      _id: sitter._id || (sitter as any)._id || ''
    });
    setActionType(action);
    setFormData({ password: '', confirmPassword: '', notes: '' });
    setError('');
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const approveAddressChange = async (userId: string, newAddress: string) => {
    try {
      await api.post(`/admin/users/${userId}/approve-address`, {
        address: newAddress
      });
      
      setSuccess('Address change approved successfully');
      fetchData(); // Refresh data
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to approve address change');
    }
  };

  const assignSitter = async (bookingId: string, sitterId: string) => {
    try {
      await api.put(`/bookings/${bookingId}/assign-sitter`, {
        sitterId
      });
      
      setSuccess('Sitter assigned successfully');
      fetchData(); // Refresh data
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to assign sitter');
    }
  };

  const unassignSitter = async (bookingId: string) => {
    try {
      await api.delete(`/bookings/${bookingId}/assign-sitter`);
      
      setSuccess('Sitter unassigned successfully');
      fetchData(); // Refresh data
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to unassign sitter');
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      // Get current user info (assumes JWT is stored and getUserFromToken is available)
      const token = localStorage.getItem('token');
      let userId = '';
      let role = '';
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload.userId;
          role = payload.role;
        } catch (e) {}
      }

      await api.put(`/bookings/${bookingId}`, {
        status
      }, {
        params: {
          userId,
          role
        }
      });
      setSuccess('Booking status updated successfully');
      fetchData(); // Refresh data
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update booking status');
    }
  };

  // Communication methods
  const handleAddNote = async () => {
    if (!selectedClient || !noteText.trim() || isSubmittingNote) return;
    
    setIsSubmittingNote(true);
    try {
      const noteData = {
        recipientId: selectedClient,
        text: noteText,
        attachments: []
      };
      
      await api.post('/notes', noteData);
      
      setNoteText("");
      setSelectedClient("");
      
      await refreshNotes();
      
      toast({
        title: 'Note added successfully!',
        description: 'Your note has been posted.',
      });
    } catch (error) {
      console.error("Error creating note:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to add note',
        description: 'Please try again.',
      });
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleReply = async (noteId: string) => {
    if (!replyText.trim() || isSubmittingReply) return;
    
    setIsSubmittingReply(true);
    try {
      const replyData = {
        text: replyText,
        attachments: []
      };
      
      await api.post(`/notes/${noteId}/replies`, replyData);
      
      setReplyText("");
      setReplyingNoteId(null);
      
      await refreshNotes();
      
      toast({
        title: 'Reply added successfully!',
        description: 'Your reply has been posted.',
      });
    } catch (error) {
      console.error("Error adding reply:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to add reply',
        description: 'Please try again.',
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const refreshNotes = async () => {
    try {
      let endpoint = '/notes/recent/20';
      if (filterByUser) {
        endpoint = `/notes?recipientId=${filterByUser}&limit=20`;
      }
      const response = await api.get(endpoint);
      setNotes(response.data.notes || response.data || []);
    } catch (error) {
      console.error("Error refreshing notes:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Loading admin dashboard..." />
      </div>
    );
  }

  const pendingAddressChanges = users.filter(user => user.pendingAddressChange);

  return (
    <div className="min-h-screen bg-gray-50">
     

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 border-green-400 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('sitters')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sitters' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sitters ({sitters.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('address-changes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'address-changes' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Address Changes ({pendingAddressChanges.length})
            </button>
            <button
              onClick={() => setActiveTab('communication')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'communication' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Communication ({notes.length})
            </button>
            <button
              onClick={() => setActiveTab('pets')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pets' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pets ({pets.length})
            </button>
          </nav>
        </div>

        {/* Sitters Tab */}
        {/* Pets Tab */}
        {activeTab === 'pets' && (
          <Card>
            <CardHeader>
              <CardTitle>All Pets ({pets.length})</CardTitle>
              <CardDescription>
                View all pets registered in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Breed</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Allergies</TableHead>
                      <TableHead>Medications</TableHead>
                      <TableHead>Owner Email</TableHead>
                      <TableHead>Emergency Contact</TableHead>
                      <TableHead>Veterinarian Info</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pets.length > 0 ? (
                      pets.map((pet, index) => (
                        <TableRow key={pet._id || pet.id || `pet-${index}`}>
                          <TableCell className="font-medium">{pet.name || 'N/A'}</TableCell>
                          <TableCell>{pet.type || 'N/A'}</TableCell>
                          <TableCell>{pet.breed || 'N/A'}</TableCell>
                          <TableCell>{pet.age || 'N/A'}</TableCell>
                          <TableCell>{pet.weight ? pet.weight.toString() : 'N/A'}</TableCell>
                          <TableCell>{pet.allergies || 'N/A'}</TableCell>
                          <TableCell>{pet.medications || 'N/A'}</TableCell>
                          <TableCell>{pet.userId?.email || 'N/A'}</TableCell>
                          <TableCell>{pet.emergencyContact || 'N/A'}</TableCell>
                          <TableCell>{pet.veterinarianInfo || 'N/A'}</TableCell>
                          <TableCell>{pet.createdAt ? new Date(pet.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8">
                          No pets found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
        {activeTab === 'sitters' && (
          <Card>
            <CardHeader>
              <CardTitle>Sitter Applications</CardTitle>
              <CardDescription>
                Manage pending sitter applications and view all registered sitters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sitters.length > 0 ? (
                      sitters.map((sitter) => (
                        <TableRow key={sitter._id || (sitter as any)._id}>
                          <TableCell className="font-medium">
                            {sitter.firstName} {sitter.lastName}
                          </TableCell>
                          <TableCell>{sitter.email}</TableCell>
                          <TableCell>{sitter.phone ? sitter.phone : sitter.emergencyContact || 'N/A'}</TableCell>
                          <TableCell>{getStatusBadge(sitter.status)}</TableCell>
                          <TableCell>
                            {new Date(sitter.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {sitter.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => openSitterDialog({ ...sitter, _id: sitter._id || (sitter as any)._id }, 'approve')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => openSitterDialog({ ...sitter, _id: sitter._id || (sitter as any)._id }, 'reject')}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // View details logic
                                  alert(`Name: ${sitter.firstName} ${sitter.lastName}\nEmail: ${sitter.email}\nPhone: ${sitter.phone}\nAddress: ${sitter.address}\nEmergency Contact: ${sitter.emergencyContact}\nExperience: ${sitter.homeCareInfo}`);
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No sitter applications found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>Clients ({users.length})</CardTitle>
              <CardDescription>
                List of all clients in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone || 'N/A'}</TableCell>
                          <TableCell>{user.address || 'N/A'}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'sitter' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No clients found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Card key={booking._id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">{booking.serviceType}</h3>
                          <p className="text-gray-600">Client: {booking.clientName}</p>
                          <p className="text-sm text-gray-500">
                            Start: {booking.startDate ? new Date(booking.startDate).toLocaleString() : 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            End: {booking.endDate ? new Date(booking.endDate).toLocaleString() : 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Pets: {(booking.pets ?? []).map(pet => pet.name).join(', ')}
                          </p>
                          {/* Show assigned sitter info if available */}
                          {(booking.assignedSitter || booking.sitterName || booking.sitterId) ? (
                            <p className="text-sm text-blue-600">
                              Assigned Sitter: {
                                booking.assignedSitter ? booking.assignedSitter :
                                booking.sitterName ? booking.sitterName :
                                (typeof booking.sitterId === 'object' && booking.sitterId !== null)
                                  ? `${booking.sitterId.firstName || ''} ${booking.sitterId.lastName || ''} (${booking.sitterId.email || ''})`
                                  : `Sitter ID: ${booking.sitterId}`
                              }
                            </p>
                          ) : (
                            <p className="text-sm text-red-600">
                              No sitter assigned
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 items-center">
                        {/* Show assign sitter dropdown only if no sitter is assigned */}
                        {(!booking.assignedSitter && !booking.sitterName && !booking.sitterId) && sitters.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <select 
                              onChange={(e) => assignSitter(booking._id, e.target.value)}
                              className="text-sm border rounded px-2 py-1"
                              defaultValue=""
                            >
                              <option value="">Select Sitter</option>
                              {sitters.map((sitter) => (
                                <option key={sitter._id} value={sitter._id}>
                                  {sitter.firstName} {sitter.lastName}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Show unassign button if sitter is assigned */}
                        {(
                          booking.assignedSitter ||
                          booking.sitterName ||
                          (typeof booking.sitterId === 'string' ? booking.sitterId : (booking.sitterId && typeof booking.sitterId === 'object'))
                        ) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => unassignSitter(booking._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Unassign Sitter
                          </Button>
                        )}

                        {/* Booking status dropdown with label */}
                        <div className="flex flex-col">
                          <label className="text-xs font-medium mb-1 text-gray-700">Booking Status</label>
                          <select 
                            value={booking.status}
                            onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        {/* Payment status dropdown with label */}
                        <div className="flex flex-col">
                          <label className="text-xs font-medium mb-1 text-gray-700">Payment Status</label>
                          <select
                            value={booking.paymentStatus || 'pending'}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                await api.put(`/bookings/${booking._id}/payment-status`, { paymentStatus: newStatus });
                                setSuccess('Payment status updated successfully');
                                fetchData();
                              } catch (err: any) {
                                setError(err.response?.data?.message || 'Failed to update payment status');
                              }
                            }}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="partial">Partial</option>
                            <option value="paid">Paid</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Address Changes Tab */}
        {activeTab === 'address-changes' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Pending Address Changes</h2>
            {pendingAddressChanges.length > 0 ? (
              <div className="grid gap-4">
                {pendingAddressChanges.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-gray-600">{user.email}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">
                            <strong>Current Address:</strong> {user.address || 'None'}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Requested Address:</strong> {user.pendingAddressChange}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => approveAddressChange(user.id, user.pendingAddressChange!)}
                            size="sm"
                          >
                            Approve
                          </Button>
                          <Button 
                            onClick={() => approveAddressChange(user.id, user.address || '')}
                            variant="outline"
                            size="sm"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending address changes</h3>
                  <p className="text-gray-500">All address change requests have been processed.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Communication Tab */}
        {activeTab === 'communication' && (
          <Card>
            <CardHeader>
              <CardTitle>Communication Management</CardTitle>
              <CardDescription>
                View and manage all communications between sitters and clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Section */}
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <Label htmlFor="client-filter">Filter by User</Label>
                  <select
                    id="client-filter"
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">All Communications</option>
                    {availableUsers.map((user: any) => (
                      <option key={user._id || user.id} value={user._id || user.id}>
                        {user.firstName} {user.lastName} ({user.email}) 
                        {user.role === 'admin' ? ' (Admin)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add Note Section */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold mb-3">Add New Note</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="note-text">Note Content</Label>
                    <Textarea
                      id="note-text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Enter your note here..."
                      rows={3}
                      className="w-full mt-1"
                    />
                  </div>
                  <Button 
                    onClick={handleAddNote}
                    disabled={!noteText.trim()}
                    className="w-full sm:w-auto"
                  >
                    Add Note
                  </Button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Communications</h3>
                {notes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No communications found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note: any) => (
                      <div key={note._id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium">
                              {note.senderId?.firstName || 'Unknown'} {note.senderId?.lastName || 'User'}
                              {note.senderId?.role === 'admin' ? ' (Admin)' : ''}
                              {currentUser && note.senderId?._id === (currentUser as any)._id ? ' (You)' : ''}
                            </span>
                            <div className="text-sm text-gray-500">
                              To: {note.recipientId?.firstName} {note.recipientId?.lastName}
                              {note.recipientId?.role === 'admin' ? ' (Admin)' : ''}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(note.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{note.text}</p>
                        
                        {/* Replies */}
                        {note.replies && note.replies.length > 0 && (
                          <div className="ml-4 border-l-2 border-gray-200 pl-4 space-y-3">
                            {note.replies.map((reply: any, index: number) => (
                              <div key={reply._id || index} className="bg-gray-50 p-3 rounded">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-medium text-sm">
                                    {reply.senderId?.firstName || reply.senderId?.email || reply.senderId?.role === 'admin' ? 'Admin' : 'You'} {reply.senderId?.lastName || ''}
                                    {reply.senderId?.role === 'admin' ? ' (Admin)' : ''}
                                    {currentUser && reply.senderId?._id === (currentUser as any)._id ? ' (You)' : ''}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {(reply.updatedAt || reply.createdAt) ? new Date(reply.updatedAt || reply.createdAt).toLocaleString() : 'N/A'}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm">{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Reply Form */}
                        <div className="mt-3 pt-3 border-t">
                          {replyingNoteId === note._id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your reply..."
                                rows={2}
                                className="w-full"
                              />
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleReply(note._id)}
                                  disabled={!replyText.trim()}
                                >
                                  Submit Reply
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setReplyingNoteId(null);
                                    setReplyText('');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setReplyingNoteId(note._id)}
                            >
                              Reply
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Approval/Rejection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Sitter Application
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? `Approve ${selectedSitter?.firstName} ${selectedSitter?.lastName} as a sitter. A temporary password will be set for their account.`
                : `Reject ${selectedSitter?.firstName} ${selectedSitter?.lastName}'s sitter application.`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === 'approve' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Temporary Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter temporary password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm temporary password"
                    required
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder={`Add any notes about this ${actionType}...`}
                rows={3}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSitterAction}
              disabled={isSubmitting}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {isSubmitting 
                ? `${actionType === 'approve' ? 'Approving' : 'Rejecting'}...` 
                : `${actionType === 'approve' ? 'Approve' : 'Reject'} Sitter`
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
