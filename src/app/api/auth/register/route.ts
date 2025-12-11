import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from '@/utils/prismaClient';

export async function POST(request: Request) {
  try {
    const { email, password, name, captcha } = await request.json();

    // Validate input
    if (!email || !password || !name || !captcha) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate captcha
    const cookieStore = cookies();
    const storedCaptcha = cookieStore.get('captcha')?.value;
    
    if (!storedCaptcha || storedCaptcha !== captcha.toLowerCase()) {
      return NextResponse.json(
        { message: 'Invalid captcha' },
        { status: 400 }
      );
    }

    // Clear captcha cookie after validation
    cookieStore.delete('captcha');

    // Check if registration is allowed
    const settings = await prisma.settings.findFirst();
    if (settings && !settings.allowRegistration) {
      return NextResponse.json(
        { message: 'Registration is currently closed' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Create default settings if not exists
    await prisma.settings.upsert({
      where: {
        id: 'default',
      },
      update: {},
      create: {
        id: 'default',
        allowRegistration: true,
      },
    });

    return NextResponse.json(
      { message: 'Registration successful' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
