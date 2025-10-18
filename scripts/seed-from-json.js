// Script to seed database from JSON files
// Usage: node scripts/seed-from-json.js <admin_user_uid>
// This will upload all cars and properties from JSON files to database

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const targetUserUid = process.argv[2];

  if (!targetUserUid) {
    console.error('❌ Error: Please provide your user_uid');
    console.log('\nUsage: node scripts/seed-from-json.js <your_user_uid>');
    console.log('Example: node scripts/seed-from-json.js 7a276474-7407-4f8e-9d39-94b72050d54a');
    console.log('\n💡 Tip: Run "node scripts/list-users.js" to find your user_uid');
    process.exit(1);
  }

  console.log('🌱 Starting database seeding from JSON files...\n');

  // Find the admin user
  console.log(`🔍 Looking for user: ${targetUserUid}...`);
  const adminUser = await prisma.user.findUnique({
    where: { user_uid: targetUserUid }
  });

  if (!adminUser) {
    console.error(`❌ User not found with user_uid: ${targetUserUid}`);
    console.log('\n💡 The user must login at least once before seeding.');
    console.log('Run this to see available users:');
    console.log('   node scripts/list-users.js');
    process.exit(1);
  }

  console.log(`✅ Found user: ${adminUser.piUsername || adminUser.user_uid}`);
  console.log(`   Role: ${adminUser.role}`);
  console.log(`   Database ID: ${adminUser.id}\n`);

  // Load JSON files
  const carsPath = path.join(__dirname, '../data/cars.json');
  const propertiesPath = path.join(__dirname, '../data/properties.json');

  const carsJson = JSON.parse(fs.readFileSync(carsPath, 'utf8'));
  const propertiesJson = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));

  console.log(`📦 Loaded from JSON files:`);
  console.log(`   - ${carsJson.length} cars`);
  console.log(`   - ${propertiesJson.length} properties\n`);

  // Clear existing data (optional - comment out if you want to keep existing)
  console.log('🗑️  Clearing existing listings...');
  await prisma.car.deleteMany({});
  await prisma.property.deleteMany({});
  console.log('✅ Existing listings cleared\n');

  // Seed cars
  console.log('🚗 Uploading cars to database...');
  let carsCreated = 0;
  
  for (const car of carsJson) {
    try {
      await prisma.car.create({
        data: {
          id: car.id,
          sellerId: adminUser.id,
          type: car.type,
          title: car.title,
          pricePi: car.pricePi,
          location: car.location,
          mileage: car.mileage,
          year: car.year,
          images: car.images || [],
          isNew: car.isNew || false,
          
          // Copy all _meta fields to main fields
          sellerName: car._meta?.sellerName,
          contactMethod: car._meta?.contactMethod,
          contactHandle: car._meta?.contactHandle,
          availability: car._meta?.availability,
          negotiable: car._meta?.negotiable,
          tradeIn: car._meta?.tradeIn,
          delivery: car._meta?.delivery,
          
          make: car._meta?.make,
          model: car._meta?.model,
          trim: car._meta?.trim,
          body: car._meta?.body,
          fuel: car._meta?.fuel,
          transmission: car._meta?.transmission,
          drivetrain: car._meta?.drivetrain,
          engine: car._meta?.engine,
          powerKW: car._meta?.powerKW,
          powerBHP: car._meta?.powerBHP,
          consumptionL100: car._meta?.consumptionL100,
          consumptionKWh100: car._meta?.consumptionKWh100,
          emissions: car._meta?.emissions,
          
          owners: car._meta?.owners,
          nctExpiry: car._meta?.nctExpiry,
          taxExpiry: car._meta?.taxExpiry,
          serviceHistory: car._meta?.serviceHistory,
          lastServiceAtKm: car._meta?.lastServiceAtKm,
          lastServiceDate: car._meta?.lastServiceDate,
          accidentHistory: car._meta?.accidentHistory,
          currentFaults: car._meta?.currentFaults,
          tyres: car._meta?.tyres,
          brakes: car._meta?.brakes,
          keys: car._meta?.keys,
          conditionNotes: car._meta?.conditionNotes,
          modifications: car._meta?.modifications,
          financeCleared: car._meta?.financeCleared,
          
          doors: car._meta?.doors,
          seats: car._meta?.seats,
          color: car._meta?.color,
          bootL: car._meta?.bootL,
          wheelbaseMm: car._meta?.wheelbaseMm,
          weightKg: car._meta?.weightKg,
          
          vin: car._meta?.vin,
          reg: car._meta?.reg,
          
          features: car._meta?.features || [],
          safetyFeatures: car._meta?.safetyFeatures || [],
          
          videoUrl: car._meta?.videoUrl,
          docs: car._meta?.docs || []
        }
      });
      carsCreated++;
      console.log(`   ✓ ${car.title}`);
    } catch (error) {
      console.error(`   ✗ Failed to create ${car.title}:`, error.message);
    }
  }

  console.log(`\n✅ Created ${carsCreated} cars\n`);

  // Seed properties
  console.log('🏠 Uploading properties to database...');
  let propertiesCreated = 0;
  
  for (const property of propertiesJson) {
    try {
      await prisma.property.create({
        data: {
          id: property.id,
          sellerId: adminUser.id,
          type: property.type,
          title: property.title,
          pricePi: property.pricePi,
          location: property.location,
          beds: property.beds,
          baths: property.baths,
          area: property.area,
          images: property.images || [],
          isNew: property.isNew || false,
          
          // Copy all _meta fields
          status: property._meta?.status,
          yearBuilt: property._meta?.yearBuilt,
          floor: property._meta?.floor,
          totalFloors: property._meta?.totalFloors,
          heating: property._meta?.heating,
          energyRating: property._meta?.energyRating,
          parking: property._meta?.parking,
          furnished: property._meta?.furnished,
          petsAllowed: property._meta?.petsAllowed,
          balcony: property._meta?.balcony,
          garden: property._meta?.garden,
          storage: property._meta?.storage,
          lotSizeSqm: property._meta?.lotSizeSqm,
          hoaFeesPi: property._meta?.hoaFeesPi,
          taxesPi: property._meta?.taxesPi,
          eircode: property._meta?.eircode,
          propertyId: property._meta?.propertyId,
          
          features: property._meta?.features || [],
          safetyFeatures: property._meta?.safetyFeatures || [],
          
          contactMethod: property._meta?.contactMethod,
          contactHandle: property._meta?.contactHandle,
          notes: property._meta?.notes
        }
      });
      propertiesCreated++;
      console.log(`   ✓ ${property.title}`);
    } catch (error) {
      console.error(`   ✗ Failed to create ${property.title}:`, error.message);
    }
  }

  console.log(`\n✅ Created ${propertiesCreated} properties\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Database seeding complete!');
  console.log(`\n📊 Summary:`);
  console.log(`   - ${carsCreated} cars uploaded`);
  console.log(`   - ${propertiesCreated} properties uploaded`);
  console.log(`   - All assigned to: ${adminUser.piUsername || adminUser.user_uid}`);
  console.log(`\n💡 Next steps:`);
  console.log('   1. Refresh your browser');
  console.log('   2. Go to /seller-dashboard to see your listings');
  console.log('   3. Pages will now fetch from database instead of JSON files');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

