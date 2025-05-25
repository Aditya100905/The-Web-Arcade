// import React, { useState, useEffect, useCallback, useRef } from 'react';

// const FlappyBird = () => {
//   const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver, modeSelect, waitingForStart
//   const [gameMode, setGameMode] = useState('medium'); // easy, medium, hard
//   const [birdY, setBirdY] = useState(300);
//   const [birdVelocity, setBirdVelocity] = useState(0);
//   const [pipes, setPipes] = useState([]);
//   const [score, setScore] = useState(0);
//   const [highScores, setHighScores] = useState({ easy: 0, medium: 0, hard: 0 });
//   const [gameSpeed, setGameSpeed] = useState(2);
//   const [showTrail, setShowTrail] = useState(false);
//   const [particles, setParticles] = useState([]);
//   const [birdTrail, setBirdTrail] = useState([]);
//   const [isGameInitialized, setIsGameInitialized] = useState(false);
//   const [dimensions, setDimensions] = useState({ width: 400, height: 600 });
//   const gameLoopRef = useRef();
//   const containerRef = useRef();

//   const GRAVITY = gameMode === 'easy' ? 0.4 : gameMode === 'hard' ? 0.8 : 0.6;
//   const JUMP_FORCE = gameMode === 'easy' ? -8 : gameMode === 'hard' ? -10 : -9;
//   const PIPE_WIDTH = Math.max(50, dimensions.width * 0.12);
//   const PIPE_GAP = gameMode === 'hard' ? Math.max(130, dimensions.height * 0.2) : 
//                    gameMode === 'easy' ? Math.max(170, dimensions.height * 0.3) : 
//                    Math.max(150, dimensions.height * 0.25);
//   const BIRD_SIZE = Math.max(24, Math.min(40, dimensions.width * 0.08));

//   const modes = {
//     easy: { 
//       name: 'Easy', 
//       desc: 'Relaxed gameplay with larger gaps', 
//       color: 'from-green-500 to-emerald-500',
//       emoji: '🟢'
//     },
//     medium: { 
//       name: 'Medium', 
//       desc: 'Balanced Flappy Bird experience', 
//       color: 'from-blue-500 to-cyan-500',
//       emoji: '🔵'
//     },
//     hard: { 
//       name: 'Hard', 
//       desc: 'Challenging with smaller gaps', 
//       color: 'from-red-500 to-orange-500',
//       emoji: '🔴'
//     }
//   };

//   // In-memory storage for high scores (simulating localStorage)
//   const highScoreStorage = useRef({ easy: 0, medium: 0, hard: 0 });

// const saveHighScores = (scores) => {
//   try {
//     localStorage.setItem('flappyBirdHighScores', JSON.stringify(scores));
//   } catch (error) {
//     console.error('Failed to save high scores to localStorage:', error);
//   }
// };

// const loadHighScores = () => {
//   try {
//     const saved = localStorage.getItem('flappyBirdHighScores');
//     if (saved) {
//       return JSON.parse(saved);
//     }
//     return { easy: 0, medium: 0, hard: 0 };
//   } catch (error) {
//     console.error('Failed to load high scores from localStorage:', error);
//     return { easy: 0, medium: 0, hard: 0 };
//   }
// };


//   // Handle responsive dimensions
//   useEffect(() => {
//     const updateDimensions = () => {
//       if (containerRef.current) {
//         const container = containerRef.current;
//         const containerWidth = container.clientWidth;
//         const containerHeight = window.innerHeight - 200; // Leave space for controls
        
//         // Maintain aspect ratio while maximizing screen usage
//         const aspectRatio = 2/3; // height/width
//         let gameWidth = Math.min(containerWidth - 32, 600); // Max width 600px
//         let gameHeight = gameWidth * aspectRatio;
        
//         if (gameHeight > containerHeight) {
//           gameHeight = containerHeight;
//           gameWidth = gameHeight / aspectRatio;
//         }
        
//         setDimensions({ 
//           width: Math.max(320, gameWidth), 
//           height: Math.max(480, gameHeight) 
//         });
//       }
//     };

//     updateDimensions();
//     window.addEventListener('resize', updateDimensions);
//     return () => window.removeEventListener('resize', updateDimensions);
//   }, []);

// useEffect(() => {
//   const savedScores = loadHighScores();
//   setHighScores(savedScores);
//   setIsGameInitialized(true);
// }, []);

// useEffect(() => {
//   if (isGameInitialized) {
//     saveHighScores(highScores);
//   }
// }, [highScores, isGameInitialized]);


//   const createParticle = (x, y, type = 'score') => {
//     const particle = {
//       id: Math.random(),
//       x, y,
//       vx: (Math.random() - 0.5) * 4,
//       vy: (Math.random() - 0.5) * 4 - 2,
//       life: 1,
//       type
//     };
//     setParticles(prev => [...prev.slice(-20), particle]);
//   };

//   const jump = useCallback(() => {
//     if (gameState === 'waitingForStart') {
//       setGameState('playing');
//       setBirdVelocity(JUMP_FORCE);
//     } else if (gameState === 'playing') {
//       setBirdVelocity(JUMP_FORCE);
//       setShowTrail(true);
//       setTimeout(() => setShowTrail(false), 100);
      
//       // Add jump particle effect
//       createParticle(dimensions.width * 0.15 + BIRD_SIZE/2, birdY + BIRD_SIZE/2, 'jump');
//     }
//   }, [gameState, JUMP_FORCE, birdY, dimensions.width, BIRD_SIZE]);

