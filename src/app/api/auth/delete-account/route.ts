import { NextResponse } from 'next/server';
import prisma from '@/utils/prismaClient';

export async function DELETE(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 检查是否是管理员
    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: '管理员账户不能被删除' }, { status: 403 });
    }

    // 删除用户的所有任务
    await prisma.task.deleteMany({
      where: { userId: user.id },
    });

    // 删除用户账户
    await prisma.user.delete({
      where: { email },
    });

    return NextResponse.json({ message: 'Account deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}