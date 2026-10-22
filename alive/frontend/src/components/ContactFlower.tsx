import { useId } from 'react'

const colors = ['#e74643', '#e2c929', '#575bc4', '#ab60ad']

export function ContactFlower({ index }: { index: number }) {
  const id = useId().replaceAll(':', '')
  const petals = Array.from({ length: 101 }, (_, i) => {
    const a = i / 100 * Math.PI * 2
    const r = 30 + 4 * Math.sin(a * (6 + index % 2)) + 1.2 * Math.sin(i * 2.3)
    return `${i ? 'L' : 'M'}${(50 + Math.cos(a) * r).toFixed(2)},${(41 + Math.sin(a) * r).toFixed(2)}`
  }).join(' ') + 'Z'
  return <svg className="contact-flower" viewBox="0 0 100 140" fill="none" aria-hidden="true" focusable="false">
    <defs><filter id={`${id}-pencil`} x="-15%" y="-10%" width="130%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3" seed={index + 8}/>
      <feDisplacementMap in="SourceGraphic" scale="3"/>
    </filter></defs>
    <g filter={`url(#${id}-pencil)`} strokeLinecap="round" strokeLinejoin="round">
      {[0, 1, 2].map(pass => <g key={pass} transform={`translate(${pass * .8} ${pass * .6})`} opacity={pass ? .45 : .8}>
        <path stroke="#4ea65c" strokeWidth="2.8" d="M49 73 Q57 99 48 124 M52 105 Q21 108 16 87 Q36 86 52 105 M53 95 Q70 75 86 80 Q85 100 53 104 M0 131 Q25 119 48 124 T100 128 M18 90 L44 103 M25 88 L46 100 M58 97 L80 83 M59 101 L83 88"/>
        <path d={petals} stroke={colors[index]} strokeWidth="2"/>
      </g>)}
    </g>
  </svg>
}
