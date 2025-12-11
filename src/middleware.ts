import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // 获取token
  const token = await getToken({ req: request });

  // 检查是否是管理员路由
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 检查是否有token以及是否是管理员
    if (!token || token.role !== 'ADMIN') {
      // 重定向到登录页面或403页面
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 继续正常请求
  return NextResponse.next();
}

// 配置中间件应用的路径
export const config = {
  matcher: ['/admin/:path*'],
};
