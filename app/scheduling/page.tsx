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
  isBooked?: boolean;
}

interface AvailabilitySettings {
  sitterId: string;
  weeklySchedule: {
    [key: string]: {
      isAvailable: boolean;
      startTime: string;
      endTime: string;
    };
  };
  maxDailyBookings: number;
  advanceNotice: number;
  travelDistance: number;
  unavailableDates: string[];
  holidayRates: {
    chargeExtraOnHolidays: boolean;
    holidayRateIncrease: number;
    chargeExtraOnWeekends: boolean;
    weekendRateIncrease: number;
  };
}

export default function SchedulingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'schedule' | 'availability'>('schedule');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySettings | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // Format date for API - use local date to avoid timezone issues
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get schedule items for a specific date
  const getScheduleForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return scheduleItems.filter(item => item.date === dateStr);
  };

  // Get current week days
  const getWeekDays = (date: Date) => {
    const currentDay = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - currentDay); // Start on Sunday
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Get time slots for week view (00:00 to 23:59)
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  // Calculate position of current time indicator
  const getCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const startHour = 0; // Week view starts at 00:00
    const endHour = 23; // Week view ends at 23:00
    
    const totalMinutes = (hours - startHour) * 60 + minutes;
    const totalDayMinutes = (endHour - startHour + 1) * 60; // +1 to include full 23:00-23:59
    return (totalMinutes / totalDayMinutes) * 100;
  };

  // Check if schedule overlaps with time slot (robust for all cases)
  const getSchedulesForTimeSlot = (date: Date, timeSlot: string) => {
    const dateStr = formatDate(date);
    const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
    return scheduleItems.filter(item => {
      if (item.date !== dateStr) return false;
      const [startHour, startMinute] = item.startTime.split(':').map(Number);
      let endHour = startHour, endMinute = startMinute;
      if (item.endTime && item.endTime !== item.startTime) {
        [endHour, endMinute] = item.endTime.split(':').map(Number);
      } else {
        // If no endTime or endTime == startTime, treat as a single point (show only at start time slot)
        return slotHour === startHour && slotMinute === startMinute;
      }
      // Convert to minutes for robust comparison
      const slotMins = slotHour * 60 + slotMinute;
      const startMins = startHour * 60 + startMinute;
      const endMins = endHour * 60 + endMinute;
      // Show if slot is in [start, end) (if end < start, treat as single slot)
      return slotMins >= startMins && slotMins < endMins;
    });
  };

  // Fetch schedule and availability data from backend
  const fetchScheduleData = async () => {
    try {
      const userToken = getUserFromToken();
      if (!userToken) {
        router.push('/login');
        return;
      }

      const profileResponse = await api.get('/users/profile');
      const userId = profileResponse.data._id;
      setCurrentUserId(userId);

      // Fetch sitter's bookings from backend
      const bookingsResponse = await api.get(`/bookings/sitter/${userId}`);
      const bookings = bookingsResponse.data || [];

      // Transform bookings to schedule format for calendar
      const scheduleData = bookings.map((booking: any) => {
        // Parse start and end times from booking
        const start = booking.startDate ? new Date(booking.startDate) : null;
        const end = booking.endDate ? new Date(booking.endDate) : null;
        // Format times for display
        const startTime = start ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
        const endTime = end ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
        // Format date for calendar
        const date = start ? formatDate(start) : '';
        return {
          _id: booking._id,
          id: booking._id,
          date,
          startTime,
          endTime,
          clientName: booking.userId?.firstName && booking.userId?.lastName
            ? `${booking.userId.firstName} ${booking.userId.lastName}`
            : (booking.clientName || 'Client'),
          address: booking.address || booking.userId?.address || 'Address not provided',
          serviceType: booking.serviceType || 'Pet Sitting',
          status: booking.status || 'confirmed',
          pets: booking.pets || [],
          notes: booking.notes || ''
        };
      });

      setScheduleItems(scheduleData);

      // Fetch availability settings
      await fetchAvailabilitySettings(userId);
      
      // Fetch availability slots
      await fetchAvailabilitySlots(userId);
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

  // Fetch availability settings
  const fetchAvailabilitySettings = async (userId: string) => {
    try {
      const response = await api.get(`/api/availability/settings/${userId}`);
      const apiData = response.data.data || response.data; // Handle both wrapped and unwrapped responses
      
      console.log('Raw API response:', response.data);
      console.log('API data to transform:', apiData);
      console.log('Weekend rates from API:', apiData.weekendRates);
      
      // Transform API data to frontend format
      const frontendSettings: AvailabilitySettings = {
        sitterId: userId,
        weeklySchedule: {
          Monday: {
            isAvailable: apiData.weeklySchedule?.monday?.isAvailable ?? true,
            startTime: apiData.weeklySchedule?.monday?.startTime || '00:00',
            endTime: apiData.weeklySchedule?.monday?.endTime || '23:00'
          },
          Tuesday: {
            isAvailable: apiData.weeklySchedule?.tuesday?.isAvailable ?? true,
            startTime: apiData.weeklySchedule?.tuesday?.startTime || '00:00',
            endTime: apiData.weeklySchedule?.tuesday?.endTime || '23:00'
          },
          Wednesday: {
            isAvailable: apiData.weeklySchedule?.wednesday?.isAvailable ?? true,
            startTime: apiData.weeklySchedule?.wednesday?.startTime || '00:00',
            endTime: apiData.weeklySchedule?.wednesday?.endTime || '23:00'
          },
          Thursday: {
            isAvailable: apiData.weeklySchedule?.thursday?.isAvailable ?? true,
            startTime: apiData.weeklySchedule?.thursday?.startTime || '00:00',
            endTime: apiData.weeklySchedule?.thursday?.endTime || '23:00'
          },
          Friday: {
            isAvailable: apiData.weeklySchedule?.friday?.isAvailable ?? true,
            startTime: apiData.weeklySchedule?.friday?.startTime || '00:00',
            endTime: apiData.weeklySchedule?.friday?.endTime || '23:00'
          },
          Saturday: {
            isAvailable: apiData.weeklySchedule?.saturday?.isAvailable ?? false,
            startTime: apiData.weeklySchedule?.saturday?.startTime || '00:00',
            endTime: apiData.weeklySchedule?.saturday?.endTime || '23:00'
          },
          Sunday: {
            isAvailable: apiData.weeklySchedule?.sunday?.isAvailable ?? false,
            startTime: apiData.weeklySchedule?.sunday?.startTime || '00:00',
            endTime: apiData.weeklySchedule?.sunday?.endTime || '23:00'
          }
        },
        maxDailyBookings: apiData.maxDailyBookings || 3,
        advanceNotice: apiData.advanceNoticeHours || 1,
        travelDistance: apiData.travelDistance || 10,
        unavailableDates: apiData.unavailableDates || [],
        holidayRates: {
          chargeExtraOnHolidays: apiData.holidayRates?.enabled || false,
          holidayRateIncrease: apiData.holidayRates?.percentage || 25,
          chargeExtraOnWeekends: apiData.weekendRates?.enabled || false,
          weekendRateIncrease: apiData.weekendRates?.percentage || 15
        }
      };
      
      console.log('Transformed frontend settings:', frontendSettings);
      setAvailabilitySettings(frontendSettings);
    } catch (error) {
      console.error('Error fetching availability settings:', error);
      // Set default settings on error
      setAvailabilitySettings({
        sitterId: userId,
        weeklySchedule: {
          Monday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          Tuesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          Wednesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          Thursday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          Friday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          Saturday: { isAvailable: false, startTime: '09:00', endTime: '17:00' },
          Sunday: { isAvailable: false, startTime: '09:00', endTime: '17:00' },
        },
        maxDailyBookings: 3,
        advanceNotice: 1,
        travelDistance: 10,
        unavailableDates: [],
        holidayRates: {
          chargeExtraOnHolidays: false,
          holidayRateIncrease: 25,
          chargeExtraOnWeekends: false,
          weekendRateIncrease: 15,
        },
      });
    }
  };

  // Fetch availability slots
  const fetchAvailabilitySlots = async (userId: string) => {
    try {
      const startDate = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
      const endDate = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
      
      const response = await api.get(`/api/availability/slots/${userId}?startDate=${startDate}&endDate=${endDate}`);
      setAvailability(response.data || []);
    } catch (error) {
      console.error('Error fetching availability slots:', error);
    }
  };

  // Save availability settings
  const saveAvailabilitySettings = async (settings: AvailabilitySettings) => {
    if (!currentUserId) return;
    
    setIsSaving(true);
    try {
      console.log('Original settings:', settings);
      
      // Transform frontend data structure to match API expectations
      const apiData = {
        weeklySchedule: {
          monday: {
            isAvailable: settings.weeklySchedule?.Monday?.isAvailable || false,
            startTime: settings.weeklySchedule?.Monday?.startTime || '09:00',
            endTime: settings.weeklySchedule?.Monday?.endTime || '17:00'
          },
          tuesday: {
            isAvailable: settings.weeklySchedule?.Tuesday?.isAvailable || false,
            startTime: settings.weeklySchedule?.Tuesday?.startTime || '09:00',
            endTime: settings.weeklySchedule?.Tuesday?.endTime || '17:00'
          },
          wednesday: {
            isAvailable: settings.weeklySchedule?.Wednesday?.isAvailable || false,
            startTime: settings.weeklySchedule?.Wednesday?.startTime || '09:00',
            endTime: settings.weeklySchedule?.Wednesday?.endTime || '17:00'
          },
          thursday: {
            isAvailable: settings.weeklySchedule?.Thursday?.isAvailable || false,
            startTime: settings.weeklySchedule?.Thursday?.startTime || '09:00',
            endTime: settings.weeklySchedule?.Thursday?.endTime || '17:00'
          },
          friday: {
            isAvailable: settings.weeklySchedule?.Friday?.isAvailable || false,
            startTime: settings.weeklySchedule?.Friday?.startTime || '09:00',
            endTime: settings.weeklySchedule?.Friday?.endTime || '17:00'
          },
          saturday: {
            isAvailable: settings.weeklySchedule?.Saturday?.isAvailable || false,
            startTime: settings.weeklySchedule?.Saturday?.startTime || '09:00',
            endTime: settings.weeklySchedule?.Saturday?.endTime || '17:00'
          },
          sunday: {
            isAvailable: settings.weeklySchedule?.Sunday?.isAvailable || false,
            startTime: settings.weeklySchedule?.Sunday?.startTime || '09:00',
            endTime: settings.weeklySchedule?.Sunday?.endTime || '17:00'
          }
        },
        maxDailyBookings: settings.maxDailyBookings || 1,
        advanceNoticeHours: settings.advanceNotice || 1,
        travelDistance: settings.travelDistance || 10,
        unavailableDates: settings.unavailableDates || [],
        holidayRates: {
          enabled: settings.holidayRates?.chargeExtraOnHolidays || false,
          percentage: settings.holidayRates?.holidayRateIncrease || 25,
          holidays: ['christmas', 'new-year', 'thanksgiving'] // Default holidays
        },
        weekendRates: {
          enabled: settings.holidayRates?.chargeExtraOnWeekends || false,
          percentage: settings.holidayRates?.weekendRateIncrease || 15
        },
        isActive: true
      };

      const response = await api.put(`/api/availability/settings/${currentUserId}`, apiData);
      
      console.log('Sent data to API:', JSON.stringify(apiData, null, 2));
      console.log('API Response:', response.data);
      
      // Update local state immediately with saved settings to ensure UI reflects changes
      setAvailabilitySettings(settings);
      
      // Also refresh from server to ensure synchronization, but don't rely on it exclusively
      try {
        await fetchAvailabilitySettings(currentUserId);
      } catch (fetchError) {
        console.warn('Failed to refresh settings from server, keeping local state:', fetchError);
      }
      
      toast({
        title: 'Success',
        description: 'Availability settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving availability settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save availability settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchScheduleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update current time every minute for the red line indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Refetch availability when month changes
  useEffect(() => {
    if (currentUserId && activeTab === 'availability') {
      fetchAvailabilitySlots(currentUserId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, currentUserId, activeTab]);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-3 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Scheduling</h1>
            <Button onClick={() => router.push('/dashboard')} variant="outline" size="sm" className="w-full sm:w-auto">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="mb-4 sm:mb-6">
          <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Schedule
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'availability'
                  ? 'border-primary text-primary'
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
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <CardTitle>My Schedule</CardTitle>
                    <CardDescription>View your scheduled appointments</CardDescription>
                  </div>
                  
                  {/* View Toggle */}
                  <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('month')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'month'
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">Month</span>
                    </button>
                    <button
                      onClick={() => setViewMode('week')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'week'
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {/* Calendar week icon */}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" stroke="currentColor" fill="none" />
                        <path d="M3 9h18" strokeWidth="2" stroke="currentColor" />
                        <rect x="7" y="13" width="10" height="2" rx="1" stroke="none" fill="currentColor" />
                      </svg>
                      <span className="hidden sm:inline">Week</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'list'
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <span className="hidden sm:inline">Schedule</span>
                    </button>
                  </div>
                </div>
                
                {/* Month Navigation */}
                <div className="flex items-center justify-between sm:justify-center gap-4">
                  {viewMode === 'week' ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => {
                        setCurrentDate(prev => {
                          const newDate = new Date(prev);
                          newDate.setDate(prev.getDate() - 7);
                          return newDate;
                        });
                      }}>
                        ←
                      </Button>
                      <h2 className="text-base sm:text-lg font-semibold min-w-[180px] text-center">
                        {(() => {
                          const weekDays = getWeekDays(currentDate);
                          const start = weekDays[0];
                          const end = weekDays[6];
                          const startStr = `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()}`;
                          const endStr = `${end.toLocaleDateString('en-US', { month: 'short' })} ${end.getDate()}, ${end.getFullYear()}`;
                          return `${startStr} – ${endStr}`;
                        })()}
                      </h2>
                      <Button variant="outline" size="sm" onClick={() => {
                        setCurrentDate(prev => {
                          const newDate = new Date(prev);
                          newDate.setDate(prev.getDate() + 7);
                          return newDate;
                        });
                      }}>
                        →
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                        ←
                      </Button>
                      <h2 className="text-base sm:text-lg font-semibold min-w-[180px] text-center">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h2>
                      <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                        →
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Month View */}
              {viewMode === 'month' && (
                <div className="grid grid-cols-7 gap-0 mb-4 border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 sm:p-3 text-center font-medium text-gray-600 text-xs sm:text-sm bg-gray-50 border-b border-gray-200">
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day.charAt(0)}</span>
                    </div>
                  ))}
                  
                  {monthDays.map((day, index) => {
                    const daySchedules = getScheduleForDate(day);
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isToday = formatDate(day) === formatDate(new Date());
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border-r border-b border-gray-200 relative ${
                          isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        } ${isToday ? 'bg-blue-50 ring-2 ring-primary/30 ring-inset' : ''} hover:bg-gray-50 transition-colors`}
                      >
                        <div className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                          isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        } ${isToday ? 'text-primary font-bold' : ''}`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {daySchedules.slice(0, 2).map(schedule => {
                            let bgColor = 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200';
                            if (schedule.status === 'completed') {
                              bgColor = 'bg-green-100 hover:bg-green-200 text-green-800 border-green-200';
                            }
                            return (
                              <div
                                key={schedule._id}
                                onClick={() => openScheduleDetails(schedule)}
                                className={`text-xs p-1 sm:p-2 rounded-md cursor-pointer transition-all duration-200 hover:shadow-md border ${bgColor}`}
                              >
                                <div className="font-semibold mb-0.5 text-[10px] sm:text-xs">{schedule.startTime}</div>
                                <div className="truncate text-[9px] sm:text-xs opacity-90">{schedule.clientName}</div>
                              </div>
                            );
                          })}
                          {daySchedules.length > 2 && (
                            <div className="text-[9px] sm:text-xs text-gray-500 text-center py-1">
                              +{daySchedules.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Week View */}
              {viewMode === 'week' && (
                <div className="mb-4 overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Week header with dates */}
                    <div className="grid grid-cols-8 border border-gray-200 rounded-t-lg overflow-hidden bg-gray-50">
                      <div className="p-3 text-center font-medium text-gray-600 text-sm border-r border-gray-200"></div>
                      {getWeekDays(currentDate).map((day, index) => {
                        const isToday = formatDate(day) === formatDate(new Date());
                        return (
                          <div
                            key={index}
                            className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${
                              isToday ? 'bg-primary text-white' : ''
                            }`}
                          >
                            <div className="text-xs font-medium">
                              {day.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className={`text-2xl font-bold ${isToday ? 'text-white' : 'text-gray-900'}`}>
                              {day.getDate()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {day.toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Time slots grid */}
                    <div className="relative border-l border-r border-b border-gray-200 rounded-b-lg bg-white">
                      {getTimeSlots().map((timeSlot, slotIndex) => (
                        <div key={timeSlot} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0 relative">
                          {/* Time label */}
                          <div className="p-2 text-xs text-gray-500 text-right pr-3 border-r border-gray-200 bg-gray-50">
                            {timeSlot}
                          </div>
                          
                          {/* Day columns */}
                          {getWeekDays(currentDate).map((day, dayIndex) => {
                            const schedules = getSchedulesForTimeSlot(day, timeSlot);
                            const isToday = formatDate(day) === formatDate(new Date());
                            
                            return (
                              <div
                                key={dayIndex}
                                className={`min-h-[60px] border-r border-gray-100 last:border-r-0 p-1 relative ${
                                  isToday ? 'bg-blue-50/30' : ''
                                }`}
                              >
                                {schedules.map(schedule => {
                                  let bgColor = 'bg-blue-600 hover:bg-blue-700';
                                  if (schedule.status === 'completed') {
                                    bgColor = 'bg-green-600 hover:bg-green-700';
                                  }
                                  return (
                                    <div
                                      key={schedule._id}
                                      onClick={() => openScheduleDetails(schedule)}
                                      className={`absolute left-0 right-0 mx-1 text-white text-xs p-1 rounded cursor-pointer transition-colors z-10 ${bgColor}`}
                                      style={{
                                        top: '2px',
                                        minHeight: '56px'
                                      }}
                                    >
                                      <div className="font-semibold truncate">{schedule.startTime}</div>
                                      <div className="truncate text-[10px] opacity-90">{schedule.clientName}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      ))}

                      {/* Current time indicator (red line) */}
                      {(() => {
                        const position = getCurrentTimePosition();
                        const isCurrentWeek = getWeekDays(currentDate).some(
                          day => formatDate(day) === formatDate(new Date())
                        );
                        
                        if (position !== null && isCurrentWeek) {
                          const todayIndex = getWeekDays(currentDate).findIndex(
                            day => formatDate(day) === formatDate(new Date())
                          );
                          
                          return (
                            <div
                              className="absolute left-0 right-0 pointer-events-none z-20"
                              style={{ top: `${position}%` }}
                            >
                              {/* Red line */}
                              <div className="h-0.5 bg-red-500 relative">
                                {/* Red dot on current day */}
                                <div
                                  className="absolute w-3 h-3 bg-red-500 rounded-full -top-1.5"
                                  style={{
                                    left: `calc(${((todayIndex + 1) * 100) / 8}% + ${100 / 16}% - 6px)`
                                  }}
                                />
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule/Agenda List View */}
              {viewMode === 'list' && (
                <div className="space-y-0 mb-4">
                  {(() => {
                    // Always show today at the top, then future dates with bookings
                    const today = new Date();
                    const todayStr = formatDate(today);
                    // Group all future schedules (including today)
                    const groupedSchedules = scheduleItems
                      .filter(schedule => new Date(schedule.date) >= new Date(todayStr))
                      .sort((a, b) => {
                        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
                        if (dateCompare !== 0) return dateCompare;
                        return a.startTime.localeCompare(b.startTime);
                      })
                      .reduce((groups, schedule) => {
                        const date = schedule.date;
                        if (!groups[date]) {
                          groups[date] = [];
                        }
                        groups[date].push(schedule);
                        return groups;
                      }, {} as Record<string, ScheduleItem[]>);

                    const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

                    // Always render today section first
                    const [year, month, day] = todayStr.split('-').map(Number);
                    const scheduleDate = new Date(year, month - 1, day);
                    const dayName = scheduleDate.toLocaleDateString('en-US', { weekday: 'long' });
                    const monthDay = scheduleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const todaySchedules = groupedSchedules[todayStr] || [];

                    return [
                      <div key={todayStr} className="border-b border-gray-200 last:border-b-0">
                        {/* Date Header */}
                        <div className={`sticky top-0 z-10 px-4 py-2 flex items-center gap-3 bg-primary text-white`}>
                          <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center bg-white/20`}>
                            <div className={`text-2xl font-bold text-white`}>
                              {scheduleDate.getDate()}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{dayName.toUpperCase()}</div>
                            <div className={`text-xs text-white/80`}>
                              {monthDay}, {scheduleDate.getFullYear()}
                            </div>
                          </div>
                        </div>

                        {/* Schedules for today */}
                        <div className="relative">
                          {todaySchedules.length === 0 && (
                            <div className="flex items-center py-4 px-4 text-red-500">
                              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                              <div className="flex-1 h-0.5 bg-red-500"></div>
                              <div className="ml-2 text-xs font-medium">
                                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          )}
                          {todaySchedules.map((schedule, index) => {
                            const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
                            const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
                            const scheduleStartMinutes = startHour * 60 + startMinute;
                            const scheduleEndMinutes = endHour * 60 + endMinute;
                            const isCurrentlyActive = currentTimeMinutes >= scheduleStartMinutes && currentTimeMinutes <= scheduleEndMinutes;

                            return (
                              <div key={schedule._id}>
                                {/* Current time indicator (red line) - show before the current/next appointment */}
                                {index === 0 && currentTimeMinutes < scheduleStartMinutes && (
                                  <div className="flex items-center py-2 px-4 text-red-500">
                                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                    <div className="flex-1 h-0.5 bg-red-500"></div>
                                    <div className="ml-2 text-xs font-medium">
                                      {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </div>
                                )}
                                {index > 0 && currentTimeMinutes < scheduleStartMinutes && 
                                 currentTimeMinutes > (parseInt(todaySchedules[index - 1].endTime.split(':')[0]) * 60 + parseInt(todaySchedules[index - 1].endTime.split(':')[1])) && (
                                  <div className="flex items-center py-2 px-4 text-red-500">
                                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                    <div className="flex-1 h-0.5 bg-red-500"></div>
                                    <div className="ml-2 text-xs font-medium">
                                      {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </div>
                                )}
                                <div
                                  onClick={() => openScheduleDetails(schedule)}
                                  className={`flex items-start px-4 py-3 cursor-pointer transition-colors border-l-4 ${
                                    isCurrentlyActive
                                      ? 'bg-red-50 border-red-500 hover:bg-red-100'
                                      : 'border-transparent hover:bg-gray-50'
                                  }`}
                                >
                                  {/* Time */}
                                  <div className="w-24 flex-shrink-0">
                                    <div className="text-sm font-semibold text-gray-900">
                                      {schedule.startTime}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {schedule.endTime}
                                    </div>
                                  </div>
                                  {/* Schedule Details */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 mb-1">
                                          {schedule.serviceType}
                                        </div>
                                        <div className="text-sm text-gray-600 truncate">
                                          {schedule.clientName}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate mt-1">
                                          {schedule.address}
                                        </div>
                                        {schedule.pets && schedule.pets.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {schedule.pets.map((pet, petIndex) => (
                                              <Badge key={petIndex} variant="outline" className="text-xs">
                                                {pet.name}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      <Badge
                                        variant={schedule.status === 'confirmed' ? 'default' : 'outline'}
                                        className="flex-shrink-0"
                                      >
                                        {schedule.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                {/* Show red line after last appointment if current time is past it */}
                                {index === todaySchedules.length - 1 && currentTimeMinutes > scheduleEndMinutes && (
                                  <div className="flex items-center py-2 px-4 text-red-500">
                                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                    <div className="flex-1 h-0.5 bg-red-500"></div>
                                    <div className="ml-2 text-xs font-medium">
                                      {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>,
                      // Render future dates with bookings (excluding today)
                      ...Object.entries(groupedSchedules)
                        .filter(([date]) => date !== todayStr)
                        .map(([date, daySchedules]) => {
                          const [year, month, day] = date.split('-').map(Number);
                          const scheduleDate = new Date(year, month - 1, day);
                          const dayName = scheduleDate.toLocaleDateString('en-US', { weekday: 'long' });
                          const monthDay = scheduleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          return (
                            <div key={date} className="border-b border-gray-200 last:border-b-0">
                              {/* Date Header */}
                              <div className={`sticky top-0 z-10 px-4 py-2 flex items-center gap-3 bg-gray-50 text-gray-900`}>
                                <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center bg-primary/10`}>
                                  <div className={`text-2xl font-bold text-primary`}>
                                    {scheduleDate.getDate()}
                                  </div>
                                </div>
                                <div>
                                  <div className="font-semibold text-sm">{dayName.toUpperCase()}</div>
                                  <div className={`text-xs text-gray-500`}>
                                    {monthDay}, {scheduleDate.getFullYear()}
                                  </div>
                                </div>
                              </div>
                              {/* Schedules for this day */}
                              <div className="relative">
                                {daySchedules.map((schedule, index) => {
                                  const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
                                  const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
                                  const scheduleStartMinutes = startHour * 60 + startMinute;
                                  const scheduleEndMinutes = endHour * 60 + endMinute;
                                  return (
                                    <div key={schedule._id}>
                                      <div
                                        onClick={() => openScheduleDetails(schedule)}
                                        className={`flex items-start px-4 py-3 cursor-pointer transition-colors border-l-4 border-transparent hover:bg-gray-50`}
                                      >
                                        {/* Time */}
                                        <div className="w-24 flex-shrink-0">
                                          <div className="text-sm font-semibold text-gray-900">
                                            {schedule.startTime}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {schedule.endTime}
                                          </div>
                                        </div>
                                        {/* Schedule Details */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                              <div className="font-medium text-gray-900 mb-1">
                                                {schedule.serviceType}
                                              </div>
                                              <div className="text-sm text-gray-600 truncate">
                                                {schedule.clientName}
                                              </div>
                                              <div className="text-xs text-gray-500 truncate mt-1">
                                                {schedule.address}
                                              </div>
                                              {schedule.pets && schedule.pets.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                  {schedule.pets.map((pet, petIndex) => (
                                                    <Badge key={petIndex} variant="outline" className="text-xs">
                                                      {pet.name}
                                                    </Badge>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                            <Badge
                                              variant={schedule.status === 'confirmed' ? 'default' : 'outline'}
                                              className="flex-shrink-0"
                                            >
                                              {schedule.status}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                    ];
                  })()}
                </div>
              )}
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
              {!availabilitySettings || !availabilitySettings.weeklySchedule ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading availability settings...</p>
                  </div>
                </div>
              ) : (
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
                            <input 
                              type="checkbox" 
                              className="rounded" 
                              checked={availabilitySettings.weeklySchedule?.[day]?.isAvailable || false}
                              onChange={(e) => {
                                const newSettings = {
                                  ...availabilitySettings,
                                  weeklySchedule: {
                                    ...availabilitySettings.weeklySchedule,
                                    [day]: {
                                      ...availabilitySettings.weeklySchedule?.[day],
                                      isAvailable: e.target.checked
                                    }
                                  }
                                };
                                setAvailabilitySettings(newSettings);
                              }}
                            />
                            <select 
                              className="text-xs border rounded px-2 py-1"
                              value={availabilitySettings.weeklySchedule?.[day]?.startTime || '00:00'}
                              onChange={(e) => {
                                const newSettings = {
                                  ...availabilitySettings,
                                  weeklySchedule: {
                                    ...availabilitySettings.weeklySchedule,
                                    [day]: {
                                      ...availabilitySettings.weeklySchedule?.[day],
                                      startTime: e.target.value
                                    }
                                  }
                                };
                                setAvailabilitySettings(newSettings);
                              }}
                            >
                              {Array.from({ length: 48 }, (_, i) => {
                                const hour = Math.floor(i / 2).toString().padStart(2, '0');
                                const minute = i % 2 === 0 ? '00' : '30';
                                const time = `${hour}:${minute}`;
                                return (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                );
                              })}
                            </select>
                            <span className="text-xs">to</span>
                            <select 
                              className="text-xs border rounded px-2 py-1"
                              value={availabilitySettings.weeklySchedule?.[day]?.endTime || '00:00'}
                              onChange={(e) => {
                                const newSettings = {
                                  ...availabilitySettings,
                                  weeklySchedule: {
                                    ...availabilitySettings.weeklySchedule,
                                    [day]: {
                                      ...availabilitySettings.weeklySchedule?.[day],
                                      endTime: e.target.value
                                    }
                                  }
                                };
                                setAvailabilitySettings(newSettings);
                              }}
                            >
                              {Array.from({ length: 48 }, (_, i) => {
                                const hour = Math.floor(i / 2).toString().padStart(2, '0');
                                const minute = i % 2 === 0 ? '00' : '30';
                                const time = `${hour}:${minute}`;
                                return (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                );
                              })}
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
                        <select 
                          className="w-full mt-1 border rounded px-3 py-2"
                          value={availabilitySettings.maxDailyBookings}
                          onChange={(e) => {
                            setAvailabilitySettings({
                              ...availabilitySettings,
                              maxDailyBookings: parseInt(e.target.value)
                            });
                          }}
                        >
                          <option value="1">1 booking</option>
                          <option value="2">2 bookings</option>
                          <option value="3">3 bookings</option>
                          <option value="4">4 bookings</option>
                          <option value="5">5+ bookings</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Advance notice required</label>
                        <select 
                          className="w-full mt-1 border rounded px-3 py-2"
                          value={availabilitySettings.advanceNotice}
                          onChange={(e) => {
                            setAvailabilitySettings({
                              ...availabilitySettings,
                              advanceNotice: parseInt(e.target.value)
                            });
                          }}
                        >
                          <option value="0">Same day</option>
                          <option value="1">1 day</option>
                          <option value="2">2 days</option>
                          <option value="3">3 days</option>
                          <option value="7">1 week</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Travel distance</label>
                        <select 
                          className="w-full mt-1 border rounded px-3 py-2"
                          value={availabilitySettings.travelDistance}
                          onChange={(e) => {
                            setAvailabilitySettings({
                              ...availabilitySettings,
                              travelDistance: parseInt(e.target.value)
                            });
                          }}
                        >
                          <option value="5">Within 5km</option>
                          <option value="10">Within 10km</option>
                          <option value="20">Within 20km</option>
                          <option value="50">Within 50km</option>
                          <option value="999">Any distance</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Dates */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Special Dates & Holiday Rates</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Unavailable Dates Calendar */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Unavailable Dates</label>
                      <div className="border rounded-lg p-3 bg-gray-50">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-3">
                          <button
                            type="button"
                            onClick={() => {
                              const newDate = new Date(currentDate);
                              newDate.setMonth(newDate.getMonth() - 1);
                              setCurrentDate(newDate);
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            ←
                          </button>
                          <h4 className="font-medium text-sm">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              const newDate = new Date(currentDate);
                              newDate.setMonth(newDate.getMonth() + 1);
                              setCurrentDate(newDate);
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            →
                          </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 text-xs">
                          {/* Day headers */}
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                            <div key={day} className="text-center font-medium p-1 text-gray-600">
                              {day}
                            </div>
                          ))}
                          
                          {/* Calendar days */}
                          {getDaysInMonth(currentDate).map((day, index) => {
                            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                            const dateStr = formatDate(day);
                            const isUnavailable = availabilitySettings.unavailableDates?.includes(dateStr);
                            const isPast = day < new Date(formatDate(new Date()));
                            
                            return (
                              <button
                                key={index}
                                type="button"
                                disabled={!isCurrentMonth || isPast}
                                onClick={() => {
                                  if (!isCurrentMonth || isPast) return;
                                  
                                  const currentUnavailable = availabilitySettings.unavailableDates || [];
                                  const newUnavailable = isUnavailable
                                    ? currentUnavailable.filter(date => date !== dateStr)
                                    : [...currentUnavailable, dateStr];
                                  
                                  setAvailabilitySettings({
                                    ...availabilitySettings,
                                    unavailableDates: newUnavailable.sort()
                                  });
                                }}
                                className={`
                                  p-1 text-xs rounded transition-colors
                                  ${!isCurrentMonth 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : isPast
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : isUnavailable
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'hover:bg-primary/10 text-gray-700'
                                  }
                                `}
                              >
                                {day.getDate()}
                              </button>
                            );
                          })}
                        </div>

                        {/* Selected unavailable dates display */}
                        {availabilitySettings.unavailableDates && availabilitySettings.unavailableDates.length > 0 && (
                          <div className="mt-3 p-2 bg-white rounded border">
                            <div className="text-xs font-medium text-gray-600 mb-1">Selected Unavailable Dates:</div>
                            <div className="flex flex-wrap gap-1">
                              {availabilitySettings.unavailableDates.map(date => (
                                <span
                                  key={date}
                                  className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
                                >
                                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newUnavailable = availabilitySettings.unavailableDates?.filter(d => d !== date) || [];
                                      setAvailabilitySettings({
                                        ...availabilitySettings,
                                        unavailableDates: newUnavailable
                                      });
                                    }}
                                    className="ml-1 hover:text-red-600"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-2 text-xs text-gray-500">
                          Click on dates to mark them as unavailable. Past dates cannot be selected.
                        </div>
                      </div>
                    </div>
                    {/* Holiday & Weekend Rates */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Holiday & Weekend Rates</label>
                      <div className="border rounded-lg p-3 bg-gray-50 space-y-3">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="rounded mr-2"
                            checked={availabilitySettings.holidayRates?.chargeExtraOnHolidays || false}
                            onChange={(e) => {
                              setAvailabilitySettings({
                                ...availabilitySettings,
                                holidayRates: {
                                  ...availabilitySettings.holidayRates,
                                  chargeExtraOnHolidays: e.target.checked
                                }
                              });
                            }}
                          />
                          <span className="text-sm">Charge extra on holidays (+{availabilitySettings.holidayRates?.holidayRateIncrease || 25}%)</span>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="rounded mr-2"
                            checked={availabilitySettings.holidayRates?.chargeExtraOnWeekends || false}
                            onChange={(e) => {
                              setAvailabilitySettings({
                                ...availabilitySettings,
                                holidayRates: {
                                  ...availabilitySettings.holidayRates,
                                  chargeExtraOnWeekends: e.target.checked
                                }
                              });
                            }}
                          />
                          <span className="text-sm">Charge extra on weekends (+{availabilitySettings.holidayRates?.weekendRateIncrease || 15}%)</span>
                        </div>
                        
                        <div className="mt-3 p-2 bg-white rounded border">
                          <div className="text-xs font-medium text-gray-600 mb-1">Holiday Rate Details:</div>
                          <div className="text-xs text-gray-500">
                            Holiday rates apply to: Christmas, New Year, and Thanksgiving
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (currentUserId) {
                        fetchAvailabilitySettings(currentUserId);
                      }
                    }}
                  >
                    Reset to Default
                  </Button>
                  <Button 
                    onClick={() => saveAvailabilitySettings(availabilitySettings)}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Availability'}
                  </Button>
                </div>
              </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Schedule Details Modal */}
        {selectedSchedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-0 relative animate-fadeIn max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-primary text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg sticky top-0 z-10">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-1">
                      {selectedSchedule.serviceType}
                    </h3>
                    <p className="text-primary-foreground/90 text-xs sm:text-sm">
                      {new Date(selectedSchedule.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })} • {selectedSchedule.startTime} - {selectedSchedule.endTime}
                    </p>
                  </div>
                  <button
                    onClick={closeScheduleDetails}
                    className="text-primary-foreground/90 hover:text-white text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">Client</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedSchedule.clientName}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">Location</h4>
                    <p className="text-sm text-gray-600 mt-1 break-words">{selectedSchedule.address}</p>
                  </div>
                </div>

                {selectedSchedule.pets && selectedSchedule.pets.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">Pets</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedSchedule.pets.map((pet, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{pet.name}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">Status</h4>
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
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">Notes</h4>
                      <p className="text-sm text-gray-600 mt-1 break-words">{selectedSchedule.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between sm:items-center px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 rounded-b-lg sticky bottom-0">
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* <Button variant="outline" size="sm" className="text-primary w-full sm:w-auto text-xs sm:text-sm"> */}
                    {/* <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg> */}
                    {/* <span className="hidden sm:inline">Copy to calendar</span>
                    <span className="sm:hidden">Copy to calendar</span> */}
                  {/* </Button> */}
                </div>
                <Button 
                  onClick={() => router.push(`/bookings/${selectedSchedule._id}`)}
                  className="w-full sm:w-auto text-sm"
                  size="sm"
                >
                  View Full Details
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
