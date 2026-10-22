import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Release, Track } from '../types';

interface AudioContextValue {
  choose: (trackId: string) => void;
  toggle: () => void;
  close: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  track: Track | undefined;
  release: Release | undefined;
  playing: boolean;
  loading: boolean;
  error: string;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function formatTime(seconds: number) {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

export function AudioProvider({ children, releases, tracks }: { children: ReactNode; releases: Release[]; tracks: Track[] }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const selectedRef = useRef<string | undefined>(undefined);
  const requestRef = useRef(0);
  const [selected, setSelected] = useState<string>();
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);
  const [volume, updateVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const playlist = useMemo(() => releases.filter((item) => item.published).flatMap((release) => release.trackIds
    .map((id) => tracks.find((item) => item.id === id && item.releaseId === release.id))
    .filter((track): track is Track => Boolean(track?.audioUrl))), [releases, tracks]);
  const playlistRef = useRef(playlist);
  useEffect(() => { playlistRef.current = playlist; }, [playlist]);
  const invalidatePlay = useCallback(() => ++requestRef.current, []);

  const requestPlay = useCallback((audio: HTMLAudioElement) => {
    const request = invalidatePlay();
    setError('');
    setLoading(true);
    void audio.play().then(() => {
      if (request === requestRef.current) setLoading(false);
    }).catch((reason: unknown) => {
      if (request !== requestRef.current) return;
      setPlaying(false);
      setLoading(false);
      const blocked = reason instanceof DOMException && reason.name === 'NotAllowedError';
      setError(blocked ? 'Playback was blocked. Press play to try again.' : 'This audio could not play. Try again or select another track.');
    });
  }, [invalidatePlay]);

  // Choosing is an explicit play action. Browsing artwork never calls this method.
  const choose = useCallback((trackId: string) => {
    const audio = audioRef.current;
    const nextTrack = playlistRef.current.find((item) => item.id === trackId);
    if (!audio || !nextTrack) return;
    if (selectedRef.current !== nextTrack.id) {
      invalidatePlay();
      audio.pause();
      selectedRef.current = nextTrack.id;
      setSelected(nextTrack.id);
      setCurrentTime(0);
      setMediaDuration(0);
      audio.src = nextTrack.audioUrl;
      audio.load();
    }
    requestPlay(audio);
  }, [invalidatePlay, requestPlay]);

  const next = useCallback(() => {
    const queue = playlistRef.current;
    if (!queue.length) return;
    const index = queue.findIndex((item) => item.id === selectedRef.current);
    choose(queue[(index + 1) % queue.length].id);
  }, [choose]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const queue = playlistRef.current;
    if (!queue.length) return;
    const index = queue.findIndex((item) => item.id === selectedRef.current);
    choose(queue[(index - 1 + queue.length) % queue.length].id);
  }, [choose]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = 0.8;
    audioRef.current = audio;
    const onPlay = () => { setPlaying(true); setLoading(false); setError(''); };
    const onPause = () => { setPlaying(false); setLoading(false); };
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setMediaDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onWaiting = () => { if (!audio.paused) setLoading(true); };
    const onReady = () => setLoading(false);
    const onError = () => {
      invalidatePlay();
      setPlaying(false);
      setLoading(false);
      setError('This audio file is unavailable. Try another track, or retry playback.');
    };
    const onEnded = () => {
      const queue = playlistRef.current;
      const index = queue.findIndex((item) => item.id === selectedRef.current);
      if (index >= 0 && index + 1 < queue.length) choose(queue[index + 1].id);
      else { setPlaying(false); setLoading(false); }
    };
    const events: [string, EventListener][] = [
      ['playing', onPlay], ['pause', onPause], ['timeupdate', onTime],
      ['durationchange', onDuration], ['loadedmetadata', onDuration],
      ['waiting', onWaiting], ['canplay', onReady], ['error', onError], ['ended', onEnded],
    ];
    events.forEach(([event, handler]) => audio.addEventListener(event, handler));
    return () => {
      invalidatePlay();
      events.forEach(([event, handler]) => audio.removeEventListener(event, handler));
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    };
  }, [choose, invalidatePlay]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !selectedRef.current) return;
    if (audio.paused) {
      if (audio.error) audio.load();
      requestPlay(audio);
    } else {
      invalidatePlay();
      audio.pause();
      setLoading(false);
    }
  }, [invalidatePlay, requestPlay]);

  const close = useCallback(() => {
    invalidatePlay();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    selectedRef.current = undefined;
    setSelected(undefined);
    setPlaying(false);
    setLoading(false);
    setError('');
    setCurrentTime(0);
    setMediaDuration(0);
  }, [invalidatePlay]);

  const track = tracks.find((item) => item.id === selected);
  const release = releases.find((item) => item.id === track?.releaseId);
  const duration = mediaDuration || track?.duration || 0;
  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) return;
    const max = Number.isFinite(audio.duration) ? audio.duration : duration;
    if (max <= 0) return;
    audio.currentTime = Math.min(max, Math.max(0, seconds));
    setCurrentTime(audio.currentTime);
  }, [duration]);
  const setVolume = useCallback((value: number) => {
    if (!Number.isFinite(value)) return;
    const level = Math.min(1, Math.max(0, value));
    if (audioRef.current) { audioRef.current.volume = level; audioRef.current.muted = false; }
    updateVolume(level);
    setMuted(false);
  }, []);
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  }, []);

  return <AudioContext.Provider value={{ choose, toggle, close, next, previous, seek, setVolume, toggleMute, track, release, playing, loading, error, currentTime, duration, volume, muted }}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider.');
  return context;
}