//   const handleGameStart = useCallback(() => {
//     if (gameState === 'menu') {
//       startGame('medium');
//     } else if (gameState === 'gameOver') {
//       startGame(gameMode);
//     } else if (gameState === 'waitingForStart') {
//       jump();
//     }
//   }, [gameState, gameMode, jump]);

//   const startGame = (mode = gameMode) => {
//     setBirdY(dimensions.height / 2);
//     setBirdVelocity(0);
//     setPipes([]);
//     setScore(0);
//     setGameSpeed(mode === 'hard' ? 3 : mode === 'easy' ? 1.5 : 2);
//     setParticles([]);
//     setBirdTrail([]);
//     setShowTrail(false);
//     setGameMode(mode);
//     setGameState('waitingForStart');
//   };

//   const gameOver = () => {
//     setGameState('gameOver');
    
//     // Check and update high score
//     if (score > highScores[gameMode]) {
//       const newHighScores = { ...highScores, [gameMode]: score };
//       setHighScores(newHighScores);
//       createParticle(dimensions.width/2, dimensions.height/2, 'newRecord');
//     }
    
//     // Create explosion particles
//     for (let i = 0; i < 8; i++) {
//       setTimeout(() => {
//         createParticle(dimensions.width * 0.15 + BIRD_SIZE/2, birdY + BIRD_SIZE/2, 'explosion');
//       }, i * 50);
//     }
//   };

//   // Keyboard controls
//   useEffect(() => {
//     const handleKeyPress = (e) => {
//       if (e.code === 'Space' || e.code === 'ArrowUp') {
//         e.preventDefault();
//         if (gameState === 'playing' || gameState === 'waitingForStart') {
//           jump();
//         } else if (gameState === 'menu' || gameState === 'gameOver') {
//           handleGameStart();
//         }
//       }
//       if (e.code === 'Escape') {
//         e.preventDefault();
//         if (gameState === 'playing' || gameState === 'waitingForStart') {
//           setGameState('menu');
//         } else if (gameState === 'modeSelect') {
//           setGameState('menu');
//         }
//       }
//     };

//     window.addEventListener('keydown', handleKeyPress);
//     return () => window.removeEventListener('keydown', handleKeyPress);
//   }, [jump, gameState, handleGameStart]);

//   // Main game loop
//   useEffect(() => {
//     if (gameState !== 'playing') {
//       if (gameLoopRef.current) {
//         clearInterval(gameLoopRef.current);
//       }
//       return;
//     }

//     gameLoopRef.current = setInterval(() => {
//       // Update bird trail
//       setBirdTrail(prev => [...prev.slice(-8), { x: dimensions.width * 0.15, y: birdY, time: Date.now() }]);

//       // Update particles
//       setParticles(prev => prev.map(p => ({
//         ...p,
//         x: p.x + p.vx,
//         y: p.y + p.vy,
//         vx: p.vx * 0.98,
//         vy: p.vy + 0.2,
//         life: p.life - 0.03
//       })).filter(p => p.life > 0));

//       // Update bird physics
//       setBirdY(prevY => {
//         const newY = prevY + birdVelocity;
//         if (newY <= 0 || newY >= dimensions.height - BIRD_SIZE) {
//           gameOver();
//           return prevY;
//         }
//         return newY;
//       });
      
//       setBirdVelocity(prev => Math.min(prev + GRAVITY, 15)); // Terminal velocity

//       // Update pipes
//       setPipes(prev => {
//         let newPipes = prev.map(pipe => ({
//           ...pipe,
//           x: pipe.x - gameSpeed
//         })).filter(pipe => pipe.x > -PIPE_WIDTH);

//         // Add new pipe
//         if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < dimensions.width - 250) {
//           const minGapY = 80;
//           const maxGapY = dimensions.height - PIPE_GAP - 80;
//           const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
          
//           newPipes.push({
//             x: dimensions.width,
//             topHeight: gapY,
//             bottomY: gapY + PIPE_GAP,
//             passed: false,
//             id: Math.random()
//           });
//         }

//         return newPipes;
//       });

//       // Check collisions and scoring
//       setPipes(currentPipes => {
//         const birdLeft = dimensions.width * 0.15;
//         const birdRight = birdLeft + BIRD_SIZE;
//         const birdTop = birdY;
//         const birdBottom = birdY + BIRD_SIZE;

//         for (let pipe of currentPipes) {
//           // Collision detection with some tolerance
//           const tolerance = 2;
//           if (birdRight > pipe.x + tolerance && birdLeft < pipe.x + PIPE_WIDTH - tolerance) {
//             if (birdTop < pipe.topHeight - tolerance || birdBottom > pipe.bottomY + tolerance) {
//               gameOver();
//               return currentPipes;
//             }
//           }

//           // Scoring
//           if (!pipe.passed && pipe.x + PIPE_WIDTH < birdLeft) {
//             pipe.passed = true;
//             setScore(prev => {
//               const newScore = prev + 1;
//               createParticle(pipe.x + PIPE_WIDTH/2, pipe.topHeight + PIPE_GAP/2, 'score');
//               return newScore;
//             });
//             setGameSpeed(prev => Math.min(
//               prev + (gameMode === 'hard' ? 0.15 : gameMode === 'easy' ? 0.05 : 0.1), 
//               gameMode === 'hard' ? 6 : gameMode === 'easy' ? 3 : 4
//             ));
//           }
//         }
//         return currentPipes;
//       });
//     }, 16);

//     return () => {
//       if (gameLoopRef.current) {
//         clearInterval(gameLoopRef.current);
//       }
//     };
//   }, [gameState, birdVelocity, gameSpeed, birdY, GRAVITY, PIPE_GAP, gameMode, dimensions]);

