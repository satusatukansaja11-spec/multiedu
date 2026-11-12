import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { Shape } from './WorldScenery.jsx';
import { CITY_BUILDINGS, CITY_SIZE, createTrafficRoute } from './city-layout.js';
function Sign({ text, position, width = 7, height = 1.2, back = false, color = '#142337' }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1024, 192);
    ctx.fillStyle = '#fff9dc';
    ctx.font = '900 86px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 512, 100, 970);
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, [text, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position} rotation={[0, back ? Math.PI : 0, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
function Tree({ x, z }) {
  return (
    <group position={[x, 0, z]}>
      <Shape position={[0, 0.9, 0]} scale={[0.3, 1.8, 0.3]} color="#7f603c" />
      <Shape position={[0, 2, 0]} scale={[1.2, 1.2, 1.2]} type="sphere" color="#459959" />
    </group>
  );
}
function Bench({ position, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-0.8, 0.8].map((x) => (
        <Shape key={x} position={[x, 0.4, 0]} scale={[0.18, 0.8, 0.7]} color="#334f50" />
      ))}
      <Shape position={[0, 0.8, 0]} scale={[2.2, 0.16, 0.8]} color="#b78646" />
      <Shape position={[0, 1.25, -0.35]} scale={[2.2, 0.7, 0.16]} color="#b78646" />
    </group>
  );
}
function House({ x, z, index }) {
  const roofs = ['#df6754', '#e6ae3a', '#7499b0', '#a96bb4'];
  return (
    <group position={[x, 0, z]}>
      <Shape position={[0, 1.5, 0]} scale={[5, 3, 4.5]} color={index % 2 ? '#edd4ab' : '#c6dfd1'} />
      <mesh position={[0, 3.7, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[4, 1.8, 4]} />
        <meshStandardMaterial color={roofs[index % 4]} />
      </mesh>
      <Shape position={[0, 1, 2.3]} scale={[0.9, 2, 0.08]} color="#6b644e" />
      {[-1.6, 1.6].map((a) => (
        <Shape key={a} position={[a, 1.8, 2.3]} scale={[0.9, 0.8, 0.08]} color="#a7d6e1" />
      ))}
    </group>
  );
}
function Office({ item }) {
  return (
    <group position={item.position}>
      <Shape position={[0, 3.4, 0]} scale={[8, 6.8, 7]} color="#e1eee5" />
      {[0.45, 3.5, 6.7].map((y) => (
        <Shape key={y} position={[0, y, 0]} scale={[8.3, 0.35, 7.3]} color={item.color} />
      ))}
      {[-2.7, 0, 2.7].map((x) =>
        [2, 5].map((y) => (
          <Shape
            key={`${x}-${y}`}
            position={[x, y, 3.55]}
            scale={[1.3, 1.4, 0.08]}
            color="#88bac8"
          />
        )),
      )}
      <Shape position={[0, 1.5, 3.7]} scale={[1.6, 3, 0.15]} color={item.color} />
      <Shape position={[0, 0.1, 4]} scale={[4, 0.2, 1.3]} color="#fff7db" />
      <Sign position={[0, 8, 0]} text={item.name} width={9} height={1.6} />
      <Sign position={[0, 8, -0.04]} text={item.name} width={9} height={1.6} back />
    </group>
  );
}
function RoadGrid() {
  const lines = [-30, -10, 10, 30];
  return (
    <group>
      {lines.map((a) => (
        <group key={a}>
          <Shape position={[a, -0.08, 0]} scale={[8, 0.18, 68]} color="#f1eee0" />
          <Shape position={[a, 0.025, 0]} scale={[6, 0.04, 68]} color="#505c6c" />
          <Shape position={[0, -0.08, a]} scale={[68, 0.18, 8]} color="#f1eee0" />
          <Shape position={[0, 0.03, a]} scale={[68, 0.04, 6]} color="#505c6c" />
          {Array.from({ length: 23 }, (_, i) => -33 + i * 3)
            .filter((b) => lines.every((c) => Math.abs(c - b) > 4))
            .map((b) => (
              <group key={b}>
                <Shape position={[a, 0.06, b]} scale={[0.1, 0.02, 1.4]} color="#fff5df" />
                <Shape position={[b, 0.07, a]} scale={[1.4, 0.02, 0.1]} color="#fff5df" />
              </group>
            ))}
        </group>
      ))}
      {lines.flatMap((x) =>
        lines.map((z) => (
          <group position={[x, 0.08, z]} key={`${x}-${z}`}>
            {[-4.2, 4.2].map((offset) =>
              Array.from({ length: 6 }, (_, i) => (
                <group key={`${offset}-${i}`}>
                  <Shape
                    position={[-2.3 + i * 0.9, 0, offset]}
                    scale={[0.45, 0.02, 1.1]}
                    color="#fff9e8"
                  />
                  <Shape
                    position={[offset, 0.005, -2.3 + i * 0.9]}
                    scale={[1.1, 0.02, 0.45]}
                    color="#fff9e8"
                  />
                </group>
              )),
            )}
          </group>
        )),
      )}
    </group>
  );
}
function Vehicle({ extent, offset, speed, bus, color, paused }) {
  const group = useRef(),
    travel = useRef(offset);
  const curve = useMemo(() => createTrafficRoute(extent), [extent]);
  const length = useMemo(() => curve.getLength(), [curve]);
  useFrame((_, delta) => {
    if (!group.current) return;
    if (!paused) travel.current = (travel.current + (Math.min(delta, 0.08) * speed) / length) % 1;
    const point = curve.getPointAt(travel.current);
    const tangent = curve.getTangentAt(travel.current);
    group.current.position.copy(point);
    group.current.rotation.y = Math.atan2(tangent.x, tangent.z);
  });
  return (
    <group ref={group}>
      <Shape position={[0, 0.65, 0]} scale={[1.6, 0.8, bus ? 4.8 : 2.7]} color={color} />
      <Shape
        position={[0, 1.15, bus ? 0 : -0.15]}
        scale={[1.4, 0.7, bus ? 4.3 : 1.5]}
        color={bus ? color : '#e9eee5'}
      />
      <Shape position={[0, 1.2, bus ? 2.2 : 0.65]} scale={[1.25, 0.5, 0.05]} color="#9bd8e1" />
      {[-0.83, 0.83].map((x) =>
        [-1, 1].map((sign) => (
          <mesh
            key={`${x}-${sign}`}
            position={[x, 0.4, sign * (bus ? 1.6 : 0.85)]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.35, 0.35, 0.18, 10]} />
            <meshStandardMaterial color="#25303e" />
          </mesh>
        )),
      )}
      {bus &&
        [-1.6, -0.6, 0.4, 1.4].map((z) => (
          <group key={z}>
            {[-0.81, 0.81].map((x) => (
              <Shape key={x} position={[x, 1.2, z]} scale={[0.03, 0.45, 0.7]} color="#99d9eb" />
            ))}
          </group>
        ))}
    </group>
  );
}
export function CityScene({ paused = false }) {
  return (
    <group name="expanded-city">
      <Shape position={[0, -0.3, 0]} scale={[CITY_SIZE, 0.5, CITY_SIZE]} color="#a5d77f" />
      <RoadGrid />
      <Shape position={[0, 0.02, 0]} scale={[12, 0.12, 12]} color="#f4eed9" />
      <mesh position={[0, 0.35, 0]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.5, 0.6, 32]} />
        <meshStandardMaterial color="#d7d5bc" />
      </mesh>
      <mesh position={[0, 0.68, 0]}>
        <cylinderGeometry args={[2, 2, 0.06, 32]} />
        <meshStandardMaterial color="#5bd8e3" />
      </mesh>
      <Shape position={[0, 1.1, 0]} scale={[0.5, 0.9, 0.5]} color="#dedfc5" />
      <group position={[0, 0, -5.8]}>
        {[-4.5, 4.5].map((x) => (
          <Shape key={x} position={[x, 2.8, 0]} scale={[0.6, 5.6, 0.7]} color="#923b32" />
        ))}
        <Shape position={[0, 5.6, 0]} scale={[10.5, 0.45, 1]} color="#75352e" />
        <Shape position={[0, 4.8, 0]} scale={[8.6, 1.5, 0.4]} color="#192b2f" />
        <Sign position={[0, 4.8, 0.22]} text="SELAMAT DATANG" width={8.2} height={1.2} />
        <Sign position={[0, 4.8, -0.22]} text="KOTA ILMU" width={8.2} height={1.2} back />
      </group>
      {CITY_BUILDINGS.map((item) => (
        <Office key={item.topic} item={item} />
      ))}
      {[-20, 0, 20]
        .flatMap((x, col) => [-20, 0, 20].map((z, row) => ({ x, z, index: row * 3 + col })))
        .filter((b) => b.z !== -20 && !(b.x === 0 && b.z === 0))
        .map((b) => (
          <group key={b.index}>
            <House x={b.x - 3} z={b.z - 2} index={b.index} />
            <House x={b.x + 3} z={b.z + 3} index={b.index + 1} />
            <Tree x={b.x - 5} z={b.z + 5} />
          </group>
        ))}
      {[
        [-4, 0, 0],
        [4, 0, 0],
        [-4, 0, 4],
        [4, 0, 4],
      ].map((p, i) => (
        <Bench key={i} position={p} rotation={i % 2 ? Math.PI : 0} />
      ))}
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        return <Tree key={i} x={Math.cos(angle) * 39} z={Math.sin(angle) * 39} />;
      })}
      {[-30, -10, 10, 30].flatMap((x) =>
        [-30, -10, 10, 30].map((z) => (
          <group key={`${x}-${z}`} position={[x + 4, 0, z + 4]}>
            <Shape position={[0, 2.5, 0]} scale={[0.12, 5, 0.12]} color="#41534e" />
            <Shape position={[-0.4, 5, 0]} scale={[1, 0.15, 0.4]} color="#354544" />
            <Shape position={[-0.6, 4.9, 0]} scale={[0.5, 0.05, 0.25]} color="#fff4b8" />
          </group>
        )),
      )}
      {Array.from({ length: 12 }, (_, i) => (
        <Vehicle
          key={i}
          extent={i < 4 ? 10 : 30}
          offset={i < 4 ? i / 4 : (i - 4) / 8}
          speed={i % 3 === 0 ? 4 : 5.5}
          bus={i % 4 === 0}
          color={['#edbd32', '#468dc2', '#dc6654', '#61a77a'][i % 4]}
          paused={paused}
        />
      ))}
    </group>
  );
}
