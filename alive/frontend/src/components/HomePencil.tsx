import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import './home-pencil.css'

// Fixed seeds keep the pencil marks stable across renders and motion changes.
function noise(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return value - Math.floor(value)
}

function scribble(cx: number, cy: number, rx: number, ry: number, seed: number, count = 75) {
  return Array.from({ length: count }, (_, index) => {
    const angle = index * 2.399 + seed
    const radius = Math.sqrt(noise(index + seed))
    const x = cx + Math.cos(angle) * rx * radius
    const y = cy + Math.sin(angle) * ry * radius
    return `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

const flowers = [
  { x: 160, y: 47, color: '#e74643', seed: 11 },
  { x: 315, y: 61, color: '#ed4146', seed: 28 },
  { x: 595, y: 78, color: '#575bc4', seed: 42 },
  { x: 855, y: 54, color: '#ee8c3a', seed: 63 },
  { x: 1030, y: 65, color: '#e9bf27', seed: 81 },
]
// Individually placed gestures, rather than a radial sunburst. Each pencil
// pass wanders around its own gesture and leaves several fine pigment tracks.
const rayGestures = [
  [[111, 23], [99, 25], [91, 24], [78, 28], [61, 29]],
  [[117, 47], [108, 50], [101, 55], [91, 57]],
  [[133, 67], [124, 73], [116, 75], [108, 81], [96, 83]],
  [[151, 82], [145, 91], [137, 97], [133, 105], [122, 112]],
  [[170, 91], [166, 103], [160, 111], [158, 122]],
  [[188, 97], [189, 108], [187, 117], [189, 132]],
  [[210, 94], [211, 101], [210, 111], [213, 119]],
]
const rays = rayGestures.flatMap((gesture, ray) =>
  Array.from({ length: 4 }, (_, trace) => {
    const seed = ray * 57 + trace * 13
    const points = gesture.map(([x, y], point) => [
      x + (noise(seed + point) - .5) * 4.5 + trace * .7,
      y + (noise(seed + point + 31) - .5) * 4 + trace * .5,
    ])
    return {
      tracks: Array.from({ length: 3 }, (_, track) => points.map(([x, y], point) =>
        `${point ? 'L' : 'M'}${(x + (noise(seed + point + track * 19) - .5) * 1.2).toFixed(2)},${(y + (track - 1) * .65).toFixed(2)}`,
      ).join(' ')),
      delay: -(ray * .83 + trace * .19),
      duration: 7.6,
      pressure: .6 + noise(seed + 9) * .55,
    }
  }),
)

export function HomePencil() {
  const id = useId().replaceAll(':', '')
  const layer = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    let intersecting = false
    const update = () => setVisible(intersecting && !document.hidden)
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; update() })
    if (layer.current) observer.observe(layer.current)
    document.addEventListener('visibilitychange', update)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update) }
  }, [])
  const running = visible && !paused && !reduced
  return <div ref={layer} className="home-pencil" data-running={running}>
    <svg className="pencil-definitions" aria-hidden="true"><defs>
      <filter id={`${id}-wax`} x="-8%" y="-12%" width="116%" height="124%">
        <feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" seed="7"/>
        <feColorMatrix type="luminanceToAlpha"/>
        <feComponentTransfer><feFuncA type="discrete" tableValues="0 .2 .65 .9 1"/></feComponentTransfer>
        <feComposite in="SourceGraphic" operator="in"/>
      </filter>
    </defs></svg>
    <button className="pencil-sun" type="button" aria-label={paused ? 'Resume pencil animations' : 'Pause pencil animations'} aria-pressed={paused} onClick={() => setPaused(value => !value)} title={paused ? 'Resume pencil animations' : 'Pause pencil animations'}>
      <svg viewBox="0 0 220 190" fill="none" aria-hidden="true" focusable="false">
        <g stroke="#e8cb30" strokeLinecap="round" filter={`url(#${id}-wax)`}>
          <path d="M128 -12 Q117 31 146 62 Q169 85 222 77 M132 -10 Q121 35 151 60 Q181 79 220 73" strokeWidth="2.7"/>
          <path d={scribble(187, 18, 63, 60, 14, 190)} strokeWidth="2.1"/>
          {rays.map((ray, index) => <g key={index} stroke={index % 3 === 0 ? '#d9b82a' : '#e8cb30'} strokeLinejoin="round">
            {ray.tracks.map((d, track) => <path key={track} className="pencil-ray" d={d} pathLength="1" strokeWidth={ray.pressure * (track === 1 ? 1 : .55)} style={{ '--trace-delay': `${ray.delay}s`, '--trace-duration': `${ray.duration}s` } as CSSProperties}/>)}
          </g>)}
        </g>
      </svg>
    </button>
    <svg className="pencil-meadow" viewBox="0 0 1200 155" fill="none" aria-hidden="true" focusable="false">
      <g strokeLinecap="round" strokeLinejoin="round" filter={`url(#${id}-wax)`}>
        <g stroke="#4ea65c">
          {Array.from({ length: 7 }, (_, pass) => <path key={pass} strokeWidth={1.3 + pass % 3} opacity=".75" d={Array.from({ length: 155 }, (_, point) => `${point ? 'L' : 'M'}${point * 7.7},${128 + Math.sin(point * .32) * 3 + noise(point + pass * 170) * 8 + pass * .5}`).join(' ')}/>)}
        </g>
        {flowers.map((flower, index) => <g key={flower.seed}>
          <defs><g id={`${id}-flower-${flower.seed}`}>
          <g stroke="#4ea65c" strokeWidth="2.5">
            {[0, 1, 2].map(pass => <path key={pass} d={`M${flower.x + pass * 2} 132 Q${flower.x + 6 - pass} 104 ${flower.x - 2 + pass} ${flower.y + 10} M${flower.x + 2} 113 Q${flower.x - 19} 110 ${flower.x - 23} 97 L${flower.x + 2} 109 M${flower.x + 2} 104 L${flower.x + 28} 89 Q${flower.x + 21} 109 ${flower.x} 110`}/>)}
          </g>
          <path d={scribble(flower.x, flower.y, 26, 20, flower.seed, 115)} stroke={flower.color} strokeWidth="3.2"/>
          <path d={scribble(flower.x - 3, flower.y - 5, 19, 18, flower.seed + 3, 60)} stroke={flower.color} strokeWidth="2"/>
          </g></defs>
          {[2, 1, 0].map(trace => <use key={trace} href={`#${id}-flower-${flower.seed}`} className={`pencil-flower${trace ? ' pencil-flower-echo' : ''}`} style={{
            transformOrigin: `${flower.x}px 132px`,
            '--wind-duration': `${5.6 + noise(flower.seed) * 2.3}s`,
            '--wind-delay': `${-index * .73 + trace * .3 - 2}s`,
            '--wind-lean': `${5.5 + noise(flower.seed + 1) * 3}deg`,
            '--echo-opacity': trace === 1 ? .19 : .09,
          } as CSSProperties}/>)}
        </g>)}
      </g>
    </svg>
  </div>
}
