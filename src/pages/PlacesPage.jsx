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
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--green-950)' }}>
      {/* Header */}
      <div style={{ padding: '48px 16px 16px', background: 'linear-gradient(180deg, var(--green-800) 0%, var(--green-950) 100%)' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 700, color: 'var(--khaki-100)' }}>My Places</h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--khaki-400)' }}>
          {restaurants.length} restaurants · {destinations.length} destinations
        </p>
      </div>

      {/* Search */}
      <div style={{ padding: '0 16px 12px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search places..."
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 12,
            background: 'var(--green-800)', border: '1px solid var(--green-600)',
            color: 'var(--khaki-100)', fontSize: 15, outline: 'none',
          }}
        />
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', margin: '0 16px 16px', background: 'var(--green-900)', borderRadius: 12, padding: 4, gap: 4 }}>
        {[['all', 'All'], ['restaurant', '🍽️ Food'], ['destination', '📍 Spots']].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} style={{
            flex: 1, padding: '9px 0', borderRadius: 9,
            background: filter === id ? 'var(--green-600)' : 'transparent',
            border: 'none', color: filter === id ? 'var(--khaki-100)' : 'var(--khaki-400)',
            fontSize: 13, fontWeight: filter === id ? 700 : 400, cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      {/* Places list */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--khaki-400)', fontSize: 14 }}>
            {search ? 'No places match your search.' : 'No places saved yet. Tap the map while tracking to add one!'}
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

      <div style={{ height: 20 }} />
    </div>
  )
}

function PlaceCard({ place, editing, editData, setEditData, onEdit, onSave, onCancel, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const icon = place.type === 'restaurant' ? '🍽️' : '📍'
  const typeColor = place.type === 'restaurant' ? '#d4a056' : '#5aaa6e'

  if (editing) {
    return (
      <div style={{ background: 'var(--green-800)', borderRadius: 16, padding: 16, border: '1px solid var(--green-500)' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {['restaurant', 'destination'].map(t => (
            <button key={t} onClick={() => setEditData(d => ({ ...d, type: t }))} style={{
              flex: 1, padding: '8px 0', borderRadius: 8,
              background: editData.type === t ? 'var(--green-600)' : 'var(--green-900)',
              border: `1px solid ${editData.type === t ? 'var(--green-400)' : 'var(--green-700)'}`,
              color: 'var(--khaki-100)', fontSize: 13, cursor: 'pointer',
            }}>{t === 'restaurant' ? '🍽️ Restaurant' : '📍 Destination'}</button>
          ))}
        </div>
        <input value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'var(--green-900)', border: '1px solid var(--green-600)', color: 'var(--khaki-100)', fontSize: 14, outline: 'none', marginBottom: 8 }} />
        <textarea value={editData.notes} onChange={e => setEditData(d => ({ ...d, notes: e.target.value }))}
          placeholder="Notes..."
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'var(--green-900)', border: '1px solid var(--green-600)', color: 'var(--khaki-100)', fontSize: 14, outline: 'none', resize: 'none', height: 70, marginBottom: 10 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 10, borderRadius: 10, background: 'var(--green-900)', border: '1px solid var(--green-600)', color: 'var(--khaki-400)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onSave} style={{ flex: 1, padding: 10, borderRadius: 10, background: 'var(--green-500)', border: 'none', color: 'var(--khaki-100)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Save</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--green-800)', borderRadius: 16, padding: '14px 16px', border: '1px solid var(--green-700)', display: 'flex', gap: 14 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--green-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--khaki-200)', marginBottom: 2 }}>{place.name}</div>
          <span style={{ fontSize: 10, background: 'var(--green-900)', borderRadius: 6, padding: '2px 6px', color: typeColor, flexShrink: 0, marginLeft: 8 }}>
            {place.type}
          </span>
        </div>
        {place.notes ? (
          <div style={{ fontSize: 13, color: 'var(--khaki-400)', marginBottom: 10, lineHeight: 1.5 }}>{place.notes}</div>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--green-500)', marginBottom: 10, fontStyle: 'italic' }}>No notes yet</div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onEdit} style={smallBtn}>Edit</button>
          {confirmDelete ? (
            <>
              <button onClick={() => onDelete()} style={{ ...smallBtn, background: '#7b2020', borderColor: '#c0392b', color: '#ff9999' }}>Confirm</button>
              <button onClick={() => setConfirmDelete(false)} style={smallBtn}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setConfirmDelete(true)} style={{ ...smallBtn, color: '#e57373' }}>Delete</button>
          )}
        </div>
      </div>
    </div>
  )
}

const smallBtn = {
  padding: '6px 14px', borderRadius: 8, background: 'var(--green-900)',
  border: '1px solid var(--green-600)', color: 'var(--khaki-300)',
  fontSize: 12, cursor: 'pointer',
}
