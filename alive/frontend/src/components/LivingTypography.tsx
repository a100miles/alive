import { useEffect, useRef, useState, type CSSProperties } from 'react'
import '@fontsource/bodoni-moda/latin-400.css'
import '@fontsource/bodoni-moda/latin-400-italic.css'
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/caveat/latin-400.css'
import './living-typography.css'

const faces = ['serif', 'sans', 'hand', 'mono', 'italic', 'playful'] as const
const words = ['live.', 'love.', 'create.']

export function LivingTypography() {
  const root = useRef<HTMLButtonElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const element = root.current
    if (!element) return
    let visible = false
    let ready = false
    let disposed = false
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      element.dataset.ready = String(ready)
      element.dataset.running = String(visible && ready && !document.hidden && !motion.matches)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    observer.observe(element)
    document.addEventListener('visibilitychange', sync)
    motion.addEventListener('change', sync)
    // Warm only the six used faces; start once their actual metrics are available.
    void Promise.all([
      '400 48px "Bodoni Moda"', '400 48px "DM Sans"', '400 48px Caveat',
      '400 48px "Cutive Mono"', 'italic 400 48px "Bodoni Moda"', '400 48px "Indie Flower"',
    ].map(font => document.fonts.load(font, 'live. love. create.'))).then(() => {
      if (!disposed) { ready = true; sync() }
    }).catch(() => { /* Keep the readable static treatment if a font fails. */ })
    return () => {
      disposed = true
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      motion.removeEventListener('change', sync)
    }
  }, [])

  return <button ref={root} type="button" className="living-typography"
    data-paused={paused} aria-pressed={paused}
    aria-label="live. love. create. Pause typography animation"
    title={paused ? 'Resume typography animation' : 'Pause typography animation'}
    onClick={() => setPaused(value => !value)}>
    {words.map((word, wordIndex) => {
      const step = 1.9 + wordIndex * 0.17
      return <span key={word} className="living-word" aria-hidden="true" style={{ '--cycle': `${step * faces.length}s` } as CSSProperties}>
        {faces.map((face, index) => <span key={face} className={`living-face living-face--${face}`}
          style={{ '--phase': `${(index - faces.length) * step - wordIndex * 0.61}s` } as CSSProperties}>{word}</span>)}
      </span>
    })}
  </button>
}
