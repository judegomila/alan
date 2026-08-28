"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const NODE_W = 0.78;
const NODE_D = 0.36;
const NODE_H = 0.42;
const RAIL = 0.02;

function Gpu({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* card body, hanging from the top rails like an open-air mining rig */}
      <mesh>
        <boxGeometry args={[0.05, 0.13, 0.3]} />
        <meshStandardMaterial color="#27272a" metalness={0.5} roughness={0.45} />
      </mesh>
      {/* amber backplate strip */}
      <mesh position={[0, 0.069, 0]}>
        <boxGeometry args={[0.05, 0.008, 0.3]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
      </mesh>
      {/* fan hubs on one face */}
      {[-0.09, 0, 0.09].map((z) => (
        <mesh key={z} position={[0.027, -0.02, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.038, 0.038, 0.006, 20]} />
          <meshStandardMaterial color="#3f3f46" metalness={0.3} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function FrameRail({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#52525b" metalness={0.7} roughness={0.35} />
    </mesh>
  );
}

function Node({ position, gpus }: { position: [number, number, number]; gpus: number }) {
  const x = NODE_W / 2;
  const z = NODE_D / 2;
  const slots = Math.max(gpus, 1);
  return (
    <group position={position}>
      {/* four corner posts */}
      {[
        [-x, -z],
        [x, -z],
        [-x, z],
        [x, z],
      ].map(([px, pz], i) => (
        <FrameRail key={i} position={[px, NODE_H / 2, pz]} size={[RAIL, NODE_H, RAIL]} />
      ))}
      {/* top rails the GPUs hang from */}
      <FrameRail position={[0, NODE_H, -z + 0.06]} size={[NODE_W + RAIL, RAIL, RAIL]} />
      <FrameRail position={[0, NODE_H, z - 0.06]} size={[NODE_W + RAIL, RAIL, RAIL]} />
      {/* base rails */}
      <FrameRail position={[0, 0, -z]} size={[NODE_W + RAIL, RAIL, RAIL]} />
      <FrameRail position={[0, 0, z]} size={[NODE_W + RAIL, RAIL, RAIL]} />
      {/* motherboard */}
      <mesh position={[-0.08, 0.03, 0]}>
        <boxGeometry args={[0.32, 0.012, 0.3]} />
        <meshStandardMaterial color="#18181b" roughness={0.7} />
      </mesh>
      {/* CPU tower heatsink */}
      <mesh position={[-0.13, 0.09, -0.04]}>
        <boxGeometry args={[0.09, 0.1, 0.09]} />
        <meshStandardMaterial color="#71717a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* RAM sticks */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.02 + i * 0.018, 0.065, 0.09]}>
          <boxGeometry args={[0.006, 0.055, 0.13]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.15} />
        </mesh>
      ))}
      {/* PSU block */}
      <mesh position={[0.27, 0.06, 0]}>
        <boxGeometry args={[0.18, 0.09, 0.16]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* GPUs across the top */}
      {Array.from({ length: gpus }, (_, i) => (
        <Gpu
          key={i}
          position={[-x + 0.12 + (i * (NODE_W - 0.24)) / Math.max(slots - 1, 1), NODE_H - 0.09, 0]}
        />
      ))}
    </group>
  );
}

export function RigModel({ gpusPerNode }: { gpusPerNode: number[] }) {
  const n = gpusPerNode.length;
  const spacing = 1.0;
  return (
    <Canvas camera={{ position: [n * 0.9 + 0.8, 1.2, n * 0.9 + 0.8], fov: 38 }}>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 2]} intensity={1.4} />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#f59e0b" />
      <group position={[0, -0.25, 0]}>
        {gpusPerNode.map((g, i) => (
          <Node key={i} position={[(i - (n - 1) / 2) * spacing, 0, 0]} gpus={g} />
        ))}
        <gridHelper args={[8, 32, "#3f3f46", "#1c1c1f"]} position={[0, -0.005, 0]} />
      </group>
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.7}
        enablePan={false}
        minDistance={1.2}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
