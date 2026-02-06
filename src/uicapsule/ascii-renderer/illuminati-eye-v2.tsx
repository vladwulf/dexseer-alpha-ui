import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect.js";
import * as THREE from "three";

export const IlluminatiEyeV2 = () => {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 5]} intensity={2} color="#ffffff" />
      <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-5, 5, 5]} intensity={0.8} />
      <IlluminatiEye />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
      <Renderer />
    </Canvas>
  );
};

const IlluminatiEye = () => {
  const groupRef = useRef<THREE.Group>(null);
  const eyeTopLidRef = useRef<THREE.Mesh>(null);
  const eyeBottomLidRef = useRef<THREE.Mesh>(null);
  const pupilGroupRef = useRef<THREE.Group>(null);
  const blinkTimeRef = useRef(0);
  const lookDirectionRef = useRef(0);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Gentle floating animation
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.15;
    }

    // Eye looking around (bottom left and right)
    if (pupilGroupRef.current) {
      // Change direction every 3 seconds
      if (time - lookDirectionRef.current > 3) {
        lookDirectionRef.current = time;
      }
      
      const lookPhase = Math.floor((time - lookDirectionRef.current) / 3) % 3;
      let targetX = 0;
      let targetY = -0.1; // Always looking slightly down
      
      if (lookPhase === 0) {
        // Look bottom left
        targetX = -0.15;
        targetY = -0.15;
      } else if (lookPhase === 1) {
        // Look bottom right
        targetX = 0.15;
        targetY = -0.15;
      } else {
        // Look center-bottom
        targetX = 0;
        targetY = -0.1;
      }
      
      // Smooth transition
      pupilGroupRef.current.position.x += (targetX - pupilGroupRef.current.position.x) * 0.05;
      pupilGroupRef.current.position.y += (targetY - pupilGroupRef.current.position.y) * 0.05;
    }

    // Blinking animation - blink every 4-5 seconds
    const blinkCycle = 5; // seconds between blinks
    const blinkPhase = (time % blinkCycle) / blinkCycle;
    
    let blinkAmount = 0;
    if (blinkPhase > 0.9 && blinkPhase < 0.95) {
      // Quick blink
      blinkAmount = Math.sin((blinkPhase - 0.9) / 0.05 * Math.PI);
    }

    if (eyeTopLidRef.current && eyeBottomLidRef.current) {
      // Close the eye by moving lids together
      eyeTopLidRef.current.position.y = 0.5 - blinkAmount * 0.5;
      eyeBottomLidRef.current.position.y = -0.5 + blinkAmount * 0.5;
      eyeTopLidRef.current.scale.y = 1 + blinkAmount;
      eyeBottomLidRef.current.scale.y = 1 + blinkAmount;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Pyramid Base */}
      <mesh position={[0, -1.5, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[2.5, 3, 3]} />
        <meshStandardMaterial 
          color="#ffffff" 
          wireframe={false}
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Pyramid Edges (thicker wireframe) */}
      <mesh position={[0, -1.5, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[2.52, 3.02, 3]} />
        <meshBasicMaterial color="#ffffff" wireframe={true} wireframeLinewidth={2} />
      </mesh>

      {/* Eye Background (white) */}
      <mesh position={[0, 0.5, 0]} scale={[1.8, 1, 1]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Top Eyelid */}
      <mesh ref={eyeTopLidRef} position={[0, 0.5, 0]} scale={[1.8, 1, 1]}>
        <sphereGeometry args={[0.81, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#ffffff" 
          side={THREE.DoubleSide}
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Bottom Eyelid */}
      <mesh ref={eyeBottomLidRef} position={[0, 0.5, 0]} rotation={[Math.PI, 0, 0]} scale={[1.8, 1, 1]}>
        <sphereGeometry args={[0.81, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#ffffff" 
          side={THREE.DoubleSide}
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Pupil Group (iris + pupil + highlights) */}
      <group ref={pupilGroupRef} position={[0, 0.5, 0.7]}>
        {/* Iris */}
        <mesh>
          <circleGeometry args={[0.35, 32]} />
          <meshStandardMaterial 
            color="#333333"
            emissive="#000000"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Pupil */}
        <mesh position={[0, 0, 0.01]}>
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Eye shine/reflection */}
        <mesh position={[0.12, 0.12, 0.02]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.08, 0.08, 0.02]}>
          <circleGeometry args={[0.04, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Radiating light rays (subtle) */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const distance = 3;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance + 0.5;

        return (
          <group key={i} position={[x, y, 0]} rotation={[0, 0, angle]}>
            <mesh>
              <coneGeometry args={[0.08, 0.5, 3]} />
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.3}
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






















