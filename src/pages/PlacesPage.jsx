import { useState, useEffect } from 'react'
import { useStore } from '../store'
import {
  IconSearch, IconUtensils, IconPin, IconStar, IconEdit, IconTrash, IconCheck, IconX,
  IconCompass, IconPhone, IconGlobe, IconExternalLink, IconClock, IconChevronDown, IconChevronUp,
  IconHeart, IconCamera,
} from '../components/Icons'
import { fetchPlaceReviews } from '../utils/reviews'
import Reveal from '../components/Reveal'

export default function PlacesPage() {
  const { places, updatePlace, deletePlace, setFlyToPlace, setTab } = useStore()
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [editData, setEditData] = useState({})
  const [search, setSearch] = useState('')

  const filtered = places.filter(p => {
    if (filter !== 'all' && p.type !== filter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function startEdit(place) {
    setEditing(place.id)
    setEditData({ name: place.name, notes: place.notes || '', type: place.type })
  }

  async function saveEdit() {
    await updatePlace({ ...places.find(p => p.id === editing), ...editData })
    setEditing(null)
  }

  const restaurants = places.filter(p => p.type === 'restaurant')
  const destinations = places.filter(p => p.type === 'destination')

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        padding: '54px 20px 56px',
        background: 'linear-gradient(170deg, #0e0500 0%, #1e0a02 45%, #7a2606 80%, #c43d0c 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,60,0.2), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,200,140,0.6)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Rajdhani', sans-serif" }}>Saved</div>
          <h1 style={{ margin: '0 0 6px', fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: -0.5, lineHeight: 1, fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}>My Places</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,220,180,0.55)', fontWeight: 500 }}>
            {restaurants.length} restaurants · {destinations.length} destinations
          </p>
        </div>
      </div>

      <div className="hero-to-content">
        {/* Search */}
        <div style={{ padding: '20px 16px 12px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
              <IconSearch size={16} color="var(--text-mute)" sw={2} />
            </div>
            <input
              className="input-field"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search places..."
              style={{
                width: '100%', padding: '13px 16px 13px 42px', borderRadius: 14,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                color: 'var(--text)', fontSize: 15,
              }}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', margin: '0 16px 16px', background: 'var(--sunk)', borderRadius: 14, padding: 4, gap: 4 }}>
          {[
            { id: 'all',         label: 'All',   Icon: null },
            { id: 'restaurant',  label: 'Food',  Icon: IconUtensils },
            { id: 'destination', label: 'Spots', Icon: IconPin },
          ].map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setFilter(id)} style={{
              flex: 1, padding: '10px 0', borderRadius: 11,
              background: filter === id ? '#fff' : 'transparent',
              border: 'none', color: filter === id ? 'var(--orange-deep)' : 'var(--text-soft)',
              fontSize: 13, fontWeight: filter === id ? 800 : 600, cursor: 'pointer',
              boxShadow: filter === id ? 'var(--shadow-soft)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}>
              {Icon && <Icon size={13} color={filter === id ? 'var(--orange-deep)' : 'var(--text-soft)'} sw={2} />}
              {label}
            </button>
          ))}
        </div>

        {/* Places list */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-mute)' }}>
              {search
                ? <IconSearch size={40} color="rgba(0,0,0,0.18)" />
                : <IconStar size={40} color="rgba(0,0,0,0.18)" />
              }
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 16, marginBottom: 8, fontFamily: "'Rajdhani', sans-serif" }}>
                {search ? 'No matches found' : 'No places saved yet'}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: search ? 0 : 24 }}>
                {search ? 'Try a different search term.' : 'Start a trip and tap the map to pin restaurants and destinations.'}
              </div>
              {!search && (
                <button onClick={() => setTab('map')} style={{
                  padding: '13px 28px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #ff8a52, #fc4c02)', border: 'none',
                  color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 5px 18px rgba(252,76,2,0.36)',
                  fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  Go to Map →
                </button>
              )}
            </div>
          )}
          {filtered.map((place, i) => (
            <Reveal key={place.id} delay={Math.min(i, 6) * 55}>
              <PlaceCard
                place={place}
                editing={editing === place.id}
                editData={editData}
                setEditData={setEditData}
                onEdit={() => startEdit(place)}
                onSave={saveEdit}
                onCancel={() => setEditing(null)}
                onDelete={() => deletePlace(place.id)}
                onShowMap={() => { setFlyToPlace(place); setTab('map') }}
              />
            </Reveal>
          ))}
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}

function StarRow({ rating, count }) {
  if (!rating) return null
  const full = Math.floor(rating), half = rating % 1 >= 0.5
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24"
          fill={i <= full ? '#f59e0b' : i === full + 1 && half ? 'url(#half)' : 'none'}
          stroke="#f59e0b" strokeWidth="2">
          <defs>
            <linearGradient id="half"><stop offset="50%" stopColor="#f59e0b" /><stop offset="50%" stopColor="transparent" /></linearGradient>
          </defs>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
      <span style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b' }}>{rating.toFixed(1)}</span>
      {count && <span style={{ fontSize: 11, color: 'var(--text-mute)', fontWeight: 500 }}>({count.toLocaleString()})</span>}
    </div>
  )
}

