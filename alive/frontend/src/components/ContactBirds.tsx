import { useEffect, useId, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../hooks/useReducedMotion'
import './contact-pencil.css'

const wings = [
  'M5 29 Q16 17 27 11 Q31 9 35 17 Q42 27 50 22 Q64 10 73 12 L84 17',
  'M5 23 Q16 18 27 16 Q31 15 35 20 Q42 26 50 23 Q64 17 73 18 L84 22',
  'M5 15 Q16 19 27 24 Q31 27 35 24 Q42 20 50 24 Q64 31 73 26 L84 23',
  'M5 24 Q16 15 27 9 Q31 8 35 16 Q42 24 50 21 Q64 9 73 11 L84 15',
]
const rhythms = [37, 43, 49, 41]

export function ContactBirds() {
  const layer = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const id = useId().replaceAll(':', '')

  useEffect(() => {
    const root = layer.current
    if (!root || reduced) return
    const birds = [...root.querySelectorAll<SVGSVGElement>('.contact-bird')]
    let width = root.clientWidth
    let height = root.clientHeight
    let visible = false
    const resize = new ResizeObserver(() => { width = root.clientWidth; height = root.clientHeight })
    resize.observe(root)
    const animations = birds.map((bird, index) => {
      const phase = { value: index * Math.PI / 2 }
      let previousFrame = -1
      const paths = bird.querySelectorAll('path')
      const draw = () => {
        const t = phase.value
        // Closed harmonic curves have matching position AND velocity at the seam.
        // The envelope stays in the whitespace measured by this responsive layer.
        const x = (width - bird.clientWidth) * (.5 + .51 * Math.sin(t) + .05 * Math.sin(2 * t + index))
        const y = (height - bird.clientHeight) * (.47 + .32 * Math.sin(2 * t + index * 1.3) + .1 * Math.cos(t))
        gsap.set(bird, { x, y, rotation: 6 * Math.cos(t + index) })
        const beat = (t * (11 + index * 2)) % (Math.PI * 2)
        // Long held glides interrupt a handful of deliberately stepped drawings.
        const frame = beat > 3.8 ? 1 : [0, 1, 2, 1, 3, 1][Math.floor(beat / 3.8 * 6)]
        if (frame !== previousFrame) {
          paths.forEach(path => path.setAttribute('d', wings[frame]))
          previousFrame = frame
        }
      }
      draw()
      return gsap.to(phase, { value: phase.value + Math.PI * 2, duration: rhythms[index], ease: 'none', repeat: -1, paused: true, onUpdate: draw })
    })
    const update = () => animations.forEach(animation => animation.paused(!visible || document.hidden))
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update() })
    observer.observe(root)
    document.addEventListener('visibilitychange', update)
    return () => {
      animations.forEach(animation => animation.kill())
      observer.disconnect()
      resize.disconnect()
      document.removeEventListener('visibilitychange', update)
      gsap.set(birds, { clearProps: 'transform' })
      birds.forEach(bird => bird.querySelectorAll('path').forEach(path => path.setAttribute('d', wings[0])))
    }
  }, [reduced])

  return <>
    <div ref={layer} className="contact-sky" aria-hidden="true">
      {rhythms.map((_, index) => <svg key={index} className="contact-bird" viewBox="0 0 90 42" fill="none" focusable="false">
        <defs><filter id={`${id}-graphite-${index}`} x="-15%" y="-30%" width="130%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" seed={index + 5}/>
          <feDisplacementMap in="SourceGraphic" scale="1.8" xChannelSelector="R" yChannelSelector="G"/>
        </filter></defs>
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${id}-graphite-${index})`}>
          <path d={wings[0]} strokeWidth="2.3" opacity=".8"/>
          <path d={wings[0]} strokeWidth=".8" transform="translate(.8 1.1)" opacity=".45"/>
        </g>
      </svg>)}
    </div>
  </>
}
