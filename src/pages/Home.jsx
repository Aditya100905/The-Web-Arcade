import { useEffect, useRef, useState } from "react";
import {
  Play,
  Grid3X3,
  Scissors,
  Calculator,
  Brain,
  Target,
  Zap,
  Hash,
  Bird,
  Bomb,
  Dices,
  Star,
  Trophy,
  Clock,
  Users,
  Square,
  Gamepad2,
  Puzzle,
  Grid,
  MessageSquare,
  Layers,
  Crosshair,
  Box,
  Move3D,
  RotateCcw,
  MousePointer,
  Grid2X2,
  ArrowUp,
  Shuffle,
  BrickWall,
  DotSquareIcon,
} from "lucide-react";

const games = [
  {
    id: 1,
    name: "2048",
    category: "Puzzle",
    difficulty: "Medium",
    color: "from-orange-500 via-amber-500 to-yellow-500",
    icon: <Grid2X2 className="w-20 h-20" />, // Better represents the grid-based tile sliding game
    description: "Combine tiles to reach 2048",
    route: "/game2048",
    players: "Single",
    estimatedTime: "10-20 min",
    gif: "/gif/2048.gif",
  },
  {
    id: 2,
    name: "Rock Paper Scissors",
    category: "Classic",
    difficulty: "Easy",
    color: "from-blue-500 via-indigo-500 to-purple-600",
    icon: <Scissors className="w-20 h-20" />, // Perfect - represents one of the three choices
    description: "Classic hand game challenge",
    route: "/rock-paper-scissor",
    players: "Single",
    estimatedTime: "2-5 min",
    gif: "/gif/rock-paper-scissors.gif",
  },
  {
    id: 3,
    name: "Sudoku",
    category: "Logic",
    difficulty: "Hard",
    color: "from-emerald-500 via-teal-500 to-cyan-600",
    icon: <Grid3X3 className="w-20 h-20" />, // Perfect - represents the 9x9 grid structure
    description: "Number puzzle mastery",
    route: "/sudoku",
    players: "Single",
    estimatedTime: "15-30 min",
    gif: "/gif/sudoku.gif",
  },
  {
    id: 4,
    name: "Memory Matching",
    category: "Memory",
    difficulty: "Easy",
    color: "from-pink-500 via-rose-500 to-red-500",
    icon: <Brain className="w-20 h-20" />, // Perfect - represents memory and cognitive skills
    description: "Test your memory skills",
    route: "/memory-matching",
    players: "Single",
    estimatedTime: "5-10 min",
    gif: "/gif/memory-matching.gif",
  },
  {
    id: 5,
    name: "Tic Tac Toe",
    category: "Strategy",
    difficulty: "Easy",
    color: "from-purple-500 via-violet-500 to-indigo-600",
    icon: <Hash className="w-20 h-20" />, // Perfect - represents the # grid pattern
    description: "Classic X and O game",
    route: "/tic-tac-toe",
    players: "Two",
    estimatedTime: "2-5 min",
    gif: "/gif/tic-tac-toe.gif",
  },
  {
    id: 6,
    name: "Flappy Bird",
    category: "Arcade",
    difficulty: "Hard",
    color: "from-green-500 via-emerald-500 to-teal-600",
    icon: <Bird className="w-20 h-20" />, // Perfect - literally represents the bird character
    description: "Navigate through pipes",
    route: "/flappy-bird",
    players: "Single",
    estimatedTime: "5-10 min",
    gif: "/gif/flappy-bird.gif",
  },
  {
    id: 7,
    name: "Brick Breaker",
    category: "Arcade",
    difficulty: "Medium",
    color: "from-red-500 via-orange-500 to-yellow-500",
    icon: <BrickWall className="w-20 h-20" />, // Better represents the bricks/blocks to break
    description: "Break all the bricks",
    route: "/brick-breaker",
    players: "Single",
    estimatedTime: "10-20 min",
    gif: "/gif/brick-breaker.gif",
  },
  {
    id: 8,
    name: "Dots & Boxes",
    category: "Strategy",
    difficulty: "Medium",
    color: "from-cyan-500 via-blue-500 to-indigo-600",
    icon: <DotSquareIcon className="w-20 h-20" />, // Represents clicking/connecting dots
    description: "Connect dots to win",
    route: "/dots-boxes",
    players: "Two",
    estimatedTime: "10-15 min",
    gif: "/gif/dots-and-boxes.gif",
  },
];

