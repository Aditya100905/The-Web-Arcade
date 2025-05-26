import React, { useState, useEffect, useCallback } from "react";

const SudokuGame = () => {
  // Generate a complete Sudoku puzzle
  const generateCompletePuzzle = () => {
    const puzzle = Array(9)
      .fill()
      .map(() => Array(9).fill(0));

    // Fill diagonal 3x3 boxes first
    for (let box = 0; box < 9; box += 3) {
      fillBox(puzzle, box, box);
    }

    // Fill remaining cells
    fillRemaining(puzzle, 0, 3);

    return puzzle;
  };

  const fillBox = (puzzle, row, col) => {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const randomIndex = Math.floor(Math.random() * nums.length);
        puzzle[row + i][col + j] = nums[randomIndex];
        nums.splice(randomIndex, 1);
      }
    }
  };

  useEffect(() => {
    document.title = "Sudoku";
  }, []);
  const isValidMove = (puzzle, row, col, num) => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (puzzle[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (puzzle[x][col] === num) return false;
    }

    // Check 3x3 box
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (puzzle[i + startRow][j + startCol] === num) return false;
      }
    }

    return true;
  };

  const fillRemaining = (puzzle, i, j) => {
    if (j >= 9 && i < 8) {
      i++;
      j = 0;
    }
    if (i >= 9 && j >= 9) return true;

    if (i < 3) {
      if (j < 3) j = 3;
    } else if (i < 6) {
      if (j === Math.floor(i / 3) * 3) j += 3;
    } else {
      if (j === 6) {
        i++;
        j = 0;
        if (i >= 9) return true;
      }
    }

    for (let num = 1; num <= 9; num++) {
      if (isValidMove(puzzle, i, j, num)) {
        puzzle[i][j] = num;
        if (fillRemaining(puzzle, i, j + 1)) return true;
        puzzle[i][j] = 0;
      }
    }
    return false;
  };

  const createPuzzle = (difficulty = "medium") => {
    const complete = generateCompletePuzzle();
    const puzzle = complete.map((row) => [...row]);

    const cellsToRemove = {
      easy: 35,
      medium: 45,
      hard: 55,
    };

    let removed = 0;
    const toRemove = cellsToRemove[difficulty];

    while (removed < toRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);

      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        removed++;
      }
    }

    return { puzzle, solution: complete };
  };

  const [gameState, setGameState] = useState(() => {
    const initial = createPuzzle("medium");
    return {
      currentPuzzle: initial.puzzle,
      solution: initial.solution,
      originalPuzzle: initial.puzzle.map((row) => [...row]),
      selectedCell: null,
      errors: Array(9)
        .fill()
        .map(() => Array(9).fill(false)),
      isComplete: false,
      difficulty: "medium",
    };
  });

  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [minTime, setMinTime] = useState(() => {
    // In a real app, this would be: parseInt(localStorage.getItem('sudoku-min-time') || '0')
    return 0;
  });

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isRunning && !gameState.isComplete) {
      interval = setInterval(() => {
        setTimer((timer) => timer + 1);
      }, 1000);
    } else if (!isRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, gameState.isComplete]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Start new game
  const startNewGame = (difficulty = "medium") => {
    const newGame = createPuzzle(difficulty);
    setGameState({
      currentPuzzle: newGame.puzzle,
      solution: newGame.solution,
      originalPuzzle: newGame.puzzle.map((row) => [...row]),
      selectedCell: null,
      errors: Array(9)
        .fill()
        .map(() => Array(9).fill(false)),
      isComplete: false,
      difficulty,
    });
    setTimer(0);
    setIsRunning(true);
  };

  // Check if puzzle is complete
  const checkCompletion = useCallback(
    (puzzle) => {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (puzzle[i][j] === 0) return false;
        }
      }

      // Verify solution is correct
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (puzzle[i][j] !== gameState.solution[i][j]) return false;
        }
      }

      return true;
    },
    [gameState.solution]
  );

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (gameState.originalPuzzle[row][col] !== 0) return;
    setGameState((prev) => ({
      ...prev,
      selectedCell: [row, col],
    }));
  };

  // Handle number input
  const handleNumberInput = (num) => {
    if (!gameState.selectedCell || gameState.isComplete) return;

    const [row, col] = gameState.selectedCell;
    if (gameState.originalPuzzle[row][col] !== 0) return;

    const newPuzzle = gameState.currentPuzzle.map((r) => [...r]);
    const newErrors = gameState.errors.map((r) => [...r]);

    newPuzzle[row][col] = num;
    newErrors[row][col] = num !== 0 && num !== gameState.solution[row][col];

    const isComplete = checkCompletion(newPuzzle);

    if (isComplete) {
      setIsRunning(false);
      // In a real app: localStorage.setItem('sudoku-min-time', Math.min(timer, minTime || Infinity).toString())
      if (minTime === 0 || timer < minTime) {
        setMinTime(timer);
      }
    }

    setGameState((prev) => ({
      ...prev,
      currentPuzzle: newPuzzle,
      errors: newErrors,
      isComplete,
    }));
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key >= "1" && e.key <= "9") {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleNumberInput(0);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState.selectedCell, gameState.isComplete]);

  // Get cell classes with consistent styling
  const getCellClasses = (row, col) => {
    let classes =
      "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center text-base sm:text-lg md:text-xl font-bold cursor-pointer transition-all duration-200 select-none ";

    // Original puzzle cells (read-only)
    if (gameState.originalPuzzle[row][col] !== 0) {
      classes +=
        "bg-gradient-to-br from-slate-700/90 via-slate-800/95 to-slate-900 text-emerald-300 ";
    } else {
      classes +=
        "bg-gradient-to-br from-slate-800/70 via-slate-900/80 to-black/90 text-white hover:from-emerald-900/30 hover:via-teal-900/30 hover:to-cyan-900/30 hover:scale-105 ";
    }

    // Selected cell with glowing effect
    if (
      gameState.selectedCell &&
      gameState.selectedCell[0] === row &&
      gameState.selectedCell[1] === col
    ) {
      classes +=
        "ring-2 ring-emerald-400 shadow-emerald-400/50 shadow-lg bg-gradient-to-br from-emerald-800/40 via-teal-800/40 to-cyan-800/40 scale-105 z-10 ";
    }

    // Error cells with pulsing effect
    if (gameState.errors[row][col]) {
      classes +=
        "text-red-300 bg-gradient-to-br from-red-900/50 via-red-800/60 to-red-700/50 ring-1 ring-red-400/50 animate-pulse ";
    }

    return classes;
  };

  // Get consistent 3x3 box styling
  const getBoxClasses = (boxRow, boxCol) => {
    return `bg-gradient-to-br from-slate-900/60 via-black/80 to-slate-900/60 p-1 rounded-lg border border-emerald-500/40`;
  };

  const getDifficultyButtonClasses = (difficulty) => {
    const isActive = gameState.difficulty === difficulty;
    return `px-4 py-2 sm:px-6 sm:py-3 font-bold text-sm sm:text-base rounded-lg transition-all duration-300 transform ${
      isActive
        ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/30 scale-105"
        : "bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-emerald-300 hover:from-emerald-900/50 hover:via-teal-900/50 hover:to-cyan-900/50 hover:text-white hover:scale-105"
    }`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl">
            SUDOKU
          </h1>
          <p className="text-base sm:text-lg text-emerald-300/80 font-light tracking-wide">
            Master the Ultimate Number Challenge
          </p>
        </div>

        {/* Timer Display */}
        <div className="flex justify-center items-center gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-black/80 p-4 sm:p-6 rounded-xl shadow-xl border border-emerald-500/30">
            <div className="text-xs sm:text-sm text-emerald-400 mb-2 font-semibold tracking-wider uppercase text-center">
              Current Time
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent text-center">
              {formatTime(timer)}
            </div>
          </div>

          {minTime > 0 && (
            <div className="bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-black/80 p-4 sm:p-6 rounded-xl shadow-xl border border-yellow-500/30">
              <div className="text-xs sm:text-sm text-yellow-400 mb-2 font-semibold tracking-wider uppercase text-center">
                Best Time
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent text-center">
                {formatTime(minTime)}
              </div>
            </div>
          )}
        </div>

        {/* Game Controls */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-slate-800/50 via-slate-900/60 to-black/50 p-4 sm:p-6 rounded-xl shadow-xl border border-emerald-500/20">
            <h3 className="text-base sm:text-lg font-semibold text-emerald-400 tracking-wide text-center mb-4">
              Select Difficulty
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => startNewGame("easy")}
                className={getDifficultyButtonClasses("easy")}
              >
                Easy
              </button>
              <button
                onClick={() => startNewGame("medium")}
                className={getDifficultyButtonClasses("medium")}
              >
                Medium
              </button>
              <button
                onClick={() => startNewGame("hard")}
                className={getDifficultyButtonClasses("hard")}
              >
                Hard
              </button>
            </div>
          </div>
        </div>

        {/* Game Board with 3x3 Box Layout */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-slate-900/80 via-black/90 to-slate-900/80 p-4 sm:p-6 rounded-2xl shadow-2xl border-2 border-emerald-500/30">
            <div className="grid grid-cols-3 gap-2 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-3 rounded-xl">
              {Array(3)
                .fill()
                .map((_, boxRow) =>
                  Array(3)
                    .fill()
                    .map((_, boxCol) => (
                      <div
                        key={`box-${boxRow}-${boxCol}`}
                        className={getBoxClasses(boxRow, boxCol)}
                      >
                        <div className="grid grid-cols-3 gap-0">
                          {Array(3)
                            .fill()
                            .map((_, cellRow) =>
                              Array(3)
                                .fill()
                                .map((_, cellCol) => {
                                  const row = boxRow * 3 + cellRow;
                                  const col = boxCol * 3 + cellCol;
                                  return (
                                    <div
                                      key={`${row}-${col}`}
                                      className={getCellClasses(row, col)}
                                      onClick={() => handleCellClick(row, col)}
                                    >
                                      {gameState.currentPuzzle[row][col] !== 0
                                        ? gameState.currentPuzzle[row][col]
                                        : ""}
                                    </div>
                                  );
                                })
                            )}
                        </div>
                      </div>
                    ))
                )}
            </div>
          </div>
        </div>

        {/* Number Input */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-slate-800/50 via-slate-900/60 to-black/50 p-4 sm:p-6 rounded-xl shadow-xl border border-emerald-500/20">
            <h3 className="text-base sm:text-lg font-semibold text-emerald-400 tracking-wide text-center mb-4">
              Number Input
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberInput(num)}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 hover:from-emerald-800/50 hover:via-teal-800/50 hover:to-cyan-800/50 border border-emerald-500/30 rounded-lg text-base sm:text-xl font-bold transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-emerald-400/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={!gameState.selectedCell || gameState.isComplete}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => handleNumberInput(0)}
                className="bg-gradient-to-br from-red-700 via-red-800 to-red-900 hover:from-red-600 hover:via-red-700 hover:to-red-800 border border-red-500/50 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-400/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!gameState.selectedCell || gameState.isComplete}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Completion Message */}
        {gameState.isComplete && (
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 backdrop-blur-sm border border-emerald-400/50 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md mx-auto animate-pulse">
              <div className="text-center">
                <div className="text-5xl sm:text-6xl mb-4">🎉</div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Congratulations!
                </h2>
                <p className="text-lg sm:text-xl mb-4 text-emerald-300">
                  Puzzle Completed!
                </p>
                <div className="bg-slate-900/50 p-4 rounded-xl mb-4">
                  <p className="font-mono text-xl sm:text-2xl text-cyan-400">
                    Time: {formatTime(timer)}
                  </p>
                </div>
                {timer === minTime && minTime > 0 && (
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-3 rounded-xl">
                    <p className="text-yellow-300 font-bold text-base sm:text-lg">
                      🏆 New Best Time!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-slate-800/30 via-slate-900/40 to-black/30 p-6 rounded-xl shadow-lg border border-emerald-500/10 max-w-2xl mx-auto">
            <h4 className="text-base sm:text-lg font-semibold text-emerald-400 mb-3">
              How to Play
            </h4>
            <div className="text-sm sm:text-base text-gray-300 space-y-2">
              <p>• Click on any empty cell to select it</p>
              <p>• Use the number buttons or keyboard (1-9) to fill cells</p>
              <p>• Press Clear button or Backspace to remove numbers</p>
              <p>• Fill all cells correctly to complete the puzzle!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SudokuGame;
