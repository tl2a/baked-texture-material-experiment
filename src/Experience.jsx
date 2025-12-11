import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  // Center,
  OrbitControls,
  Outlines,
  Sparkles,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useFrame, useThree } from "@react-three/fiber";
import { Autofocus, EffectComposer } from "@react-three/postprocessing";
import { button, folder, Leva, useControls } from "leva";
// import { extend, useFrame } from "@react-three/fiber";
import { suspend } from "suspend-react";

export default function Experience() {
  const { camera } = useThree();
  const { nodes } = useGLTF("./model/boxed_exp.glb");

  const bakedTexture = useTexture("./model/baked_exture.png");
  bakedTexture.flipY = false;
  const [touched, setTouched] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [play, setPlay] = useState(false);
  const cubeRef = useRef();
  const autofocusRef = useRef();

  // Use the useGSAP hook to scope animations and handle cleanup
  useGSAP(() => {
    // Animate the scale of the mesh reference
    // The target object is meshRef.current.scale
    const tl = gsap.timeline();

    if (clicked) {
      tl.to(camera.position, {
        duration: 1.2,
        x: 5,
        y: 4,
        z: 4,
        ease: "power2.inOut",
      }).to(
        camera.rotation,
        {
          duration: 1.2,
          x: Math.PI / 8,
          y: Math.PI / 2,
          z: 0,
          ease: "power2.inOut",
          onUpdate: () => camera.updateProjectionMatrix(),
        },
        "<",
      ); // Starts with the previous animation
    }
  }, [clicked]); // Re-run animation when 'clicked' state changes

  useEffect(() => {
    const tl = gsap.timeline();

    tl.to(camera.position, {
      duration: 1.5,
      x: 10,
      y: 5,
      z: 10,
      ease: "power2.inOut",
    }).to(
      camera.rotation,
      {
        duration: 1.5,
        x: Math.PI / 8,
        y: Math.PI / 4,
        z: 0,
        ease: "power2.inOut",
        onUpdate: () => camera.updateProjectionMatrix(),
      },
      "<",
    ); // Starts with the previous animation
  }, [camera]);

  const { update, ...autofocusConfig } = useControls({
    target: { value: [-1, 1, 0.6], optional: true, disabled: true },
    mouse: false,
    debug: { value: 0.02, min: 0, max: 0.15, optional: true },
    smoothTime: { value: 0.5, min: 0, max: 1 },
    manual: false,
    "update (manual only)": button((get) => {
      autofocusRef.current.update();
    }),
    DepthOfField: folder(
      // https://pmndrs.github.io/postprocessing/public/docs/class/src/effects/DepthOfFieldEffect.js~DepthOfFieldEffect.html#instance-constructor-constructor
      {
        focusRange: { min: 0, max: 1, value: 0.95 },
        bokehScale: { min: 0, max: 50, value: 4 },
        width: {
          value: 512,
          min: 256,
          max: 2048,
          step: 256,
          optional: true,
          disabled: true,
        },
        height: {
          value: 512,
          min: 256,
          max: 2048,
          step: 256,
          optional: true,
          disabled: true,
        },
      },
      { collapsed: true },
    ),
  });

  const showLeva = new URLSearchParams(window.location.search).has("debug");

  return (
    <>
      {showLeva ? null : <Leva hidden />}
      <color args={["#000000"]} attach="background" />
      <spotLight
        position={[0, 4, -6]}
        angle={0.1}
        penumbra={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <ambientLight intensity={1} />
      <directionalLight castShadow position={[5, 10, 5]} intensity={1} />

      <OrbitControls
        makeDefault
        // Azimuthal angle (horizontal rotation) limits.
        // Here we are limiting rotation to 90 degrees left and right from the center.
        // To disable, comment out or set to Infinity.
        minAzimuthAngle={-Math.PI / 6}
        maxAzimuthAngle={Math.PI / 1.5}
        // Polar angle (vertical rotation) limits.
        // Here we are limiting vertical rotation from 45 degrees at the top
        // to 90 degrees at the bottom (ground level).
        // To disable, comment out or set min to 0 and max to Math.PI.
        // minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
        // Zoom limits.
        // To disable, comment out or set min to 0 and max to Infinity.
        minDistance={5} // How close you can zoom in.
        maxDistance={10} // How far you can zoom out.
      />

      {/* <mesh scale={ 1.5 }>
            <boxGeometry />
            <meshNormalMaterial />
        </mesh> */}

      {/* <Center>*/}
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.cube.geometry}
        material={nodes.cube.material}
        rotation={[0, -0.449, 0]}
        position={[0, -0.0001, 0]}
      >
        <meshBasicMaterial
          map={bakedTexture}
          // map-flipY={ false }
        />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.cube.geometry}
        material={nodes.cube.material}
        rotation={[0, -0.449, 0]}
        scale={[1.005, 1.005, 1.005]}
        position={[0, -0.0001, 0]}
        onClick={() => {
          setClicked(true);
          setPlay(true);
        }}
        onPointerEnter={() => setTouched(true)}
        onPointerLeave={() => {
          setTouched(false);
          setClicked(false);
        }}
        ref={cubeRef}
      >
        <meshBasicMaterial
          transparent
          color="blue"
          opacity={touched ? 0.1 : 0.0}
          // opacity={0.0}
        />
        {touched ? (
          <Outlines thickness={0.08} opacity={0.6} color="blue" />
        ) : null}
      </mesh>

      <mesh
        castShadow
        receiveShadow
        geometry={nodes.plane.geometry}
        material={nodes.plane.material}
        position={[0, -0.0001, 0]}
      >
        <meshBasicMaterial
          map={bakedTexture}
          // map-flipY={ false }
        />
        {/* <meshStandardMaterial
          map={bakedTexture}
          // map-flipY={ false }
        />*/}
      </mesh>

      {play && (
        <Suspense fallback={null}>
          <Track scale={20} url="/audio/synth.mp3" />
          <Track scale={30} url="/audio/snare.mp3" />
          <Track scale={40} url="/audio/drums.mp3" />
        </Suspense>
      )}

      <Sparkles
        size={4}
        scale={[6, 4, 6]}
        position-y={1}
        speed={0.4}
        count={40}
      />
      {/* </Center>*/}

      {/* Depth of Field effect */}
      <EffectComposer>
        <Autofocus ref={autofocusRef} {...autofocusConfig} />
      </EffectComposer>
    </>
  );
}

