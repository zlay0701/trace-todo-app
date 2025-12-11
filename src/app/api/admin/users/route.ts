import { NextResponse } from 'next/server';
import prisma from '@/utils/prismaClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import bcrypt from 'bcrypt';

// 获取所有用户
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查用户是否是管理员
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取所有用户，排除密码字段
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 删除用户
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查用户是否是管理员
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 检查是否是管理员账户
    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: '管理员账户不能被删除' }, { status: 403 });
    }

    // 删除用户的所有任务
    await prisma.task.deleteMany({
      where: { userId: user.id },
    });

    // 删除用户账户
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 重置用户密码
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查用户是否是管理员
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 生成新密码的哈希值
    const newPassword = '12345678';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新用户密码
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ 
      message: 'Password reset successfully',
      newPassword: newPassword // 返回新密码给管理员
    }, { status: 200 });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
