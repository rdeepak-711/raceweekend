import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    if (!data.rates) throw new Error('No rates in response');
    return NextResponse.json({ rates: data.rates });
  } catch {
    return NextResponse.json({ rates: { USD: 1 } }, { status: 200 });
  }
}
