import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import prisma from '@/utils/prismaClient';

const defaultConfig = {
  serverUrl: '',
  username: '',
  password: '',
  enabled: false,
  autoSync: false,
  syncInterval: 5,
};

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const config = await prisma.webDavConfig.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      config: config
        ? {
            serverUrl: config.serverUrl,
            username: config.username,
            password: config.password,
            enabled: config.enabled,
            autoSync: config.autoSync,
            syncInterval: config.syncInterval,
          }
        : defaultConfig,
    });
  } catch (error) {
    console.error('Error loading WebDAV config:', error);
    return NextResponse.json(
      { message: 'Error loading WebDAV config' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const interval = Number.parseInt(String(body.syncInterval ?? ''), 10);

    const data = {
      serverUrl: String(body.serverUrl ?? ''),
      username: String(body.username ?? ''),
      password: String(body.password ?? ''),
      enabled: Boolean(body.enabled),
      autoSync: Boolean(body.autoSync),
      syncInterval: Number.isFinite(interval)
        ? Math.min(60, Math.max(1, interval))
        : 5,
    };

    const config = await prisma.webDavConfig.upsert({
      where: { userId },
      update: data,
      create: { ...data, userId },
    });

    return NextResponse.json({
      config: {
        serverUrl: config.serverUrl,
        username: config.username,
        password: config.password,
        enabled: config.enabled,
        autoSync: config.autoSync,
        syncInterval: config.syncInterval,
      },
    });
  } catch (error) {
    console.error('Error saving WebDAV config:', error);
    return NextResponse.json(
      { message: 'Error saving WebDAV config' },
      { status: 500 }
    );
  }
}
