import React, { useMemo } from "react";
import * as THREE from "three";

const WALNUT = "#755039";
const WALNUT_LIGHT = "#a47a51";
const UPHOLSTERY = "#e7dfd1";
const LAVENDER = "#aaa2c1";

function extrudeProfile(shape, width, bevelSize = 0.025) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize,
    bevelThickness: bevelSize,
    curveSegments: 18,
  });
  // Profile X is product depth; the extrusion spans the product's width.
  geometry.translate(0, 0, -width / 2);
  geometry.rotateY(-Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function cozyFrameShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.58, 0.14);
  shape.lineTo(0.58, 0.14);
  shape.lineTo(0.48, 0.34);
  shape.lineTo(0.22, 0.78);
  shape.lineTo(0.48, 1.04);
  shape.lineTo(0.37, 1.19);
  shape.lineTo(0.02, 0.99);
  shape.lineTo(-0.34, 1.54);
  shape.lineTo(-0.55, 1.47);
  shape.lineTo(-0.15, 0.71);
  shape.lineTo(-0.5, 0.34);
  shape.closePath();
  return shape;
}

function cozyShellShape() {
  const shape = new THREE.Shape();
  shape.moveTo(0.55, 0.9);
  shape.bezierCurveTo(0.33, 0.72, 0.02, 0.72, -0.22, 0.84);
  shape.bezierCurveTo(-0.48, 0.98, -0.6, 1.26, -0.62, 1.55);
  shape.lineTo(-0.64, 1.7);
  shape.bezierCurveTo(-0.64, 1.79, -0.49, 1.83, -0.42, 1.72);
  shape.bezierCurveTo(-0.31, 1.45, -0.17, 1.25, 0.08, 1.2);
  shape.bezierCurveTo(0.28, 1.16, 0.48, 1.2, 0.55, 1.08);
  shape.closePath();
  return shape;
}

function koshaFrameShape() {
  const shape = new THREE.Shape();
  shape.absellipse(-0.02, 0.86, 0.78, 0.67, 0, Math.PI * 2, false);

  const opening = new THREE.Path();
  opening.absellipse(-0.08, 0.81, 0.5, 0.45, 0, Math.PI * 2, true);
  shape.holes.push(opening);

  const slot = new THREE.Path();
  slot.absellipse(-0.38, 1.32, 0.14, 0.027, 0, Math.PI * 2, true);
  shape.holes.push(slot);
  return shape;
}

function koshaCushionShape() {
  const shape = new THREE.Shape();
  shape.moveTo(0.56, 1.18);
  shape.bezierCurveTo(0.43, 1.02, 0.13, 1.01, -0.13, 1.12);
  shape.bezierCurveTo(-0.4, 1.25, -0.57, 1.51, -0.64, 1.74);
  shape.bezierCurveTo(-0.68, 1.9, -0.5, 1.97, -0.4, 1.83);
  shape.bezierCurveTo(-0.25, 1.57, -0.09, 1.42, 0.19, 1.34);
  shape.bezierCurveTo(0.39, 1.29, 0.61, 1.32, 0.56, 1.18);
  shape.closePath();
  return shape;
}

function makeCord() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.63, 0.58),
    new THREE.Vector3(0.12, 0.45, 0.72),
    new THREE.Vector3(0.32, 0.34, 0.84),
    new THREE.Vector3(0.57, 0.34, 0.9),
  ]);
  return new THREE.TubeGeometry(curve, 28, 0.018, 6, false);
}

