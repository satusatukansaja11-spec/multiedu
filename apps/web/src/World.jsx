import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, OrbitControls, ContactShadows } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
const COLORS = ['#f16c68', '#46a9f5', '#35cc8a', '#ffd344'];
function Block({ position, scale, color, ...props }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow {...props}>
      <boxGeometry />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}
function Avatar({
  position = [0, 0, 0],
  color = '#ffd244',
  name,
  player = false,
  movement,
  onZone,
  feedback,
}) {
  const group = useRef();
  const keys = useRef({});
  const zone = useRef(-1);
  const reaction = useRef(0);
  useEffect(() => {
    reaction.current = feedback ? 1 : 0;
  }, [feedback]);
  useEffect(() => {
    if (!player) return;
    const down = (event) => {
      if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
      keys.current[event.key.toLowerCase()] = true;
      if (event.key.startsWith('Arrow')) event.preventDefault();
    };
    const up = (event) => {
      keys.current[event.key.toLowerCase()] = false;
    };
    const blur = () => {
      keys.current = {};
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [player]);
  useFrame((state, delta) => {
    if (!player || !group.current) return;
    const input = keys.current;
    const x =
      Number(input.d || input.arrowright || movement === 'right') -
      Number(input.a || input.arrowleft || movement === 'left');
    const z =
      Number(input.s || input.arrowdown || movement === 'down') -
      Number(input.w || input.arrowup || movement === 'up');
    group.current.position.x = THREE.MathUtils.clamp(
      group.current.position.x + x * delta * 4,
      -7,
      7,
    );
    group.current.position.z = THREE.MathUtils.clamp(
      group.current.position.z + z * delta * 4,
      -4.8,
      6,
    );
    group.current.rotation.y = x || z ? Math.atan2(x, z) : group.current.rotation.y;
    reaction.current = Math.max(0, reaction.current - delta);
    const bounce = Math.sin(reaction.current * Math.PI) * (feedback?.isCorrect ? 2 : -1.5);
    group.current.position.y =
      bounce + (x || z ? Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.12 : 0);
    const px = group.current.position.x,
      pz = group.current.position.z;
    const next =
      Math.abs(px) < 4.4 && pz < 0 && pz > -4.5 ? (pz < -2.2 ? 0 : 2) + (px > 0 ? 1 : 0) : -1;
    if (zone.current !== next) {
      zone.current = next;
      onZone?.(next);
    }
  });
  return (
    <group ref={group} position={position}>
      <Block position={[0, 0.48, 0]} scale={[0.24, 0.65, 0.3]} color="#263656" />
      <Block position={[0.32, 0.48, 0]} scale={[0.24, 0.65, 0.3]} color="#263656" />
      <Block position={[0.16, 1.05, 0]} scale={[0.72, 0.6, 0.4]} color={color} />
      <Block position={[-0.34, 1.02, 0]} scale={[0.22, 0.65, 0.28]} color="#f4c797" />
      <Block position={[0.66, 1.02, 0]} scale={[0.22, 0.65, 0.28]} color="#f4c797" />
      <Block position={[0.16, 1.64, 0]} scale={[0.52, 0.52, 0.48]} color="#f4c797" />
      <Block position={[0.16, 1.94, -0.03]} scale={[0.58, 0.16, 0.54]} color="#3c2a28" />
      <Block position={[0.04, 1.68, 0.247]} scale={[0.05, 0.06, 0.02]} color="#252a34" />
      <Block position={[0.29, 1.68, 0.247]} scale={[0.05, 0.06, 0.02]} color="#252a34" />
      {name && (
        <Html position={[0.15, 2.4, 0]} center distanceFactor={17}>
          <span className={`avatar-label ${player ? 'avatar-label--you' : ''}`}>{name}</span>
        </Html>
      )}
    </group>
  );
}
function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <Block position={[0, 0.6, 0]} scale={[0.22, 1.2, 0.22]} color="#a77548" />
      <mesh position={[0, 1.65, 0]} castShadow>
        <icosahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color="#3d9d75" />
      </mesh>
    </group>
  );
}
function Building({ position, color, label, letter }) {
  return (
    <group position={position}>
      <Block position={[0, 1.3, 0]} scale={[2.2, 2.6, 1.7]} color={color} />
      <Block position={[0, 2.68, 0]} scale={[2.45, 0.2, 2]} color="#eff6ed" />
      <Block position={[0, 0.65, 0.88]} scale={[0.65, 1.3, 0.08]} color="#263b5b" />
      <Block position={[-0.7, 1.65, 0.88]} scale={[0.4, 0.5, 0.08]} color="#c9ecf5" />
      <Block position={[0.7, 1.65, 0.88]} scale={[0.4, 0.5, 0.08]} color="#c9ecf5" />
      <Html position={[0, 3.3, 0]} center distanceFactor={20}>
        <div className="building-label">
          <b style={{ background: color }}>{letter}</b>
          {label}
        </div>
      </Html>
    </group>
  );
}
function Scene({ active, movement, onZone, topic, feedback }) {
  return (
    <>
      <color attach="background" args={['#b9dfe6']} />
      <fog attach="fog" args={['#b9dfe6', 25, 65]} />
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[-8, 16, 8]}
        intensity={2.3}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <group position={[0, -0.5, 0]}>
        <Block position={[0, -0.4, 0]} scale={[20, 1, 17]} color="#b9df91" />
        <mesh position={[0, -2, 0]}>
          <cylinderGeometry args={[11.5, 5, 4, 7]} />
          <meshStandardMaterial color="#799a79" />
        </mesh>
      </group>
      <Block position={[0, -0.02, 3.8]} scale={[3.4, 0.08, 6.8]} color="#73849a" />
      {[1.2, 2.7, 4.2, 5.7].map((z) => (
        <Block key={z} position={[0, 0.03, z]} scale={[0.13, 0.02, 0.7]} color="#fff9e9" />
      ))}
      {COLORS.map((color, index) => (
        <group key={color} position={[index % 2 ? 2.2 : -2.2, 0, index < 2 ? -3.35 : -1.1]}>
          <Block position={[0, 0.02, 0]} scale={[4.25, 0.12, 2.1]} color={color} />
          <Html position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]} transform>
            <span className="tile-letter">{'ABCD'[index]}</span>
          </Html>
        </group>
      ))}
      <Building position={[-6.2, 0, -4.8]} color="#437dc7" label="WORD" letter="W" />
      <Building position={[0, 0, -6.4]} color="#399f78" label="EXCEL" letter="X" />
      <Building position={[6.2, 0, -4.8]} color="#d97d5d" label="POWERPOINT" letter="P" />
      {[
        [-8, 0, 2],
        [-7, 0, 5],
        [7, 0, 4],
        [8, 0, 0],
        [-4, 0, 6],
        [8, 0, -6],
      ].map((position, index) => (
        <Tree key={index} position={position} scale={index % 2 ? 0.8 : 1} />
      ))}
      {[-15, -6, 9, 18].map((x, index) => (
        <mesh key={x} position={[x, -1, -20 - index * 3]}>
          <coneGeometry args={[7, 15 + index * 2, 5]} />
          <meshStandardMaterial color={index % 2 ? '#8dafaa' : '#9dbeb3'} />
        </mesh>
      ))}
      {[
        [-9, 8, -7],
        [8, 7, -10],
        [1, 10, -16],
      ].map((position, index) => (
        <Float key={index} speed={0.6} floatIntensity={0.4}>
          <group position={position}>
            <Block scale={[3, 0.5, 1.2]} color="#fffdf2" />
            <Block position={[0.3, 0.3, 0]} scale={[1.5, 0.5, 1]} color="#fffdf2" />
          </group>
        </Float>
      ))}
      <Avatar
        key={active ? topic : 'lobby'}
        position={[0, 0, 3]}
        player
        feedback={feedback}
        name="Kamu"
        movement={movement}
        onZone={onZone}
      />
      {!active && (
        <>
          <Avatar position={[-3, 0, 2.5]} color="#8f80d8" />
          <Avatar position={[3.2, 0, 1.6]} color="#5eacba" />
        </>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 4.6]}>
        <ringGeometry args={[1.1, 1.22, 48]} />
        <meshBasicMaterial color="#4de0f1" />
      </mesh>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.25} scale={25} blur={2} far={5} />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={12}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.6}
        minPolarAngle={Math.PI / 6}
        target={[0, 0, -1]}
      />
    </>
  );
}
export function World(props) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div className="world-fallback">
        Arena 3D tidak tersedia. Kamu tetap dapat menjawab melalui tombol A–D.
      </div>
    );
  return (
    <div className="world-canvas">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [12, 14, 19], fov: 42 }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', () => setFailed(true), { once: true });
        }}
        fallback={
          <div className="world-fallback">
            WebGL tidak tersedia. Gunakan tombol jawaban untuk bermain.
          </div>
        }
      >
        <Scene {...props} />
      </Canvas>
    </div>
  );
}