function Track({
  url,
  y = 2500,
  space = 2.5,
  width = 0.01,
  height = 0.05,
  obj = new THREE.Object3D(),
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
    gain.connect(context.destination);
    // Disconnect it on unmount
    return () => gain.disconnect();
  }, [gain, context]);

  const geometry = useMemo(
    () =>
      new THREE.BoxGeometry(width, height, 0.01).translate(0, height / 2, 0),
    [width, height],
  );

  useFrame((state) => {
    let avg = update();
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
    </instancedMesh>
  );
}

async function createAudio(url) {
  // Fetch audio data and create a buffer source
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const source = context.createBufferSource();
  source.buffer = await new Promise((res) =>
    context.decodeAudioData(buffer, res),
  );
  source.loop = true;
  // This is why it doesn't run in Safari 🍏🐛. Start has to be called in an onClick event
  // which makes it too awkward for a little demo since you need to load the async data first
  source.start(0);
  // Create gain node and an analyser
  const gain = context.createGain();
  const analyser = context.createAnalyser();
  analyser.fftSize = 64;
  source.connect(analyser);
  analyser.connect(gain);
  // The data array receive the audio frequencies
  const data = new Uint8Array(analyser.frequencyBinCount);
  return {
    context,
    source,
    gain,
    data,
    // This function gets called every frame per audio source
    update: () => {
      analyser.getByteFrequencyData(data);
      // Calculate a frequency average
      return (data.avg = data.reduce(
        (prev, cur) => prev + cur / data.length,
        0,
      ));
    },
  };
}
