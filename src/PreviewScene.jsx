import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useImperativeHandle, useMemo, useRef } from "react";
import * as THREE from "three";
import ProductGeometry from "./ProductGeometry.jsx";

function ProductModel({ exhibit, setting, isOn }) {
  const model = useRef(null);
  const baseY = useRef(null);
  const color = exhibit.color ?? "#d8a56c";
  const vesselGeometry = useMemo(() => {
    const rim = 0.18 + setting * 0.0015;
    const points = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.34, 0.08),
      new THREE.Vector2(0.48, 0.34),
      new THREE.Vector2(0.3, 0.66),
      new THREE.Vector2(0.37, 1.06),
      new THREE.Vector2(0.24, 1.32),
      new THREE.Vector2(rim, 1.42),
    ];
    return new THREE.LatheGeometry(points, 24);
  }, [setting]);
  useFrame(({ clock }, delta) => {
    if (!model.current) return;
    if (baseY.current === null) baseY.current = model.current.position.y;
    if (isOn) model.current.rotation.y += delta * 0.18;
    model.current.position.y = baseY.current + Math.sin(clock.elapsedTime * 0.7) * 0.025;
  });

  if (exhibit.kind === "pull-toy") {
    return (
      <group ref={model} position={[0, 0, 0]} scale={1.1}>
        <ProductGeometry exhibit={exhibit} setting={setting} />
      </group>
    );
  }

  if (exhibit.kind === "convertible-chair") {
    return (
      <group ref={model} position={[0, -0.08, 0]} scale={1}>
        <ProductGeometry exhibit={exhibit} setting={setting} />
      </group>
    );
  }

  if (exhibit.kind === "shell-chair") {
    return (
      <group ref={model} position={[0, -0.08, 0]} scale={1.1}>
        <ProductGeometry exhibit={exhibit} setting={setting} />
      </group>
    );
  }

  if (exhibit.kind === "vessel") {
    return (
      <group ref={model} position={[0, -0.74, 0]}>
        <mesh geometry={vesselGeometry}>
          <meshStandardMaterial color={color} roughness={0.28} metalness={0.12} />
        </mesh>
        <mesh position={[0, 1.41, 0]}>
          <torusGeometry args={[0.2 + setting * 0.0015, 0.035, 8, 24]} />
          <meshStandardMaterial color="#f0ddbd" roughness={0.3} />
        </mesh>
        <mesh position={[0.38, 0.82, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.3, 0.06, 10, 28, Math.PI * 1.72]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </mesh>
      </group>
    );
  }

  if (exhibit.kind === "scooter") {
    const handlebarWidth = 0.4 + setting * 0.002;
    return (
      <group ref={model} position={[0, -0.52, 0]}>
        <mesh position={[0, 0.47, 0]}>
          <boxGeometry args={[1.18, 0.14, 0.3]} />
          <meshStandardMaterial color={color} metalness={0.32} roughness={0.34} />
        </mesh>
        {[-0.58, 0.58].map((x) => (
          <group key={x} position={[x, 0.22, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.14, 20]} />
              <meshStandardMaterial color="#292d2b" roughness={0.7} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.15, 0.025, 8, 18]} />
              <meshStandardMaterial color="#b4a98f" metalness={0.5} roughness={0.35} />
            </mesh>
          </group>
        ))}
        <mesh position={[-0.48, 0.84, 0]}>
          <cylinderGeometry args={[0.045, 0.055, 0.76, 10]} />
          <meshStandardMaterial color="#c9c4b8" metalness={0.7} roughness={0.32} />
        </mesh>
        <mesh position={[-0.48, 1.24, 0]}>
          <boxGeometry args={[handlebarWidth, 0.06, 0.09]} />
          <meshStandardMaterial color="#c9c4b8" metalness={0.7} roughness={0.32} />
        </mesh>
      </group>
    );
  }

  if (exhibit.kind === "chair") {
    const recline = -0.12 - setting * 0.0025;
    return (
      <group ref={model} position={[0, -0.62, 0]}>
        <mesh position={[0, 0.63, 0]}>
          <boxGeometry args={[1.12, 0.24, 0.82]} />
          <meshStandardMaterial color={color} roughness={0.76} />
        </mesh>
        <mesh position={[0, 1.14, -0.29]} rotation={[recline, 0, 0]}>
          <boxGeometry args={[1.12, 0.92, 0.2]} />
          <meshStandardMaterial color={color} roughness={0.76} />
        </mesh>
        {[-0.4, 0.4].flatMap((x) => [-0.28, 0.28].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.27, z]}>
            <cylinderGeometry args={[0.045, 0.055, 0.64, 8]} />
            <meshStandardMaterial color="#806a52" metalness={0.34} roughness={0.5} />
          </mesh>
        )))}
      </group>
    );
  }

  if (exhibit.kind === "lamp") {
    return (
      <group ref={model} position={[0, -0.72, 0]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.43, 0.46, 0.16, 20]} />
          <meshStandardMaterial color="#555c57" metalness={0.45} roughness={0.38} />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.055, 0.075, 1.12, 12]} />
          <meshStandardMaterial color="#c5a873" metalness={0.72} roughness={0.27} />
        </mesh>
        <mesh position={[0, 1.37, 0]}>
          <sphereGeometry args={[0.35, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isOn ? setting * 0.012 : 0.02}
            roughness={0.34}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={model}>
      <mesh>
        <torusKnotGeometry args={[0.52, 0.15, 80, 10, 2, 3]} />
        <meshStandardMaterial color={color} roughness={0.32} metalness={0.2} />
      </mesh>
    </group>
  );
}

