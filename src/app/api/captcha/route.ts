import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Generate a random captcha text
function generateCaptchaText(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous characters
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate SVG captcha
function generateCaptchaSVG(text: string): string {
  const width = 150;
  const height = 50;
  const fontSize = 35;
  const bgColor = '#f0f0f0';
  const textColor = '#333333';
  const lineColor = '#cccccc';
  
  // Create SVG
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="background-color: ${bgColor};">
`;
  
  // Add noise lines
  for (let i = 0; i < 2; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${lineColor}" stroke-width="2" opacity="0.5"/>
`;
  }
  
  // Add text with random positions
  const textX = (width - text.length * fontSize * 0.6) / 2;
  const textY = (height + fontSize * 0.5) / 2;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charX = textX + i * fontSize * 0.6;
    const charY = textY + (Math.random() - 0.5) * 10;
    const rotation = (Math.random() - 0.5) * 20;
    
    svg += `<text x="${charX}" y="${charY}" font-size="${fontSize}" font-weight="bold" fill="${textColor}" transform="rotate(${rotation} ${charX} ${charY})" text-anchor="middle" font-family="Arial, sans-serif">${char}</text>
`;
  }
  
  svg += '</svg>';
  return svg;
}

export async function GET() {
  try {
    // Generate captcha
    const captchaText = generateCaptchaText();
    const captchaSVG = generateCaptchaSVG(captchaText);

    // Store captcha text in cookie with 2-minute expiration
    const cookieStore = cookies();
    cookieStore.set('captcha', captchaText.toLowerCase(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 120, // 2 minutes
      path: '/'
    });

    // Return captcha SVG
    return new NextResponse(captchaSVG, {
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
