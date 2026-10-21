import { ArrowUpRight } from 'lucide-react'
import { site } from '../config'

export function Contact() {
  return <div className="contact-page page-padding"><h1 className="display-heading" tabIndex={-1}>Let’s keep<br/>in touch.</h1><div className="contact-body"><p>For a shared idea,<br/>a collaboration,<br/>or just a hello.</p><ul className="contact-links">{site.contacts.map(link => <li key={link.label}>{link.url ? <a href={link.url} target={link.url.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer">{link.label}<ArrowUpRight size={22}/></a> : <div><span>{link.label}</span><span className="small-note">Coming soon</span></div>}</li>)}<li className="contact-note">Contact details will appear here when the archive opens.</li></ul></div></div>
}
