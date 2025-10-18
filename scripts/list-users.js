// Script to list all users in the database
// Usage: node scripts/list-users.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('📋 Fetching all users from database...\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      user_uid: true,
      piUsername: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          cars: true,
          properties: true,
          sellerApplication: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (users.length === 0) {
    console.log('❌ No users found in database.');
    console.log('💡 Users are created when they first login with Pi Network.');
    return;
  }

  console.log(`✅ Found ${users.length} user(s):\n`);

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.piUsername || 'No username'}`);
    console.log(`   User UID: ${user.user_uid}`);
    console.log(`   Database ID: ${user.id}`);
    console.log(`   Role: ${getRoleEmoji(user.role)} ${user.role}`);
    console.log(`   Joined: ${user.createdAt.toLocaleDateString()}`);
    
    const stats = [];
    if (user._count.cars > 0) stats.push(`${user._count.cars} car(s)`);
    if (user._count.properties > 0) stats.push(`${user._count.properties} property(ies)`);
    if (user._count.sellerApplication) stats.push('has seller application');
    
    if (stats.length > 0) {
      console.log(`   Stats: ${stats.join(', ')}`);
    }
    console.log('');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 To set a user as admin, run:');
  console.log('   node scripts/set-admin.js <user_uid>');
  console.log('\nExample:');
  console.log(`   node scripts/set-admin.js ${users[0].user_uid}`);
}

function getRoleEmoji(role) {
  switch (role) {
    case 'admin': return '👑';
    case 'seller': return '🏪';
    case 'reader': return '👤';
    default: return '❓';
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

