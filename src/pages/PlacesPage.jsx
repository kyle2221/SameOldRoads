import { useState } from 'react'
import { useStore } from '../store'

export default function PlacesPage() {
  const { places, updatePlace, deletePlace } = useStore()
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
        padding: '54px 20px 22px',
        background: 'linear-gradient(180deg, #ffd0aa 0%, #ffe4d0 42%, #ffffff 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,60,0.45), transparent)' }} />
        <h1 style={{ margin: '0 0 5px', fontSize: 30, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.8, position: 'relative' }}>My Places</h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-soft)', position: 'relative' }}>
          {restaurants.length} restaurants · {destinations.length} destinations
        </p>
      </div>

      {/* Search */}
      <div style={{ padding: '16px 16px 12px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search places..."
          style={{
            width: '100%', padding: '13px 16px', borderRadius: 14,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            color: 'var(--text)', fontSize: 15, outline: 'none',
          }}
        />
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', margin: '0 16px 16px', background: 'var(--sunk)', borderRadius: 14, padding: 4, gap: 4 }}>
        {[['all', 'All'], ['restaurant', '🍽️ Food'], ['destination', '📍 Spots']].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} style={{
            flex: 1, padding: '10px 0', borderRadius: 11,
            background: filter === id ? '#fff' : 'transparent',
            border: 'none', color: filter === id ? 'var(--orange-deep)' : 'var(--text-soft)',
            fontSize: 13, fontWeight: filter === id ? 800 : 600, cursor: 'pointer',
            boxShadow: filter === id ? 'var(--shadow-soft)' : 'none',
          }}>{label}</button>
        ))}
      </div>

      {/* Places list */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-mute)' }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.7 }}>{search ? '🔍' : '⭐'}</div>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>{search ? 'No places match your search.' : 'No places saved yet. Tap the map while tracking to add one!'}</div>
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
          />
        ))}
      </div>

      <div style={{ height: 24 }} />
    </div>
  )
}

function PlaceCard({ place, editing, editData, setEditData, onEdit, onSave, onCancel, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const icon = place.type === 'restaurant' ? '🍽️' : '📍'

  if (editing) {
    return (
      <div style={{ background: 'var(--surface)', borderRadius: 18, padding: 16, border: '1.5px solid var(--orange)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {['restaurant', 'destination'].map(t => (
            <button key={t} onClick={() => setEditData(d => ({ ...d, type: t }))} style={{
              flex: 1, padding: '9px 0', borderRadius: 10,
              background: editData.type === t ? 'var(--orange-wash)' : 'var(--surface-2)',
              border: `1.5px solid ${editData.type === t ? 'var(--orange)' : 'var(--border)'}`,
              color: editData.type === t ? 'var(--orange-deep)' : 'var(--text-soft)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>{t === 'restaurant' ? '🍽️ Restaurant' : '📍 Destination'}</button>
          ))}
        </div>
        <input value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
          style={{ width: '100%', padding: '11px 12px', borderRadius: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none', marginBottom: 8 }} />
        <textarea value={editData.notes} onChange={e => setEditData(d => ({ ...d, notes: e.target.value }))}
          placeholder="Notes..."
          style={{ width: '100%', padding: '11px 12px', borderRadius: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none', resize: 'none', height: 70, marginBottom: 10 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 11, borderRadius: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-soft)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onSave} style={{ flex: 1, padding: 11, borderRadius: 11, background: 'linear-gradient(135deg, #ff8a52, #ef5616)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Save</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 18, padding: '14px 16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)', display: 'flex', gap: 14 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--orange-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>{place.name}</div>
          <span style={{ fontSize: 10, background: 'var(--orange-wash)', borderRadius: 6, padding: '2px 7px', color: 'var(--orange-deep)', flexShrink: 0, marginLeft: 8, fontWeight: 700 }}>
            {place.type}
          </span>
        </div>
        {place.notes ? (
          <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 10, lineHeight: 1.5 }}>{place.notes}</div>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-mute)', marginBottom: 10, fontStyle: 'italic' }}>No notes yet</div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onEdit} style={smallBtn}>Edit</button>
          {confirmDelete ? (
            <>
              <button onClick={() => onDelete()} style={{ ...smallBtn, background: 'var(--orange)', borderColor: 'var(--orange)', color: '#fff' }}>Confirm</button>
              <button onClick={() => setConfirmDelete(false)} style={smallBtn}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setConfirmDelete(true)} style={{ ...smallBtn, color: 'var(--orange-deep)' }}>Delete</button>
          )}
        </div>
      </div>
    </div>
  )
}

const smallBtn = {
  padding: '6px 14px', borderRadius: 9, background: 'var(--surface-2)',
  border: '1px solid var(--border)', color: 'var(--text-soft)',
  fontSize: 12, fontWeight: 600, cursor: 'pointer',
}
