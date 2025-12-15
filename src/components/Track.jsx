import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { suspend } from "suspend-react";
import createAudio from "../lib/CreateAudio";

function Track({
  url,
  y = 2500,
  space = 2.5,
  width = 0.01,
  height = 0.05,
  obj = new THREE.Object3D(),
  playing = true,
  onData,
  ...props
}) {
  const ref = useRef();
  // suspend-react is the library that r3f uses internally for useLoader. It caches promises and
  // integrates them with React suspense. You can use it as-is with or without r3f.
  const { gain, context, update, data } = suspend(
    () => createAudio(url),
    [url],
  );
  useEffect(() => {
    // Connect the gain node, which plays the audio
    try {
      gain.connect(context.destination);
    } catch (e) {}
    // Disconnect it on unmount
    return () => {
      try {
        gain.disconnect();
      } catch (e) {}
    };
  }, [gain, context]);

  // adjust gain when playing prop changes (mute/unmute to simulate pause)
  useEffect(() => {
    try {
      if (gain && gain.gain) gain.gain.value = playing ? 1 : 0;
    } catch (e) {}
  }, [gain, playing]);

  const geometry = useMemo(
    () =>
      new THREE.BoxGeometry(width, height, 0.01).translate(0, height / 2, 0),
    [width, height],
  );

  useFrame((state) => {
    if (!ref.current) return;
    if (!playing) return; // freeze when not playing
    let avg = update();
    if (onData)
      try {
        onData(avg, data);
      } catch (e) {}
    const radius = 0.1; // The radius of the circle
    // Distribute the instanced planes according to the frequency data
    for (let i = 0; i < data.length; i++) {
      const angle = (i / data.length) * Math.PI * 2;
      // Position the instances in a circle
      obj.position.set(radius * Math.cos(angle), 0, radius * Math.sin(angle));
      // Make the instances face the center
      obj.lookAt(0, 0, 0);
      obj.scale.set(1, (data[i] / y) * 10, 1);
      obj.updateMatrix();
      ref.current.setMatrixAt(i, obj.matrix);
    }
    // Set the hue according to the frequency average
    if (ref.current.material)
      ref.current.material.color.setHSL(avg / 500, 0.75, 0.75);
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      castShadow
      ref={ref}
      args={[null, null, data.length]}
      geometry={geometry}
      {...props}
    >
      <meshBasicMaterial toneMapped={false} />
      {/* <meshStandardMaterial /> */}
    </instancedMesh>
  );
}

export default Track;
