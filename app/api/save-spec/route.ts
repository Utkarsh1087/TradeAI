import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'strategy_spec.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Specification saved to strategy_spec.json' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to save specification' }, { status: 500 });
  }
}
