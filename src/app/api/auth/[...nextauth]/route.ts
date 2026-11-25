import NextAuth from 'next-auth';
import { authOptions } from '@/utils/authOptions';

// For Next.js 14 App Router, we need to use named exports for HTTP methods
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
