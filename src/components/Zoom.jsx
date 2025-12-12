import { useFrame } from "@react-three/fiber";

function Zoom({ selectedIndex, dataStoreRef }) {
  useFrame((state) => {
    if (selectedIndex == null) return;
    const item = dataStoreRef.current[selectedIndex];
    if (!item) return;
    const avg = item.avg || 0;
    state.camera.fov = 45 - avg / 35;
    state.camera.updateProjectionMatrix();
  });
  return null;
}

export default Zoom;
