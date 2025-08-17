import { NextRequest, NextResponse } from 'next/server';

interface AvailabilitySlot {
  _id: string;
  sitterId: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  isBooked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data storage (replace with actual database)
let availabilitySlots: { [key: string]: AvailabilitySlot[] } = {};

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export async function GET(
  request: NextRequest,
  { params }: { params: { sitterId: string } }
) {
  try {
    const { sitterId } = params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Get all slots for the sitter
    let slots = availabilitySlots[sitterId] || [];
    
    // Filter by date range if provided
    if (startDate && endDate) {
      slots = slots.filter(slot => 
        slot.date >= startDate && slot.date <= endDate
      );
    }
    
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching availability slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability slots' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sitterId: string } }
) {
  try {
    const { sitterId } = params;
    const body = await request.json();
    
    // Validate required fields
    if (!body.date || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: date, startTime, endTime' },
        { status: 400 }
      );
    }
    
    // Create new slot
    const newSlot: AvailabilitySlot = {
      _id: generateId(),
      sitterId,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
      isBooked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Initialize array if it doesn't exist
    if (!availabilitySlots[sitterId]) {
      availabilitySlots[sitterId] = [];
    }
    
    // Add slot
    availabilitySlots[sitterId].push(newSlot);
    
    return NextResponse.json(newSlot, { status: 201 });
  } catch (error) {
    console.error('Error creating availability slot:', error);
    return NextResponse.json(
      { error: 'Failed to create availability slot' },
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
    
    // Bulk update/create slots
    if (Array.isArray(body)) {
      const updatedSlots: AvailabilitySlot[] = [];
      
      // Initialize array if it doesn't exist
      if (!availabilitySlots[sitterId]) {
        availabilitySlots[sitterId] = [];
      }
      
      for (const slotData of body) {
        if (slotData._id) {
          // Update existing slot
          const slotIndex = availabilitySlots[sitterId].findIndex(
            slot => slot._id === slotData._id
          );
          
          if (slotIndex !== -1) {
            availabilitySlots[sitterId][slotIndex] = {
              ...availabilitySlots[sitterId][slotIndex],
              ...slotData,
              updatedAt: new Date(),
            };
            updatedSlots.push(availabilitySlots[sitterId][slotIndex]);
          }
        } else {
          // Create new slot
          const newSlot: AvailabilitySlot = {
            _id: generateId(),
            sitterId,
            date: slotData.date,
            startTime: slotData.startTime,
            endTime: slotData.endTime,
            isAvailable: slotData.isAvailable !== undefined ? slotData.isAvailable : true,
            isBooked: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          availabilitySlots[sitterId].push(newSlot);
          updatedSlots.push(newSlot);
        }
      }
      
      return NextResponse.json(updatedSlots);
    }
    
    return NextResponse.json(
      { error: 'Request body must be an array of slots' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating availability slots:', error);
    return NextResponse.json(
      { error: 'Failed to update availability slots' },
      { status: 500 }
    );
  }
}
