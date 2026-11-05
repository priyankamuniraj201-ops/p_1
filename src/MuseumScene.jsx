import { Html } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EXHIBITS } from "./data.js";
import ProductGeometry from "./ProductGeometry.jsx";

gsap.registerPlugin(ScrollTrigger);

const CORRIDOR = {
  length: 37,
  centerZ: -5.5,
  width: 8,
  height: 5.2,
  wallColor: "#3d3c36",
  floorColor: "#494740",
};

const GALLERY_ROOM = {
  startZ: -24,
  endZ: -67,
  centerZ: -45.5,
  width: 20,
  height: 7.5,
  wallColor: "#514e46",
  floorColor: "#4b4942",
};

const PROJECTS = EXHIBITS.filter((exhibit) => exhibit.roomPosition);
const VISITOR_SPOTS = [
  { position: [-7.2, 0, -29], project: "swara", jacket: "#9b7958", trousers: "#444b51" },
  { position: [7.3, 0, -40.5], project: "cozy-grow", jacket: "#75877f", trousers: "#383c3b" },
  { position: [-7.2, 0, -52], project: "kosha", jacket: "#8a7180", trousers: "#4b4945" },
];
const PROJECT_BY_ID = new Map(PROJECTS.map((project) => [project.id, project]));
const VISITORS = VISITOR_SPOTS.map((visitor) => {
  const project = PROJECT_BY_ID.get(visitor.project);
  const dx = project.roomPosition[0] - visitor.position[0];
  const dz = project.roomPosition[1] - visitor.position[2];
  return { ...visitor, rotation: Math.atan2(dx, dz) };
});
const CAMERA_WAYPOINTS = EXHIBITS.map((exhibit, index) => {
  if (index === 0) return { position: [0, 1.62, 9.5], target: [0, 1.58, 2] };

  if (exhibit.panel) {
    const { side, z } = exhibit.panel;
    return {
      position: [0, 1.65, z + 3.4],
      target: [side === "left" ? -3.1 : 3.1, 2.05, z],
    };
  }

  const [x, z] = exhibit.roomPosition;
  return {
    position: [x * 0.38, 1.65, z + 5.5],
    target: [x, 1.38, z],
  };
});

const PANEL_EXHIBITS = EXHIBITS.filter((exhibit) => exhibit.panel);

function GalleryPortal() {
  return (
    <group position={[0, 0, -23.5]}>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 3.72, 0, 0]}>
          <mesh position={[0, 2.56, 0]}>
            <boxGeometry args={[0.42, 5.12, 0.58]} />
            <meshStandardMaterial color="#806b4b" metalness={0.28} roughness={0.5} />
          </mesh>
          <mesh position={[0, 2.55, 0.31]}>
            <boxGeometry args={[0.22, 4.82, 0.08]} />
            <meshStandardMaterial color="#b39a70" metalness={0.4} roughness={0.38} />
          </mesh>
          <mesh position={[0, 0.18, 0.36]}>
            <boxGeometry args={[0.72, 0.36, 0.72]} />
            <meshStandardMaterial color="#9b8058" metalness={0.38} roughness={0.42} />
          </mesh>
          <mesh position={[0, 5.02, 0.34]}>
            <boxGeometry args={[0.72, 0.3, 0.68]} />
            <meshStandardMaterial color="#9b8058" metalness={0.38} roughness={0.42} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 5.03, 0]}>
        <boxGeometry args={[7.85, 0.42, 0.58]} />
        <meshStandardMaterial color="#806b4b" metalness={0.28} roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.75, 0.31]}>
        <boxGeometry args={[6.9, 0.1, 0.08]} />
        <meshStandardMaterial color="#b39a70" metalness={0.4} roughness={0.38} />
      </mesh>
      <mesh position={[0, 4.53, 0.38]}>
        <boxGeometry args={[2.8, 0.52, 0.1]} />
        <meshStandardMaterial color="#272823" roughness={0.78} />
      </mesh>
      <Html position={[0, 4.53, 0.45]} center distanceFactor={10}>
        <div className="portal-sign">PROJECT GALLERY <span>04—07</span></div>
      </Html>
      <mesh position={[0, 4.25, 0.34]}>
        <boxGeometry args={[7.2, 0.08, 0.08]} />
        <meshStandardMaterial color="#e2c795" emissive="#d4b77f" emissiveIntensity={0.35} />
      </mesh>
      <pointLight position={[0, 3.7, 0.6]} intensity={24} distance={13} decay={2} color="#fff0d9" />
    </group>
  );
}

