'use client';

import { useState } from 'react';
import { GameMode, GameState } from '@/lib/types/game.types';
import { useGameStore } from '@/lib/store/gameStore';

export default function MainMenu() {
  const { setGameState, setGameMode, resetGame } = useGameStore();
  const [selectedMode, setSelectedMode] = useState<GameMode>(GameMode.CLASSIC);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    resetGame();
    setGameState(GameState.PLAYING);
  };

  const gameModes = [
    {
      mode: GameMode.CLASSIC,
      title: 'Classic',
      description: 'Standard chess with RPG mechanics. No time limit.',
      icon: '♛',
      difficulty: 'Normal'
    },
    {
      mode: GameMode.BLITZ,
      title: 'Blitz',
      description: 'Fast-paced chess with 5-minute timer per player.',
      icon: '⚡',
      difficulty: 'Fast'
    },
    {
      mode: GameMode.CAMPAIGN,
      title: 'Campaign',
      description: 'Pre-set scenarios with special objectives.',
      icon: '🏰',
      difficulty: 'Varied'
    },
    {
      mode: GameMode.PRACTICE,
      title: 'Practice',
      description: 'Practice against AI with move hints and undo.',
      icon: '🎓',
      difficulty: 'Learning'
    }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className={`border border-white/20 ${
                (Math.floor(i / 8) + (i % 8)) % 2 === 0 ? 'bg-white/5' : 'bg-black/5'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Menu Content */}
      <div className="relative z-10 max-w-4xl mx-auto p-8">
        {!showSettings && !showAbout && (
          <>
            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Crown and Capture
              </h1>
              <p className="text-xl text-gray-300 mb-2">
                Medieval Strategy Meets Magical Combat
              </p>
              <p className="text-sm text-gray-400">
                Combine traditional chess strategy with RPG mechanics
              </p>
            </div>

            {/* Game Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {gameModes.map((mode) => (
                <div
                  key={mode.mode}
                  className={`
                    relative overflow-hidden rounded-lg p-6 cursor-pointer transition-all duration-300 transform hover:scale-105
                    ${selectedMode === mode.mode 
                      ? 'bg-gradient-to-br from-yellow-600/30 to-yellow-800/30 border-2 border-yellow-400 shadow-lg shadow-yellow-400/25' 
                      : 'bg-black/30 border border-gray-600 hover:bg-black/40'
                    }
                  `}
                  onClick={() => setSelectedMode(mode.mode)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{mode.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {mode.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3">
                        {mode.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                          {mode.difficulty}
                        </span>
                        {selectedMode === mode.mode && (
                          <span className="text-yellow-400 text-sm">Selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  {selectedMode === mode.mode && (
                    <div className="absolute top-2 right-2">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                onClick={() => startGame(selectedMode)}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                🚀 Start Game
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  ⚙️ Settings
                </button>
                
                <button
                  onClick={() => setShowAbout(true)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  ℹ️ About
                </button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-black/20 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">🎮 Quick Start Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <span className="text-yellow-400">🖱️ Click</span> pieces to select them
                </div>
                <div>
                  <span className="text-green-400">⚡ Right-click</span> to use special abilities
                </div>
                <div>
                  <span className="text-blue-400">💙 Blue bars</span> show mana levels
                </div>
                <div>
                  <span className="text-red-400">❤️ Red bars</span> show health points
                </div>
              </div>
            </div>
          </>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-black/40 rounded-lg p-8 border border-gray-600">
            <h2 className="text-2xl font-bold text-white mb-6">⚙️ Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Graphics Quality
                </label>
                <select className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600">
                  <option>High (Recommended)</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Sound Effects
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="75"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Background Music
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showHints"
                  className="mr-3"
                  defaultChecked
                />
                <label htmlFor="showHints" className="text-white">
                  Show move hints
                </label>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                ← Back
              </button>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* About Panel */}
        {showAbout && (
          <div className="bg-black/40 rounded-lg p-8 border border-gray-600">
            <h2 className="text-2xl font-bold text-white mb-6">ℹ️ About Crown and Capture</h2>
            
            <div className="text-gray-300 space-y-4">
              <p>
                Crown and Capture combines the strategic depth of traditional chess with exciting RPG mechanics.
                Each piece has health points, mana, and special abilities that create entirely new tactical possibilities.
              </p>
              
              <h3 className="text-lg font-semibold text-white">Key Features:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Traditional chess rules with RPG combat system</li>
                <li>Unique abilities for each piece type</li>
                <li>Health and mana management</li>
                <li>Beautiful 3D graphics and particle effects</li>
                <li>Multiple game modes for different play styles</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-white">Version:</h3>
              <p>Crown and Capture v1.0 - Built with Next.js, Three.js, and TypeScript</p>
            </div>
            
            <button
              onClick={() => setShowAbout(false)}
              className="mt-8 px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
