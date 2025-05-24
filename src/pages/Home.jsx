import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Play,
  Gamepad2,
  Grid3X3,
  Scissors,
  Calculator,
  Brain,
  Target,
  Zap,
  Hash,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [hoveredGame, setHoveredGame] = useState(null);
  const titleRef = useRef(null);
  const typewriterRef = useRef(null);

  const games = [
    {
      id: 1,
      name: "2048",
      category: "Puzzle",
      difficulty: "Medium",
      color: "from-orange-500 via-amber-500 to-yellow-500",
      icon: <Calculator className="w-6 h-6" />,
      description: "Combine tiles to reach 2048",
      route: "/game2048",
    },
    {
      id: 2,
      name: "Rock Paper Scissors",
      category: "Classic",
      difficulty: "Easy",
      color: "from-blue-500 via-indigo-500 to-purple-600",
      icon: <Scissors className="w-6 h-6" />,
      description: "Classic hand game challenge",
      route: "/rock-paper-scissor",
    },
    {
      id: 3,
      name: "Sudoku",
      category: "Logic",
      difficulty: "Hard",
      color: "from-emerald-500 via-teal-500 to-cyan-600",
      icon: <Grid3X3 className="w-6 h-6" />,
      description: "Number puzzle mastery",
      route: "/sudoku",
    },
    {
      id: 4,
      name: "Memory Matching",
      category: "Memory",
      difficulty: "Easy",
      color: "from-pink-500 via-rose-500 to-red-500",
      icon: <Brain className="w-6 h-6" />,
      description: "Test your memory skills",
      route: "/memory-matching",
    },
    {
      id: 5,
      name: "Tic Tac Toe",
      category: "Strategy",
      difficulty: "Easy",
      color: "from-purple-500 via-violet-500 to-indigo-600",
      icon: <Hash className="w-6 h-6" />,
      description: "Classic X and O game",
      route: "/tic-tac-toe",
    },
    {
      id: 6,
      name: "Maze Game",
      category: "Adventure",
      difficulty: "Medium",
      color: "from-green-500 via-emerald-500 to-teal-600",
      icon: <Target className="w-6 h-6" />,
      description: "Navigate through mazes",
      route: "/maze-game",
    },
    {
      id: 7,
      name: "Brick Breaker",
      category: "Arcade",
      difficulty: "Medium",
      color: "from-red-500 via-orange-500 to-yellow-500",
      icon: <Zap className="w-6 h-6" />,
      description: "Break all the bricks",
      route: "/brick-breaker",
    },
    {
      id: 8,
      name: "Dots & Boxes",
      category: "Strategy",
      difficulty: "Medium",
      color: "from-cyan-500 via-blue-500 to-indigo-600",
      icon: <Grid3X3 className="w-6 h-6" />,
      description: "Connect dots to win",
      route: "/dots-boxes",
    },
  ];

  useEffect(() => {
    class TxtType {
      constructor(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = "";
        this.isDeleting = false;
        this.timeoutId = null;
        this.tick();
      }
      tick() {
        if (!this.el) return;
        const i = this.loopNum % this.toRotate.length;
        const fullTxt = this.toRotate[i];
        this.txt = this.isDeleting
          ? fullTxt.substring(0, this.txt.length - 1)
          : fullTxt.substring(0, this.txt.length + 1);
        this.el.innerHTML = `<span class='bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'>${this.txt}</span><span class='animate-pulse text-cyan-400'>|</span>`;
        let delta = 200 - Math.random() * 100;
        if (this.isDeleting) delta /= 2;
        if (!this.isDeleting && this.txt === fullTxt) {
          delta = this.period;
          this.isDeleting = true;
        } else if (this.isDeleting && this.txt === "") {
          this.isDeleting = false;
          this.loopNum++;
          delta = 500;
        }
        this.timeoutId = setTimeout(() => this.tick(), delta);
      }
      destroy() {
        if (this.timeoutId) clearTimeout(this.timeoutId);
      }
    }

    if (titleRef.current) {
      typewriterRef.current = new TxtType(
        titleRef.current,
        [
          "WELCOME TO WEB ARCADE",
          "PLAY • COMPETE • CONQUER",
          "ENDLESS GAMING AWAITS",
        ],
        3000
      );
    }

    return () => {
      if (typewriterRef.current) typewriterRef.current.destroy();
    };
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
      case "Medium":
        return "text-amber-400 bg-amber-400/10 border-amber-400/30";
      case "Hard":
        return "text-rose-400 bg-rose-400/10 border-rose-400/30";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/30";
    }
  };

  const handleGameClick = (route) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-96 h-96 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-blob animation-delay-6000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="p-3 bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-600 rounded-xl shadow-lg shadow-purple-500/25">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Web Arcade
              </h1>
              <p className="text-sm text-gray-400">
                Ultimate Gaming Experience
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 text-center py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            ref={titleRef}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 min-h-[80px] flex items-center justify-center"
          ></div>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience classic games reimagined for the modern web. Challenge
            your mind, test your reflexes, and have endless fun.
          </p>
        </div>
      </section>

      {/* Games Grid */}
      <section className="relative z-10 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Choose Your Game
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <div
                key={game.id}
                className="group relative bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 cursor-pointer"
                onMouseEnter={() => setHoveredGame(game.id)}
                onMouseLeave={() => setHoveredGame(null)}
                onClick={() => handleGameClick(game.route)}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>
                <div className="relative h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-20`}
                  ></div>
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${game.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {game.icon}
                    </div>
                  </div>
                  {hoveredGame === game.id && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                      <div className="text-center">
                        <div
                          className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-br ${game.color} rounded-full flex items-center justify-center animate-bounce shadow-lg`}
                        >
                          <Play className="w-6 h-6" />
                        </div>
                        <p className="text-white font-semibold">
                          Click to Play!
                        </p>
                        <p className="text-gray-300 text-sm mt-1">
                          {game.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                      {game.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mb-3 text-xs">
                    <span className="bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full text-gray-300 border border-white/10 cursor-default">
                      {game.category}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border cursor-default ${getDifficultyColor(
                        game.difficulty
                      )}`}
                    >
                      {game.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    {game.description}
                  </p>
                  <button
                    className={`w-full bg-gradient-to-r ${game.color} hover:shadow-lg hover:shadow-purple-500/25 text-white py-2 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 text-sm shadow-lg cursor-pointer`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGameClick(game.route);
                    }}
                  >
                    <Play className="w-4 h-4" />
                    Play Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
