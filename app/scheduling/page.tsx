'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { isAuthenticated, getUserFromToken } from '@/lib/auth';
import api from '@/lib/api';

interface ScheduleItem {
  _id: string;
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  clientName: string;
  address: string;
  serviceType: string;
  status: string;
  pets?: Array<{ name: string }>;
  notes?: string;
}

interface AvailabilitySlot {
  _id?: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function SchedulingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'schedule' | 'availability'>('schedule');
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get current month dates
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const monthDays = getDaysInMonth(currentDate);

  // Format date for API
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Get schedule items for a specific date
  const getScheduleForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return scheduleItems.filter(item => item.date === dateStr);
  };

  // Fetch schedule data
  const fetchScheduleData = async () => {
    try {
      const userToken = getUserFromToken();
      if (!userToken) {
        router.push('/login');
        return;
      }

      const profileResponse = await api.get('/users/profile');
      const userId = profileResponse.data._id;

      // Fetch sitter's bookings
      const bookingsResponse = await api.get(`/bookings/sitter/${userId}`);
      const bookings = bookingsResponse.data || [];

      // Transform bookings to schedule format
      const scheduleData = bookings.map((booking: any) => ({
        _id: booking._id,
        id: booking._id,
        date: formatDate(new Date(booking.startDate || booking.date)),
        startTime: booking.startTime || '12:00',
        endTime: booking.endTime || '12:30',
        clientName: `${booking.userId?.firstName || 'Unknown'} ${booking.userId?.lastName || 'Client'}`,
        address: booking.address || booking.userId?.address || 'Address not provided',
        serviceType: booking.serviceType || 'Pet Sitting',
        status: booking.status || 'confirmed',
        pets: booking.pets || [],
        notes: booking.notes || ''
      }));

      setScheduleItems(scheduleData);

      // TODO: Fetch availability data when API is available
      setAvailability([]);

    } catch (error) {
      console.error('Error fetching schedule data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load schedule data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchScheduleData();
  }, [router]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const openScheduleDetails = (schedule: ScheduleItem) => {
    setSelectedSchedule(schedule);
  };

  const closeScheduleDetails = () => {
    setSelectedSchedule(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Scheduling</h1>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Schedule
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'availability'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Availability
            </button>
          </nav>
        </div>

        {/* My Schedule Tab */}
        {activeTab === 'schedule' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>My Schedule</CardTitle>
                  <CardDescription>View your scheduled appointments</CardDescription>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    ←
                  </Button>
                  <h2 className="text-lg font-semibold">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    →
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0 mb-4 border border-gray-200 rounded-lg overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 text-center font-medium text-gray-600 text-sm bg-gray-50 border-b border-gray-200">
                    {day}
                  </div>
                ))}
                
                {monthDays.map((day, index) => {
                  const daySchedules = getScheduleForDate(day);
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isToday = formatDate(day) === formatDate(new Date());
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border-r border-b border-gray-200 relative ${
                        isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                      } ${isToday ? 'bg-blue-50 ring-2 ring-blue-300 ring-inset' : ''} hover:bg-gray-50 transition-colors`}
                    >
                      <div className={`text-sm font-medium mb-2 ${
                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${isToday ? 'text-blue-600 font-bold' : ''}`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {daySchedules.map(schedule => (
                          <div
                            key={schedule._id}
                            onClick={() => openScheduleDetails(schedule)}
                            className="text-xs p-2 rounded-md cursor-pointer transition-all duration-200 hover:shadow-md bg-red-100 hover:bg-red-200 text-red-800 border border-red-200"
                          >
                            <div className="font-semibold mb-1">{schedule.startTime}</div>
                            <div className="truncate text-xs opacity-90">{schedule.clientName}</div>
                            <div className="truncate text-xs opacity-75">{schedule.address}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Availability Tab */}
        {activeTab === 'availability' && (
          <Card>
            <CardHeader>
              <CardTitle>My Availability</CardTitle>
              <CardDescription>Set your available times for clients to book</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Quick Availability Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">Weekly Schedule</h3>
                    <div className="space-y-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <div key={day} className="flex items-center justify-between">
                          <label className="text-sm font-medium">{day}</label>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <select className="text-xs border rounded px-2 py-1">
                              <option>9:00 AM</option>
                              <option>10:00 AM</option>
                              <option>11:00 AM</option>
                            </select>
                            <span className="text-xs">to</span>
                            <select className="text-xs border rounded px-2 py-1">
                              <option>5:00 PM</option>
                              <option>6:00 PM</option>
                              <option>7:00 PM</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">Service Preferences</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Maximum daily bookings</label>
                        <select className="w-full mt-1 border rounded px-3 py-2">
                          <option>1 booking</option>
                          <option>2 bookings</option>
                          <option>3 bookings</option>
                          <option>4 bookings</option>
                          <option>5+ bookings</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Advance notice required</label>
                        <select className="w-full mt-1 border rounded px-3 py-2">
                          <option>Same day</option>
                          <option>1 day</option>
                          <option>2 days</option>
                          <option>3 days</option>
                          <option>1 week</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Travel distance</label>
                        <select className="w-full mt-1 border rounded px-3 py-2">
                          <option>Within 5km</option>
                          <option>Within 10km</option>
                          <option>Within 20km</option>
                          <option>Within 50km</option>
                          <option>Any distance</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Dates */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Special Dates & Holidays</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Unavailable dates</label>
                      <textarea 
                        className="w-full mt-1 border rounded px-3 py-2" 
                        rows={3}
                        placeholder="Enter dates you're unavailable (e.g., Dec 25, Jan 1)"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Holiday rates</label>
                      <div className="space-y-2 mt-1">
                        <div className="flex items-center">
                          <input type="checkbox" className="rounded mr-2" />
                          <span className="text-sm">Charge extra on holidays (+25%)</span>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" className="rounded mr-2" />
                          <span className="text-sm">Charge extra on weekends (+15%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline">Reset to Default</Button>
                  <Button>Save Availability</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule Details Modal */}
        {selectedSchedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-0 relative animate-fadeIn">
              {/* Header */}
              <div className="bg-red-600 text-white px-6 py-4 rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">
                      {selectedSchedule.serviceType}
                    </h3>
                    <p className="text-red-100 text-sm">
                      {new Date(selectedSchedule.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })} • {selectedSchedule.startTime} - {selectedSchedule.endTime}
                    </p>
                  </div>
                  <button
                    onClick={closeScheduleDetails}
                    className="text-red-100 hover:text-white text-xl ml-4"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-900">Location</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedSchedule.address}</p>
                  </div>
                </div>

                {selectedSchedule.pets && selectedSchedule.pets.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-gray-900">Pets</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedSchedule.pets.map((pet, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{pet.name}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-900">Status</h4>
                    <Badge 
                      variant={selectedSchedule.status === 'confirmed' ? 'default' : 'outline'}
                      className="mt-1"
                    >
                      {selectedSchedule.status.charAt(0).toUpperCase() + selectedSchedule.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {selectedSchedule.notes && (
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-gray-900">Notes</h4>
                      <p className="text-sm text-gray-600 mt-1">{selectedSchedule.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 rounded-b-lg">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="text-blue-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    More details
                  </Button>
                  <Button variant="outline" size="sm" className="text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Copy to my calendar
                  </Button>
                </div>
                <Button onClick={() => router.push(`/bookings/${selectedSchedule._id}`)}>
                  View Details
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
