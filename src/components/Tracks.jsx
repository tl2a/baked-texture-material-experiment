import { Fragment, Suspense } from "react";
import Track from "./Track";
import Zoom from "./Zoom";
import LineTrack from "./LineTrack";

function Tracks({ playUI, tracks, playingStates, dataStoreRef, selectedZoom, volume }) {
  return (
    <>
      {playUI && (
        <>
          <Suspense fallback={null}>
            {tracks.map((t, i) => {
              // scale and space increase by 0.4 per track
              const scale = 1 + i * 10 + 20;
              const alter = (i + 1) % 2;
              return (
                <Fragment key={(t.url || t) + i}>
                  {alter ? (
                    <Track
                      scale={scale}
                      rotation={[0, i * 10, 0]}
                      url={t.url}
                      playing={playingStates[i]}
                      volume={volume}
                      onData={(avg, data) => {
                        dataStoreRef.current[i] = { avg, data };
                      }}
                    />
                  ) : (
                    <LineTrack
                      scale={scale}
                      rotation={[0, i * 10, 0]}
                      url={t.url}
                      playing={playingStates[i]}
                      volume={volume}
                      onData={(avg, data) => {
                        dataStoreRef.current[i] = { avg, data };
                      }}
                    />
                  )}
                </Fragment>
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
