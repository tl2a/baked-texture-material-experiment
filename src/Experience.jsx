import { useEffect, useRef, useState } from "react";
import {
  // Center,
  OrbitControls,
  Sparkles,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useThree } from "@react-three/fiber";
// import { extend, useFrame } from "@react-three/fiber";

export default function Experience() {
  const { camera } = useThree();
  const { nodes } = useGLTF("./model/boxed_exp.glb");

  const bakedTexture = useTexture("./model/baked_exture.png");
  bakedTexture.flipY = false;
  const [touched, setTouched] = useState(false);
  const [clicked, setClicked] = useState(false);
  const cubeRef = useRef();

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

  return (
    <>
      <color args={["#000000"]} attach="background" />

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
        scale={[1.01, 1.01, 1.01]}
        onClick={() => setClicked(true)}
        onPointerEnter={() => setTouched(true)}
        onPointerLeave={() => {
          setTouched(false);
          setClicked(false);
        }}
        ref={cubeRef}
      >
        <meshBasicMaterial transparent opacity={touched ? 0.2 : 0.0} />
      </mesh>

      <mesh
        castShadow
        receiveShadow
        geometry={nodes.plane.geometry}
        material={nodes.plane.material}
      >
        <meshBasicMaterial
          map={bakedTexture}
          // map-flipY={ false }
        />
      </mesh>

      <Sparkles
        size={6}
        scale={[4, 2, 4]}
        position-y={1}
        speed={0.4}
        count={40}
      />
      {/* </Center>*/}
    </>
  );
}
