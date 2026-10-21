import { LoaderCircle, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { formatTime, useAudio } from './AudioProvider';

export function PlayerControls({ compact = false }: { compact?: boolean }) {
  const audio = useAudio();
  return <div className={`audio-controls${compact ? ' audio-controls--compact' : ''}`}>
    <div className="audio-transport">
      <button type="button" className="music-icon-button" aria-label="Previous track" onClick={audio.previous}><SkipBack aria-hidden="true" size={17} /></button>
      <button type="button" className="music-play-button" aria-label={audio.playing ? 'Pause audio' : 'Play audio'} onClick={audio.toggle} aria-busy={audio.loading}>
        {audio.loading ? <LoaderCircle aria-hidden="true" className="audio-loading-icon" size={20} /> : audio.playing ? <Pause aria-hidden="true" size={20} /> : <Play aria-hidden="true" size={20} />}
      </button>
      <button type="button" className="music-icon-button" aria-label="Next track" onClick={audio.next}><SkipForward aria-hidden="true" size={17} /></button>
    </div>
    <div className="audio-progress">
      <span>{formatTime(audio.currentTime)}</span>
      <input aria-label="Audio position" type="range" min="0" max={Math.max(audio.duration, 0.01)} step="0.1" value={Math.min(audio.currentTime, audio.duration)} onChange={(event) => audio.seek(Number(event.target.value))} disabled={!audio.duration} aria-valuetext={`${formatTime(audio.currentTime)} of ${formatTime(audio.duration)}`} />
      <span>{formatTime(audio.duration)}</span>
    </div>
    <div className="audio-volume">
      <button type="button" className="music-icon-button" aria-label={audio.muted ? 'Unmute audio' : 'Mute audio'} onClick={audio.toggleMute} aria-pressed={audio.muted}>{audio.muted || audio.volume === 0 ? <VolumeX aria-hidden="true" size={18} /> : <Volume2 aria-hidden="true" size={18} />}</button>
      <input aria-label="Audio volume" type="range" min="0" max="1" step="0.01" value={audio.muted ? 0 : audio.volume} onChange={(event) => audio.setVolume(Number(event.target.value))} aria-valuetext={`${Math.round((audio.muted ? 0 : audio.volume) * 100)} percent`} />
    </div>
  </div>;
}
