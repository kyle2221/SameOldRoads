import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { IconSearch, IconUtensils, IconPin, IconStar, IconEdit, IconTrash, IconCheck, IconX, IconCompass } from '../components/Icons'
import { fetchPlaceReviews } from '../utils/reviews'

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
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 11 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-mute)' }}>
              {search
                ? <IconSearch size={40} color="rgba(0,0,0,0.18)" />
                : <IconStar size={40} color="rgba(0,0,0,0.18)" />
              }
              <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 12 }}>
                {search ? 'No places match your search.' : 'No places saved yet. Tap the map while tracking to add one!'}
              </div>
            </div>
          )}
          {filtered.map(place => (
            <PlaceCard
              key={place.id}
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= full ? '#f59e0b' : i === full + 1 && half ? 'url(#half)' : 'none'} stroke="#f59e0b" strokeWidth="2">
          <defs>
            <linearGradient id="half"><stop offset="50%" stopColor="#f59e0b" /><stop offset="50%" stopColor="transparent" /></linearGradient>
          </defs>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
      <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>{rating.toFixed(1)}</span>
      {count && <span style={{ fontSize: 11, color: 'var(--text-mute)', fontWeight: 500 }}>({count.toLocaleString()} reviews)</span>}
    </div>
  )
}

function PlaceCard({ place, editing, editData, setEditData, onEdit, onSave, onCancel, onDelete, onShowMap }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [review, setReview]               = useState(null)
  const PlaceIcon = place.type === 'restaurant' ? IconUtensils : IconPin

  useEffect(() => {
    let cancelled = false
    fetchPlaceReviews(place.name, place.lat, place.lng).then(r => { if (!cancelled) setReview(r) })
    return () => { cancelled = true }
  }, [place.name, place.lat, place.lng])

  if (editing) {
    return (
      <div style={{ background: 'var(--surface)', borderRadius: 18, padding: 16, border: '1.5px solid var(--orange)', boxShadow: 'var(--shadow-card)' }}>
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

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--border)', overflow: 'hidden' }}>
      {place.photo && (
        <img src={place.photo} alt={place.name} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
      )}
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: 4, flexShrink: 0, background: place.type === 'restaurant' ? 'linear-gradient(180deg, #ff8a52, #ef5616)' : 'linear-gradient(180deg, #7c9cf8, #4f6ef7)' }} />
        <div style={{ flex: 1, padding: '14px 15px', display: 'flex', gap: 13 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--orange-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PlaceIcon size={22} color="var(--orange-deep)" sw={1.8} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>{place.name}</div>
              <span style={{ fontSize: 9, background: 'var(--sunk)', borderRadius: 6, padding: '2px 8px', color: 'var(--text-soft)', flexShrink: 0, marginLeft: 8, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                {place.type}
              </span>
            </div>
            <StarRow rating={review?.rating} count={review?.reviews} />
            {review?.address && (
              <div style={{ fontSize: 11, color: 'var(--text-mute)', marginBottom: 4, fontWeight: 500 }}>{review.address}</div>
            )}
            {place.notes ? (
              <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 10, lineHeight: 1.5 }}>{place.notes}</div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-mute)', marginBottom: 10, fontStyle: 'italic' }}>No notes yet</div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={onShowMap} style={{ ...smallBtn, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--orange-deep)', borderColor: 'var(--orange-tint)' }}>
                <IconCompass size={12} color="var(--orange-deep)" sw={2} />
                Map
              </button>
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
                <button onClick={() => setConfirmDelete(true)} style={{ ...smallBtn, color: 'var(--orange-deep)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconTrash size={12} color="var(--orange-deep)" sw={1.8} />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const smallBtn = {
  padding: '6px 12px', borderRadius: 9, background: 'var(--surface-2)',
  border: '1px solid var(--border)', color: 'var(--text-soft)',
  fontSize: 12, fontWeight: 600, cursor: 'pointer',
}