//   const MenuScreen = () => (
//     <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-4">
//       <div className="text-center bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-violet-900/90 p-6 md:p-8 rounded-2xl border border-purple-400/30 shadow-2xl backdrop-blur-sm w-full max-w-md">
//         <div className="mb-6 md:mb-8">
//           <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
//             🐦 Flappy Bird
//           </h1>
//           <div className="text-sm md:text-lg text-purple-200">Enhanced Edition</div>
//         </div>
        
//         <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
//           <button 
//             onClick={() => startGame('medium')}
//             className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
//           >
//             🚀 Quick Start
//           </button>
//           <button 
//             onClick={(e) => {
//               e.stopPropagation();
//               setGameState('modeSelect');
//             }}
//             className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
//           >
//             ⚙️ Select Mode
//           </button>
//         </div>

//         <div className="text-xs md:text-sm text-purple-300 bg-black/20 p-3 md:p-4 rounded-xl">
//           <div className="mb-3 font-semibold text-yellow-400">🏆 Best Scores</div>
//           <div className="space-y-2">
//             {Object.entries(highScores).map(([mode, score]) => (
//               <div key={mode} className="flex justify-between items-center">
//                 <span className="flex items-center gap-2">
//                   <span>{modes[mode].emoji}</span>
//                   <span className="capitalize">{modes[mode].name}:</span>
//                 </span>
//                 <span className="text-yellow-400 font-bold">{score}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="mt-4 md:mt-6 text-xs text-purple-400">
//           Press Space, ↑, or Tap to start
//         </div>
//       </div>
//     </div>
//   );

//   const ModeSelectScreen = () => (
//     <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-4">
//       <div className="bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-violet-900/90 p-6 md:p-8 rounded-2xl border border-purple-400/30 shadow-2xl backdrop-blur-sm w-full max-w-md">
//         <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
//           🎮 Choose Mode
//         </h2>
        
//         <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
//           {Object.entries(modes).map(([key, mode]) => (
//             <button
//               key={key}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 startGame(key);
//               }}
//               className={`w-full bg-gradient-to-r ${mode.color} hover:shadow-lg hover:shadow-purple-500/25 px-4 md:px-6 py-3 md:py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-left`}
//             >
//               <div className="flex items-center gap-3 mb-2">
//                 <span className="text-xl md:text-2xl">{mode.emoji}</span>
//                 <span className="text-base md:text-lg font-bold">{mode.name}</span>
//               </div>
//               <div className="text-xs md:text-sm opacity-90 ml-8 md:ml-11">{mode.desc}</div>
//               <div className="text-xs mt-2 ml-8 md:ml-11 opacity-75 bg-black/20 px-2 py-1 rounded inline-block">
//                 Best: {highScores[key]} 🏆
//               </div>
//             </button>
//           ))}
//         </div>

//         <button 
//           onClick={(e) => {
//             e.stopPropagation();
//             setGameState('menu');
//           }}
//           className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
//         >
//           ← Back to Menu
//         </button>
//       </div>
//     </div>
//   );

//   const GameOverScreen = () => {
//     const isNewRecord = score > 0 && score === highScores[gameMode];
    
//     return (
//       <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-4">
//         <div className="text-center bg-gradient-to-br from-red-900/90 via-purple-900/90 to-indigo-900/90 p-6 md:p-8 rounded-2xl border border-red-400/30 shadow-2xl backdrop-blur-sm w-full max-w-md">
//           <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
//             💥 Game Over!
//           </h2>
          
//           <div className="mb-6 md:mb-8 space-y-3">
//             <div className="text-2xl md:text-3xl font-bold text-yellow-400">Score: {score}</div>
//             <div className="text-base md:text-lg text-purple-200">
//               Best: <span className="text-yellow-400 font-bold">{highScores[gameMode]}</span>
//             </div>
//             <div className="flex items-center justify-center gap-2 text-purple-300">
//               <span>{modes[gameMode].emoji}</span>
//               <span className="capitalize">Mode: {modes[gameMode].name}</span>
//             </div>
//             {isNewRecord && (
//               <div className="text-base md:text-lg text-yellow-400 animate-pulse bg-yellow-400/10 px-4 py-2 rounded-lg border border-yellow-400/30">
//                 🎉 New High Score! 🎉
//               </div>
//             )}
//           </div>

//           <div className="space-y-3">
//             <button 
//               onClick={(e) => {
//                 e.stopPropagation();
//                 startGame(gameMode);
//               }}
//               className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
//             >
//               🔄 Play Again
//             </button>
//             <button 
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setGameState('modeSelect');
//               }}
//               className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
//             >
//               🎮 Change Mode
//             </button>
//             <button 
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setGameState('menu');
//               }}
//               className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
//             >
//               🏠 Main Menu
//             </button>
//           </div>

