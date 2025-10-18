import { prisma } from '@/lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
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
      
      // Laptops - arrays are already native in PostgreSQL
      const parsedLaptops = laptops.map(laptop => ({
        ...laptop,
        images: Array.isArray(laptop.images) ? laptop.images : [],
        features: Array.isArray(laptop.features) ? laptop.features : [],
        safetyFeatures: Array.isArray(laptop.safetyFeatures) ? laptop.safetyFeatures : [],
        docs: Array.isArray(laptop.docs) ? laptop.docs : [],
        accessories: Array.isArray(laptop.accessories) ? laptop.accessories : [],
        _meta: {
          // Use seller relation instead of sellerName
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
          accessories: laptop.accessories || [],
          features: laptop.features || [],
          safetyFeatures: laptop.safetyFeatures || [],
          videoUrl: laptop.videoUrl,
          docs: laptop.docs || [],
        }
      }))
      
      return res.status(200).json(parsedLaptops)
    } catch (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  if (req.method === 'POST') {
    try {
      const laptop = await prisma.laptop.create({
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
          processor: req.body.processor,
          ram: req.body.ram,
          storage: req.body.storage,
          graphics: req.body.graphics,
          screenSize: req.body.screenSize,
          resolution: req.body.resolution,
          operatingSystem: req.body.operatingSystem,
          color: req.body.color,
          weight: req.body.weight,
          batteryLife: req.body.batteryLife,
          scratches: req.body.scratches,
          screenCondition: req.body.screenCondition,
          keyboardCondition: req.body.keyboardCondition,
          trackpadCondition: req.body.trackpadCondition,
          ports: req.body.ports,
          charger: req.body.charger,
          repairHistory: req.body.repairHistory,
          accessories: req.body.accessories || [],
          features: req.body.features || [],
          safetyFeatures: req.body.safetyFeatures || [],
          videoUrl: req.body.videoUrl,
          docs: req.body.docs || [],
        }
      })
      return res.status(201).json(laptop)
    } catch (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  res.status(405).end()
}
