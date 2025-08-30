import { NextRequest, NextResponse } from 'next/server';

// Mock backend API endpoint for testing purposes
// In production, this would be replaced by actual backend API calls

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    // Validate inputs
    if (!token || !newPassword) {
      return NextResponse.json(
        { message: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password requirements
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!/\d/.test(newPassword)) {
      return NextResponse.json(
        { message: 'Password must contain at least one number' },
        { status: 400 }
      );
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return NextResponse.json(
        { message: 'Password must contain at least one special character' },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock token validation
    // In a real application, you would:
    // 1. Validate the token exists and hasn't expired
    // 2. Get the associated user
    // 3. Hash the new password
    // 4. Update the user's password in the database
    // 5. Invalidate the reset token

    // For demo purposes, we'll simulate different scenarios based on token value
    if (token === 'expired-token') {
      return NextResponse.json(
        { message: 'Reset token has expired. Please request a new reset link.' },
        { status: 400 }
      );
    }

    if (token === 'invalid-token') {
      return NextResponse.json(
        { message: 'Invalid reset token. Please request a new reset link.' },
        { status: 400 }
      );
    }

    // Success case
    return NextResponse.json(
      { 
        message: 'Password reset successful',
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
