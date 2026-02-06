import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect.js";
import * as THREE from "three";

export const SauronEyeRenderer = () => {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 3]} intensity={1.5} color="#ffffff" />
      <pointLight position={[3, 3, 3]} intensity={1} color="#ffffff" />
      <directionalLight position={[-3, 3, 3]} intensity={0.8} color="#ffffff" />
      <SauronEye />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
      />
      <Renderer />
    </Canvas>
  );
};

const SauronEye = () => {
  const groupRef = useRef<THREE.Group>(null);
  const eyeRef = useRef<THREE.Mesh>(null);
  const pupilRef = useRef<THREE.Mesh>(null);
  const raysGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Very subtle breathing/pulsing animation
    if (groupRef.current) {
      const pulse = Math.sin(time * 1) * 0.02 + 1;
      groupRef.current.scale.setScalar(pulse);
    }

    // Subtle pupil movement - very minimal
    if (pupilRef.current) {
      pupilRef.current.position.x = Math.sin(time * 0.3) * 0.03;
      pupilRef.current.position.y = Math.cos(time * 0.25) * 0.04;
    }

    // Slowly rotate rays for mystical effect
    if (raysGroupRef.current) {
      raysGroupRef.current.rotation.z = time * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Eye outline/border (almond shape) */}
      <mesh position={[0, 0, 0]} scale={[2.5, 1, 1]}>
        <torusGeometry args={[0.65, 0.08, 16, 64]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Eye (almond-shaped white eye) */}
      <mesh ref={eyeRef} position={[0, 0, 0]} scale={[2.5, 1, 1]}>
        <sphereGeometry args={[0.6, 64, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Outer iris ring */}
      <mesh position={[0, 0, 0.58]}>
        <ringGeometry args={[0.35, 0.42, 64]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Iris (white/gray) */}
      <mesh position={[0, 0, 0.57]}>
        <circleGeometry args={[0.35, 64]} />
        <meshStandardMaterial
          color="#d1d5db"
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Inner iris details (concentric circles) */}
      {[0.28, 0.22, 0.16].map((radius, i) => (
        <mesh key={i} position={[0, 0, 0.58]}>
          <ringGeometry args={[radius - 0.02, radius, 64]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Pupil (round, not slit) */}
      <mesh ref={pupilRef} position={[0, 0, 0.59]}>
        <circleGeometry args={[0.12, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Eye highlights */}
      <mesh position={[0.05, 0.08, 0.6]}>
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.03, 0.06, 0.6]}>
        <circleGeometry args={[0.02, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>

      {/* Solid Rays - Long (24 rays evenly spaced) */}
      <group ref={raysGroupRef}>
        {[...Array(24)].map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const baseDistance = 1.8;
          const x = Math.cos(angle) * baseDistance;
          const y = Math.sin(angle) * baseDistance;
          // Vary ray lengths for visual interest
          const rayLength = i % 3 === 0 ? 1.8 : i % 3 === 1 ? 1.5 : 1.2;
          const rayWidth = 0.08;

          return (
            <group key={i} position={[x, y, 0]} rotation={[0, 0, angle + Math.PI / 2]}>
              <mesh>
                <boxGeometry args={[rayWidth, rayLength, 0.06]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Dashed/Segmented Rays - Medium length (24 rays, offset) */}
      <group rotation={[0, 0, Math.PI / 24]}>
        {[...Array(24)].map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const baseDistance = 1.8;
          const rayLength = i % 2 === 0 ? 1.3 : 1.0;

          // Create 3 segments per ray for dashed effect
          return (
            <group key={i}>
              {[0, 1, 2].map((segmentIndex) => {
                const segmentLength = 0.25;
                const gapLength = 0.15;
                const totalSegmentLength = segmentLength + gapLength;
                const segmentDistance = baseDistance + segmentIndex * totalSegmentLength;
                const x = Math.cos(angle) * segmentDistance;
                const y = Math.sin(angle) * segmentDistance;

                // Only render if within ray length
                if (segmentDistance - baseDistance < rayLength) {
                  return (
                    <group
                      key={segmentIndex}
                      position={[x, y, 0]}
                      rotation={[0, 0, angle + Math.PI / 2]}
                    >
                      <mesh>
                        <boxGeometry args={[0.06, segmentLength, 0.05]} />
                        <meshStandardMaterial
                          color="#ffffff"
                          transparent
                          opacity={0.7}
                        />
                      </mesh>
                    </group>
                  );
                }
                return null;
              })}
            </group>
          );
        })}
      </group>

      {/* Short rays close to eye (12 rays) */}
      <group rotation={[0, 0, Math.PI / 12]}>
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const baseDistance = 1.5;
          const x = Math.cos(angle) * baseDistance;
          const y = Math.sin(angle) * baseDistance;
          const rayLength = 0.6;

          return (
            <group key={i} position={[x, y, 0]} rotation={[0, 0, angle + Math.PI / 2]}>
              <mesh>
                <boxGeometry args={[0.06, rayLength, 0.05]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
};

const Renderer = () => {
  const { gl, scene, camera, size } = useThree();
  const effectRef = useRef<AsciiEffect | null>(null);

  useEffect(() => {
    // Use different ASCII characters for fiery effect
    const effect = new AsciiEffect(
      gl,
      " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"
    );

    effect.domElement.style.position = "absolute";
    effect.domElement.style.top = "0px";
    effect.domElement.style.left = "0px";
    effect.domElement.style.color = "#ffffff"; // White color
    effect.domElement.style.backgroundColor = "#09090b";
    effect.domElement.style.pointerEvents = "none";

    effect.setSize(size.width, size.height);

    const container = gl.domElement.parentNode;
    if (container) {
      container.replaceChild(effect.domElement, gl.domElement);
    }

    effectRef.current = effect;

    return () => {
      if (container && effect.domElement.parentNode) {
        container.replaceChild(gl.domElement, effect.domElement);
      }
    };
  }, [gl, size]);

  useFrame(() => {
    if (effectRef.current) {
      effectRef.current.render(scene, camera);
    }
  }, 1);

  return null;
};

