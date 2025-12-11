import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

// Create a single instance of PrismaClient for the entire application
const prismaClientSingleton = () => {
  // Create a PostgreSQL connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  // Create a Prisma adapter using the PostgreSQL connection pool
  const adapter = new PrismaPg(pool);

  // Initialize Prisma Client with the adapter
  return new PrismaClient({
    adapter
  });
};

// Type definition for the Prisma client
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// Create a global instance of PrismaClient in development environment
// This prevents creating multiple instances during hot reloads
declare global {
  var prisma: PrismaClientSingleton | undefined;
}

// Initialize the Prisma client
const prisma = globalThis.prisma || prismaClientSingleton();

// In development environment, assign the client to globalThis
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
