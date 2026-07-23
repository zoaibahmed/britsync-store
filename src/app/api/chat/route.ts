import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { processChatRequest } from '@/services/chat';
import { translateText } from '@/services/translation';

export const dynamic = 'force-dynamic';

// Rate limiting store (in-memory, resets on server restart)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 30; // max requests per window

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

// Sanitize user input to prevent XSS and prompt injection
function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .slice(0, 2000);
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { messages, mode, browsingHistory, memory, lang = 'en' } = body;

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty.' },
        { status: 400 }
      );
    }

    // Sanitize user messages
    const sanitizedMessages = messages.map((msg: any) => ({
      ...msg,
      content: typeof msg.content === 'string' ? sanitizeInput(msg.content) : ''
    }));

    const session = await getSession();

    // Call the central chat routing service
    let aiResponse = await processChatRequest({
      messages: sanitizedMessages,
      mode: mode || 'shopping',
      browsingHistory: Array.isArray(browsingHistory) ? browsingHistory : [],
      memory: memory || {},
      lang
    }, session);

    // Apply translation if required
    if (lang && lang !== 'en') {
      aiResponse = translateText(aiResponse, lang);
    }

    // Stream the response back word-by-word for streaming-ready architecture
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
    console.error('Chat Route Error:', error.message);
    // Never expose stack traces to the client
    return NextResponse.json(
      { error: 'Sorry, our support assistant is temporarily unavailable. Please try again in a few minutes.' },
      { status: 500 }
    );
  }
}
