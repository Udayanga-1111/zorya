import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword, signToken } from '../services/auth.service';
import { registerUser, getUserByEmail } from '../services/user.service';

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signupController(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await getUserByEmail(validatedData.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(validatedData.password);

    // Create user
    const user = await registerUser({
      ...validatedData,
      password_hash
    });

    // Generate JWT token
    const token = signToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      message: 'User created successfully',
      user,
      token
    }, { status: 201 });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