//           <div className="mt-4 md:mt-6 text-xs text-purple-400">
//             Press Space or Tap to play again
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const WaitingScreen = () => (
//     <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-20">
//       <div className="text-center bg-gradient-to-br from-blue-900/90 to-purple-900/90 p-6 md:p-8 rounded-2xl border border-blue-400/30 shadow-2xl backdrop-blur-sm max-w-sm mx-4">
//         <div className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
//           🚀 Ready to Fly?
//         </div>
//         <div className="text-base md:text-lg text-blue-200 mb-6">
//           Tap anywhere or press Space to start!
//         </div>
//         <div className="flex items-center justify-center gap-2 text-blue-300 text-sm">
//           <span>{modes[gameMode].emoji}</span>
//           <span className="capitalize">Mode: {modes[gameMode].name}</span>
//         </div>
//       </div>
//     </div>
//   );

//   if (!isGameInitialized) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
//         <div className="text-white text-xl animate-pulse">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-hidden">
//       <div className="container mx-auto px-4 py-4 flex flex-col items-center min-h-screen" ref={containerRef}>
//         {/* Game Container */}
//         <div className="flex-1 flex items-center justify-center w-full">
//           <div 
//             className="relative bg-gradient-to-b from-indigo-700 via-purple-700 to-violet-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-purple-500/50 cursor-pointer"
//             style={{ width: dimensions.width, height: dimensions.height }}
//             onClick={(e) => {
//               // Only trigger jump/start if clicking on the game area itself, not on overlay screens
//               if (gameState === 'playing' || gameState === 'waitingForStart') {
//                 jump();
//               } else if ((gameState === 'menu' || gameState === 'gameOver') && e.target === e.currentTarget) {
//                 handleGameStart();
//               }
//             }}
//           >
//             {/* Animated Background */}
//             <div className="absolute inset-0">
//               <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/20 via-purple-600/20 to-violet-600/20"></div>
//               {[...Array(Math.floor(dimensions.width * dimensions.height / 15000))].map((_, i) => (
//                 <div key={i} className="absolute animate-pulse" 
//                      style={{ 
//                        left: `${Math.random() * 100}%`, 
//                        top: `${Math.random() * 100}%`,
//                        animationDelay: `${Math.random() * 3}s`,
//                        animationDuration: `${2 + Math.random() * 2}s`
//                      }}>
//                   <div className="w-1 h-1 bg-white/40 rounded-full"></div>
//                 </div>
//               ))}
//             </div>

//             {/* Bird Trail */}
//             {(gameState === 'playing' || gameState === 'waitingForStart') && showTrail && birdTrail.map((trail, i) => (
//               <div key={`${trail.time}-${i}`} className="absolute pointer-events-none"
//                    style={{
//                      left: trail.x - 2,
//                      top: trail.y + BIRD_SIZE/2 - 2,
//                      opacity: (i + 1) / birdTrail.length * 0.6
//                    }}>
//                 <div className="w-4 h-4 bg-yellow-400/60 rounded-full blur-sm"></div>
//               </div>
//             ))}

//             {/* Particles */}
//             {particles.map(particle => (
//               <div key={particle.id} className="absolute pointer-events-none"
//                    style={{
//                      left: particle.x,
//                      top: particle.y,
//                      opacity: particle.life,
//                      transform: `scale(${particle.life})`
//                    }}>
//                 {particle.type === 'score' && (
//                   <div className="text-yellow-400 font-bold text-lg animate-bounce">+1</div>
//                 )}
//                 {particle.type === 'jump' && (
//                   <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
//                 )}
//                 {particle.type === 'explosion' && (
//                   <div className="w-2 h-2 bg-red-400 rounded-full"></div>
//                 )}
//                 {particle.type === 'newRecord' && (
//                   <div className="text-yellow-300 font-bold text-sm">🎉</div>
//                 )}
//               </div>
//             ))}

//             {/* Bird */}
//             {(gameState === 'playing' || gameState === 'waitingForStart') && (
//               <div 
//                 className="absolute transition-transform duration-75 z-10"
//                 style={{ 
//                   left: `${dimensions.width * 0.15}px`, 
//                   top: `${birdY}px`,
//                   transform: `rotate(${Math.min(Math.max(birdVelocity * 2.5, -25), 45)}deg)`
//                 }}
//               >
//                 <div className="relative">
//                   <div 
//                     className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 rounded-full border-2 border-yellow-500 shadow-lg"
//                     style={{ width: BIRD_SIZE, height: BIRD_SIZE }}
//                   >
//                     <div 
//                       className="absolute bg-black rounded-full"
//                       style={{ 
//                         top: `${BIRD_SIZE * 0.25}px`,
//                         left: `${BIRD_SIZE * 0.25}px`,
//                         width: `${BIRD_SIZE * 0.15}px`,
//                         height: `${BIRD_SIZE * 0.15}px`
//                       }}
//                     ></div>
//                     <div 
//                       className="absolute bg-white rounded-full"
//                       style={{ 
//                         top: `${BIRD_SIZE * 0.2}px`,
//                         left: `${BIRD_SIZE * 0.2}px`,
//                         width: `${BIRD_SIZE * 0.08}px`,
//                         height: `${BIRD_SIZE * 0.08}px`
//                       }}
//                     ></div>
//                     <div 
//                       className="absolute bg-orange-500 rounded-full transform rotate-12"
//                       style={{ 
//                         right: `-${BIRD_SIZE * 0.1}px`,
//                         top: `${BIRD_SIZE * 0.15}px`,
//                         width: `${BIRD_SIZE * 0.2}px`,
//                         height: `${BIRD_SIZE * 0.1}px`
//                       }}
//                     ></div>
//                   </div>
//                   {showTrail && <div className="absolute inset-0 bg-yellow-400/40 rounded-full animate-ping" style={{ width: BIRD_SIZE, height: BIRD_SIZE }}></div>}
//                 </div>
//               </div>
//             )}

//             {/* Pipes */}
//             {(gameState === 'playing' || gameState === 'waitingForStart') && pipes.map((pipe) => (
//               <div key={pipe.id}>
//                 {/* Top Pipe */}
//                 <div 
//                   className="absolute bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 shadow-lg border-r-2 border-green-800"
//                   style={{
//                     left: `${pipe.x}px`,
//                     top: 0,
//                     width: `${PIPE_WIDTH}px`,
//                     height: `${pipe.topHeight}px`
//                   }}
//                 >
//                   <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-green-500 to-green-700 rounded-b-lg"></div>
//                 </div>
                
//                 {/* Bottom Pipe */}
//                 <div 
//                   className="absolute bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 shadow-lg border-r-2 border-green-800"
//                   style={{
//                     left: `${pipe.x}px`,
//                     top: `${pipe.bottomY}px`,
//                     width: `${PIPE_WIDTH}px`,
//                     height: `${dimensions.height - pipe.bottomY}px`
//                   }}
//                 >
//                   <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-t from-green-500 to-green-700 rounded-t-lg"></div>
//                 </div>
//               </div>
//             ))}

//             {/* Score Display */}
//             {(gameState === 'playing' || gameState === 'waitingForStart') && (
//               <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
//                 <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
//                   <div className="text-2xl md:text-3xl font-bold text-yellow-400 text-center">
//                     {score}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Game Mode Indicator */}
//             {(gameState === 'playing' || gameState === 'waitingForStart') && (
//               <div className="absolute top-4 right-4 z-20">
//                 <div className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/20 flex items-center gap-2">
//                   <span>{modes[gameMode].emoji}</span>
//                   <span className="text-sm font-semibold capitalize text-white">{modes[gameMode].name}</span>
//                 </div>
//               </div>
//             )}

//             {/* Overlay Screens */}
//             {gameState === 'menu' && <MenuScreen />}
//             {gameState === 'modeSelect' && <ModeSelectScreen />}
//             {gameState === 'gameOver' && <GameOverScreen />}
//             {gameState === 'waitingForStart' && <WaitingScreen />}
//           </div>
//         </div>

//         {/* Controls Info */}
//         <div className="mt-4 text-center text-purple-300 text-sm max-w-md">
//           <div className="bg-black/20 backdrop-blur-sm px-4 py-3 rounded-xl border border-purple-400/20">
//             <div className="flex flex-wrap justify-center gap-4 mb-2">
//               <div className="flex items-center gap-2">
//                 <kbd className="px-2 py-1 bg-purple-600/30 rounded text-xs">Space</kbd>
//                 <span>Jump</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <kbd className="px-2 py-1 bg-purple-600/30 rounded text-xs">↑</kbd>
//                 <span>Jump</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <kbd className="px-2 py-1 bg-purple-600/30 rounded text-xs">Tap</kbd>
//                 <span>Jump</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <kbd className="px-2 py-1 bg-purple-600/30 rounded text-xs">Esc</kbd>
//                 <span>Menu</span>
//               </div>
//             </div>
//             <div className="text-xs opacity-75">
//               Navigate pipes • Collect points • Beat your high score!
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FlappyBird;

import React, { useState, useEffect, useCallback, useRef } from 'react';

const FlappyBird = () => {
  const [gameState, setGameState] = useState('menu');
  const [gameMode, setGameMode] = useState('medium');
  const [birdY, setBirdY] = useState(300);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState({ easy: 0, medium: 0, hard: 0 });
  const [gameSpeed, setGameSpeed] = useState(2);
  const [showTrail, setShowTrail] = useState(false);
  const [particles, setParticles] = useState([]);
  const [birdTrail, setBirdTrail] = useState([]);
  const [isGameInitialized, setIsGameInitialized] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 400, height: 600 });
  const gameLoopRef = useRef();
  const containerRef = useRef();

  const GRAVITY = gameMode === 'easy' ? 0.4 : gameMode === 'hard' ? 0.8 : 0.6;
  const JUMP_FORCE = gameMode === 'easy' ? -8 : gameMode === 'hard' ? -10 : -9;
  const PIPE_WIDTH = Math.max(60, dimensions.width * 0.15);
  const PIPE_GAP = gameMode === 'hard' ? Math.max(120, dimensions.height * 0.18) : 
                   gameMode === 'easy' ? Math.max(180, dimensions.height * 0.32) : 
                   Math.max(140, dimensions.height * 0.25);
  const BIRD_SIZE = Math.max(32, Math.min(48, dimensions.width * 0.1));

  const modes = {
    easy: { 
      name: 'Easy', 
      desc: 'Relaxed gameplay with larger gaps', 
      color: 'from-green-500 to-emerald-500',
      emoji: '🟢'
    },
    medium: { 
      name: 'Medium', 
      desc: 'Balanced Flappy Bird experience', 
      color: 'from-blue-500 to-cyan-500',
      emoji: '🔵'
    },
    hard: { 
      name: 'Hard', 
      desc: 'Challenging with smaller gaps', 
      color: 'from-red-500 to-orange-500',
      emoji: '🔴'
    }
  };

