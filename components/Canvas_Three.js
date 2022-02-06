import ReactDOM from "react-dom";
import React, { useRef, useState, Suspense, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame, useLoader } from "@react-three/fiber";
import {
  Reflector,
  CameraShake,
  OrbitControls,
  useTexture,
  useGLTF,
} from "@react-three/drei";
import { KernelSize } from "postprocessing";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

function Triangle({ color, ...props }) {
  const ref = useRef();
  const [r] = useState(() => Math.random() * 10000);
  useFrame((_) => {
    ref.current.position.y = -1.75 + Math.sin(_.clock.elapsedTime + r) / 10;
  });
  const { paths: [path] } = useLoader(SVGLoader, './triangle2.svg') // prettier-ignore
  const geom = useMemo(
    () =>
      SVGLoader.pointsToStroke(
        path.subPaths[0].getPoints(),
        path.userData.style
      ),
    []
  );
  return (
    <group ref={ref}>
      <mesh geometry={geom} {...props}>
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Rig({ children }) {
  const ref = useRef();
  const vec = new THREE.Vector3();
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.lerp(vec.set(mouse.x * 2, 0, 10), 0.05);
    ref.current.position.lerp(vec.set(mouse.x * 1, mouse.y * 0.1, 0), 0.1);
    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y,
      (-mouse.x * Math.PI) / 20,
      0.1
    );
  });
  return <group ref={ref}>{children}</group>;
}

function Ground(props) {
  const [floor, normal] = useTexture([
    "./SurfaceImperfections003_1K_var1.jpg",
    "./SurfaceImperfections003_1K_Normal.jpg",
  ]);
  return (
    <Reflector resolution={1024} args={[8, 8]} {...props}>
      {(Material, props) => (
        <Material
          color="#f0f0f0"
          metalness={0}
          roughnessMap={floor}
          normalMap={normal}
          normalScale={[2, 2]}
          {...props}
        />
      )}
    </Reflector>
  );
}

function GlbObj1({ ...props }) {
  const group = useRef();
  const { nodes, materials } = useGLTF("./test1.glb");
  useFrame((_) => {
    group.current.position.y =
      Math.sin(_.clock.elapsedTime + Math.random() * 0.1) * 1.5 + 1;
    group.current.position.x =
      Math.sin(_.clock.elapsedTime + Math.random() * 0.1) * 1.5 + 8;
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sphere.geometry}
        material={materials["Material.001"]}
        position={[-0.24, 0.07, 0.01]}
        scale={0.08}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.BezierCurve.geometry}
        material={materials["Material.002"]}
        position={[-0.23, 0.15, 0.01]}
        rotation={[Math.PI / 2, 1.21, 0]}
        scale={[0.03, 0.03, 0.03]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sphere001.geometry}
        material={materials["Material.003"]}
        position={[-0.25, 0.16, 0.01]}
        rotation={[1.88, -1.06, 1.85]}
        scale={[0, 0.02, 0.01]}
      />
    </group>
  );
}

export default function Canvas_Three(props) {
  return (
    <Canvas camera={{ position: [0, 0, 20] }}>
      <color attach="background" args={["blue"]} />
      <ambientLight />
      <pointLight color="white" intensity={5} position={[10, 10, 10]} />
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      <Suspense fallback={null}>
        <GlbObj1 scale={30} position={[3, 0, -10]} />
        <Rig>
          <Triangle
            color="#ff2060"
            scale={0.06}
            rotation={[0, 0, Math.PI / 3]}
          />
          <Triangle
            color="cyan"
            scale={0.06}
            position={[2, 0, -2]}
            rotation={[0, 0, Math.PI / 3]}
          />
          <Triangle
            color="orange"
            scale={0.06}
            position={[-2, 0, -2]}
            rotation={[0, 0, Math.PI / 3]}
          />
          <Triangle
            color="white"
            scale={0.06}
            position={[0, 2, -10]}
            rotation={[0, 0, Math.PI / 3]}
          />
          <Ground
            mirror={1}
            blur={[500, 100]}
            mixBlur={12}
            mixStrength={1.5}
            rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            scale={10}
            position-y={-0.8}
          />
        </Rig>
        <EffectComposer multisampling={8}>
          <Bloom
            kernelSize={3}
            luminanceThreshold={0}
            luminanceSmoothing={0.4}
            intensity={0.6}
          />
          <Bloom
            kernelSize={KernelSize.HUGE}
            luminanceThreshold={0}
            luminanceSmoothing={0}
            intensity={0.8}
          />
        </EffectComposer>
      </Suspense>
      <CameraShake
        yawFrequency={0.2}
        pitchFrequency={0.2}
        rollFrequency={0.2}
      />
    </Canvas>
  );
}
