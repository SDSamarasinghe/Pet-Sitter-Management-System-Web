'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import api from '@/lib/api';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { isAuthenticated, getUserRole } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  serviceType: string;
  status: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  emergencyContact: string;
  pets: Array<{
    id: string;
    name: string;
    species: string;
    breed: string;
    age: number;
    photoUrl?: string;
    careInstructions: string;
  }>;
  notes?: string;
}

interface ReportForm {
  bookingId: string;
  activities: string;
  notes: string;
  feedingTime: string;
  walkDuration: string;
  medicationGiven: boolean;
  emergencyContacted: boolean;
  photos: File[];
}

export default function SitterPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState<ReportForm>({
    bookingId: '',
    activities: '',
    notes: '',
    feedingTime: '',
    walkDuration: '',
    medicationGiven: false,
    emergencyContacted: false,
    photos: []
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

    const userRole = getUserRole();
    if (userRole !== 'sitter') {
      router.push('/dashboard');
      return;
    }

    fetchBookings();
  }, [router]);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/sitter/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleReportInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setReportForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReportForm(prev => ({
      ...prev,
      photos: files
    }));
  };

  const startReport = (booking: Booking) => {
    setSelectedBooking(booking);
    setReportForm({
      bookingId: booking.id,
      activities: '',
      notes: '',
      feedingTime: '',
      walkDuration: '',
      medicationGiven: false,
      emergencyContacted: false,
      photos: []
    });
    setShowReportForm(true);
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Upload photos to Cloudinary
      const photoUrls: string[] = [];
      for (const photo of reportForm.photos) {
        const url = await uploadToCloudinary(photo);
        photoUrls.push(url);
      }

      // Submit report
      await api.post('/sitter/reports', {
        ...reportForm,
        photos: photoUrls
      });

      setSuccess('Report submitted successfully!');
      setShowReportForm(false);
      setSelectedBooking(null);
      fetchBookings(); // Refresh bookings
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await api.patch(`/sitter/bookings/${bookingId}/status`, { status });
      setSuccess(`Booking status updated to ${status}`);
      fetchBookings();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update booking status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Sitter Dashboard</h1>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

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

        {/* Report Form Modal */}
        {showReportForm && selectedBooking && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Submit Service Report</CardTitle>
              <CardDescription>
                Report for {selectedBooking.serviceType} on {new Date(selectedBooking.date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitReport} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="activities">Activities Performed *</Label>
                  <Textarea
                    id="activities"
                    name="activities"
                    placeholder="Describe what you did during the visit..."
                    value={reportForm.activities}
                    onChange={handleReportInputChange}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedingTime">Feeding Time</Label>
                    <Input
                      id="feedingTime"
                      name="feedingTime"
                      type="time"
                      value={reportForm.feedingTime}
                      onChange={handleReportInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="walkDuration">Walk Duration (minutes)</Label>
                    <Input
                      id="walkDuration"
                      name="walkDuration"
                      type="number"
                      placeholder="e.g., 30"
                      value={reportForm.walkDuration}
                      onChange={handleReportInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      id="medicationGiven"
                      name="medicationGiven"
                      type="checkbox"
                      checked={reportForm.medicationGiven}
                      onChange={handleReportInputChange}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="medicationGiven">Medication Given</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      id="emergencyContacted"
                      name="emergencyContacted"
                      type="checkbox"
                      checked={reportForm.emergencyContacted}
                      onChange={handleReportInputChange}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="emergencyContacted">Emergency Contact Used</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photos">Photos (optional)</Label>
                  <Input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                  />
                  {reportForm.photos.length > 0 && (
                    <p className="text-sm text-gray-500">
                      {reportForm.photos.length} photo(s) selected
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Any additional observations or notes..."
                    value={reportForm.notes}
                    onChange={handleReportInputChange}
                    rows={3}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={isLoading} className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Report'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowReportForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Bookings List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Assigned Bookings</h2>
          
          {bookings.length > 0 ? (
            <div className="grid gap-6">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{booking.serviceType}</CardTitle>
                        <CardDescription>
                          {new Date(booking.date).toLocaleDateString()} 
                          {booking.startTime && booking.endTime && 
                            ` • ${booking.startTime} - ${booking.endTime}`
                          }
                        </CardDescription>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Client Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Client Information</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Name:</strong> {booking.clientName}</p>
                          <p><strong>Phone:</strong> {booking.clientPhone}</p>
                          <p><strong>Address:</strong> {booking.clientAddress}</p>
                          <p><strong>Emergency Contact:</strong> {booking.emergencyContact}</p>
                        </div>
                      </div>

                      {/* Pets Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Pets to Care For</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {booking.pets.map((pet) => (
                            <div key={pet.id} className="border rounded-lg p-3">
                              <div className="flex items-start space-x-3">
                                {pet.photoUrl && (
                                  <img 
                                    src={pet.photoUrl} 
                                    alt={pet.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                )}
                                <div className="flex-1">
                                  <h5 className="font-medium">{pet.name}</h5>
                                  <p className="text-sm text-gray-600">
                                    {pet.species} • {pet.breed} • {pet.age} years old
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {pet.careInstructions}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Special Instructions */}
                      {booking.notes && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Special Instructions</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                            {booking.notes}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-4 border-t">
                        {booking.status === 'confirmed' && (
                          <Button 
                            onClick={() => updateBookingStatus(booking.id, 'in-progress')}
                            size="sm"
                          >
                            Start Service
                          </Button>
                        )}
                        
                        {booking.status === 'in-progress' && (
                          <>
                            <Button 
                              onClick={() => startReport(booking)}
                              size="sm"
                            >
                              Submit Report
                            </Button>
                            <Button 
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              variant="outline"
                              size="sm"
                            >
                              Complete Service
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings assigned</h3>
                <p className="text-gray-500 mb-4">
                  You don't have any bookings assigned yet. Check back later or contact your administrator.
                </p>
                <Button onClick={() => router.push('/dashboard')}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
