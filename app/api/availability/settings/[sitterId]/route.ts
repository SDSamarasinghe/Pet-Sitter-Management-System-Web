import { NextRequest, NextResponse } from 'next/server';

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
  advanceNotice: number; // days
  travelDistance: number; // km
  unavailableDates: string[];
  holidayRates: {
    chargeExtraOnHolidays: boolean;
    holidayRateIncrease: number; // percentage
    chargeExtraOnWeekends: boolean;
    weekendRateIncrease: number; // percentage
  };
  createdAt: Date;
  updatedAt: Date;
}

// Mock data storage (replace with actual database)
let availabilitySettings: { [key: string]: AvailabilitySettings } = {};

export async function GET(
  request: NextRequest,
  { params }: { params: { sitterId: string } }
) {
  try {
    const { sitterId } = params;
    
    // Get settings for the sitter
    const settings = availabilitySettings[sitterId];
    
    if (!settings) {
      // Return default settings if none exist
      const defaultSettings: AvailabilitySettings = {
        sitterId,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return NextResponse.json(defaultSettings);
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching availability settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability settings' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { sitterId: string } }
) {
  try {
    const { sitterId } = params;
    const body = await request.json();
    
    // Validate required fields
    if (!body.weeklySchedule || !body.maxDailyBookings) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create or update settings
    const settings: AvailabilitySettings = {
      sitterId,
      weeklySchedule: body.weeklySchedule,
      maxDailyBookings: body.maxDailyBookings,
      advanceNotice: body.advanceNotice || 1,
      travelDistance: body.travelDistance || 10,
      unavailableDates: body.unavailableDates || [],
      holidayRates: body.holidayRates || {
        chargeExtraOnHolidays: false,
        holidayRateIncrease: 25,
        chargeExtraOnWeekends: false,
        weekendRateIncrease: 15,
      },
      createdAt: availabilitySettings[sitterId]?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    // Store settings (replace with database save)
    availabilitySettings[sitterId] = settings;
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating availability settings:', error);
    return NextResponse.json(
      { error: 'Failed to update availability settings' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sitterId: string } }
) {
  // POST method calls PUT for creating/updating
  return PUT(request, { params });
}
