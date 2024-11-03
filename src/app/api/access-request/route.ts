// app/api/access-request/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // Here, you can handle the data as needed, e.g., save to a database, send an email, etc.
    console.log('Access Request:', { name, email, message });

    return NextResponse.json({ success: true, message: 'Request submitted successfully' });
  } catch (error) {
    console.error('Error handling access request:', error);
    return NextResponse.json(
      { success: false, message: 'There was an error processing your request' },
      { status: 500 }
    );
  }
}