function MiniStars({ rating }) {
  if (!rating) return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="10" height="10" viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#f59e0b' : 'none'}
          stroke="#f59e0b" strokeWidth="2">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </span>
  )
}

function ReviewCard({ review }) {
  return (
    <div style={{
      background: 'var(--surface-2)', borderRadius: 14, padding: '12px 14px',
      border: '1px solid var(--border-soft)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
        {review.avatar
          ? <img src={review.avatar} alt={review.author} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
          : <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #ff8a52, #fc4c02)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 800, color: '#fff' }}>
              {(review.author || '?')[0].toUpperCase()}
            </div>
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{review.author}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
            <MiniStars rating={review.rating} />
            {review.date && <span style={{ fontSize: 10, color: 'var(--text-mute)' }}>{review.date}</span>}
          </div>
        </div>
        {review.likes > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <IconHeart size={11} color="var(--text-mute)" sw={1.5} />
            <span style={{ fontSize: 10, color: 'var(--text-mute)' }}>{review.likes}</span>
          </div>
        )}
      </div>
      {review.text && (
        <div style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          "{review.text}"
        </div>
      )}
    </div>
  )
}

function PlaceCard({ place, editing, editData, setEditData, onEdit, onSave, onCancel, onDelete, onShowMap }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [review, setReview] = useState(place.google || null)
  const [loading, setLoading] = useState(!place.google)
  const [showReviews, setShowReviews] = useState(false)
  const PlaceIcon = place.type === 'restaurant' ? IconUtensils : IconPin

  useEffect(() => {
    let cancelled = false
    setLoading(!place.google)
    // Live Google data via SerpApi proxy; fall back to any embedded demo data
    // so the feature is fully visible even with no key / offline.
    fetchPlaceReviews(place.name, place.lat, place.lng).then(r => {
      if (cancelled) return
      setReview(r || place.google || null)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [place.name, place.lat, place.lng, place.google])

  if (editing) {
    return (
      <div style={{ background: 'var(--surface)', borderRadius: 20, padding: 16, border: '1.5px solid var(--orange)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[
            { t: 'restaurant',  Icon: IconUtensils, label: 'Restaurant'  },
            { t: 'destination', Icon: IconPin,       label: 'Destination' },
          ].map(({ t, Icon, label }) => (
            <button key={t} onClick={() => setEditData(d => ({ ...d, type: t }))} style={{
              flex: 1, padding: '9px 0', borderRadius: 10,
              background: editData.type === t ? 'var(--orange-wash)' : 'var(--surface-2)',
              border: `1.5px solid ${editData.type === t ? 'var(--orange)' : 'var(--border)'}`,
              color: editData.type === t ? 'var(--orange-deep)' : 'var(--text-soft)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Icon size={14} color={editData.type === t ? 'var(--orange-deep)' : 'var(--text-soft)'} sw={2} />
              {label}
            </button>
          ))}
        </div>
        <input className="input-field" value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
          style={{ width: '100%', padding: '11px 12px', borderRadius: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, marginBottom: 8 }} />
        <textarea className="input-field" value={editData.notes} onChange={e => setEditData(d => ({ ...d, notes: e.target.value }))}
          placeholder="Notes..."
          style={{ width: '100%', padding: '11px 12px', borderRadius: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, resize: 'none', height: 70, marginBottom: 10 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 11, borderRadius: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-soft)', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <IconX size={14} color="var(--text-soft)" sw={2} />
            Cancel
          </button>
          <button onClick={onSave} style={{ flex: 1, padding: 11, borderRadius: 11, background: 'linear-gradient(135deg, #ff8a52, #ef5616)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <IconCheck size={14} color="#fff" sw={2.5} />
            Save
          </button>
        </div>
      </div>
    )
  }

  const hasReviewsList = review?.reviewsList?.length > 0
  const hasPhotos = review?.photos?.length > 0

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-soft)' }}>
      {/* Photo strip — priority: saved place photo > Google photos */}
      {(place.photo || hasPhotos) && (
        <div style={{ position: 'relative', height: 150, overflow: 'hidden', background: '#0e0e0e' }}>
          {hasPhotos && !place.photo && (
            <div style={{ display: 'flex', height: '100%' }}>
              {review.photos.slice(0, 3).map((url, i) => (
                <img key={i} src={url} alt="" style={{ flex: 1, objectFit: 'cover', borderRight: i < 2 ? '2px solid var(--bg)' : 'none' }}
                  onError={e => { e.target.style.display = 'none' }} />
              ))}
            </div>
          )}
          {place.photo && (
            <img src={place.photo} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.45) 100%)', pointerEvents: 'none' }} />
          {/* Google photos badge */}
          {hasPhotos && !place.photo && (
            <div style={{ position: 'absolute', bottom: 10, right: 12, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '3px 9px' }}>
              <IconCamera size={11} color="rgba(255,255,255,0.9)" sw={2} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Google</span>
            </div>
          )}
        </div>
      )}

      {/* Accent bar + main content */}
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: 4, flexShrink: 0, background: place.type === 'restaurant' ? 'linear-gradient(180deg, #ff8a52, #ef5616)' : 'linear-gradient(180deg, #7c9cf8, #4f6ef7)' }} />
        <div style={{ flex: 1, padding: '14px 15px 12px', overflow: 'hidden' }}>

          {/* Name + type badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--orange-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PlaceIcon size={20} color="var(--orange-deep)" sw={1.8} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', lineHeight: 1.15 }}>{place.name}</div>
                {/* Category · price — always visible when known */}
                {(review?.category || review?.price) && (
                  <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2, fontWeight: 600 }}>
                    {[review.category, review.price].filter(Boolean).join(' · ')}
                  </div>
                )}
                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                    <span className="rev-pulse" style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--orange-light)' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>Fetching Google data…</span>
                  </div>
                )}
                {!loading && review && !review.rating && (
                  <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 1 }}>No Google listing found</div>
                )}
              </div>
            </div>
            <span style={{ fontSize: 9, background: place.type === 'restaurant' ? 'rgba(252,76,2,0.1)' : 'rgba(79,110,247,0.1)', borderRadius: 6, padding: '3px 8px', color: place.type === 'restaurant' ? 'var(--orange-deep)' : '#4f6ef7', flexShrink: 0, marginLeft: 8, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {place.type === 'restaurant' ? 'Food' : 'Spot'}
            </span>
          </div>

          {/* Star rating row — always shown when rating exists */}
          {review?.rating && (
            <div style={{ paddingLeft: 49 }}>
              <StarRow rating={review.rating} count={review.reviews} />
            </div>
          )}

          {/* Meta info row */}
          <div style={{ paddingLeft: 49, display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
            {review?.hours && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconClock size={12} color="var(--text-mute)" sw={2} />
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: review.hours.toLowerCase().includes('open') ? '#22c55e'
                    : review.hours.toLowerCase().includes('closed') ? '#ef4444'
                    : 'var(--text-soft)',
                }}>{review.hours}</span>
              </div>
            )}
            {review?.address && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <IconPin size={12} color="var(--text-mute)" sw={2} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 11, color: 'var(--text-mute)', lineHeight: 1.4 }}>{review.address}</span>
              </div>
            )}
            {review?.phone && (
              <a href={`tel:${review.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                <IconPhone size={12} color="var(--orange-deep)" sw={2} />
                <span style={{ fontSize: 11, color: 'var(--orange-deep)', fontWeight: 600 }}>{review.phone}</span>
              </a>
            )}
            {review?.website && (
              <a href={review.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                <IconGlobe size={12} color="var(--orange-deep)" sw={2} />
                <span style={{ fontSize: 11, color: 'var(--orange-deep)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                  {review.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                </span>
                <IconExternalLink size={10} color="var(--orange-deep)" sw={2} />
              </a>
            )}
          </div>

          {/* User notes */}
          {place.notes && (
            <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 8, marginLeft: 49, lineHeight: 1.5, paddingTop: 8, borderTop: '1px solid var(--border-soft)' }}>{place.notes}</div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
            <button onClick={onShowMap} style={{ ...smallBtn, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--orange-deep)', borderColor: 'var(--orange-tint)', background: 'var(--orange-wash)' }}>
              <IconCompass size={12} color="var(--orange-deep)" sw={2} />
              Map
            </button>
            {hasReviewsList && (
              <button onClick={() => setShowReviews(v => !v)} style={{ ...smallBtn, display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.07)' }}>
                <IconStar size={12} color="#f59e0b" sw={2} />
                Reviews
                {showReviews
                  ? <IconChevronUp size={11} color="#f59e0b" sw={2} />
                  : <IconChevronDown size={11} color="#f59e0b" sw={2} />
                }
              </button>
            )}
            <button onClick={onEdit} style={{ ...smallBtn, display: 'flex', alignItems: 'center', gap: 4 }}>
              <IconEdit size={12} color="var(--text-soft)" sw={2} />
              Edit
            </button>
            {confirmDelete ? (
              <>
                <button onClick={() => onDelete()} style={{ ...smallBtn, background: 'var(--orange)', borderColor: 'var(--orange)', color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconTrash size={12} color="#fff" sw={2} />
                  Confirm
                </button>
                <button onClick={() => setConfirmDelete(false)} style={smallBtn}>Cancel</button>
              </>
            ) : (
              <button onClick={() => setConfirmDelete(true)} style={{ ...smallBtn, color: '#ef4444', borderColor: 'rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <IconTrash size={12} color="#ef4444" sw={1.8} />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Google Reviews expansion */}
      {showReviews && hasReviewsList && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border-soft)', paddingTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-mute)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#4285f4" stroke="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34a853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fbbc05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ea4335" />
            </svg>
            Google Reviews
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {review.reviewsList.map((r, i) => <ReviewCard key={i} review={r} />)}
          </div>
        </div>
      )}
    </div>
  )
}

const smallBtn = {
  padding: '6px 11px', borderRadius: 9, background: 'var(--surface-2)',
  border: '1px solid var(--border)', color: 'var(--text-soft)',
  fontSize: 12, fontWeight: 600, cursor: 'pointer',
}
