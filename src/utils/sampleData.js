export const SAMPLE_ROUTES = [
  {
    id: 'route-01',
    name: 'Blue Ridge Parkway Drive',
    author: 'TrailBlazer_Mike',
    description: 'A classic autumn drive through the Appalachians with stunning overlooks and cozy mountain towns.',
    distance: 185000,
    duration: 14400000,
    coverColor: '#ff7a3c',
    photo: 'https://images.unsplash.com/photo-1504016798967-7a53f59e6a30?w=800&q=75&auto=format&fit=crop',
    createdAt: Date.now() - 86400000 * 30,
    isOwn: false,
    path: [
      { lat: 36.5984, lng: -79.2325 },
      { lat: 36.55, lng: -79.35 },
      { lat: 36.48, lng: -79.52 },
      { lat: 36.40, lng: -79.68 },
      { lat: 36.28, lng: -79.82 },
      { lat: 36.12, lng: -79.95 },
      { lat: 35.98, lng: -80.08 },
      { lat: 35.88, lng: -80.18 },
      { lat: 35.77, lng: -80.3 },
    ],
    places: [
      { id: 'sp-01-1', type: 'restaurant', name: 'Mabry Mill Restaurant', lat: 36.5, lng: -80.15, notes: 'Old-fashioned buckwheat pancakes, get there early.', tripId: 'route-01' },
      { id: 'sp-01-2', type: 'destination', name: 'Humpback Rocks', lat: 37.88, lng: -78.88, notes: 'Short steep hike, worth every step for the view.', tripId: 'route-01' },
      { id: 'sp-01-3', type: 'restaurant', name: 'Peaks of Otter Lodge', lat: 37.45, lng: -79.61, notes: 'Great trout, sit on the deck.', tripId: 'route-01' },
    ],
  },
  {
    id: 'route-02',
    name: 'California Coast Cruise',
    author: 'SunsetChaser',
    description: 'PCH from Malibu to Big Sur. Cliffs, sea lions, artichoke fields, and the best fish tacos.',
    distance: 420000,
    duration: 28800000,
    coverColor: '#f0561a',
    photo: 'https://images.unsplash.com/photo-1476611338391-6f395a0dd82e?w=800&q=75&auto=format&fit=crop',
    createdAt: Date.now() - 86400000 * 15,
    isOwn: false,
    path: [
      { lat: 34.03, lng: -118.78 },
      { lat: 34.14, lng: -119.04 },
      { lat: 34.27, lng: -119.29 },
      { lat: 34.37, lng: -119.52 },
      { lat: 34.42, lng: -119.84 },
      { lat: 34.69, lng: -120.46 },
      { lat: 34.95, lng: -120.63 },
      { lat: 35.18, lng: -120.74 },
      { lat: 35.37, lng: -120.85 },
      { lat: 35.52, lng: -121.10 },
      { lat: 35.66, lng: -121.28 },
      { lat: 35.92, lng: -121.46 },
      { lat: 36.10, lng: -121.62 },
      { lat: 36.27, lng: -121.81 },
    ],
    places: [
      { id: 'sp-02-1', type: 'destination', name: 'Elephant Seal Vista Point', lat: 35.66, lng: -121.25, notes: 'Hundreds of elephant seals just chilling. Unreal.', tripId: 'route-02' },
      { id: 'sp-02-2', type: 'restaurant', name: 'Nepenthe', lat: 36.27, lng: -121.81, notes: 'Ambrosia burger on the cliff edge. Pricey but iconic.', tripId: 'route-02' },
      { id: 'sp-02-3', type: 'destination', name: 'McWay Falls', lat: 36.15, lng: -121.67, notes: 'Falls right onto the beach — only accessible from the trail.', tripId: 'route-02' },
    ],
  },
  {
    id: 'route-03',
    name: 'Texas Hill Country Loop',
    author: 'LoneStar_Roads',
    description: 'Wildflowers, wineries, and small town BBQ through the heart of the Hill Country.',
    distance: 310000,
    duration: 21600000,
    coverColor: '#ff9a4a',
    photo: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=75&auto=format&fit=crop',
    createdAt: Date.now() - 86400000 * 7,
    isOwn: false,
    path: [
      { lat: 30.27, lng: -97.74 },
      { lat: 30.23, lng: -97.90 },
      { lat: 30.18, lng: -98.10 },
      { lat: 30.20, lng: -98.40 },
      { lat: 30.22, lng: -98.62 },
      { lat: 30.27, lng: -98.87 },
      { lat: 30.40, lng: -99.05 },
      { lat: 30.52, lng: -99.14 },
      { lat: 30.50, lng: -98.80 },
      { lat: 30.45, lng: -98.40 },
      { lat: 30.38, lng: -98.05 },
      { lat: 30.30, lng: -97.85 },
      { lat: 30.27, lng: -97.74 },
    ],
    places: [
      { id: 'sp-03-1', type: 'restaurant', name: 'Kreuz Market', lat: 29.88, lng: -97.94, notes: 'No forks. No sauce. Just brisket. Perfection.', tripId: 'route-03' },
      { id: 'sp-03-2', type: 'destination', name: 'Enchanted Rock', lat: 30.51, lng: -98.82, notes: 'Summit at sunrise before the crowds arrive.', tripId: 'route-03' },
      { id: 'sp-03-3', type: 'restaurant', name: 'Alamo Springs Cafe', lat: 29.97, lng: -98.91, notes: 'Best burger in Texas, cash only.', tripId: 'route-03' },
    ],
  },
]

