"use client";

import { useState, useEffect } from "react";
import { GameMode, GameState } from "@/lib/types/game.types";
import { useGameStore } from "@/lib/store/gameStore";
import { AIDifficulty, ChessAI } from "@/lib/game/ChessAI";
import { playSound } from "@/lib/audio/SoundManager";

export default function MainMenu() {
  const { setGameState, setGameMode, resetGame, startAIGame, init } = useGameStore();
  const [selectedMode, setSelectedMode] = useState<GameMode>(GameMode.CLASSIC);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    // Initialize audio system when component mounts
    init();
  }, [init]);

  const startGame = (mode: GameMode) => {
    playSound('move');
    setGameMode(mode);
    resetGame();
    setGameState(GameState.PLAYING);
  };

  const startAIGameWithDifficulty = (difficulty: AIDifficulty) => {
    playSound('move');
    setGameMode(GameMode.PRACTICE);
    startAIGame(difficulty);
    setGameState(GameState.PLAYING);
  };

  const gameModes = [
    {
      mode: GameMode.CLASSIC,
      title: "Classic",
      description: "Standard chess with RPG mechanics. No time limit.",
      icon: "♛",
      difficulty: "Normal",
    },
    {
      mode: GameMode.BLITZ,
      title: "Blitz",
      description: "Fast-paced chess with 5-minute timer per player.",
      icon: "⚡",
      difficulty: "Fast",
    },
    {
      mode: GameMode.CAMPAIGN,
      title: "Campaign",
      description: "Pre-set scenarios with special objectives.",
      icon: "🏰",
      difficulty: "Varied",
    },
    {
      mode: GameMode.PRACTICE,
      title: "Practice",
      description: "Practice against AI with move hints and undo.",
      icon: "🎓",
      difficulty: "Learning",
    },
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 flex items-center justify-center z-50">
      {/* Chess Board Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className={`border border-amber-300/30 ${
                (Math.floor(i / 8) + (i % 8)) % 2 === 0
                  ? "bg-amber-800/20"
                  : "bg-amber-200/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Floating Chess Pieces */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 left-16 text-6xl text-amber-800/20 animate-pulse">♔</div>
        <div className="absolute top-20 right-20 text-5xl text-amber-700/20 animate-bounce">♛</div>
        <div className="absolute bottom-20 left-20 text-4xl text-amber-800/20 animate-pulse">♞</div>
        <div className="absolute bottom-16 right-16 text-5xl text-amber-700/20 animate-bounce">♜</div>
        <div className="absolute top-1/3 left-1/4 text-3xl text-amber-600/20 animate-pulse">♝</div>
        <div className="absolute top-2/3 right-1/3 text-4xl text-amber-800/20 animate-bounce">♟</div>
      </div>

      {/* Main Menu Content */}
      <div className="relative z-10 max-w-4xl mx-auto p-8">
        {!showSettings && !showAbout && !showAI && (
          <>
            {/* Title */}
            <div className="text-center mb-12">
              <div className="flex justify-center items-center mb-4">
                <span className="text-4xl mr-3 text-amber-800">♔</span>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-800 via-amber-900 to-amber-800 bg-clip-text text-transparent">
                  Crown and Capture
                </h1>
                <span className="text-4xl ml-3 text-amber-800">♛</span>
              </div>
              <div className="flex justify-center space-x-2 text-2xl text-amber-700 mb-4">
                <span>♜</span>
                <span>♞</span>
                <span>♝</span>
                <span>♚</span>
                <span>♝</span>
                <span>♞</span>
                <span>♜</span>
              </div>
              <p className="text-xl text-amber-800 mb-2 font-semibold">
                Medieval Strategy Meets Magical Combat
              </p>
              <p className="text-sm text-amber-700">
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
                    ${
                      selectedMode === mode.mode
                        ? "bg-gradient-to-br from-amber-700/40 to-amber-900/40 border-2 border-amber-600 shadow-lg shadow-amber-600/25"
                        : "bg-amber-100/20 border border-amber-600/40 hover:bg-amber-200/30"
                    }
                  `}
                  onClick={() => setSelectedMode(mode.mode)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{mode.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-amber-900 mb-2">
                        {mode.title}
                      </h3>
                      <p className="text-amber-800 text-sm mb-3">
                        {mode.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 bg-amber-800 text-amber-100 rounded">
                          {mode.difficulty}
                        </span>
                        {selectedMode === mode.mode && (
                          <span className="text-amber-700 text-sm font-semibold">
                            ✓ Selected
                          </span>
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
                onMouseEnter={() => playSound('hover')}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                ⚔ Play vs Human
              </button>

              <button
                onClick={() => setShowAI(true)}
                onMouseEnter={() => playSound('hover')}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                🤖 Play vs AI
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
            <div className="bg-amber-800/30 rounded-lg p-6 border border-amber-600/50 shadow-lg">
              <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center">
                🎮 <span className="ml-2">Quick Start Tips</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-900">
                <div className="flex items-center">
                  <span className="text-amber-700 font-semibold">🖱️ Click</span> 
                  <span className="ml-2">pieces to select them</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-700 font-semibold">⚡ Click</span> 
                  <span className="ml-2">on special abilities to use them</span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-700 font-semibold">💙 Blue bars</span> 
                  <span className="ml-2">show mana levels</span>
                </div>
                <div className="flex items-center">
                  <span className="text-red-700 font-semibold">❤️ Red bars</span> 
                  <span className="ml-2">show health points</span>
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

        {/* AI Selection Panel */}
        {showAI && (
          <div className="bg-black/40 rounded-lg p-8 border border-gray-600">
            <h2 className="text-2xl font-bold text-white mb-6">
              🤖 Choose AI Difficulty
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {Object.values(AIDifficulty)
                .filter((d) => typeof d === "number")
                .map((difficulty) => {
                  const difficultyLevel = difficulty as AIDifficulty;
                  const info = {
                    [AIDifficulty.EASY]: {
                      name: "Easy",
                      icon: "🟢",
                      desc: "Perfect for beginners. Makes some random moves.",
                    },
                    [AIDifficulty.MEDIUM]: {
                      name: "Medium",
                      icon: "🟡",
                      desc: "Balanced opponent. Good for practice.",
                    },
                    [AIDifficulty.HARD]: {
                      name: "Hard",
                      icon: "🔴",
                      desc: "Strong tactical play. A real challenge.",
                    },
                    [AIDifficulty.EXPERT]: {
                      name: "Expert",
                      icon: "🟣",
                      desc: "Maximum difficulty. Think carefully!",
                    },
                  };

                  return (
                    <button
                      key={difficulty}
                      onClick={() => startAIGameWithDifficulty(difficultyLevel)}
                      className="p-6 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-left transition-all duration-200 hover:scale-105"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">
                          {info[difficultyLevel].icon}
                        </span>
                        <span className="text-xl font-semibold text-white">
                          {info[difficultyLevel].name}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        {info[difficultyLevel].desc}
                      </p>
                    </button>
                  );
                })}
            </div>

            <button
              onClick={() => setShowAI(false)}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* About Panel */}
        {showAbout && (
          <div className="bg-black/40 rounded-lg p-8 border border-gray-600">
            <h2 className="text-2xl font-bold text-white mb-6">
              ℹ️ About Crown and Capture
            </h2>

            <div className="text-gray-300 space-y-4">
              <p>
                Crown and Capture combines the strategic depth of traditional
                chess with exciting RPG mechanics. Each piece has health points,
                mana, and special abilities that create entirely new tactical
                possibilities.
              </p>

              <h3 className="text-lg font-semibold text-white">
                Key Features:
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Traditional chess rules with RPG combat system</li>
                <li>Unique abilities for each piece type</li>
                <li>Health and mana management</li>
                <li>Beautiful 3D graphics and particle effects</li>
                <li>Multiple game modes for different play styles</li>
                <li>AI opponents with 4 difficulty levels</li>
              </ul>

              <h3 className="text-lg font-semibold text-white">Version:</h3>
              <p>
                Crown and Capture v1.0 - Built with Next.js, Three.js, and
                TypeScript
              </p>
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
