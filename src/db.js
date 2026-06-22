import { openDB } from 'idb'

const DB_NAME = 'same-old-roads'
const DB_VERSION = 1

let dbPromise

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('trips')) {
          const trips = db.createObjectStore('trips', { keyPath: 'id' })
          trips.createIndex('createdAt', 'createdAt')
        }
        if (!db.objectStoreNames.contains('places')) {
          const places = db.createObjectStore('places', { keyPath: 'id' })
          places.createIndex('type', 'type')
          places.createIndex('tripId', 'tripId')
        }
        if (!db.objectStoreNames.contains('routes')) {
          const routes = db.createObjectStore('routes', { keyPath: 'id' })
          routes.createIndex('createdAt', 'createdAt')
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }
      },
    })
  }
  return dbPromise
}

export async function getAllTrips() {
  const db = await getDB()
  return db.getAllFromIndex('trips', 'createdAt')
}

export async function getTrip(id) {
  const db = await getDB()
  return db.get('trips', id)
}

export async function saveTrip(trip) {
  const db = await getDB()
  await db.put('trips', trip)
}

export async function deleteTrip(id) {
  const db = await getDB()
  const places = await db.getAllFromIndex('places', 'tripId', id)
  const tx = db.transaction(['trips', 'places'], 'readwrite')
  await tx.objectStore('trips').delete(id)
  for (const p of places) await tx.objectStore('places').delete(p.id)
  await tx.done
}

export async function getAllPlaces() {
  const db = await getDB()
  return db.getAll('places')
}

export async function getPlacesByTrip(tripId) {
  const db = await getDB()
  return db.getAllFromIndex('places', 'tripId', tripId)
}

export async function savePlace(place) {
  const db = await getDB()
  await db.put('places', place)
}

export async function deletePlace(id) {
  const db = await getDB()
  await db.delete('places', id)
}

export async function getAllRoutes() {
  const db = await getDB()
  return db.getAll('routes')
}

export async function saveRoute(route) {
  const db = await getDB()
  await db.put('routes', route)
}

export async function deleteRoute(id) {
  const db = await getDB()
  await db.delete('routes', id)
}

export async function getSetting(key) {
  const db = await getDB()
  const row = await db.get('settings', key)
  return row?.value
}

export async function setSetting(key, value) {
  const db = await getDB()
  await db.put('settings', { key, value })
}
