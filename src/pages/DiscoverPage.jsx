import { useEffect, useRef, useState } from 'react'
import { api, ApiError, photoUrl } from '../services/api'
import { useStore } from '../store'
import { formatRating } from '../utils/format'
import { useDebounced } from '../hooks/useDebounced'
import ReviewsPanel from '../components/ReviewsPanel'
import { toast } from '../store/toast'
import { PageHeader, Skeleton, EmptyState, Tag } from '../components/ui'

export default function DiscoverPage() {
  const [q, setQ] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [useNearby, setUseNearby] = useState(false)
  const [userPos, setUserPos] = useState(null)
  const inputRef = useRef(null)
  const { addPlace } = useStore()

  const debouncedInput = useDebounced(q, 280)
  const [suggestions, setSuggestions] = useState([])
  const [showSug, setShowSug] = useState(false)
  const [sugLoading, setSugLoading] = useState(false)
  const sugCtrlRef = useRef(null)

  useEffect(() => {
    if (!useNearby) return
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { setUseNearby(false); toast.warn('Could not get your location. Continuing without nearby bias.') },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 8000 }
    )
  }, [useNearby])

  useEffect(() => {
    if (sugCtrlRef.current) { sugCtrlRef.current.abort(); sugCtrlRef.current = null }
    const input = debouncedInput.trim()
    if (input.length < 2) { setSuggestions([]); return }
    const ctrl = new AbortController()
    sugCtrlRef.current = ctrl
    setSugLoading(true)
    api.autocomplete({
      input,
      lat: useNearby ? userPos?.lat : undefined,
      lng: useNearby ? userPos?.lng : undefined,
      signal: ctrl.signal,
    })
      .then((data) => { if (!ctrl.signal.aborted) setSuggestions(data.suggestions || []) })
      .catch(() => { if (!ctrl.signal.aborted) setSuggestions([]) })
      .finally(() => { if (!ctrl.signal.aborted) setSugLoading(false) })
    return () => ctrl.abort()
  }, [debouncedInput, useNearby, userPos])

  async function runSearch(e, queryOverride) {
    e?.preventDefault?.()
    const query = (queryOverride ?? q).trim()
    if (!query) { inputRef.current?.focus(); return }
    setQ(query); setShowSug(false)
    setLoading(true); setError(null); setSelected(null); setSubmitted(query)
    try {
      const data = await api.searchPlaces({
        q: query,
        lat: useNearby ? userPos?.lat : undefined,
        lng: useNearby ? userPos?.lng : undefined,
        pageSize: 12,
      })
      setResults(data)
    } catch (e) {
      if (e instanceof ApiError) setError(e)
      else setError(new Error(e?.message || 'Unknown error'))
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  if (selected) {
    return <PlaceDetail place={selected} onBack={() => setSelected(null)} onAddPlace={addPlace} />
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <PageHeader title="Discover" subtitle="Search Google Places · read real reviews" variant="soft" />

      <form onSubmit={runSearch} style={{ padding: '0 16px 12px' }}>
        <div style={{ position: 'relative', marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setShowSug(true) }}
                onFocus={() => setShowSug(true)}
                onBlur={() => setTimeout(() => setShowSug(false), 180)}
                placeholder="Best tacos near Big Sur…"
                autoComplete="off"
                style={{
                  width: '100%', padding: '14px 16px 14px 44px', borderRadius: 14,
                  background: 'var(--surface)', border: '1.5px solid var(--border)',
                  color: 'var(--text)', fontSize: 15, outline: 'none',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
              />
              <span style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.5 }}>🔍</span>
              {sugLoading && (
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, border: '2px solid var(--orange-tint)', borderTopColor: 'var(--orange)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              )}
            </div>
            <button type="submit" disabled={loading} className="pressable" style={{
              padding: '0 20px', borderRadius: 14,
              background: 'linear-gradient(135deg, #ff8a52, #ef5616)',
              border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', boxShadow: 'var(--shadow-orange)',
              fontFamily: 'var(--font-display)',
            }}>
              {loading ? '…' : 'Search'}
            </button>
          </div>

          {/* Autocomplete dropdown */}
          {showSug && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 16, boxShadow: 'var(--shadow-pop)',
              maxHeight: 340, overflowY: 'auto', zIndex: 100,
              animation: 'fadeInDown 0.16s ease-out',
            }}>
              {suggestions.map((s, i) => (
                <button
                  key={s.placeId || i}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setShowSug(false); runSearch(undefined, s.text) }}
                  className="pressable"
                  style={{
                    width: '100%', textAlign: 'left', padding: '11px 14px',
                    background: 'none', border: 'none',
                    borderBottom: i === suggestions.length - 1 ? 'none' : '1px solid var(--border-soft)',
                    cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, background: 'var(--orange-wash)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
                  }}>📍</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.mainText}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.secondaryText}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 12, color: 'var(--text-soft)', cursor: 'pointer', userSelect: 'none' }}>
          <input type="checkbox" checked={useNearby} onChange={(e) => setUseNearby(e.target.checked)} style={{ accentColor: 'var(--orange)', width: 16, height: 16 }} />
          Search near my current location
          {useNearby && userPos && <span style={{ color: 'var(--text-mute)' }}>· using your GPS</span>}
        </label>
      </form>

      <div style={{ padding: '0 16px 24px' }}>
        {loading && <LoadingSkeleton />}

        {!loading && error && <ErrorCard error={error} />}

        {!loading && !error && !results && <Suggestions onPick={(s) => { setQ(s); setTimeout(() => runSearch(undefined, s), 0) }} />}

        {!loading && !error && results && results.count === 0 && (
          <EmptyState
            icon="🔍"
            title="No matches found"
            message={`No places matched "${submitted}". Try a different search.`}
          />
        )}

        {!loading && !error && results && results.count > 0 && (
          <>
            <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 14, fontWeight: 600, fontFamily: 'var(--font-display)' }}>
              {results.count} result{results.count !== 1 ? 's' : ''} for "{submitted}"
            </div>
            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {results.places.map((p, i) => (
                <div key={p.id} style={{ '--i': i }}>
                  <PlaceResultCard place={p} onTap={() => setSelected(p)} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div style={{ height: 24 }} />
    </div>
  )
}

function PlaceResultCard({ place, onTap }) {
  const photo = place.photoRef ? photoUrl(place.photoRef, { maxWidthPx: 200, maxHeightPx: 200 }) : null
  return (
    <button onClick={onTap} className="pressable" style={{
      width: '100%', textAlign: 'left', background: 'var(--surface)',
      borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)',
      padding: 0, display: 'flex', cursor: 'pointer', alignItems: 'stretch', overflow: 'hidden',
    }}>
      {photo ? (
        <img src={photo} alt="" loading="lazy" style={{ width: 82, flexShrink: 0, objectFit: 'cover', background: 'var(--surface-2)' }} />
      ) : (
        <div style={{ width: 82, flexShrink: 0, background: 'var(--orange-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📍</div>
      )}
      <div style={{ flex: 1, minWidth: 0, padding: 14 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-display)' }}>{place.name}</div>
          {place.rating != null && (
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange-deep)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>★ {formatRating(place.rating)}</div>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 3, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{place.address}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {place.type && <Tag>{place.type}</Tag>}
          {place.reviewCount != null && <Tag>{place.reviewCount} reviews</Tag>}
          {place.status && place.status !== 'OPERATIONAL' && <Tag color="red">{place.status}</Tag>}
        </div>
      </div>
    </button>
  )
}

function PlaceDetail({ place, onBack, onAddPlace }) {
  const [details, setDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(true)
  const [detailsErr, setDetailsErr] = useState(null)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [placeType, setPlaceType] = useState('restaurant')

  useEffect(() => {
    let cancelled = false
    setLoadingDetails(true); setDetailsErr(null)
    api.getPlaceDetails(place.id)
      .then((d) => { if (!cancelled) setDetails(d) })
      .catch((e) => { if (!cancelled) setDetailsErr(e) })
      .finally(() => { if (!cancelled) setLoadingDetails(false) })
    return () => { cancelled = true }
  }, [place.id])

  async function handleAdd() {
    setAdding(true)
    const newPlace = {
      id: crypto.randomUUID(), name: place.name, type: placeType,
      lat: place.lat, lng: place.lng,
      notes: details?.editorialSummary || place.address || '',
      googlePlaceId: place.id, rating: place.rating, googleMapsUri: place.mapsUri,
      tripId: null, createdAt: Date.now(),
    }
    await onAddPlace(newPlace)
    setAdding(false); setAdded(true)
    toast.success('Saved to your places')
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }} className="fade-in">
      {/* Hero header */}
      <div style={{
        padding: '70px 20px 22px',
        background: 'linear-gradient(165deg, #0a0300 0%, #a03208 65%, #ef5616 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <button onClick={onBack} className="pressable" style={{
          position: 'absolute', top: 50, left: 16,
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12,
          color: '#fff', width: 38, height: 38, fontSize: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>←</button>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-display)' }}>{place.type || 'Place'}</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 26, color: '#fff', fontWeight: 700, letterSpacing: -0.7, lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>{place.name}</h2>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{place.address}</div>
          {(place.rating != null || place.reviewCount != null) && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {place.rating != null && <Pill>★ {formatRating(place.rating)}</Pill>}
              {place.reviewCount != null && <Pill>{place.reviewCount} reviews</Pill>}
            </div>
          )}
        </div>
      </div>

      {/* Photo gallery */}
      {details && details.photos?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, padding: '14px 16px 0', overflowX: 'auto' }}>
          {details.photos.slice(0, 6).map((ph, i) => (
            <img key={i} src={photoUrl(ph.ref, { maxWidthPx: 400, maxHeightPx: 300 })} alt="" loading="lazy"
              style={{ width: 180, height: 130, borderRadius: 14, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
            />
          ))}
        </div>
      )}

      <div style={{ padding: '20px 16px' }}>
        {/* Save block */}
        <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 14, border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)', marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 10, fontFamily: 'var(--font-display)' }}>Save to my places</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {['restaurant', 'destination'].map((t) => (
              <button key={t} onClick={() => setPlaceType(t)} className="pressable" style={{
                flex: 1, padding: '9px 0', borderRadius: 10,
                background: placeType === t ? 'var(--orange-wash)' : 'var(--surface-2)',
                border: `1.5px solid ${placeType === t ? 'var(--orange)' : 'var(--border)'}`,
                color: placeType === t ? 'var(--orange-deep)' : 'var(--text-soft)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
                {t === 'restaurant' ? '🍽️ Restaurant' : '📍 Destination'}
              </button>
            ))}
          </div>
          <button onClick={handleAdd} disabled={adding || added} className="pressable" style={{
            width: '100%', padding: '11px', borderRadius: 11,
            background: added ? 'var(--surface-2)' : 'linear-gradient(135deg, #ff8a52, #ef5616)',
            border: added ? '1px solid var(--border)' : 'none',
            color: added ? 'var(--text-soft)' : '#fff',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'var(--font-display)',
          }}>
            {added ? '✓ Saved' : adding ? 'Saving…' : '+ Save to My Places'}
          </button>
        </div>

        {/* Details */}
        {loadingDetails && <div style={{ fontSize: 13, color: 'var(--text-mute)', padding: 12, textAlign: 'center' }}>Loading place details…</div>}
        {detailsErr && <div style={{ fontSize: 12, color: 'var(--text-mute)', padding: 12, textAlign: 'center' }}>Couldn't load full details: {detailsErr.message}</div>}
        {details && !loadingDetails && (
          <div style={{ marginBottom: 22 }}>
            {details.openNow != null && (
              <div style={{ marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: details.openNow ? 'var(--green-wash)' : 'var(--red-wash)', border: `1px solid ${details.openNow ? '#bbf7d0' : '#fecaca'}`, fontSize: 12, fontWeight: 700, color: details.openNow ? 'var(--green)' : 'var(--red)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: details.openNow ? 'var(--green)' : 'var(--red)' }} />
                {details.openNow ? 'Open now' : 'Closed now'}
                {details.todayHours && <span style={{ color: 'var(--text-mute)', fontWeight: 500, marginLeft: 4 }}>· {details.todayHours}</span>}
              </div>
            )}
            {details.editorialSummary && (
              <div style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.6, marginBottom: 14, fontStyle: 'italic' }}>{details.editorialSummary}</div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {details.phone && <DetailCell icon="📞" label="Phone" value={details.phone} href={`tel:${details.phone.replace(/[^+\d]/g, '')}`} />}
              {details.website && <DetailCell icon="🔗" label="Website" value={details.website.replace(/^https?:\/\//, '').replace(/\/$/, '')} href={details.website} />}
              {details.openingHours && details.openingHours.length > 0 && <DetailCell icon="🕒" label="Hours today" value={details.openingHours[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]} />}
              {details.priceLevel != null && <DetailCell icon="💰" label="Price" value={'$'.repeat(details.priceLevel) || '—'} />}
            </div>
            {place.mapsUri && (
              <a href={place.mapsUri} target="_blank" rel="noreferrer" className="pressable" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, padding: '11px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>
                <span>🗺️</span> Open in Google Maps
              </a>
            )}
          </div>
        )}

        {/* Reviews */}
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 10, letterSpacing: -0.3, fontFamily: 'var(--font-display)' }}>Google Reviews</div>
        <ReviewsPanel query={place.name} placeId={place.id} lat={place.lat} lng={place.lng} limit={5} />
        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}

function Pill({ children }) {
  return <span style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, backdropFilter: 'blur(6px)' }}>{children}</span>
}

function DetailCell({ icon, label, value, href }) {
  const content = (
    <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 10, color: 'var(--text-mute)', fontWeight: 700, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{icon} {label}</div>
      <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
    </div>
  )
  return href ? <a href={href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>{content}</a> : content
}

function Suggestions({ onPick }) {
  const ideas = ['Best coffee in Sedona', 'Tacos near Austin TX', 'Scenic overlooks Blue Ridge', 'Wineries Napa Valley', 'Breweries Portland ME', 'Diners Route 66']
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 11, color: 'var(--text-mute)', fontWeight: 700, marginBottom: 10, letterSpacing: 0.4, textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>Try searching for…</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ideas.map((s) => (
          <button key={s} onClick={() => onPick(s)} className="pressable" style={{
            padding: '8px 14px', borderRadius: 20, background: 'var(--surface)',
            border: '1px solid var(--border)', color: 'var(--text-soft)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>{s}</button>
        ))}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 8 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', padding: 0, display: 'flex', overflow: 'hidden' }}>
          <Skeleton width={82} height={84} radius={0} />
          <div style={{ flex: 1, padding: 14 }}>
            <Skeleton width="55%" height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="90%" height={10} />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorCard({ error }) {
  const isNoKey = error?.code === 'NO_KEY'
  return (
    <div style={{ padding: 16, background: 'var(--red-wash)', border: '1px solid var(--orange-tint)', borderRadius: 14, color: 'var(--text-soft)', fontSize: 13, lineHeight: 1.5 }}>
      <div style={{ fontWeight: 700, color: 'var(--orange-deep)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>Search failed</div>
      <div>{isNoKey ? 'Google Maps API key not configured on the server.' : (error?.message || 'Unknown error')}</div>
      {error?.upstream && <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-mute)' }}>Upstream: {error.upstream} · Code: {error.code || 'UNKNOWN'}</div>}
      <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-mute)' }}>Make sure the backend is running on <code>VITE_API_BASE</code> and that the API key is set in <code>server/.env</code>.</div>
    </div>
  )
}
