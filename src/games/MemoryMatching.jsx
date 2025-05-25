import React, { useEffect, useState, useCallback } from "react";
import {
  Star,
  RotateCcw,
  Trophy,
  Clock,
  Target,
  Zap,
  Play,
  Pause,
  Award,
  TrendingUp,
} from "lucide-react";

const initialCards = [
  "fa-diamond",
  "fa-heart",
  "fa-star",
  "fa-bolt",
  "fa-cube",
  "fa-leaf",
  "fa-bicycle",
  "fa-bomb",
  "fa-anchor",
  "fa-plane",
  "fa-rocket",
  "fa-gem",
];

const difficulties = {
  easy: {
    pairs: 6,
    name: "Easy",
    timeBonus: 1.5,
    gridCols: "grid-cols-3 sm:grid-cols-4",
  },
  medium: {
    pairs: 8,
    name: "Medium",
    timeBonus: 1.2,
    gridCols: "grid-cols-4 sm:grid-cols-4",
  },
  hard: {
    pairs: 12,
    name: "Hard",
    timeBonus: 1.0,
    gridCols: "grid-cols-4 sm:grid-cols-6",
  },
};

const shuffle = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// LocalStorage utilities
const getStoredData = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return defaultValue;
  }
};

const setStoredData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error writing to localStorage:", error);
  }
};

