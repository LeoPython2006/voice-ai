import { NextRequest, NextResponse } from 'next/server';
import { recommend } from '@/utils/recommender';

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const result = recommend(q);
  return NextResponse.json({ result });
}
