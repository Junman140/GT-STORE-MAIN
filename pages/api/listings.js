import { prisma } from '@/lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const type = req.query.type
      
      if (type === 'property') {
        const properties = await prisma.property.findMany({
          include: {
            seller: {
              select: {
                id: true,
                user_uid: true,
                piUsername: true
              }
            }
          },
          orderBy: [
            { isNew: 'desc' },
            { pricePi: 'desc' }
          ]
        })
        
        // Properties - arrays are already native in PostgreSQL
        const parsedProperties = properties.map(property => ({
          ...property,
          _meta: {
            status: property.status,
            yearBuilt: property.yearBuilt,
            floor: property.floor,
            totalFloors: property.totalFloors,
            heating: property.heating,
            energyRating: property.energyRating,
            parking: property.parking,
            furnished: property.furnished,
            petsAllowed: property.petsAllowed,
            balcony: property.balcony,
            garden: property.garden,
            storage: property.storage,
            lotSizeSqm: property.lotSizeSqm,
            hoaFeesPi: property.hoaFeesPi,
            taxesPi: property.taxesPi,
            eircode: property.eircode,
            propertyId: property.propertyId,
            features: Array.isArray(property.features) ? property.features : [],
            safetyFeatures: Array.isArray(property.safetyFeatures) ? property.safetyFeatures : [],
            contactMethod: property.contactMethod,
            contactHandle: property.contactHandle,
            notes: property.notes,
          }
        }))
        
        return res.status(200).json(parsedProperties)
      }
      
      if (type === 'car') {
        const cars = await prisma.car.findMany({
          include: {
            seller: {
              select: {
                id: true,
                user_uid: true,
                piUsername: true
              }
            }
          },
          orderBy: [
            { isNew: 'desc' },
            { year: 'desc' }
          ]
        })
        
        // Cars - arrays are already native in PostgreSQL
        const parsedCars = cars.map(car => ({
          ...car,
          _meta: {
            // Use seller relation instead of sellerName
            sellerName: car.seller?.piUsername || car.seller?.user_uid || 'Seller',
            contactMethod: car.contactMethod,
            contactHandle: car.contactHandle,
            availability: car.availability,
            negotiable: car.negotiable,
            tradeIn: car.tradeIn,
            delivery: car.delivery,
            make: car.make,
            model: car.model,
            trim: car.trim,
            body: car.body,
            fuel: car.fuel,
            transmission: car.transmission,
            drivetrain: car.drivetrain,
            engine: car.engine,
            powerKW: car.powerKW,
            powerBHP: car.powerBHP,
            consumptionL100: car.consumptionL100,
            consumptionKWh100: car.consumptionKWh100,
            emissions: car.emissions,
            owners: car.owners,
            nctExpiry: car.nctExpiry,
            taxExpiry: car.taxExpiry,
            serviceHistory: car.serviceHistory,
            lastServiceAtKm: car.lastServiceAtKm,
            lastServiceDate: car.lastServiceDate,
            accidentHistory: car.accidentHistory,
            currentFaults: car.currentFaults,
            tyres: car.tyres,
            brakes: car.brakes,
            keys: car.keys,
            conditionNotes: car.conditionNotes,
            modifications: car.modifications,
            financeCleared: car.financeCleared,
            doors: car.doors,
            seats: car.seats,
            color: car.color,
            bootL: car.bootL,
            wheelbaseMm: car.wheelbaseMm,
            weightKg: car.weightKg,
            vin: car.vin,
            reg: car.reg,
            features: Array.isArray(car.features) ? car.features : [],
            safetyFeatures: Array.isArray(car.safetyFeatures) ? car.safetyFeatures : [],
            videoUrl: car.videoUrl,
            docs: Array.isArray(car.docs) ? car.docs : [],
          }
        }))
        
        return res.status(200).json(parsedCars)
      }
      
      // Return both types
      const [properties, cars] = await Promise.all([
        prisma.property.findMany({
          include: {
            seller: {
              select: {
                id: true,
                user_uid: true,
                piUsername: true
              }
            }
          },
          orderBy: [
            { isNew: 'desc' },
            { pricePi: 'desc' }
          ]
        }),
        prisma.car.findMany({
          include: {
            seller: {
              select: {
                id: true,
                user_uid: true,
                piUsername: true
              }
            }
          },
          orderBy: [
            { isNew: 'desc' },
            { year: 'desc' }
          ]
        })
      ])
      
      // Arrays are already native in PostgreSQL - no JSON parsing needed
      const parsedProperties = properties.map(property => ({
        ...property,
        images: Array.isArray(property.images) ? property.images : [],
        features: Array.isArray(property.features) ? property.features : [],
        safetyFeatures: Array.isArray(property.safetyFeatures) ? property.safetyFeatures : [],
        _meta: {
          status: property.status,
          yearBuilt: property.yearBuilt,
          floor: property.floor,
          totalFloors: property.totalFloors,
          heating: property.heating,
          energyRating: property.energyRating,
          parking: property.parking,
          furnished: property.furnished,
          petsAllowed: property.petsAllowed,
          balcony: property.balcony,
          garden: property.garden,
          storage: property.storage,
          lotSizeSqm: property.lotSizeSqm,
          hoaFeesPi: property.hoaFeesPi,
          taxesPi: property.taxesPi,
          eircode: property.eircode,
          propertyId: property.propertyId,
          features: Array.isArray(property.features) ? property.features : [],
          safetyFeatures: Array.isArray(property.safetyFeatures) ? property.safetyFeatures : [],
          contactMethod: property.contactMethod,
          contactHandle: property.contactHandle,
          notes: property.notes,
        }
      }))
      
      const parsedCars = cars.map(car => ({
        ...car,
        images: Array.isArray(car.images) ? car.images : [],
        features: Array.isArray(car.features) ? car.features : [],
        safetyFeatures: Array.isArray(car.safetyFeatures) ? car.safetyFeatures : [],
        docs: Array.isArray(car.docs) ? car.docs : [],
        _meta: {
          // Use seller relation instead of sellerName
          sellerName: car.seller?.piUsername || car.seller?.user_uid || 'Seller',
          contactMethod: car.contactMethod,
          contactHandle: car.contactHandle,
          availability: car.availability,
          negotiable: car.negotiable,
          tradeIn: car.tradeIn,
          delivery: car.delivery,
          make: car.make,
          model: car.model,
          trim: car.trim,
          body: car.body,
          fuel: car.fuel,
          transmission: car.transmission,
          drivetrain: car.drivetrain,
          engine: car.engine,
          powerKW: car.powerKW,
          powerBHP: car.powerBHP,
          consumptionL100: car.consumptionL100,
          consumptionKWh100: car.consumptionKWh100,
          emissions: car.emissions,
          owners: car.owners,
          nctExpiry: car.nctExpiry,
          taxExpiry: car.taxExpiry,
          serviceHistory: car.serviceHistory,
          lastServiceAtKm: car.lastServiceAtKm,
          lastServiceDate: car.lastServiceDate,
          accidentHistory: car.accidentHistory,
          currentFaults: car.currentFaults,
          tyres: car.tyres,
          brakes: car.brakes,
          keys: car.keys,
          conditionNotes: car.conditionNotes,
          modifications: car.modifications,
          financeCleared: car.financeCleared,
          doors: car.doors,
          seats: car.seats,
          color: car.color,
          bootL: car.bootL,
          wheelbaseMm: car.wheelbaseMm,
          weightKg: car.weightKg,
          vin: car.vin,
          reg: car.reg,
          features: Array.isArray(car.features) ? car.features : [],
          safetyFeatures: Array.isArray(car.safetyFeatures) ? car.safetyFeatures : [],
          videoUrl: car.videoUrl,
          docs: Array.isArray(car.docs) ? car.docs : [],
        }
      }))
      
      // Fetch phones
      const phones = await prisma.phone.findMany({
        include: {
          seller: {
            select: {
              id: true,
              user_uid: true,
              piUsername: true
            }
          }
        },
        orderBy: [
          { isNew: 'desc' },
          { pricePi: 'desc' }
        ]
      })
      
      const parsedPhones = phones.map(phone => ({
        ...phone,
        _meta: {
          sellerName: phone.seller?.piUsername || phone.seller?.user_uid || 'Seller',
          contactMethod: phone.contactMethod,
          contactHandle: phone.contactHandle,
          availability: phone.availability,
          negotiable: phone.negotiable,
          tradeIn: phone.tradeIn,
          delivery: phone.delivery,
          brand: phone.brand,
          model: phone.model,
          storage: phone.storage,
          color: phone.color,
          screenSize: phone.screenSize,
          operatingSystem: phone.operatingSystem,
          processor: phone.processor,
          ram: phone.ram,
          batteryCapacity: phone.batteryCapacity,
          cameraSpecs: phone.cameraSpecs,
          connectivity: Array.isArray(phone.connectivity) ? phone.connectivity : [],
          scratches: phone.scratches,
          screenCondition: phone.screenCondition,
          batteryHealth: phone.batteryHealth,
          chargingPort: phone.chargingPort,
          speakers: phone.speakers,
          buttons: phone.buttons,
          waterDamage: phone.waterDamage,
          repairHistory: phone.repairHistory,
          accessories: Array.isArray(phone.accessories) ? phone.accessories : [],
          features: Array.isArray(phone.features) ? phone.features : [],
          safetyFeatures: Array.isArray(phone.safetyFeatures) ? phone.safetyFeatures : [],
          videoUrl: phone.videoUrl,
          docs: Array.isArray(phone.docs) ? phone.docs : [],
        }
      }))
      
      // Fetch laptops
      const laptops = await prisma.laptop.findMany({
        include: {
          seller: {
            select: {
              id: true,
              user_uid: true,
              piUsername: true
            }
          }
        },
        orderBy: [
          { isNew: 'desc' },
          { pricePi: 'desc' }
        ]
      })
      
      const parsedLaptops = laptops.map(laptop => ({
        ...laptop,
        _meta: {
          sellerName: laptop.seller?.piUsername || laptop.seller?.user_uid || 'Seller',
          contactMethod: laptop.contactMethod,
          contactHandle: laptop.contactHandle,
          availability: laptop.availability,
          negotiable: laptop.negotiable,
          tradeIn: laptop.tradeIn,
          delivery: laptop.delivery,
          brand: laptop.brand,
          model: laptop.model,
          processor: laptop.processor,
          ram: laptop.ram,
          storage: laptop.storage,
          graphics: laptop.graphics,
          screenSize: laptop.screenSize,
          resolution: laptop.resolution,
          operatingSystem: laptop.operatingSystem,
          color: laptop.color,
          weight: laptop.weight,
          batteryLife: laptop.batteryLife,
          scratches: laptop.scratches,
          screenCondition: laptop.screenCondition,
          keyboardCondition: laptop.keyboardCondition,
          trackpadCondition: laptop.trackpadCondition,
          ports: laptop.ports,
          charger: laptop.charger,
          repairHistory: laptop.repairHistory,
          accessories: Array.isArray(laptop.accessories) ? laptop.accessories : [],
          features: Array.isArray(laptop.features) ? laptop.features : [],
          safetyFeatures: Array.isArray(laptop.safetyFeatures) ? laptop.safetyFeatures : [],
          videoUrl: laptop.videoUrl,
          docs: Array.isArray(laptop.docs) ? laptop.docs : [],
        }
      }))
      
      return res.status(200).json({ properties: parsedProperties, cars: parsedCars, phones: parsedPhones, laptops: parsedLaptops })
    } catch (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { type, data, userId } = req.body
      
      // Validate user is a seller
      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }
      
      // Find user by ID or user_uid
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: userId },
            { user_uid: userId }
          ]
        }
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Allow both sellers and admins to create listings
      if (user.role !== 'seller' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Only sellers and admins can create listings' });
      }
      
      if (type === 'property') {
        const property = await prisma.property.create({
          data: {
            sellerId: user.id,
            type: data.type,
            title: data.title,
            pricePi: data.pricePi,
            location: data.location,
            beds: data.beds,
            baths: data.baths,
            area: data.area,
            images: data.images || [],
            isNew: data.isNew || false,
            status: data.status || 'For sale',
            yearBuilt: data.yearBuilt,
            floor: data.floor,
            totalFloors: data.totalFloors,
            heating: data.heating,
            energyRating: data.energyRating,
            parking: data.parking,
            furnished: data.furnished,
            petsAllowed: data.petsAllowed,
            balcony: data.balcony,
            garden: data.garden,
            storage: data.storage,
            lotSizeSqm: data.lotSizeSqm,
            hoaFeesPi: data.hoaFeesPi,
            taxesPi: data.taxesPi,
            eircode: data.eircode,
            propertyId: data.propertyId,
            features: data.features || [],
            safetyFeatures: data.safetyFeatures || [],
            contactMethod: data.contactMethod,
            contactHandle: data.contactHandle,
            notes: data.notes,
          }
        })
        return res.status(201).json(property)
      }
      
      if (type === 'car') {
        const car = await prisma.car.create({
          data: {
            sellerId: user.id,
            type: data.type,
            title: data.title,
            pricePi: data.pricePi,
            location: data.location,
            mileage: data.mileage,
            year: data.year,
            images: data.images || [],
            isNew: data.isNew || false,
            sellerName: data.sellerName,
            contactMethod: data.contactMethod,
            contactHandle: data.contactHandle,
            availability: data.availability,
            negotiable: data.negotiable,
            tradeIn: data.tradeIn,
            delivery: data.delivery,
            make: data.make,
            model: data.model,
            trim: data.trim,
            body: data.body,
            fuel: data.fuel,
            transmission: data.transmission,
            drivetrain: data.drivetrain,
            engine: data.engine,
            powerKW: data.powerKW,
            powerBHP: data.powerBHP,
            consumptionL100: data.consumptionL100,
            consumptionKWh100: data.consumptionKWh100,
            emissions: data.emissions,
            owners: data.owners,
            nctExpiry: data.nctExpiry,
            taxExpiry: data.taxExpiry,
            serviceHistory: data.serviceHistory,
            lastServiceAtKm: data.lastServiceAtKm,
            lastServiceDate: data.lastServiceDate,
            accidentHistory: data.accidentHistory,
            currentFaults: data.currentFaults,
            tyres: data.tyres,
            brakes: data.brakes,
            keys: data.keys,
            conditionNotes: data.conditionNotes,
            modifications: data.modifications,
            financeCleared: data.financeCleared,
            doors: data.doors,
            seats: data.seats,
            color: data.color,
            bootL: data.bootL,
            wheelbaseMm: data.wheelbaseMm,
            weightKg: data.weightKg,
            vin: data.vin,
            reg: data.reg,
            features: data.features || [],
            safetyFeatures: data.safetyFeatures || [],
            videoUrl: data.videoUrl,
            docs: data.docs || [],
          }
        })
        return res.status(201).json(car)
      }
      
      if (type === 'Phone' || type === 'phone') {
        const phone = await prisma.phone.create({
          data: {
            seller: {
              connect: { id: user.id }
            },
            type: data.type,
            title: data.title,
            pricePi: data.pricePi,
            logisticsFee: data.logisticsFee || 5.0,
            location: data.location,
            condition: data.condition || 'Good',
            year: data.year,
            images: data.images || [],
            isNew: data.isNew || false,
            sellerName: data.sellerName,
            contactMethod: data.contactMethod,
            contactHandle: data.contactHandle,
            availability: data.availability,
            negotiable: data.negotiable,
            tradeIn: data.tradeIn,
            delivery: data.delivery,
            brand: data.brand,
            model: data.model,
            storage: data.storage,
            color: data.color,
            screenSize: data.screenSize,
            operatingSystem: data.operatingSystem,
            processor: data.processor,
            ram: data.ram,
            batteryCapacity: data.batteryCapacity,
            cameraSpecs: data.cameraSpecs,
            connectivity: data.connectivity || [],
            scratches: data.scratches,
            screenCondition: data.screenCondition,
            batteryHealth: data.batteryHealth,
            chargingPort: data.chargingPort,
            speakers: data.speakers,
            buttons: data.buttons,
            waterDamage: data.waterDamage,
            repairHistory: data.repairHistory,
            accessories: data.accessories || [],
            features: data.features || [],
            safetyFeatures: data.safetyFeatures || [],
            videoUrl: data.videoUrl,
            docs: data.docs || [],
          }
        })
        return res.status(201).json(phone)
      }
      
      if (type === 'Laptop' || type === 'laptop') {
        const laptop = await prisma.laptop.create({
          data: {
            seller: {
              connect: { id: user.id }
            },
            type: data.type,
            title: data.title,
            pricePi: data.pricePi,
            logisticsFee: data.logisticsFee || 5.0,
            location: data.location,
            condition: data.condition || 'Good',
            year: data.year,
            images: data.images || [],
            isNew: data.isNew || false,
            sellerName: data.sellerName,
            contactMethod: data.contactMethod,
            contactHandle: data.contactHandle,
            availability: data.availability,
            negotiable: data.negotiable,
            tradeIn: data.tradeIn,
            delivery: data.delivery,
            brand: data.brand,
            model: data.model,
            processor: data.processor,
            ram: data.ram,
            storage: data.storage,
            graphics: data.graphics,
            screenSize: data.screenSize,
            resolution: data.resolution,
            operatingSystem: data.operatingSystem,
            color: data.color,
            weight: data.weight,
            batteryLife: data.batteryLife,
            scratches: data.scratches,
            screenCondition: data.screenCondition,
            keyboardCondition: data.keyboardCondition,
            trackpadCondition: data.trackpadCondition,
            ports: data.ports,
            charger: data.charger,
            repairHistory: data.repairHistory,
            accessories: data.accessories || [],
            features: data.features || [],
            safetyFeatures: data.safetyFeatures || [],
            videoUrl: data.videoUrl,
            docs: data.docs || [],
          }
        })
        return res.status(201).json(laptop)
      }
      
      return res.status(400).json({ error: 'Invalid type. Supported types: Phone/phone, Laptop/laptop' })
    } catch (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  res.status(405).end()
}