export default function Home() {
  const [hoveredGame, setHoveredGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loadedGifs, setLoadedGifs] = useState({});
  const titleRef = useRef(null);
  const typewriterRef = useRef(null);

  const categories = [
    "All",
    "Puzzle",
    "Classic",
    "Logic",
    "Memory",
    "Strategy",
    "Arcade",
  ];

  const filteredGames =
    selectedCategory === "All"
      ? games
      : games.filter((game) => game.category === selectedCategory);

  // Preload GIFs when component mounts
  useEffect(() => {
    games.forEach((game) => {
      const img = new Image();
      img.onload = () => {
        setLoadedGifs((prev) => ({ ...prev, [game.id]: true }));
      };
      img.onerror = () => {
        setLoadedGifs((prev) => ({ ...prev, [game.id]: false }));
      };
      img.src = game.gif;
    });
  }, []);

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
          "WELCOME TO THE WEB ARCADE",
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
    window.open(route, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden">
      {/* Enhanced Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-96 h-96 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-blob animation-delay-6000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-rose-600 to-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-8000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 text-center py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 min-h-[60px] sm:min-h-[80px] flex items-center justify-center"
          ></div>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience classic games reimagined for the modern web.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-500/30">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Mind Games</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-500/30">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Action Packed</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/30">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Multiplayer</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="relative z-10 px-4 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25"
                    : "bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10 hover:border-white/30"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="relative z-10 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {selectedCategory === "All"
                ? "All Games"
                : `${selectedCategory} Games`}
            </h2>
            <p className="text-gray-400 text-sm">
              Showing {filteredGames.length} game
              {filteredGames.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredGames.map((game) => (
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

                {/* Game Icon/GIF Section */}
                <div className="relative h-36 sm:h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      game.color
                    } opacity-20 transition-opacity duration-500 ${
                      hoveredGame === game.id ? "opacity-30" : "opacity-20"
                    }`}
                  ></div>

                  {/* Game Icon or GIF */}
                  {hoveredGame === game.id ? (
                    <img
                      src={game.gif}
                      alt={`${game.name} preview`}
                      className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500"
                    />
                  ) : (
                    <div className="relative z-10 transition-all duration-500 transform scale-100 opacity-100">
                      {game.icon}
                    </div>
                  )}

                  {/* GIF Hover State */}
                  <div
                    className={`absolute inset-0 z-20 transition-all duration-500 transform ${
                      hoveredGame === game.id
                        ? "scale-100 opacity-100"
                        : "scale-95 opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="relative w-full h-full flex items-center justify-center bg-black/30 backdrop-blur-sm">
                      {loadedGifs[game.id] ? (
                        <img
                          src={game.gif}
                          alt={`${game.name} gameplay preview`}
                          className="w-full h-full object-cover rounded-lg"
                          style={{
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                          }}
                        />
                      ) : (
                        <div
                          className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${game.color} rounded-2xl flex items-center justify-center shadow-lg animate-pulse`}
                        >
                          {game.icon}
                        </div>
                      )}

                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-4">
                        <div className="text-center transform transition-all duration-300 hover:scale-110">
                          <div
                            className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-br ${game.color} rounded-full flex items-center justify-center shadow-2xl animate-pulse border-2 border-white/30`}
                          >
                            <Play className="w-5 h-5 ml-1" />
                          </div>
                          <p className="text-white font-bold text-sm drop-shadow-lg">
                            Click to Play!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game Info Section */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300 truncate">
                      {game.name}
                    </h3>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-3 text-xs">
                    <span className="bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full text-gray-300 border border-white/10">
                      {game.category}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
                        game.difficulty
                      )}`}
                    >
                      {game.difficulty}
                    </span>
                  </div>

                  <p className="text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2">
                    {game.description}
                  </p>

                  {/* Game Details */}
                  <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{game.players}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{game.estimatedTime}</span>
                    </div>
                  </div>

                  {/* Play Button */}
                  <button
                    className={`w-full bg-gradient-to-r ${game.color} hover:shadow-lg hover:shadow-purple-500/25 text-white py-2 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGameClick(game.route);
                    }}
                  >
                    <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                    Play Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center hover:scale-110 transition-transform justify-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full border-2 border-white shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <span className="text-xl font-bold">The Web Arcade</span>
            </div>
            <p className="text-gray-400 text-sm">
              Built with{" "}
              <span className="animate-pulse text-xl scale-110">❤️</span> for
              gaming enthusiasts
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
        .animation-delay-8000 {
          animation-delay: 8s;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