const DAY = 86400000

// Completed trips seeded once on first launch so the Logbook and Home feel
// alive out of the box. Each carries a real GPS-ish path (for the route
// thumbnails + map), realistic stats, and saved stops.
export const SAMPLE_TRIPS = [
  {
    id: 'trip-demo-1',
    name: 'Big Sur Coast Run',
    photo: 'https://images.unsplash.com/photo-1537519646099-335112f03225?w=800&q=75&auto=format&fit=crop',
    createdAt: Date.now() - DAY * 4,
    startTime: Date.now() - DAY * 4,
    endTime: Date.now() - DAY * 4 + 11700000,
    distance: 178400,
    duration: 11700000,
    avgSpeed: 15.2,
    maxSpeed: 27.4,
    path: [
      { lat: 36.2704, lng: -121.8081 }, { lat: 36.22, lng: -121.78 },
      { lat: 36.15, lng: -121.67 }, { lat: 36.10, lng: -121.62 },
      { lat: 35.97, lng: -121.50 }, { lat: 35.88, lng: -121.43 },
      { lat: 35.78, lng: -121.32 }, { lat: 35.66, lng: -121.25 },
      { lat: 35.57, lng: -121.13 }, { lat: 35.45, lng: -120.95 },
      { lat: 35.37, lng: -120.85 },
    ],
  },
  {
    id: 'trip-demo-2',
    name: 'Smoky Mountain Loop',
    photo: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=800&q=75&auto=format&fit=crop',
    createdAt: Date.now() - DAY * 12,
    startTime: Date.now() - DAY * 12,
    endTime: Date.now() - DAY * 12 + 7500000,
    distance: 96200,
    duration: 7500000,
    avgSpeed: 12.8,
    maxSpeed: 22.1,
    path: [
      { lat: 35.6118, lng: -83.4895 }, { lat: 35.65, lng: -83.52 },
      { lat: 35.68, lng: -83.56 }, { lat: 35.71, lng: -83.50 },
      { lat: 35.70, lng: -83.42 }, { lat: 35.66, lng: -83.38 },
      { lat: 35.60, lng: -83.40 }, { lat: 35.58, lng: -83.46 },
      { lat: 35.6118, lng: -83.4895 },
    ],
  },
  {
    id: 'trip-demo-3',
    name: 'Desert Sunset Drive',
    photo: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=75&auto=format&fit=crop',
    createdAt: Date.now() - DAY * 1,
    startTime: Date.now() - DAY * 1,
    endTime: Date.now() - DAY * 1 + 5400000,
    distance: 61800,
    duration: 5400000,
    avgSpeed: 18.6,
    maxSpeed: 31.2,
    path: [
      { lat: 33.8734, lng: -115.9010 }, { lat: 33.92, lng: -115.95 },
      { lat: 33.98, lng: -116.02 }, { lat: 34.03, lng: -116.10 },
      { lat: 34.08, lng: -116.18 }, { lat: 34.13, lng: -116.31 },
    ],
  },
]

