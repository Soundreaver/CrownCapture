'use client';

import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { Piece, PieceType, Team } from '@/lib/types/game.types';

interface ChessPieceProps {
  piece: Piece;
  isSelected: boolean;
}

export default function ChessPiece({ piece, isSelected }: ChessPieceProps) {
  const meshRef = useRef<Mesh>(null);
  const healthBarRef = useRef<Group>(null);
  const manaBarRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();
  
  // Floating animation for pieces and billboard effect for health/mana bars
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2 + piece.position.x + piece.position.y) * 0.02;
      
      // Gentle rotation for selected piece
      if (isSelected) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
      }
    }
    
    // Billboard effect - make health and mana bars face the camera
    if (healthBarRef.current && manaBarRef.current) {
      healthBarRef.current.lookAt(camera.position);
      manaBarRef.current.lookAt(camera.position);
    }
  });
  
  // Get piece colors
  const getPieceColor = () => {
    if (piece.team === Team.WHITE) {
      return hovered ? '#f0f0f0' : '#ffffff';
    } else {
      return hovered ? '#2a2a2a' : '#1a1a1a';
    }
  };
  
  const getTrimColor = () => {
    return piece.team === Team.WHITE ? '#ffd700' : '#c0c0c0'; // Gold for white, silver for black
  };
  
  // Get piece geometry based on type
  const getPieceGeometry = () => {
    const baseProps = {
      castShadow: true,
      receiveShadow: true,
      onPointerOver: () => setHovered(true),
      onPointerOut: () => setHovered(false)
    };
    
    switch (piece.type) {
      case PieceType.PAWN:
        return (
          <group>
            <mesh {...baseProps}>
              <cylinderGeometry args={[0.15, 0.2, 0.6, 8]} />
              <meshStandardMaterial 
                color={getPieceColor()}
                metalness={0.1}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 0.3, 0]} {...baseProps}>
              <sphereGeometry args={[0.15, 8, 6]} />
              <meshStandardMaterial 
                color={getPieceColor()}
                metalness={0.1}
                roughness={0.3}
              />
            </mesh>
          </group>
        );
        
      case PieceType.KNIGHT:
        return (
          <group>
            <mesh {...baseProps}>
              <cylinderGeometry args={[0.2, 0.25, 0.4, 8]} />
              <meshStandardMaterial 
                color={getPieceColor()}
                metalness={0.1}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 6]} {...baseProps}>
              <boxGeometry args={[0.3, 0.4, 0.2]} />
              <meshStandardMaterial 
                color={getPieceColor()}
                metalness={0.1}
                roughness={0.3}
              />
            </mesh>
          </group>
        );
        
      case PieceType.BISHOP:
        return (
          <group>
            <mesh {...baseProps}>
              <cylinderGeometry args={[0.15, 0.25, 0.6, 8]} />
              <meshStandardMaterial 
                color={getPieceColor()}
                metalness={0.1}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 0.4, 0]} {...baseProps}>
              <coneGeometry args={[0.1, 0.3, 8]} />
              <meshStandardMaterial 
                color={getTrimColor()}
                metalness={0.8}
                roughness={0.1}
              />
            </mesh>
          </group>
        );
        
      case PieceType.ROOK:
        return (
          <group>
            <mesh {...baseProps}>
              <cylinderGeometry args={[0.25, 0.3, 0.6, 8]} />
              <meshStandardMaterial 
                color={getPieceColor()}
                metalness={0.1}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 0.35, 0]} {...baseProps}>
              <cylinderGeometry args={[0.28, 0.28, 0.2, 8]} />
              <meshStandardMaterial 
                color={getPieceColor()}
                metalness={0.1}
                roughness={0.3}
              />
            </mesh>
            {/* Crenellations */}
            {[0, Math.PI/2, Math.PI, 3*Math.PI/2].map((angle, i) => (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.32, 0.5, Math.sin(angle) * 0.32]}
                {...baseProps}
              >
                <boxGeometry args={[0.08, 0.15, 0.08]} />
                <meshStandardMaterial 
                  color={getPieceColor()}
                  metalness={0.1}
                  roughness={0.3}
                />
              </mesh>
            ))}
          </group>
        );
        
      case PieceType.QUEEN:
        return (
          <group>
            <mesh {...baseProps}>
              <cylinderGeometry args={[0.2, 0.3, 0.6, 8]} />
              <meshStandardMaterial 
                color={getPieceColor()}
                metalness={0.1}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 0.4, 0]} {...baseProps}>
              <sphereGeometry args={[0.15, 8, 6]} />
              <meshStandardMaterial 
                color={getPieceColor()}
                metalness={0.1}
                roughness={0.3}
              />
            </mesh>
            {/* Crown spikes */}
            {[0, Math.PI/3, 2*Math.PI/3, Math.PI, 4*Math.PI/3, 5*Math.PI/3].map((angle, i) => (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.18, 0.6, Math.sin(angle) * 0.18]}
                {...baseProps}
              >
                <coneGeometry args={[0.03, 0.2, 4]} />
                <meshStandardMaterial 
                  color={getTrimColor()}
                  metalness={0.8}
                  roughness={0.1}
                />
              </mesh>
            ))}
          </group>
        );
        
      case PieceType.KING:
        return (
          <group>
            <mesh {...baseProps}>
              <cylinderGeometry args={[0.25, 0.35, 0.7, 8]} />
              <meshStandardMaterial 
                color={getPieceColor()}
                metalness={0.1}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 0.5, 0]} {...baseProps}>
              <sphereGeometry args={[0.18, 8, 6]} />
              <meshStandardMaterial 
                color={getPieceColor()}
                metalness={0.1}
                roughness={0.3}
              />
            </mesh>
            {/* Cross on top */}
            <mesh position={[0, 0.75, 0]} {...baseProps}>
              <boxGeometry args={[0.15, 0.03, 0.03]} />
              <meshStandardMaterial 
                color={getTrimColor()}
                metalness={0.8}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[0, 0.8, 0]} {...baseProps}>
              <boxGeometry args={[0.03, 0.1, 0.03]} />
              <meshStandardMaterial 
                color={getTrimColor()}
                metalness={0.8}
                roughness={0.1}
              />
            </mesh>
          </group>
        );
        
      default:
        return (
          <mesh {...baseProps}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color={getPieceColor()} />
          </mesh>
        );
    }
  };
  
  return (
    <group
      ref={meshRef}
      position={[piece.position.x - 3.5, 0.5, piece.position.y - 3.5]}
      scale={isSelected ? [1.1, 1.1, 1.1] : [1, 1, 1]}
    >
      {getPieceGeometry()}
      
      {/* HP/Mana indicators with billboard effect */}
      {/* Health bar group */}
      <group ref={healthBarRef} position={[0, 1, 0]}>
        {/* Health bar background */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.4, 0.05]} />
          <meshBasicMaterial 
            color="#ff0000" 
            transparent 
            opacity={0.8}
          />
        </mesh>
        
        {/* Current health */}
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[0.4 * (piece.stats.currentHp / piece.stats.maxHp), 0.05]} />
          <meshBasicMaterial 
            color="#00ff00" 
            transparent 
            opacity={0.9}
          />
        </mesh>
      </group>
      
      {/* Mana bar group */}
      <group ref={manaBarRef} position={[0, 1.1, 0]}>
        {/* Mana bar background */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.4, 0.03]} />
          <meshBasicMaterial 
            color="#000080" 
            transparent 
            opacity={0.8}
          />
        </mesh>
        
        {/* Current mana */}
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[0.4 * (piece.stats.currentMana / piece.stats.maxMana), 0.03]} />
          <meshBasicMaterial 
            color="#0080ff" 
            transparent 
            opacity={0.9}
          />
        </mesh>
      </group>
    </group>
  );
}
