import { Link, useLocation } from 'react-router-dom';
import { useAudio } from './AudioProvider';
import { PlayerControls } from './PlayerControls';
import { CoverArt } from './CoverArt';
import './music.css';

export function PersistentPlayer() {
  const { track, release, error, playing } = useAudio();
  const location = useLocation();
  if (!track || location.pathname === '/music') return null;
  return <aside className="persistent-player" aria-label="Persistent music player">
    <Link to="/music" className="persistent-player-track" aria-label={`Open music archive: ${track.title}`}>
      <CoverArt src={release?.coverImage} width={44} height={44} className={`player-cover${playing ? ' is-playing' : ''}`} />
      <span><strong>{track.title}</strong><small>{release?.artist || 'a.l.i.v.e'}{track.demo ? ' / demo audio' : ''}</small></span>
    </Link>
    <PlayerControls compact />
    {error && <p className="audio-error" role="alert">{error}</p>}
  </aside>;
}
