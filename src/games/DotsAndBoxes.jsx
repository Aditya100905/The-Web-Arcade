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
  Bot,
  UserCheck,
} from "lucide-react";

const DotsAndBoxesGame = () => {
  const [gridSize, setGridSize] = useState(4);
  const [gameMode, setGameMode] = useState("menu");
  const [currentPlayer, setCurrentPlayer] = useState("player1");
  const [selectedLines, setSelectedLines] = useState([]);
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [gameStatus, setGameStatus] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [hoveredLine, setHoveredLine] = useState(null);
  const [completedBoxes, setCompletedBoxes] = useState([]);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [playerColors, setPlayerColors] = useState({
    player1: { primary: "#ef4444", secondary: "#f87171", name: "Red" },
    player2: { primary: "#06b6d4", secondary: "#0891b2", name: "Blue" },
  });

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

    // Find moves that complete boxes (priority)
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

    // Find safe moves (don't give opponent a chance to complete boxes)
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

    // Early game: prefer center moves
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

  const canPlayerMove = () => {
    if (gameOver) return false;
    if (
      gameMode === "pvc" &&
      currentPlayer === "player2" &&
      !isComputerThinking
    )
      return false;
    return true;
  };

  const handleLineClick = useCallback(
    (lineId) => {
      if (isLineSelected(lineId) || !canPlayerMove()) {
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
          ...newCompletedBoxes.map((boxId) => ({
            id: boxId,
            player: currentPlayer,
          })),
        ]);
        setScore((prev) => ({
          ...prev,
          [currentPlayer]: prev[currentPlayer] + newCompletedBoxes.length,
        }));
        // Player keeps turn when completing boxes
      } else {
        // Switch turns only when no boxes are completed
        setCurrentPlayer((prev) =>
          prev === "player1" ? "player2" : "player1"
        );
      }

      if (newSelectedLines.length === totalLines) {
        setGameOver(true);
      }
    },
    [
      isLineSelected,
      selectedLines,
      checkCompletedBoxes,
      currentPlayer,
      canPlayerMove,
      totalLines,
    ]
  );

  // Computer move logic
  useEffect(() => {
    if (
      gameMode === "pvc" &&
      currentPlayer === "player2" &&
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
    currentPlayer,
    gameMode,
    gameOver,
    selectedLines.length,
    getComputerMove,
    handleLineClick,
  ]);

  // Update game status
  useEffect(() => {
    if (gameOver) {
      if (score.player1 > score.player2) {
        setGameStatus(`🎉 ${playerColors.player1.name} Player Wins!`);
      } else if (score.player2 > score.player1) {
        setGameStatus(
          gameMode === "pvc"
            ? "🤖 Computer Wins!"
            : `🎉 ${playerColors.player2.name} Player Wins!`
        );
      } else {
        setGameStatus("🤝 It's a Tie!");
      }
    } else {
      if (isComputerThinking) {
        setGameStatus("🤖 Computer is thinking...");
      } else {
        const playerName =
          currentPlayer === "player1"
            ? `${playerColors.player1.name} Player`
            : gameMode === "pvc"
            ? "Computer"
            : `${playerColors.player2.name} Player`;
        setGameStatus(`${playerName}'s Turn`);
      }
    }
  }, [
    gameOver,
    score,
    currentPlayer,
    gameMode,
    isComputerThinking,
    playerColors,
  ]);

  const resetGame = () => {
    setCurrentPlayer("player1");
    setSelectedLines([]);
    setScore({ player1: 0, player2: 0 });
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

    const availableWidth = Math.min(screenWidth - 40, 800);
    const availableHeight = Math.min(screenHeight - 200, 800);
    const availableSize = Math.min(availableWidth, availableHeight);

    const cellSize = Math.max(40, Math.min(100, availableSize / gridSize));
    const lineThickness = Math.max(4, Math.min(8, cellSize * 0.1));
    const dotSize = Math.max(12, Math.min(20, cellSize * 0.3));

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
        <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-6 w-20 h-20">
              <Settings className="w-full h-full text-cyan-400 animate-spin-slow" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
              Game Settings
            </h1>
            <p className="text-gray-300 text-lg">Customize your experience</p>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-r from-white/10 via-white/5 to-transparent rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
              <label className="block text-cyan-100 font-semibold mb-6 flex items-center gap-3 text-lg">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                Grid Size
              </label>
              <div className="flex items-center justify-between gap-6">
                <button
                  onClick={() => handleGridSizeChange(gridSize - 1)}
                  disabled={gridSize <= 3}
                  className="group bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-110 disabled:hover:scale-100 shadow-lg"
                >
                  <Minus className="w-6 h-6 group-hover:animate-pulse" />
                </button>
                <div className="text-center flex-1">
                  <div className="text-4xl font-bold text-cyan-300 mb-2">
                    {gridSize}×{gridSize}
                  </div>
                  <div className="text-base text-gray-400 mb-1">
                    {(gridSize - 1) * (gridSize - 1)} boxes
                  </div>
                  <div className="text-sm text-gray-500">
                    {totalLines} total lines
                  </div>
                </div>
                <button
                  onClick={() => handleGridSizeChange(gridSize + 1)}
                  disabled={gridSize >= 8}
                  className="group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-110 disabled:hover:scale-100 shadow-lg"
                >
                  <Plus className="w-6 h-6 group-hover:animate-pulse" />
                </button>
              </div>
              <div className="mt-4 text-base text-gray-400 text-center">
                Range: 3×3 to 8×8 grid
              </div>
            </div>

            <button
              onClick={backToMenu}
              className="group w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative flex items-center justify-center gap-3 text-lg">
                <Home className="w-6 h-6" />
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
        <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-lg w-full">
          <div className="text-center mb-10">
            <div className="relative mx-auto mb-8">
              <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-full w-28 h-28 flex items-center justify-center mx-auto shadow-2xl">
                <Gamepad2 className="w-14 h-14 text-white animate-bounce" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-600/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-6 tracking-tight">
              Dots & Boxes
            </h1>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-full border border-white/20">
              <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"></div>
              <p className="text-cyan-200 text-base font-medium">
                Grid: {gridSize}×{gridSize}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <button
              onClick={() => startGame("pvp")}
              className="group w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 text-white font-bold py-5 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-4 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Users className="w-7 h-7 relative z-10 group-hover:animate-pulse" />
              <span className="relative z-10 text-lg">Player vs Player</span>
            </button>

            <button
              onClick={() => startGame("pvc")}
              className="group w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 text-white font-bold py-5 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-4 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Zap className="w-7 h-7 relative z-10 group-hover:animate-pulse" />
              <span className="relative z-10 text-lg">Player vs Computer</span>
            </button>

            <button
              onClick={() => setGameMode("settings")}
              className="group w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 text-white font-bold py-5 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-4 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Settings className="w-7 h-7 relative z-10 group-hover:animate-pulse" />
              <span className="relative z-10 text-lg">Settings</span>
            </button>
          </div>

          <div className="mt-10 text-center text-base text-gray-400">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>Connect dots to create boxes!</span>
            </div>
            <p className="text-sm text-gray-500">
              Complete more boxes than your opponent to win!
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
      <div className="relative z-10 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-4 tracking-tight">
              Dots & Boxes
            </h1>
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-white/10 via-white/5 to-transparent backdrop-blur-sm rounded-full border border-white/20">
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"></div>
              <p className="text-cyan-200 text-sm font-medium">
                {gameMode === "pvc" ? "Player vs Computer" : "Player vs Player"}{" "}
                • {gridSize}×{gridSize}
              </p>
            </div>
          </div>

          {/* Game Status and Scores */}
          <div className="flex flex-col lg:flex-row justify-center items-center mb-8 gap-6">
            {/* Current Turn Status */}
            <div className="relative group order-2 lg:order-1">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div
                className={`relative backdrop-blur-xl rounded-2xl px-6 py-4 border shadow-xl transition-all duration-300 ${
                  isComputerThinking
                    ? "bg-gradient-to-r from-purple-500/20 via-violet-500/20 to-purple-500/20 border-purple-500/30"
                    : currentPlayer === "player1"
                    ? "bg-gradient-to-r from-red-500/20 via-pink-500/20 to-red-500/20 border-red-500/30"
                    : "bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 border-cyan-500/30"
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  {isComputerThinking ? (
                    <>
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>
                      <Bot className="w-5 h-5 text-purple-400 animate-pulse" />
                    </>
                  ) : currentPlayer === "player1" ? (
                    <>
                      <UserCheck
                        className="w-5 h-5"
                        style={{ color: playerColors.player1.primary }}
                      />
                      <div
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={{
                          backgroundColor: playerColors.player1.primary,
                        }}
                      ></div>
                    </>
                  ) : gameMode === "pvc" ? (
                    <>
                      <Bot className="w-5 h-5 text-cyan-400" />
                      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                    </>
                  ) : (
                    <>
                      <UserCheck
                        className="w-5 h-5"
                        style={{ color: playerColors.player2.primary }}
                      />
                      <div
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={{
                          backgroundColor: playerColors.player2.primary,
                        }}
                      ></div>
                    </>
                  )}
                  <p className="text-white text-lg font-bold">{gameStatus}</p>
                </div>
              </div>
            </div>

            {/* Score Display */}
            <div className="flex gap-6 order-1 lg:order-2">
              {/* Player 1 Score */}
              <div className="relative group">
                <div
                  className="absolute -inset-1 rounded-2xl blur opacity-15 group-hover:opacity-25 transition duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${playerColors.player1.primary}, ${playerColors.player1.secondary})`,
                  }}
                ></div>
                <div
                  className={`relative backdrop-blur-xl rounded-2xl px-6 py-4 border shadow-xl transition-all duration-300 ${
                    currentPlayer === "player1" &&
                    !gameOver &&
                    !isComputerThinking
                      ? "ring-2 ring-offset-2 ring-offset-transparent scale-105"
                      : ""
                  }`}
                  style={{
                    backgroundColor: `${playerColors.player1.primary}20`,
                    borderColor: `${playerColors.player1.primary}40`,
                    ringColor:
                      currentPlayer === "player1"
                        ? playerColors.player1.primary
                        : "transparent",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className="w-4 h-4 rounded-full shadow-lg"
                        style={{
                          backgroundColor: playerColors.player1.primary,
                        }}
                      ></div>
                      {currentPlayer === "player1" &&
                        !gameOver &&
                        !isComputerThinking && (
                          <div
                            className="absolute inset-0 rounded-full animate-ping opacity-75"
                            style={{
                              backgroundColor: playerColors.player1.primary,
                            }}
                          ></div>
                        )}
                    </div>
                    <span className="text-white font-bold text-lg">
                      {playerColors.player1.name}: {score.player1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Player 2 / Computer Score */}
              <div className="relative group">
                <div
                  className="absolute -inset-1 rounded-2xl blur opacity-15 group-hover:opacity-25 transition duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${playerColors.player2.primary}, ${playerColors.player2.secondary})`,
                  }}
                ></div>
                <div
                  className={`relative backdrop-blur-xl rounded-2xl px-6 py-4 border shadow-xl transition-all duration-300 ${
                    currentPlayer === "player2" &&
                    !gameOver &&
                    !isComputerThinking
                      ? "ring-2 ring-offset-2 ring-offset-transparent scale-105"
                      : ""
                  }`}
                  style={{
                    backgroundColor: `${playerColors.player2.primary}20`,
                    borderColor: `${playerColors.player2.primary}40`,
                    ringColor:
                      currentPlayer === "player2"
                        ? playerColors.player2.primary
                        : "transparent",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className="w-4 h-4 rounded-full shadow-lg"
                        style={{
                          backgroundColor: playerColors.player2.primary,
                        }}
                      ></div>
                      {currentPlayer === "player2" &&
                        !gameOver &&
                        !isComputerThinking && (
                          <div
                            className="absolute inset-0 rounded-full animate-ping opacity-75"
                            style={{
                              backgroundColor: playerColors.player2.primary,
                            }}
                          ></div>
                        )}
                    </div>
                    <span className="text-white font-bold text-lg">
                      {gameMode === "pvc"
                        ? "Computer"
                        : playerColors.player2.name}
                      : {score.player2}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Game Grid */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div
                className="relative bg-gradient-to-br from-white/5 via-white/2 to-transparent backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl"
                style={{
                  width: gridDimensions.containerSize + 64,
                  height: gridDimensions.containerSize + 64,
                }}
              >
                <svg
                  width={gridDimensions.containerSize}
                  height={gridDimensions.containerSize}
                  className="overflow-visible"
                >
                  {/* Render completed boxes */}
                  {completedBoxes.map((box) => {
                    const [, i, j] = box.id.split("-");
                    const row = parseInt(i);
                    const col = parseInt(j);
                    const x =
                      col * gridDimensions.cellSize +
                      gridDimensions.dotSize / 2;
                    const y =
                      row * gridDimensions.cellSize +
                      gridDimensions.dotSize / 2;
                    const playerColor =
                      box.player === "player1"
                        ? playerColors.player1
                        : playerColors.player2;

                    return (
                      <g key={box.id}>
                        {/* Box background with glow effect */}
                        <defs>
                          <filter id={`glow-${box.id}`}>
                            <feGaussianBlur
                              stdDeviation="4"
                              result="coloredBlur"
                            />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <rect
                          x={x}
                          y={y}
                          width={
                            gridDimensions.cellSize - gridDimensions.dotSize
                          }
                          height={
                            gridDimensions.cellSize - gridDimensions.dotSize
                          }
                          fill={`${playerColor.primary}40`}
                          stroke={playerColor.primary}
                          strokeWidth="2"
                          rx="8"
                          filter={`url(#glow-${box.id})`}
                          className="animate-fade-in"
                        />
                        {/* Player indicator in center of box */}
                        <circle
                          cx={
                            x +
                            (gridDimensions.cellSize - gridDimensions.dotSize) /
                              2
                          }
                          cy={
                            y +
                            (gridDimensions.cellSize - gridDimensions.dotSize) /
                              2
                          }
                          r={gridDimensions.dotSize / 3}
                          fill={playerColor.primary}
                          className="animate-bounce-in"
                        />
                      </g>
                    );
                  })}

                  {/* Render horizontal lines */}
                  {Array.from({ length: gridSize }, (_, i) =>
                    Array.from({ length: gridSize - 1 }, (_, j) => {
                      const lineId = `h-${i}-${j}`;
                      const isSelected = isLineSelected(lineId);
                      const isHovered = hoveredLine === lineId;
                      const isLastMove = lastMove === lineId;
                      const x1 =
                        j * gridDimensions.cellSize + gridDimensions.dotSize;
                      const y1 =
                        i * gridDimensions.cellSize +
                        gridDimensions.dotSize / 2;
                      const x2 = (j + 1) * gridDimensions.cellSize;
                      const y2 = y1;

                      return (
                        <g key={lineId}>
                          {/* Invisible clickable area */}
                          <rect
                            x={x1}
                            y={y1 - gridDimensions.lineThickness * 2}
                            width={x2 - x1}
                            height={gridDimensions.lineThickness * 4}
                            fill="transparent"
                            className="cursor-pointer"
                            onClick={() => handleLineClick(lineId)}
                            onMouseEnter={() => setHoveredLine(lineId)}
                            onMouseLeave={() => setHoveredLine(null)}
                          />
                          {/* Actual line */}
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={
                              isSelected
                                ? currentPlayer === "player1" ||
                                  completedBoxes.find(
                                    (box) =>
                                      checkCompletedBoxes(
                                        lineId,
                                        selectedLines
                                      ).includes(box.id) &&
                                      box.player === "player1"
                                  )
                                  ? playerColors.player1.primary
                                  : playerColors.player2.primary
                                : isHovered && canPlayerMove()
                                ? "#ffffff80"
                                : "#ffffff20"
                            }
                            strokeWidth={
                              isSelected
                                ? gridDimensions.lineThickness
                                : gridDimensions.lineThickness / 2
                            }
                            strokeLinecap="round"
                            className={`transition-all duration-300 ${
                              isSelected
                                ? "drop-shadow-glow"
                                : isHovered && canPlayerMove()
                                ? "drop-shadow-md"
                                : ""
                            } ${isLastMove && animate ? "animate-pulse" : ""}`}
                            style={{
                              filter: isSelected
                                ? `drop-shadow(0 0 8px ${
                                    currentPlayer === "player1" ||
                                    completedBoxes.find(
                                      (box) =>
                                        checkCompletedBoxes(
                                          lineId,
                                          selectedLines
                                        ).includes(box.id) &&
                                        box.player === "player1"
                                    )
                                      ? playerColors.player1.primary
                                      : playerColors.player2.primary
                                  })`
                                : "none",
                            }}
                          />
                        </g>
                      );
                    })
                  )}

                  {/* Render vertical lines */}
                  {Array.from({ length: gridSize - 1 }, (_, i) =>
                    Array.from({ length: gridSize }, (_, j) => {
                      const lineId = `v-${i}-${j}`;
                      const isSelected = isLineSelected(lineId);
                      const isHovered = hoveredLine === lineId;
                      const isLastMove = lastMove === lineId;
                      const x1 =
                        j * gridDimensions.cellSize +
                        gridDimensions.dotSize / 2;
                      const y1 =
                        i * gridDimensions.cellSize + gridDimensions.dotSize;
                      const x2 = x1;
                      const y2 = (i + 1) * gridDimensions.cellSize;

                      return (
                        <g key={lineId}>
                          {/* Invisible clickable area */}
                          <rect
                            x={x1 - gridDimensions.lineThickness * 2}
                            y={y1}
                            width={gridDimensions.lineThickness * 4}
                            height={y2 - y1}
                            fill="transparent"
                            className="cursor-pointer"
                            onClick={() => handleLineClick(lineId)}
                            onMouseEnter={() => setHoveredLine(lineId)}
                            onMouseLeave={() => setHoveredLine(null)}
                          />
                          {/* Actual line */}
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={
                              isSelected
                                ? currentPlayer === "player1" ||
                                  completedBoxes.find(
                                    (box) =>
                                      checkCompletedBoxes(
                                        lineId,
                                        selectedLines
                                      ).includes(box.id) &&
                                      box.player === "player1"
                                  )
                                  ? playerColors.player1.primary
                                  : playerColors.player2.primary
                                : isHovered && canPlayerMove()
                                ? "#ffffff80"
                                : "#ffffff20"
                            }
                            strokeWidth={
                              isSelected
                                ? gridDimensions.lineThickness
                                : gridDimensions.lineThickness / 2
                            }
                            strokeLinecap="round"
                            className={`transition-all duration-300 ${
                              isSelected
                                ? "drop-shadow-glow"
                                : isHovered && canPlayerMove()
                                ? "drop-shadow-md"
                                : ""
                            } ${isLastMove && animate ? "animate-pulse" : ""}`}
                            style={{
                              filter: isSelected
                                ? `drop-shadow(0 0 8px ${
                                    currentPlayer === "player1" ||
                                    completedBoxes.find(
                                      (box) =>
                                        checkCompletedBoxes(
                                          lineId,
                                          selectedLines
                                        ).includes(box.id) &&
                                        box.player === "player1"
                                    )
                                      ? playerColors.player1.primary
                                      : playerColors.player2.primary
                                  })`
                                : "none",
                            }}
                          />
                        </g>
                      );
                    })
                  )}

                  {/* Render dots */}
                  {Array.from({ length: gridSize }, (_, i) =>
                    Array.from({ length: gridSize }, (_, j) => (
                      <circle
                        key={`dot-${i}-${j}`}
                        cx={
                          j * gridDimensions.cellSize +
                          gridDimensions.dotSize / 2
                        }
                        cy={
                          i * gridDimensions.cellSize +
                          gridDimensions.dotSize / 2
                        }
                        r={gridDimensions.dotSize / 2}
                        fill="#ffffff"
                        className="drop-shadow-lg"
                        style={{
                          filter:
                            "drop-shadow(0 0 6px rgba(255, 255, 255, 0.5))",
                        }}
                      />
                    ))
                  )}
                </svg>
              </div>
            </div>
          </div>

          {/* Game Controls */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={resetGame}
              disabled={isComputerThinking}
              className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-3 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <RotateCcw className="w-5 h-5 relative z-10 group-hover:animate-spin" />
              <span className="relative z-10">New Game</span>
            </button>

            <button
              onClick={backToMenu}
              disabled={isComputerThinking}
              className="group bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-3 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Home className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Menu</span>
            </button>

            <button
              onClick={() => setGameMode("settings")}
              disabled={isComputerThinking}
              className="group bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-3 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Settings className="w-5 h-5 relative z-10 group-hover:animate-spin" />
              <span className="relative z-10">Settings</span>
            </button>
          </div>

          {/* Game Over Modal */}
          {gameOver && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-3xl blur opacity-50"></div>
                <div className="relative bg-gradient-to-br from-white/20 via-white/10 to-transparent backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full text-center">
                  <div className="mb-6">
                    {score.player1 > score.player2 ? (
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Crown className="w-10 h-10 text-white animate-bounce" />
                      </div>
                    ) : score.player2 > score.player1 ? (
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                        {gameMode === "pvc" ? (
                          <Bot className="w-10 h-10 text-white animate-bounce" />
                        ) : (
                          <Crown className="w-10 h-10 text-white animate-bounce" />
                        )}
                      </div>
                    ) : (
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                        <Trophy className="w-10 h-10 text-white animate-bounce" />
                      </div>
                    )}
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {gameStatus}
                    </h2>
                    <div className="text-xl text-gray-300">
                      <div className="flex justify-center gap-8 mb-4">
                        <div className="text-center">
                          <div
                            className="text-2xl font-bold"
                            style={{ color: playerColors.player1.primary }}
                          >
                            {score.player1}
                          </div>
                          <div className="text-sm text-gray-400">
                            {playerColors.player1.name}
                          </div>
                        </div>
                        <div className="text-center">
                          <div
                            className="text-2xl font-bold"
                            style={{ color: playerColors.player2.primary }}
                          >
                            {score.player2}
                          </div>
                          <div className="text-sm text-gray-400">
                            {gameMode === "pvc"
                              ? "Computer"
                              : playerColors.player2.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={resetGame}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Play Again
                    </button>
                    <button
                      onClick={backToMenu}
                      className="flex-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Home className="w-5 h-5" />
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

export default DotsAndBoxesGame;
