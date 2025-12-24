import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import Experience from "./Experience.jsx";
import { Button, Radio } from "./components/ui";
import {
  Play,
  Pause,
  Trash2,
  ScanEye,
  PanelLeftClose,
  Volume2,
  VolumeX,
  Settings,
  SkipBack,
  SkipForward,
  ListMusic,
  Box,
  Speaker,
  Activity,
  BarChart2,
  Heart,
} from "lucide-react";
import LoadingScreen from "./components/LoadingScreen";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs.jsx";

export default function App() {
  // Help it give the first interaction from user to allow play permission from browser
  const [playUI, setPlayUI] = useState(false);
  const [uiCollapsed, setUiCollapsed] = useState(true);

  // default demo tracks (can be appended to when user uploads files)
  const defaultTracks = [
    { url: "/audio/Guitar by Cymatics.wav", name: "Guitar by Cymatics", isObject: true },
    { url: "/audio/Bass by Cymatics.wav", name: "Bass by Cymatics", isObject: true },
    { url: "/audio/Key by Cymatics.wav", name: "Key by Cymatics", isObject: true },
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
  const [modelVariation, setModelVariation] = useState("box");
  const [visualizerStyle, setVisualizerStyle] = useState("bar");
  const [playlistMode, setPlaylistMode] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
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

  const handleTrackEnded = useCallback(() => {
    const next = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(next);
    setPlayingStates(tracks.map((_, i) => i === next));
  }, [currentTrackIndex, tracks]);

  return (
    <div className="h-screen">
      <LoadingScreen />
      {playUI && !uiCollapsed && (
        <div className="fixed left-4 top-4 w-80 md:w-96 min-h-[96px] bg-slate-800/90 text-white p-4 rounded-2xl z-30 font-sans text-sm shadow-lg backdrop-blur-sm">
          <Tabs defaultValue="player-setting" className="w-full">
            <TabsList>
              <TabsTrigger value="player-setting">Settings</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
            </TabsList>
            <TabsContent value="player-setting">
              <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="px-2 py-1">
                      <div className="text-sm font-semibold">
                        Upload or drop
                      </div>
                      <div className="text-xs text-slate-400">— audio</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const nextMode = !playlistMode;
                        setPlaylistMode(nextMode);
                        setAllPlaying(false);
                        setPlayingStates(tracks.map(() => false));
                        if (nextMode) setCurrentTrackIndex(0);
                      }}
                      title={playlistMode ? "Disable Playlist Mode" : "Enable Playlist Mode"}
                      className={`h-8 w-8 flex items-center justify-center rounded-full transition-colors ${
                        playlistMode ? "bg-indigo-500 text-white" : "bg-white/6 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      <ListMusic size={16} />
                    </button>

                    {playlistMode ? (
                      <div className="flex items-center bg-slate-700/50 rounded-lg p-0.5">
                        <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-slate-600/50" onClick={() => {
                           const prev = (currentTrackIndex - 1 + tracks.length) % tracks.length;
                           setCurrentTrackIndex(prev);
                           setPlayingStates(tracks.map((_, i) => i === prev));
                        }}>
                          <SkipBack size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-slate-600/50 text-indigo-300" onClick={() => {
                           setPlayingStates(prev => prev.map((_, i) => i === currentTrackIndex ? !prev[i] : false));
                        }}>
                          {playingStates[currentTrackIndex] ? <Pause size={14} /> : <Play size={14} />}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-slate-600/50" onClick={() => {
                           const next = (currentTrackIndex + 1) % tracks.length;
                           setCurrentTrackIndex(next);
                           setPlayingStates(tracks.map((_, i) => i === next));
                        }}>
                          <SkipForward size={14} />
                        </Button>
                      </div>
                    ) : (
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
                        {allPlaying ? <Pause size={14} className="mr-1" /> : <Play size={14} className="mr-1" />}
                        <span>{allPlaying ? "Pause All" : "Play All"}</span>
                      </Button>
                    )}
                    <button
                      onClick={() => setUiCollapsed(true)}
                      title="Collapse"
                      aria-label="Collapse panel"
                      className="ml-2 h-8 w-8 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/30"
                    >
                      <PanelLeftClose
                        size={18}
                        className="transform transition-transform text-slate-100"
                      />
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
                            aria-label={`Stop zoom for ${
                              t.name || (t.url || "").split("/").pop()
                            }`}
                          >
                            <ScanEye size={14} className="text-indigo-300" />
                          </Button>
                        ) : null}
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            if (playlistMode) {
                              setCurrentTrackIndex(i);
                              setPlayingStates(tracks.map((_, idx) => idx === i ? !playingStates[i] : false));
                            } else {
                              setPlayingStates((s) => {
                                const next = s.slice();
                                next[i] = !next[i];
                                return next;
                              });
                            }
                          }}
                          aria-pressed={!!playingStates[i]}
                          aria-label={
                            playingStates[i]
                              ? `Pause ${
                                  t.name || (t.url || "").split("/").pop()
                                }`
                              : `Play ${
                                  t.name || (t.url || "").split("/").pop()
                                }`
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
                          <Trash2
                            size={16}
                            className="text-red-400 hover:text-red-500"
                          />
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
                      <label htmlFor="vol" className="text-slate-200 text-sm">
                        Volume
                      </label>
                      <div className="text-xs text-slate-300">
                        {Math.round(volume * 100)}%
                      </div>
                    </div>
                    <input
                      id="vol"
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-3 bg-slate-900 rounded-lg appearance-none accent-indigo-500"
                      aria-label="Volume"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1">
                      <span>0%</span>
                      <span className="ps-3">50%</span>
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
            </TabsContent>
            <TabsContent value="theme">
              <div className="mt-4 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Model Variation
                    </label>
                    <button
                      onClick={() => setUiCollapsed(true)}
                      title="Collapse"
                      aria-label="Collapse panel"
                      className="ml-2 h-8 w-8 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/30"
                    >
                      <PanelLeftClose
                        size={18}
                        className="transform transition-transform text-slate-100"
                      />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setModelVariation("speaker")}
                      className={`group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                        modelVariation === "speaker"
                          ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                          : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800/60 hover:border-slate-600 hover:text-slate-200"
                      }`}
                    >
                      <Speaker size={24} strokeWidth={1.5} />
                      <span className="text-xs font-medium">Speaker</span>
                    </button>
                    <button
                      onClick={() => setModelVariation("box")}
                      className={`group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                        modelVariation === "box"
                          ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                          : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800/60 hover:border-slate-600 hover:text-slate-200"
                      }`}
                    >
                      <Box size={24} strokeWidth={1.5} />
                      <span className="text-xs font-medium">Box</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Visualizer Style
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setVisualizerStyle("line")}
                      className={`group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                        visualizerStyle === "line"
                          ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                          : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800/60 hover:border-slate-600 hover:text-slate-200"
                      }`}
                    >
                      <Activity size={24} strokeWidth={1.5} />
                      <span className="text-xs font-medium">Line</span>
                    </button>
                    <button
                      onClick={() => setVisualizerStyle("bar")}
                      className={`group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                        visualizerStyle === "bar"
                          ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                          : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800/60 hover:border-slate-600 hover:text-slate-200"
                      }`}
                    >
                      <BarChart2 size={24} strokeWidth={1.5} />
                      <span className="text-xs font-medium">Bar</span>
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            <span>Made with</span>
            <Heart size={10} className="fill-red-500/20 text-red-500" />
            <span>by <span className="text-slate-400"><a href="https://tl2a.in" target="_blank">Arpan</a></span></span>
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
            modelVariation={modelVariation}
            visualizerStyle={visualizerStyle}
            onEnded={playlistMode ? handleTrackEnded : undefined}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