export const SAMPLE_TRIP_PLACES = [
  {
    id: 'tp-1-1', type: 'restaurant', name: 'Nepenthe', lat: 36.2704, lng: -121.8081,
    notes: 'Ambrosia burger right on the cliff edge. Worth the wait.', tripId: 'trip-demo-1', createdAt: Date.now() - DAY * 4,
    google: {
      rating: 4.5, reviews: 6214, price: '$$$', category: 'Californian restaurant',
      address: '48510 CA-1, Big Sur, CA 93920', phone: '(831) 667-2345', website: 'https://nepenthe.com',
      hours: 'Open ⋅ Closes 10 PM',
      photos: [
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&q=70&auto=format&fit=crop',
      ],
      reviewsList: [
        { author: 'Marcus T.', rating: 5, date: '2 weeks ago', likes: 42, text: 'The view alone is worth the drive. Got the Ambrosia burger and an Aperol spritz as the sun dropped over the Pacific. Unforgettable.' },
        { author: 'Priya K.', rating: 5, date: 'a month ago', likes: 18, text: 'Pricey but you are paying for one of the best patios on Earth. Arrive before sunset and put your name in early.' },
        { author: 'Dave R.', rating: 4, date: '3 months ago', likes: 7, text: 'Food is solid, service was friendly. It gets packed midday — go off-peak if you can. The terrace is magic.' },
      ],
    },
  },
  {
    id: 'tp-1-2', type: 'destination', name: 'McWay Falls', lat: 36.1577, lng: -121.6716,
    notes: '80ft waterfall dropping straight onto the beach.', tripId: 'trip-demo-1', createdAt: Date.now() - DAY * 4,
    google: {
      rating: 4.8, reviews: 9483, category: 'Scenic spot · Julia Pfeiffer Burns SP',
      address: 'McWay Falls Trail, Big Sur, CA 93920', hours: 'Open ⋅ 8 AM–sunset',
      photos: [
        'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400&q=70&auto=format&fit=crop',
      ],
      reviewsList: [
        { author: 'Elena M.', rating: 5, date: '1 week ago', likes: 64, text: 'Probably the most beautiful 0.6 mile walk in California. The waterfall onto the cove is unreal — go on a clear day.' },
        { author: 'Tom B.', rating: 5, date: '2 months ago', likes: 23, text: 'Easy paved overlook trail, stroller friendly. Parking fills fast on weekends so come early or late.' },
        { author: 'Sara W.', rating: 4, date: '4 months ago', likes: 9, text: 'Stunning but you cannot go down to the beach — it is protected. Still 100% worth the stop.' },
      ],
    },
  },
  {
    id: 'tp-1-3', type: 'destination', name: 'Elephant Seal Vista', lat: 35.6602, lng: -121.2549,
    notes: 'Hundreds of seals just lounging. Surreal.', tripId: 'trip-demo-1', createdAt: Date.now() - DAY * 4,
    google: {
      rating: 4.7, reviews: 5102, category: 'Wildlife viewing area',
      address: 'Piedras Blancas, San Simeon, CA 93452', hours: 'Open 24 hours',
      reviewsList: [
        { author: 'Greg H.', rating: 5, date: '3 weeks ago', likes: 31, text: 'Free boardwalk right next to hundreds of elephant seals. The pups in winter are adorable. Bring a jacket, it is windy.' },
        { author: 'Nina P.', rating: 5, date: '2 months ago', likes: 12, text: 'You can hear them from the parking lot. Docents are super knowledgeable. Such an easy and rewarding stop on the PCH.' },
      ],
    },
  },
  {
    id: 'tp-2-1', type: 'destination', name: 'Clingmans Dome', lat: 35.5628, lng: -83.4985,
    notes: 'Highest point in the Smokies — 360° tower view.', tripId: 'trip-demo-2', createdAt: Date.now() - DAY * 12,
    google: {
      rating: 4.7, reviews: 8967, category: 'Observation tower',
      address: 'Clingmans Dome Rd, Bryson City, NC 28713', hours: 'Open ⋅ Road closes in winter',
      photos: [
        'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=400&q=70&auto=format&fit=crop',
      ],
      reviewsList: [
        { author: 'Caleb J.', rating: 5, date: '1 month ago', likes: 27, text: 'The half-mile walk up is steep but paved. The spiral ramp tower gives a full 360 of the Smokies. Catch it at sunset.' },
        { author: 'Maria L.', rating: 4, date: '2 months ago', likes: 11, text: 'Often foggy at the top so check the forecast. When it is clear you can see for 100 miles. Bring layers — cold up there.' },
      ],
    },
  },
  {
    id: 'tp-2-2', type: 'restaurant', name: 'The Andrews Bald Picnic', lat: 35.5556, lng: -83.4944,
    notes: 'Packed sandwiches on the grassy bald. Perfect.', tripId: 'trip-demo-2', createdAt: Date.now() - DAY * 12,
    google: {
      rating: 4.9, reviews: 412, category: 'Picnic area · Forney Ridge Trail',
      address: 'Andrews Bald, Great Smoky Mountains NP', hours: 'Open ⋅ Daylight hours',
      reviewsList: [
        { author: 'Hannah F.', rating: 5, date: '5 weeks ago', likes: 19, text: 'A 3.5 mile round trip hike rewards you with a wide open grassy bald and panoramic views. Best picnic spot in the park.' },
      ],
    },
  },
  {
    id: 'tp-3-1', type: 'destination', name: 'Cholla Cactus Garden', lat: 33.9270, lng: -115.9267,
    notes: 'Glowing gold at golden hour. Bring a tripod.', tripId: 'trip-demo-3', createdAt: Date.now() - DAY * 1,
    google: {
      rating: 4.8, reviews: 3744, category: 'Nature preserve · Joshua Tree NP',
      address: 'Pinto Basin Rd, Joshua Tree NP, CA', hours: 'Open 24 hours',
      photos: [
        'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1547234935-80c7145ec969?w=400&q=70&auto=format&fit=crop',
      ],
      reviewsList: [
        { author: 'Leo S.', rating: 5, date: '2 weeks ago', likes: 38, text: 'The cholla backlit at golden hour literally glow. Quarter mile loop, totally flat. Do NOT touch them — they jump!' },
        { author: 'Amy R.', rating: 5, date: '3 months ago', likes: 14, text: 'Otherworldly. Felt like another planet at sunrise with nobody around. A must-stop driving through the park.' },
      ],
    },
  },
  {
    id: 'tp-3-2', type: 'destination', name: 'Keys View', lat: 33.9266, lng: -116.1869,
    notes: 'See the Salton Sea and San Andreas Fault from up top.', tripId: 'trip-demo-3', createdAt: Date.now() - DAY * 1,
    google: {
      rating: 4.8, reviews: 4188, category: 'Scenic overlook · 5,185 ft',
      address: 'Keys View Rd, Joshua Tree NP, CA', hours: 'Open 24 hours',
      reviewsList: [
        { author: 'Chris D.', rating: 5, date: '1 month ago', likes: 22, text: 'Drive right up to a 5,000 ft overlook. You can see the Salton Sea, Palm Springs, and the San Andreas Fault. Epic at sunset.' },
        { author: 'Bex T.', rating: 4, date: '2 months ago', likes: 6, text: 'Gets very windy and cold. Short walk from the lot. Hazy some days but on a clear one you can see all the way to Mexico.' },
      ],
    },
  },
]