const MemoryMatching = () => {
  const [difficulty, setDifficulty] = useState("medium");
  const [cards, setCards] = useState([]);
  const [openedCards, setOpenedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [stars, setStars] = useState(3);
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [win, setWin] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintCards, setHintCards] = useState([]);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    totalTime: 0,
    bestTimes: {
      easy: null,
      medium: null,
      hard: null,
    },
    bestScores: {
      easy: null,
      medium: null,
      hard: null,
    },
  });

  // Load saved stats on component mount
  useEffect(() => {
    const savedStats = getStoredData("memoryGameStats", {
      gamesPlayed: 0,
      gamesWon: 0,
      totalTime: 0,
      bestTimes: {
        easy: null,
        medium: null,
        hard: null,
      },
      bestScores: {
        easy: null,
        medium: null,
        hard: null,
      },
    });
    setGameStats(savedStats);
  }, []);

  // Save stats to localStorage with immediate persistence
  const saveStats = useCallback((newStats) => {
    try {
      // Double-check by reading current data first
      const currentData = getStoredData("memoryGameStats", {
        gamesPlayed: 0,
        gamesWon: 0,
        totalTime: 0,
        bestTimes: { easy: null, medium: null, hard: null },
        bestScores: { easy: null, medium: null, hard: null },
      });

      // Merge with existing data to prevent overwrites
      const mergedStats = {
        gamesPlayed: Math.max(newStats.gamesPlayed, currentData.gamesPlayed),
        gamesWon: Math.max(newStats.gamesWon, currentData.gamesWon),
        totalTime: Math.max(newStats.totalTime, currentData.totalTime),
        bestTimes: {
          easy:
            newStats.bestTimes.easy !== null &&
            currentData.bestTimes.easy !== null
              ? Math.min(newStats.bestTimes.easy, currentData.bestTimes.easy)
              : newStats.bestTimes.easy || currentData.bestTimes.easy,
          medium:
            newStats.bestTimes.medium !== null &&
            currentData.bestTimes.medium !== null
              ? Math.min(
                  newStats.bestTimes.medium,
                  currentData.bestTimes.medium
                )
              : newStats.bestTimes.medium || currentData.bestTimes.medium,
          hard:
            newStats.bestTimes.hard !== null &&
            currentData.bestTimes.hard !== null
              ? Math.min(newStats.bestTimes.hard, currentData.bestTimes.hard)
              : newStats.bestTimes.hard || currentData.bestTimes.hard,
        },
        bestScores: {
          easy:
            newStats.bestScores.easy !== null &&
            currentData.bestScores.easy !== null
              ? Math.max(newStats.bestScores.easy, currentData.bestScores.easy)
              : newStats.bestScores.easy || currentData.bestScores.easy,
          medium:
            newStats.bestScores.medium !== null &&
            currentData.bestScores.medium !== null
              ? Math.max(
                  newStats.bestScores.medium,
                  currentData.bestScores.medium
                )
              : newStats.bestScores.medium || currentData.bestScores.medium,
          hard:
            newStats.bestScores.hard !== null &&
            currentData.bestScores.hard !== null
              ? Math.max(newStats.bestScores.hard, currentData.bestScores.hard)
              : newStats.bestScores.hard || currentData.bestScores.hard,
        },
      };

      setStoredData("memoryGameStats", mergedStats);
      setGameStats(mergedStats);
    } catch (error) {
      console.error("Error saving stats:", error);
      // Fallback: just save the new stats
      setStoredData("memoryGameStats", newStats);
      setGameStats(newStats);
    }
  }, []);

  useEffect(() => {
    resetGame();
  }, [difficulty]);

  useEffect(() => {
    if (gameStarted && !gamePaused && !win) {
      const interval = setInterval(() => setTimer((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [gameStarted, gamePaused, win]);

  useEffect(() => {
    if (openedCards.length === 2) {
      const [first, second] = openedCards;
      if (cards[first]?.icon === cards[second]?.icon) {
        setMatchedCards((prev) => [...prev, first, second]);
        setOpenedCards([]);
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
        setTimeout(() => setOpenedCards([]), 800);
      }
      setMoves((m) => {
        const newMoves = m + 1;
        if (newMoves === 12 || newMoves === 20) {
          setStars((s) => Math.max(1, s - 1));
        }
        return newMoves;
      });
    }
  }, [openedCards, cards]);

  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      setWin(true);
      setGameStarted(false);

      // Calculate score and update stats
      const timeBonus = difficulties[difficulty].timeBonus;
      const score = Math.round(
        ((stars * 1000 + streak * 100) * timeBonus) / Math.max(1, timer / 10)
      );

      // Get current stats from localStorage to ensure we have the latest data
      const currentStats = getStoredData("memoryGameStats", {
        gamesPlayed: 0,
        gamesWon: 0,
        totalTime: 0,
        bestTimes: { easy: null, medium: null, hard: null },
        bestScores: { easy: null, medium: null, hard: null },
      });

      const newStats = {
        ...currentStats,
        gamesPlayed: currentStats.gamesPlayed + 1,
        gamesWon: currentStats.gamesWon + 1,
        totalTime: currentStats.totalTime + timer,
        bestTimes: {
          ...currentStats.bestTimes,
          [difficulty]:
            !currentStats.bestTimes[difficulty] ||
            timer < currentStats.bestTimes[difficulty]
              ? timer
              : currentStats.bestTimes[difficulty],
        },
        bestScores: {
          ...currentStats.bestScores,
          [difficulty]:
            !currentStats.bestScores[difficulty] ||
            score > currentStats.bestScores[difficulty]
              ? score
              : currentStats.bestScores[difficulty],
        },
      };

      // Save to localStorage immediately and update state
      setStoredData("memoryGameStats", newStats);
      setGameStats(newStats);
    }
  }, [matchedCards.length, cards.length, stars, streak, timer, difficulty]);

  const handleCardClick = (index) => {
    if (
      openedCards.length < 2 &&
      !openedCards.includes(index) &&
      !matchedCards.includes(index) &&
      !gamePaused
    ) {
      if (!gameStarted) setGameStarted(true);
      setOpenedCards([...openedCards, index]);
    }
  };

  const resetGame = useCallback(() => {
    const numPairs = difficulties[difficulty].pairs;
    const gameCards = initialCards.slice(0, numPairs);
    const shuffledCards = shuffle([...gameCards, ...gameCards]);

    setCards(shuffledCards.map((icon, index) => ({ icon, id: index })));
    setOpenedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setStars(3);
    setTimer(0);
    setGameStarted(false);
    setGamePaused(false);
    setWin(false);
    setStreak(0);
    setShowHint(false);
    setHintCards([]);
  }, [difficulty]);

  const togglePause = () => {
    setGamePaused(!gamePaused);
  };

  const showHintFunction = () => {
    if (showHint) return;

    const unmatched = cards
      .map((card, index) => ({ ...card, index }))
      .filter((_, index) => !matchedCards.includes(index));

    const randomCard = unmatched[Math.floor(Math.random() * unmatched.length)];
    const matchingCard = unmatched.find(
      (card) => card.icon === randomCard.icon && card.index !== randomCard.index
    );

    if (randomCard && matchingCard) {
      setHintCards([randomCard.index, matchingCard.index]);
      setShowHint(true);
      setTimeout(() => {
        setShowHint(false);
        setHintCards([]);
      }, 2000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const clearAllData = () => {
    const defaultStats = {
      gamesPlayed: 0,
      gamesWon: 0,
      totalTime: 0,
      bestTimes: { easy: null, medium: null, hard: null },
      bestScores: { easy: null, medium: null, hard: null },
    };
    saveStats(defaultStats);
  };

  const getCurrentBestTime = () => gameStats.bestTimes[difficulty];
  const getCurrentBestScore = () => gameStats.bestScores[difficulty];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
            Memory Master
          </h1>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg px-4">
            Challenge your mind and match the cards!
          </p>
        </div>

        {/* Difficulty Selection */}
        <div className="flex justify-center mb-4 sm:mb-6 px-2">
          <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 p-1 rounded-lg w-full max-w-lg">
            <div className="bg-slate-900 rounded-md p-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {Object.entries(difficulties).map(([key, diff]) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={`flex-1 px-2 sm:px-4 py-2 rounded-md font-medium text-xs sm:text-sm transition-all ${
                    difficulty === key
                      ? "bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white"
                      : "text-gray-300 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  {diff.name} ({diff.pairs})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Best Times Display */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-3 sm:p-4 w-full max-w-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <h3 className="text-sm sm:text-base font-semibold">
                Personal Bests ({difficulties[difficulty].name})
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="text-center">
                <div className="text-gray-400">Best Time</div>
                <div className="font-semibold text-green-400">
                  {getCurrentBestTime()
                    ? formatTime(getCurrentBestTime())
                    : "N/A"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Best Score</div>
                <div className="font-semibold text-blue-400">
                  {getCurrentBestScore()
                    ? getCurrentBestScore().toLocaleString()
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mb-4 sm:mb-6 px-2">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-2 flex items-center space-x-1 sm:space-x-2">
            <div className="flex items-center space-x-1 text-yellow-400">
              {Array.from({ length: 3 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 sm:w-5 sm:h-5 ${
                    i < stars ? "fill-current" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-2 flex items-center space-x-1 sm:space-x-2">
            <Target className="w-3 h-3 sm:w-5 sm:h-5 text-blue-400" />
            <span className="text-xs sm:text-sm">Moves: {moves}</span>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-2 flex items-center space-x-1 sm:space-x-2">
            <Clock className="w-3 h-3 sm:w-5 sm:h-5 text-green-400" />
            <span className="text-xs sm:text-sm">
              Time: {formatTime(timer)}
            </span>
          </div>

          {streak > 0 && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-2 flex items-center space-x-1 sm:space-x-2">
              <Zap className="w-3 h-3 sm:w-5 sm:h-5 text-orange-400" />
              <span className="text-xs sm:text-sm">Streak: {streak}</span>
            </div>
          )}
        </div>

        {/* Game Controls */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 px-2">
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center space-x-1 sm:space-x-2"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>New Game</span>
          </button>

          {gameStarted && (
            <button
              onClick={togglePause}
              className="bg-slate-700 hover:bg-slate-600 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center space-x-1 sm:space-x-2"
            >
              {gamePaused ? (
                <Play className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span>{gamePaused ? "Resume" : "Pause"}</span>
            </button>
          )}

          <button
            onClick={showHintFunction}
            disabled={showHint || !gameStarted || gamePaused}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all"
          >
            Hint
          </button>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-4 sm:mb-6 px-2">
          <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 p-3 sm:p-4 md:p-6 rounded-2xl shadow-2xl w-full max-w-2xl">
            <div
              className={`grid ${difficulties[difficulty].gridCols} gap-2 sm:gap-3 md:gap-4`}
            >
              {cards.map((card, index) => {
                const isFlipped =
                  openedCards.includes(index) || matchedCards.includes(index);
                const isHinted = hintCards.includes(index) && showHint;
                const isMatched = matchedCards.includes(index);

                return (
                  <div
                    key={index}
                    className={`card aspect-square rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg md:text-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      isFlipped || isHinted
                        ? isMatched
                          ? "bg-green-400 text-white shadow-lg shadow-green-400/50"
                          : "bg-blue-400 text-white shadow-lg shadow-blue-400/50"
                        : "bg-slate-800 hover:bg-slate-700 shadow-lg"
                    } ${
                      isHinted
                        ? "ring-2 sm:ring-4 ring-yellow-400 ring-opacity-75"
                        : ""
                    } ${gamePaused ? "cursor-not-allowed opacity-50" : ""}`}
                    onClick={() => handleCardClick(index)}
                  >
                    {(isFlipped || isHinted) && (
                      <i
                        className={`fa ${card.icon} ${
                          isMatched ? "animate-pulse" : ""
                        }`}
                      ></i>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Game Statistics */}
        <div className="max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Statistics</span>
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="text-center">
              <div className="text-gray-400">Games Played</div>
              <div className="font-semibold">{gameStats.gamesPlayed}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Games Won</div>
              <div className="font-semibold">{gameStats.gamesWon}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Win Rate</div>
              <div className="font-semibold">
                {gameStats.gamesPlayed > 0
                  ? `${Math.round(
                      (gameStats.gamesWon / gameStats.gamesPlayed) * 100
                    )}%`
                  : "0%"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Total Time</div>
              <div className="font-semibold">
                {formatTime(gameStats.totalTime)}
              </div>
            </div>
          </div>
        </div>

        {/* All Best Times Display */}
        <div className="max-w-md mx-auto bg-slate-800/30 backdrop-blur-sm rounded-lg p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-semibold mb-3 text-center flex items-center justify-center space-x-2">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            <span>All Time Bests</span>
          </h3>
          <div className="space-y-2">
            {Object.entries(difficulties).map(([key, diff]) => (
              <div
                key={key}
                className="flex justify-between items-center text-xs sm:text-sm"
              >
                <span className="font-medium">{diff.name}:</span>
                <div className="flex space-x-4">
                  <span className="text-green-400">
                    {gameStats.bestTimes[key]
                      ? formatTime(gameStats.bestTimes[key])
                      : "N/A"}
                  </span>
                  <span className="text-blue-400">
                    {gameStats.bestScores[key]
                      ? gameStats.bestScores[key].toLocaleString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pause Overlay */}
        {gamePaused && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <div className="bg-slate-800 p-6 sm:p-8 rounded-2xl text-center max-w-sm w-full">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Game Paused
              </h2>
              <button
                onClick={togglePause}
                className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 mx-auto text-sm sm:text-base"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Resume Game</span>
              </button>
            </div>
          </div>
        )}

        {/* Win Modal */}
        {win && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 sm:p-8 rounded-2xl text-center max-w-md w-full mx-4 border border-pink-500/30">
              <div className="text-4xl sm:text-6xl mb-4">
                <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400 mx-auto" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                Victory!
              </h2>
              <div className="space-y-2 mb-6 text-gray-300 text-sm sm:text-base">
                <p>
                  Completed in{" "}
                  <span className="font-semibold text-white">
                    {formatTime(timer)}
                  </span>
                </p>
                <p>
                  Total moves:{" "}
                  <span className="font-semibold text-white">{moves}</span>
                </p>
                <p>
                  Stars earned:{" "}
                  <span className="font-semibold text-white">{stars}/3</span>
                </p>
                <p>
                  Final streak:{" "}
                  <span className="font-semibold text-white">{streak}</span>
                </p>
                <p className="text-yellow-400 font-semibold">
                  Score:{" "}
                  {Math.round(
                    ((stars * 1000 + streak * 100) *
                      difficulties[difficulty].timeBonus) /
                      Math.max(1, timer / 10)
                  ).toLocaleString()}
                </p>
                {timer === getCurrentBestTime() && (
                  <p className="text-green-400 font-bold animate-pulse">
                    🎉 NEW BEST TIME! 🎉
                  </p>
                )}
              </div>
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-lg w-full"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FontAwesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />
    </div>
  );
};

export default MemoryMatching;
