const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

// Use direct database connection for seeding
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_DATABASE_URL
    }
  }
})

async function main() {
  console.log('Starting database seed with direct connection...')

  // Read the JSON data files
  const propertiesPath = path.join(process.cwd(), 'data', 'properties.json')
  const carsPath = path.join(process.cwd(), 'data', 'cars.json')

  const propertiesData = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'))
  const carsData = JSON.parse(fs.readFileSync(carsPath, 'utf8'))

  // Clear existing data
  await prisma.property.deleteMany()
  await prisma.car.deleteMany()

  // Seed properties
  console.log('Seeding properties...')
  for (const property of propertiesData) {
    const { _meta, ...propertyData } = property
    
    await prisma.property.create({
      data: {
        id: propertyData.id,
        type: propertyData.type,
        title: propertyData.title,
        pricePi: propertyData.pricePi,
        location: propertyData.location,
        beds: propertyData.beds,
        baths: propertyData.baths,
        area: propertyData.area,
        images: propertyData.images,
        isNew: propertyData.isNew,
        status: _meta?.status || 'For sale',
        yearBuilt: _meta?.yearBuilt,
        floor: _meta?.floor,
        totalFloors: _meta?.totalFloors,
        heating: _meta?.heating,
        energyRating: _meta?.energyRating,
        parking: _meta?.parking,
        furnished: _meta?.furnished,
        petsAllowed: _meta?.petsAllowed,
        balcony: _meta?.balcony,
        garden: _meta?.garden,
        storage: _meta?.storage,
        lotSizeSqm: _meta?.lotSizeSqm,
        hoaFeesPi: _meta?.hoaFeesPi,
        taxesPi: _meta?.taxesPi,
        eircode: _meta?.eircode,
        propertyId: _meta?.propertyId,
        features: _meta?.features || [],
        safetyFeatures: _meta?.safetyFeatures || [],
        contactMethod: _meta?.contactMethod,
        contactHandle: _meta?.contactHandle,
        notes: _meta?.notes,
      }
    })
  }

  // Seed cars
  console.log('Seeding cars...')
  for (const car of carsData) {
    const { _meta, ...carData } = car
    
    await prisma.car.create({
      data: {
        id: carData.id,
        type: carData.type,
        title: carData.title,
        pricePi: carData.pricePi,
        location: carData.location,
        mileage: carData.mileage,
        year: carData.year,
        images: carData.images,
        isNew: carData.isNew,
        sellerName: _meta?.sellerName,
        contactMethod: _meta?.contactMethod,
        contactHandle: _meta?.contactHandle,
        availability: _meta?.availability,
        negotiable: _meta?.negotiable,
        tradeIn: _meta?.tradeIn,
        delivery: _meta?.delivery,
        make: _meta?.make,
        model: _meta?.model,
        trim: _meta?.trim,
        body: _meta?.body,
        fuel: _meta?.fuel,
        transmission: _meta?.transmission,
        drivetrain: _meta?.drivetrain,
        engine: _meta?.engine,
        powerKW: _meta?.powerKW,
        powerBHP: _meta?.powerBHP,
        consumptionL100: _meta?.consumptionL100,
        consumptionKWh100: _meta?.consumptionKWh100,
        emissions: _meta?.emissions,
        owners: _meta?.owners,
        nctExpiry: _meta?.nctExpiry,
        taxExpiry: _meta?.taxExpiry,
        serviceHistory: _meta?.serviceHistory,
        lastServiceAtKm: _meta?.lastServiceAtKm,
        lastServiceDate: _meta?.lastServiceDate,
        accidentHistory: _meta?.accidentHistory,
        currentFaults: _meta?.currentFaults,
        tyres: _meta?.tyres,
        brakes: _meta?.brakes,
        keys: _meta?.keys,
        conditionNotes: _meta?.conditionNotes,
        modifications: _meta?.modifications,
        financeCleared: _meta?.financeCleared,
        doors: _meta?.doors,
        seats: _meta?.seats,
        color: _meta?.color,
        bootL: _meta?.bootL,
        wheelbaseMm: _meta?.wheelbaseMm,
        weightKg: _meta?.weightKg,
        vin: _meta?.vin,
        reg: _meta?.reg,
        features: _meta?.features || [],
        safetyFeatures: _meta?.safetyFeatures || [],
        videoUrl: _meta?.videoUrl,
        docs: _meta?.docs || [],
      }
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
