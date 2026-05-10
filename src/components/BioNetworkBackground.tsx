import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "next-themes";

/**
 * Ambient bio-network backdrop.
 * Reskinned: low-saturation teal particles, no additive blending,
 * no screen blend mode. Reads as observed depth, not Tron.
 */

const ParticleSwarm = ({ color }: { color: string }) => {
  const count = 900;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const radius = 26;
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = Math.cbrt(Math.random()) * radius;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      temp.push({
        t: Math.random() * 100,
        speed: 0.006 + Math.random() / 360,
        xFactor: 1.4 + Math.random() * 1.4,
        yFactor: 1.4 + Math.random() * 1.4,
        zFactor: 1.4 + Math.random() * 1.4,
        baseX: x, baseY: y, baseZ: z,
        currentX: x, currentY: y, currentZ: z,
      });
    }
    return temp;
  }, [count]);

  const { camera } = useThree();

  useFrame(() => {
    if (!meshRef.current) return;
    const mouseVector = new THREE.Vector3(0, 0, 0.5);
    // Smooth, no need for full mouse projection; keep cheap
    particles.forEach((p, i) => {
      p.t += p.speed / 2;
      const xNoise = Math.sin(p.t) * p.xFactor;
      const yNoise = Math.cos(p.t) * p.yFactor;
      const zNoise = Math.sin(p.t) * p.zFactor;
      const targetX = p.baseX + xNoise;
      const targetY = p.baseY + yNoise;
      const targetZ = p.baseZ + zNoise;
      p.currentX += (targetX - p.currentX) * 0.06;
      p.currentY += (targetY - p.currentY) * 0.06;
      p.currentZ += (targetZ - p.currentZ) * 0.06;
      dummy.position.set(p.currentX, p.currentY, p.currentZ);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.rotation.y += 0.0006;
    meshRef.current.rotation.x += 0.00025;

    void mouseVector; // silence unused
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.045, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} />
    </instancedMesh>
  );
};

export const BioNetworkBackground = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Don't render on server / before mount to avoid theme flash
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  // Low-saturation teal — quiet, scientific, never neon
  const particleColor = isDark ? "#4FB3C2" : "#205B6B";
  const fogColor = isDark ? "#0B1115" : "#FBFAF7";

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[-1] pointer-events-none"
      style={{ opacity: isDark ? 0.55 : 0.32 }}
    >
      {/* Subtle radial wash that fades particles toward edges */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(60% 50% at 50% 40%, transparent, hsl(var(--background)) 90%)"
            : "radial-gradient(60% 50% at 50% 40%, transparent, hsl(var(--background)) 90%)",
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 30], fov: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <fog attach="fog" args={[fogColor, 12, 52]} />
        <ParticleSwarm color={particleColor} />
      </Canvas>
    </div>
  );
};
