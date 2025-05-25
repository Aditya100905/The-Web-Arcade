import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Users,
  RotateCcw,
  Trophy,
  Gamepad2,
  Settings,
  Plus,
  Minus,
  Zap,
  Home,
  Crown,
  Star,
  Sparkles,
} from "lucide-react";

const DotsAndBoxes_copy2 = () => {
  const [gridSize, setGridSize] = useState(4);
  const [gameMode, setGameMode] = useState("menu");
  const [turn, setTurn] = useState("R");
  const [selectedLines, setSelectedLines] = useState([]);
  const [score, setScore] = useState({ R: 0, B: 0 });
  const [gameStatus, setGameStatus] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [hoveredLine, setHoveredLine] = useState(null);
  const [completedBoxes, setCompletedBoxes] = useState([]);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [lastMove, setLastMove] = useState(null);

  const totalLines = gridSize * (gridSize - 1) + (gridSize - 1) * gridSize;

  const isLineSelected = useCallback(
    (lineId) => {
      return selectedLines.includes(lineId);
    },
    [selectedLines]
  );

  const checkCompletedBoxes = useCallback(
    (lineId, currentSelectedLines) => {
      const [state, i, j] = lineId.split("-");
      const row = parseInt(i);
      const col = parseInt(j);
      const newBoxes = [];
      const isSelected = (id) => currentSelectedLines.includes(id);

      if (state === "v") {
        if (
          col > 0 &&
          isSelected(`h-${row}-${col - 1}`) &&
          isSelected(`v-${row}-${col - 1}`) &&
          isSelected(`h-${row + 1}-${col - 1}`)
        ) {
          newBoxes.push(`box-${row}-${col - 1}`);
        }
        if (
          col < gridSize - 1 &&
          isSelected(`h-${row}-${col}`) &&
          isSelected(`v-${row}-${col + 1}`) &&
          isSelected(`h-${row + 1}-${col}`)
        ) {
          newBoxes.push(`box-${row}-${col}`);
        }
      } else if (state === "h") {
        if (
          row > 0 &&
          isSelected(`h-${row - 1}-${col}`) &&
          isSelected(`v-${row - 1}-${col}`) &&
          isSelected(`v-${row - 1}-${col + 1}`)
        ) {
          newBoxes.push(`box-${row - 1}-${col}`);
        }
        if (
          row < gridSize - 1 &&
          isSelected(`h-${row + 1}-${col}`) &&
          isSelected(`v-${row}-${col}`) &&
          isSelected(`v-${row}-${col + 1}`)
        ) {
          newBoxes.push(`box-${row}-${col}`);
        }
      }
      return newBoxes;
    },
    [gridSize]
  );

  const getComputerMove = useCallback(() => {
    const availableLines = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize - 1; j++) {
        const hLineId = `h-${i}-${j}`;
        if (!selectedLines.includes(hLineId)) {
          availableLines.push(hLineId);
        }
      }
    }
    for (let i = 0; i < gridSize - 1; i++) {
      for (let j = 0; j < gridSize; j++) {
        const vLineId = `v-${i}-${j}`;
        if (!selectedLines.includes(vLineId)) {
          availableLines.push(vLineId);
        }
      }
    }

    const completingMoves = [];
    for (const lineId of availableLines) {
      const testLines = [...selectedLines, lineId];
      const completedBoxes = checkCompletedBoxes(lineId, testLines);
      if (completedBoxes.length > 0) {
        completingMoves.push({ lineId, boxes: completedBoxes.length });
      }
    }

    if (completingMoves.length > 0) {
      completingMoves.sort((a, b) => b.boxes - a.boxes);
      return completingMoves[0].lineId;
    }

    const safeLines = availableLines.filter((lineId) => {
      const testLines = [...selectedLines, lineId];
      const remainingLines = availableLines.filter((id) => id !== lineId);
      for (const opponentLineId of remainingLines) {
        const opponentTestLines = [...testLines, opponentLineId];
        const opponentBoxes = checkCompletedBoxes(
          opponentLineId,
          opponentTestLines
        );
        if (opponentBoxes.length > 0) {
          return false;
        }
      }
      return true;
    });

    const linesToChooseFrom = safeLines.length > 0 ? safeLines : availableLines;

    if (selectedLines.length < gridSize) {
      const centerLines = linesToChooseFrom.filter((lineId) => {
        const [state, i, j] = lineId.split("-");
        const row = parseInt(i);
        const col = parseInt(j);
        const center = Math.floor(gridSize / 2);
        return Math.abs(row - center) <= 1 && Math.abs(col - center) <= 1;
      });
      if (centerLines.length > 0) {
        return centerLines[Math.floor(Math.random() * centerLines.length)];
      }
    }

    return linesToChooseFrom[
      Math.floor(Math.random() * linesToChooseFrom.length)
    ];
  }, [selectedLines, checkCompletedBoxes, gridSize]);

  const handleLineClick = useCallback(
    (lineId) => {
      if (
        isLineSelected(lineId) ||
        gameOver ||
        (gameMode === "pvc" && turn === "B" && !isComputerThinking)
      ) {
        return;
      }

      const newSelectedLines = [...selectedLines, lineId];
      const newCompletedBoxes = checkCompletedBoxes(lineId, newSelectedLines);

      setSelectedLines(newSelectedLines);
      setLastMove(lineId);
      setAnimate(true);
      setTimeout(() => setAnimate(false), 300);

      if (newCompletedBoxes.length > 0) {
        setCompletedBoxes((prev) => [
          ...prev,
          ...newCompletedBoxes.map((boxId) => ({ id: boxId, player: turn })),
        ]);
        setScore((prev) => ({
          ...prev,
          [turn]: prev[turn] + newCompletedBoxes.length,
        }));
      } else {
        setTurn((prev) => (prev === "R" ? "B" : "R"));
      }

      if (newSelectedLines.length === totalLines) {
        setGameOver(true);
      }
    },
    [
      isLineSelected,
      selectedLines,
      checkCompletedBoxes,
      turn,
      gameOver,
      gameMode,
      isComputerThinking,
      totalLines,
    ]
  );

  useEffect(() => {
    if (
      gameMode === "pvc" &&
      turn === "B" &&
      !gameOver &&
      selectedLines.length >= 0
    ) {
      setIsComputerThinking(true);
      const timer = setTimeout(() => {
        const computerMove = getComputerMove();
        if (computerMove) {
          handleLineClick(computerMove);
        }
        setIsComputerThinking(false);
      }, Math.random() * 1200 + 800);
      return () => clearTimeout(timer);
    }
  }, [
    turn,
    gameMode,
    gameOver,
    selectedLines.length,
    getComputerMove,
    handleLineClick,
  ]);

  useEffect(() => {
    if (gameOver) {
      if (score.R > score.B) {
        setGameStatus("🎉 Red Player Wins!");
      } else if (score.B > score.R) {
        setGameStatus(
          gameMode === "pvc" ? "🤖 Computer Wins!" : "🎉 Blue Player Wins!"
        );
      } else {
        setGameStatus("🤝 It's a Tie!");
      }
    } else {
      const currentPlayer =
        turn === "R"
          ? "Red Player"
          : gameMode === "pvc"
          ? "Computer"
          : "Blue Player";
      setGameStatus(
        isComputerThinking
          ? "🤖 Computer is thinking..."
          : `${currentPlayer}'s Turn`
      );
    }
  }, [gameOver, score, turn, gameMode, isComputerThinking]);

  const resetGame = () => {
    setTurn("R");
    setSelectedLines([]);
    setScore({ R: 0, B: 0 });
    setGameOver(false);
    setCompletedBoxes([]);
    setIsComputerThinking(false);
    setHoveredLine(null);
    setLastMove(null);
    setAnimate(false);
  };

  const startGame = (mode) => {
    resetGame();
    setGameMode(mode);
  };

  const backToMenu = () => {
    setGameMode("menu");
    resetGame();
  };

  const handleGridSizeChange = (newSize) => {
    if (newSize >= 3 && newSize <= 8) {
      setGridSize(newSize);
      resetGame();
    }
  };

  const getGridDimensions = () => {
    const screenWidth =
      typeof window !== "undefined" ? window.innerWidth : 1024;
    const screenHeight =
      typeof window !== "undefined" ? window.innerHeight : 768;
    
    // Calculate available space more carefully
    const availableWidth = Math.min(screenWidth - 40, 700);
    const availableHeight = Math.min(screenHeight - 300, 700);
    const availableSize = Math.min(availableWidth, availableHeight);
    
    // Calculate cell size based on grid size
    const cellSize = Math.max(30, Math.min(80, availableSize / gridSize));
    const lineThickness = Math.max(3, Math.min(6, cellSize * 0.08));
    const dotSize = Math.max(8, Math.min(16, cellSize * 0.25));
    
    return {
      cellSize,
      lineThickness,
      dotSize,
      containerSize: cellSize * (gridSize - 1) + dotSize,
    };
  };

  const gridDimensions = getGridDimensions();

  if (gameMode === "settings") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-600/10 via-transparent to-transparent"></div>
        <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-6 w-20 h-20">
              <Settings className="w-full h-full text-cyan-400 animate-spin-slow" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
              Game Settings
            </h1>
            <p className="text-gray-300">Customize your game experience</p>
          </div>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-white/10 via-white/5 to-transparent rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
              <label className="block text-cyan-100 font-semibold mb-4 sm:flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Grid Size
              </label>
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => handleGridSizeChange(gridSize - 1)}
                  disabled={gridSize <= 3}
                  className="group bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-300 transform hover:scale-110 disabled:hover:scale-100 shadow-lg"
                >
                  <Minus className="w-5 h-5 group-hover:animate-pulse" />
                </button>
                <div className="text-center flex-1">
                  <div className="text-3xl font-bold text-cyan-300 mb-1">
                    {gridSize}×{gridSize}
                  </div>
                  <div className="text-sm text-gray-400">
                    {(gridSize - 1) * (gridSize - 1)} boxes
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {totalLines} total lines
                  </div>
                </div>
                <button
                  onClick={() => handleGridSizeChange(gridSize + 1)}
                  disabled={gridSize >= 8}
                  className="group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-300 transform hover:scale-110 disabled:hover:scale-100 shadow-lg"
                >
                  <Plus className="w-5 h-5 group-hover:animate-pulse" />
                </button>
              </div>
              <div className="mt-4 text-sm text-gray-400 text-center">
                Range: 3×3 to 8×8 grid
              </div>
            </div>
            <button
              onClick={backToMenu}
              className="group w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative flex items-center justify-center gap-2">
                <Home className="w-5 h-5" />
                Back to Menu
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-600/10 via-transparent to-transparent animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-6">
              <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-2xl">
                <Gamepad2 className="w-12 h-12 text-white animate-bounce" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-600/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-4 tracking-tight">
              Dots & Boxes
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-full border border-white/20">
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"></div>
              <p className="text-cyan-200 text-sm font-medium">
                Grid: {gridSize}×{gridSize}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => startGame("pvp")}
              className="group w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Users className="w-6 h-6 relative z-10 group-hover:animate-pulse" />
              <span className="relative z-10">Player vs Player</span>
            </button>
            <button
              onClick={() => startGame("pvc")}
              className="group w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Zap className="w-6 h-6 relative z-10 group-hover:animate-pulse" />
              <span className="relative z-10">Player vs Computer</span>
            </button>
            <button
              onClick={() => setGameMode("settings")}
              className="group w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Settings className="w-6 h-6 relative z-10 group-hover:animate-pulse" />
              <span className="relative z-10">Settings</span>
            </button>
          </div>
          <div className="mt-8 text-center text-sm text-gray-400">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>Create boxes by connecting dots!</span>
              <Star className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-xs text-gray-500">
              Complete boxes to earn points and win!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent animate-pulse"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-600/5 via-transparent to-transparent animate-pulse"></div>
      <div className="relative z-10 p-3 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-3 tracking-tight">
              Dots & Boxes
            </h1>
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-white/10 via-white/5 to-transparent backdrop-blur-sm rounded-full border border-white/20">
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"></div>
              <p className="text-cyan-200 text-xs sm:text-sm font-medium">
                {gameMode === "pvc" ? "Player vs Computer" : "Player vs Player"} • {gridSize}×{gridSize}
              </p>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row justify-center items-center mb-4 sm:mb-8 gap-3 sm:gap-6">
            <div className="relative group order-2 xl:order-1">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-gradient-to-r from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/20 shadow-xl">
                <p className="text-white text-sm sm:text-lg font-bold text-center bg-gradient-to-r from-cyan-100 via-blue-100 to-indigo-100 bg-clip-text sm:text-transparent flex items-center justify-center gap-2">
                  {isComputerThinking && (
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                  )}
                  {gameStatus}
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4 order-1 xl:order-2">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur opacity-15 group-hover:opacity-25 transition duration-300"></div>
                <div className="relative bg-gradient-to-r from-red-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl px-3 sm:px-6 py-3 border border-red-500/20 shadow-xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-red-400 to-pink-400 rounded-full shadow-lg"></div>
                      {turn === "R" && !gameOver && (
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-ping opacity-75"></div>
                      )}
                    </div>
                    <span className="text-white font-bold text-sm sm:text-base">
                      Red: {score.R}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-2xl blur opacity-15 group-hover:opacity-25 transition duration-300"></div>
                <div className="relative bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-600/10 backdrop-blur-xl rounded-2xl px-3 sm:px-6 py-3 border border-cyan-500/20 shadow-xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-full shadow-lg"></div>
                      {turn === "B" && !gameOver && (
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-full animate-ping opacity-75"></div>
                      )}
                    </div>
                    <span className="text-white font-bold text-sm sm:text-base">
                      {gameMode === "pvc" ? "Computer" : "Blue"}: {score.B}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-4 sm:mb-8">
            <div className="relative group">
              <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-600/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-2xl">
                
                {/* Game Grid */}
                <div 
                  className="relative mx-auto"
                  style={{
                    width: `${gridDimensions.containerSize}px`,
                    height: `${gridDimensions.containerSize}px`,
                  }}
                >
                  {/* Render Dots */}
                  {Array.from({ length: gridSize }, (_, row) =>
                    Array.from({ length: gridSize }, (_, col) => (
                      <div
                        key={`dot-${row}-${col}`}
                        className="absolute bg-gradient-to-br from-white via-gray-100 to-gray-200 rounded-full shadow-lg border-2 border-white/70 z-20"
                        style={{
                          left: `${col * gridDimensions.cellSize}px`,
                          top: `${row * gridDimensions.cellSize}px`,
                          width: `${gridDimensions.dotSize}px`,
                          height: `${gridDimensions.dotSize}px`,
                          transform: `translate(-${gridDimensions.dotSize/2}px, -${gridDimensions.dotSize/2}px)`,
                        }}
                      />
                    ))
                  )}

                  {/* Render Horizontal Lines */}
                  {Array.from({ length: gridSize }, (_, row) =>
                    Array.from({ length: gridSize - 1 }, (_, col) => {
                      const lineId = `h-${row}-${col}`;
                      const isSelected = isLineSelected(lineId);
                      const isHovered = hoveredLine === lineId;
                      const isAnimating = animate && lastMove === lineId;
                      
                      return (
                        <div
                          key={lineId}
                          className={`absolute cursor-pointer transition-all duration-300 rounded-full z-10 ${
                            isSelected? "bg-gradient-to-r from-red-400 via-pink-400 to-red-500 shadow-lg border-2 border-red-300"
                            : isHovered
                            ? "bg-gradient-to-r from-white/40 via-white/30 to-white/40 shadow-md border border-white/50"
                            : "bg-gradient-to-r from-white/20 via-white/15 to-white/20 hover:from-white/30 hover:via-white/25 hover:to-white/30 border border-white/30"
                          } ${isAnimating ? "animate-pulse scale-110" : ""}`}
                          style={{
                            left: `${col * gridDimensions.cellSize + gridDimensions.dotSize/2}px`,
                            top: `${row * gridDimensions.cellSize - gridDimensions.lineThickness/2}px`,
                            width: `${gridDimensions.cellSize - gridDimensions.dotSize}px`,
                            height: `${gridDimensions.lineThickness}px`,
                          }}
                          onClick={() => handleLineClick(lineId)}
                          onMouseEnter={() => setHoveredLine(lineId)}
                          onMouseLeave={() => setHoveredLine(null)}
                        />
                      );
                    })
                  )}

                  {/* Render Vertical Lines */}
                  {Array.from({ length: gridSize - 1 }, (_, row) =>
                    Array.from({ length: gridSize }, (_, col) => {
                      const lineId = `v-${row}-${col}`;
                      const isSelected = isLineSelected(lineId);
                      const isHovered = hoveredLine === lineId;
                      const isAnimating = animate && lastMove === lineId;
                      
                      return (
                        <div
                          key={lineId}
                          className={`absolute cursor-pointer transition-all duration-300 rounded-full z-10 ${
                            isSelected
                            ? "bg-gradient-to-b from-cyan-400 via-blue-400 to-indigo-500 shadow-lg border-2 border-cyan-300"
                            : isHovered
                            ? "bg-gradient-to-b from-white/40 via-white/30 to-white/40 shadow-md border border-white/50"
                            : "bg-gradient-to-b from-white/20 via-white/15 to-white/20 hover:from-white/30 hover:via-white/25 hover:to-white/30 border border-white/30"
                          } ${isAnimating ? "animate-pulse scale-110" : ""}`}
                          style={{
                            left: `${col * gridDimensions.cellSize - gridDimensions.lineThickness/2}px`,
                            top: `${row * gridDimensions.cellSize + gridDimensions.dotSize/2}px`,
                            width: `${gridDimensions.lineThickness}px`,
                            height: `${gridDimensions.cellSize - gridDimensions.dotSize}px`,
                          }}
                          onClick={() => handleLineClick(lineId)}
                          onMouseEnter={() => setHoveredLine(lineId)}
                          onMouseLeave={() => setHoveredLine(null)}
                        />
                      );
                    })
                  )}

                  {/* Render Completed Boxes */}
                  {completedBoxes.map((box) => {
                    const [, row, col] = box.id.split("-");
                    const boxRow = parseInt(row);
                    const boxCol = parseInt(col);
                    
                    return (
                      <div
                        key={box.id}
                        className={`absolute rounded-lg shadow-xl border-2 z-5 transition-all duration-500 animate-pulse ${
                          box.player === "R"
                            ? "bg-gradient-to-br from-red-400/30 via-pink-400/20 to-red-500/30 border-red-400/50"
                            : "bg-gradient-to-br from-cyan-400/30 via-blue-400/20 to-indigo-500/30 border-cyan-400/50"
                        }`}
                        style={{
                          left: `${boxCol * gridDimensions.cellSize + gridDimensions.dotSize/2}px`,
                          top: `${boxRow * gridDimensions.cellSize + gridDimensions.dotSize/2}px`,
                          width: `${gridDimensions.cellSize - gridDimensions.dotSize}px`,
                          height: `${gridDimensions.cellSize - gridDimensions.dotSize}px`,
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          {box.player === "R" ? (
                            <Crown className="text-red-300 w-6 h-6 animate-bounce" />
                          ) : (
                            <Trophy className="text-cyan-300 w-6 h-6 animate-bounce" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <button
              onClick={resetGame}
              className="group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
              <span className="relative z-10 text-sm sm:text-base">Reset</span>
            </button>
            
            <button
              onClick={backToMenu}
              className="group bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Home className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
              <span className="relative z-10 text-sm sm:text-base">Menu</span>
            </button>

            <button
              onClick={() => setGameMode("settings")}
              className="group bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
              <span className="relative z-10 text-sm sm:text-base">Settings</span>
            </button>
          </div>

          {gameOver && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="relative bg-gradient-to-br from-white/20 via-white/10 to-transparent backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/30 max-w-md w-full text-center">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-600/20 rounded-3xl blur-xl"></div>
                <div className="relative">
                  <div className="text-6xl mb-4">
                    {score.R > score.B ? "🎉" : score.B > score.R ? (gameMode === "pvc" ? "🤖" : "🎉") : "🤝"}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    {gameStatus}
                  </h2>
                  <div className="flex justify-center gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {score.R}
                      </div>
                      <div className="text-sm text-gray-300">Red</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">
                        {score.B}
                      </div>
                      <div className="text-sm text-gray-300">
                        {gameMode === "pvc" ? "Computer" : "Blue"}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={resetGame}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Play Again
                    </button>
                    <button
                      onClick={backToMenu}
                      className="flex-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Home className="w-4 h-4" />
                      Menu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DotsAndBoxes_copy2;