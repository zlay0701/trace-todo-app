// Simple test script to check if Prisma Client is working correctly
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

async function testPrisma() {
  try {
    console.log('Initializing Prisma Client...');
    
    // In Prisma Client v7, we need to provide a database URL in the constructor
    // The datasources configuration in schema.prisma is only for Prisma CLI
    const prisma = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL
    });
    
    console.log('Prisma Client initialized successfully!');
    
    // Test a simple query
    console.log('Testing database connection...');
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users in the database`);
    
    // Close the connection
    await prisma.$disconnect();
    console.log('Prisma Client disconnected successfully!');
    
    return true;
  } catch (error) {
    console.error('Error during Prisma Client test:', error);
    return false;
  }
}

testPrisma();