function Corridor() {
  return (
    <group>
      <mesh position={[0, -0.12, CORRIDOR.centerZ]} receiveShadow={false}>
        <boxGeometry args={[CORRIDOR.width, 0.24, CORRIDOR.length]} />
        <meshStandardMaterial color={CORRIDOR.floorColor} roughness={0.88} />
      </mesh>
      <mesh position={[-CORRIDOR.width / 2, CORRIDOR.height / 2, CORRIDOR.centerZ]}>
        <boxGeometry args={[0.18, CORRIDOR.height, CORRIDOR.length]} />
        <meshStandardMaterial color={CORRIDOR.wallColor} roughness={0.92} />
      </mesh>
      <mesh position={[CORRIDOR.width / 2, CORRIDOR.height / 2, CORRIDOR.centerZ]}>
        <boxGeometry args={[0.18, CORRIDOR.height, CORRIDOR.length]} />
        <meshStandardMaterial color={CORRIDOR.wallColor} roughness={0.92} />
      </mesh>
      <mesh position={[0, CORRIDOR.height, CORRIDOR.centerZ]}>
        <boxGeometry args={[CORRIDOR.width, 0.15, CORRIDOR.length]} />
        <meshStandardMaterial color="#45433b" roughness={0.92} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={`corridor-wall-${side}`} position={[side * 3.87, 0, 0]}>
          <mesh position={[0, 0.16, CORRIDOR.centerZ]}>
            <boxGeometry args={[0.08, 0.2, CORRIDOR.length - 1]} />
            <meshStandardMaterial color="#79694e" roughness={0.68} />
          </mesh>
          <mesh position={[0, 1.45, CORRIDOR.centerZ]}>
            <boxGeometry args={[0.07, 0.08, CORRIDOR.length - 1]} />
            <meshStandardMaterial color="#817253" roughness={0.64} />
          </mesh>
          <mesh position={[0, 4.86, CORRIDOR.centerZ]}>
            <boxGeometry args={[0.12, 0.22, CORRIDOR.length - 1]} />
            <meshStandardMaterial color="#8c7c60" roughness={0.58} />
          </mesh>
          {PANEL_EXHIBITS.map((exhibit) => {
            const side = exhibit.panel.side === "left" ? -1 : 1;
            const { z } = exhibit.panel;
            return (
              <group key={`sconce-${exhibit.id}`}>
                <mesh position={[side * 3.64, 3.58, z]}>
                  <boxGeometry args={[0.1, 0.08, 1.2]} />
                  <meshStandardMaterial
                    color="#e2c795"
                    emissive="#d4b77f"
                    emissiveIntensity={0.48}
                    metalness={0.3}
                    roughness={0.42}
                  />
                </mesh>
                <pointLight
                  position={[side * 3.3, 3.35, z]}
                  intensity={5}
                  distance={6}
                  decay={2}
                  color="#ffe5b8"
                />
              </group>
            );
          })}
        </group>
      ))}
      {Array.from({ length: 5 }, (_, index) => {
        const z = 8 - index * 8;
        return (
          <group key={z}>
            <mesh position={[0, CORRIDOR.height - 0.18, z]}>
              <boxGeometry args={[1.8, 0.08, 0.65]} />
              <meshStandardMaterial
                color="#fff0d6"
                emissive="#ffe1b3"
                emissiveIntensity={0.8}
                roughness={0.38}
              />
            </mesh>
            {index % 2 === 0 && (
              <pointLight position={[0, CORRIDOR.height - 0.58, z]} intensity={17} distance={16} decay={2} color="#fff0d9" />
            )}
          </group>
        );
      })}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 3.35, 1.85, 13]}>
          <boxGeometry args={[0.24, 3.7, 0.25]} />
          <meshStandardMaterial color="#9b7b53" metalness={0.45} roughness={0.38} />
        </mesh>
      ))}
      <mesh position={[0, 3.62, 13]}>
        <boxGeometry args={[6.9, 0.22, 0.25]} />
        <meshStandardMaterial color="#9b7b53" metalness={0.45} roughness={0.38} />
      </mesh>
      <pointLight position={[0, 3.1, 6]} intensity={28} distance={18} decay={2} color="#fff0d9" />
      <GalleryPortal />
      <EntranceFurnishings />
    </group>
  );
}

