import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { processChatRequest } from '@/services/chat';
import { translateText } from '@/services/translation';

export const dynamic = 'force-dynamic';

import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!rateLimit(ip, { windowMs: 60000, max: 30 })) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { messages, mode, browsingHistory, memory, lang = 'en' } = await request.json();
    const session = await getSession();

    // Call the central chat routing service
    let aiResponse = await processChatRequest({
      messages,
      mode,
      browsingHistory,
      memory,
      lang
    }, session);

    // Apply translation if required
    if (lang && lang !== 'en') {
      aiResponse = translateText(aiResponse, lang);
    }

    // Stream the response back word-by-word
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = aiResponse.split(' ');
        let i = 0;
        while (i < words.length) {
          const chunk = words.slice(i, i + 3).join(' ') + ' ';
          controller.enqueue(encoder.encode(chunk));
          i += 3;
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error: any) {
    console.error('AI Chat Route Error:', error.message);
    return NextResponse.json(
      { error: 'Sorry, our support assistant is temporarily unavailable. Please try again in a few minutes.' },
      { status: 500 }
    );
  }
}
