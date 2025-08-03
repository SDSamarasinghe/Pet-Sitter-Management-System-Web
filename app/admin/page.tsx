'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Booking {
  id: string;
  date: string;
  serviceType: string;
  status: string;
  clientName: string;
  pets: Array<{ name: string; }>;
  assignedSitter?: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sitters, setSitters] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'bookings' | 'address-changes'>('users');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userRole = getUserRole();
    if (userRole !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [usersResponse, bookingsResponse, sittersResponse] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/bookings'),
        api.get('/admin/sitters')
      ]);
      
      setUsers(usersResponse.data);
      setBookings(bookingsResponse.data);
      setSitters(sittersResponse.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin data');
    } finally {
      setIsLoading(false);
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
      await api.patch(`/admin/bookings/${bookingId}/assign`, {
        sitterId
      });
      
      setSuccess('Sitter assigned successfully');
      fetchData(); // Refresh data
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to assign sitter');
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await api.patch(`/admin/bookings/${bookingId}/status`, {
        status
      });
      
      setSuccess('Booking status updated successfully');
      fetchData(); // Refresh data
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update booking status');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading admin dashboard...</div>
      </div>
    );
  }

  const pendingAddressChanges = users.filter(user => user.pendingAddressChange);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
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
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <div className="grid gap-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">Role: {user.role}</p>
                        {user.phone && <p className="text-sm text-gray-500">Phone: {user.phone}</p>}
                        {user.address && <p className="text-sm text-gray-500">Address: {user.address}</p>}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'sitter' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">{booking.serviceType}</h3>
                          <p className="text-gray-600">Client: {booking.clientName}</p>
                          <p className="text-sm text-gray-500">
                            Date: {new Date(booking.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Pets: {booking.pets.map(pet => pet.name).join(', ')}
                          </p>
                          {booking.assignedSitter && (
                            <p className="text-sm text-blue-600">
                              Assigned Sitter: {booking.assignedSitter}
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
                      
                      <div className="flex space-x-2">
                        {!booking.assignedSitter && sitters.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <select 
                              onChange={(e) => assignSitter(booking.id, e.target.value)}
                              className="text-sm border rounded px-2 py-1"
                              defaultValue=""
                            >
                              <option value="">Assign Sitter</option>
                              {sitters.map((sitter) => (
                                <option key={sitter.id} value={sitter.id}>
                                  {sitter.firstName} {sitter.lastName}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        <select 
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
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
      </main>
    </div>
  );
}