function EntranceFurnishings() {
  return (
    <group>
      <group position={[1.55, 0, -1.8]} rotation={[0, -0.18, 0]}>
        <mesh position={[0, 0.53, 0]}>
          <boxGeometry args={[1.55, 0.14, 0.58]} />
          <meshStandardMaterial color="#8b6947" roughness={0.58} />
        </mesh>
        <mesh position={[0, 0.97, -0.22]}>
          <boxGeometry args={[1.55, 0.72, 0.12]} />
          <meshStandardMaterial color="#70543a" roughness={0.62} />
        </mesh>
        {[-0.62, 0.62].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 0.26, 0]}>
              <boxGeometry args={[0.1, 0.52, 0.46]} />
              <meshStandardMaterial color="#b29364" metalness={0.3} roughness={0.44} />
            </mesh>
            <mesh position={[0, 0.87, -0.2]}>
              <boxGeometry args={[0.09, 0.68, 0.09]} />
              <meshStandardMaterial color="#9b7a52" roughness={0.5} />
            </mesh>
          </group>
        ))}
        {[-0.23, -0.02, 0.19].map((y) => (
          <mesh key={y} position={[0, 0.98 + y, -0.147]}>
            <boxGeometry args={[1.37, 0.035, 0.035]} />
            <meshStandardMaterial color="#ad8b5e" roughness={0.5} />
          </mesh>
        ))}
        {[-0.68, 0.68].map((x) => (
          <group key={`arm-${x}`} position={[x, 0, 0]}>
            {[-0.2, 0.2].map((z) => (
              <mesh key={z} position={[0, 0.68, z]}>
                <boxGeometry args={[0.07, 0.3, 0.07]} />
                <meshStandardMaterial color="#9b7a52" roughness={0.5} />
              </mesh>
            ))}
            <mesh position={[0, 0.85, 0]}>
              <boxGeometry args={[0.13, 0.06, 0.48]} />
              <meshStandardMaterial color="#ad8b5e" roughness={0.48} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.35, 0.3]}>
          <boxGeometry args={[1.22, 0.035, 0.035]} />
          <meshStandardMaterial color="#d5b983" metalness={0.35} roughness={0.42} />
        </mesh>
      </group>
      <group position={[3.45, 0, -1.8]}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.38, 0.3, 0.7, 18]} />
          <meshStandardMaterial color="#74614a" roughness={0.62} />
        </mesh>
        <mesh position={[0, 0.71, 0]}>
          <torusGeometry args={[0.34, 0.035, 8, 20]} />
          <meshStandardMaterial color="#bda477" metalness={0.4} roughness={0.38} />
        </mesh>
        <mesh position={[0, 0.73, 0]}>
          <cylinderGeometry args={[0.29, 0.29, 0.035, 18]} />
          <meshStandardMaterial color="#382d23" roughness={0.95} />
        </mesh>
        {Array.from({ length: 10 }, (_, index) => {
          const angle = (index / 10) * Math.PI * 2;
          const height = 1.18 + (index % 3) * 0.13;
          return (
            <group
              key={index}
              position={[Math.sin(angle) * 0.12, 0.73, Math.cos(angle) * 0.12]}
              rotation={[Math.cos(angle) * 0.22, angle, -Math.sin(angle) * 0.3]}
            >
              <mesh position={[0, height * 0.48, 0]}>
                <cylinderGeometry args={[0.018, 0.028, height, 6]} />
                <meshStandardMaterial color="#587158" roughness={0.88} />
              </mesh>
              <mesh
                position={[0, height * 0.72, 0.07]}
                rotation={[-0.48, 0, 0]}
                scale={[0.13, 0.38, 0.2]}
              >
                <sphereGeometry args={[1, 10, 7]} />
                <meshStandardMaterial
                  color={index % 2 ? "#6d8666" : "#82956d"}
                  roughness={0.84}
                />
              </mesh>
            </group>
          );
        })}
      </group>
      <group position={[2.67, 0, -1.48]} rotation={[0, -0.18, 0]}>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.21, 0.24, 0.08, 16]} />
          <meshStandardMaterial color="#9b7b53" metalness={0.35} roughness={0.46} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.045, 0.06, 0.4, 10]} />
          <meshStandardMaterial color="#a78960" metalness={0.35} roughness={0.44} />
        </mesh>
        <mesh position={[0, 0.51, 0]}>
          <cylinderGeometry args={[0.29, 0.31, 0.06, 18]} />
          <meshStandardMaterial color="#8b6947" roughness={0.56} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.38, 0.018, 0.27]} />
          <meshStandardMaterial color="#e2d5be" roughness={0.85} />
        </mesh>
        <mesh position={[0.025, 0.56, 0]}>
          <boxGeometry args={[0.06, 0.005, 0.16]} />
          <meshStandardMaterial color="#9d7050" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function GalleryRoom() {
  const roomLength = GALLERY_ROOM.startZ - GALLERY_ROOM.endZ;
  return (
    <group>
      <mesh position={[0, -0.12, GALLERY_ROOM.centerZ]}>
        <boxGeometry args={[GALLERY_ROOM.width, 0.24, roomLength]} />
        <meshStandardMaterial color={GALLERY_ROOM.floorColor} roughness={0.92} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * GALLERY_ROOM.width / 2, GALLERY_ROOM.height / 2, GALLERY_ROOM.centerZ]}>
          <boxGeometry args={[0.22, GALLERY_ROOM.height, roomLength]} />
          <meshStandardMaterial color={GALLERY_ROOM.wallColor} roughness={0.96} />
        </mesh>
      ))}
      <mesh position={[0, GALLERY_ROOM.height, GALLERY_ROOM.centerZ]}>
        <boxGeometry args={[GALLERY_ROOM.width, 0.2, roomLength]} />
      <meshStandardMaterial color="#37362f" roughness={0.94} />
      </mesh>
      <mesh position={[0, GALLERY_ROOM.height / 2, GALLERY_ROOM.endZ]}>
        <boxGeometry args={[GALLERY_ROOM.width, GALLERY_ROOM.height, 0.22]} />
        <meshStandardMaterial color={GALLERY_ROOM.wallColor} roughness={0.96} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 9.93, 0.14, GALLERY_ROOM.centerZ]}>
            <boxGeometry args={[0.12, 0.24, roomLength]} />
            <meshStandardMaterial color="#8f7757" metalness={0.28} roughness={0.52} />
          </mesh>
          <mesh position={[side * 9.93, 1.25, GALLERY_ROOM.centerZ]}>
            <boxGeometry args={[0.12, 0.1, roomLength]} />
            <meshStandardMaterial color="#8f7757" metalness={0.28} roughness={0.52} />
          </mesh>
          <mesh position={[side * 9.93, 7.18, GALLERY_ROOM.centerZ]}>
            <boxGeometry args={[0.16, 0.3, roomLength]} />
            <meshStandardMaterial color="#8f7757" metalness={0.28} roughness={0.52} />
          </mesh>
        </group>
      ))}
      {PROJECTS.map((project) => {
        const side = project.roomPosition[0] < 0 ? -1 : 1;
        const z = project.roomPosition[1];
        return (
          <group key={`picture-light-${project.id}`}>
            <mesh position={[side * 9.72, 4.08, z]}>
              <boxGeometry args={[0.1, 0.07, 1.55]} />
              <meshStandardMaterial
                color="#e5c992"
                emissive="#d4b77f"
                emissiveIntensity={0.85}
                metalness={0.35}
                roughness={0.38}
              />
            </mesh>
            <pointLight
              position={[side * 9.25, 4.02, z]}
              intensity={8}
              distance={7}
              decay={2}
              color="#ffe5b8"
            />
          </group>
        );
      })}
      {[-1, 1].map((side) => (
        <mesh key={`ceiling-beam-${side}`} position={[side * 7.8, GALLERY_ROOM.height - 0.1, GALLERY_ROOM.centerZ]}>
          <boxGeometry args={[0.16, 0.2, roomLength]} />
          <meshStandardMaterial color="#8f7757" metalness={0.28} roughness={0.52} />
        </mesh>
      ))}
      {[-32, -42, -52, -62].map((z) => (
        <group key={z} position={[0, GALLERY_ROOM.height - 0.12, z]}>
          <mesh>
            <boxGeometry args={[2.1, 0.08, 0.9]} />
            <meshStandardMaterial
              color="#c0aa84"
              emissive="#dec596"
              emissiveIntensity={0.12}
              roughness={0.65}
            />
          </mesh>
          {z !== -52 && (
            <pointLight position={[0, -0.55, 0]} intensity={26} distance={18} decay={2} color="#fff0d9" />
          )}
        </group>
      ))}
    </group>
  );
}

