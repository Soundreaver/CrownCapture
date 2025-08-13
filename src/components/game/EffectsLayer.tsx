'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Position } from '@/lib/types/game.types';

interface ParticleSystem {
  id: string;
  position: Vector3;
  particles: Particle[];
  duration: number;
  elapsed: number;
  type: 'lightning' | 'heal' | 'damage' | 'death' | 'teleport' | 'charge' | 'shield';
}

interface Particle {
  position: Vector3;
  velocity: Vector3;
  life: number;
  maxLife: number;
  color: { r: number; g: number; b: number };
  size: number;
}

interface EffectsLayerProps {
  activeEffects: {
    type: string;
    position: Position;
    target?: Position;
    duration?: number;
  }[];
}

export default function EffectsLayer({ activeEffects }: EffectsLayerProps) {
  const [particleSystems, setParticleSystems] = useState<ParticleSystem[]>([]);

  // Create particle system for new effects
  useEffect(() => {
    activeEffects.forEach(effect => {
      const worldPos = new Vector3(effect.position.x - 3.5, 1, effect.position.y - 3.5);
      const newSystem = createParticleSystem(effect.type, worldPos);
      
      setParticleSystems(prev => [...prev, newSystem]);
    });
  }, [activeEffects]);

  const createParticleSystem = (type: string, position: Vector3): ParticleSystem => {
    const particles: Particle[] = [];
    let particleCount = 50;
    let duration = 2000;

    switch (type) {
      case 'lightning':
        particleCount = 100;
        duration = 1500;
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            position: position.clone().add(new Vector3(
              (Math.random() - 0.5) * 0.5,
              Math.random() * 2,
              (Math.random() - 0.5) * 0.5
            )),
            velocity: new Vector3(
              (Math.random() - 0.5) * 0.02,
              Math.random() * 0.01,
              (Math.random() - 0.5) * 0.02
            ),
            life: 1,
            maxLife: 1,
            color: { r: 0.5 + Math.random() * 0.5, g: 0.5 + Math.random() * 0.5, b: 1 },
            size: 2 + Math.random() * 3
          });
        }
        break;

      case 'heal':
        particleCount = 60;
        duration = 2500;
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            position: position.clone().add(new Vector3(
              (Math.random() - 0.5) * 1,
              Math.random() * 0.5,
              (Math.random() - 0.5) * 1
            )),
            velocity: new Vector3(
              (Math.random() - 0.5) * 0.01,
              0.02 + Math.random() * 0.02,
              (Math.random() - 0.5) * 0.01
            ),
            life: 1,
            maxLife: 1,
            color: { r: 0.2, g: 0.8 + Math.random() * 0.2, b: 0.2 },
            size: 1 + Math.random() * 2
          });
        }
        break;

      case 'damage':
        particleCount = 40;
        duration = 1200;
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            position: position.clone().add(new Vector3(
              (Math.random() - 0.5) * 0.8,
              Math.random() * 1.5,
              (Math.random() - 0.5) * 0.8
            )),
            velocity: new Vector3(
              (Math.random() - 0.5) * 0.03,
              Math.random() * 0.02,
              (Math.random() - 0.5) * 0.03
            ),
            life: 1,
            maxLife: 1,
            color: { r: 1, g: 0.2 + Math.random() * 0.3, b: 0.1 },
            size: 1.5 + Math.random() * 2.5
          });
        }
        break;

      case 'death':
        particleCount = 80;
        duration = 3000;
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            position: position.clone().add(new Vector3(
              (Math.random() - 0.5) * 0.3,
              Math.random() * 0.8,
              (Math.random() - 0.5) * 0.3
            )),
            velocity: new Vector3(
              (Math.random() - 0.5) * 0.04,
              Math.random() * 0.03,
              (Math.random() - 0.5) * 0.04
            ),
            life: 1,
            maxLife: 1,
            color: { r: 0.4, g: 0.4, b: 0.4 },
            size: 0.5 + Math.random() * 1.5
          });
        }
        break;

      case 'teleport':
        particleCount = 70;
        duration = 2000;
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            position: position.clone().add(new Vector3(
              (Math.random() - 0.5) * 1.2,
              Math.random() * 2,
              (Math.random() - 0.5) * 1.2
            )),
            velocity: new Vector3(
              (Math.random() - 0.5) * 0.02,
              Math.random() * 0.015,
              (Math.random() - 0.5) * 0.02
            ),
            life: 1,
            maxLife: 1,
            color: { r: 0.7, g: 0.2, b: 0.9 },
            size: 1 + Math.random() * 2
          });
        }
        break;

      case 'shield':
        particleCount = 30;
        duration = 3000;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2;
          const radius = 0.8 + Math.random() * 0.4;
          particles.push({
            position: position.clone().add(new Vector3(
              Math.cos(angle) * radius,
              Math.random() * 1.5 + 0.5,
              Math.sin(angle) * radius
            )),
            velocity: new Vector3(
              Math.cos(angle) * 0.005,
              Math.random() * 0.01 - 0.005,
              Math.sin(angle) * 0.005
            ),
            life: 1,
            maxLife: 1,
            color: { r: 0.2, g: 0.6, b: 1 },
            size: 1.5 + Math.random()
          });
        }
        break;

      default:
        // Default sparkle effect
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            position: position.clone().add(new Vector3(
              (Math.random() - 0.5) * 0.5,
              Math.random() * 1,
              (Math.random() - 0.5) * 0.5
            )),
            velocity: new Vector3(
              (Math.random() - 0.5) * 0.02,
              Math.random() * 0.02,
              (Math.random() - 0.5) * 0.02
            ),
            life: 1,
            maxLife: 1,
            color: { r: 1, g: 1, b: 1 },
            size: 1 + Math.random()
          });
        }
    }

    return {
      id: Math.random().toString(36),
      position,
      particles,
      duration,
      elapsed: 0,
      type: type as any
    };
  };

  useFrame((state, delta) => {
    setParticleSystems(prevSystems => {
      return prevSystems.map(system => {
        const newElapsed = system.elapsed + delta * 1000;
        
        // Update particles
        const updatedParticles = system.particles.map(particle => {
          const newLife = particle.life - (delta / (particle.maxLife * 2));
          
          return {
            ...particle,
            position: particle.position.clone().add(particle.velocity),
            life: Math.max(0, newLife),
            velocity: particle.velocity.clone().multiplyScalar(0.98) // Friction
          };
        }).filter(particle => particle.life > 0);

        return {
          ...system,
          elapsed: newElapsed,
          particles: updatedParticles
        };
      }).filter(system => system.elapsed < system.duration && system.particles.length > 0);
    });
  });

  return (
    <group>
      {particleSystems.map((system) => (
        <group key={system.id}>
          {system.particles.map((particle, i) => (
            <mesh
              key={i}
              position={[particle.position.x, particle.position.y, particle.position.z]}
              scale={[particle.size * particle.life, particle.size * particle.life, particle.size * particle.life]}
            >
              <sphereGeometry args={[0.05, 4, 4]} />
              <meshStandardMaterial
                color={[particle.color.r, particle.color.g, particle.color.b]}
                transparent
                opacity={particle.life * 0.8}
                emissive={[particle.color.r * 0.5, particle.color.g * 0.5, particle.color.b * 0.5]}
                roughness={0.8}
                metalness={0.2}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
