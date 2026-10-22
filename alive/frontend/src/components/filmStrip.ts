/** Recycle each physical film only outside the viewport; no duplicate-track seam. */
export function startFilmStrip(stage: HTMLDivElement, sources: string[], reduced: boolean) {
  const items = Array.from(stage.querySelectorAll<HTMLElement>('.film-strip-item'))
  const videos = items.map(item => item.querySelector('video')!)
  const ratios = sources.map(() => .75)
  const positions: number[] = []
  const widths: number[] = []
  const playing = new Set<number>()
  const failed = new Set<number>()
  let viewport = 0, gap = 0, cycle = 0, phase = 0
  let visible = false, requested = !reduced, disposed = false
  let frame = 0, lastTime = 0, lastSync = 0
  const running = () => visible && requested && !document.hidden && !stage.closest('[inert]')

  const draw = () => {
    let offset = 0
    items.forEach((item, index) => {
      let x = offset - phase
      if (x + widths[index] + gap <= 0) x += cycle
      positions[index] = reduced ? offset - stage.scrollLeft : x
      if (!reduced) item.style.transform = `translate3d(${x.toFixed(3)}px,0,0)`
      offset += widths[index] + gap
    })
  }
  const syncMedia = () => {
    const run = running()
    videos.forEach((video, index) => {
      const x = positions[index], width = widths[index]
      const onscreen = visible && x < viewport && x + width > 0
      // Keep the current frames when vertically offscreen; unloading them flashes
      // the page background at the viewport edge and on reverse scrolling.
      const nearby = x < viewport + 160 && x + width > -160
      if (visible && nearby && !video.hasAttribute('src') && !failed.has(index)) {
        video.src = sources[index]; video.load()
      }
      if (onscreen && run && !failed.has(index)) {
        if (!playing.has(index)) {
          playing.add(index)
          void video.play().catch((error: unknown) => {
            playing.delete(index)
            if (!disposed && error instanceof DOMException && error.name === 'NotAllowedError') {
              requested = false; update()
            }
          })
        }
      } else {
        video.pause(); playing.delete(index)
        if (!nearby && video.hasAttribute('src')) { video.removeAttribute('src'); video.load() }
      }
    })
  }
  const tick = (time: number) => {
    frame = 0
    if (!running() || reduced || cycle === 0) return
    if (lastTime) phase = (phase + Math.min(time - lastTime, 64) * 32 / 1000) % cycle
    lastTime = time
    draw()
    if (time - lastSync > 120) { syncMedia(); lastSync = time }
    frame = requestAnimationFrame(tick)
  }
  function update() {
    cancelAnimationFrame(frame); frame = 0; lastTime = 0
    syncMedia()
    if (running() && !reduced) frame = requestAnimationFrame(tick)
  }
  const measure = () => {
    viewport = stage.clientWidth
    const measuredGap = parseFloat(getComputedStyle(stage).columnGap)
    gap = Number.isFinite(measuredGap) ? measuredGap : 0
    const height = stage.clientHeight
    items.forEach((item, index) => {
      widths[index] = height * ratios[index]
      item.style.width = `${widths[index]}px`
    })
    cycle = widths.reduce((total, width) => total + width + gap, 0)
    phase = cycle ? phase % cycle : 0
    draw(); update()
  }
  const cleanups = videos.map((video, index) => {
    const metadata = () => {
      const ratio = video.videoWidth / video.videoHeight
      if (Number.isFinite(ratio) && ratio > 0 && ratio !== ratios[index]) { ratios[index] = ratio; measure() }
    }
    const error = () => {
      if (!video.hasAttribute('src')) return
      failed.add(index); playing.delete(index); items[index].dataset.failed = 'true'
    }
    video.addEventListener('loadedmetadata', metadata); video.addEventListener('error', error)
    return () => { video.removeEventListener('loadedmetadata', metadata); video.removeEventListener('error', error) }
  })
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    update()
  }, { threshold: 0 })
  const resize = new ResizeObserver(measure)
  const scroll = () => { if (reduced) { draw(); syncMedia() } }
  measure(); resize.observe(stage); observer.observe(stage)
  stage.addEventListener('scroll', scroll, { passive: true })
  document.addEventListener('visibilitychange', update)
  return {
    dispose() {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect(); cleanups.forEach(cleanup => cleanup())
      stage.removeEventListener('scroll', scroll); document.removeEventListener('visibilitychange', update)
      videos.forEach(video => { video.pause(); video.removeAttribute('src'); video.load() })
      items.forEach(item => { item.style.removeProperty('transform'); item.style.removeProperty('width') })
    },
  }
}