function WallPanel({ exhibit }) {
  const { side, z, number } = exhibit.panel;
  const rotation = side === "left" ? Math.PI / 2 : -Math.PI / 2;
  const x = side === "left" ? -3.83 : 3.83;

  return (
    <group position={[x, 2.15, z]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0, -0.045]}>
        <boxGeometry args={[2.8, 2.18, 0.16]} />
        <meshStandardMaterial color="#57432e" metalness={0.16} roughness={0.58} />
      </mesh>
      <mesh position={[0, 0, 0.018]}>
        <boxGeometry args={[2.66, 2.04, 0.055]} />
        <meshStandardMaterial color="#b09163" metalness={0.42} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0, 0.055]}>
        <boxGeometry args={[2.52, 1.9, 0.04]} />
        <meshStandardMaterial color="#292a26" roughness={0.76} />
      </mesh>
      <Html transform position={[0, 0, 0.085]} distanceFactor={3.65} center>
        <div className={`wall-art wall-art--${exhibit.id}`}>
          <div className="wall-art__heading">
            <span>{number} / {exhibit.id === "about" ? "PROFILE" : exhibit.id === "experience" ? "EXPERIENCE" : exhibit.id === "toolkit" ? "TOOLKIT" : "PRIYANKA M"}</span>
            <span className="wall-art__mark" aria-hidden="true">✳</span>
          </div>
          {exhibit.id === "about" && (
            <>
              <div className="wall-art__profile">
                <div className="wall-art__portrait">
                  <span aria-hidden="true">PM</span>
                  <img
                    src={exhibit.portrait}
                    alt="Portrait of Priyanka M"
                    onError={(event) => { event.currentTarget.hidden = true; }}
                  />
                </div>
                <div className="wall-art__profile-copy">
                  <span>INDUSTRIAL DESIGNER</span>
                  <h2>Priyanka M</h2>
                  <p>For the everyday.<br />Built to be kept.</p>
                  <i aria-hidden="true" />
                </div>
              </div>
              <p className="wall-art__statement">{exhibit.description}</p>
              <div className="wall-art__highlights">
                {exhibit.highlights.map((highlight) => <span key={highlight}>{highlight}</span>)}
              </div>
            </>
          )}
          {exhibit.experiences && (
            <div className="wall-art__experience">
              <h2>Professional experience</h2>
              {exhibit.experiences.map((experience) => (
                <article className="experience-card" key={experience.company}>
                  <div className="experience-card__heading">
                    <h3>{experience.company}</h3>
                    <time>{experience.dates}</time>
                  </div>
                  <strong>{experience.role}</strong>
                  <p>{experience.description}</p>
                </article>
              ))}
            </div>
          )}
          {exhibit.toolGroups && (
            <div className="wall-art__toolkit">
              <h2>Tools &amp; practice</h2>
              {exhibit.toolGroups.map((group) => (
                <section className={`tool-group tool-group--${group.title.toLowerCase()}`} key={group.title}>
                  <div className="tool-group__heading">
                    <h3>{group.title}</h3>
                    <span>{group.detail}</span>
                  </div>
                  <div className="tool-group__items">
                    {group.items.map((item) => <span key={item}>{item}</span>)}
                  </div>
                </section>
              ))}
            </div>
          )}
          {exhibit.id === "connect" && (
            <>
              <h2>{exhibit.title}</h2>
              <p>{exhibit.subtitle}</p>
              <div className="wall-art__details wall-art__details--contact">
                <span>{exhibit.description}</span>
                {exhibit.links.map((link) => (
                  <a key={link.href} href={link.href}>{link.label} ↗</a>
                ))}
              </div>
              <span className="wall-art__foot">DESIGN / OBJECTS / SYSTEMS</span>
            </>
          )}
        </div>
      </Html>
    </group>
  );
}

