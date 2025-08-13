import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    url: req.url
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  
  return NextResponse.json({ 
    message: 'Webhook endpoint received POST request',
    bodyLength: body.length,
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(req.headers.entries())
  });
} 