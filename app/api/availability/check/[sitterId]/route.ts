import { NextRequest, NextResponse } from 'next/server';

interface AvailabilitySlot {
  _id: string;
  sitterId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
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
}

// Mock data (replace with actual database calls)
let availabilitySlots: { [key: string]: AvailabilitySlot[] } = {};
let availabilitySettings: { [key: string]: AvailabilitySettings } = {};

export async function GET(
  request: NextRequest,
  { params }: { params: { sitterId: string } }
) {
  try {
    const { sitterId } = params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    
    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }
    
    // Get sitter's settings
    const settings = availabilitySettings[sitterId];
    if (!settings) {
      return NextResponse.json({
        isAvailable: false,
        reason: 'Sitter availability settings not found'
      });
    }
    
    // Check if date is in unavailable dates
    if (settings.unavailableDates.includes(date)) {
      return NextResponse.json({
        isAvailable: false,
        reason: 'Date marked as unavailable'
      });
    }
    
    // Check advance notice
    const requestDate = new Date(date);
    const today = new Date();
    const daysDifference = Math.ceil((requestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference < settings.advanceNotice) {
      return NextResponse.json({
        isAvailable: false,
        reason: `Requires ${settings.advanceNotice} day(s) advance notice`
      });
    }
    
    // Get day of week
    const dayOfWeek = requestDate.toLocaleDateString('en-US', { weekday: 'long' });
    const daySchedule = settings.weeklySchedule[dayOfWeek];
    
    if (!daySchedule || !daySchedule.isAvailable) {
      return NextResponse.json({
        isAvailable: false,
        reason: `Not available on ${dayOfWeek}s`
      });
    }
    
    // Check if requested time is within working hours
    if (startTime && endTime) {
      const workStart = daySchedule.startTime;
      const workEnd = daySchedule.endTime;
      
      if (startTime < workStart || endTime > workEnd) {
        return NextResponse.json({
          isAvailable: false,
          reason: `Working hours are ${workStart} - ${workEnd}`
        });
      }
    }
    
    // Check existing bookings for the date
    const sitterSlots = availabilitySlots[sitterId] || [];
    const dateSlots = sitterSlots.filter(slot => slot.date === date);
    const bookedSlots = dateSlots.filter(slot => slot.isBooked);
    
    // Check max daily bookings
    if (bookedSlots.length >= settings.maxDailyBookings) {
      return NextResponse.json({
        isAvailable: false,
        reason: 'Maximum daily bookings reached'
      });
    }
    
    // Check for time conflicts if specific time requested
    if (startTime && endTime) {
      const hasConflict = bookedSlots.some(slot => {
        return (
          (startTime >= slot.startTime && startTime < slot.endTime) ||
          (endTime > slot.startTime && endTime <= slot.endTime) ||
          (startTime <= slot.startTime && endTime >= slot.endTime)
        );
      });
      
      if (hasConflict) {
        return NextResponse.json({
          isAvailable: false,
          reason: 'Time slot conflicts with existing booking'
        });
      }
    }
    
    // Check specific availability slots
    const availableSlots = dateSlots.filter(slot => 
      slot.isAvailable && !slot.isBooked
    );
    
    if (startTime && endTime) {
      const matchingSlot = availableSlots.find(slot =>
        slot.startTime <= startTime && slot.endTime >= endTime
      );
      
      if (!matchingSlot) {
        return NextResponse.json({
          isAvailable: false,
          reason: 'No available slot for requested time',
          availableSlots: availableSlots.map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime
          }))
        });
      }
    }
    
    return NextResponse.json({
      isAvailable: true,
      availableSlots: availableSlots.map(slot => ({
        _id: slot._id,
        startTime: slot.startTime,
        endTime: slot.endTime
      })),
      workingHours: {
        startTime: daySchedule.startTime,
        endTime: daySchedule.endTime
      },
      remainingBookings: settings.maxDailyBookings - bookedSlots.length
    });
    
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
