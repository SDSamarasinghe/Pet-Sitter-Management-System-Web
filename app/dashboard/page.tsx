'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isAuthenticated, getUserFromToken, removeToken } from '@/lib/auth';
import api from '@/lib/api';

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
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  photoUrl?: string;
  careInstructions: string;
}

interface Booking {
  id: string;
  date: string;
  serviceType: string;
  status: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const userToken = getUserFromToken();
        if (!userToken) {
          router.push('/login');
          return;
        }

        // Fetch user profile, pets, and bookings
        const [profileResponse, petsResponse, bookingsResponse] = await Promise.all([
          api.get('/users/profile'),
          api.get('/pets'),
          api.get('/bookings')
        ]);

        setUser(profileResponse.data);
        setPets(petsResponse.data);
        setBookings(bookingsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Flying Duchess Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.firstName}</span>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => router.push('/service-inquiry')}
                >
                  New Service Inquiry
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => router.push('/pets/add')}
                >
                  Add New Pet
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => router.push('/bookings')}
                >
                  Book Service
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => router.push('/reports')}
                >
                  View Reports
                </Button>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Phone:</strong> {user?.phone || 'Not provided'}</p>
                  <p><strong>Role:</strong> {user?.role}</p>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Pets:</strong> {pets.length}</p>
                  <p><strong>Active Bookings:</strong> {bookings.filter(b => b.status === 'confirmed').length}</p>
                  <p><strong>Total Bookings:</strong> {bookings.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pets Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Pets</h2>
            {pets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pets.map((pet) => (
                  <Card key={pet.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{pet.name}</CardTitle>
                      <CardDescription>{pet.species} • {pet.breed}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {pet.photoUrl && (
                        <img 
                          src={pet.photoUrl} 
                          alt={pet.name}
                          className="w-full h-48 object-cover rounded-md mb-2"
                        />
                      )}
                      <p className="text-sm text-gray-600">Age: {pet.age} years</p>
                      <p className="text-sm text-gray-600 mt-2">{pet.careInstructions}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">No pets added yet</p>
                  <Button onClick={() => router.push('/pets/add')}>
                    Add Your First Pet
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Bookings */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
            {bookings.length > 0 ? (
              <Card>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{booking.serviceType}</p>
                          <p className="text-sm text-gray-600">{new Date(booking.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">No bookings yet</p>
                  <Button onClick={() => router.push('/bookings')}>
                    Book Your First Service
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
