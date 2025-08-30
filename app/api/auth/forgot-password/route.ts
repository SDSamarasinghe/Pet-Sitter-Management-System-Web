import { NextRequest, NextResponse } from 'next/server';

// Mock backend API endpoint for testing purposes
// In production, this would be replaced by actual backend API calls

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real application, you would:
    // 1. Check if user exists in database
    // 2. Generate a secure reset token
    // 3. Store token with expiration time
    // 4. Send email with reset link
    
    // For demo purposes, we'll always return success
    return NextResponse.json(
      { 
        message: 'If your email exists, you will receive a reset link shortly',
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
