import { config } from '../config.js'
import { fetchJSON, UpstreamError } from '../utils/http.js'
import { caches } from '../utils/cache.js'
import { logger } from '../utils/logger.js'

const SERP_BASE = 'https://serpapi.com/search'

function ensureKey() {
  if (!config.serpApiApiKey) {
    throw new UpstreamError('SerpApi key not configured on the server', { status: 503, upstream: 'serpapi', code: 'NO_KEY' })
  }
}

// Fetch Google Maps reviews for a place via SerpApi.
// Two supported inputs:
//   - query:     free-text search like "Mabry Mill Restaurant, VA"
//   - placeId:   Google place_id (preferred when caller already has one)
//   - lat,lng:   optional bias
//   - limit:     1..20 (SerpApi returns batches of ~10; we fetch up to 2 pages)
export async function getReviews({ query, placeId, lat, lng, limit = 10 }) {
  ensureKey()
  if (!query && !placeId) {
    throw new UpstreamError('Either "query" or "placeId" is required', { status: 400, upstream: 'serpapi', code: 'BAD_REQUEST' })
  }
  limit = Math.max(1, Math.min(20, Number(limit) || 10))

  const cacheKey = JSON.stringify({ query: (query || '').trim().toLowerCase(), placeId: placeId || null, lat, lng, limit })
  const cached = caches.reviews.get(cacheKey)
  if (cached) { logger.debug('serpapi reviews cache hit', { query, placeId }); return cached }

  // Step 1: resolve a SerpApi "place_id" via a Google Maps search.
  // SerpApi wants engine=google_maps with type=search first to get data_id,
  // then engine=google_maps_reviews for the reviews themselves.
  let dataId = placeId
  let placeInfo = null

  if (!dataId) {
    const searchParams = {
      engine: 'google_maps',
      type: 'search',
      q: query,
      api_key: config.serpApiApiKey,
      hl: 'en',
      gl: 'us',
    }
    if (typeof lat === 'number' && typeof lng === 'number') {
      searchParams.ll = `@${lat},${lng},15z`
    }
    const searchData = await fetchJSON(SERP_BASE, {
      timeoutMs: 9000,
      label: 'serpapi-maps-search',
      query: searchParams,
    })
    const top = searchData?.place_results
    if (!top) {
      const result = { reviews: [], place: null, count: 0, query: query || null, placeId: null, message: 'No matching place found on Google Maps.' }
      caches.reviews.set(cacheKey, result, config.cache.reviews)
      return result
    }
    dataId = top.data_id
    placeInfo = {
      title: top.title,
      address: top.address,
      rating: top.rating,
      reviews: top.reviews, // count of reviews
      price: top.price,
      type: top.type,
      thumbnail: top.thumbnail,
    }
  }

  // Step 2: pull reviews
  const reviewsParams = {
    engine: 'google_maps_reviews',
    place_id: dataId,
    api_key: config.serpApiApiKey,
    hl: 'en',
    gl: 'us',
    sort_by: 'newestFirst',
  }

  // Fetch up to 2 pages if needed to satisfy `limit`
  const collected = []
  let nextToken = null
  let pages = 0
  while (pages < 2 && collected.length < limit) {
    if (nextToken) reviewsParams.next_page_token = nextToken
    const data = await fetchJSON(SERP_BASE, {
      timeoutMs: 9000,
      label: 'serpapi-maps-reviews',
      query: reviewsParams,
    })
    const batch = Array.isArray(data?.reviews) ? data.reviews : []
    collected.push(...batch)
    nextToken = data?.serpapi_pagination?.next_page_token || null
    pages++
    if (!nextToken) break
  }

  const trimmed = collected.slice(0, limit).map((r) => ({
    author: r.user?.name || r.user?.link?.split('/').pop() || 'Anonymous',
    authorProfile: r.user?.link || null,
    authorThumbnail: r.user?.thumbnail || null,
    rating: typeof r.rating === 'number' ? r.rating : Number(r.rating) || null,
    date: r.date || r.iso_date || null,
    snippet: r.snippet || '',
    likes: r.likes ?? null,
    isLocalGuide: r.user?.reviews && r.user?.contributions ? true : false,
    photos: (r.images || []).map((img) => img.original || img.thumbnail).filter(Boolean),
  }))

  const result = {
    place: placeInfo,
    reviews: trimmed,
    count: trimmed.length,
    query: query || null,
    placeId: dataId,
  }

  caches.reviews.set(cacheKey, result, config.cache.reviews)
  logger.info('serpapi reviews ok', { query, placeId: dataId, count: trimmed.length })
  return result
}
