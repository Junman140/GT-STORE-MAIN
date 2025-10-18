// pages/create.js
import { useRouter } from 'next/router'
import { useMemo, useState, useEffect } from 'react'
import ListingCard from '@/components/ListingCard'
import { usePiNetwork } from '@/contexts/PiNetworkContext'
import Link from 'next/link'

export default function Create() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = usePiNetwork()
  const [authChecked, setAuthChecked] = useState(false)

  // Check authentication and seller role
  useEffect(() => {
    if (!isLoading) {
      setAuthChecked(true)
      if (!isAuthenticated) {
        router.push('/')
      } else if (user && user.role !== 'seller') {
        // User is authenticated but not a seller
        // We'll show a message in the UI
      }
    }
  }, [isAuthenticated, user, isLoading, router])

  // ---------- form state ----------
  const [type, setType] = useState('Phone') // 'Phone' | 'Laptop'
  const [title, setTitle] = useState('')
  const [pricePi, setPricePi] = useState('')
  const [logisticsFee, setLogisticsFee] = useState('5')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('Smartphone') // phone default
  const [isNew, setIsNew] = useState(true)
  const [images, setImages] = useState([''])
  const [uploadingIndex, setUploadingIndex] = useState(null) // Track which image is being uploaded

  // phone-specific
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [storage, setStorage] = useState('')
  const [color, setColor] = useState('')
  const [screenSize, setScreenSize] = useState('')
  const [operatingSystem, setOperatingSystem] = useState('')
  const [processor, setProcessor] = useState('')
  const [ram, setRam] = useState('')
  const [batteryCapacity, setBatteryCapacity] = useState('')
  const [cameraSpecs, setCameraSpecs] = useState('')
  const [connectivity, setConnectivity] = useState([])
  const [scratches, setScratches] = useState('')
  const [screenCondition, setScreenCondition] = useState('')
  const [batteryHealth, setBatteryHealth] = useState('')
  const [chargingPort, setChargingPort] = useState('')
  const [speakers, setSpeakers] = useState('')
  const [buttons, setButtons] = useState('')
  const [waterDamage, setWaterDamage] = useState('')
  const [repairHistory, setRepairHistory] = useState('')
  const [accessories, setAccessories] = useState([])

  // laptop-specific
  const [laptopBrand, setLaptopBrand] = useState('')
  const [laptopModel, setLaptopModel] = useState('')
  const [laptopProcessor, setLaptopProcessor] = useState('')
  const [laptopRam, setLaptopRam] = useState('')
  const [laptopStorage, setLaptopStorage] = useState('')
  const [graphicsCard, setGraphicsCard] = useState('')
  const [laptopScreenSize, setLaptopScreenSize] = useState('')
  const [resolution, setResolution] = useState('')
  const [laptopOperatingSystem, setLaptopOperatingSystem] = useState('')
  const [laptopColor, setLaptopColor] = useState('')
  const [batteryLife, setBatteryLife] = useState('')
  const [weight, setWeight] = useState('')
  const [ports, setPorts] = useState('')
  const [wifi, setWifi] = useState('')
  const [bluetooth, setBluetooth] = useState('')
  const [webcam, setWebcam] = useState('')
  const [laptopSpeakers, setLaptopSpeakers] = useState('')
  const [keyboard, setKeyboard] = useState('')
  const [trackpad, setTrackpad] = useState('')
  const [condition, setCondition] = useState('')
  const [laptopScratches, setLaptopScratches] = useState('')
  const [laptopScreenCondition, setLaptopScreenCondition] = useState('')
  const [laptopBatteryHealth, setLaptopBatteryHealth] = useState('')
  const [laptopChargingPort, setLaptopChargingPort] = useState('')
  const [laptopRepairHistory, setLaptopRepairHistory] = useState('')
  const [laptopAccessories, setLaptopAccessories] = useState([])

  // notes only (chat is built-in)
  const [notes, setNotes] = useState('')
  const [year, setYear] = useState('')
  const [features, setFeatures] = useState([])
  const [safetyFeatures, setSafetyFeatures] = useState([])
  const [videoUrl, setVideoUrl] = useState('')
  const [docs, setDocs] = useState([])
  const [charger, setCharger] = useState('')

  const [accept, setAccept] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // ---------- options ----------
  const phoneCats = ['Smartphone', 'Tablet', 'Smartwatch', 'Accessories']
  const laptopCats = ['Gaming', 'Business', 'Ultrabook', 'Workstation', 'Accessories']

  // keep category in sync when switching type
  const visibleCategory = useMemo(() => {
    if (type === 'Phone') return category
    return laptopCats[0] // Default to first laptop category
  }, [type, category])

  // ---------- helpers ----------
  const trim = (s) => (s || '').trim()
  const kmNum = (s) => {
    if (s === '' || s == null) return 0
    const n = parseInt(String(s).replace(/[^\d]/g, ''), 10)
    return Number.isNaN(n) ? 0 : n
  }
  const yearValid = (y) => {
    const n = Number(y)
    const thisYear = new Date().getFullYear() + 1
    return n >= 1980 && n <= thisYear
  }
  const priceValid = (p) => {
    const n = Number(p)
    return Number.isFinite(n) && n > 0
  }
  const urlish = (u) => /^https?:\/\/|^\/(images|img|uploads|cars|property|propertys)\//i.test(u || '')

  const addImage = () => setImages((arr) => [...arr, ''])
  const removeImage = (idx) =>
    setImages((arr) => arr.filter((_, i) => i !== idx))
  const setImageAt = (idx, val) =>
    setImages((arr) => arr.map((v, i) => (i === idx ? val : v)))

  // Handle image upload
  const handleImageUpload = async (idx, file) => {
    if (!file) return
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, or GIF)')
      return
    }

    setUploadingIndex(idx)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', type === 'Phone' ? 'phones' : 'laptops')

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setImageAt(idx, result.url)
      } else {
        alert(result.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploadingIndex(null)
    }
  }

  // ---------- validation ----------
  const validate = () => {
    const e = {}
    if (trim(title).length < 4) e.title = 'Title must be at least 4 characters'
    if (!priceValid(pricePi)) e.pricePi = 'Enter a valid price in π'
    if (!priceValid(logisticsFee)) e.logisticsFee = 'Enter a valid logistics fee in π'
    if (trim(location).length < 2) e.location = 'Enter a location (City, Country)'
    const mainImage = images[0]
    if (!urlish(mainImage)) e.images = 'Add at least one valid image URL (http/https or /images/...)'

    if (type === 'Phone') {
      if (!phoneCats.includes(category)) e.category = 'Choose a valid category'
      if (trim(brand).length < 2) e.brand = 'Brand required'
      if (trim(model).length < 1) e.model = 'Model required'
      if (!trim(condition)) e.condition = 'Condition required'
    } else {
      if (!laptopCats.includes(category)) e.category = 'Choose a valid category'
      if (trim(laptopBrand).length < 2) e.laptopBrand = 'Brand required'
      if (trim(laptopModel).length < 1) e.laptopModel = 'Model required'
      if (!trim(condition)) e.condition = 'Condition required'
    }

    if (!accept) e.accept = 'You must accept the terms'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ---------- submit ----------
  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    try {
      // Prepare data for API
      const listingData = type === 'Phone'
        ? {
            type: category,
            title: trim(title) || `${trim(brand)} ${trim(model)}`,
            pricePi: Number(pricePi),
            logisticsFee: Number(logisticsFee),
            location: trim(location),
            condition: trim(condition),
            year: year ? Number(year) : undefined,
            brand: trim(brand),
            model: trim(model),
            storage: trim(storage),
            color: trim(color),
            screenSize: trim(screenSize),
            operatingSystem: trim(operatingSystem),
            processor: trim(processor),
            ram: trim(ram),
            batteryCapacity: trim(batteryCapacity),
            cameraSpecs: trim(cameraSpecs),
            connectivity: connectivity.filter(Boolean),
            scratches: trim(scratches),
            screenCondition: trim(screenCondition),
            batteryHealth: trim(batteryHealth),
            chargingPort: trim(chargingPort),
            speakers: trim(speakers),
            buttons: trim(buttons),
            waterDamage: trim(waterDamage),
            repairHistory: trim(repairHistory),
            accessories: accessories.filter(Boolean),
            features: features.filter(Boolean),
            safetyFeatures: safetyFeatures.filter(Boolean),
            videoUrl: trim(videoUrl),
            docs: docs.filter(Boolean),
            images: images.filter(Boolean),
            isNew,
            notes: trim(notes),
          }
        : {
            type: category,
            title: trim(title) || `${trim(laptopBrand)} ${trim(laptopModel)}`,
            pricePi: Number(pricePi),
            logisticsFee: Number(logisticsFee),
            location: trim(location),
            condition: trim(condition),
            year: year ? Number(year) : undefined,
            brand: trim(laptopBrand),
            model: trim(laptopModel),
            processor: trim(laptopProcessor),
            ram: trim(laptopRam),
            storage: trim(laptopStorage),
            graphics: trim(graphicsCard),
            screenSize: trim(laptopScreenSize),
            resolution: trim(resolution),
            operatingSystem: trim(laptopOperatingSystem),
            color: trim(laptopColor),
            weight: trim(weight),
            batteryLife: trim(batteryLife),
            ports: trim(ports),
            charger: trim(charger),
            scratches: trim(laptopScratches),
            screenCondition: trim(laptopScreenCondition),
            keyboardCondition: trim(keyboard),
            trackpadCondition: trim(trackpad),
            repairHistory: trim(laptopRepairHistory),
            accessories: laptopAccessories.filter(Boolean),
            features: features.filter(Boolean),
            safetyFeatures: safetyFeatures.filter(Boolean),
            videoUrl: trim(videoUrl),
            docs: docs.filter(Boolean),
            images: images.filter(Boolean),
            isNew,
            notes: trim(notes),
          }

      // POST to API
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type === 'Phone' ? 'phone' : 'laptop',
          data: listingData,
          userId: user.id || user.user_uid || user.uid
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert('Listing created successfully!')
        router.push(type === 'Phone' ? '/phones' : '/laptops')
      } else {
        alert(result.error || 'Failed to create listing')
        setSubmitting(false)
      }
    } catch (error) {
      console.error('Error creating listing:', error)
      alert('An error occurred while creating the listing')
      setSubmitting(false)
    }
  }

  // ---------- preview item for ListingCard ----------
  const previewItem = useMemo(() => {
    if (type === 'Phone') {
      return {
        id: 'preview',
        type: category,
        title: title || `${brand} ${model}`,
        pricePi: pricePi ? Number(pricePi) : 0,
        logisticsFee: logisticsFee ? Number(logisticsFee) : 5,
        location,
        storage: storage ? `${storage}` : undefined,
        images: images.filter(Boolean),
        isNew,
      }
    }
    return {
      id: 'preview',
      type: category,
      title: title || `${laptopBrand} ${laptopModel}`,
      pricePi: pricePi ? Number(pricePi) : 0,
      logisticsFee: logisticsFee ? Number(logisticsFee) : 5,
      location,
      storage: laptopStorage ? `${laptopStorage}` : undefined,
      images: images.filter(Boolean),
      isNew,
    }
  }, [type, category, title, pricePi, logisticsFee, location, storage, images, isNew, brand, model, laptopBrand, laptopModel, laptopStorage])

  // ---------- UI ----------
  // Show loading state
  if (isLoading || !authChecked) {
    return (
      <div className="container py-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    )
  }

  // Show message if user is not a seller or admin
  if (user && user.role !== 'seller' && user.role !== 'admin') {
    return (
      <div className="container py-6">
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-white rounded-2xl border shadow-soft p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Seller Account Required</h1>
            <p className="text-gray-600 mb-6">
              You need to be approved as a seller to create listings. Please apply for a seller account first.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/apply-seller" className="inline-flex items-center px-6 py-3 rounded-xl bg-brand-blue text-white font-semibold hover:bg-brand-dark">
                Apply as Seller
              </Link>
              <Link href="/" className="inline-flex items-center px-6 py-3 rounded-xl border text-gray-700 hover:bg-gray-50">
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container py-8">
        <div className="mt-3 flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
            Create Listing
          </h1>

        {/* Type toggle */}
        <div className="inline-flex rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-1">
          {['Phones', 'Laptops'].map((t) => {
            const active = type === t
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${active ? 'bg-white text-black shadow-lg' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                type="button"
              >
                {t}
              </button>
            )
          })}
        </div>
      </div>

      <form onSubmit={submit} className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: form sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basics */}
          <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8">
            <h2 className="text-xl font-light text-white mb-6">Basics</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* type-specific category */}
              {type === 'Phone' ? (
                <Field label="Category" error={errors.category}>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                  >
                    {phoneCats.map((c) => <option key={c} className="bg-gray-800 text-white">{c}</option>)}
                  </select>
                </Field>
              ) : (
                <Field label="Category" error={errors.category}>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                  >
                    {laptopCats.map((c) => <option key={c} className="bg-gray-800 text-white">{c}</option>)}
                  </select>
                </Field>
              )}

              <Field label="Location" error={errors.location}>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                    className="w-full rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                />
              </Field>

              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Price (π)" error={errors.pricePi}>
                  <input
                    type="number"
                    step="0.01"
                    value={pricePi}
                    onChange={(e) => setPricePi(e.target.value)}
                    placeholder="e.g., 314.0"
                    className="w-full rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                  />
                </Field>

                <Field label="Logistics Fee (π)" error={errors.logisticsFee}>
                  <input
                    type="number"
                    step="0.01"
                    value={logisticsFee}
                    onChange={(e) => setLogisticsFee(e.target.value)}
                    placeholder="e.g., 5.0"
                    className="w-full rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                  />
                </Field>

                <Field label="New listing">
                  <div className="flex h-10 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsNew((v) => !v)}
                      className={`w-12 h-6 rounded-full transition relative ${
                        isNew ? 'bg-brand-blue' : 'bg-gray-300'
                      }`}
                      aria-pressed={isNew}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                          isNew ? 'left-6' : 'left-0.5'
                        }`}
                      />
                    </button>
                    <span className="text-sm text-gray-700">{isNew ? 'Yes' : 'No'}</span>
                  </div>
                </Field>

                {type === 'Property' ? (
                  <Field label="Listing type">
                    <select
                      value={propKind}
                      onChange={(e) => setPropKind(e.target.value)}
                      className="w-full rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                    >
                      <option className="bg-gray-800 text-white">Sale</option>
                      <option className="bg-gray-800 text-white">Rent</option>
                    </select>
                  </Field>
                ) : (
                  <div />
                )}
              </div>

              <Field label="Title" error={errors.title} className="sm:col-span-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={type === 'Phone' ? 'e.g., iPhone 15 Pro Max 256GB' : 'e.g., MacBook Pro M3 16-inch'}
                    className="w-full rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                />
              </Field>
            </div>
          </section>

          {/* Details */}
          <section className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-4 sm:p-5 shadow-soft">
            <h2 className="text-base font-semibold mb-3 text-white">Details</h2>
            {type === 'Phone' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Brand" error={errors.brand}>
                  <input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g., Apple, Samsung"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Condition" error={errors.condition}>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="">Select condition</option>
                    <option value="New" className="bg-gray-800 text-white">New</option>
                    <option value="Like New" className="bg-gray-800 text-white">Like New</option>
                    <option value="Good" className="bg-gray-800 text-white">Good</option>
                    <option value="Fair" className="bg-gray-800 text-white">Fair</option>
                    <option value="Poor" className="bg-gray-800 text-white">Poor</option>
                  </select>
                </Field>
                <Field label="Model" error={errors.model}>
                  <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g., iPhone 15 Pro"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Storage">
                  <input
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    placeholder="e.g., 256GB"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Color">
                  <input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g., Space Black"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Screen Size">
                  <input
                    value={screenSize}
                    onChange={(e) => setScreenSize(e.target.value)}
                    placeholder="e.g., 6.7 inches"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Operating System">
                  <input
                    value={operatingSystem}
                    onChange={(e) => setOperatingSystem(e.target.value)}
                    placeholder="e.g., iOS 17"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Processor">
                  <input
                    value={processor}
                    onChange={(e) => setProcessor(e.target.value)}
                    placeholder="e.g., A17 Pro"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="RAM">
                  <input
                    value={ram}
                    onChange={(e) => setRam(e.target.value)}
                    placeholder="e.g., 8GB"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Battery Capacity">
                  <input
                    value={batteryCapacity}
                    onChange={(e) => setBatteryCapacity(e.target.value)}
                    placeholder="e.g., 4000mAh"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Camera Specs">
                  <input
                    value={cameraSpecs}
                    onChange={(e) => setCameraSpecs(e.target.value)}
                    placeholder="e.g., 48MP Main, 12MP Ultra-wide"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Scratches">
                  <input
                    value={scratches}
                    onChange={(e) => setScratches(e.target.value)}
                    placeholder="e.g., Minor scratches on back"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Screen Condition">
                  <input
                    value={screenCondition}
                    onChange={(e) => setScreenCondition(e.target.value)}
                    placeholder="e.g., Perfect, no cracks"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Battery Health">
                  <input
                    value={batteryHealth}
                    onChange={(e) => setBatteryHealth(e.target.value)}
                    placeholder="e.g., 95%"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Charging Port">
                  <input
                    value={chargingPort}
                    onChange={(e) => setChargingPort(e.target.value)}
                    placeholder="e.g., USB-C, Lightning"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Speakers">
                  <input
                    value={speakers}
                    onChange={(e) => setSpeakers(e.target.value)}
                    placeholder="e.g., Stereo speakers"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Buttons">
                  <input
                    value={buttons}
                    onChange={(e) => setButtons(e.target.value)}
                    placeholder="e.g., All buttons working"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Water Damage">
                  <input
                    value={waterDamage}
                    onChange={(e) => setWaterDamage(e.target.value)}
                    placeholder="e.g., None, IP68 rated"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Repair History">
                  <input
                    value={repairHistory}
                    onChange={(e) => setRepairHistory(e.target.value)}
                    placeholder="e.g., Screen replaced 6 months ago"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Video URL">
                  <input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="e.g., YouTube video link"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Brand" error={errors.laptopBrand}>
                  <input
                    value={laptopBrand}
                    onChange={(e) => setLaptopBrand(e.target.value)}
                    placeholder="e.g., Apple, Dell"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Condition" error={errors.condition}>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="">Select condition</option>
                    <option value="New" className="bg-gray-800 text-white">New</option>
                    <option value="Like New" className="bg-gray-800 text-white">Like New</option>
                    <option value="Good" className="bg-gray-800 text-white">Good</option>
                    <option value="Fair" className="bg-gray-800 text-white">Fair</option>
                    <option value="Poor" className="bg-gray-800 text-white">Poor</option>
                  </select>
                </Field>
                <Field label="Model" error={errors.laptopModel}>
                  <input
                    value={laptopModel}
                    onChange={(e) => setLaptopModel(e.target.value)}
                    placeholder="e.g., MacBook Pro"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Processor">
                  <input
                    value={laptopProcessor}
                    onChange={(e) => setLaptopProcessor(e.target.value)}
                    placeholder="e.g., M3 Pro"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="RAM">
                  <input
                    value={laptopRam}
                    onChange={(e) => setLaptopRam(e.target.value)}
                    placeholder="e.g., 16GB"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Storage">
                  <input
                    value={laptopStorage}
                    onChange={(e) => setLaptopStorage(e.target.value)}
                    placeholder="e.g., 512GB SSD"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Graphics Card">
                  <input
                    value={graphicsCard}
                    onChange={(e) => setGraphicsCard(e.target.value)}
                    placeholder="e.g., M3 Pro GPU"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Screen Size">
                  <input
                    value={laptopScreenSize}
                    onChange={(e) => setLaptopScreenSize(e.target.value)}
                    placeholder="e.g., 16 inches"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
                <Field label="Resolution">
                  <input
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="e.g., 3456 x 2234"
                    className="w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </Field>
              </div>
            )}
          </section>

          {/* Photos */}
          <section className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-4 sm:p-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white">Photos</h2>
              {errors.images && <span className="text-xs text-red-400">{errors.images}</span>}
            </div>

            <div className="space-y-3">
              {images.map((u, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">
                      {i === 0 ? 'Main Image' : `Image ${i + 1}`}
                    </span>
                    {u && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Added
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Upload Button */}
                    <label className="shrink-0">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(i, e.target.files[0])}
                        className="hidden"
                        disabled={uploadingIndex === i}
                      />
                      <div className={`cursor-pointer inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                        uploadingIndex === i 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-brand-blue text-white hover:bg-brand-dark'
                      }`}>
                        {uploadingIndex === i ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload Image
                          </>
                        )}
                      </div>
                    </label>

                    {/* URL Input */}
                  <input
                    value={u}
                    onChange={(e) => setImageAt(i, e.target.value)}
                    placeholder={i === 0 ? 'Or paste image URL (required)' : 'Or paste image URL'}
                    className="flex-1 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />

                    {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                      className="shrink-0 rounded-xl border px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    disabled={images.length === 1}
                  >
                    Remove
                  </button>
                  </div>

                  {/* Image Preview */}
                  {u && urlish(u) && (
                    <div className="rounded-lg border overflow-hidden bg-gray-50">
                      <img 
                        src={u} 
                        alt={`Preview ${i + 1}`} 
                        className="h-32 w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addImage}
                className="mt-2 inline-flex items-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 backdrop-blur-sm px-4 py-2 text-sm text-white hover:bg-white/10 transition-all duration-200"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Another Image
              </button>
              
              <div className="mt-3 rounded-lg bg-blue-900/20 border border-blue-400/30 p-3">
                <p className="text-xs text-blue-200">
                  <strong className="text-blue-300">Tip:</strong> You can upload images (max 5MB) or paste URLs. Supported formats: JPEG, PNG, WebP, GIF.
                </p>
              </div>
            </div>
          </section>

          {/* Additional Info */}
          <section className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-4 sm:p-5 shadow-soft">
            <h2 className="text-base font-semibold mb-3 text-white">Additional Information</h2>
            <div className="rounded-lg bg-blue-900/20 border border-blue-400/30 p-3 mb-3">
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-300">Buyers can message you via built-in chat</p>
                  <p className="text-xs text-blue-200 mt-1">No need to provide external contact info. Buyers will use the "Chat with Seller" button on your listing.</p>
                </div>
              </div>
            </div>
            <Field label="Extra notes (optional)">
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional details buyers should know (viewing times, condition, flexible price, etc.)"
                    className="w-full rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
              />
            </Field>
          </section>

          {/* Terms */}
          <section className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-4 sm:p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <input
                id="accept"
                type="checkbox"
                checked={accept}
                onChange={(e) => setAccept(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-white focus:ring-2 focus:ring-white/30 focus:border-white/40"
              />
              <label htmlFor="accept" className="text-sm text-white">
                I confirm this listing is accurate, priced in π, and follows the marketplace rules.
              </label>
            </div>
            {errors.accept && <p className="mt-2 text-xs text-red-400">{errors.accept}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-white text-black px-8 py-3 font-medium hover:bg-gray-100 disabled:opacity-60 transition-all duration-200"
              >
                {submitting ? 'Saving…' : 'Save Listing'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm text-white px-8 py-3 font-medium hover:bg-white/10 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </section>
        </div>

        {/* RIGHT: live preview (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-3">
            <h3 className="text-sm font-semibold text-white">Preview</h3>
            <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-3 shadow-soft">
              <ListingCard item={previewItem} href="#" />
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-4">
              <div className="text-xs text-gray-300">
                Category: <b className="text-white">{visibleCategory}</b>
                <br />
                Type: <b className="text-white">{type}</b>
              </div>
            </div>
          </div>
        </aside>
      </form>

      {/* Mobile sticky submit bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 bg-black/95 backdrop-blur border-t border-white/10 p-3 lg:hidden">
        <div className="container flex items-center gap-3">
          <button
            onClick={submit}
            disabled={submitting}
            className="flex-1 rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-gray-100 disabled:opacity-60 transition-all duration-200"
          >
            {submitting ? 'Saving…' : 'Save Listing'}
          </button>
          <button
            onClick={() => router.back()}
            className="rounded-2xl border border-white/20 text-white px-6 py-3 hover:bg-white/10 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

/* ---------- small field wrapper ---------- */
function Field({ label, error, className = '', children }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-white">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
