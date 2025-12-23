import * as THREE from "three";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  OrbitControls,
  Outlines,
  Sparkles,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useThree } from "@react-three/fiber";
import { Autofocus, Bloom, EffectComposer } from "@react-three/postprocessing";
import { button, folder, Leva, useControls } from "leva";
import Tracks from "./components/Tracks";

export default function Experience({
  allPlaying,
  dataStoreRef,
  playingStates,
  playUI,
  selectedZoom,
  setPlayUI,
  setAllPlaying,
  setPlayingStates,
  tracks,
  volume,
  modelVariation,
  visualizerStyle,
  onEnded,
}) {
  const { camera } = useThree();
  const { nodes: speaker } = useGLTF("./model/speaker.glb");
  const { nodes: box } = useGLTF("./model/textured_box.glb");

  const bakedTexture_speaker = useTexture("./model/final_texture.png");
  const bakedTexture_box = useTexture("./model/final_texture_vox.png");

  bakedTexture_speaker.flipY = false;
  bakedTexture_box.flipY = false;

  const [touched, setTouched] = useState(false);
  const [clicked, setClicked] = useState(false);
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
        z: 8,
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
        "<"
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
      "<"
    ); // Starts with the previous animation
  }, [camera]);

  const { update, ...autofocusConfig } = useControls({
    target: { value: [-1, 1, 0.6], optional: true, disabled: true },
    mouse: false,
    // debug: { value: 0.02, min: 0, max: 0.15, optional: true },
    smoothTime: { value: 0.5, min: 0, max: 1 },
    manual: false,
    "update (manual only)": button((get) => {
      autofocusRef.current.update();
    }),
    DepthOfField: folder(
      {
        focusRange: { min: 0, max: 1, value: 0.9 },
        bokehScale: { min: 0, max: 50, value: 2.5 },
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
      { collapsed: true }
    ),
  });

  const showLeva = new URLSearchParams(window.location.search).has("debug");

  return (
    <>
      {showLeva ? null : <Leva hidden />}
      <color args={["#000000"]} attach="background" />
      {/* <spotLight
        position={[0, 4, -6]}
        angle={0.1}
        penumbra={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      /> */}
      {/* <ambientLight intensity={4} /> */}
      {/* <directionalLight castShadow position={[5, 10, 5]} intensity={1} /> */}

      <OrbitControls
        makeDefault
        // Azimuthal angle (horizontal rotation) limits.
        // Here we are limiting rotation to 90 degrees left and right from the center.
        // To disable, comment out or set to Infinity.
        minAzimuthAngle={-Math.PI / 6.5}
        maxAzimuthAngle={Math.PI / 1.5}
        // Polar angle (vertical rotation) limits.
        // Here we are limiting vertical rotation from 45 degrees at the top
        // to 90 degrees at the bottom (ground level).
        // To disable, comment out or set min to 0 and max to Math.PI.
        // minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
        // Zoom limits.
        // To disable, comment out or set min to 0 and max to Infinity.
        minDistance={6} // How close you can zoom in.
        maxDistance={10} // How far you can zoom out.
        enablePan={false}
      />

      {/* <mesh scale={ 1.5 }>
            <boxGeometry />
            <meshNormalMaterial />
        </mesh> */}

      {/* <Center>*/}

      {modelVariation == "speaker" && (
        <>
          <mesh
            castShadow
            receiveShadow
            geometry={speaker.body.geometry}
            material={speaker.body.material}
            rotation={[0, -0.449, 0]}
            position={[0, -0.0001, 0]}
          >
            <meshBasicMaterial
              map={bakedTexture_speaker}
              color="#efefef"
              // map-flipY={ false }
            />
          </mesh>

          <mesh
            castShadow
            receiveShadow
            geometry={speaker.inside_net.geometry}
            material={speaker.inside_net.material}
            rotation={[0, -0.449, 0]}
            position={[0, -0.0001, 0]}
          >
            <meshBasicMaterial
              // map={bakedTexture}
              // map-flipY={ false }
              color="black"
            />
          </mesh>

          <mesh
            castShadow
            receiveShadow
            geometry={speaker.sound_net.geometry}
            material={speaker.sound_net.material}
            rotation={[0, -0.449, 0]}
            position={[0, -0.0001, 0]}
          >
            <meshBasicMaterial map={bakedTexture_speaker} color="#efefef" />
          </mesh>
          <mesh
            castShadow
            receiveShadow
            geometry={speaker.body.geometry}
            material={speaker.body.material}
            rotation={[0, -0.449, 0]}
            scale={[1.005, 1.005, 1.005]}
            position={[0, -0.0001, 0]}
            onClick={() => {
              const next = !allPlaying;
              setClicked(true);
              setPlayUI(true);
              setAllPlaying(next);
              setPlayingStates((s) => s.map(() => next));
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
            geometry={speaker.Plane.geometry}
            material={speaker.Plane.material}
            position={[0, -0.0001, 0]}
          >
            <meshBasicMaterial map={bakedTexture_speaker} color="#efefef" />
          </mesh>
        </>
      )}

      {modelVariation == "box" && (
        <>
          <mesh
            castShadow
            receiveShadow
            geometry={box.Cube.geometry}
            material={box.Cube.material}
            rotation={[0, -0.449, 0]}
            position={[0, -0.0001, 0]}
          >
            <meshBasicMaterial map={bakedTexture_box} color="#efefef" />
          </mesh>

          <mesh
            castShadow
            receiveShadow
            geometry={box.Cube.geometry}
            material={box.Cube.material}
            rotation={[0, -0.449, 0]}
            scale={[1.005, 1.005, 1.005]}
            position={[0, -0.0001, 0]}
            onClick={() => {
              const next = !allPlaying;
              setClicked(true);
              setPlayUI(true);
              setAllPlaying(next);
              setPlayingStates((s) => s.map(() => next));
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
            geometry={box.Plane_cube.geometry}
            material={box.Plane_cube.material}
            position={[0, -0.0001, 0]}
          >
            <meshBasicMaterial map={bakedTexture_box} color="#efefef" />
          </mesh>
        </>
      )}

      <Tracks
        playUI={playUI}
        tracks={tracks}
        playingStates={playingStates}
        dataStoreRef={dataStoreRef}
        selectedZoom={selectedZoom}
        volume={volume}
        style={visualizerStyle}
        onEnded={onEnded}
      />

      {/* <Sparkles
        size={4}
        scale={[6, 4, 6]}
        position-y={1}
        speed={0.4}
        count={40}
      /> */}
      {/* </Center>*/}

      {/* Depth of Field effect */}
      <EffectComposer>
        <Autofocus ref={autofocusRef} {...autofocusConfig} />
        <Bloom
          luminanceThreshold={0.6}
          mipmapBlur
          intensity={0.5}
          radius={0.6}
        />
      </EffectComposer>
    </>
  );
}
