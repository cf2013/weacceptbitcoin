import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const data = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/stores/${params.storeId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Failed to verify store' },
        { status: response.status }
      );
    }

    const store = await response.json();
    return NextResponse.json(store);
  } catch (error) {
    console.error('Error verifying store:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 