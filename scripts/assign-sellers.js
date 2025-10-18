// Script to assign existing listings to admin user
// Usage: node scripts/assign-sellers.js [user_uid]
// If no user_uid provided, uses the first admin user found

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting seller assignment for existing listings...\n');

  const targetUserUid = process.argv[2]; // Get user_uid from command line
  let adminUser;

  if (targetUserUid) {
    // Find specific user by user_uid
    console.log(`🔍 Looking for user with user_uid: ${targetUserUid}...`);
    adminUser = await prisma.user.findUnique({
      where: { user_uid: targetUserUid }
    });

    if (!adminUser) {
      console.error(`❌ Error: User not found with user_uid: ${targetUserUid}`);
      console.log('\n💡 Available users:');
      const allUsers = await prisma.user.findMany({
        select: { user_uid: true, piUsername: true, role: true }
      });
      allUsers.forEach(u => {
        console.log(`   - ${u.piUsername || u.user_uid} (${u.role}) - UID: ${u.user_uid}`);
      });
      process.exit(1);
    }

    console.log(`✅ Found user: ${adminUser.piUsername || adminUser.user_uid}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Database ID: ${adminUser.id}\n`);

    // Warn if user is not admin
    if (adminUser.role !== 'admin') {
      console.log(`⚠️  Warning: User is not an admin (role: ${adminUser.role})`);
      console.log('   Listings will still be assigned to this user.\n');
    }
  } else {
    // Find first admin user
    console.log('🔍 No user_uid provided, looking for first admin user...');
    adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      console.error('❌ No admin user found in database.');
      console.log('\n💡 Please run one of these first:');
      console.log('   1. Set yourself as admin: node scripts/set-admin.js <your_user_uid>');
      console.log('   2. Specify a user: node scripts/assign-sellers.js <user_uid>');
      process.exit(1);
    }

    console.log(`✅ Found admin user: ${adminUser.piUsername || adminUser.user_uid}`);
    console.log(`   Database ID: ${adminUser.id}\n`);
  }

  // Count existing listings
  const carsWithoutSeller = await prisma.car.count({
    where: { sellerId: null }
  });

  const propertiesWithoutSeller = await prisma.property.count({
    where: { sellerId: null }
  });

  const totalToAssign = carsWithoutSeller + propertiesWithoutSeller;

  if (totalToAssign === 0) {
    console.log('✅ All listings already have sellers assigned!');
    console.log('   No action needed.\n');
    return;
  }

  console.log(`📊 Found ${totalToAssign} listing(s) without sellers:`);
  console.log(`   - ${carsWithoutSeller} car(s)`);
  console.log(`   - ${propertiesWithoutSeller} propertie(s)\n`);

  console.log(`🔄 Assigning all listings to: ${adminUser.piUsername || adminUser.user_uid}`);
  console.log(`   (Database ID: ${adminUser.id})\n`);

  // Update all cars without a seller
  const carsUpdated = await prisma.car.updateMany({
    where: {
      sellerId: null
    },
    data: {
      sellerId: adminUser.id
    }
  });

  console.log(`✅ Updated ${carsUpdated.count} car(s)`);

  // Update all properties without a seller
  const propertiesUpdated = await prisma.property.updateMany({
    where: {
      sellerId: null
    },
    data: {
      sellerId: adminUser.id
    }
  });

  console.log(`✅ Updated ${propertiesUpdated.count} propertie(s)`);

  console.log('\n🎉 Seller assignment complete!');
  console.log(`   All ${carsUpdated.count + propertiesUpdated.count} listing(s) now belong to ${adminUser.piUsername || adminUser.user_uid}`);
  console.log('\n💡 Next steps:');
  console.log('   1. Refresh your browser');
  console.log('   2. Go to /seller-dashboard to see your listings');
  console.log('   3. You can now manage or delete these mock listings');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

