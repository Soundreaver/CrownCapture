'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh, BufferGeometry, Material } from 'three';
import { useGameStore } from '@/lib/store/gameStore';
import { Position, positionsEqual, GameState } from '@/lib/types/game.types';
import ChessPiece from './ChessPiece';

interface SquareProps {
  position: Position;
  isLight: boolean;
  isHighlighted: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  onClick: () => void;
}

function Square({ position, isLight, isHighlighted, isSelected, isValidMove, onClick }: SquareProps) {
  const meshRef = useRef<Mesh<BufferGeometry, Material | Material[]>>(null);
  
  // Get colors based on square state
  const getSquareColor = () => {
    if (isSelected) return '#60a5fa'; // Blue for selected
    if (isValidMove) return '#10b981'; // Green for valid moves
    if (isHighlighted) return '#f59e0b'; // Yellow for highlighted
    return isLight ? '#f5deb3' : '#8b4513'; // Normal chess colors (wheat/brown)
  };
  
  return (
    <mesh
      ref={meshRef}
      position={[position.x - 3.5, 0, position.y - 3.5]}
      onClick={onClick}
      receiveShadow
    >
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial 
        color={getSquareColor()}
        metalness={0.1}
        roughness={0.7}
      />
      
      {/* Rim lighting for highlighted squares */}
      {(isHighlighted || isSelected || isValidMove) && (
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[1.02, 0.02, 1.02]} />
          <meshStandardMaterial 
            color={getSquareColor()}
            emissive={getSquareColor()}
            emissiveIntensity={0.3}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}
    </mesh>
  );
}

export default function ChessBoard() {
  const { 
    board, 
    selectedPiece, 
    validMoves, 
    highlightedSquares,
    gameState,
    selectPiece, 
    movePiece,
    activateAbility,
    setGameState
  } = useGameStore();
  
  const boardRef = useRef<Mesh>(null);
  
  const handleSquareClick = (position: Position) => {
    // Handle ability targeting mode
    if (gameState === GameState.ABILITY_TARGETING) {
      const isValidTarget = highlightedSquares.some(square => positionsEqual(square, position));
      
      if (isValidTarget && selectedPiece) {
        // Find the selected piece to get its ID and current ability being used
        const caster = board[selectedPiece.y][selectedPiece.x];
        if (caster) {
          // For now, we'll use the first available ability (this could be improved with ability selection)
          const availableAbility = caster.abilities.find(ability => 
            caster.stats.currentMana >= ability.manaCost && 
            (!ability.currentCooldown || ability.currentCooldown <= 0)
          );
          
          if (availableAbility) {
            activateAbility(caster.id, availableAbility.id, position);
          }
        }
      } else {
        // Cancel ability targeting
        setGameState(GameState.PLAYING);
      }
      return;
    }
    
    // Normal game mode handling
    if (selectedPiece) {
      // Check if this is a valid move
      const isValidMove = validMoves.some(move => positionsEqual(move, position));
      
      if (isValidMove) {
        // Make the move
        movePiece(selectedPiece, position);
      } else {
        // Select new piece or deselect
        selectPiece(position);
      }
    } else {
      // Select piece
      selectPiece(position);
    }
  };
  
  // Create squares
  const squares = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const position = { x, y };
      const isLight = (x + y) % 2 === 0;
      const isSelected = selectedPiece ? positionsEqual(selectedPiece, position) : false;
      const isValidMove = validMoves.some(move => positionsEqual(move, position));
      const isHighlighted = highlightedSquares.some(square => positionsEqual(square, position));
      
      squares.push(
        <Square
          key={`${x}-${y}`}
          position={position}
          isLight={isLight}
          isSelected={isSelected}
          isValidMove={isValidMove}
          isHighlighted={isHighlighted}
          onClick={() => handleSquareClick(position)}
        />
      );
    }
  }
  
  // Create pieces
  const pieces = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece && piece.isAlive) {
        pieces.push(
          <ChessPiece
            key={piece.id}
            piece={piece}
            isSelected={selectedPiece ? positionsEqual(selectedPiece, piece.position) : false}
          />
        );
      }
    }
  }
  
  return (
    <group ref={boardRef} position={[0, 0, 0]}>
      {/* Board Base */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[9, 0.2, 9]} />
        <meshStandardMaterial 
          color="#4a4a4a"
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Board Border */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[8.2, 0.05, 8.2]} />
        <meshStandardMaterial 
          color="#2a2a2a"
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      
      {/* Squares */}
      {squares}
      
      {/* Pieces */}
      {pieces}
      
      {/* Board Coordinates (optional labels) */}
      {/* These could be added later for better UX */}
    </group>
  );
}
