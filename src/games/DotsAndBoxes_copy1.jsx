import React, { useState, useEffect, useCallback } from 'react';
import { User, Users, RotateCcw, Trophy, Gamepad2, Settings, Plus, Minus, Zap } from 'lucide-react';

const DotsAndBoxesGame = () => {
  const [gridSize, setGridSize] = useState(7);
  const [gameMode, setGameMode] = useState('menu'); // 'menu', 'pvp', 'pvc', 'settings'
  const [turn, setTurn] = useState('R'); // 'R' for Red, 'B' for Blue
  const [selectedLines, setSelectedLines] = useState([]);
  const [score, setScore] = useState({ R: 0, B: 0 });
  const [gameStatus, setGameStatus] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [hoveredLine, setHoveredLine] = useState(null);
  const [completedBoxes, setCompletedBoxes] = useState([]);
  const [isComputerThinking, setIsComputerThinking] = useState(false);

  const totalLines = (gridSize * (gridSize - 1)) + ((gridSize - 1) * gridSize);

  // Check if a line is selected
  const isLineSelected = useCallback((lineId) => {
    return selectedLines.includes(lineId);
  }, [selectedLines]);

  // Check if a specific line exists and is selected
  const isLineSelectedByRowCol = useCallback((state, i, j) => {
    if (
      (state === "h" && i >= 0 && i < gridSize && j >= 0 && j < gridSize - 1) ||
      (state === "v" && i >= 0 && i < gridSize - 1 && j >= 0 && j < gridSize)
    ) {
      return isLineSelected(`${state}-${i}-${j}`);
    }
    return false;
  }, [isLineSelected, gridSize]);

  // Check for completed boxes after a line is drawn
  const checkCompletedBoxes = useCallback((lineId, currentSelectedLines) => {
    const [state, i, j] = lineId.split('-');
    const row = parseInt(i);
    const col = parseInt(j);
    const newBoxes = [];

    const isSelected = (id) => currentSelectedLines.includes(id);

    if (state === "v") {
      // Check left box
      if (col > 0 && 
          isSelected(`h-${row}-${col - 1}`) &&
          isSelected(`v-${row}-${col - 1}`) &&
          isSelected(`h-${row + 1}-${col - 1}`)) {
        newBoxes.push(`box-${row}-${col - 1}`);
      }
      
      // Check right box
      if (col < gridSize - 1 &&
          isSelected(`h-${row}-${col}`) &&
          isSelected(`v-${row}-${col + 1}`) &&
          isSelected(`h-${row + 1}-${col}`)) {
        newBoxes.push(`box-${row}-${col}`);
      }
    } else if (state === "h") {
      // Check top box
      if (row > 0 &&
          isSelected(`h-${row - 1}-${col}`) &&
          isSelected(`v-${row - 1}-${col}`) &&
          isSelected(`v-${row - 1}-${col + 1}`)) {
        newBoxes.push(`box-${row - 1}-${col}`);
      }
      
      // Check bottom box
      if (row < gridSize - 1 &&
          isSelected(`h-${row + 1}-${col}`) &&
          isSelected(`v-${row}-${col}`) &&
          isSelected(`v-${row}-${col + 1}`)) {
        newBoxes.push(`box-${row}-${col}`);
      }
    }

    return newBoxes;
  }, [gridSize]);

  // Computer AI - Enhanced strategy
  const getComputerMove = useCallback(() => {
    const availableLines = [];
    
    // Generate all possible lines
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

    // Strategy 1: Complete a box if possible
    const completingMoves = [];
    for (const lineId of availableLines) {
      const testLines = [...selectedLines, lineId];
      const completedBoxes = checkCompletedBoxes(lineId, testLines);
      if (completedBoxes.length > 0) {
        completingMoves.push({ lineId, boxes: completedBoxes.length });
      }
    }
    
    if (completingMoves.length > 0) {
      // Choose move that completes the most boxes
      completingMoves.sort((a, b) => b.boxes - a.boxes);
      return completingMoves[0].lineId;
    }

    // Strategy 2: Avoid giving opponent easy boxes
    const safeLines = availableLines.filter(lineId => {
      const testLines = [...selectedLines, lineId];
      const remainingLines = availableLines.filter(id => id !== lineId);
      
      for (const opponentLineId of remainingLines) {
        const opponentTestLines = [...testLines, opponentLineId];
        const opponentBoxes = checkCompletedBoxes(opponentLineId, opponentTestLines);
        if (opponentBoxes.length > 0) {
          return false;
        }
      }
      return true;
    });

    // Strategy 3: Prefer center moves in early game
    const linesToChooseFrom = safeLines.length > 0 ? safeLines : availableLines;
    if (selectedLines.length < gridSize) {
      const centerLines = linesToChooseFrom.filter(lineId => {
        const [state, i, j] = lineId.split('-');
        const row = parseInt(i);
        const col = parseInt(j);
        const center = Math.floor(gridSize / 2);
        return Math.abs(row - center) <= 1 && Math.abs(col - center) <= 1;
      });
      
      if (centerLines.length > 0) {
        return centerLines[Math.floor(Math.random() * centerLines.length)];
      }
    }

    return linesToChooseFrom[Math.floor(Math.random() * linesToChooseFrom.length)];
  }, [selectedLines, checkCompletedBoxes, gridSize]);

  // Handle line click
  const handleLineClick = useCallback((lineId) => {
    if (isLineSelected(lineId) || gameOver || (gameMode === 'pvc' && turn === 'B' && !isComputerThinking)) {
      return;
    }

    const newSelectedLines = [...selectedLines, lineId];
    const newCompletedBoxes = checkCompletedBoxes(lineId, newSelectedLines);
    
    setSelectedLines(newSelectedLines);
    
    if (newCompletedBoxes.length > 0) {
      setCompletedBoxes(prev => [...prev, ...newCompletedBoxes.map(boxId => ({ id: boxId, player: turn }))]);
      setScore(prev => ({
        ...prev,
        [turn]: prev[turn] + newCompletedBoxes.length
      }));
      // Player gets another turn when completing a box
    } else {
      // Switch turns only if no box was completed
      setTurn(prev => prev === 'R' ? 'B' : 'R');
    }

    // Check for game end
    if (newSelectedLines.length === totalLines) {
      setGameOver(true);
    }
  }, [isLineSelected, selectedLines, checkCompletedBoxes, turn, gameOver, gameMode, isComputerThinking, totalLines]);

  // Computer move effect
  useEffect(() => {
    if (gameMode === 'pvc' && turn === 'B' && !gameOver && selectedLines.length >= 0) {
      setIsComputerThinking(true);
      const timer = setTimeout(() => {
        const computerMove = getComputerMove();
        if (computerMove) {
          handleLineClick(computerMove);
        }
        setIsComputerThinking(false);
      }, Math.random() * 800 + 600); // Random delay between 600-1400ms

      return () => clearTimeout(timer);
    }
  }, [turn, gameMode, gameOver, selectedLines.length, getComputerMove, handleLineClick]);

  // Update game status
  useEffect(() => {
    if (gameOver) {
      if (score.R > score.B) {
        setGameStatus('🎉 Red Player Wins!');
      } else if (score.B > score.R) {
        setGameStatus(gameMode === 'pvc' ? '🤖 Computer Wins!' : '🎉 Blue Player Wins!');
      } else {
        setGameStatus("🤝 It's a Tie!");
      }
    } else {
      const currentPlayer = turn === 'R' ? 'Red Player' : (gameMode === 'pvc' ? 'Computer' : 'Blue Player');
      setGameStatus(isComputerThinking ? '🤖 Computer is thinking...' : `${currentPlayer}'s Turn`);
    }
  }, [gameOver, score, turn, gameMode, isComputerThinking]);

  // Reset game
  const resetGame = () => {
    setTurn('R');
    setSelectedLines([]);
    setScore({ R: 0, B: 0 });
    setGameOver(false);
    setCompletedBoxes([]);
    setIsComputerThinking(false);
    setHoveredLine(null);
  };

  // Start new game
  const startGame = (mode) => {
    resetGame();
    setGameMode(mode);
  };

  // Return to menu
  const backToMenu = () => {
    setGameMode('menu');
    resetGame();
  };

  // Handle grid size change
  const handleGridSizeChange = (newSize) => {
    if (newSize >= 3 && newSize <= 10) {
      setGridSize(newSize);
      resetGame();
    }
  };

  // Calculate responsive grid size
  const getGridDimensions = () => {
    const baseSize = Math.min(600, window.innerWidth - 40);
    const cellSize = Math.max(25, Math.min(50, baseSize / (gridSize * 2 - 1)));
    return {
      containerSize: cellSize * (gridSize * 2 - 1),
      lineWidth: Math.max(2, cellSize * 0.08),
      dotSize: Math.max(8, cellSize * 0.2)
    };
  };

  const gridDimensions = getGridDimensions();

  // Settings Page
  if (gameMode === 'settings') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-600/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-cyan-500/20 max-w-md w-full">
          <div className="text-center mb-8">
            <Settings className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">Game Settings</h1>
            <p className="text-gray-300">Customize your game experience</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-600/20 rounded-2xl p-6 border border-cyan-500/30">
              <label className="block text-cyan-100 font-semibold mb-4">Grid Size</label>
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => handleGridSizeChange(gridSize - 1)}
                  disabled={gridSize <= 3}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                >
                  <Minus className="w-5 h-5" />
                </button>
                
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-cyan-300">{gridSize} × {gridSize}</div>
                  <div className="text-sm text-gray-400 mt-1">{(gridSize-1) * (gridSize-1)} boxes</div>
                </div>
                
                <button
                  onClick={() => handleGridSizeChange(gridSize + 1)}
                  disabled={gridSize >= 10}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-4 text-sm text-gray-400 text-center">
                Range: 3×3 to 10×10
              </div>
            </div>
            
            <button
              onClick={backToMenu}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render menu
  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-600/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-cyan-500/20 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Gamepad2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">Dots & Boxes</h1>
            <p className="text-gray-300">Grid Size: {gridSize}×{gridSize}</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => startGame('pvp')}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
            >
              <Users className="w-6 h-6" />
              Player vs Player
            </button>
            
            <button
              onClick={() => startGame('pvc')}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
            >
              <Zap className="w-6 h-6" />
              Player vs Computer
            </button>
            
            <button
              onClick={() => setGameMode('settings')}
              className="w-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 hover:from-purple-600 hover:via-violet-600 hover:to-indigo-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
            >
              <Settings className="w-6 h-6" />
              Settings
            </button>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-400">
            Create boxes by connecting dots with lines!
          </div>
        </div>
      </div>
    );
  }

  // Render game
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">Dots & Boxes</h1>
          <p className="text-gray-300 text-sm sm:text-base">
            {gameMode === 'pvc' ? 'Player vs Computer' : 'Player vs Player'} • {gridSize}×{gridSize} Grid
          </p>
        </div>

        {/* Game Status and Score */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-4 sm:mb-8 gap-4">
          <div className="bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-600/20 backdrop-blur-xl rounded-2xl px-4 sm:px-6 py-3 border border-cyan-500/30 shadow-lg">
            <p className="text-white text-sm sm:text-lg font-semibold text-center">{gameStatus}</p>
          </div>
          
          <div className="flex gap-3 sm:gap-4">
            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl px-4 sm:px-6 py-3 border border-red-500/30 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
                <span className="text-white font-bold text-sm sm:text-base">Red: {score.R}</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-xl rounded-2xl px-4 sm:px-6 py-3 border border-blue-500/30 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                <span className="text-white font-bold text-sm sm:text-base">
                  {gameMode === 'pvc' ? 'Computer' : 'Blue'}: {score.B}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="flex justify-center mb-4 sm:mb-8">
          <div className="bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-indigo-600/5 backdrop-blur-xl rounded-3xl p-4 sm:p-8 border border-cyan-500/20 shadow-2xl">
            <div 
              className="grid gap-0 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${2 * gridSize - 1}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${2 * gridSize - 1}, minmax(0, 1fr))`,
                width: `${gridDimensions.containerSize}px`,
                height: `${gridDimensions.containerSize}px`
              }}
            >
              {Array.from({ length: gridSize }, (_, row) => (
                Array.from({ length: gridSize }, (_, col) => (
                  <React.Fragment key={`dot-${row}-${col}`}>
                    {/* Dot */}
                    <div 
                      className="bg-gradient-to-br from-gray-300 to-gray-500 rounded-full justify-self-center self-center z-10 shadow-lg"
                      style={{ 
                        gridColumn: col * 2 + 1, 
                        gridRow: row * 2 + 1,
                        width: `${gridDimensions.dotSize}px`,
                        height: `${gridDimensions.dotSize}px`
                      }}
                    />
                    
                    {/* Horizontal line */}
                    {col < gridSize - 1 && (
                      <div
                        className={`rounded-full cursor-pointer transition-all duration-300 justify-self-center self-center shadow-lg ${
                          isLineSelected(`h-${row}-${col}`)
                            ? turn === 'R' && selectedLines[selectedLines.length - 1] === `h-${row}-${col}`
                              ? 'bg-gradient-to-r from-red-400 to-pink-500 shadow-red-500/50'
                              : selectedLines.includes(`h-${row}-${col}`) && completedBoxes.some(box => {
                                  const [, boxRow, boxCol] = box.id.split('-');
                                  return (parseInt(boxRow) === row && (parseInt(boxCol) === col - 1 || parseInt(boxCol) === col)) && box.player === 'R';
                                })
                              ? 'bg-gradient-to-r from-red-400 to-pink-500 shadow-red-500/50'
                              : 'bg-gradient-to-r from-blue-400 to-indigo-500 shadow-blue-500/50'
                            : hoveredLine === `h-${row}-${col}`
                            ? turn === 'R' 
                              ? 'bg-gradient-to-r from-red-300/70 to-pink-300/70 shadow-red-300/30' 
                              : 'bg-gradient-to-r from-blue-300/70 to-indigo-300/70 shadow-blue-300/30'
                            : 'bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 shadow-gray-500/30'
                        }`}
                        style={{ 
                          gridColumn: col * 2 + 2, 
                          gridRow: row * 2 + 1,
                          width: `${Math.max(30, gridDimensions.containerSize / (gridSize * 2 - 1) * 0.8)}px`,
                          height: `${gridDimensions.lineWidth}px`
                        }}
                        onClick={() => handleLineClick(`h-${row}-${col}`)}
                        onMouseEnter={() => !isLineSelected(`h-${row}-${col}`) && setHoveredLine(`h-${row}-${col}`)}
                        onMouseLeave={() => setHoveredLine(null)}
                      />
                    )}
                    
                    {/* Vertical line */}
                    {row < gridSize - 1 && (
                      <div
                        className={`rounded-full cursor-pointer transition-all duration-300 justify-self-center self-center shadow-lg ${
                          isLineSelected(`v-${row}-${col}`)
                            ? turn === 'R' && selectedLines[selectedLines.length - 1] === `v-${row}-${col}`
                              ? 'bg-gradient-to-b from-red-400 to-pink-500 shadow-red-500/50'
                              : selectedLines.includes(`v-${row}-${col}`) && completedBoxes.some(box => {
                                  const [, boxRow, boxCol] = box.id.split('-');
                                  return ((parseInt(boxRow) === row - 1 || parseInt(boxRow) === row) && parseInt(boxCol) === col) && box.player === 'R';
                                })
                              ? 'bg-gradient-to-b from-red-400 to-pink-500 shadow-red-500/50'
                              : 'bg-gradient-to-b from-blue-400 to-indigo-500 shadow-blue-500/50'
                            : hoveredLine === `v-${row}-${col}`
                            ? turn === 'R' 
                              ? 'bg-gradient-to-b from-red-300/70 to-pink-300/70 shadow-red-300/30' 
                              : 'bg-gradient-to-b from-blue-300/70 to-indigo-300/70 shadow-blue-300/30'
                            : 'bg-gradient-to-b from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 shadow-gray-500/30'
                        }`}
                        style={{ 
                          gridColumn: col * 2 + 1, 
                          gridRow: row * 2 + 2,
                          height: `${Math.max(30, gridDimensions.containerSize / (gridSize * 2 - 1) * 0.8)}px`,
                          width: `${gridDimensions.lineWidth}px`
                        }}
                        onClick={() => handleLineClick(`v-${row}-${col}`)}
                        onMouseEnter={() => !isLineSelected(`v-${row}-${col}`) && setHoveredLine(`v-${row}-${col}`)}
                        onMouseLeave={() => setHoveredLine(null)}
                      />
                    )}
                    
                    {/* Box */}
                    {row < gridSize - 1 && col < gridSize - 1 && (
                      <div
                        className={`rounded-lg transition-all duration-500 shadow-lg ${
                          completedBoxes.find(box => box.id === `box-${row}-${col}`)?.player === 'R'
                            ? 'bg-gradient-to-br from-red-400/80 to-pink-500/80 shadow-red-500/50'
                            : completedBoxes.find(box => box.id === `box-${row}-${col}`)?.player === 'B'
                            ? 'bg-gradient-to-br from-blue-400/80 to-indigo-500/80 shadow-blue-500/50'
                            : 'bg-transparent'
                        }`}
                        style={{ 
                          gridColumn: col * 2 + 2, 
                          gridRow: row * 2 + 2,
                          width: `${Math.max(30, gridDimensions.containerSize / (gridSize * 2 - 1) * 0.8)}px`,
                          height: `${Math.max(30, gridDimensions.containerSize / (gridSize * 2 - 1) * 0.8)}px`
                        }}
                      />
                    )}
                  </React.Fragment>
                ))
              )).flat()}
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-sm sm:text-base shadow-lg"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            Reset Game
          </button>
          
          <button
            onClick={backToMenu}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base shadow-lg">
            Back to Menu
          </button>
        </div>

        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-600/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-cyan-500/20 max-w-md w-full text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Game Over!
              </h2>
              <p className="text-xl mb-6 text-white">{gameStatus}</p>
              
              <div className="flex justify-center gap-4 mb-6">
                <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl px-4 py-2 border border-red-500/30">
                  <span className="text-red-300 font-semibold">Red: {score.R}</span>
                </div>
                <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl px-4 py-2 border border-blue-500/30">
                  <span className="text-blue-300 font-semibold">
                    {gameMode === 'pvc' ? 'Computer' : 'Blue'}: {score.B}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={resetGame}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Play Again
                </button>
                <button
                  onClick={backToMenu}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Main Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DotsAndBoxesGame;