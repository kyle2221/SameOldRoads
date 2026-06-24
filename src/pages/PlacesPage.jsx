import { useState } from 'react'
import { useStore } from '../store'
import { PageHeader, EmptyState, Tag } from '../components/ui'

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

  function startEdit(place) { setEditing(place.id); setEditData({ name: place.name, notes: place.notes || '', type: place.type }) }
  async function saveEdit() { await updatePlace({ ...places.find(p => p.id === editing), ...editData }); setEditing(null) }

  const restaurants = places.filter(p => p.type === 'restaurant')
  const destinations = places.filter(p => p.type === 'destination')

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <PageHeader title="My Places" subtitle={`${restaurants.length} restaurants · ${destinations.length} destinations`} variant="soft" />

      <div style={{ padding: '16px 16px 12px' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
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
          <button key={id} onClick={() => setFilter(id)} className="pressable" style={{
            flex: 1, padding: '10px 0', borderRadius: 11,
            background: filter === id ? 'var(--surface)' : 'transparent', border: 'none',
            color: filter === id ? 'var(--orange-deep)' : 'var(--text-soft)',
            fontSize: 13, fontWeight: filter === id ? 700 : 600, cursor: 'pointer',
            boxShadow: filter === id ? 'var(--shadow-sm)' : 'none',
            fontFamily: 'var(--font-display)',
            transition: 'all 0.2s ease',
          }}>{label}</button>
        ))}
      </div>

      <div className="stagger" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        {filtered.length === 0 && (
          <EmptyState
            icon={search ? '🔍' : '⭐'}
            title={search ? 'No matches' : 'No places yet'}
            message={search ? 'No places match your search.' : 'Tap the map while tracking to add one!'}
          />
        )}
        {filtered.map((p, i) => (
          <div key={p.id} style={{ '--i': i }}>
            <PlaceCard place={p} editing={editing === p.id} editData={editData} setEditData={setEditData} onEdit={() => startEdit(p)} onSave={saveEdit} onCancel={() => setEditing(null)} onDelete={() => deletePlace(p.id)} />
          </div>
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
            <button key={t} onClick={() => setEditData(d => ({ ...d, type: t }))} className="pressable" style={{
              flex: 1, padding: '9px 0', borderRadius: 10,
              background: editData.type === t ? 'var(--orange-wash)' : 'var(--surface-2)',
              border: `1.5px solid ${editData.type === t ? 'var(--orange)' : 'var(--border)'}`,
              color: editData.type === t ? 'var(--orange-deep)' : 'var(--text-soft)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>{t === 'restaurant' ? '🍽️ Restaurant' : '📍 Destination'}</button>
          ))}
        </div>
        <input value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} style={{ width: '100%', padding: '11px 12px', borderRadius: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none', marginBottom: 8 }} />
        <textarea value={editData.notes} onChange={e => setEditData(d => ({ ...d, notes: e.target.value }))} placeholder="Notes..." style={{ width: '100%', padding: '11px 12px', borderRadius: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none', resize: 'none', height: 70, marginBottom: 10 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} className="pressable" style={{ flex: 1, padding: 11, borderRadius: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-soft)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onSave} className="pressable" style={{ flex: 1, padding: 11, borderRadius: 11, background: 'linear-gradient(135deg, #ff8a52, #ef5616)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Save</button>
        </div>
      </div>
    )
  }

  return (
    <div className="pressable" style={{
      background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-soft)', display: 'flex', overflow: 'hidden',
    }}>
      <div style={{ width: 4, flexShrink: 0, background: place.type === 'restaurant' ? 'linear-gradient(180deg, #ff8a52, #ef5616)' : 'linear-gradient(180deg, #6b8aff, #4f6ef7)' }} />
      <div style={{ flex: 1, padding: '14px 15px', display: 'flex', gap: 13 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 14,
          background: place.type === 'restaurant' ? 'var(--orange-wash)' : 'var(--blue-wash)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2, fontFamily: 'var(--font-display)' }}>{place.name}</div>
            <Tag size="sm">{place.type}</Tag>
          </div>
          {place.notes
            ? <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 10, lineHeight: 1.5 }}>{place.notes}</div>
            : <div style={{ fontSize: 13, color: 'var(--text-mute)', marginBottom: 10, fontStyle: 'italic' }}>No notes yet</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onEdit} className="pressable" style={smallBtn}>Edit</button>
            {confirmDelete ? (
              <>
                <button onClick={() => onDelete()} className="pressable" style={{ ...smallBtn, background: 'var(--orange)', borderColor: 'var(--orange)', color: '#fff' }}>Confirm</button>
                <button onClick={() => setConfirmDelete(false)} className="pressable" style={smallBtn}>Cancel</button>
              </>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="pressable" style={{ ...smallBtn, color: 'var(--orange-deep)' }}>Delete</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const smallBtn = { padding: '6px 14px', borderRadius: 9, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-soft)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }
