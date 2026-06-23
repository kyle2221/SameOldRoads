import { useState } from 'react'
import { useStore } from '../store'
import WatchTable from '../components/WatchTable'
import Icon from '../components/Icons'

export default function WatchlistModule() {
  const { watchlists, activeWatchlist, setActiveWatchlist, createWatchlist, deleteWatchlist, addSymbol } = useStore()
  const [adding, setAdding] = useState('')
  const [newList, setNewList] = useState(false)
  const [listName, setListName] = useState('')

  const lists = Object.keys(watchlists)
  const symbols = watchlists[activeWatchlist] || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {lists.map((l) => (
          <button key={l} className={`chip ${l === activeWatchlist ? 'active' : ''}`} onClick={() => setActiveWatchlist(l)}>
            {l} <span style={{ opacity: 0.6 }}>{(watchlists[l] || []).length}</span>
          </button>
        ))}
        {newList ? (
          <form onSubmit={(e) => { e.preventDefault(); if (listName.trim()) { createWatchlist(listName); setListName(''); setNewList(false) } }} style={{ display: 'flex', gap: 4 }}>
            <input autoFocus value={listName} onChange={(e) => setListName(e.target.value)} onBlur={() => setNewList(false)}
                   placeholder="List name" className="field" style={{ width: 120, height: 26, padding: '2px 8px', fontSize: 11 }} />
          </form>
        ) : (
          <button className="chip" onClick={() => setNewList(true)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="plus" size={11} /> New List</button>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          <form onSubmit={(e) => { e.preventDefault(); if (adding.trim()) { addSymbol(activeWatchlist, adding); setAdding('') } }} style={{ display: 'flex', gap: 4 }}>
            <input value={adding} onChange={(e) => setAdding(e.target.value)} placeholder="Add ticker…"
                   className="field" style={{ width: 130, height: 28, fontSize: 11.5 }} />
            <button type="submit" className="chip" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="plus" size={12} /> Add</button>
          </form>
          {lists.length > 1 && (
            <button className="chip" onClick={() => deleteWatchlist(activeWatchlist)} title="Delete this list" style={{ color: 'var(--down)' }}>
              <Icon name="trash" size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="thin-scroll" style={{ flex: 1, overflow: 'auto' }}>
        <WatchTable symbols={symbols} listName={activeWatchlist} showRemove
          columns={['last', 'chg', 'pct', 'bid', 'ask', 'high', 'low', 'vol', 'mcap', 'spark']} />
      </div>
    </div>
  )
}
