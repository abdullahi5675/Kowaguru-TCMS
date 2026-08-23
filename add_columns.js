const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Adding isDeleted column to Supabase...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN DEFAULT false;`);
    console.log('Adding deletedAt column to Supabase...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP WITH TIME ZONE;`);
    console.log('✅ SUCCESS! Columns added to Supabase database.');
  } catch (err) {
    console.error('❌ Error adding columns:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