function ProjectWallDisplay({ exhibit }) {
  const [projectX, z] = exhibit.roomPosition;
  const side = projectX < 0 ? -1 : 1;
  const rotation = side < 0 ? Math.PI / 2 : -Math.PI / 2;
  const x = side * (GALLERY_ROOM.width / 2 - 0.02);

  return (
    <group position={[x, 2.65, z]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0, -0.07]}>
        <boxGeometry args={[3.15, 2.5, 0.18]} />
        <meshStandardMaterial color="#65533b" metalness={0.25} roughness={0.54} />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <boxGeometry args={[3.02, 2.37, 0.06]} />
        <meshStandardMaterial color="#c0a475" metalness={0.38} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.075]}>
        <boxGeometry args={[2.88, 2.23, 0.035]} />
        <meshStandardMaterial color="#282923" roughness={0.8} />
      </mesh>
      <Html transform position={[0, 0, 0.1]} distanceFactor={3.1} center>
        <div className={`project-wall-art project-wall-art--${exhibit.kind}`}>
          <div className="project-wall-art__copy">
            <span>{exhibit.eyebrow}</span>
            <h2>{exhibit.title}</h2>
            <p>{exhibit.subtitle}</p>
            <i />
            <small>{exhibit.bullets.slice(0, 2).join(" · ")}</small>
          </div>
          <div className="project-wall-art__drawing" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
      </Html>
    </group>
  );
}

