import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'HEALTHY';
  let dbLatency = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
  } catch (error) {
    dbStatus = 'UNHEALTHY';
  }

  const memoryUsage = process.memoryUsage();
  const memoryMB = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
  };

  const isHealthy = dbStatus === 'HEALTHY';
  const status = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'production',
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatency,
        },
      },
      system: {
        memoryMB,
        nodeVersion: process.version,
      },
      responseTimeMs: Date.now() - startTime,
    },
    { status }
  );
}
