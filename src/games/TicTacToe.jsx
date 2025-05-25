import { useState, useEffect } from "react";
import { RotateCcw, Trophy, Users, Bot, Settings, Info } from "lucide-react";

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameMode, setGameMode] = useState("pvp");
  const [gameStatus, setGameStatus] = useState("playing");
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [showCelebration, setShowCelebration] = useState(false);

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  const checkWinner = (currentBoard) => {
    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return { winner: currentBoard[a], line: combination };
      }
    }
    return null;
  };

  const getAvailableMoves = (board) => {
    return board
      .map((cell, index) => (cell === null ? index : null))
      .filter((val) => val !== null);
  };

  const minimax = (board, depth, isMaximizing) => {
    const result = checkWinner(board);

    if (result) {
      return result.winner === "O" ? 10 - depth : depth - 10;
    }

    if (getAvailableMoves(board).length === 0) {
      return 0;
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let move of getAvailableMoves(board)) {
        const newBoard = [...board];
        newBoard[move] = "O";
        const evalScore = minimax(newBoard, depth + 1, false);
        maxEval = Math.max(maxEval, evalScore);
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let move of getAvailableMoves(board)) {
        const newBoard = [...board];
        newBoard[move] = "X";
        const evalScore = minimax(newBoard, depth + 1, true);
        minEval = Math.min(minEval, evalScore);
      }
      return minEval;
    }
  };

  const getBestMove = (board) => {
    let bestMove = -1;
    let bestValue = -Infinity;

    for (let move of getAvailableMoves(board)) {
      const newBoard = [...board];
      newBoard[move] = "O";
      const moveValue = minimax(newBoard, 0, false);

      if (moveValue > bestValue) {
        bestValue = moveValue;
        bestMove = move;
      }
    }

    return bestMove;
  };

  const makeComputerMove = () => {
    const availableMoves = getAvailableMoves(board);
    if (availableMoves.length === 0) return;

    const computerMove = getBestMove(board);
    const newBoard = [...board];
    newBoard[computerMove] = "O";
    setBoard(newBoard);
    setIsXNext(true);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setGameStatus("won");
      setScores((prev) => ({
        ...prev,
        [result.winner]: prev[result.winner] + 1,
      }));
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    } else if (newBoard.every((cell) => cell !== null)) {
      setGameStatus("draw");
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
    }
  };

  useEffect(() => {
    if (gameMode === "computer" && !isXNext && gameStatus === "playing") {
      const timer = setTimeout(() => {
        makeComputerMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [board, isXNext, gameMode, gameStatus]);

  const handleCellClick = (index) => {
    if (board[index] || gameStatus !== "playing") return;
    if (gameMode === "computer" && !isXNext) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setGameStatus("won");
      setScores((prev) => ({
        ...prev,
        [result.winner]: prev[result.winner] + 1,
      }));
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    } else if (newBoard.every((cell) => cell !== null)) {
      setGameStatus("draw");
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameStatus("playing");
    setWinner(null);
    setWinningLine([]);
    setShowCelebration(false);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 });
  };

  const switchGameMode = (mode) => {
    setGameMode(mode);
    resetGame();
  };

  const getStatusMessage = () => {
    if (gameStatus === "won") {
      return gameMode === "computer" && winner === "O"
        ? "Computer Wins!"
        : `Player ${winner} Wins!`;
    }
    if (gameStatus === "draw") return "It's a Draw!";
    if (gameMode === "computer") {
      return isXNext ? "Your Turn" : "Computer is thinking...";
    }
    return `Player ${isXNext ? "X" : "O"}'s Turn`;
  };

  const totalGames = scores.X + scores.O + scores.draws;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent mb-2 sm:mb-4">
            Tic Tac Toe
          </h1>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            Challenge your mind with the ultimate strategy game. Play against
            friends or test your skills against our computer.
          </p>
        </div>

        {/* Game Mode Selector */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 px-2">
          <button
            onClick={() => switchGameMode("pvp")}
            className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${
              gameMode === "pvp"
                ? "bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600 shadow-lg shadow-purple-500/25 scale-105"
                : "bg-slate-800/80 hover:bg-slate-700 border border-slate-600 hover:border-purple-400"
            }`}
          >
            <Users size={18} />
            <span className="hidden sm:inline">Player vs Player</span>
            <span className="sm:hidden">PvP</span>
          </button>
          <button
            onClick={() => switchGameMode("computer")}
            className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${
              gameMode === "computer"
                ? "bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600 shadow-lg shadow-purple-500/25 scale-105"
                : "bg-slate-800/80 hover:bg-slate-700 border border-slate-600 hover:border-purple-400"
            }`}
          >
            <Bot size={18} />
            <span className="hidden sm:inline">Player vs Computer</span>
            <span className="sm:hidden">PvC</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Game Board */}
          <div className="xl:col-span-3 order-2 xl:order-1">
            <div className="bg-slate-900/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 backdrop-blur-sm border border-slate-700/50 shadow-2xl">
              {/* Status */}
              <div className="text-center mb-4 sm:mb-6">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                  {gameStatus === "won" && (
                    <Trophy
                      className="text-yellow-400 animate-bounce"
                      size={20}
                    />
                  )}
                  {gameMode === "computer" &&
                    !isXNext &&
                    gameStatus === "playing" && (
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                    )}
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                    {getStatusMessage()}
                  </h2>
                </div>

                {gameStatus === "playing" && (
                  <div className="w-full bg-slate-700/50 rounded-full h-2 sm:h-3 max-w-md mx-auto">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-violet-500 h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${
                          ((9 - board.filter((cell) => cell === null).length) /
                            9) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Board */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 w-full max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg">
                  {board.map((cell, index) => (
                    <button
                      key={index}
                      onClick={() => handleCellClick(index)}
                      disabled={
                        gameStatus !== "playing" ||
                        cell !== null ||
                        (gameMode === "computer" && !isXNext)
                      }
                      className={`
                        aspect-square bg-slate-800/60 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 
                        flex items-center justify-center hover:scale-105 active:scale-95 
                        backdrop-blur-sm relative overflow-hidden group
                        ${
                          winningLine.includes(index)
                            ? "border-yellow-400 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 shadow-lg shadow-yellow-400/25 animate-pulse"
                            : cell === null &&
                              gameStatus === "playing" &&
                              (gameMode !== "computer" || isXNext)
                            ? "border-slate-600 hover:border-purple-400 hover:bg-slate-700/80 hover:shadow-lg hover:shadow-purple-500/10"
                            : "border-slate-600/50"
                        }
                        ${
                          cell
                            ? "cursor-default"
                            : gameStatus === "playing" &&
                              (gameMode !== "computer" || isXNext)
                            ? "cursor-pointer"
                            : "cursor-not-allowed"
                        }
                        ${
                          gameStatus !== "playing" ||
                          (gameMode === "computer" && !isXNext)
                            ? "opacity-75"
                            : ""
                        }
                      `}
                    >
                      {/* Hover effect */}
                      {!cell &&
                        gameStatus === "playing" &&
                        (gameMode !== "computer" || isXNext) && (
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                      {cell && (
                        <span
                          className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold transition-all duration-500 transform select-none ${
                            cell === "X"
                              ? "text-purple-300 drop-shadow-2xl"
                              : "text-violet-300 drop-shadow-2xl"
                          } ${
                            showCelebration && winningLine.includes(index)
                              ? "animate-pulse scale-110"
                              : ""
                          }`}
                        >
                          {cell}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <button
                  onClick={resetGame}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600 rounded-xl sm:rounded-2xl font-semibold hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 text-sm sm:text-base"
                >
                  <RotateCcw size={18} />
                  New Game
                </button>
                <button
                  onClick={resetScores}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-slate-700/80 rounded-xl sm:rounded-2xl font-semibold hover:bg-slate-600 hover:scale-105 active:scale-95 transition-all duration-300 border border-slate-600 text-sm sm:text-base"
                >
                  Reset Scores
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 my-auto sm:space-y-6 order-1 xl:order-2">
            {/* Scoreboard */}
            <div className="bg-slate-900/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 backdrop-blur-sm border border-slate-700/50 shadow-xl">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-400" size={20} />
                Scoreboard
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-800/60 rounded-lg sm:rounded-xl backdrop-blur-sm border border-slate-700/30">
                  <span className="font-semibold text-purple-300 text-sm sm:text-base">
                    Player X
                  </span>
                  <span className="text-xl sm:text-2xl font-bold">
                    {scores.X}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-800/60 rounded-lg sm:rounded-xl backdrop-blur-sm border border-slate-700/30">
                  <span className="font-semibold text-violet-300 text-sm sm:text-base">
                    {gameMode === "computer" ? "Computer (O)" : "Player O"}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold">
                    {scores.O}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-800/60 rounded-lg sm:rounded-xl backdrop-blur-sm border border-slate-700/30">
                  <span className="font-semibold text-gray-400 text-sm sm:text-base">
                    Draws
                  </span>
                  <span className="text-xl sm:text-2xl font-bold">
                    {scores.draws}
                  </span>
                </div>
              </div>

              {totalGames > 0 && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700/50">
                  <div className="text-xs sm:text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>Total Games:</span>
                      <span className="font-semibold">{totalGames}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Win Celebration Overlay */}
        {showCelebration && gameStatus === "won" && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-slate-900 to-purple-900/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center border border-purple-500/30 shadow-2xl shadow-purple-500/25 max-w-sm w-full backdrop-blur-sm animate-bounce">
              <Trophy
                className="text-yellow-400 mx-auto mb-4 animate-bounce"
                size={48}
              />
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {getStatusMessage()}
              </h2>
              <p className="text-gray-400 mb-4">
                Congratulations on your victory!
              </p>

              {gameMode === "computer" && winner === "X" && (
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-3 border border-green-500/30">
                  <p className="text-green-400 text-sm font-medium">
                    You defeated the computer! 🎉
                  </p>
                </div>
              )}

              {gameMode === "computer" && winner === "O" && (
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-3 border border-blue-500/30">
                  <p className="text-blue-400 text-sm font-medium">
                    Computer wins this round! Try again? 🤖
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Draw Celebration */}
        {showCelebration && gameStatus === "draw" && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-slate-900 to-orange-900/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center border border-orange-500/30 shadow-2xl shadow-orange-500/25 max-w-sm w-full backdrop-blur-sm">
              <div className="text-6xl mb-4">🤝</div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                It's a Draw!
              </h2>
              <p className="text-gray-400">
                Great game, well played by both sides!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicTacToe;
