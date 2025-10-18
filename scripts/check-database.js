// Script to check database status
// Usage: node scripts/check-database.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking database status...\n');

  try {
    // Check users
    console.log('👥 Users:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        user_uid: true,
        piUsername: true,
        role: true,
        _count: {
          select: {
            cars: true,
            properties: true
          }
        }
      }
    });
    
    if (users.length === 0) {
      console.log('   ❌ No users found');
    } else {
      users.forEach(u => {
        console.log(`   ✅ ${u.piUsername || u.user_uid} (${u.role})`);
        console.log(`      Cars: ${u._count.cars}, Properties: ${u._count.properties}`);
      });
    }

    // Check cars
    console.log('\n🚗 Cars:');
    const carCount = await prisma.car.count();
    console.log(`   Total: ${carCount}`);
    
    if (carCount > 0) {
      const carsWithSeller = await prisma.car.count({
        where: { sellerId: { not: null } }
      });
      const carsWithoutSeller = carCount - carsWithSeller;
      console.log(`   ✅ With seller: ${carsWithSeller}`);
      if (carsWithoutSeller > 0) {
        console.log(`   ⚠️  Without seller: ${carsWithoutSeller}`);
      }
    }

    // Check properties
    console.log('\n🏠 Properties:');
    const propertyCount = await prisma.property.count();
    console.log(`   Total: ${propertyCount}`);
    
    if (propertyCount > 0) {
      const propsWithSeller = await prisma.property.count({
        where: { sellerId: { not: null } }
      });
      const propsWithoutSeller = propertyCount - propsWithSeller;
      console.log(`   ✅ With seller: ${propsWithSeller}`);
      if (propsWithoutSeller > 0) {
        console.log(`   ⚠️  Without seller: ${propsWithoutSeller}`);
      }
    }

    // Check schema
    console.log('\n📋 Schema Check:');
    try {
      await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'sellerId'`;
      console.log('   ✅ cars.sellerId column exists');
    } catch (e) {
      console.log('   ❌ cars.sellerId column does NOT exist');
      console.log('      Run: npx prisma db push');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database check complete!\n');

  } catch (error) {
    if (error.code === 'P5010') {
      console.error('\n❌ Database connection failed!');
      console.error('   Error: Cannot fetch data from Prisma Accelerate');
      console.error('\n💡 This is a connectivity issue. Try:');
      console.error('   1. Check your internet connection');
      console.error('   2. Wait a few minutes and try again');
      console.error('   3. Check if Prisma Accelerate is having issues');
    } else {
      console.error('\n❌ Error:', error.message);
      console.error(error);
    }
    process.exit(1);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });

