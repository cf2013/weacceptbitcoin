import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const response = await fetch(`${BACKEND_URL}/api/stores`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Failed to create store' },
        { status: response.status }
      );
    }

    const store = await response.json();
    return NextResponse.json(store);
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/stores`);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch stores' },
        { status: response.status }
      );
    }

    const stores = await response.json();
    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 