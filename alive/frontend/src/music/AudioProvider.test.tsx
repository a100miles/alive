import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Release, Track } from '../types';
import { AudioProvider, useAudio } from './AudioProvider';

const releases: Release[] = [{ id: 'r', title: 'Test release', artist: 'Demo artist', year: 2026, type: 'EP', description: 'Demo', coverImage: '', trackIds: ['one', 'two', 'silent'], published: true, demo: true }];
const tracks: Track[] = [
  { id: 'one', releaseId: 'r', title: 'First', audioUrl: '/media/first.wav', duration: 30, order: 1, demo: true },
  { id: 'two', releaseId: 'r', title: 'Second', audioUrl: '/media/second.wav', duration: 30, order: 2, demo: true },
  { id: 'silent', releaseId: 'r', title: 'Silent', audioUrl: '', duration: 0, order: 3, demo: true },
];

class MockAudio extends EventTarget {
  src = '';
  preload = '';
  volume = 1;
  muted = false;
  paused = true;
  currentTime = 0;
  duration = 30;
  error: MediaError | null = null;
  load = vi.fn();
  play = vi.fn(() => { this.paused = false; this.dispatchEvent(new Event('playing')); return Promise.resolve(); });
  pause = vi.fn(() => { this.paused = true; this.dispatchEvent(new Event('pause')); });
  removeAttribute = vi.fn((attribute: string) => { if (attribute === 'src') this.src = ''; });
}

function Probe({ page = 'music' }: { page?: string }) {
  const audio = useAudio();
  return <>
    <span>{page}</span><span data-testid="selected">{audio.track?.id || 'none'}</span>
    <span data-testid="state">{audio.playing ? 'playing' : 'paused'}</span>
    <span data-testid="error">{audio.error}</span><span data-testid="time">{audio.currentTime}</span>
    <button onClick={() => audio.choose('one')}>First</button><button onClick={() => audio.choose('two')}>Second</button>
    <button onClick={() => audio.choose('silent')}>Silent</button><button onClick={audio.toggle}>Toggle</button>
    <button onClick={audio.next}>Next</button><button onClick={() => audio.seek(999)}>Seek</button>
  </>;
}

describe('persistent audio ownership', () => {
  let media: MockAudio;
  let factory: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    media = new MockAudio();
    factory = vi.fn(function () { return media; });
    vi.stubGlobal('Audio', factory);
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it('waits for explicit play and keeps the same audio across page and data rerenders', async () => {
    const view = render(<AudioProvider releases={releases} tracks={tracks}><Probe /></AudioProvider>);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(media.play).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('First'));
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('playing'));
    expect(media.src).toBe('/media/first.wav');
    view.rerender(<AudioProvider releases={[...releases]} tracks={[...tracks]}><Probe page="photography" /></AudioProvider>);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('selected').textContent).toBe('one');
    expect(screen.getByTestId('state').textContent).toBe('playing');
  });

  it('skips missing audio, advances on completion, and stops at the last available track', async () => {
    render(<AudioProvider releases={releases} tracks={tracks}><Probe /></AudioProvider>);
    fireEvent.click(screen.getByText('Silent'));
    expect(media.play).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('First'));
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('playing'));
    act(() => { media.dispatchEvent(new Event('ended')); });
    await waitFor(() => expect(screen.getByTestId('selected').textContent).toBe('two'));
    act(() => { media.dispatchEvent(new Event('ended')); });
    expect(screen.getByTestId('state').textContent).toBe('paused');
    expect(media.play).toHaveBeenCalledTimes(2);
  });

  it('ignores an old play rejection when the listener selects another track', async () => {
    let rejectFirst: (reason: Error) => void = () => undefined;
    media.play.mockImplementationOnce(() => new Promise<void>((_resolve, reject) => { rejectFirst = reject; }));
    render(<AudioProvider releases={releases} tracks={tracks}><Probe /></AudioProvider>);
    fireEvent.click(screen.getByText('First'));
    fireEvent.click(screen.getByText('Second'));
    await act(async () => { rejectFirst(new Error('superseded')); await Promise.resolve(); });
    expect(screen.getByTestId('selected').textContent).toBe('two');
    expect(screen.getByTestId('state').textContent).toBe('playing');
    expect(screen.getByTestId('error').textContent).toBe('');
  });

  it('reports file errors, clamps seeks to duration, and stops its audio on unmount', async () => {
    const view = render(<AudioProvider releases={releases} tracks={tracks}><Probe /></AudioProvider>);
    fireEvent.click(screen.getByText('First'));
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('playing'));
    fireEvent.click(screen.getByText('Seek'));
    expect(media.currentTime).toBe(30);
    act(() => { media.dispatchEvent(new Event('error')); });
    expect(screen.getByTestId('error').textContent).toContain('unavailable');
    expect(screen.getByTestId('state').textContent).toBe('paused');
    view.unmount();
    expect(media.paused).toBe(true);
    expect(media.src).toBe('');
  });
});
