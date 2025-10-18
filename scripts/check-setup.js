// scripts/check-setup.js
// Quick diagnostic script to check if everything is configured correctly

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking GT Store Setup...\n');

// 1. Check .env file
console.log('1️⃣ Checking .env file...');
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  if (envContent.includes('DATABASE_URL')) {
    console.log('   ✅ DATABASE_URL is set');
  } else {
    console.log('   ❌ DATABASE_URL is missing!');
    console.log('   👉 Add DATABASE_URL to your .env file');
  }
  
  if (envContent.includes('PI_API_KEY')) {
    console.log('   ✅ PI_API_KEY is set');
  } else {
    console.log('   ⚠️  PI_API_KEY is missing (optional for frontend)');
  }
} else {
  console.log('   ❌ .env file not found!');
  console.log('   👉 Create .env file with DATABASE_URL');
}

console.log('');

// 2. Check node_modules
console.log('2️⃣ Checking node_modules...');
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules exists');
} else {
  console.log('   ❌ node_modules not found!');
  console.log('   👉 Run: npm install');
}

console.log('');

// 3. Check Prisma
console.log('3️⃣ Checking Prisma...');
const prismaPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
if (fs.existsSync(prismaPath)) {
  console.log('   ✅ Prisma client generated');
} else {
  console.log('   ⚠️  Prisma client not generated');
  console.log('   👉 Run: npx prisma generate');
}

console.log('');

// 4. Check database connection
console.log('4️⃣ Testing database connection...');
(async () => {
  try {
    const { prisma } = require('../lib/prisma');
    
    // Try to query users
    const userCount = await prisma.user.count();
    console.log(`   ✅ Database connected! Found ${userCount} user(s)`);
    
    const propertyCount = await prisma.property.count();
    const carCount = await prisma.car.count();
    console.log(`   ✅ Found ${propertyCount} properties and ${carCount} cars`);
    
    if (userCount === 0) {
      console.log('   ⚠️  No users in database');
      console.log('   👉 Users will be created automatically when they login with Pi');
    }
    
    if (propertyCount === 0 && carCount === 0) {
      console.log('   ⚠️  No listings in database');
      console.log('   👉 Run: node scripts/seed-from-json.js YOUR_PI_USER_UID');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.log('   ❌ Database connection failed!');
    console.log('   Error:', error.message);
    console.log('   👉 Check your DATABASE_URL in .env');
  }
  
  console.log('\n📋 Setup Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('To run the app:');
  console.log('  1. Make sure .env file exists with DATABASE_URL');
  console.log('  2. Run: npm install');
  console.log('  3. Run: npm run dev');
  console.log('  4. Open: http://localhost:3000');
  console.log('  5. Clear browser localStorage (F12 → Application → Local Storage)');
  console.log('  6. Login with Pi Network');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
})();

