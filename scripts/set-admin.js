// Script to set a user as admin
// Usage: node scripts/set-admin.js <user_uid>
// Example: node scripts/set-admin.js 7a276474-7407-4f8e-9d39-94b72050d54a

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const userUid = process.argv[2];

  if (!userUid) {
    console.error('❌ Error: Please provide a user_uid');
    console.log('Usage: node scripts/set-admin.js <user_uid>');
    console.log('Example: node scripts/set-admin.js 7a276474-7407-4f8e-9d39-94b72050d54a');
    process.exit(1);
  }

  console.log(`🔍 Looking for user with user_uid: ${userUid}...`);

  // Find user by user_uid
  const user = await prisma.user.findUnique({
    where: { user_uid: userUid }
  });

  if (!user) {
    console.error(`❌ User not found with user_uid: ${userUid}`);
    console.log('\n💡 The user must login at least once before you can set them as admin.');
    console.log('Available users:');
    
    const allUsers = await prisma.user.findMany({
      select: {
        user_uid: true,
        piUsername: true,
        role: true
      }
    });
    
    if (allUsers.length === 0) {
      console.log('  (No users in database yet)');
    } else {
      allUsers.forEach(u => {
        console.log(`  - ${u.piUsername || u.user_uid} (${u.role})`);
        console.log(`    user_uid: ${u.user_uid}`);
      });
    }
    
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.piUsername || user.user_uid}`);
  console.log(`   Current role: ${user.role}`);

  if (user.role === 'admin') {
    console.log('ℹ️ User is already an admin!');
  } else {
    // Update user role to admin
    const updatedUser = await prisma.user.update({
      where: { user_uid: userUid },
      data: { role: 'admin' }
    });

    console.log(`✅ Success! User role updated from "${user.role}" to "admin"`);
    console.log(`   User: ${updatedUser.piUsername || updatedUser.user_uid}`);
    console.log(`   ID: ${updatedUser.id}`);
  }

  console.log('\n🎉 Done! The user can now access the admin panel at /admin');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