export default function ProductGeometry({ exhibit, setting = 55 }) {
  const pullCord = useMemo(makeCord, []);
  const cozyFrame = useMemo(() => extrudeProfile(cozyFrameShape(), 0.12, 0.025), []);
  const cozyShell = useMemo(() => extrudeProfile(cozyShellShape(), 0.92, 0.045), []);
  const koshaFrame = useMemo(() => extrudeProfile(koshaFrameShape(), 0.17, 0.035), []);
  const koshaCushion = useMemo(() => extrudeProfile(koshaCushionShape(), 1.02, 0.055), []);

  if (exhibit.kind === "pull-toy") {
    const noteColors = ["#9a70ad", "#e8d9b8", "#db6554", "#e99443", "#e6c85c", "#56aaa3", "#5687b5", "#da756b"];
    const hueOffset = (setting - 55) / 360;
    return (
      <group>
        <mesh position={[0, 0.64, 0]}>
          <cylinderGeometry args={[0.61, 0.61, 0.48, 32]} />
          <meshStandardMaterial color="#704a34" roughness={0.42} />
        </mesh>
        <mesh position={[0, 0.89, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.57, 0.045, 8, 32]} />
          <meshStandardMaterial color={WALNUT_LIGHT} roughness={0.42} />
        </mesh>
        {noteColors.map((baseColor, index) => {
          const color = new THREE.Color(baseColor).offsetHSL(hueOffset, 0, 0);
          const step = (Math.PI * 2) / noteColors.length;
          return (
            <mesh
              key={baseColor}
              position={[0, 0.94, 0]}
              rotation={[0, index * step, 0]}
            >
              <cylinderGeometry args={[0.53, 0.53, 0.105, 6, 1, false, 0.035, step - 0.07]} />
              <meshStandardMaterial color={color} roughness={0.48} />
            </mesh>
          );
        })}
        <mesh position={[0, 1.01, 0]}>
          <cylinderGeometry args={[0.205, 0.205, 0.1, 24]} />
          <meshStandardMaterial color="#bd9664" roughness={0.48} />
        </mesh>
        <mesh position={[0, 1.067, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.014, 24]} />
          <meshStandardMaterial color="#d3b27e" roughness={0.5} />
        </mesh>
        {[-1, 1].flatMap((side) => [-1, 1].map((depthSide) => (
          <group key={`${side}-${depthSide}`} position={[side * 0.57, 0.31, depthSide * 0.31]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.19, 0.19, 0.13, 20]} />
              <meshStandardMaterial color="#68452f" roughness={0.5} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.145, 0.022, 7, 18]} />
              <meshStandardMaterial color="#c59963" roughness={0.43} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.055, 0.055, 0.145, 12]} />
              <meshStandardMaterial color="#d5aa72" roughness={0.5} />
            </mesh>
          </group>
        )))}
        <mesh position={[0, 0.63, 0.57]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.115, 16, 12]} />
          <meshStandardMaterial color={WALNUT_LIGHT} roughness={0.45} />
        </mesh>
        <mesh geometry={pullCord}>
          <meshStandardMaterial color="#cbb08a" roughness={0.78} />
        </mesh>
        <group position={[0.57, 0.34, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.034, 0.034, 0.3, 12]} />
            <meshStandardMaterial color={WALNUT_LIGHT} roughness={0.48} />
          </mesh>
          <mesh position={[0, 0.14, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.18, 14]} />
            <meshStandardMaterial color={WALNUT} roughness={0.42} />
          </mesh>
          <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.06, 0.014, 6, 14]} />
            <meshStandardMaterial color="#e3c04e" roughness={0.4} />
          </mesh>
        </group>
      </group>
    );
  }

  if (exhibit.kind === "convertible-chair") {
    const seatOffset = ((setting - 50) / 50) * 0.08;
    const seatTilt = ((setting - 50) / 50) * 0.075;
    return (
      <group>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[1.14, 0.14, 0.94]} />
          <meshStandardMaterial color={LAVENDER} roughness={0.42} />
        </mesh>
        <mesh position={[0, 0.085, 0.39]}>
          <boxGeometry args={[1.05, 0.035, 0.12]} />
          <meshStandardMaterial color="#9189aa" roughness={0.48} />
        </mesh>
        <mesh position={[0, 0.085, -0.39]}>
          <boxGeometry args={[1.05, 0.035, 0.12]} />
          <meshStandardMaterial color="#9189aa" roughness={0.48} />
        </mesh>
        {[ -1, 1 ].map((side) => (
          <group key={side} position={[side * 0.47, 0, 0]}>
            <mesh geometry={cozyFrame}>
              <meshStandardMaterial color={LAVENDER} roughness={0.42} />
            </mesh>
            <mesh position={[side * 0.015, 0.86, -0.11]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.105, 0.105, 0.085, 24]} />
              <meshStandardMaterial color="#d4cbdd" metalness={0.3} roughness={0.36} />
            </mesh>
            <mesh position={[side * 0.018, 0.86, -0.11]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 0.095, 18]} />
              <meshStandardMaterial color="#817991" metalness={0.45} roughness={0.34} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.57, -0.16]}>
          <boxGeometry args={[0.78, 0.09, 0.12]} />
          <meshStandardMaterial color="#9189aa" roughness={0.46} />
        </mesh>
        <mesh position={[0, 0.55, 0.04]}>
          <boxGeometry args={[0.7, 0.08, 0.12]} />
          <meshStandardMaterial color="#aaa2c1" roughness={0.42} />
        </mesh>
        <group position={[0, seatOffset, 0]} rotation={[seatTilt, 0, 0]}>
          <mesh geometry={cozyShell}>
            <meshStandardMaterial color="#d7d4d0" roughness={0.38} />
          </mesh>
          <mesh position={[0, 1.14, -0.05]} rotation={[-0.18, 0, 0]}>
            <boxGeometry args={[0.7, 0.11, 0.25]} />
            <meshStandardMaterial color={UPHOLSTERY} roughness={0.84} />
          </mesh>
          <mesh position={[0, 1.45, -0.39]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.66, 0.11, 0.27]} />
            <meshStandardMaterial color={UPHOLSTERY} roughness={0.84} />
          </mesh>
          <mesh position={[0, 1.64, -0.6]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.46, 0.17, 0.13]} />
            <meshStandardMaterial color="#e9e5dc" roughness={0.86} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.43, 1.31, -0.2]} rotation={[0, 0, -0.18]}>
              <boxGeometry args={[0.055, 0.31, 0.1]} />
              <meshStandardMaterial color="#c5c1bb" roughness={0.45} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, 1.18 + seatOffset * 0.25, 0.57]}>
          <boxGeometry args={[1.28, 0.095, 0.55]} />
          <meshStandardMaterial color={LAVENDER} roughness={0.42} />
        </mesh>
        <mesh position={[0, 1.235 + seatOffset * 0.25, 0.79]}>
          <boxGeometry args={[1.21, 0.045, 0.045]} />
          <meshStandardMaterial color="#c3bdd1" roughness={0.46} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.6, 1.22 + seatOffset * 0.25, 0.54]}>
            <boxGeometry args={[0.045, 0.08, 0.48]} />
            <meshStandardMaterial color="#9189aa" roughness={0.46} />
          </mesh>
        ))}
        <mesh position={[0, 0.77 + seatOffset, 0.29]} rotation={[0, 0, -0.28]}>
          <boxGeometry args={[0.055, 0.32, 0.025]} />
          <meshStandardMaterial color="#8c8793" roughness={0.66} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.17, 0.75 + seatOffset, 0.25]} rotation={[0, 0, side * 0.34]}>
            <boxGeometry args={[0.045, 0.32, 0.025]} />
            <meshStandardMaterial color="#8c8793" roughness={0.66} />
          </mesh>
        ))}
      </group>
    );
  }

  if (exhibit.kind === "shell-chair") {
    const recline = ((setting - 50) / 50) * 0.12;
    return (
      <group>
        {[-1, 1].map((side) => (
          <mesh key={side} geometry={koshaFrame} position={[side * 0.64, 0, 0]}>
            <meshStandardMaterial color={WALNUT} roughness={0.34} metalness={0.04} />
          </mesh>
        ))}
        <group position={[0, 1.1, -0.08]} rotation={[recline, 0, 0]}>
          <mesh geometry={koshaCushion} position={[0, -1.1, 0.08]}>
            <meshStandardMaterial color={UPHOLSTERY} roughness={0.86} />
          </mesh>
          <mesh position={[0, 1.23, 0.14]} rotation={[-0.1, 0, 0]} scale={[0.43, 0.12, 0.35]}>
            <sphereGeometry args={[1, 20, 12]} />
            <meshStandardMaterial color="#e8e1d5" roughness={0.88} />
          </mesh>
          <mesh position={[0, 1.47, -0.32]} rotation={[-0.25, 0, 0]} scale={[0.4, 0.15, 0.32]}>
            <sphereGeometry args={[1, 20, 12]} />
            <meshStandardMaterial color="#e9e2d6" roughness={0.88} />
          </mesh>
          <mesh position={[0, 1.76, -0.56]} rotation={[-0.25, 0, 0]} scale={[0.26, 0.12, 0.12]}>
            <sphereGeometry args={[1, 18, 12]} />
            <meshStandardMaterial color="#eee8dd" roughness={0.9} />
          </mesh>
        </group>
        {[-1, 1].map((side) => (
          <group key={`pivot-${side}`} position={[side * 0.76, 1.05, -0.08]} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.13, 0.13, 0.075, 24]} />
              <meshStandardMaterial color="#b4a58c" metalness={0.62} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.045, 0]}>
              <cylinderGeometry args={[0.047, 0.047, 0.09, 18]} />
              <meshStandardMaterial color="#5e5141" metalness={0.42} roughness={0.34} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.67, 0.3]}>
          <boxGeometry args={[1.06, 0.11, 0.14]} />
          <meshStandardMaterial color={WALNUT} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.78, -0.42]}>
          <boxGeometry args={[0.82, 0.1, 0.12]} />
          <meshStandardMaterial color={WALNUT_LIGHT} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.1, 0.59]}>
          <boxGeometry args={[0.88, 0.065, 0.095]} />
          <meshStandardMaterial color={WALNUT_LIGHT} roughness={0.42} />
        </mesh>
      </group>
    );
  }

  return null;
}
