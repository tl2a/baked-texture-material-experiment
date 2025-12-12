export default function TexturedEnv() {
  return (
    <>
      <color args={["#000000"]} attach="background" />
      <spotLight
        position={[0, 4, -6]}
        angle={0.1}
        penumbra={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      {/* <ambientLight intensity={1} />
    <directionalLight castShadow position={[5, 10, 5]} intensity={1} />*/}

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
    </>
  );
}
