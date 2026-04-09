"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Torus, Wireframe } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";

function Orb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.x += delta * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.1;
      const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.1;
      ringRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#E91E8C" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#6A0DAD" />
      
      {/* Target core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          color="#1A1A2E" 
          emissive="#E91E8C" 
          emissiveIntensity={0.2} 
          roughness={0.2} 
          metalness={0.8}
        />
        <Wireframe stroke={"#E91E8C"} thickness={0.02} blendFunction={THREE.AdditiveBlending} />
      </mesh>

      {/* Orbiting ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.8, 0.05, 16, 100]} />
        <meshBasicMaterial color="#6A0DAD" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function ChainNode({ title, position, delay }: { title: string, position: { top?: string, bottom?: string, left?: string, right?: string }, delay: string }) {
  return (
    <div 
      className="absolute glassmorphism px-4 py-2 font-mono text-sm tracking-widest text-[#E91E8C] animate-slow-bob z-20"
      style={{ ...position, animationDelay: delay }}
    >
      {title}
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen bg-dot-grid flex flex-col items-center justify-center pt-24 overflow-hidden">
      {/* Backlight Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6A0DAD]/20 blur-[120px] rounded-full pointer-events-none" />

      {/* 3D Orb Area */}
      <div className="relative w-[320px] h-[320px] mb-12">
        <div className="absolute inset-0 z-10">
          <Canvas camera={{ position: [0, 0, 6] }}>
            <Orb />
          </Canvas>
        </div>
        
        {/* Orbiting Nodes (HTML overlay) */}
        <ChainNode title="BASE" position={{ top: '20%', left: '-20%' }} delay="0s" />
        <ChainNode title="CELO" position={{ top: '60%', right: '-30%' }} delay="1.5s" />
        <ChainNode title="ETHEREUM" position={{ top: '-10%', right: '-10%' }} delay="0.8s" />
        <ChainNode title="STELLAR" position={{ bottom: '-10%', left: '-10%' }} delay="2.2s" />
      </div>

      {/* Text Area */}
      <div className="z-20 text-center flex flex-col items-center px-4">
        <div className="font-mono text-white/50 text-xs mb-8 tracking-[0.2em] uppercase">
          CROSS-CHAIN AI AGENT — v1.0
        </div>
        
        <h1 className="font-syne text-[5rem] md:text-[7rem] font-bold leading-[0.9] text-white tracking-tighter mb-8 uppercase">
          <div>One message.</div>
          <div className="text-white/40">Every chain.</div>
        </h1>

        <p className="font-mono text-white/60 max-w-[480px] text-center text-sm md:text-base leading-relaxed mb-12">
          Type what you want. Automata finds the route, estimates fees, and moves your assets — across Base, Celo, Ethereum, and Stellar.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button size="lg" className="sm:w-[200px]">
            Start Chatting
          </Button>
          <Button size="lg" variant="outline" className="sm:w-[200px]">
            Build a Flow
          </Button>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 animate-bounce">
        ↓
      </div>
    </section>
  );
}
