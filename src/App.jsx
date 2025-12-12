import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState, useCallback } from "react";
import Experience from "./Experience.jsx";

export default function App() {
  // Help it give the first interaction from user to allow play permission from browser
  const [playUI, setPlayUI] = useState(false);

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
    <div style={{ height: "100vh" }}>
      {playUI && (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            position: "fixed",
            left: 12,
            top: 12,
            width: 240,
            minHeight: 96,
            background: "rgba(0,0,0,0.65)",
            color: "#fff",
            padding: 10,
            borderRadius: 8,
            zIndex: 20,
            fontFamily: "sans-serif",
            fontSize: 13,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div style={{ fontWeight: 600 }}>Upload or drop MP3s</div>
            <button
              onClick={() => {
                const next = !allPlaying;
                setAllPlaying(next);
                setPlayingStates((s) => s.map(() => next));
              }}
              style={{ fontSize: 12, padding: "2px 8px" }}
            >
              {allPlaying ? "Pause All" : "Play All"}
            </button>
          </div>
          <div style={{ marginBottom: 8 }}>
            <input
              type="file"
              accept="audio/*"
              multiple
              onChange={onFileInput}
            />
          </div>
          <div style={{ maxHeight: 200, overflow: "auto" }}>
            {tracks.map((t, i) => (
              <div
                key={(t.url || t) + i}
                style={{
                  fontSize: 12,
                  opacity: 0.95,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="radio"
                    name="zoom"
                    checked={selectedZoom === i}
                    onChange={() => setSelectedZoom(i)}
                  />
                  <div
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 120,
                    }}
                  >
                    {t.name || (t.url || "").split("/").pop()}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => {
                      setPlayingStates((s) => {
                        const next = s.slice();
                        next[i] = !next[i];
                        return next;
                      });
                    }}
                    style={{ fontSize: 11, padding: "2px 6px" }}
                  >
                    {playingStates[i] ? "Pause" : "Play"}
                  </button>
                  <button
                    onClick={() => removeTrack(i)}
                    style={{ fontSize: 11, padding: "2px 6px" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
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
