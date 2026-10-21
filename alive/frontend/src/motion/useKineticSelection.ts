import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { clamp, modulo, motion } from './referenceMotion'

interface Options { count: number; initial?: number; loop?: boolean; axis: 'x' | 'y'; step: number; mediaOnly?: boolean; render: (position: number, velocity: number) => void }
export function useKineticSelection({ count, initial = 0, loop = false, axis, step, mediaOnly = false, render }: Options) {
  const reduced = useReducedMotion()
  const surface = useRef<HTMLDivElement>(null)
  const model = useRef({ position: initial, goal: initial, previous: initial })
  const renderRef = useRef(render)
  const drag = useRef<{ id: number; origin: number; start: number; last: number; time: number; velocity: number; moved: boolean } | null>(null)
  const suppress = useRef(0)
  const selectionIntent = useRef<number | null>(null)
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const tween = useRef<gsap.core.Tween | null>(null)
  const [index, setIndex] = useState(initial)
  useLayoutEffect(() => { renderRef.current = render; render(model.current.position, 0) }, [render])
  const bounded = useCallback((value: number) => loop ? value : clamp(value, 0, Math.max(0, count - 1)), [loop, count])
  const paint = useCallback(() => {
    const state = model.current
    renderRef.current(state.position, state.position - state.previous)
    state.previous = state.position
    setIndex(selectionIntent.current ?? (loop ? modulo(Math.round(state.position), count) : clamp(Math.round(state.position), 0, Math.max(0, count - 1))))
  }, [count, loop])
  const animate = useCallback((goal: number, duration: number) => {
    tween.current?.kill()
    model.current.goal = bounded(goal)
    if (reduced) { model.current.position = model.current.goal; paint(); return }
    tween.current = gsap.to(model.current, { position: model.current.goal, duration, ease: 'power3.out', onUpdate: paint, onComplete: () => { selectionIntent.current=null; paint(); renderRef.current(model.current.position, 0) } })
  }, [bounded, reduced, paint])
  const goTo = useCallback((next: number) => {
    let goal = next
    if (loop && count > 1) goal = model.current.position + modulo(next - model.current.position + count / 2, count) - count / 2
    selectionIntent.current=loop?modulo(Math.round(goal),count):bounded(Math.round(goal))
    setIndex(selectionIntent.current)
    animate(goal, motion.settle)
  }, [loop, count, animate, bounded])
  const move = useCallback((delta: number) => {
    const goal=Math.round(model.current.goal)+delta
    selectionIntent.current=loop?modulo(goal,count):bounded(goal)
    setIndex(selectionIntent.current)
    animate(goal,motion.settle)
  }, [animate,loop,count,bounded])

  useEffect(() => {
    const element = surface.current
    if (!element) return
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || count < 2 || (event.target as HTMLElement).closest('input,select')) return
      if (mediaOnly && !(event.target as HTMLElement).closest('button') && document.activeElement !== element) return
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (!loop && ((model.current.goal <= 0 && delta < 0) || (model.current.goal >= count - 1 && delta > 0))) return
      event.preventDefault()
      selectionIntent.current=null
      clearTimeout(wheelTimer.current)
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1
      animate(model.current.goal + clamp(delta * unit, -600, 600) / Math.max(1, step * .86), motion.follow)
      wheelTimer.current = setTimeout(() => animate(Math.round(model.current.goal), motion.settle), 110)
    }
    element.addEventListener('wheel', wheel, { passive: false })
    return () => { element.removeEventListener('wheel', wheel); clearTimeout(wheelTimer.current) }
  }, [animate, count, loop, step, mediaOnly])
  useEffect(() => () => { tween.current?.kill(); clearTimeout(wheelTimer.current) }, [])
  useEffect(() => { if (reduced) { tween.current?.kill(); model.current.position = bounded(Math.round(model.current.goal)); paint() } }, [reduced, bounded, paint])

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !event.isPrimary || count < 2) return
    if (mediaOnly && !(event.target as HTMLElement).closest('button')) return
    tween.current?.kill(); clearTimeout(wheelTimer.current)
    selectionIntent.current=null
    const coordinate = axis === 'x' ? event.clientX : event.clientY
    drag.current = { id: event.pointerId, origin: coordinate, start: model.current.position, last: coordinate, time: event.timeStamp, velocity: 0, moved: false }
  }
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = drag.current
    if (!gesture || gesture.id !== event.pointerId) return
    const coordinate = axis === 'x' ? event.clientX : event.clientY
    const distance = gesture.origin - coordinate
    if (!gesture.moved && Math.abs(distance) < 6) return
    gesture.moved = true
    event.currentTarget.setPointerCapture(event.pointerId)
    gesture.velocity = (gesture.last - coordinate) / Math.max(1, event.timeStamp - gesture.time)
    gesture.last = coordinate; gesture.time = event.timeStamp
    animate(gesture.start + distance / Math.max(1, step), motion.follow)
  }
  const pointerEnd = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const gesture = drag.current
    if (!gesture || gesture.id !== event.pointerId) return
    drag.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (!gesture.moved) return
    suppress.current = performance.now() + 350
    const projection = !cancelled && event.timeStamp - gesture.time < 100 ? clamp(gesture.velocity * motion.projectionMs / Math.max(1, step), -1.5, 1.5) : 0
    animate(Math.round(model.current.goal + projection), motion.settle)
  }
  return { surface, index, goTo, move,
    bind: { onPointerDown: pointerDown, onPointerMove: pointerMove, onPointerUp: (e: PointerEvent<HTMLDivElement>) => pointerEnd(e), onPointerCancel: (e: PointerEvent<HTMLDivElement>) => pointerEnd(e, true), onLostPointerCapture: (e: PointerEvent<HTMLDivElement>) => { if(e.target===e.currentTarget)pointerEnd(e,true) },
      onClickCapture: (event: React.MouseEvent<HTMLDivElement>) => { if (performance.now() < suppress.current) { event.preventDefault(); event.stopPropagation() } },
    },
  }
}
