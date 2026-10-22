import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

// Scroll position drives both directions; the archive's kinetic scenes stay independent.
export function useScrollReveal(root: RefObject<HTMLElement | null>, sceneKey: string, suspended: boolean) {
  const reduced = useReducedMotion()
  useLayoutEffect(() => {
    if (reduced || suspended || !root.current) return
    const context = gsap.context(() => {
      const sections = root.current!.querySelectorAll<HTMLElement>('[data-scroll-reveal], [data-scroll-fade], .about-body, .contact-body, .release-details')
      sections.forEach(section => {
        section.classList.add('scroll-reveal')
        if (!section.hasAttribute('data-scroll-fade')) gsap.fromTo(section, { '--scroll-enter-opacity': 0, y: 24 }, {
          '--scroll-enter-opacity': 1, y: 0, ease: 'none',
          scrollTrigger: { trigger: section, start: 'top 96%', end: 'top 72%', scrub: .35 },
        })
        gsap.fromTo(section, { '--scroll-exit-opacity': 1 }, {
          '--scroll-exit-opacity': 0, ease: 'none',
          scrollTrigger: { trigger: section, start: 'bottom 45%', end: 'bottom top', scrub: .35 },
        })
      })
    }, root)
    let active = true
    void document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh() })
    return () => { active = false; context.revert() }
  }, [root, sceneKey, suspended, reduced])
}
