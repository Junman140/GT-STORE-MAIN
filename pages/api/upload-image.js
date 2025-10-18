// pages/api/upload-image.js
import { put } from '@vercel/blob'
import formidable from 'formidable'
import fs from 'fs'

// Disable body parser to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Parse form data
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB max
      keepExtensions: true,
    })

    const [fields, files] = await form.parse(req)

    // Get the uploaded file (formidable v3 returns arrays)
    const imageFiles = files.image
    if (!imageFiles || imageFiles.length === 0) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    const uploadedFile = imageFiles[0]

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Only images are allowed.' })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const originalName = uploadedFile.originalFilename || 'image'
    const ext = originalName.split('.').pop()
    const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase()
    const newFileName = `${baseName}-${timestamp}-${randomString}.${ext}`

    // Determine folder based on listing type
    const listingType = (fields.type && fields.type[0]) || 'general'
    const blobPath = `uploads/${listingType}/${newFileName}`

    // Read the file as a buffer
    const fileBuffer = fs.readFileSync(uploadedFile.filepath)

    // Upload to Vercel Blob Storage
    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      contentType: uploadedFile.mimetype,
    })

    // Clean up temp file
    fs.unlinkSync(uploadedFile.filepath)

    // Return the public URL from Vercel Blob
    return res.status(200).json({
      success: true,
      url: blob.url,
      filename: newFileName,
      blobPath: blobPath
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return res.status(500).json({ 
      error: 'Failed to upload image',
      details: error.message 
    })
  }
}
