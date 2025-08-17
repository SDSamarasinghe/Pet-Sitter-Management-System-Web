import { NextRequest, NextResponse } from 'next/server';

interface AvailabilitySlot {
  _id: string;
  sitterId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data storage (replace with actual database)
let availabilitySlots: { [key: string]: AvailabilitySlot[] } = {};

export async function PUT(
  request: NextRequest,
  { params }: { params: { sitterId: string; slotId: string } }
) {
  try {
    const { sitterId, slotId } = params;
    const body = await request.json();
    
    // Get sitter's slots
    const sitterSlots = availabilitySlots[sitterId] || [];
    const slotIndex = sitterSlots.findIndex(slot => slot._id === slotId);
    
    if (slotIndex === -1) {
      return NextResponse.json(
        { error: 'Availability slot not found' },
        { status: 404 }
      );
    }
    
    // Update the slot
    const updatedSlot = {
      ...sitterSlots[slotIndex],
      ...body,
      updatedAt: new Date(),
    };
    
    availabilitySlots[sitterId][slotIndex] = updatedSlot;
    
    return NextResponse.json(updatedSlot);
  } catch (error) {
    console.error('Error updating availability slot:', error);
    return NextResponse.json(
      { error: 'Failed to update availability slot' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sitterId: string; slotId: string } }
) {
  try {
    const { sitterId, slotId } = params;
    
    // Get sitter's slots
    const sitterSlots = availabilitySlots[sitterId] || [];
    const slotIndex = sitterSlots.findIndex(slot => slot._id === slotId);
    
    if (slotIndex === -1) {
      return NextResponse.json(
        { error: 'Availability slot not found' },
        { status: 404 }
      );
    }
    
    // Remove the slot
    const deletedSlot = sitterSlots.splice(slotIndex, 1)[0];
    
    return NextResponse.json({
      message: 'Availability slot deleted successfully',
      deletedSlot
    });
  } catch (error) {
    console.error('Error deleting availability slot:', error);
    return NextResponse.json(
      { error: 'Failed to delete availability slot' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { sitterId: string; slotId: string } }
) {
  try {
    const { sitterId, slotId } = params;
    
    // Get sitter's slots
    const sitterSlots = availabilitySlots[sitterId] || [];
    const slot = sitterSlots.find(slot => slot._id === slotId);
    
    if (!slot) {
      return NextResponse.json(
        { error: 'Availability slot not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(slot);
  } catch (error) {
    console.error('Error fetching availability slot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability slot' },
      { status: 500 }
    );
  }
}
