import { NextResponse } from 'next/server';
import prisma from '@/utils/prismaClient';
import bcrypt from 'bcrypt';

export async function PUT(request: Request) {
  try {
    const { email, currentPassword, newName, newPassword } = await request.json();

    if (!email || !currentPassword) {
      return NextResponse.json({ error: 'Email and current password are required' }, { status: 400 });
    }

    // 查找用户
  const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // 准备更新数据
    const updateData: any = {};

    // 更新姓名
    if (newName !== undefined) {
      updateData.name = newName;
    }

    // 更新密码
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // 如果没有需要更新的数据
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No changes detected' }, { status: 200 });
    }

    // 更新用户信息
    await prisma.user.update({
      where: { email },
      data: updateData,
    });

    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
