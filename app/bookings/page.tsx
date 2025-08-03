'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import Header from '@/components/Header';
import api from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

interface Booking {
  _id: string;
  startDate: string;
  endDate: string;
  serviceType: string;
  status: string;
  notes?: string;
  pets: Array<{ _id: string; name: string; }>;
}

interface Pet {
  _id: string;
  name: string;
  species: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
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
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const router = useRouter();
  const { toast } = useToast();

  const calculateEstimatedCost = () => {
    if (!formData.startTime || !formData.endTime || formData.petIds.length === 0) {
      return 0;
    }

    const baseRates: Record<string, number> = {
      'pet-sitting': 25,
      'dog-walking': 20,
      'feeding': 15,
      'overnight': 75
    };
    
    const baseRate = baseRates[formData.serviceType] || 25;
    const petMultiplier = Math.max(1, formData.petIds.length);
    
    // Calculate hours between start and end time
    const startTime = new Date(`2000-01-01T${formData.startTime}`);
    const endTime = new Date(`2000-01-01T${formData.endTime}`);
    let hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    // Handle overnight bookings or if end time is before start time (next day)
    if (hours <= 0) {
      hours = 24 + hours; // Assume next day
    }
    
    // Minimum 1 hour charge
    hours = Math.max(1, hours);
    
    return Math.round(baseRate * hours * petMultiplier * 100) / 100; // Round to 2 decimal places
  };

  // Update estimated cost when form data changes
  useEffect(() => {
    const cost = calculateEstimatedCost();
    setEstimatedCost(cost);
  }, [formData.startTime, formData.endTime, formData.serviceType, formData.petIds]);

  const fetchData = async () => {
    try {
      // Get user profile to determine role and id
      const profileResponse = await api.get('/users/profile');
      const userId = profileResponse.data._id;
      const userRole = profileResponse.data.role;
      setUserEmail(profileResponse.data.email || '');
      // Fetch pets based on role
      let petsResponse;
      if (userRole === 'admin') {
        petsResponse = await api.get('/pets');
      } else {
        petsResponse = await api.get(`/pets/user/${userId}`);
      }
      // Fetch bookings based on role
      let bookingsResponse;
      if (userRole === 'admin') {
        bookingsResponse = await api.get('/bookings');
      } else if (userRole === 'sitter') {
        bookingsResponse = await api.get(`/bookings/sitter/${userId}`);
      } else {
        bookingsResponse = await api.get(`/bookings/user/${userId}`);
      }
      setBookings(bookingsResponse.data);
      setPets(petsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [router]);

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

    // Validate times
    if (formData.startTime && formData.endTime) {
      const startTime = new Date(`2000-01-01T${formData.startTime}`);
      const endTime = new Date(`2000-01-01T${formData.endTime}`);
      
      if (endTime <= startTime) {
        toast({
          variant: "destructive",
          title: "Invalid time range",
          description: "End time must be after start time. For overnight services, the end time should be on the next day.",
        });
        setIsLoading(false);
        return;
      }
    }

    // Map formData to backend DTO
    const allowedPetTypes = [
      'Cat(s)', 'Dog(s)', 'Rabbit(s)', 'Bird(s)', 'Guinea pig(s)', 'Ferret(s)', 'Other'
    ];
    const speciesMap: Record<string, string> = {
      'Cat': 'Cat(s)',
      'Dog': 'Dog(s)',
      'Rabbit': 'Rabbit(s)',
      'Bird': 'Bird(s)',
      'Guinea pig': 'Guinea pig(s)',
      'Ferret': 'Ferret(s)',
      'Other': 'Other'
    };
    const petTypes = pets
      .filter(pet => formData.petIds.includes(pet._id))
      .map(pet => speciesMap[pet.species] || 'Other')
      .filter(type => allowedPetTypes.includes(type));

    // Calculate total amount based on service type and duration
    const totalAmount = calculateEstimatedCost();

    const payload = {
      startDate: `${formData.date}T${formData.startTime}`,
      endDate: `${formData.date}T${formData.endTime}`,
      serviceType: formData.serviceType,
      numberOfPets: formData.petIds.length,
      petTypes,
      notes: formData.notes,
      totalAmount: totalAmount
    };

    try {
      await api.post('/bookings', payload);
      
      toast({
        title: "Booking created successfully!",
        description: "Your booking has been submitted and is pending confirmation.",
      });
      
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
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: error.response?.data?.message || 'Failed to create booking',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      ) : (
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Page Header with Actions */}
          <div className="flex justify-between items-center mb-6">
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
                        <label key={pet._id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.petIds.includes(pet._id)}
                            onChange={() => handlePetSelection(pet._id)}
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

                  {/* Estimated Cost Display */}
                  {estimatedCost > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-blue-900">Estimated Cost</h4>
                          <p className="text-sm text-blue-700">
                            {formData.serviceType} • {formData.petIds.length} pet(s)
                            {formData.startTime && formData.endTime && (
                              <>
                                {(() => {
                                  const startTime = new Date(`2000-01-01T${formData.startTime}`);
                                  const endTime = new Date(`2000-01-01T${formData.endTime}`);
                                  let hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                                  if (hours <= 0) hours = 24 + hours;
                                  return ` • ${Math.max(1, Math.round(hours * 10) / 10)} hour(s)`;
                                })()}
                              </>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-900">${estimatedCost}</p>
                          <p className="text-xs text-blue-600">Final cost may vary</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={isLoading || formData.petIds.length === 0}
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Booking...
                      </>
                    ) : (
                      'Book Service'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Bookings List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Bookings</h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : (bookings.length > 0 && !isLoading) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking) => (
                  <Card 
                    key={booking._id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500"
                    onClick={() => router.push(`/bookings/${booking._id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {booking.serviceType}
                        </CardTitle>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <CardDescription className="text-sm text-gray-600">
                        {(() => {
                          const start = booking.startDate ? new Date(booking.startDate) : null;
                          const end = booking.endDate ? new Date(booking.endDate) : null;
                          if (start && end) {
                            const dateStr = start.toLocaleDateString();
                            const startTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const endTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            return `${dateStr} • ${startTime} - ${endTime}`;
                          } else if (start) {
                            return start.toLocaleString();
                          } else {
                            return 'Invalid Date';
                          }
                        })()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Pets:</p>
                          <p className="text-sm text-gray-600">
                            {booking.pets && booking.pets.length > 0
                              ? booking.pets.map(pet => pet.name).join(', ')
                              : 'No pets listed'}
                          </p>
                        </div>
                        {booking.notes && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Notes:</p>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {booking.notes}
                            </p>
                          </div>
                        )}
                        <div className="pt-2 border-t">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/bookings/${booking._id}`);
                            }}
                          >
                            View Details
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
      )}
    </div>
  );
}
