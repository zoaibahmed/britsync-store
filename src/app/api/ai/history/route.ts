import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
  )
`;

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ history: [] });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'shopping';

    // Dynamically ensure table exists
    await prisma.$executeRawUnsafe(CREATE_TABLE_SQL);

    // Fetch history
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, role, content, createdAt FROM "ChatMessage" WHERE "userId" = $1 AND "mode" = $2 ORDER BY "createdAt" ASC`,
      session.userId,
      mode
    );

    const history = rows.map(r => ({
      id: r.id,
      role: r.role,
      content: r.content,
      timestamp: new Date(r.createdAt)
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error('GET History Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve history' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { mode, history } = await request.json();
    if (!mode || !Array.isArray(history)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Dynamically ensure table exists
    await prisma.$executeRawUnsafe(CREATE_TABLE_SQL);

    // Delete old logs for this user/mode
    await prisma.$executeRawUnsafe(
      `DELETE FROM "ChatMessage" WHERE "userId" = $1 AND "mode" = $2`,
      session.userId,
      mode
    );

    // Insert updated logs
    for (const msg of history) {
      if (msg.role === 'system') continue; // Avoid persisting system state messages
      const msgId = msg.id || `msg-${Date.now()}-${Math.random()}`;
      const timeStr = msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString();
      await prisma.$executeRawUnsafe(
        `INSERT INTO "ChatMessage" ("id", "userId", "role", "content", "mode", "createdAt") VALUES ($1, $2, $3, $4, $5, $6)`,
        msgId,
        session.userId,
        msg.role,
        msg.content,
        mode,
        timeStr
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST History Error:', error);
    return NextResponse.json({ error: 'Failed to store history' }, { status: 500 });
  }
}
