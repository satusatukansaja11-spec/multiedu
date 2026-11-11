import { Float } from '@react-three/drei';
export function Shape({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  color = '#fff',
  type = 'box',
  rotation = [0, 0, 0],
}) {
  return (
    <mesh position={position} scale={scale} rotation={rotation} castShadow>
      <meshStandardMaterial color={color} roughness={0.8} />
      {type === 'sphere' ? (
        <icosahedronGeometry args={[1, 1]} />
      ) : type === 'cone' ? (
        <coneGeometry args={[1, 2, 6]} />
      ) : type === 'cylinder' ? (
        <cylinderGeometry args={[1, 1, 1, 8]} />
      ) : (
        <boxGeometry />
      )}
    </mesh>
  );
}
export function WorldScenery({ world }) {
  const edge = [
    [-8, -5],
    [8, -4],
    [-8, 3],
    [7, 5],
  ];
  return (
    <group>
      {world === 'city' && (
        <>
          <Shape position={[0, 0.3, 0]} scale={[2, 0.5, 2]} color="#e5ddc4" type="cylinder" />
          <Shape position={[0, 0.58, 0]} scale={[1.8, 0.05, 1.8]} color="#54daf0" type="cylinder" />
          {[-6, 6].map((x) => (
            <group key={x} position={[x, 0, 4]}>
              <Shape
                position={[0, 0.5, 0]}
                scale={[1.8, 0.6, 0.8]}
                color={x < 0 ? '#f5ca41' : '#ea6652'}
              />
              {[-0.6, 0.6].map((z) => (
                <Shape
                  key={z}
                  position={[z, 0.2, 0.4]}
                  scale={[0.25, 0.25, 0.2]}
                  color="#263348"
                  type="cylinder"
                />
              ))}
            </group>
          ))}
        </>
      )}
      {edge.map(([x, z], i) => (
        <group position={[x, 0, z]} key={i}>
          {world === 'ocean' && (
            <>
              <Shape position={[0, 0.5, 0]} scale={[0.2, 1, 0.2]} color="#d565a5" />
              <Shape position={[0.4, 0.4, 0]} scale={[0.2, 0.8, 0.2]} color="#b18de1" />
              <Shape position={[1, 1, 0]} scale={[0.08, 2, 0.1]} color="#36895e" />
              <Float speed={2}>
                <Shape
                  position={[0, 3, 0]}
                  scale={[0.5, 0.25, 0.18]}
                  color="#ffc848"
                  type="sphere"
                />
                <Shape
                  position={[-0.5, 3, 0]}
                  scale={[0.25, 0.3, 0.12]}
                  color="#f7b13d"
                  type="cone"
                />
              </Float>
            </>
          )}
          {world === 'space' && (
            <>
              <Shape position={[0, 0.4, 0]} scale={[1, 0.7, 1]} color="#aaaabd" type="sphere" />
              <Shape position={[0, 2, 0]} scale={[0.45, 2, 0.45]} color="#ecf0ff" type="cylinder" />
              <Shape position={[0, 3.8, 0]} scale={[0.45, 0.7, 0.45]} color="#ef766a" type="cone" />
            </>
          )}
          {world === 'forest' && (
            <>
              <Shape position={[0, 1.8, 0]} scale={[0.5, 3.6, 0.5]} color="#5e513c" />
              <Shape position={[0, 3.4, 0]} scale={[2, 2, 2]} color="#226440" type="sphere" />
              <Shape position={[1, 0.15, 0]} scale={[0.7, 0.3, 1]} color="#5b98d1" />
            </>
          )}
          {world === 'islands' && (
            <>
              <Shape position={[0, 1.5, 0]} scale={[0.3, 3, 0.3]} color="#957344" />
              <Shape
                position={[0, 3, 0]}
                scale={[2, 0.12, 0.5]}
                color="#369b66"
                rotation={[0, i, 0]}
              />
              <Shape
                position={[0, 3, 0]}
                scale={[0.5, 0.12, 2]}
                color="#369b66"
                rotation={[0, i, 0]}
              />
              <Shape position={[0, 0.25, 1]} scale={[1.8, 0.35, 0.7]} color="#986849" />
            </>
          )}
          {world === 'global' && (
            <>
              <Shape position={[0, 1, 0]} scale={[1.5, 2, 1.5]} color="#dbbc78" type="cone" />
              <Shape position={[1.7, 2, 0]} scale={[0.15, 4, 0.15]} color="#607187" />
              <Shape position={[1.7, 3, 0]} scale={[0.8, 0.12, 0.8]} color="#607187" />
            </>
          )}
          {world === 'body' && (
            <>
              <Shape position={[0, 1, 0]} scale={[1.1, 0.7, 1.1]} color="#e94366" type="sphere" />
              <Shape position={[1, 2, 0]} scale={[0.7, 0.7, 0.7]} color="#f1a6b9" type="sphere" />
              <Shape position={[0, 3, 0]} scale={[0.4, 0.4, 0.4]} color="#fff4df" type="sphere" />
            </>
          )}
          {world === 'prehistoric' && (
            <>
              <Shape position={[0, 1, 0]} scale={[1.2, 0.6, 0.5]} color="#819d5b" />
              <Shape position={[0.8, 1.5, 0]} scale={[0.4, 0.9, 0.4]} color="#819d5b" />
              <Shape position={[1, 2, 0]} scale={[0.65, 0.4, 0.4]} color="#819d5b" />
              {[-0.4, 0.4].map((a) => (
                <Shape key={a} position={[a, 0.4, 0]} scale={[0.2, 0.8, 0.2]} color="#819d5b" />
              ))}
            </>
          )}
          {world === 'history' && (
            <>
              {[0, 1, 2].map((h) => (
                <Shape
                  key={h}
                  position={[0, h * 0.5 + 0.25, 0]}
                  scale={[2 - h * 0.5, 0.5, 2 - h * 0.5]}
                  color="#81787d"
                />
              ))}
              <Shape position={[0, 2, 0]} scale={[0.35, 1, 0.35]} color="#aaa09a" type="cone" />
            </>
          )}
          {world === 'extreme' && (
            <>
              <Shape position={[0, 1, 0]} scale={[1, 2, 1]} color="#d1eeff" type="cone" />
              <Shape position={[1, 0.6, 1]} scale={[1, 0.8, 1]} color="#f4a14a" type="cone" />
            </>
          )}
          {world === 'future' && (
            <>
              <Shape position={[0, 2, 0]} scale={[0.6, 4, 0.6]} color="#485f85" />
              <Shape position={[0, 4, 0]} scale={[1, 0.2, 1]} color="#52e0dc" />
              <Float>
                <Shape position={[1, 2, 0]} scale={[1, 0.3, 0.5]} color="#c0f2fd" />
              </Float>
              <Shape position={[0, 0.5, 1]} scale={[1, 0.1, 1]} color="#1c4766" />
            </>
          )}
        </group>
      ))}
      {world === 'ocean' && (
        <mesh position={[0, -0.7, -6]}>
          <sphereGeometry args={[3, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#70ddf5" wireframe transparent opacity={0.4} />
        </mesh>
      )}
      {world === 'space' &&
        Array.from({ length: 35 }, (_, i) => (
          <Shape
            key={i}
            position={[Math.sin(i * 7) * 30, 8 + (i % 7) * 2, -10 - (i % 15)]}
            scale={[0.06, 0.06, 0.06]}
            color="#fff"
            type="sphere"
          />
        ))}
      {world === 'forest' && <Shape position={[-9, 2, -8]} scale={[2, 4, 0.3]} color="#72cbec" />}
      {world === 'prehistoric' && (
        <>
          <Shape position={[-10, 3, -13]} scale={[4, 6, 4]} color="#594e54" type="cone" />
          <Shape position={[-10, 6, -13]} scale={[1, 0.3, 1]} color="#ff7d49" />
        </>
      )}
    </group>
  );
}
