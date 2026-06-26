import { create } from 'zustand'
import * as db from './db'
import { SAMPLE_ROUTES, SAMPLE_TRIPS, SAMPLE_TRIP_PLACES } from './utils/sampleData'
import { getCurrentUser, signOut } from './auth'
import { uid } from './utils/uid'

export const useStore = create((set, get) => ({
  currentUser: getCurrentUser(),
  trips: [],
  places: [],
  routes: [],
  activeTrip: null,
  activeTab: 'home',
  trackingActive: false,
  currentPath: [],
  selectedRoute: null,
  followingRoute: null,
  flyToPlace: null,
  pendingTripId: null,
  toasts: [],

  setUser: (user) => set({ currentUser: user }),
  logout: () => { signOut(); set({ currentUser: null, trips: [], places: [], routes: [], activeTrip: null, trackingActive: false, currentPath: [], toasts: [] }) },
  toast: (message, type = 'success', opts = {}) => {
    const id = uid()
    set(s => ({ toasts: [...s.toasts.slice(-2), { id, message, type, ...opts }] }))
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  loadAll: async () => {
    // One-time demo seed: sample routes + completed trips + their stops, so a
    // first-run user lands on a populated app. Guarded by a flag so that once a
    // user deletes a seeded trip it does not silently reappear.
    const seeded = await db.getSetting('demoSeeded')
    if (!seeded) {
      const existingRoutes = await db.getAllRoutes()
      if (existingRoutes.length === 0) {
        for (const r of SAMPLE_ROUTES) await db.saveRoute(r)
      }
      for (const t of SAMPLE_TRIPS) await db.saveTrip(t)
      for (const p of SAMPLE_TRIP_PLACES) await db.savePlace(p)
      await db.setSetting('demoSeeded', true)
    }

    const [trips, places, routes] = await Promise.all([
      db.getAllTrips(),
      db.getAllPlaces(),
      db.getAllRoutes(),
    ])
    set({ trips, places, routes })
  },

  setTab: (tab) => set({ activeTab: tab }),
  openTrip: (tripId) => set({ activeTab: 'trips', pendingTripId: tripId }),
  clearPendingTrip: () => set({ pendingTripId: null }),

  startTrip: async (name) => {
    const trip = {
      id: uid(),
      name,
      createdAt: Date.now(),
      path: [],
      distance: 0,
      duration: 0,
      startTime: Date.now(),
    }
    await db.saveTrip(trip)
    set((s) => ({ trips: [trip, ...s.trips], activeTrip: trip, trackingActive: true, currentPath: [] }))
    get().toast(`${name}`, 'info', { sub: 'Recording…' })
    return trip
  },

  appendPathPoint: async (latlng) => {
    const { activeTrip, currentPath } = get()
    if (!activeTrip) return
    const point = { ...latlng, ts: Date.now() }
    const newPath = [...currentPath, point]
    let dist = activeTrip.distance
    let segSpeed = 0
    if (newPath.length > 1) {
      const prev = newPath[newPath.length - 2]
      const d = haversine(prev, point)
      dist += d
      const dt = (point.ts - (prev.ts || point.ts)) / 1000
      if (dt > 0 && dt < 60) segSpeed = d / dt
    }
    const maxSpeed = Math.max(activeTrip.maxSpeed || 0, segSpeed)
    const updated = { ...activeTrip, path: newPath, distance: dist, maxSpeed }
    await db.saveTrip(updated)
    set((s) => ({
      currentPath: newPath,
      activeTrip: updated,
      trips: s.trips.map((t) => (t.id === updated.id ? updated : t)),
    }))
  },

  stopTrip: async () => {
    const { activeTrip, currentPath } = get()
    if (!activeTrip) return
    const now = Date.now()
    const duration = now - activeTrip.startTime
    const avgSpeed = duration > 0 ? (activeTrip.distance / (duration / 1000)) : 0
    const updated = {
      ...activeTrip,
      path: currentPath,
      duration,
      endTime: now,
      avgSpeed,
    }
    await db.saveTrip(updated)
    const km = (updated.distance / 1000).toFixed(1)
    const sub = updated.distance > 500 ? `${km} km logged` : null
    get().toast('Trip saved!', 'success', { sub })
    set((s) => ({
      activeTrip: null,
      trackingActive: false,
      currentPath: [],
      trips: s.trips.map((t) => (t.id === updated.id ? updated : t)),
    }))
  },

  addPlace: async (place) => {
    await db.savePlace(place)
    const label = place.type === 'restaurant' ? 'Restaurant' : 'Destination'
    get().toast(`${place.name}`, 'success', { sub: label })
    set((s) => ({ places: [...s.places, place] }))
  },

  updatePlace: async (place) => {
    await db.savePlace(place)
    set((s) => ({ places: s.places.map((p) => (p.id === place.id ? place : p)) }))
  },

  deletePlace: async (id) => {
    await db.deletePlace(id)
    set((s) => ({ places: s.places.filter((p) => p.id !== id) }))
  },

  deleteTrip: async (id) => {
    await db.deleteTrip(id)
    set((s) => ({ trips: s.trips.filter((t) => t.id !== id), places: s.places.filter((p) => p.tripId !== id) }))
  },

  followRoute: (route) => {
    get().toast(route.name, 'route', { sub: 'Following route' })
    set({ followingRoute: route, activeTab: 'map' })
  },
  stopFollowing: () => set({ followingRoute: null }),
  setSelectedRoute: (route) => set({ selectedRoute: route }),
  setFlyToPlace: (place) => set({ flyToPlace: place }),
  saveOwnRoute: async (route) => {
    await db.saveRoute(route)
    get().toast('Route saved!', 'success', { sub: route.name })
    set((s) => ({ routes: [...s.routes, route] }))
  },
  importHealthTrips: async (newTrips) => {
    for (const t of newTrips) await db.saveTrip(t)
    set((s) => ({ trips: [...newTrips, ...s.trips] }))
  },
}))

function haversine(a, b) {
  const R = 6371e3
  const φ1 = (a.lat * Math.PI) / 180
  const φ2 = (b.lat * Math.PI) / 180
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180
  const x = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}
