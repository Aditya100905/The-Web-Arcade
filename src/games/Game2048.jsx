import React, { useState, useEffect, useCallback } from "react";

const Game2048 = () => {
  const [board, setBoard] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);
  const [animatedTiles, setAnimatedTiles] = useState(new Set());
  const [hasWon, setHasWon] = useState(false);
  const [showWinPopup, setShowWinPopup] = useState(false);

  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem("game2048-highscore");
      return saved ? parseInt(saved, 10) : 0;
    } catch (error) {
      return 0;
    }
  });

  useEffect(() => {
    document.title = "2048";
  }, []);

  // Save high score to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("game2048-highscore", highScore.toString());
    } catch (error) {
      console.warn("Could not save high score to localStorage");
    }
  }, [highScore]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const newBoard = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    // Add two initial tiles
    addRandomTile(newBoard);
    addRandomTile(newBoard);

    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setShowGameOverPopup(false);
    setAnimatedTiles(new Set());
    setHasWon(false);
    setShowWinPopup(false);
  }, []);

  // Add random tile (2 or 4)
  const addRandomTile = (currentBoard) => {
    const emptyTiles = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) {
          emptyTiles.push({ r, c });
        }
      }
    }

    if (emptyTiles.length > 0) {
      const randomTile =
        emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
      currentBoard[randomTile.r][randomTile.c] = Math.random() < 0.1 ? 4 : 2;

      // Add animation for new tile
      const tileKey = `${randomTile.r}-${randomTile.c}`;
      setAnimatedTiles((prev) => new Set([...prev, tileKey]));
      setTimeout(() => {
        setAnimatedTiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(tileKey);
          return newSet;
        });
      }, 300);
    }
  };

  // Check if board has empty tiles
  const hasEmptyTile = (currentBoard) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) return true;
      }
    }
    return false;
  };

  // Check if game is over
  const isGameOver = (currentBoard) => {
    if (hasEmptyTile(currentBoard)) return false;

    // Check horizontal moves
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        if (currentBoard[r][c] === currentBoard[r][c + 1]) return false;
      }
    }

    // Check vertical moves
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 3; r++) {
        if (currentBoard[r][c] === currentBoard[r + 1][c]) return false;
      }
    }

    return true;
  };

  // Check for 2048 win condition
  const checkWin = (currentBoard) => {
    if (hasWon) return; // Already won

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 2048) {
          setHasWon(true);
          setShowWinPopup(true);
          setTimeout(() => setShowWinPopup(false), 4000);
          return;
        }
      }
    }
  };

  // Slide and merge row
  const slideAndMergeRow = (row) => {
    let newRow = row.filter((num) => num !== 0);
    let scoreIncrease = 0;

    for (let i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] === newRow[i + 1]) {
        newRow[i] *= 2;
        newRow[i + 1] = 0;
        scoreIncrease += newRow[i];
      }
    }

    newRow = newRow.filter((num) => num !== 0);
    while (newRow.length < 4) {
      newRow.push(0);
    }

    return { row: newRow, scoreIncrease };
  };

  // Move functions
  const moveLeft = () => {
    const newBoard = [...board];
    let totalScoreIncrease = 0;
    let moved = false;

    for (let r = 0; r < 4; r++) {
      const originalRow = [...newBoard[r]];
      const { row, scoreIncrease } = slideAndMergeRow(newBoard[r]);
      newBoard[r] = row;
      totalScoreIncrease += scoreIncrease;

      if (JSON.stringify(originalRow) !== JSON.stringify(row)) {
        moved = true;
      }
    }

    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      const newScore = score + totalScoreIncrease;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
      }

      checkWin(newBoard);

      if (isGameOver(newBoard)) {
        setGameOver(true);
        setShowGameOverPopup(true);
        setTimeout(() => setShowGameOverPopup(false), 3000);
      }
    }
  };

  const moveRight = () => {
    const newBoard = [...board];
    let totalScoreIncrease = 0;
    let moved = false;

    for (let r = 0; r < 4; r++) {
      const originalRow = [...newBoard[r]];
      const reversedRow = [...newBoard[r]].reverse();
      const { row, scoreIncrease } = slideAndMergeRow(reversedRow);
      newBoard[r] = row.reverse();
      totalScoreIncrease += scoreIncrease;

      if (JSON.stringify(originalRow) !== JSON.stringify(newBoard[r])) {
        moved = true;
      }
    }

    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      const newScore = score + totalScoreIncrease;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
      }

      checkWin(newBoard);

      if (isGameOver(newBoard)) {
        setGameOver(true);
        setShowGameOverPopup(true);
        setTimeout(() => setShowGameOverPopup(false), 3000);
      }
    }
  };

  const moveUp = () => {
    const newBoard = [...board];
    let totalScoreIncrease = 0;
    let moved = false;

    for (let c = 0; c < 4; c++) {
      const column = [
        newBoard[0][c],
        newBoard[1][c],
        newBoard[2][c],
        newBoard[3][c],
      ];
      const originalColumn = [...column];
      const { row, scoreIncrease } = slideAndMergeRow(column);

      for (let r = 0; r < 4; r++) {
        newBoard[r][c] = row[r];
      }

      totalScoreIncrease += scoreIncrease;

      if (JSON.stringify(originalColumn) !== JSON.stringify(row)) {
        moved = true;
      }
    }

    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      const newScore = score + totalScoreIncrease;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
      }

      checkWin(newBoard);

      if (isGameOver(newBoard)) {
        setGameOver(true);
        setShowGameOverPopup(true);
        setTimeout(() => setShowGameOverPopup(false), 3000);
      }
    }
  };

  const moveDown = () => {
    const newBoard = [...board];
    let totalScoreIncrease = 0;
    let moved = false;

    for (let c = 0; c < 4; c++) {
      const column = [
        newBoard[0][c],
        newBoard[1][c],
        newBoard[2][c],
        newBoard[3][c],
      ];
      const originalColumn = [...column];
      const reversedColumn = [...column].reverse();
      const { row, scoreIncrease } = slideAndMergeRow(reversedColumn);
      const newColumn = row.reverse();

      for (let r = 0; r < 4; r++) {
        newBoard[r][c] = newColumn[r];
      }

      totalScoreIncrease += scoreIncrease;

      if (JSON.stringify(originalColumn) !== JSON.stringify(newColumn)) {
        moved = true;
      }
    }

    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      const newScore = score + totalScoreIncrease;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
      }

      checkWin(newBoard);

      if (isGameOver(newBoard)) {
        setGameOver(true);
        setShowGameOverPopup(true);
        setTimeout(() => setShowGameOverPopup(false), 3000);
      }
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) return;

      switch (e.code) {
        case "ArrowLeft":
          e.preventDefault();
          moveLeft();
          break;
        case "ArrowRight":
          e.preventDefault();
          moveRight();
          break;
        case "ArrowUp":
          e.preventDefault();
          moveUp();
          break;
        case "ArrowDown":
          e.preventDefault();
          moveDown();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [board, gameOver]);

  // Handle touch events
  const [touchStart, setTouchStart] = useState({ x: null, y: null });

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
    });
  };

  const handleTouchEnd = (e) => {
    if (!touchStart.x || !touchStart.y || gameOver) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;

    const threshold = 50;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > threshold) {
        if (dx > 0) {
          moveRight();
        } else {
          moveLeft();
        }
      }
    } else {
      if (Math.abs(dy) > threshold) {
        if (dy > 0) {
          moveDown();
        } else {
          moveUp();
        }
      }
    }

    setTouchStart({ x: null, y: null });
  };

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const getTileStyle = (value, rowIndex, colIndex) => {
    const baseStyle =
      "flex items-center justify-center font-bold border-4 transition-all duration-300 ease-in-out rounded-xl";
    const tileKey = `${rowIndex}-${colIndex}`;
    const isAnimated = animatedTiles.has(tileKey);
    const animationClass = isAnimated
      ? "animate-pulse scale-110"
      : "hover:scale-105";

    // Responsive text sizing
    const getTextSize = (val) => {
      if (val >= 1024) return "text-2xl sm:text-3xl lg:text-4xl";
      if (val >= 100) return "text-3xl sm:text-4xl lg:text-5xl";
      return "text-4xl sm:text-5xl lg:text-6xl";
    };

    const textSize = getTextSize(value);

    // Enhanced colors with gradients and shadows
    switch (value) {
      case 0:
        return `${baseStyle} ${textSize} bg-gradient-to-br from-amber-200 to-amber-300 border-amber-700 shadow-inner ${animationClass}`;
      case 2:
        return `${baseStyle} ${textSize} bg-gradient-to-br from-amber-100 to-amber-200 text-gray-700 border-amber-700 shadow-lg ${animationClass}`;
      case 4:
        return `${baseStyle} ${textSize} bg-gradient-to-br from-amber-200 to-amber-300 text-gray-700 border-amber-700 shadow-lg ${animationClass}`;
      case 8:
        return `${baseStyle} ${textSize} bg-gradient-to-br from-orange-400 to-orange-500 text-white border-amber-700 shadow-lg shadow-orange-500/30 ${animationClass}`;
      case 16:
        return `${baseStyle} ${textSize} bg-gradient-to-br from-orange-500 to-orange-600 text-white border-amber-700 shadow-lg shadow-orange-600/30 ${animationClass}`;
      case 32:
        return `${baseStyle} ${textSize} bg-gradient-to-br from-orange-600 to-orange-700 text-white border-amber-700 shadow-lg shadow-orange-700/30 ${animationClass}`;
      case 64:
        return `${baseStyle} ${textSize} bg-gradient-to-br from-red-500 to-red-600 text-white border-amber-700 shadow-lg shadow-red-600/30 ${animationClass}`;
      case 128:
        return `${baseStyle} ${textSize} bg-gradient-to-br from-yellow-400 to-yellow-500 text-white border-amber-700 shadow-lg shadow-yellow-500/40 ${animationClass}`;
      case 256:
        return `${baseStyle} ${textSize} bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-amber-700 shadow-lg shadow-yellow-600/40 ${animationClass}`;
      case 512:
        return `${baseStyle} ${textSize} bg-gradient-to-br from-yellow-600 to-yellow-700 text-white border-amber-700 shadow-lg shadow-yellow-700/40 ${animationClass}`;
      case 1024:
        return `${baseStyle} ${textSize} bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-amber-700 shadow-xl shadow-yellow-600/50 ${animationClass}`;
      case 2048:
        return `${baseStyle} ${textSize} bg-gradient-to-br from-yellow-400 to-yellow-500 text-white border-amber-700 shadow-xl shadow-yellow-500/60 animate-pulse ${animationClass}`;
      case 4096:
        return `${baseStyle} ${textSize} bg-gradient-to-br from-red-500 to-red-600 text-white border-amber-700 shadow-xl shadow-red-600/50 ${animationClass}`;
      case 8192:
        return `${baseStyle} ${textSize} bg-gradient-to-br from-red-600 to-red-700 text-white border-amber-700 shadow-xl shadow-red-700/50 ${animationClass}`;
      default:
        return `${baseStyle} ${textSize} bg-gradient-to-br from-red-600 to-red-800 text-white border-amber-700 shadow-xl shadow-red-800/50 ${animationClass}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white flex flex-col justify-center items-center px-4 py-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-orange-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col items-center">
        {/* Title - Always Centered */}
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
            2048
          </h1>
          <div className="text-amber-300/70 text-sm lg:text-base mt-2 lg:mt-3 font-medium tracking-wide">
            Join the numbers and get to the 2048 tile!
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden w-full max-w-md mx-auto font-sans space-y-6">
          {/* Scores */}
          <div className="flex justify-center gap-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl px-4 py-3 shadow-2xl border border-slate-700/50 backdrop-blur-sm flex-1 max-w-32 text-center">
              <div className="text-xs text-amber-400 font-semibold tracking-wider uppercase">
                Score
              </div>
              <div className="text-xl sm:text-2xl font-black text-white bg-gradient-to-r from-white to-amber-100 bg-clip-text">
                {score.toLocaleString()}
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl px-4 py-3 shadow-2xl border border-slate-700/50 backdrop-blur-sm flex-1 max-w-32 text-center">
              <div className="text-xs text-emerald-400 font-semibold tracking-wider uppercase">
                Best
              </div>
              <div className="text-xl sm:text-2xl font-black text-white bg-gradient-to-r from-white to-emerald-100 bg-clip-text">
                {highScore.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Game Board */}
          <div className="flex justify-center">
            <div
              className="p-3 sm:p-4 grid grid-cols-4 gap-2 sm:gap-3 rounded-2xl shadow-2xl backdrop-blur-sm border border-slate-600/30"
              style={{
                background:
                  "linear-gradient(145deg, rgba(45, 45, 45, 0.9) 0%, rgba(31, 31, 31, 0.9) 100%)",
                width: "min(90vw, 320px)",
                aspectRatio: "1 / 1",
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {board.map((row, rowIndex) =>
                row.map((value, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={getTileStyle(value, rowIndex, colIndex)}
                    style={{
                      border: "3px solid rgba(75, 85, 99, 0.6)",
                    }}
                  >
                    {value !== 0 && (
                      <span className="drop-shadow-sm">{value}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-3 text-xl font-bold text-white">
              <div></div>
              <button
                onClick={moveUp}
                disabled={gameOver}
                className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 rounded-lg shadow-lg border border-gray-600 hover:border-amber-400 transition-all duration-200 hover:scale-110 hover:shadow-amber-500/30 backdrop-blur-sm"
              >
                ↑
              </button>
              <div></div>
              <button
                onClick={moveLeft}
                disabled={gameOver}
                className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 rounded-lg shadow-lg border border-gray-600 hover:border-amber-400 transition-all duration-200 hover:scale-110 hover:shadow-amber-500/30 backdrop-blur-sm"
              >
                ←
              </button>
              <button
                onClick={moveDown}
                disabled={gameOver}
                className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 rounded-lg shadow-lg border border-gray-600 hover:border-amber-400 transition-all duration-200 hover:scale-110 hover:shadow-amber-500/30 backdrop-blur-sm"
              >
                ↓
              </button>
              <button
                onClick={moveRight}
                disabled={gameOver}
                className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 rounded-lg shadow-lg border border-gray-600 hover:border-amber-400 transition-all duration-200 hover:scale-110 hover:shadow-amber-500/30 backdrop-blur-sm"
              >
                →
              </button>
            </div>
          </div>

          {/* Game Over Text */}
          {gameOver && !showGameOverPopup && (
            <div className="text-red-400 font-bold text-base bg-red-900/20 px-6 py-3 rounded-lg border border-red-500/30 backdrop-blur-sm animate-pulse text-center">
              🎮 Game Over! No more moves available.
            </div>
          )}

          {/* Reset Button */}
          <div className="flex justify-center">
            <button
              onClick={initializeGame}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 px-8 rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-amber-500/40 border border-amber-500/50 backdrop-blur-sm"
            >
              <span className="flex items-center gap-3 text-lg">
                🔄 <span>New Game</span>
              </span>
            </button>
          </div>

          {/* Instructions */}
          <div className="text-center text-amber-300/80 text-sm leading-relaxed bg-slate-900/30 rounded-lg p-4 border border-amber-500/20 backdrop-blur-sm mx-4">
            <p className="mb-1">
              🎯 <strong>Use arrow keys, buttons, or swipe</strong> to move
              tiles
            </p>
            <p>
              ✨ When two tiles with the same number touch, they merge into one!
            </p>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-start justify-center gap-8 xl:gap-12 font-sans w-full max-w-6xl">
          {/* Left Side - Scores and Controls */}
          <div className="flex flex-col items-center space-y-8 min-w-64">
            {/* Scores */}
            <div className="flex flex-col gap-6 w-full">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl px-8 py-6 shadow-2xl border border-slate-700/50 backdrop-blur-sm text-center">
                <div className="text-sm text-amber-400 font-semibold tracking-wider uppercase">
                  Current Score
                </div>
                <div className="text-4xl font-black text-white bg-gradient-to-r from-white to-amber-100 bg-clip-text">
                  {score.toLocaleString()}
                </div>
              </div>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl px-8 py-6 shadow-2xl border border-slate-700/50 backdrop-blur-sm text-center">
                <div className="text-sm text-emerald-400 font-semibold tracking-wider uppercase">
                  High Score
                </div>
                <div className="text-4xl font-black text-white bg-gradient-to-r from-white to-emerald-100 bg-clip-text">
                  {highScore.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={initializeGame}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 px-10 rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-amber-500/40 border border-amber-500/50 backdrop-blur-sm w-full"
            >
              <span className="flex items-center justify-center gap-3 text-lg">
                🔄 <span>New Game</span>
              </span>
            </button>

            {/* Game Over Text */}
            {gameOver && !showGameOverPopup && (
              <div className="text-red-400 font-bold text-lg bg-red-900/20 px-6 py-3 rounded-lg border border-red-500/30 backdrop-blur-sm animate-pulse text-center">
                🎮 Game Over! No more moves available.
              </div>
            )}

            {/* Instructions */}
            <div className="text-center text-amber-300/80 text-sm leading-relaxed bg-slate-900/30 rounded-lg p-6 border border-amber-500/20 backdrop-blur-sm">
              <p className="mb-2">
                🎯 <strong>Use arrow keys or buttons</strong> to move tiles
              </p>
              <p>
                ✨ When two tiles with the same number touch, they merge into
                one!
              </p>
            </div>
          </div>

          {/* Center - Game Board */}
          <div className="flex justify-center">
            <div
              className="p-6 grid grid-cols-4 gap-4 rounded-2xl shadow-2xl backdrop-blur-sm border border-slate-600/30"
              style={{
                background:
                  "linear-gradient(145deg, rgba(45, 45, 45, 0.9) 0%, rgba(31, 31, 31, 0.9) 100%)",
                width: "480px",
                height: "480px",
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {board.map((row, rowIndex) =>
                row.map((value, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={getTileStyle(value, rowIndex, colIndex)}
                    style={{
                      border: "3px solid rgba(75, 85, 99, 0.6)",
                      width: "100px",
                      height: "100px",
                    }}
                  >
                    {value !== 0 && (
                      <span className="drop-shadow-sm">{value}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Side - Control Buttons */}
          <div className="flex flex-col items-center space-y-8 min-w-64">
            <div className="text-center text-amber-300/90 text-lg font-semibold">
              Controls
            </div>

            <div className="grid grid-cols-3 gap-4 text-2xl font-bold text-white">
              <div></div>
              <button
                onClick={moveUp}
                disabled={gameOver}
                className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-xl shadow-lg border border-gray-600 hover:border-amber-400 transition-all duration-200 hover:scale-110 hover:shadow-amber-500/30 backdrop-blur-sm"
              >
                ↑
              </button>
              <div></div>
              <button
                onClick={moveLeft}
                disabled={gameOver}
                className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-xl shadow-lg border border-gray-600 hover:border-amber-400 transition-all duration-200 hover:scale-110 hover:shadow-amber-500/30 backdrop-blur-sm"
              >
                ←
              </button>
              <button
                onClick={moveDown}
                disabled={gameOver}
                className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-xl shadow-lg border border-gray-600 hover:border-amber-400 transition-all duration-200 hover:scale-110 hover:shadow-amber-500/30 backdrop-blur-sm"
              >
                ↓
              </button>
              <button
                onClick={moveRight}
                disabled={gameOver}
                className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-xl shadow-lg border border-gray-600 hover:border-amber-400 transition-all duration-200 hover:scale-110 hover:shadow-amber-500/30 backdrop-blur-sm"
              >
                →
              </button>
            </div>

            <div className="text-center text-amber-300/70 text-sm leading-relaxed bg-slate-900/30 rounded-lg p-4 border border-amber-500/20 backdrop-blur-sm">
              <p className="mb-1">
                ⌨️ <strong>Arrow Keys</strong>
              </p>
              <p>
                🖱️ <strong>Click Buttons</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Win Popup */}
        {showWinPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50">
            <div className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white px-12 py-8 rounded-2xl shadow-2xl text-center border border-yellow-400/50 animate-bounce mx-4">
              <div className="text-6xl mb-4">🎉</div>
              <div className="text-3xl font-bold mb-2">You Win!</div>
              <div className="text-yellow-100 text-lg">You reached 2048!</div>
              <div className="text-yellow-200 text-sm mt-2">
                Keep playing to beat your high score!
              </div>
            </div>
          </div>
        )}

        {/* Game Over Popup */}
        {showGameOverPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50">
            <div className="bg-gradient-to-br from-red-600 to-red-700 text-white px-12 py-8 rounded-2xl shadow-2xl text-center border border-red-500/50 animate-bounce mx-4">
              <div className="text-4xl mb-4">💥</div>
              <div className="text-2xl font-bold mb-2">Game Over!</div>
              <div className="text-red-200">No more moves available</div>
              <div className="text-red-300 text-sm mt-2">
                Final Score: {score.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game2048;
