import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mvpUsers } from '@/lib/schema';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
      userId: number;
    };

    const body = await request.json();
    const { interests } = body;

    if (!Array.isArray(interests)) {
      return NextResponse.json(
        { error: 'Interests must be an array' },
        { status: 400 }
      );
    }

    // Update user interests
    await db
      .update(mvpUsers)
      .set({ 
        interests,
        updatedAt: new Date(),
      })
      .where(eq(mvpUsers.id, decoded.userId));

    return NextResponse.json(
      { message: 'Interests updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update interests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
