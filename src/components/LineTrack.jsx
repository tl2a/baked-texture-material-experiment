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
  width = 0.01,
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
  const shadowRef = useRef();

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
    }
    const sampled = buildCurvePoints(raw, 8);

    const positions = sampled.flatMap((p) => [p.x, p.y, p.z]);
    lineRef.current.geometry.setPositions(positions);

    // Update shadow line (flatten Y to -0.1)
    if (shadowRef.current) {
      const shadowPositions = sampled.flatMap((p) => [p.x, -0.1, p.z]);
      shadowRef.current.geometry.setPositions(shadowPositions);
    }

    if (lineRef.current.material)
      lineRef.current.material.color.setHSL((avg / 500) % 1, 0.75, 0.75);
  });

  // initial empty geometry
  const initialPoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 32; i++) pts.push(new THREE.Vector3(0, 0, 0));
    return pts;
  }, []);

  return (
    <Line
      ref={lineRef}
      points={initialPoints}
      // color="red"
      position={[0, 0.1, 0]}
      lineWidth={2}
      dashed={false}
      {...props}
    />
  );
}

export default LineTrack;
