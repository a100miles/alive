import gsap from 'gsap'
import { discPose } from './referenceMotion'

export function createDiscFlight(source: HTMLElement, releaseId: string, depart: (token: string) => void) {
  const rect = source.getBoundingClientRect()
  const token = `disc-${performance.now()}`
  const shell = document.createElement('div')
  shell.className = 'disc-flight music-archive--spatial'
  shell.setAttribute('aria-hidden', 'true')
  const plane = document.createElement('div')
  plane.className = 'disc-flight-plane'
  const rotor = document.createElement('div')
  rotor.className = 'disc-flight-rotor'
  const home = source.cloneNode(true) as HTMLElement
  home.removeAttribute('id')
  rotor.append(home); plane.append(rotor); shell.append(plane); document.body.append(shell)
  gsap.set(shell, { left: rect.left, top: rect.top, width: rect.width, height: rect.height, transformOrigin: '50% 50%' })
  const originalVisibility = source.style.visibility
  source.style.visibility = 'hidden'
  let target: HTMLElement | null = null
  let targetVisibility = ''
  let incomingArt: HTMLElement | null = null
  let disposed = false
  const departure = gsap.to(rotor, { rotation: 72, duration: .3, ease: 'power2.in', onComplete: () => depart(token) })
  let arrival: gsap.core.Timeline | null = null
  return {
    token, releaseId,
    arrive(destination: HTMLElement) {
      target = destination; targetVisibility = target.style.visibility; target.style.visibility = 'hidden'
      const parent = destination.offsetParent as HTMLElement
      const parentRect = parent.getBoundingClientRect()
      const style = getComputedStyle(destination)
      const size = parseFloat(style.width)
      const pose = discPose(0, window.innerWidth, parent.clientHeight)
      const targetX = parentRect.left + parseFloat(style.left)
      const targetY = parentRect.top + parseFloat(style.top)
      // Match the destination's untransformed plane before introducing perspective.
      // An outer scale on a source-sized plane changes the apparent projection.
      gsap.set(shell, { width: size, height: size, left: rect.left + (rect.width - size) / 2,
        top: rect.top + (rect.height - size) / 2, scale: rect.width / size })
      incomingArt = destination.querySelector<HTMLElement>('.disc-object')!.cloneNode(true) as HTMLElement
      incomingArt.style.opacity = '0'
      rotor.append(incomingArt)
      arrival = gsap.timeline()
        .to(shell, { x: targetX - rect.left + (size - rect.width) / 2, y: targetY - rect.top + (size - rect.height) / 2,
          scale: 1, duration: .82, ease: 'power3.inOut' }, 0)
        .to(plane, { rotationX: pose.rotationX, rotationY: pose.rotationY, rotationZ: pose.rotationZ,
          transformPerspective: size * 2.5, duration: .82, ease: 'power3.inOut' }, 0)
        .to(rotor, { rotation: 360, duration: .82, ease: 'power2.out' }, 0)
        .to(home, { opacity: 0, duration: .3 }, .52)
        .to(incomingArt, { opacity: 1, duration: .3 }, .52)
    },
    dispose() {
      if (disposed) return
      disposed = true; departure.kill(); arrival?.kill()
      source.style.visibility = originalVisibility
      if (target) target.style.visibility = targetVisibility
      shell.remove()
    },
  }
}
