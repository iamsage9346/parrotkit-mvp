import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mvpUsers } from '@/lib/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq, or } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(mvpUsers)
      .where(
        or(
          eq(mvpUsers.email, email),
          eq(mvpUsers.username, username)
        )
      )
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db
      .insert(mvpUsers)
      .values({
        email,
        username,
        password: hashedPassword,
        interests: [],
      })
      .returning();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser[0].id,
        email: newUser[0].email,
        username: newUser[0].username,
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        message: 'Signup successful',
        token,
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          username: newUser[0].username,
          interests: newUser[0].interests,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
