import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect.js";
import * as THREE from "three";

export const IlluminatiEyeRenderer = () => {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 5]} intensity={1.5} color="#5dc887" />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-5, 5, 5]} intensity={0.5} />
      <IlluminatiEye />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={3}
      />
      <Renderer />
    </Canvas>
  );
};

const IlluminatiEye = () => {
  const groupRef = useRef<THREE.Group>(null);
  const eyeRef = useRef<THREE.Mesh>(null);
  const pupilRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Gentle floating animation
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.2;
    }

    // Eye blinking effect (scale the eye vertically)
    if (eyeRef.current) {
      const blink = Math.abs(Math.sin(time * 0.3));
      eyeRef.current.scale.y = 0.8 + blink * 0.2;
    }

    // Pupil looking around
    if (pupilRef.current) {
      pupilRef.current.position.x = Math.sin(time * 0.4) * 0.15;
      pupilRef.current.position.y = Math.cos(time * 0.3) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Pyramid Base */}
      <mesh position={[0, -2, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[2, 2.5, 4]} />
        <meshStandardMaterial color="#5dc887" wireframe={false} />
      </mesh>

      {/* Pyramid Edges (wireframe overlay) */}
      <mesh position={[0, -2, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[2.01, 2.51, 4]} />
        <meshBasicMaterial color="#ffffff" wireframe={true} />
      </mesh>

      {/* Eye Socket (outer glow) */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshStandardMaterial
          color="#5dc887"
          transparent
          opacity={0.2}
          emissive="#5dc887"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Eye (white part) */}
      <mesh ref={eyeRef} position={[0, 0.5, 0]}>
        <sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>

      {/* Iris */}
      <mesh position={[0, 0.5, 0.85]}>
        <circleGeometry args={[0.4, 32]} />
        <meshStandardMaterial color="#5dc887" />
      </mesh>

      {/* Pupil */}
      <mesh ref={pupilRef} position={[0, 0.5, 0.9]}>
        <circleGeometry args={[0.15, 32]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Eye shine/reflection */}
      <mesh position={[0.15, 0.65, 0.92]}>
        <circleGeometry args={[0.08, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Rays around the eye (8 triangular rays) */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 2.5;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance + 0.5;

        return (
          <group key={i} position={[x, y, 0]} rotation={[0, 0, angle]}>
            <mesh>
              <coneGeometry args={[0.15, 0.8, 3]} />
              <meshStandardMaterial
                color="#5dc887"
                emissive="#5dc887"
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const Renderer = () => {
  const { gl, scene, camera, size } = useThree();
  const effectRef = useRef<AsciiEffect | null>(null);

  useEffect(() => {
    // Use different ASCII characters for more detail
    const effect = new AsciiEffect(
      gl,
      " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"
    );

    effect.domElement.style.position = "absolute";
    effect.domElement.style.top = "0px";
    effect.domElement.style.left = "0px";
    effect.domElement.style.color = "#ffffff";
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
