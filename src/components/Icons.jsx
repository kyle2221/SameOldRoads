// Minimal stroke-icon set. Usage: <Icon name="chart" size={16} />
const P = {
  grid:     'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  list:     'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  info:     'M12 16v-4M12 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  chart:    'M3 3v18h18M7 14l3-4 3 3 5-6',
  sheet:    'M4 3h16v18H4zM4 9h16M4 15h16M10 3v18',
  news:     'M4 5h16v14H4zM8 9h8M8 13h8M8 17h5',
  fire:     'M12 2c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 9 9 6 12 2z',
  map:      'M9 4l6 2 5-2v14l-5 2-6-2-5 2V6z M9 4v14M15 6v14',
  filter:   'M3 4h18l-7 8v6l-4 2v-8z',
  calendar: 'M4 5h16v16H4zM4 9h16M8 3v4M16 3v4',
  wallet:   'M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a1 1 0 0 1-1-1V7zM3 7l2-3h11l2 3M17 13h.01',
  help:     'M9.1 9a3 3 0 1 1 4.4 2.6c-.8.5-1.5 1-1.5 2.4M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  search:   'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  x:        'M18 6 6 18M6 6l12 12',
  plus:     'M12 5v14M5 12h14',
  refresh:  'M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5',
  star:     'M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 21l1.1-6.5L2.6 9.8l6.5-.9z',
  command:  'M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z',
  expand:   'M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3',
  bolt:     'M13 2L4 14h7l-1 8 9-12h-7z',
  globe:    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9z',
  trash:    'M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13',
}

export default function Icon({ name, size = 16, stroke = 'currentColor', fill = 'none', strokeWidth = 1.7, style }) {
  const d = P[name] || P.info
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={d} />
    </svg>
  )
}
