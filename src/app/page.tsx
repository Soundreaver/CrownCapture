'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import ChessBoard from '@/components/game/ChessBoard';
import GameUI from '@/components/game/GameUI';
import MainMenu from '@/components/game/MainMenu';
import EffectsLayer from '@/components/game/EffectsLayer';
import { useGameStore } from '@/lib/store/gameStore';
import { GameState } from '@/lib/types/game.types';

export default function ChessRPGGame() {
  const { gameState, activeEffects, winner, setGameState, resetGame } = useGameStore();

  // Show main menu when game state is MENU
  if (gameState === GameState.MENU) {
    return <MainMenu />;
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 to-slate-700 overflow-hidden">
      {/* 3D Chess Board */}
      <div className="relative h-full w-full">
        <Canvas
          camera={{ 
            position: [0, 8, 8], 
            fov: 60,
            near: 0.1,
            far: 1000
          }}
          shadows
          className="w-full h-full"
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1} 
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            <pointLight position={[0, 5, 0]} intensity={0.5} />
            
            {/* Environment for reflections */}
            <Environment preset="city" />
            
            {/* Chess Board */}
            <ChessBoard />
            
            {/* Visual Effects */}
            <EffectsLayer activeEffects={activeEffects} />
            
            {/* Camera Controls */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={20}
              maxPolarAngle={Math.PI / 2.2}
              minPolarAngle={Math.PI / 6}
            />
          </Suspense>
        </Canvas>
        
        {/* Game UI Overlay */}
        <GameUI />
        
        {/* Game Over Overlay */}
        {gameState === GameState.GAME_OVER && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-black/90 rounded-lg p-8 text-center border border-gray-600 backdrop-blur-sm">
              <h2 className="text-4xl font-bold text-white mb-4">Game Over</h2>
              <p className="text-xl text-gray-300 mb-6">
                {winner ? 
                  `${winner === 'white' ? 'White' : 'Black'} Wins!` : 
                  'Draw!'
                }
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => resetGame()}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors transform hover:scale-105"
                >
                  🔄 Play Again
                </button>
                <button
                  onClick={() => setGameState(GameState.MENU)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors transform hover:scale-105"
                >
                  🏠 Main Menu
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Pause Overlay */}
        {gameState === GameState.PAUSED && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-black/90 rounded-lg p-8 text-center border border-gray-600 backdrop-blur-sm">
              <h2 className="text-4xl font-bold text-white mb-4">Game Paused</h2>
              <p className="text-gray-300 mb-6">The game is currently paused</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setGameState(GameState.PLAYING)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors transform hover:scale-105"
                >
                  ▶️ Resume
                </button>
                <button
                  onClick={() => setGameState(GameState.MENU)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors transform hover:scale-105"
                >
                  🏠 Main Menu
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Ability Targeting Overlay */}
        {gameState === GameState.ABILITY_TARGETING && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
            <div className="bg-blue-900/90 rounded-lg p-4 text-center border border-blue-400 backdrop-blur-sm">
              <p className="text-white font-semibold">
                🎯 Select a target for your ability
              </p>
              <p className="text-blue-200 text-sm mt-1">
                Click on a highlighted square or press ESC to cancel
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