export default function PreviewScene({ exhibit, setting, isOn, controlsRef }) {
  const orbitRef = useRef(null);
  const targetY = exhibit.kind === "shell-chair"
    ? 0.95
    : exhibit.kind === "convertible-chair"
      ? 0.9
      : 0.62;
  const cameraPosition = exhibit.kind === "shell-chair"
    ? [3.2, targetY + 0.85, 0.85]
    : [2, targetY + 0.85, 2.7];

  useImperativeHandle(controlsRef, () => {
    const adjustOrbit = (theta, phi) => {
      const controls = orbitRef.current;
      if (!controls) return;
      const offset = new THREE.Vector3().subVectors(controls.object.position, controls.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      spherical.theta += theta;
      spherical.phi = THREE.MathUtils.clamp(
        spherical.phi + phi,
        controls.minPolarAngle,
        controls.maxPolarAngle,
      );
      offset.setFromSpherical(spherical);
      controls.object.position.copy(controls.target).add(offset);
      controls.object.lookAt(controls.target);
      controls.update();
    };

    return {
      rotateLeft: () => adjustOrbit(-Math.PI / 8, 0),
      rotateRight: () => adjustOrbit(Math.PI / 8, 0),
      tiltUp: () => adjustOrbit(0, -Math.PI / 10),
      tiltDown: () => adjustOrbit(0, Math.PI / 10),
      reset: () => orbitRef.current?.reset(),
    };
  }, [controlsRef]);

  return (
    <Canvas
      className="demo__canvas"
      dpr={[1, 1.5]}
      camera={{ position: cameraPosition, fov: 42, near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    >
      <hemisphereLight args={["#fff3df", "#39362f", 1.7]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} color="#fff1d9" />
      <pointLight position={[-3, 2, -2]} intensity={1.4} distance={8} color="#d5ba91" />
      <ProductModel exhibit={exhibit} setting={setting} isOn={isOn} />
      <OrbitControls
        ref={orbitRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        enableZoom
        target={[0, targetY, 0]}
        minDistance={2}
        maxDistance={5.5}
        minPolarAngle={0.04}
        maxPolarAngle={Math.PI - 0.04}
      />
    </Canvas>
  );
}
