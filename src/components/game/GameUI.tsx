"use client";

import { useGameStore } from "@/lib/store/gameStore";
import { Team, GameState, Piece } from "@/lib/types/game.types";
import { AbilitySystem } from "@/lib/game/AbilitySystem";

export default function GameUI() {
  const {
    currentTurn,
    gameState,
    winner,
    turnCount,
    moveHistory,
    resetGame,
    board,
    selectedPiece,
    useAbility,
  } = useGameStore();

  // Get the currently selected piece for displaying its stats
  const getSelectedPieceData = (): Piece | null => {
    if (!selectedPiece) return null;
    return board[selectedPiece.y][selectedPiece.x];
  };

  const selectedPieceData = getSelectedPieceData();

  if (gameState === GameState.MENU) {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            Crown and Capture
          </h1>
          <p className="text-gray-600 mb-6">
            A 3D chess game with RPG mechanics
          </p>
          <button
            onClick={() =>
              useGameStore.getState().setGameState(GameState.PLAYING)
            }
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top HUD */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black bg-opacity-70 text-white px-6 py-3 rounded-lg backdrop-blur-sm">
          <div className="text-center">
            <h2 className="text-lg font-bold">Crown and Capture</h2>
            <p className="text-sm">
              Turn {turnCount} -{" "}
              {currentTurn === Team.WHITE ? "White's" : "Black's"} Turn
            </p>
          </div>
        </div>
      </div>

      {/* Game Over Overlay */}
      {gameState === GameState.GAME_OVER && winner && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Game Over!
            </h2>
            <p className="text-xl mb-6 text-gray-600">
              {winner === Team.WHITE ? "White" : "Black"} Wins!
            </p>
            <div className="space-x-4">
              <button
                onClick={resetGame}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side Panels */}
      <div className="absolute top-4 left-4 z-10 w-80 space-y-4">
        {/* Turn Indicator */}
        <div className="bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-sm">
          <h3 className="font-bold mb-2">Current Turn</h3>
          <div className="flex items-center space-x-3">
            <div
              className={`w-8 h-8 rounded-full ${
                currentTurn === Team.WHITE
                  ? "bg-white border-2 border-gray-300"
                  : "bg-gray-800 border-2 border-gray-600"
              }`}
            ></div>
            <div>
              <p className="text-sm font-semibold">
                {currentTurn === Team.WHITE ? "White" : "Black"}
              </p>
              <p className="text-xs text-gray-300">Turn {turnCount}</p>
            </div>
          </div>
        </div>

        {/* Selected Piece Stats */}
        {selectedPieceData && (
          <div className="bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-sm">
            <h3 className="font-bold mb-3 flex items-center">
              <span className="mr-2">📊</span>
              {selectedPieceData.type.charAt(0).toUpperCase() +
                selectedPieceData.type.slice(1)}{" "}
              Stats
            </h3>

            {/* HP Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>HP</span>
                <span>
                  {selectedPieceData.stats.currentHp}/
                  {selectedPieceData.stats.maxHp}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (selectedPieceData.stats.currentHp /
                        selectedPieceData.stats.maxHp) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Mana Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Mana</span>
                <span>
                  {selectedPieceData.stats.currentMana}/
                  {selectedPieceData.stats.maxMana}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (selectedPieceData.stats.currentMana /
                        selectedPieceData.stats.maxMana) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-300">ATK:</span>{" "}
                {selectedPieceData.stats.attackPower}
              </div>
              <div>
                <span className="text-gray-300">DEF:</span>{" "}
                {selectedPieceData.stats.defense}
              </div>
              <div>
                <span className="text-gray-300">SPD:</span>{" "}
                {selectedPieceData.stats.speed}
              </div>
              <div>
                <span className="text-gray-300">MAG:</span>{" "}
                {selectedPieceData.stats.magicPower}
              </div>
              <div>
                <span className="text-gray-300">CRIT:</span>{" "}
                {selectedPieceData.stats.criticalChance}%
              </div>
              <div>
                <span className="text-gray-300">Level:</span>{" "}
                {selectedPieceData.level}
              </div>
            </div>

            {/* Status Effects */}
            {selectedPieceData.statusEffects.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-semibold mb-1">Status Effects:</h4>
                <div className="space-y-1">
                  {selectedPieceData.statusEffects.map((effect, index) => (
                    <div
                      key={index}
                      className="text-xs bg-gray-700 rounded px-2 py-1"
                    >
                      <span className="font-semibold">{effect.name}</span>
                      <span className="ml-2 text-gray-300">
                        ({effect.duration} turns)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Abilities Panel */}
        {selectedPieceData && selectedPieceData.team === currentTurn && (
          <div className="bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-sm">
            <h3 className="font-bold mb-3 flex items-center">
              <span className="mr-2">⚡</span>
              Abilities
            </h3>

            {selectedPieceData.abilities.length > 0 ? (
              <div className="space-y-2">
                {selectedPieceData.abilities.map((ability) => {
                  const canUse = AbilitySystem.canUseAbility(
                    selectedPieceData,
                    ability
                  );

                  return (
                    <button
                      key={ability.id}
                      onClick={() => {
                        if (canUse.canUse && gameState === GameState.PLAYING) {
                          useAbility(selectedPieceData.id, ability.id);
                        }
                      }}
                      disabled={
                        !canUse.canUse || gameState !== GameState.PLAYING
                      }
                      className={`w-full text-left p-2 rounded text-xs transition-all ${
                        canUse.canUse && gameState === GameState.PLAYING
                          ? "bg-blue-600 hover:bg-blue-500 cursor-pointer"
                          : "bg-gray-600 cursor-not-allowed opacity-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{ability.name}</p>
                          <p className="text-gray-300 text-xs">
                            {ability.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-300">{ability.manaCost} MP</p>
                          {ability.currentCooldown &&
                            ability.currentCooldown > 0 && (
                              <p className="text-red-300 text-xs">
                                {ability.currentCooldown} turns
                              </p>
                            )}
                        </div>
                      </div>
                      {!canUse.canUse && canUse.reason && (
                        <p className="text-red-300 text-xs mt-1">
                          {canUse.reason}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No abilities available</p>
            )}
          </div>
        )}

        {/* Game Controls */}
        <div className="bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-sm">
          <h3 className="font-bold mb-2">Controls</h3>
          <div className="space-y-2 text-sm">
            <p>🖱️ Click to select pieces</p>
            <p>🎯 Click highlighted squares to move</p>
            <p>🔄 Drag to rotate camera</p>
            <p>⚡ Click abilities to use them</p>
            {gameState === GameState.ABILITY_TARGETING && (
              <p className="text-yellow-300">
                🎯 Select a target for your ability
              </p>
            )}
          </div>
          <button
            onClick={resetGame}
            className="w-full mt-3 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
          >
            Reset Game
          </button>
        </div>
      </div>

      {/* Move History */}
      <div className="absolute top-4 right-4 z-10 w-64">
        <div className="bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-sm max-h-96 overflow-y-auto">
          <h3 className="font-bold mb-2">Move History</h3>
          <div className="space-y-1 text-sm">
            {moveHistory.length === 0 ? (
              <p className="text-gray-400">No moves yet</p>
            ) : (
              moveHistory.slice(-10).map((move, index) => (
                <div key={index} className="border-b border-gray-600 pb-1">
                  <p>
                    {move.piece.type} {String.fromCharCode(97 + move.from.x)}
                    {8 - move.from.y} → {String.fromCharCode(97 + move.to.x)}
                    {8 - move.to.y}
                  </p>
                  {move.damage && (
                    <p className="text-red-300 text-xs">
                      Damage: {move.damage}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black bg-opacity-70 text-white px-6 py-2 rounded-lg backdrop-blur-sm">
          <div className="flex items-center space-x-6 text-sm">
            <span>Moves: {moveHistory.length}</span>
            <span>Turn: {turnCount}</span>
            <span className="text-gray-300">
              {gameState === GameState.PLAYING ? "Playing" : gameState}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
