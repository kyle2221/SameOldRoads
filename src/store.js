import { create } from 'zustand'
import * as db from './db'
import { SAMPLE_ROUTES } from './utils/sampleData'

export const useStore = create((set, get) => ({
  trips: [],
  places: [],
  routes: [],
  activeTrip: null,
  activeTab: 'home',
  trackingActive: false,
  currentPath: [],
  selectedRoute: null,
  followingRoute: null,

  loadAll: async () => {
    const [trips, places, routes] = await Promise.all([
      db.getAllTrips(),
      db.getAllPlaces(),
      db.getAllRoutes(),
    ])
    // seed sample routes if none
    let finalRoutes = routes
    if (routes.length === 0) {
      for (const r of SAMPLE_ROUTES) await db.saveRoute(r)
      finalRoutes = SAMPLE_ROUTES
    }
    set({ trips, places, routes: finalRoutes })
  },

  setTab: (tab) => set({ activeTab: tab }),

  startTrip: async (name) => {
    const trip = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      path: [],
      distance: 0,
      duration: 0,
      startTime: Date.now(),
    }
    await db.saveTrip(trip)
    set((s) => ({ trips: [trip, ...s.trips], activeTrip: trip, trackingActive: true, currentPath: [] }))
    return trip
  },

  appendPathPoint: async (latlng) => {
    const { activeTrip, currentPath } = get()
    if (!activeTrip) return
    const newPath = [...currentPath, latlng]
    let dist = activeTrip.distance
    if (newPath.length > 1) {
      const prev = newPath[newPath.length - 2]
      dist += haversine(prev, latlng)
    }
    const updated = { ...activeTrip, path: newPath, distance: dist }
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
    const updated = {
      ...activeTrip,
      path: currentPath,
      duration: now - activeTrip.startTime,
      endTime: now,
    }
    await db.saveTrip(updated)
    set((s) => ({
      activeTrip: null,
      trackingActive: false,
      currentPath: [],
      trips: s.trips.map((t) => (t.id === updated.id ? updated : t)),
    }))
  },

  addPlace: async (place) => {
    await db.savePlace(place)
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

  followRoute: (route) => set({ followingRoute: route, activeTab: 'map' }),
  stopFollowing: () => set({ followingRoute: null }),
  setSelectedRoute: (route) => set({ selectedRoute: route }),
  saveOwnRoute: async (route) => {
    await db.saveRoute(route)
    set((s) => ({ routes: [...s.routes, route] }))
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
