import React, { useState, useEffect } from "react";
import {
  Zap,
  Hand,
  FileText,
  Scissors,
  RotateCcw,
  Trophy,
  Target,
} from "lucide-react";
import { GiStoneBlock } from "react-icons/gi";

function MyComponent() {
  return (
    <div>
      <h3>
        Have a <GiStoneBlock /> on me!
      </h3>
    </div>
  );
}

const choicesData = [
  { id: "rock", icon: GiStoneBlock, name: "Rock" },
  { id: "paper", icon: FileText, name: "Paper" },
  { id: "scissors", icon: Scissors, name: "Scissors" },
];

const getCompChoice = () => {
  const options = ["rock", "paper", "scissors"];
  const index = Math.floor(Math.random() * 3);
  return options[index];
};

const RockPaperScissors = () => {
  const [userScore, setUserScore] = useState(0);
  const [compScore, setCompScore] = useState(0);
  const [userChoice, setUserChoice] = useState(null);
  const [compChoice, setCompChoice] = useState(null);
  const [message, setMessage] = useState("Choose your weapon!");
  const [showResult, setShowResult] = useState(false);
  const [gameResult, setGameResult] = useState(null); // 'win', 'lose', 'draw'
  const [isAnimating, setIsAnimating] = useState(false);

  const getChoiceIcon = (choiceId) => {
    const choice = choicesData.find((c) => c.id === choiceId);
    return choice ? choice.icon : Hand;
  };

  const playGame = (choice) => {
    setIsAnimating(true);
    const computerChoice = getCompChoice();

    // Simulate thinking time
    setTimeout(() => {
      setUserChoice(choice);
      setCompChoice(computerChoice);
      setShowResult(true);
      setIsAnimating(false);

      if (choice === computerChoice) {
        setMessage("It's a tie! Great minds think alike.");
        setGameResult("draw");
      } else {
        let userWins;
        if (choice === "rock") {
          userWins = computerChoice === "scissors";
        } else if (choice === "paper") {
          userWins = computerChoice === "rock";
        } else if (choice === "scissors") {
          userWins = computerChoice === "paper";
        }

        if (userWins) {
          setUserScore((score) => score + 1);
          setMessage(`Victory! ${choice} conquers ${computerChoice}!`);
          setGameResult("win");
        } else {
          setCompScore((score) => score + 1);
          setMessage(`Defeat! ${computerChoice} defeats ${choice}.`);
          setGameResult("lose");
        }
      }

      // Reset for next round
      setTimeout(() => {
        setShowResult(false);
        setUserChoice(null);
        setCompChoice(null);
        setMessage("Choose your weapon!");
        setGameResult(null);
      }, 3000);
    }, 1000);
  };

  const resetGame = () => {
    setUserScore(0);
    setCompScore(0);
    setMessage("Choose your weapon!");
    setUserChoice(null);
    setCompChoice(null);
    setShowResult(false);
    setGameResult(null);
    setIsAnimating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Rock Paper Scissors
        </h1>
        <p className="text-sm sm:text-base text-gray-300">
          Battle of Strategy & Luck
        </p>
      </div>

      {/* Game Area */}
      <div className="w-full max-w-4xl mx-auto">
        {/* Scoreboard */}
        <div className="flex justify-center items-center gap-8 sm:gap-16 mb-8 sm:mb-12">
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 sm:p-6 shadow-2xl">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-yellow-300" />
              <p className="text-2xl sm:text-4xl font-bold">{userScore}</p>
              <p className="text-xs sm:text-sm text-blue-100">You</p>
            </div>
          </div>

          <div className="text-center">
            <Zap className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-yellow-400 animate-pulse" />
            <p className="text-lg sm:text-xl font-semibold">VS</p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl p-4 sm:p-6 shadow-2xl">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-red-100" />
              <p className="text-2xl sm:text-4xl font-bold">{compScore}</p>
              <p className="text-xs sm:text-sm text-red-100">Computer</p>
            </div>
          </div>
        </div>

        {/* Game Content */}
        {!showResult && !isAnimating ? (
          <div className="choices">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
              {choicesData.map(({ id, icon: Icon, name }) => (
                <button
                  key={id}
                  onClick={() => playGame(id)}
                  className="group choice relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 p-8 sm:p-12 shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/25"
                  aria-label={name}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Icon className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 text-white group-hover:text-yellow-200 transition-colors duration-300" />
                  <p className="text-lg sm:text-xl font-semibold text-center">
                    {name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : isAnimating ? (
          <div className="text-center py-8 sm:py-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full px-6 sm:px-8 py-3 sm:py-4 shadow-2xl">
              <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg sm:text-xl font-semibold">
                Computer is thinking...
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`result-container transition-all duration-500 ${
              showResult ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div
              className={`rounded-3xl p-6 sm:p-8 shadow-2xl ${
                gameResult === "win"
                  ? "bg-gradient-to-br from-green-600 to-emerald-600"
                  : gameResult === "lose"
                  ? "bg-gradient-to-br from-red-600 to-rose-600"
                  : "bg-gradient-to-br from-yellow-600 to-amber-600"
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 items-center">
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                    Your Choice
                  </h3>
                  <div className="bg-white/20 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
                    {userChoice &&
                      React.createElement(getChoiceIcon(userChoice), {
                        className:
                          "w-16 h-16 sm:w-20 sm:h-20 mx-auto text-white",
                      })}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                    Computer's Choice
                  </h3>
                  <div className="bg-white/20 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
                    {compChoice &&
                      React.createElement(getChoiceIcon(compChoice), {
                        className:
                          "w-16 h-16 sm:w-20 sm:h-20 mx-auto text-white",
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        <div className="text-center mt-8 sm:mt-12">
          <div
            className={`inline-block px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-base sm:text-xl font-semibold shadow-2xl transition-all duration-300 ${
              gameResult === "win"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse"
                : gameResult === "lose"
                ? "bg-gradient-to-r from-red-500 to-rose-500"
                : gameResult === "draw"
                ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                : "bg-gradient-to-r from-indigo-600 to-purple-600"
            }`}
          >
            {gameResult === "win" && (
              <Trophy className="inline w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            )}
            {message}
          </div>
        </div>

        {/* Restart Button */}
        <div className="text-center mt-8 sm:mt-12">
          <button
            onClick={resetGame}
            className="group inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-300" />
            <span className="text-sm sm:text-base">Reset Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RockPaperScissors;
