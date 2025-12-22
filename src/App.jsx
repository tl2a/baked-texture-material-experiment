import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import Experience from "./Experience.jsx";
import { Button, Radio } from "./components/ui";
import { Play, Pause, Trash2, ChevronLeft, ChevronRight, Target, ScanEye, Bolt, PanelLeftClose, Volume2, VolumeX, Settings } from "lucide-react";
import LoadingScreen from "./components/LoadingScreen";

export default function App() {
  // Help it give the first interaction from user to allow play permission from browser
  const [playUI, setPlayUI] = useState(false);
  const [uiCollapsed, setUiCollapsed] = useState(true);

  // default demo tracks (can be appended to when user uploads files)
  const defaultTracks = [
    { url: "/audio/synth.mp3", name: "synth.mp3", isObject: true },
    { url: "/audio/snare.mp3", name: "snare.mp3", isObject: true },
    { url: "/audio/drums.mp3", name: "drums.mp3", isObject: true },
  ];
  const [tracks, setTracks] = useState(defaultTracks);
  const [playingStates, setPlayingStates] = useState(() =>
    defaultTracks.map(() => null)
  );
  const [selectedZoom, setSelectedZoom] = useState(null);
  const dataStoreRef = useRef([]);
  const [allPlaying, setAllPlaying] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const prevVolumeRef = useRef(volume);
  const fileInputRef = useRef(null);

  // drop / file handlers
  const onFiles = useCallback((files) => {
    const arr = Array.from(files).filter(
      (f) => f.type.startsWith("audio") || /\.mp3$/i.test(f.name)
    );
    if (arr.length === 0) return;
    const newObjs = arr.map((f) => ({
      url: URL.createObjectURL(f),
      name: f.name,
      isObject: true,
    }));
    // append new uploads to existing tracks
    setTracks(newObjs);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      onFiles(e.dataTransfer.files);
    },
    [onFiles]
  );

  const onFileInput = useCallback(
    (e) => {
      onFiles(e.target.files);
      // reset input so same file can be chosen again if desired
      e.target.value = null;
    },
    [onFiles]
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
    [setTracks]
  );

  return (
    <div className="h-screen">
      <LoadingScreen />
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
                {allPlaying ? (
                  <Pause size={14} className="mr-1" />
                ) : (
                  <Play size={14} className="mr-1" />
                )}
                <span>{allPlaying ? "Pause All" : "Play All"}</span>
              </Button>
              <button
                onClick={() => setUiCollapsed(true)}
                title="Collapse"
                aria-label="Collapse panel"
                className="ml-2 h-8 w-8 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/30"
              >
                <PanelLeftClose size={18} className="transform transition-transform text-slate-100" />
              </button>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-3 w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={onFileInput}
                className="sr-only"
                aria-label="Select audio files"
              />
              <div className="flex-1 flex items-center gap-3 p-2 rounded-lg bg-slate-700/30">
                <div className="text-xs text-slate-200">
                  Select files or drag them here
                </div>
                <div className="ml-auto">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => fileInputRef.current?.click()}
                    aria-haspopup="dialog"
                  >
                    Choose
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-h-52 overflow-auto">
            {tracks.map((t, i) => (
              <div
                key={(t.url || t) + i}
                className={`flex items-center justify-between gap-3 text-sm opacity-95 py-2 px-2 hover:bg-white/5 rounded ${
                  i % 2 === 0 ? "bg-slate-900/30" : "bg-transparent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Radio
                    name="zoom"
                    checked={selectedZoom === i}
                    onChange={() => setSelectedZoom(i)}
                    label={t.name || (t.url || "").split("/").pop()}
                    labelClassName="truncate text-slate-100 w-32 inline-block align-middle"
                  />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {selectedZoom === i ? (
                    <Button
                    variant="default"
                    size="sm"
                      onClick={() => setSelectedZoom(null)}
                      title="Stop Zoom"
                      aria-label={`Stop zoom for ${t.name || (t.url || "").split("/").pop()}`}
                    >
                      <ScanEye size={14} className="text-indigo-300" />
                    </Button>
                  ) : null}
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
                    aria-label={
                      playingStates[i]
                        ? `Pause ${t.name || (t.url || "").split("/").pop()}`
                        : `Play ${t.name || (t.url || "").split("/").pop()}`
                    }
                  >
                    {playingStates[i] ? (
                          <Pause size={14} />
                    ) : (
                          <Play size={14} />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTrack(i)}
                    aria-label={`Remove ${
                      t.name || (t.url || "").split("/").pop()
                    }`}
                  >
                    <Trash2 size={16} className="text-red-400 hover:text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          

          {/* Volume control (enhanced) */}
          <div className="flex items-center gap-3 mt-8 mb-4 text-sm">
            <button
              type="button"
              onClick={() => {
                if (volume > 0) {
                  prevVolumeRef.current = volume;
                  setVolume(0);
                } else {
                  setVolume(prevVolumeRef.current || 0.5);
                }
              }}
              aria-label={volume > 0 ? "Mute" : "Unmute"}
              className="h-8 w-8 flex items-center justify-center rounded-md bg-white/4 hover:bg-white/6 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
            >
              {volume > 0 ? (
                <Volume2 size={16} className="text-indigo-300" />
              ) : (
                <VolumeX size={16} className="text-slate-300" />
              )}
            </button>

            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="vol" className="text-slate-200 text-sm">Volume</label>
                <div className="text-xs text-slate-300">{Math.round(volume * 100)}%</div>
              </div>
              <input
                id="vol"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none accent-indigo-500"
                aria-label="Volume"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setVolume(0.5)}
              aria-label="Reset volume"
            >
              Reset
            </Button>
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
            <Settings size={20} className="rotate-0" />
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
        <Suspense fallback={null}>
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
            volume={volume}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
