import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mvpUsers } from '@/lib/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    // Validation
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
      .where(eq(mvpUsers.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const existingUsername = await db
      .select()
      .from(mvpUsers)
      .where(eq(mvpUsers.username, username))
      .limit(1);

    if (existingUsername.length > 0) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const newUser = await db
      .insert(mvpUsers)
      .values({
        email,
        username,
        password: hashedPassword,
      })
      .returning({ id: mvpUsers.id, email: mvpUsers.email, username: mvpUsers.username });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: newUser[0],
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