function Rope({ color = "#7a3033" }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.22, 0.5, 1.18),
      new THREE.Vector3(-0.62, 0.33, 1.18),
      new THREE.Vector3(0, 0.28, 1.18),
      new THREE.Vector3(0.62, 0.33, 1.18),
      new THREE.Vector3(1.22, 0.5, 1.18),
    ]);
    return new THREE.TubeGeometry(curve, 12, 0.055, 5, false);
  }, []);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} roughness={0.72} />
    </mesh>
  );
}

function Stanchion({ x }) {
  return (
    <group position={[x, 0, 1.18]}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.12, 12]} />
        <meshStandardMaterial color="#a47c4f" metalness={0.78} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.055, 0.085, 0.48, 10]} />
        <meshStandardMaterial color="#c6a06b" metalness={0.82} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.58, 0]}>
        <sphereGeometry args={[0.11, 10, 8]} />
        <meshStandardMaterial color="#d0aa72" metalness={0.75} roughness={0.25} />
      </mesh>
    </group>
  );
}

function Sculpture({ exhibit }) {
  const rotating = useRef(null);
  const vesselGeometry = useMemo(() => {
    const points = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.34, 0.08),
      new THREE.Vector2(0.48, 0.34),
      new THREE.Vector2(0.3, 0.66),
      new THREE.Vector2(0.37, 1.06),
      new THREE.Vector2(0.24, 1.32),
      new THREE.Vector2(0.2, 1.42),
    ];
    return new THREE.LatheGeometry(points, 18);
  }, []);
  useFrame(({ clock }, delta) => {
    if (!rotating.current) return;
    rotating.current.rotation.y += delta * 0.12;
    rotating.current.position.y = 0.13 + Math.sin(clock.elapsedTime * 0.55) * 0.045;
  });

  if (exhibit.kind === "vessel") {
    return (
      <group ref={rotating} position={[0, 0.13, 0]} scale={1.45}>
        <mesh geometry={vesselGeometry}>
          <meshStandardMaterial color={exhibit.color} roughness={0.28} metalness={0.18} />
        </mesh>
        <mesh position={[0, 1.42, 0]}>
          <torusGeometry args={[0.2, 0.035, 6, 18]} />
          <meshStandardMaterial color="#edd8b7" roughness={0.3} />
        </mesh>
      </group>
    );
  }

  if (exhibit.kind === "pull-toy") {
    return (
      <group ref={rotating} position={[0, 0.13, 0]} scale={1.45}>
        <ProductGeometry exhibit={exhibit} setting={55} />
      </group>
    );
  }

  if (exhibit.kind === "convertible-chair") {
    return (
      <group ref={rotating} position={[0, 0.13, 0]} scale={1.45}>
        <ProductGeometry exhibit={exhibit} setting={55} />
      </group>
    );
  }

  if (exhibit.kind === "shell-chair") {
    return (
      <group ref={rotating} position={[0, 0.13, 0]} rotation={[0, 0.4, 0]} scale={1.45}>
        <ProductGeometry exhibit={exhibit} setting={55} />
      </group>
    );
  }

  if (exhibit.kind === "scooter") {
    return (
      <group ref={rotating} position={[0, 0.78, 0]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.05, 0.13, 0.28]} />
          <meshStandardMaterial color={exhibit.color} metalness={0.35} roughness={0.32} />
        </mesh>
        {[-0.58, 0.58].map((x) => (
          <mesh key={x} position={[x, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.11, 14]} />
            <meshStandardMaterial color="#272b29" roughness={0.62} />
          </mesh>
        ))}
        <mesh position={[-0.48, 0.82, 0]}>
          <cylinderGeometry args={[0.045, 0.05, 0.76, 8]} />
          <meshStandardMaterial color="#c9c4b8" metalness={0.75} roughness={0.3} />
        </mesh>
        <mesh position={[-0.48, 1.22, 0]}>
          <boxGeometry args={[0.62, 0.06, 0.08]} />
          <meshStandardMaterial color="#c9c4b8" metalness={0.75} roughness={0.3} />
        </mesh>
      </group>
    );
  }

  if (exhibit.kind === "chair") {
    return (
      <group ref={rotating} position={[0, 0.78, 0]}>
        <mesh position={[0, 0.67, 0]}>
          <boxGeometry args={[1.1, 0.25, 0.82]} />
          <meshStandardMaterial color={exhibit.color} roughness={0.76} />
        </mesh>
        <mesh position={[0, 1.18, -0.3]} rotation={[-0.16, 0, 0]}>
          <boxGeometry args={[1.1, 0.9, 0.2]} />
          <meshStandardMaterial color={exhibit.color} roughness={0.76} />
        </mesh>
        {[-0.38, 0.38].map((x) => (
          <mesh key={x} position={[x, 0.29, 0.02]}>
            <cylinderGeometry args={[0.045, 0.055, 0.62, 8]} />
            <meshStandardMaterial color="#806a52" metalness={0.38} roughness={0.48} />
          </mesh>
        ))}
      </group>
    );
  }

  if (exhibit.kind === "lamp") {
    return (
      <group ref={rotating} position={[0, 0.78, 0]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.42, 0.46, 0.16, 16]} />
          <meshStandardMaterial color="#5e625d" metalness={0.52} roughness={0.36} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.055, 0.075, 1.08, 10]} />
          <meshStandardMaterial color="#c4a878" metalness={0.76} roughness={0.26} />
        </mesh>
        <mesh position={[0, 1.28, 0]}>
          <sphereGeometry args={[0.37, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={exhibit.color} emissive={exhibit.color} emissiveIntensity={0.35} roughness={0.36} />
        </mesh>
      </group>
    );
  }

  const shapeColor = exhibit.color ?? "#c4a878";
  return (
    <group ref={rotating} position={[0, 0.82, 0]}>
      <mesh position={[0, 0.72, 0]} rotation={[0.3, 0.2, 0.2]}>
        <torusKnotGeometry args={[0.42, 0.13, 48, 8, 2, 3]} />
        <meshStandardMaterial color={shapeColor} roughness={0.32} metalness={0.24} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color="#e2d4bd" roughness={0.4} />
      </mesh>
    </group>
  );
}

