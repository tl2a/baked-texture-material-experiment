import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import Experience from "./Experience.jsx";
// import { EffectComposer, DepthOfField } from "@react-three/postprocessing";

const root = ReactDOM.createRoot(document.querySelector("#root"));

root.render(
  <Canvas
    flat
    camera={{
      fov: 45,
      near: 0.1,
      far: 200,
      position: [1, 2, 6],
    }}
  >
    <Experience />
    {/* Depth of Field effect */}
    {/* <EffectComposer>
      <DepthOfField
        focusDistance={0.2} // Distance to the focal plane
        focalLength={0.5} // Focal length of the lens
        bokehScale={2} // Amount of bokeh blur
        height={480} // Resolution of the effect
      />
    </EffectComposer>*/}
  </Canvas>,
);
