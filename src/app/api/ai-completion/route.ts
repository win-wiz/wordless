import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  const body = await request.json();
  const { length, model } = body;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_DOUBAO_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DOUBAO_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.NEXT_PUBLIC_DOUBAO_LINK_128K_MODEL,
        messages: body.messages,
        parameters: body.parameters,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 