import { Suspense } from "react";
import Track from "./Track";
import Zoom from "./Zoom";

function Tracks({ playUI, tracks, playingStates, dataStoreRef, selectedZoom }) {
  return (
    <>
      {playUI && (
        <>
          <Suspense fallback={null}>
            {tracks.map((t, i) => {
              // scale and space increase by 0.4 per track
              const scale = 1 + i * 10 + 20;
              return (
                <Track
                  key={(t.url || t) + i}
                  scale={scale}
                  rotation={[0, i * 10, 0]}
                  url={t.url}
                  playing={playingStates[i]}
                  onData={(avg, data) => {
                    dataStoreRef.current[i] = { avg, data };
                  }}
                />
              );
            })}
          </Suspense>
          <Zoom selectedIndex={selectedZoom} dataStoreRef={dataStoreRef} />
        </>
      )}
    </>
  );
}

export default Tracks;
