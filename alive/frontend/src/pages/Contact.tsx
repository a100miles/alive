import { Mail } from 'lucide-react'
import { site } from '../config'

function ContactIcon({ label }: { label: string }) {
  if (label === 'Email') return <Mail size={32} strokeWidth={1.5} aria-hidden="true"/>
  return <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true" fill="none">
    {label === 'Instagram' ? <g stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></g>
      : label === 'GitHub' ? <path fill="currentColor" d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.1c-3.12.68-3.78-1.32-3.78-1.32-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.62 1.22 3.26.93.1-.73.39-1.22.71-1.5-2.49-.28-5.11-1.25-5.11-5.54 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.3-2.62 5.26-5.12 5.54.4.35.76 1.03.76 2.08v3.09c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z"/>
      : <><circle cx="12" cy="12" r="11" fill="currentColor"/><g stroke="var(--paper)" strokeLinecap="round"><path d="M5.5 9c4.4-1.3 9-1 13 1.3" strokeWidth="1.8"/><path d="M6.4 12.3c3.8-1.1 7.7-.7 11 1.1" strokeWidth="1.5"/><path d="M7.1 15.5c3.1-.8 6.2-.5 9 1" strokeWidth="1.3"/></g></>}
  </svg>
}

export function Contact() {
  return <div className="contact-page page-padding">
    <h1 className="display-heading" tabIndex={-1}>Let?s keep<br/>in touch.</h1>
    <div className="contact-body"><p>For a shared idea,<br/>a collaboration,<br/>or just a hello.</p>
      <ul className="contact-links" aria-label="Contact Tamerlan">
        {site.contacts.map(link => <li key={link.label}><a href={link.url}
          aria-label={link.label === 'Email' ? 'Email Tamerlan at tamerlanesimov@gmail.com' : link.label + ' (opens in a new tab)'}
          title={link.label === 'Email' ? 'tamerlanesimov@gmail.com' : link.label}
          target={link.url.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">
          <ContactIcon label={link.label}/>
        </a></li>)}
      </ul>
    </div>
  </div>
}