function Visitor({ position, rotation, jacket, trousers }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.045, 0.035]}>
        <boxGeometry args={[0.26, 0.09, 0.4]} />
        <meshStandardMaterial color="#282a27" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.47, 0]}>
        <capsuleGeometry args={[0.085, 0.54, 3, 7]} />
        <meshStandardMaterial color={trousers} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.12, 0]}>
        <capsuleGeometry args={[0.22, 0.58, 4, 9]} />
        <meshStandardMaterial color={jacket} roughness={0.82} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.27, 1.19, 0]}>
          <mesh rotation={[0, 0, side * -0.12]} position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.065, 0.055, 0.48, 7]} />
            <meshStandardMaterial color={jacket} roughness={0.84} />
          </mesh>
          <mesh position={[0, -0.48, 0]}>
            <sphereGeometry args={[0.06, 7, 6]} />
            <meshStandardMaterial color="#b5967b" roughness={0.9} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.69, 0.015]}>
        <sphereGeometry args={[0.17, 14, 12]} />
        <meshStandardMaterial color="#b99b80" roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.78, -0.035]}>
        <sphereGeometry args={[0.174, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
        <meshStandardMaterial color="#423a34" roughness={0.96} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.061, 1.718, 0.172]}>
            <sphereGeometry args={[0.03, 12, 9]} />
            <meshStandardMaterial color="#f0e2d0" roughness={0.55} />
          </mesh>
          <mesh position={[side * 0.061, 1.719, 0.197]}>
            <sphereGeometry args={[0.015, 10, 7]} />
            <meshStandardMaterial color="#302a26" roughness={0.45} />
          </mesh>
          <mesh position={[side * 0.061, 1.759, 0.174]} rotation={[0, 0, -side * 0.12]}>
            <boxGeometry args={[0.065, 0.014, 0.016]} />
            <meshStandardMaterial color="#55443a" roughness={0.75} />
          </mesh>
          <mesh position={[side * 0.17, 1.68, 0.015]}>
            <sphereGeometry args={[0.045, 8, 7]} />
            <meshStandardMaterial color="#aa8a72" roughness={0.86} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.678, 0.204]}>
        <sphereGeometry args={[0.036, 10, 8]} />
        <meshStandardMaterial color="#a98368" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.632, 0.18]}>
        <boxGeometry args={[0.082, 0.018, 0.018]} />
        <meshStandardMaterial color="#754f4a" roughness={0.82} />
      </mesh>
    </group>
  );
}

