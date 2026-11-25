// Simple test script to check if Prisma Client is working correctly
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function testPrisma() {
  let pool;
  try {
    console.log('Initializing Prisma Client...');

    // Prisma 7 requires a driver adapter instead of the old datasourceUrl option.
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    console.log('Prisma Client initialized successfully!');

    console.log('Testing database connection...');
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users in the database`);

    await prisma.$disconnect();
    await pool.end();
    console.log('Prisma Client disconnected successfully!');

    return true;
  } catch (error) {
    console.error('Error during Prisma Client test:', error);
    if (pool) await pool.end();
    return false;
  }
}

testPrisma();
