import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the cookie by setting maxAge: 0
  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
