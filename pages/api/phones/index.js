import { prisma } from '@/lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
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
          { year: 'desc' }
        ]
      })
      
      // Phones - arrays are already native in PostgreSQL
      const parsedPhones = phones.map(phone => ({
        ...phone,
        images: Array.isArray(phone.images) ? phone.images : [],
        features: Array.isArray(phone.features) ? phone.features : [],
        safetyFeatures: Array.isArray(phone.safetyFeatures) ? phone.safetyFeatures : [],
        docs: Array.isArray(phone.docs) ? phone.docs : [],
        accessories: Array.isArray(phone.accessories) ? phone.accessories : [],
        connectivity: Array.isArray(phone.connectivity) ? phone.connectivity : [],
        _meta: {
          // Use seller relation instead of sellerName
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
          connectivity: phone.connectivity || [],
          scratches: phone.scratches,
          screenCondition: phone.screenCondition,
          batteryHealth: phone.batteryHealth,
          chargingPort: phone.chargingPort,
          speakers: phone.speakers,
          buttons: phone.buttons,
          waterDamage: phone.waterDamage,
          repairHistory: phone.repairHistory,
          accessories: phone.accessories || [],
          features: phone.features || [],
          safetyFeatures: phone.safetyFeatures || [],
          videoUrl: phone.videoUrl,
          docs: phone.docs || [],
        }
      }))
      
      return res.status(200).json(parsedPhones)
    } catch (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  if (req.method === 'POST') {
    try {
      const phone = await prisma.phone.create({
        data: {
          type: req.body.type,
          title: req.body.title,
          pricePi: req.body.pricePi,
          location: req.body.location,
          condition: req.body.condition,
          year: req.body.year,
          images: req.body.images || [],
          isNew: req.body.isNew || false,
          sellerName: req.body.sellerName,
          contactMethod: req.body.contactMethod,
          contactHandle: req.body.contactHandle,
          availability: req.body.availability,
          negotiable: req.body.negotiable,
          tradeIn: req.body.tradeIn,
          delivery: req.body.delivery,
          brand: req.body.brand,
          model: req.body.model,
          storage: req.body.storage,
          color: req.body.color,
          screenSize: req.body.screenSize,
          operatingSystem: req.body.operatingSystem,
          processor: req.body.processor,
          ram: req.body.ram,
          batteryCapacity: req.body.batteryCapacity,
          cameraSpecs: req.body.cameraSpecs,
          connectivity: req.body.connectivity || [],
          scratches: req.body.scratches,
          screenCondition: req.body.screenCondition,
          batteryHealth: req.body.batteryHealth,
          chargingPort: req.body.chargingPort,
          speakers: req.body.speakers,
          buttons: req.body.buttons,
          waterDamage: req.body.waterDamage,
          repairHistory: req.body.repairHistory,
          accessories: req.body.accessories || [],
          features: req.body.features || [],
          safetyFeatures: req.body.safetyFeatures || [],
          videoUrl: req.body.videoUrl,
          docs: req.body.docs || [],
        }
      })
      return res.status(201).json(phone)
    } catch (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  res.status(405).end()
}
