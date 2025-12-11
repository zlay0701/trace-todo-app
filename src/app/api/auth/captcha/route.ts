import { NextResponse } from 'next/server';
import svgCaptcha from 'svg-captcha';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Generate captcha
    const captcha = svgCaptcha.create({
      size: 6, // Number of characters
      ignoreChars: '0o1il', // Avoid ambiguous characters
      noise: 2, // Noise level
      width: 150,
      height: 50,
      fontSize: 35,
      background: '#f0f0f0'
    });

    // Store captcha text in cookie with 2-minute expiration
    const cookieStore = cookies();
    cookieStore.set('captcha', captcha.text.toLowerCase(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 120, // 2 minutes
      path: '/'
    });

    // Return captcha SVG
    return new NextResponse(captcha.data, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Captcha generation error:', error);
    return NextResponse.json(
      { message: 'Failed to generate captcha' },
      { status: 500 }
    );
  }
}
