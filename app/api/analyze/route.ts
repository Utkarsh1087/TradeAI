import { NextRequest, NextResponse } from 'next/server';
import { analyzeQuestion } from '@/lib/ai/analyzeQuestion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Lightweight in-memory rate limiter (Sliding Window per IP)
interface RateLimitRecord {
  timestamps: number[];
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;     // 30 requests per minute per IP
const rateLimitMap = new Map<string, RateLimitRecord>();

// Periodic cleanup to avoid memory leaks
let lastCleanup = Date.now();
function cleanupRateLimitMap() {
  const now = Date.now();
  if (now - lastCleanup > 5 * 60 * 1000) { // every 5 minutes
    lastCleanup = now;
    for (const [ip, record] of rateLimitMap.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(ip);
      }
    }
  }
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  cleanupRateLimitMap();
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { timestamps: [] };
  
  // Filter out timestamps older than window
  record.timestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  record.timestamps.push(now);
  rateLimitMap.set(ip, record);
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.timestamps.length };
}

export async function POST(req: NextRequest) {
  // 1. Extract Client IP for rate limiting
  const forwardedFor = req.headers.get('x-forwarded-for');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

  // 2. Enforce Rate Limiting
  const { allowed, remaining } = checkRateLimit(clientIp);
  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many analysis requests. Please wait a moment before trying again.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
          'X-RateLimit-Remaining': '0',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }

  // 3. Validate Content-Type
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid Content-Type. Expected application/json.',
      },
      {
        status: 415,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Malformed JSON payload in request body.',
        },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const rawQuestion = body?.question;

    if (rawQuestion === undefined || rawQuestion === null || typeof rawQuestion !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter a research question first.',
        },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const trimmed = rawQuestion.trim();
    if (!trimmed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter a research question first.',
        },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (trimmed.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Question is too long (maximum 1000 characters). Please provide a concise research idea.',
        },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const analysis = await analyzeQuestion(trimmed);

    return NextResponse.json(
      {
        success: true,
        analysis,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
          'X-RateLimit-Remaining': String(remaining),
        },
      }
    );
  } catch (error: any) {
    // Log detailed error on server only; never leak internal stack traces to client
    console.error('[API /api/analyze] Internal Handler Error:', error?.message || error);

    return NextResponse.json(
      {
        success: false,
        error: 'We could not analyze the question right now. Please try again.',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}

// Explicit handler for non-POST HTTP methods
export async function GET() {
  return methodNotAllowed();
}

export async function PUT() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}

export async function HEAD() {
  return methodNotAllowed();
}

function methodNotAllowed() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method Not Allowed. Use POST to submit analysis questions.',
    },
    {
      status: 405,
      headers: {
        Allow: 'POST',
        'Cache-Control': 'no-store',
      },
    }
  );
}
