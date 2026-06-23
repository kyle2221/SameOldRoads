import { useEffect, useMemo, useState } from 'react'
import { api, ApiError } from '../services/api'
import { formatRating, formatRelative } from '../utils/format'

// ReviewsPanel — fetches Google reviews via the backend's SerpApi proxy.
// Props:
//   query:    string  (free-text, e.g. "Nepenthe Big Sur")
//   placeId:  string  (Google place_id, optional)
//   lat,lng:  number  (optional bias)
//   limit:    number  (default 5)
//   compact:  bool    (smaller header)
export default function ReviewsPanel({ query, placeId, lat, lng, limit = 5, compact = false }) {
  const [state, setState] = useState({ loading: true, data: null, error: null })
  const [sort, setSort] = useState('newest') // 'newest' | 'highest' | 'lowest'

  useEffect(() => {
    let cancelled = false
    const ctrl = new AbortController()
    async function run() {
      setState({ loading: true, data: null, error: null })
      try {
        const data = await api.getReviews({ query, placeId, lat, lng, limit, signal: ctrl.signal })
        if (!cancelled) setState({ loading: false, data, error: null })
      } catch (e) {
        if (cancelled || e?.code === 'NETWORK_ABORTED') return
        if (e.name === 'ApiError' && e.message === 'Request cancelled') return
        setState({ loading: false, data: null, error: e })
      }
    }
    if (query || placeId) run()
    else setState({ loading: false, data: null, error: new ApiError('No query or placeId provided', { code: 'BAD_REQUEST' }) })
    return () => { cancelled = true; ctrl.abort() }
  }, [query, placeId, lat, lng, limit])

  const { reviews = [], place = null, count = 0, message, distribution, averageRating } = state.data || {}

  // Sort reviews — useMemo must run on every render, so it lives above the early returns
  const sorted = useMemo(() => {
    const arr = [...reviews]
    if (sort === 'highest') arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    else if (sort === 'lowest') arr.sort((a, b) => (a.rating ?? 5) - (b.rating ?? 5))
    // 'newest' = as-returned order (SerpApi already returns newestFirst)
    return arr
  }, [reviews, sort])

  if (state.loading) {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <Spinner />
        <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-mute)' }}>Fetching Google reviews…</div>
      </div>
    )
  }

  if (state.error) {
    return <ErrorState error={state.error} />
  }

  if (count === 0) {
    return (
      <div style={{ padding: 18, textAlign: 'center', color: 'var(--text-mute)', fontSize: 13, background: 'var(--surface-2)', borderRadius: 12 }}>
        {message || 'No Google reviews found for this place.'}
      </div>
    )
  }

  return (
    <div>
      {!compact && place && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, padding: '12px 14px', background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)' }}>
          {place.thumbnail && <img src={place.thumbnail} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{place.title || query}</div>
            <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{place.address}</div>
          </div>
          {place.rating != null && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--orange-deep)' }}>{formatRating(place.rating)}</div>
              <div style={{ fontSize: 10, color: 'var(--text-mute)' }}>{place.reviews ? `${place.reviews} reviews` : 'Google'}</div>
            </div>
          )}
        </div>
      )}

      {/* Rating distribution sparkline */}
      {distribution && (distribution.some((n) => n > 0)) && (
        <div style={{ marginBottom: 14, padding: '12px 14px', background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {averageRating != null && (
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--orange-deep)', lineHeight: 1 }}>{formatRating(averageRating)}</div>
                <div style={{ fontSize: 9, color: 'var(--text-mute)', marginTop: 3, fontWeight: 700, letterSpacing: 0.4 }}>AVG</div>
              </div>
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[5, 4, 3, 2, 1].map((stars) => {
                const n = distribution[stars - 1]
                const total = distribution.reduce((s, x) => s + x, 0) || 1
                const pct = Math.round((n / total) * 100)
                return (
                  <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-mute)', fontWeight: 600 }}>
                    <span style={{ width: 14, textAlign: 'right' }}>{stars}</span>
                    <span style={{ color: 'var(--orange)', fontSize: 9 }}>★</span>
                    <div style={{ flex: 1, height: 5, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #ff8a52, #ef5616)', borderRadius: 3, transition: 'width 0.4s' }} />
                    </div>
                    <span style={{ width: 22, textAlign: 'right', color: 'var(--text-mute)' }}>{n}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sort toggle */}
      {reviews.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {[
            ['newest', 'Newest'],
            ['highest', 'Highest'],
            ['lowest', 'Lowest'],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setSort(id)}
              style={{ padding: '5px 12px', borderRadius: 18, background: sort === id ? 'var(--orange-wash)' : 'var(--surface-2)', border: `1px solid ${sort === id ? 'var(--orange)' : 'var(--border)'}`, color: sort === id ? 'var(--orange-deep)' : 'var(--text-soft)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((r, i) => <ReviewCard key={i} review={r} />)}
      </div>
      <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-mute)', textAlign: 'center' }}>
        Reviews from Google via SerpApi · cached server-side
      </div>
    </div>
  )
}

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false)
  const stars = review.rating != null ? '★'.repeat(Math.round(review.rating)) + '☆'.repeat(5 - Math.round(review.rating)) : ''
  const longSnippet = (review.snippet?.length || 0) > 220
  return (
    <div style={{ padding: '13px 14px', background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)' }}>
      <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
        {review.authorThumbnail
          ? <img src={review.authorThumbnail} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
          : <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--orange-wash)', color: 'var(--orange-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>{(review.author || '?').slice(0, 1)}</div>
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{review.author}</div>
            {review.rating != null && <div style={{ fontSize: 11, color: 'var(--orange-deep)', fontWeight: 800, flexShrink: 0 }}>{stars}</div>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 1 }}>
            {review.date ? formatRelative(new Date(review.date).getTime()) : ''}
            {review.isLocalGuide && <span style={{ marginLeft: 6, background: 'var(--surface-2)', padding: '1px 6px', borderRadius: 4 }}>Local Guide</span>}
            {review.likes != null && review.likes > 0 && <span style={{ marginLeft: 6 }}>· 👍 {review.likes}</span>}
          </div>
          {review.snippet && (
            <div
              onClick={() => longSnippet && setExpanded((e) => !e)}
              style={{
                fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.55, marginTop: 7,
                cursor: longSnippet ? 'pointer' : 'default',
                display: expanded || !longSnippet ? 'block' : '-webkit-box',
                WebkitLineClamp: expanded ? undefined : 4,
                WebkitBoxOrient: expanded ? undefined : 'vertical',
                overflow: expanded ? 'visible' : 'hidden',
              }}
            >
              "{review.snippet}"
              {longSnippet && (
                <span style={{ color: 'var(--orange-deep)', fontWeight: 700, marginLeft: 4, fontSize: 11 }}>
                  {expanded ? 'less' : 'more'}
                </span>
              )}
            </div>
          )}
          {review.photos?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto' }}>
              {review.photos.slice(0, 4).map((p, i) => <img key={i} src={p} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ErrorState({ error }) {
  const isNoKey = error?.code === 'NO_KEY'
  const isUpstream = error?.upstream
  return (
    <div style={{ padding: '14px 16px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--orange-tint)', color: 'var(--text-soft)', fontSize: 13, lineHeight: 1.5 }}>
      <div style={{ fontWeight: 800, color: 'var(--orange-deep)', marginBottom: 4 }}>Couldn't load reviews</div>
      <div>{isNoKey ? 'SerpApi key not configured on the server.' : error.message || 'Unknown error.'}</div>
      {isUpstream && <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-mute)' }}>Source: {isUpstream} · Code: {error.code || 'UNKNOWN'}</div>}
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ width: 26, height: 26, margin: '0 auto', border: '3px solid var(--orange-tint)', borderTopColor: 'var(--orange)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  )
}
