import React, { useState, useEffect, useCallback } from 'react';

const Game2048 = () => {
  const [board, setBoard] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);
  

  // Initialize game
  const initializeGame = useCallback(() => {
    const newBoard = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    
    // Add two initial tiles
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setShowGameOverPopup(false);
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
      const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
      currentBoard[randomTile.r][randomTile.c] = Math.random() < 0.1 ? 4 : 2;
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

  // Slide and merge row
  const slideAndMergeRow = (row) => {
    let newRow = row.filter(num => num !== 0);
    let scoreIncrease = 0;
    
    for (let i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] === newRow[i + 1]) {
        newRow[i] *= 2;
        newRow[i + 1] = 0;
        scoreIncrease += newRow[i];
      }
    }
    
    newRow = newRow.filter(num => num !== 0);
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
      setScore(prevScore => prevScore + totalScoreIncrease);
      
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
      setScore(prevScore => prevScore + totalScoreIncrease);
      
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
      const column = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
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
      setScore(prevScore => prevScore + totalScoreIncrease);
      
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
      const column = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
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
      setScore(prevScore => prevScore + totalScoreIncrease);
      
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
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveDown();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [board, gameOver]);

  // Handle touch events
  const [touchStart, setTouchStart] = useState({ x: null, y: null });

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY
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

  const getTileStyle = (value) => {
    const baseStyle = "w-20 h-20 flex items-center justify-center text-4xl font-bold border-4";
    
    // Exact colors from original CSS
    switch (value) {
      case 0:
        return `${baseStyle} bg-amber-200 border-amber-700`;
      case 2:
        return `${baseStyle} bg-amber-100 text-gray-600 border-amber-700`;
      case 4:
        return `${baseStyle} bg-amber-200 text-gray-600 border-amber-700`;
      case 8:
        return `${baseStyle} bg-orange-400 text-white border-amber-700`;
      case 16:
        return `${baseStyle} bg-orange-500 text-white border-amber-700`;
      case 32:
        return `${baseStyle} bg-orange-600 text-white border-amber-700`;
      case 64:
        return `${baseStyle} bg-red-500 text-white border-amber-700`;
      case 128:
        return `${baseStyle} bg-yellow-400 text-white border-amber-700`;
      case 256:
        return `${baseStyle} bg-yellow-500 text-white border-amber-700`;
      case 512:
        return `${baseStyle} bg-yellow-600 text-white border-amber-700`;
      case 1024:
        return `${baseStyle} bg-yellow-500 text-white border-amber-700 text-3xl`;
      case 2048:
        return `${baseStyle} bg-yellow-400 text-white border-amber-700 text-3xl`;
      case 4096:
        return `${baseStyle} bg-red-500 text-white border-amber-700 text-3xl`;
      case 8192:
        return `${baseStyle} bg-red-600 text-white border-amber-700 text-2xl`;
      default:
        return `${baseStyle} bg-red-600 text-white border-amber-700 text-xl`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-800  to-slate-600" style={{
      background: 'linear-gradient(to bottom, #000000 20%, #0f2027 40%, #203a43 70%, #2c5364 100%)',
      backgroundAttachment: 'fixed'
    }}>

      {/* Game Container - Centered like original */}
      <div className="flex flex-col items-center text-white font-sans">
        
        {/* Game Board - Exact dimensions and styling */}
        <div 
          className="w-96 h-96 p-2 grid grid-cols-4 mt-8"
          style={{
            backgroundColor: '#cdc1b5',
            border: '6px solid #bbada0',
            width: '400px',
            height: '400px'
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {board.map((row, rowIndex) =>
            row.map((value, colIndex) => (
              <div 
                key={`${rowIndex}-${colIndex}`} 
                className={getTileStyle(value)}
                style={{ border: '5px solid #bbada0' }}
              >
                {value !== 0 && value}
              </div>
            ))
          )}
        </div>

        {/* Score - Positioned like original */}
        <div className="mt-8 text-xl font-bold">
          Score: {score}
        </div>

        {/* Reset Button - Positioned like original */}
        <button
          onClick={initializeGame}
          className="mt-2 bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 px-6 rounded transition-colors shadow-lg"
        >
          Reset
        </button>

        {/* Game Over Message */}
        <div className="mt-2 h-8 text-red-400 font-bold">
          {gameOver && !showGameOverPopup && "Game Over! No more moves available."}
        </div>

        {/* Game Over Popup - Exact same styling */}
        {showGameOverPopup && (
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white p-5 rounded-lg z-50 text-2xl text-center"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)'
            }}
          >
            Game Over! No more moves available.
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 text-center text-gray-300 max-w-md px-4">
          <p className="mb-2">Use arrow keys to move tiles. When two tiles with the same number touch, they merge into one!</p>
          <p className="text-sm">On mobile: swipe to move tiles.</p>
        </div>
      </div>
    </div>
  );
};

export default Game2048;