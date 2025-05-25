import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RotateCcw, Flag, Zap, Trophy, Clock, Bomb, Smile, Frown } from 'lucide-react';
import { FaSurprise } from 'react-icons/fa';

const Minesweeper = () => {
  const [difficulty, setDifficulty] = useState('medium');
  const [gameState, setGameState] = useState('playing');
  const [board, setBoard] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [mineCount, setMineCount] = useState(0);
  const [time, setTime] = useState(0);
  const [firstClick, setFirstClick] = useState(true);
  const [score, setScore] = useState(0);
  const [bestTimes, setBestTimes] = useState({ easy: null, medium: null, hard: null });
  const [cellSize, setCellSize] = useState('medium');

  const difficulties = {
    easy: { rows: 9, cols: 9, mines: 10, name: 'Beginner' },
    medium: { rows: 16, cols: 16, mines: 40, name: 'Intermediate' },
    hard: { rows: 16, cols: 30, mines: 99, name: 'Expert' }
  };

  const config = difficulties[difficulty];

  // Responsive cell sizing
  useEffect(() => {
    const updateCellSize = () => {
      const screenWidth = window.innerWidth;
      const maxCellWidth = Math.floor((screenWidth - 100) / config.cols);
      
      if (maxCellWidth < 25) setCellSize('small');
      else if (maxCellWidth < 35) setCellSize('medium');
      else setCellSize('large');
    };

    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, [config.cols]);

  const cellSizeClasses = {
    small: 'w-5 h-5 text-xs',
    medium: 'w-7 h-7 text-sm',
    large: 'w-9 h-9 text-base'
  };

  const initializeBoard = useCallback(() => {
    const newBoard = Array(config.rows).fill().map(() => Array(config.cols).fill(0));
    const newRevealed = Array(config.rows).fill().map(() => Array(config.cols).fill(false));
    const newFlagged = Array(config.rows).fill().map(() => Array(config.cols).fill(false));
    
    setBoard(newBoard);
    setRevealed(newRevealed);
    setFlagged(newFlagged);
    setMineCount(config.mines);
    setGameState('playing');
    setTime(0);
    setFirstClick(true);
    setScore(0);
  }, [config]);

  const placeMines = useCallback((firstRow, firstCol) => {
    const newBoard = Array(config.rows).fill().map(() => Array(config.cols).fill(0));
    let minesPlaced = 0;
    const excludeZone = new Set();
    
    // Exclude first click and surrounding cells for better UX
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        const nr = firstRow + r;
        const nc = firstCol + c;
        if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
          excludeZone.add(`${nr}-${nc}`);
        }
      }
    }
    
    while (minesPlaced < config.mines) {
      const row = Math.floor(Math.random() * config.rows);
      const col = Math.floor(Math.random() * config.cols);
      const key = `${row}-${col}`;
      
      if (newBoard[row][col] !== -1 && !excludeZone.has(key)) {
        newBoard[row][col] = -1;
        minesPlaced++;
        
        // Update adjacent cell counts
        for (let r = -1; r <= 1; r++) {
          for (let c = -1; c <= 1; c++) {
            const newRow = row + r;
            const newCol = col + c;
            if (newRow >= 0 && newRow < config.rows && newCol >= 0 && newCol < config.cols && newBoard[newRow][newCol] !== -1) {
              newBoard[newRow][newCol]++;
            }
          }
        }
      }
    }
    
    setBoard(newBoard);
    return newBoard;
  }, [config]);

  const revealCell = useCallback((row, col, currentBoard, currentRevealed) => {
    if (row < 0 || row >= config.rows || col < 0 || col >= config.cols || 
        currentRevealed[row][col] || flagged[row][col]) {
      return;
    }
    
    currentRevealed[row][col] = true;
    
    // Auto-reveal adjacent cells if current cell has no adjacent mines
    if (currentBoard[row][col] === 0) {
      for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
          revealCell(row + r, col + c, currentBoard, currentRevealed);
        }
      }
    }
  }, [config, flagged]);

  const handleCellClick = useCallback((row, col) => {
    if (gameState !== 'playing' || flagged[row][col] || revealed[row][col]) return;
    
    let currentBoard = board;
    
    if (firstClick) {
      currentBoard = placeMines(row, col);
      setFirstClick(false);
    }
    
    // Check if clicked on mine
    if (currentBoard[row][col] === -1) {
      setGameState('lost');
      const newRevealed = revealed.map(row => [...row]);
      
      // Reveal all mines
      for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
          if (currentBoard[r][c] === -1) {
            newRevealed[r][c] = true;
          }
        }
      }
      setRevealed(newRevealed);
      return;
    }
    
    // Reveal cell(s)
    const newRevealed = revealed.map(row => [...row]);
    revealCell(row, col, currentBoard, newRevealed);
    setRevealed(newRevealed);
    
    // Check win condition
    const revealedCount = newRevealed.flat().filter(Boolean).length;
    const totalNonMines = config.rows * config.cols - config.mines;
    
    if (revealedCount === totalNonMines) {
      setGameState('won');
      const finalScore = Math.max(2000 - time * 5 + (config.mines * 10), 100);
      setScore(finalScore);
      
      // Update best time
      if (!bestTimes[difficulty] || time < bestTimes[difficulty]) {
        setBestTimes(prev => ({ ...prev, [difficulty]: time }));
      }
    }
  }, [gameState, flagged, revealed, board, firstClick, placeMines, revealCell, config, time, bestTimes, difficulty]);

  const handleRightClick = useCallback((e, row, col) => {
    e.preventDefault();
    if (gameState !== 'playing' || revealed[row][col]) return;
    
    const newFlagged = flagged.map(row => [...row]);
    newFlagged[row][col] = !newFlagged[row][col];
    setFlagged(newFlagged);
    
    const flagCount = newFlagged.flat().filter(Boolean).length;
    setMineCount(config.mines - flagCount);
  }, [gameState, revealed, flagged, config.mines]);

  const handleDoubleClick = useCallback((row, col) => {
    if (gameState !== 'playing' || !revealed[row][col] || board[row][col] <= 0) return;
    
    // Count adjacent flags
    let adjacentFlags = 0;
    const adjacentCells = [];
    
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols && !(r === 0 && c === 0)) {
          adjacentCells.push([nr, nc]);
          if (flagged[nr][nc]) adjacentFlags++;
        }
      }
    }
    
    // If flags match number, reveal all unflagged adjacent cells
    if (adjacentFlags === board[row][col]) {
      adjacentCells.forEach(([r, c]) => {
        if (!flagged[r][c] && !revealed[r][c]) {
          handleCellClick(r, c);
        }
      });
    }
  }, [gameState, revealed, board, flagged, config, handleCellClick]);

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  useEffect(() => {
    let interval;
    if (gameState === 'playing' && !firstClick) {
      interval = setInterval(() => setTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, firstClick]);

  const getCellContent = (row, col) => {
    if (flagged[row][col]) {
      return <Flag className={`${cellSize === 'small' ? 'w-3 h-3' : cellSize === 'medium' ? 'w-4 h-4' : 'w-5 h-5'} text-red-400`} />;
    }
    if (!revealed[row][col]) return '';
    if (board[row][col] === -1) {
      return <Bomb className={`${cellSize === 'small' ? 'w-3 h-3' : cellSize === 'medium' ? 'w-4 h-4' : 'w-5 h-5'} text-red-500`} />;
    }
    if (board[row][col] === 0) return '';
    return board[row][col];
  };

  const getCellClass = (row, col) => {
    const baseClass = `${cellSizeClasses[cellSize]} flex items-center justify-center font-bold transition-all duration-200 border border-slate-500/20 rounded-sm cursor-pointer select-none`;
    
    if (!revealed[row][col]) {
      if (flagged[row][col]) {
        return `${baseClass} bg-gradient-to-br from-amber-600/80 via-orange-700/80 to-red-800/80 hover:from-amber-500/80 hover:via-orange-600/80 hover:to-red-700/80 shadow-lg hover:shadow-xl transform hover:scale-105`;
      }
      return `${baseClass} bg-gradient-to-br from-slate-600 via-zinc-700 to-slate-800 hover:from-slate-500 hover:via-zinc-600 hover:to-slate-700 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95`;
    }
    
    if (board[row][col] === -1) {
      return `${baseClass} bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white animate-pulse shadow-lg`;
    }
    
    const numberColors = {
      1: 'text-blue-400 font-bold',
      2: 'text-green-400 font-bold',
      3: 'text-red-400 font-bold',
      4: 'text-purple-400 font-bold',
      5: 'text-yellow-400 font-bold',
      6: 'text-pink-400 font-bold',
      7: 'text-gray-300 font-bold',
      8: 'text-gray-500 font-bold'
    };
    
    return `${baseClass} bg-gradient-to-br from-slate-700/50 via-slate-800/50 to-slate-900/50 ${numberColors[board[row][col]] || 'text-gray-300'} hover:bg-gradient-to-br hover:from-slate-600/50 hover:via-slate-700/50 hover:to-slate-800/50`;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getGameIcon = () => {
    if (gameState === 'won') return <Smile className="w-6 h-6 text-green-400" />;
    if (gameState === 'lost') return <Frown className="w-6 h-6 text-red-400" />;
    return <FaSurprise className="w-6 h-6 text-yellow-400" />;
  };

  const flaggedCount = useMemo(() => 
    flagged.flat().filter(Boolean).length
  , [flagged]);

  const progressPercentage = useMemo(() => {
    if (gameState !== 'playing') return gameState === 'won' ? 100 : 0;
    const totalCells = config.rows * config.cols - config.mines;
    const revealedCells = revealed.flat().filter(Boolean).length;
    return Math.round((revealedCells / totalCells) * 100);
  }, [gameState, config, revealed]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            {getGameIcon()}
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Elite Minesweeper
            </h1>
            {getGameIcon()}
          </div>
          
          {/* Difficulty Selection */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {Object.entries(difficulties).map(([key, diff]) => (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  difficulty === key
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg transform scale-105 ring-2 ring-purple-400/50'
                    : 'bg-gradient-to-br from-slate-600 via-zinc-700 to-slate-800 hover:from-slate-500 hover:via-zinc-600 hover:to-slate-700 hover:scale-105'
                }`}
              >
                <div className="text-sm font-bold">{diff.name}</div>
                <div className="text-xs opacity-80">{diff.rows}×{diff.cols} • {diff.mines} mines</div>
              </button>
            ))}
          </div>
        </div>

        {/* Game Stats */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
          <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-br from-slate-600 via-zinc-700 to-slate-800 rounded-xl shadow-lg">
            <Bomb className="w-5 h-5 text-red-400" />
            <div className="text-center">
              <div className="text-xs text-slate-300">Mines</div>
              <div className="font-bold text-lg">{mineCount}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-br from-slate-600 via-zinc-700 to-slate-800 rounded-xl shadow-lg">
            <Clock className="w-5 h-5 text-blue-400" />
            <div className="text-center">
              <div className="text-xs text-slate-300">Time</div>
              <div className="font-bold text-lg">{formatTime(time)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-br from-slate-600 via-zinc-700 to-slate-800 rounded-xl shadow-lg">
            <Flag className="w-5 h-5 text-yellow-400" />
            <div className="text-center">
              <div className="text-xs text-slate-300">Flags</div>
              <div className="font-bold text-lg">{flaggedCount}</div>
            </div>
          </div>
          
          {gameState === 'won' && (
            <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-br from-yellow-600 via-orange-700 to-red-800 rounded-xl shadow-lg animate-pulse">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div className="text-center">
                <div className="text-xs text-yellow-200">Score</div>
                <div className="font-bold text-lg">{score}</div>
              </div>
            </div>
          )}
          
          <button
            onClick={initializeBoard}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-br from-green-600 via-green-700 to-green-800 hover:from-green-500 hover:via-green-600 hover:to-green-700 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="font-bold">New Game</span>
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Best Times */}
        {Object.values(bestTimes).some(time => time !== null) && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-br from-slate-700/50 via-slate-800/50 to-slate-900/50 rounded-xl backdrop-blur-sm">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div className="text-sm">
                <span className="text-slate-300">Best Times: </span>
                {Object.entries(bestTimes).map(([diff, time]) => 
                  time && (
                    <span key={diff} className="text-yellow-400 font-bold mx-2">
                      {difficulties[diff].name}: {formatTime(time)}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Game Status Messages */}
        {gameState === 'won' && (
          <div className="mb-6 p-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl backdrop-blur-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400 mb-2 animate-bounce">🎉 Victory! 🎉</p>
              <p className="text-green-300 mb-2">Congratulations! You've cleared the minefield!</p>
              <div className="flex justify-center gap-6 text-sm">
                <span>Score: <strong className="text-yellow-400">{score}</strong></span>
                <span>Time: <strong className="text-blue-400">{formatTime(time)}</strong></span>
                <span>Difficulty: <strong className="text-purple-400">{config.name}</strong></span>
              </div>
            </div>
          </div>
        )}
        
        {gameState === 'lost' && (
          <div className="mb-6 p-6 bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400 mb-2">💥 Game Over 💥</p>
              <p className="text-red-300">You hit a mine! Better luck next time!</p>
            </div>
          </div>
        )}
        
        {/* Game Board */}
        <div className="flex justify-center">
          <div className="p-6 bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 rounded-2xl border border-slate-700/50 backdrop-blur-md shadow-2xl">
            <div 
              className="grid gap-1 select-none"
              style={{
                gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
              }}
            >
              {board.map((row, rowIndex) =>
                row.map((_, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    className={getCellClass(rowIndex, colIndex)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
                    onDoubleClick={() => handleDoubleClick(rowIndex, colIndex)}
                    disabled={gameState !== 'playing'}
                  >
                    {getCellContent(rowIndex, colIndex)}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="max-w-2xl mx-auto p-4 bg-gradient-to-br from-slate-700/30 via-slate-800/30 to-slate-900/30 rounded-xl backdrop-blur-sm border border-slate-600/30">
            <p className="text-sm text-slate-300 mb-3">
              <strong className="text-white">How to Play:</strong>
            </p>
            <div className="grid md:grid-cols-2 gap-3 text-xs text-slate-400">
              <div>• Left click to reveal cells</div>
              <div>• Right click to place/remove flags</div>
              <div>• Double click revealed numbers to auto-clear</div>
              <div>• Flag all mines to win</div>
            </div>
            <div className="flex justify-center items-center gap-2 mt-4 text-xs text-slate-500">
              <Zap className="w-4 h-4" />
              <span>Pro tip: Double-click numbers when you've flagged all adjacent mines!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Minesweeper;