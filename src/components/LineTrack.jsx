import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Line } from "@react-three/drei";
import { suspend } from "suspend-react";
import createAudio from "../lib/CreateAudio";

function LineTrack({
  url,
  y = 2500,
  space = 2.5,
  width = 0.1,
  height = 0.05,
  obj = new THREE.Object3D(),
  playing = true,
  volume = 0.5,
  onData,
  scale = 1,
  ...props
}) {
  const { context, update, data, gain } = suspend(
    () => createAudio(url),
    [url]
  );
  const lineRef = useRef();
  const ref = useRef();

  useEffect(() => {
    gain.gain.value = volume;
  }, [volume, gain]);

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

  const geometry = useMemo(
    () =>
      new THREE.BoxGeometry(width, height, 0.01).translate(0, height / 2, 0),
    [width, height]
  );

  useEffect(() => {
    playing ? context.resume() : context.suspend();
  }, [playing, context]);

  useEffect(() => {
    return () => {
      context.suspend();
    };
  }, [context]);

  // helper to build smoothed points using CatmullRomCurve3
  const buildCurvePoints = (rawPoints, samplesPerSegment = 6) => {
    const curve = new THREE.CatmullRomCurve3(rawPoints);
    curve.closed = true;
    return curve.getPoints(rawPoints.length * samplesPerSegment);
  };

  useFrame(() => {
    if (!lineRef.current) return;
    if (!ref.current) return;

    // if not playing, freeze geometry (do nothing)
    if (!playing) return;

    const avg = update();
    if (onData) onData(avg, data);

    const radius = 0.1 * scale; // base radius scaled per-track
    const raw = [];
    for (let i = 0; i < data.length; i++) {
      const angle = (i / data.length) * Math.PI * 2;
      const yVal = (data[i] / y) * 10; // tune vertical movement
      raw.push(
        new THREE.Vector3(
          radius * Math.cos(angle),
          yVal,
          radius * Math.sin(angle)
        )
      );

      // Position the instances in a circle
      obj.position.set(radius * Math.cos(angle), 0.1, radius * Math.sin(angle));
      // Make the instances face the center
      obj.lookAt(0, 0, 0);
      obj.scale.set(1, (data[i] / y) * 180, 1);
      obj.updateMatrix();
      ref.current.setMatrixAt(i, obj.matrix);
    }
    const sampled = buildCurvePoints(raw, 8);

    const positions = sampled.flatMap((p) => [p.x, p.y, p.z]);
    lineRef.current.geometry.setPositions(positions);

    if (lineRef.current.material)
      lineRef.current.material.color.setHSL((avg / 500) % 1, 0.75, 0.75);

    if (ref.current.material)
      ref.current.material.color.setHSL(avg / 500, 0.75, 0.75);
    ref.current.instanceMatrix.needsUpdate = true;
  });

  // initial empty geometry
  const initialPoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 32; i++) pts.push(new THREE.Vector3(0, 0, 0));
    return pts;
  }, []);

  return (
    <group>
      <Line
        ref={lineRef}
        points={initialPoints}
        // color="red"
        position={[0, 0.1, 0]}
        lineWidth={2}
        dashed={false}
        {...props}
      />
      <instancedMesh
        castShadow
        ref={ref}
        args={[geometry, null, data.length]}
        geometry={geometry}
        {...props}
      >
        <meshBasicMaterial toneMapped={false} />
        {/* <meshStandardMaterial /> */}
      </instancedMesh>
    </group>
  );
}

export default LineTrack;
