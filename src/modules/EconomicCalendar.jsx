import { useMemo, useState } from 'react'
import { getEconomicCalendar } from '../services/economic'
import { fmtNum } from '../utils/format'

const IMP_LABEL = { hi: 'High', md: 'Medium', lo: 'Low' }

export default function EconomicCalendar() {
  const all = useMemo(() => getEconomicCalendar(new Date()), [])
  const [imp, setImp] = useState('all')

  const view = imp === 'all' ? all : all.filter((e) => e.importance === imp)
  const byDate = view.reduce((acc, e) => { (acc[e.dateStr] ||= []).push(e); return acc }, {})

  const fmtVal = (v, unit) => (v == null ? '—' : `${fmtNum(v, Math.abs(v) < 10 ? 1 : 0)}${unit || ''}`)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
        <span className="amber mono" style={{ fontWeight: 700, fontSize: 12 }}>ECONOMIC CALENDAR</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}>
          <span className="dim" style={{ fontSize: 10, marginRight: 4 }}>Importance:</span>
          {['all', 'hi', 'md', 'lo'].map((k) => (
            <button key={k} className={`chip ${imp === k ? 'active' : ''}`} onClick={() => setImp(k)}>{k === 'all' ? 'All' : IMP_LABEL[k]}</button>
          ))}
        </div>
      </div>

      <div className="thin-scroll" style={{ flex: 1, overflow: 'auto' }}>
        {Object.entries(byDate).map(([date, events]) => (
          <div key={date}>
            <div style={{ position: 'sticky', top: 0, zIndex: 1, padding: '5px 14px', background: 'var(--panel-3)', borderBottom: '1px solid var(--border-2)', borderTop: '1px solid var(--border)' }}>
              <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: events[0].isToday ? 'var(--amber)' : 'var(--text-2)' }}>
                {events[0].dow} {date} {events[0].isToday && '· TODAY'}
              </span>
            </div>
            <table className="dt">
              <thead><tr><th className="l" style={{ width: 54 }}>Time</th><th className="l" style={{ width: 36 }}></th><th className="l">Event</th><th>Actual</th><th>Forecast</th><th>Previous</th></tr></thead>
              <tbody>
                {events.map((e) => {
                  const beat = e.actual != null && e.forecast != null
                  const dir = beat ? (e.actual >= e.forecast ? 'up' : 'down') : ''
                  return (
                    <tr key={e.id} style={{ cursor: 'default' }}>
                      <td className="l mono dim">{e.time}</td>
                      <td className="l"><span title={e.country}>{e.flag}</span> <span className={`imp ${e.importance}`} style={{ marginLeft: 4, verticalAlign: 'middle' }} /></td>
                      <td className="l" style={{ fontFamily: 'var(--ui)', color: 'var(--text)' }}>{e.name}</td>
                      <td><span className={`num ${dir}`} style={{ fontWeight: e.actual != null ? 700 : 400 }}>{fmtVal(e.actual, e.unit)}</span></td>
                      <td><span className="num muted">{fmtVal(e.forecast, e.unit)}</span></td>
                      <td><span className="num dim">{fmtVal(e.previous, e.unit)}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