function Exhibit({ exhibit, index, onSelect }) {
  const group = useRef(null);
  const postPositions = [-1.22, 1.22];
  const [x, z] = exhibit.roomPosition;

  return (
    <group
      ref={group}
      position={[x, 0, z]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(exhibit);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      <Sculpture exhibit={exhibit} />
      {postPositions.map((x) => <Stanchion key={x} x={x} />)}
      <Rope color={index % 2 === 0 ? "#673036" : "#7c3336"} />
      <Html position={[0, 0.17, 0.82]} center distanceFactor={7}>
        <a
          className="placard"
          href={exhibit.pdf}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${exhibit.title} project PDF`}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <span>{exhibit.eyebrow.split(" / ")[0]} / {exhibit.title}</span>
          <strong>VIEW PROJECT PDF <span aria-hidden="true">↗</span></strong>
        </a>
      </Html>
    </group>
  );
}

function CameraRig({ trigger, onActiveChange }) {
  const { camera } = useThree();

  useEffect(() => {
    const triggerElement = trigger.current;
    if (!triggerElement) return undefined;
    const lookTarget = { x: 0, y: 1.55, z: 1.5 };
    const initial = CAMERA_WAYPOINTS[0];
    camera.position.set(...initial.position);
    camera.lookAt(...initial.target);
    let activeIndex = -1;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.9,
        onUpdate: (self) => {
          const next = Math.min(EXHIBITS.length - 1, Math.round(self.progress * (EXHIBITS.length - 1)));
          if (next !== activeIndex) {
            activeIndex = next;
            onActiveChange(next);
          }
        },
      },
    });

    CAMERA_WAYPOINTS.slice(1).forEach((waypoint, index) => {
      const position = waypoint.position;
      const target = waypoint.target;
      const at = index;
      timeline.to(camera.position, {
        x: position[0],
        y: position[1],
        z: position[2],
        duration: 1,
        ease: "power2.inOut",
      }, at);
      timeline.to(lookTarget, {
        x: target[0],
        y: target[1],
        z: target[2],
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(lookTarget.x, lookTarget.y, lookTarget.z),
      }, at);
    });

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
      document.body.style.cursor = "";
    };
  }, [camera, onActiveChange, trigger]);

  return null;
}

export function MuseumScene({ trigger, onActiveChange, onSelect }) {
  return (
    <div className="scene">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 58, near: 0.1, far: 100, position: CAMERA_WAYPOINTS[0].position }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#25241f"]} />
        <fog attach="fog" args={["#292822", 45, 100]} />
        <hemisphereLight args={["#eee8dc", "#51483b", 1.7]} />
        <ambientLight intensity={1.3} color="#eee5d6" />
        <directionalLight position={[0, 7, 6]} intensity={1.35} color="#fff3df" />
        <Corridor />
        <GalleryRoom />
        {PANEL_EXHIBITS.map((exhibit) => (
          <WallPanel key={exhibit.id} exhibit={exhibit} />
        ))}
        {PROJECTS.map((exhibit) => (
          <ProjectWallDisplay key={`wall-${exhibit.id}`} exhibit={exhibit} />
        ))}
        {VISITORS.map((visitor) => (
          <Visitor key={`${visitor.position[0]}-${visitor.position[2]}`} {...visitor} />
        ))}
        {PROJECTS.map((exhibit, index) => (
          <Exhibit
            key={exhibit.id}
            exhibit={exhibit}
            index={index}
            onSelect={onSelect}
          />
        ))}
        <CameraRig trigger={trigger} onActiveChange={onActiveChange} />
      </Canvas>
    </div>
  );
}
