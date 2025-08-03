'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  serviceType: string;
  status: string;
  notes?: string;
  pets: Array<{ id: string; name: string; }>;
}

interface Pet {
  id: string;
  name: string;
  species: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    serviceType: 'pet-sitting',
    notes: '',
    petIds: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [bookingsResponse, petsResponse] = await Promise.all([
        api.get('/bookings'),
        api.get('/pets')
      ]);
      
      setBookings(bookingsResponse.data);
      setPets(petsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePetSelection = (petId: string) => {
    setFormData(prev => ({
      ...prev,
      petIds: prev.petIds.includes(petId)
        ? prev.petIds.filter(id => id !== petId)
        : [...prev.petIds, petId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/bookings', formData);
      
      setSuccess('Booking created successfully!');
      setShowCreateForm(false);
      setFormData({
        date: '',
        startTime: '',
        endTime: '',
        serviceType: 'pet-sitting',
        notes: '',
        petIds: [],
      });
      
      // Refresh bookings
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
            <div className="flex space-x-4">
              <Button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                variant={showCreateForm ? "outline" : "default"}
              >
                {showCreateForm ? 'Cancel' : 'Book Service'}
              </Button>
              <Button onClick={() => router.push('/dashboard')} variant="outline">
                Back to Dashboard
              </Button>
            </div>
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

        {/* Create Booking Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Book New Service</CardTitle>
              <CardDescription>
                Schedule a pet-sitting service for your furry friends.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="pet-sitting">Pet Sitting</option>
                    <option value="dog-walking">Dog Walking</option>
                    <option value="feeding">Feeding Visit</option>
                    <option value="overnight">Overnight Care</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Select Pets *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {pets.map((pet) => (
                      <label key={pet.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.petIds.includes(pet.id)}
                          onChange={() => handlePetSelection(pet.id)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{pet.name} ({pet.species})</span>
                      </label>
                    ))}
                  </div>
                  {pets.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No pets found. <button type="button" onClick={() => router.push('/pets/add')} className="text-blue-500 underline">Add a pet first</button>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Any special instructions for the sitter..."
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || formData.petIds.length === 0}
                >
                  {isLoading ? 'Booking...' : 'Book Service'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Bookings List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Bookings</h2>
          
          {bookings.length > 0 ? (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{booking.serviceType}</h3>
                        <p className="text-gray-600">
                          {new Date(booking.date).toLocaleDateString()} 
                          {booking.startTime && booking.endTime && 
                            ` • ${booking.startTime} - ${booking.endTime}`
                          }
                        </p>
                        {booking.pets && booking.pets.length > 0 && (
                          <p className="text-sm text-gray-500">
                            Pets: {booking.pets.map(pet => pet.name).join(', ')}
                          </p>
                        )}
                        {booking.notes && (
                          <p className="text-sm text-gray-600">{booking.notes}</p>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-500 mb-4">Book your first pet-sitting service to get started.</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  Book Service
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