const saveHighScores = (scores) => {
  localStorage.setItem('flappyBirdHighScores', JSON.stringify(scores));
};

const loadHighScores = () => {
  try {
    const saved = localStorage.getItem('flappyBirdHighScores');
    return saved ? JSON.parse(saved) : { easy: 0, medium: 0, hard: 0 };
  } catch (err) {
    return { easy: 0, medium: 0, hard: 0 };
  }
};

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        
        const maxWidth = Math.min(vw * 0.9, 500);
        const maxHeight = Math.min(vh * 0.7, 700);
        
        const aspectRatio = 1.4;
        let gameWidth = maxWidth;
        let gameHeight = gameWidth * aspectRatio;
        
        if (gameHeight > maxHeight) {
          gameHeight = maxHeight;
          gameWidth = gameHeight / aspectRatio;
        }
        
        setDimensions({ 
          width: Math.max(320, Math.floor(gameWidth)), 
          height: Math.max(450, Math.floor(gameHeight)) 
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

useEffect(() => {
  const savedScores = loadHighScores();
  setHighScores(savedScores);
  setIsGameInitialized(true);
}, []);


useEffect(() => {
  if (isGameInitialized) {
    saveHighScores(highScores);
  }
}, [highScores, isGameInitialized]);

  const createParticle = (x, y, type = 'score') => {
    const particle = {
      id: Math.random(),
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 2,
      life: 1,
      type
    };
    setParticles(prev => [...prev.slice(-20), particle]);
  };

  const jump = useCallback(() => {
    if (gameState === 'waitingForStart') {
      setGameState('playing');
      setBirdVelocity(JUMP_FORCE);
    } else if (gameState === 'playing') {
      setBirdVelocity(JUMP_FORCE);
      setShowTrail(true);
      setTimeout(() => setShowTrail(false), 100);
      createParticle(dimensions.width * 0.15 + BIRD_SIZE/2, birdY + BIRD_SIZE/2, 'jump');
    }
  }, [gameState, JUMP_FORCE, birdY, dimensions.width, BIRD_SIZE]);

  const handleGameStart = useCallback(() => {
    if (gameState === 'menu') {
      startGame('medium');
    } else if (gameState === 'gameOver') {
      startGame(gameMode);
    } else if (gameState === 'waitingForStart') {
      jump();
    }
  }, [gameState, gameMode, jump]);

  const startGame = (mode = gameMode) => {
    setBirdY(dimensions.height / 2);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setGameSpeed(mode === 'hard' ? 3 : mode === 'easy' ? 1.5 : 2);
    setParticles([]);
    setBirdTrail([]);
    setShowTrail(false);
    setGameMode(mode);
    setGameState('waitingForStart');
  };

  const gameOver = () => {
    setGameState('gameOver');
    if (score > highScores[gameMode]) {
      const newHighScores = { ...highScores, [gameMode]: score };
      setHighScores(newHighScores);
      createParticle(dimensions.width/2, dimensions.height/2, 'newRecord');
    }
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        createParticle(dimensions.width * 0.15 + BIRD_SIZE/2, birdY + BIRD_SIZE/2, 'explosion');
      }, i * 50);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === 'playing' || gameState === 'waitingForStart') {
          jump();
        } else if (gameState === 'menu' || gameState === 'gameOver') {
          handleGameStart();
        }
      }
      if (e.code === 'Escape') {
        e.preventDefault();
        if (gameState === 'playing' || gameState === 'waitingForStart') {
          setGameState('menu');
        } else if (gameState === 'modeSelect') {
          setGameState('menu');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump, gameState, handleGameStart]);

  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setBirdTrail(prev => [...prev.slice(-8), { x: dimensions.width * 0.15, y: birdY, time: Date.now() }]);

      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vx: p.vx * 0.98,
        vy: p.vy + 0.2,
        life: p.life - 0.03
      })).filter(p => p.life > 0));

      setBirdY(prevY => {
        const newY = prevY + birdVelocity;
        if (newY <= 0 || newY >= dimensions.height - BIRD_SIZE) {
          gameOver();
          return prevY;
        }
        return newY;
      });
      
      setBirdVelocity(prev => Math.min(prev + GRAVITY, 15));

      setPipes(prev => {
        let newPipes = prev.map(pipe => ({
          ...pipe,
          x: pipe.x - gameSpeed
        })).filter(pipe => pipe.x > -PIPE_WIDTH);

        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < dimensions.width - 250) {
          const minGapY = 80;
          const maxGapY = dimensions.height - PIPE_GAP - 80;
          const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
          
          newPipes.push({
            x: dimensions.width,
            topHeight: gapY,
            bottomY: gapY + PIPE_GAP,
            passed: false,
            id: Math.random(),
            type: Math.floor(Math.random() * 3)
          });
        }

        return newPipes;
      });

      setPipes(currentPipes => {
        const birdLeft = dimensions.width * 0.15;
        const birdRight = birdLeft + BIRD_SIZE;
        const birdTop = birdY;
        const birdBottom = birdY + BIRD_SIZE;

        for (let pipe of currentPipes) {
          const tolerance = 2;
          if (birdRight > pipe.x + tolerance && birdLeft < pipe.x + PIPE_WIDTH - tolerance) {
            if (birdTop < pipe.topHeight - tolerance || birdBottom > pipe.bottomY + tolerance) {
              gameOver();
              return currentPipes;
            }
          }

          if (!pipe.passed && pipe.x + PIPE_WIDTH < birdLeft) {
            pipe.passed = true;
            setScore(prev => {
              const newScore = prev + 1;
              createParticle(pipe.x + PIPE_WIDTH/2, pipe.topHeight + PIPE_GAP/2, 'score');
              return newScore;
            });
            setGameSpeed(prev => Math.min(
              prev + (gameMode === 'hard' ? 0.15 : gameMode === 'easy' ? 0.05 : 0.1), 
              gameMode === 'hard' ? 6 : gameMode === 'easy' ? 3 : 4
            ));
          }
        }
        return currentPipes;
      });
    }, 16);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, birdVelocity, gameSpeed, birdY, GRAVITY, PIPE_GAP, gameMode, dimensions]);

  const MenuScreen = () => (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-4">
      <div className="text-center bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-violet-900/90 p-6 md:p-8 rounded-2xl border border-purple-400/30 shadow-2xl backdrop-blur-sm w-full max-w-md">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          Flappy Bird
          </h1>
        </div>
        <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
          <button 
            onClick={() => startGame('medium')}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            🚀 Quick Start
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setGameState('modeSelect');
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            ⚙️ Select Mode
          </button>
        </div>
        <div className="text-xs md:text-sm text-purple-300 bg-black/20 p-3 md:p-4 rounded-xl">
          <div className="mb-3 font-semibold text-yellow-400">🏆 Best Scores</div>
          <div className="space-y-2">
            {Object.entries(highScores).map(([mode, score]) => (
              <div key={mode} className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span>{modes[mode].emoji}</span>
                  <span className="capitalize">{modes[mode].name}:</span>
                </span>
                <span className="text-yellow-400 font-bold">{score}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 md:mt-6 text-xs text-purple-400">
          Press Space, ↑, or Tap to start
        </div>
      </div>
    </div>
  );

  const ModeSelectScreen = () => (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-4">
      <div className="bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-violet-900/90 p-6 md:p-8 rounded-2xl border border-purple-400/30 shadow-2xl backdrop-blur-sm w-full max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
          🎮 Choose Mode
        </h2>
        <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
          {Object.entries(modes).map(([key, mode]) => (
            <button
              key={key}
              onClick={(e) => {
                e.stopPropagation();
                startGame(key);
              }}
              className={`w-full bg-gradient-to-r ${mode.color} hover:shadow-lg hover:shadow-purple-500/25 px-4 md:px-6 py-3 md:py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-left`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl md:text-2xl">{mode.emoji}</span>
                <span className="text-base md:text-lg font-bold">{mode.name}</span>
              </div>
              <div className="text-xs md:text-sm opacity-90 ml-8 md:ml-11">{mode.desc}</div>
              <div className="text-xs mt-2 ml-8 md:ml-11 opacity-75 bg-black/20 px-2 py-1 rounded inline-block">
                Best: {highScores[key]} 🏆
              </div>
            </button>
          ))}
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setGameState('menu');
          }}
          className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  );

  const GameOverScreen = () => {
    const isNewRecord = score > 0 && score === highScores[gameMode];
    return (
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-4">
        <div className="text-center bg-gradient-to-br from-red-900/90 via-purple-900/90 to-indigo-900/90 p-6 md:p-8 rounded-2xl border border-red-400/30 shadow-2xl backdrop-blur-sm w-full max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            💥 Game Over!
          </h2>
          <div className="mb-6 md:mb-8 space-y-3">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400">Score: {score}</div>
            <div className="text-base md:text-lg text-purple-200">
              Best: <span className="text-yellow-400 font-bold">{highScores[gameMode]}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-purple-300">
              <span>{modes[gameMode].emoji}</span>
              <span className="capitalize">Mode: {modes[gameMode].name}</span>
            </div>
            {isNewRecord && (
              <div className="text-base md:text-lg text-yellow-400 animate-pulse bg-yellow-400/10 px-4 py-2 rounded-lg border border-yellow-400/30">
                🎉 New High Score! 🎉
              </div>
            )}
          </div>
          <div className="space-y-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                startGame(gameMode);
              }}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🔄 Play Again
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setGameState('modeSelect');
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🎮 Change Mode
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setGameState('menu');
              }}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              🏠 Main Menu
            </button>
          </div>
          <div className="mt-4 md:mt-6 text-xs text-purple-400">
            Press Space or Tap to play again
          </div>
        </div>
      </div>
    );
  };

  const WaitingScreen = () => (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-20">
      <div className="text-center bg-gradient-to-br from-blue-900/90 to-purple-900/90 p-6 md:p-8 rounded-2xl border border-blue-400/30 shadow-2xl backdrop-blur-sm max-w-sm mx-4">
        <div className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
          🚀 Ready to Fly?
        </div>
        <div className="text-base md:text-lg text-blue-200 mb-6">
          Tap anywhere or press Space to start!
        </div>
        <div className="flex items-center justify-center gap-2 text-blue-300 text-sm">
          <span>{modes[gameMode].emoji}</span>
          <span className="capitalize">Mode: {modes[gameMode].name}</span>
        </div>
      </div>
    </div>
  );

  const getPipeDesign = (type, isTop, width, height) => {
    const designs = [
      // Classic Green Pipes
      {
        main: 'bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700',
        cap: 'bg-gradient-to-b from-green-500 to-green-700',
        border: 'border-green-800'
      },
      // Industrial Metal Pipes
      {
        main: 'bg-gradient-to-r from-gray-500 via-slate-600 to-gray-700',
        cap: 'bg-gradient-to-b from-slate-400 to-slate-700',
        border: 'border-slate-800'
      },
      // Crystal Pipes
      {
        main: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600',
        cap: 'bg-gradient-to-b from-cyan-300 to-purple-700',
        border: 'border-blue-800'
      }
    ];
    
    const design = designs[type] || designs[0];
    const capHeight = Math.min(32, height * 0.15);
    
    return (
      <div className={`w-full h-full ${design.main} ${design.border} border-r-2 shadow-lg relative`}>
        <div 
          className={`absolute ${isTop ? 'bottom-0' : 'top-0'} left-0 right-0 ${design.cap} ${isTop ? 'rounded-b-lg' : 'rounded-t-lg'}`}
          style={{ height: `${capHeight}px` }}
        />
        <div className="absolute inset-2 bg-black/10 rounded-sm" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-8 bg-white/20 rounded-full" />
      </div>
    );
  };

  if (!isGameInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-hidden">
      <div className="container mx-auto px-4 py-4 flex flex-col items-center min-h-screen" ref={containerRef}>
        <div className="flex-1 flex items-center justify-center w-full">
          <div 
            className="relative bg-gradient-to-b from-indigo-700 via-purple-700 to-violet-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-purple-500/50 cursor-pointer"
            style={{ width: dimensions.width, height: dimensions.height }}
            onClick={(e) => {
              if (gameState === 'playing' || gameState === 'waitingForStart') {
                jump();
              } else if ((gameState === 'menu' || gameState === 'gameOver') && e.target === e.currentTarget) {
                handleGameStart();
              }
            }}
          >
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/20 via-purple-600/20 to-violet-600/20"></div>
              {[...Array(Math.floor(dimensions.width * dimensions.height / 15000))].map((_, i) => (
                <div key={i} className="absolute animate-pulse" 
                     style={{ 
                       left: `${Math.random() * 100}%`, 
                       top: `${Math.random() * 100}%`,
                       animationDelay: `${Math.random() * 3}s`,
                       animationDuration: `${2 + Math.random() * 2}s`
                     }}>
                  <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                </div>
              ))}
            </div>

            {(gameState === 'playing' || gameState === 'waitingForStart') && showTrail && birdTrail.map((trail, i) => (
              <div key={`${trail.time}-${i}`} className="absolute pointer-events-none"
                   style={{
                     left: trail.x - 2,
                     top: trail.y + BIRD_SIZE/2 - 2,
                     opacity: (i + 1) / birdTrail.length * 0.6
                   }}>
                <div className="w-4 h-4 bg-yellow-400/60 rounded-full blur-sm"></div>
              </div>
            ))}

            {particles.map(particle => (
              <div key={particle.id} className="absolute pointer-events-none"
                   style={{
                     left: particle.x,
                     top: particle.y,
                     opacity: particle.life,
                     transform: `scale(${particle.life})`
                   }}>
                {particle.type === 'score' && (
                  <div className="text-yellow-400 font-bold text-lg animate-bounce">+1</div>
                )}
                {particle.type === 'jump' && (
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                )}
                {particle.type === 'explosion' && (
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                )}
                {particle.type === 'newRecord' && (
                  <div className="text-yellow-300 font-bold text-sm">🎉</div>
                )}
              </div>
            ))}

            {(gameState === 'playing' || gameState === 'waitingForStart') && (
              <div 
                className="absolute transition-transform duration-75 z-10"
                style={{ 
                  left: `${dimensions.width * 0.15}px`, 
                  top: `${birdY}px`,
                  transform: `rotate(${Math.min(Math.max(birdVelocity * 2.5, -25), 45)}deg)`
                }}
              >
                <div className="relative">
                  <div 
                    className="relative rounded-full shadow-lg"
                    style={{ width: BIRD_SIZE, height: BIRD_SIZE }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 rounded-full border-2 border-yellow-500" />
                    <div className="absolute inset-1 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full" />
                    <div 
                      className="absolute bg-black rounded-full"
                      style={{ 
                        top: `${BIRD_SIZE * 0.28}px`,
                        left: `${BIRD_SIZE * 0.6}px`,
                        width: `${BIRD_SIZE * 0.12}px`,
                        height: `${BIRD_SIZE * 0.12}px`
                      }}
                    />
                    <div 
                      className="absolute bg-white rounded-full"
                      style={{ 
                        top: `${BIRD_SIZE * 0.25}px`,
                        left: `${BIRD_SIZE * 0.58}px`,
                        width: `${BIRD_SIZE * 0.06}px`,
                        height: `${BIRD_SIZE * 0.06}px`
                      }}
                    />
                    <div 
                      className="absolute bg-gradient-to-r from-orange-500 to-red-500 rounded-full transform"
                      style={{ 
                        right: `${BIRD_SIZE * 0.12}px`,
                        top: `${BIRD_SIZE * 0.42}px`,
                        width: `${BIRD_SIZE * 0.18}px`,
                        height: `${BIRD_SIZE * 0.08}px`,
                        borderRadius: `${BIRD_SIZE * 0.04}px`
                      }}
                    />
                  </div>
                  {showTrail && (
                    <div className="absolute inset-0 animate-ping">
                      <div className="w-full h-full bg-yellow-400/30 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {pipes.map(pipe => (
              <div key={pipe.id}>
                <div 
                  className="absolute"
                  style={{
                    left: pipe.x,
                    top: 0,
                    width: PIPE_WIDTH,
                    height: pipe.topHeight
                  }}
                >
                  {getPipeDesign(pipe.type, true, PIPE_WIDTH, pipe.topHeight)}
                </div>
                <div 
                  className="absolute"
                  style={{
                    left: pipe.x,
                    top: pipe.bottomY,
                    width: PIPE_WIDTH,
                    height: dimensions.height - pipe.bottomY
                  }}
                >
                  {getPipeDesign(pipe.type, false, PIPE_WIDTH, dimensions.height - pipe.bottomY)}
                </div>
              </div>
            ))}

            {(gameState === 'playing' || gameState === 'waitingForStart') && (
              <div className="absolute top-4 left-4 z-20">
                <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-purple-400/30">
                  <div className="text-2xl font-bold text-yellow-400">Score: {score}</div>
                  <div className="text-sm text-purple-300 flex items-center gap-1">
                    <span>{modes[gameMode].emoji}</span>
                    <span className="capitalize">{modes[gameMode].name}</span>
                  </div>
                </div>
              </div>
            )}

            {gameState === 'waitingForStart' && <WaitingScreen />}
            {gameState === 'menu' && <MenuScreen />}
            {gameState === 'modeSelect' && <ModeSelectScreen />}
            {gameState === 'gameOver' && <GameOverScreen />}
          </div>
        </div>

        <div className="mt-4 text-center text-purple-400 text-sm max-w-md">
          <p className="mb-2">🎮 Controls: Space / ↑ Arrow / Tap to jump</p>
          <p>🚀 Dodge pipes and beat your high score!</p>
        </div>
      </div>
    </div>
  );
};

export default FlappyBird;