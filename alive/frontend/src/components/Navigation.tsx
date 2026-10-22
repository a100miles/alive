import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'

const links = [{ to: '/', label: 'Home' }, { to: '/photography', label: 'Photography' }, { to: '/music', label: 'Music' }, { to: '/about', label: 'About' }, { to: '/contact', label: 'Contact' }]
export function Navigation() {
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const location = useLocation()
  useEffect(() => { dialog.current?.close() }, [location.pathname])
  useEffect(() => {
    if (!open) return
    const old = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = old }
  }, [open])
  return <header className="site-header">
    <nav className="desktop-nav" aria-label="Main navigation">{links.map((link, index) => <NavLink key={link.to} to={link.to} end><span className="nav-label" style={{ '--nav-delay': `${index * 45}ms` } as CSSProperties}>{link.label}</span></NavLink>)}</nav>
    <button className="menu-toggle" aria-label="Open menu" aria-haspopup="dialog" aria-expanded={open} onClick={() => { setOpen(true); dialog.current?.showModal() }}>menu</button>
    <dialog ref={dialog} className="mobile-menu" aria-label="Navigation" onClose={() => setOpen(false)}>
      <div className="mobile-menu-top"><button className="icon-button" aria-label="Close menu" onClick={() => dialog.current?.close()}><X size={24}/></button></div>
      <nav aria-label="Mobile navigation">{links.map((link, index) => <NavLink key={link.to} to={link.to} end onClick={() => dialog.current?.close()}><span className="nav-label" style={{ '--nav-delay': `${index * 45}ms` } as CSSProperties}>{link.label}</span></NavLink>)}</nav>
      <p>Moments seen. Sounds remembered.</p>
    </dialog>
  </header>
}

