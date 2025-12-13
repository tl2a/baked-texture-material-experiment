import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState, useCallback } from "react";
import Experience from "./Experience.jsx";
import { Button, Radio } from "./components/ui";

export default function App() {
  // Help it give the first interaction from user to allow play permission from browser
  const [playUI, setPlayUI] = useState(false);
  const [uiCollapsed, setUiCollapsed] = useState(true);

  // default demo tracks (can be appended to when user uploads files)
  const defaultTracks = [
    { url: "/audio/synth.mp3", name: "synth.mp3", isObject: false },
    { url: "/audio/snare.mp3", name: "snare.mp3", isObject: false },
    { url: "/audio/drums.mp3", name: "drums.mp3", isObject: false },
  ];
  const [tracks, setTracks] = useState(defaultTracks);
  const [playingStates, setPlayingStates] = useState(() =>
    defaultTracks.map(() => null),
  );
  const [selectedZoom, setSelectedZoom] = useState(null);
  const dataStoreRef = useRef([]);
  const [allPlaying, setAllPlaying] = useState(null);

  // drop / file handlers
  const onFiles = useCallback((files) => {
    const arr = Array.from(files).filter(
      (f) => f.type.startsWith("audio") || /\.mp3$/i.test(f.name),
    );
    if (arr.length === 0) return;
    const newObjs = arr.map((f) => ({
      url: URL.createObjectURL(f),
      name: f.name,
      isObject: true,
    }));
    // append new uploads to existing tracks
    setTracks((prev) => [...prev, ...newObjs]);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      onFiles(e.dataTransfer.files);
    },
    [onFiles],
  );

  const onFileInput = useCallback(
    (e) => {
      onFiles(e.target.files);
      // reset input so same file can be chosen again if desired
      e.target.value = null;
    },
    [onFiles],
  );

  useEffect(() => {
    return () => {
      // cleanup any object URLs we created on unmount
      tracks.forEach((t) => {
        if (t.isObject && t.url) URL.revokeObjectURL(t.url);
      });
    };
    // we only want this to run on unmount, so eslint-disable-next-line
  }, []);

  // remove a track at index
  const removeTrack = useCallback(
    (index) => {
      setTracks((prev) => {
        const t = prev[index];
        if (t && t.isObject && t.url) URL.revokeObjectURL(t.url);
        const next = prev.slice();
        next.splice(index, 1);
        return next;
      });
    },
    [setTracks],
  );

  return (
    <div className="h-screen">
      {playUI && !uiCollapsed && (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="fixed left-4 top-4 w-80 md:w-96 min-h-[96px] bg-slate-800/70 text-white p-4 rounded-2xl z-30 font-sans text-sm shadow-lg backdrop-blur-sm"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="px-2 py-1">
                <div className="text-sm font-semibold">Upload or drop MP3s</div>
                <div className="text-xs text-slate-400">— audio</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const next = !allPlaying;
                  setAllPlaying(next);
                  setPlayingStates((s) => s.map(() => next));
                }}
                aria-pressed={!!allPlaying}
              >
                {/* play/pause icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                  {allPlaying ? (
                    <>
                      <rect x="6" y="5" width="4" height="14" fill="currentColor" />
                      <rect x="14" y="5" width="4" height="14" fill="currentColor" />
                    </>
                  ) : (
                    <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
                  )}
                </svg>
                <span>{allPlaying ? 'Pause All' : 'Play All'}</span>
              </Button>
              <button
                onClick={() => setUiCollapsed(true)}
                title="Collapse"
                aria-label="Collapse panel"
                className="ml-2 h-8 w-8 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/30"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform transition-transform">
                  <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="flex items-center gap-3 w-full">
              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={onFileInput}
                className="sr-only"
                aria-label="Select audio files"
              />
              <div className="flex-1 flex items-center gap-3 p-2 rounded-lg bg-slate-700/30">
                <div className="text-xs text-slate-200">Select files or drag them here</div>
                <div className="ml-auto">
                  <Button size="sm" variant="primary">Choose</Button>
                </div>
              </div>
            </label>
          </div>

          <div className="max-h-52 overflow-auto">
            {tracks.map((t, i) => (
              <div
                key={(t.url || t) + i}
                className={`flex items-center justify-between gap-3 text-sm opacity-95 py-2 px-2 hover:bg-white/5 rounded ${i % 2 === 0 ? 'bg-slate-900/30' : 'bg-transparent'}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500/80" aria-hidden />
                  <Radio
                    name="zoom"
                    checked={selectedZoom === i}
                    onChange={() => setSelectedZoom(i)}
                    label={(t.name || (t.url || '').split('/').pop())}
                    labelClassName="truncate text-slate-100"
                  />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setPlayingStates((s) => {
                        const next = s.slice();
                        next[i] = !next[i];
                        return next;
                      });
                    }}
                    aria-pressed={!!playingStates[i]}
                    aria-label={playingStates[i] ? `Pause ${t.name || (t.url || '').split('/').pop()}` : `Play ${t.name || (t.url || '').split('/').pop()}`}
                  >
                    {playingStates[i] ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="5" width="4" height="14" fill="currentColor" />
                        <rect x="14" y="5" width="4" height="14" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
                      </svg>
                    )}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeTrack(i)} aria-label={`Remove ${t.name || (t.url || '').split('/').pop()}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-400 hover:text-red-500">
                        <path d="M9 3h6l1 2h4v2H4V5h4l1-2z" fill="currentColor" />
                        <path d="M7 7h10v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7z" fill="currentColor" />
                        <path d="M10 11v5" stroke="rgba(255,255,255,0.9)" strokeWidth="1.4" strokeLinecap="round" />
                        <path d="M14 11v5" stroke="rgba(255,255,255,0.9)" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {playUI && uiCollapsed && (
        <div className="fixed left-0 top-4 h-12 flex items-center z-40">
          <button
            onClick={() => setUiCollapsed(false)}
            title="Open controls"
            aria-label="Expand panel"
            className="h-12 w-10 bg-indigo-600/95 text-white rounded-r-lg shadow-lg flex items-center justify-center transform hover:translate-x-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-0">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      <Canvas
        flat
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [1, 2, 6],
        }}
      >
        <Experience
          allPlaying={allPlaying}
          dataStoreRef={dataStoreRef}
          playingStates={playingStates}
          playUI={playUI}
          selectedZoom={selectedZoom}
          setPlayUI={setPlayUI}
          setAllPlaying={setAllPlaying}
          setPlayingStates={setPlayingStates}
          tracks={tracks}
        />
      </Canvas>
    </div>
  );
}
