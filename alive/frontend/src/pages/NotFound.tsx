import { Link } from 'react-router-dom'
export function NotFound() {
  return <div className="page-padding not-found"><p>404</p><h1 className="display-heading" tabIndex={-1}>A missing<br/>fragment.</h1><Link className="underlined-link" to="/">Return to the archive</Link></div>
}
