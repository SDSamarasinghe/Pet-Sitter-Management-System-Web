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
  advanceNoticeHours: number;
  travelDistance: number;
  unavailableDates: string[];
}

interface AvailabilityCheckDto {
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    
    // Validate required fields
    if (!startDate || !endDate) {
      return NextResponse.json(
        { 
          success: false,
          message: ["startDate must be a valid ISO 8601 date string", "endDate must be a valid ISO 8601 date string"],
          error: "Bad Request",
          statusCode: 400
        },
        { status: 400 }
      );
    }
    
    // Get sitter's settings
    let settings = availabilitySettings[sitterId];
    if (!settings) {
      // Initialize default settings if not found
      availabilitySettings[sitterId] = {
        sitterId,
        weeklySchedule: {
          monday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          tuesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          wednesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          thursday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          friday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          saturday: { isAvailable: false, startTime: '09:00', endTime: '17:00' },
          sunday: { isAvailable: false, startTime: '09:00', endTime: '17:00' }
        },
        maxDailyBookings: 3,
        advanceNoticeHours: 24,
        travelDistance: 20,
        unavailableDates: []
      };
      settings = availabilitySettings[sitterId];
    }
    
    const conflicts: string[] = [];
    const availableSlots: AvailabilitySlot[] = [];
    
    // Check dates from startDate to endDate
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    for (let date = new Date(startDateObj); date <= endDateObj; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if date is in unavailable dates
      if (settings.unavailableDates.includes(dateStr)) {
        conflicts.push(`Date ${dateStr} is marked as unavailable`);
        continue;
      }
      
      // Check weekly schedule
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[date.getDay()];
      const daySchedule = settings.weeklySchedule[dayName];
      
      if (!daySchedule || !daySchedule.isAvailable) {
        conflicts.push(`${dayName.charAt(0).toUpperCase() + dayName.slice(1)} is not available`);
        continue;
      }
      
      // Find available slots for this date
      const sitterSlots = availabilitySlots[sitterId] || [];
      const daySlots = sitterSlots.filter(slot => 
        slot.date === dateStr && slot.isAvailable && !slot.isBooked
      );
      
      // If no specific slots, create default slot based on working hours
      if (daySlots.length === 0) {
        daySlots.push({
          _id: `default-${dateStr}`,
          sitterId,
          date: dateStr,
          startTime: daySchedule.startTime,
          endTime: daySchedule.endTime,
          isAvailable: true,
          isBooked: false
        });
      }
      
      availableSlots.push(...daySlots);
    }
    
    // Check advance notice
    const hoursUntilStart = (startDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    if (hoursUntilStart < settings.advanceNoticeHours) {
      conflicts.push(`Booking requires ${settings.advanceNoticeHours} hours advance notice`);
    }
    
    // Check daily booking limits
    const sitterSlots = availabilitySlots[sitterId] || [];
    const bookedSlotsInRange = sitterSlots.filter(slot => {
      const slotDate = new Date(slot.date);
      return slotDate >= startDateObj && slotDate <= endDateObj && slot.isBooked;
    });
    
    if (bookedSlotsInRange.length >= settings.maxDailyBookings) {
      conflicts.push(`Maximum daily bookings (${settings.maxDailyBookings}) reached`);
    }
    
    // Check specific time conflicts if startTime and endTime provided
    if (startTime && endTime) {
      const hasTimeConflict = bookedSlotsInRange.some(slot => {
        return (
          (startTime >= slot.startTime && startTime < slot.endTime) ||
          (endTime > slot.startTime && endTime <= slot.endTime) ||
          (startTime <= slot.startTime && endTime >= slot.endTime)
        );
      });
      
      if (hasTimeConflict) {
        conflicts.push('Time slot conflicts with existing booking');
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        isAvailable: conflicts.length === 0,
        availableSlots: availableSlots.map(slot => ({
          _id: slot._id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          date: slot.date
        })),
        settings: settings,
        conflicts,
        workingHours: conflicts.length === 0 && availableSlots.length > 0 ? {
          startTime: availableSlots[0].startTime,
          endTime: availableSlots[0].endTime
        } : undefined,
        remainingBookings: Math.max(0, settings.maxDailyBookings - bookedSlotsInRange.length)
      },
      message: 'Availability check completed successfully'
    });
    
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to check availability',
        error: 'Internal Server Error',
        statusCode: 500
      },
      { status: 500 }
    );
  }
}
