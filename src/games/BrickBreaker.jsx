// import React, { useEffect, useRef, useState, useCallback } from 'react';

// const BrickBreaker = () => {
//   const canvasRef = useRef(null);
//   const animationRef = useRef(null);
//   const gameLoopRef = useRef(null);
//   const [gameState, setGameState] = useState('start');
//   const [score, setScore] = useState(0);
//   const [lives, setLives] = useState(3);
//   const [difficulty, setDifficulty] = useState(null);
//   const [bricks, setBricks] = useState([]);
//   const [isPaused, setIsPaused] = useState(false);

//   // Game constants
//   const CANVAS_WIDTH = 800;
//   const CANVAS_HEIGHT = 600;
//   const BRICK_ROWS = 6;
//   const BRICK_COLS = 10;

//   const brickInfo = {
//     w: 70,
//     h: 25,
//     padding: 5,
//     offsetX: 15,
//     offsetY: 80,
//   };

//   const paddle = useRef({
//     x: CANVAS_WIDTH / 2 - 50,
//     y: CANVAS_HEIGHT - 40,
//     w: 100,
//     h: 15,
//     dx: 0,
//     speed: 8
//   });

//   const ball = useRef({
//     x: CANVAS_WIDTH / 2,
//     y: CANVAS_HEIGHT / 2,
//     size: 10,
//     speed: 5,
//     dx: 4,
//     dy: -4
//   });

//   // Generate colorful bricks
//   const generateBricks = () => {
//     const bricksArr = [];
//     const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
    
//     for (let r = 0; r < BRICK_ROWS; r++) {
//       bricksArr[r] = [];
//       for (let c = 0; c < BRICK_COLS; c++) {
//         const x = c * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
//         const y = r * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
//         bricksArr[r][c] = { 
//           x, 
//           y, 
//           ...brickInfo, 
//           visible: true,
//           color: colors[r] || '#ef4444'
//         };
//       }
//     }
//     return bricksArr;
//   };

//   const draw = (ctx) => {
//     // Clear canvas with gradient background
//     const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
//     gradient.addColorStop(0, '#1e293b');
//     gradient.addColorStop(0.5, '#581c87');
//     gradient.addColorStop(1, '#1e293b');
//     ctx.fillStyle = gradient;
//     ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

//     // Ball with glow effect
//     ctx.shadowColor = '#f59e0b';
//     ctx.shadowBlur = 15;
//     ctx.beginPath();
//     ctx.arc(ball.current.x, ball.current.y, ball.current.size, 0, Math.PI * 2);
//     const ballGradient = ctx.createRadialGradient(
//       ball.current.x, ball.current.y, 0,
//       ball.current.x, ball.current.y, ball.current.size
//     );
//     ballGradient.addColorStop(0, '#fbbf24');
//     ballGradient.addColorStop(1, '#f59e0b');
//     ctx.fillStyle = ballGradient;
//     ctx.fill();
//     ctx.closePath();
//     ctx.shadowBlur = 0;

//     // Paddle with gradient
//     ctx.beginPath();
//     ctx.rect(paddle.current.x, paddle.current.y, paddle.current.w, paddle.current.h);
//     const paddleGradient = ctx.createLinearGradient(0, paddle.current.y, 0, paddle.current.y + paddle.current.h);
//     paddleGradient.addColorStop(0, '#f97316');
//     paddleGradient.addColorStop(1, '#ea580c');
//     ctx.fillStyle = paddleGradient;
//     ctx.fill();
//     ctx.closePath();

//     // Game info
//     ctx.font = 'bold 20px Arial';
//     ctx.fillStyle = '#fff';
//     ctx.textAlign = 'left';
//     ctx.fillText(`Score: ${score}`, 20, 35);
//     ctx.fillText(`Lives: ${lives}`, 20, 60);
//     ctx.textAlign = 'right';
//     ctx.fillText(`Difficulty: ${difficulty}`, CANVAS_WIDTH - 20, 35);

//     // Bricks with gradients
//     bricks.forEach(row => {
//       row.forEach(brick => {
//         if (brick.visible) {
//           ctx.beginPath();
//           ctx.rect(brick.x, brick.y, brick.w, brick.h);
//           const brickGradient = ctx.createLinearGradient(0, brick.y, 0, brick.y + brick.h);
//           brickGradient.addColorStop(0, brick.color);
//           brickGradient.addColorStop(1, brick.color + '80');
//           ctx.fillStyle = brickGradient;
//           ctx.fill();
//           ctx.strokeStyle = '#ffffff40';
//           ctx.lineWidth = 1;
//           ctx.stroke();
//           ctx.closePath();
//         }
//       });
//     });

//     // Pause indicator
//     if (isPaused) {
//       ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
//       ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
//       ctx.font = 'bold 48px Arial';
//       ctx.fillStyle = '#fff';
//       ctx.textAlign = 'center';
//       ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
//       ctx.font = '20px Arial';
//       ctx.fillText('Press SPACE to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
//     }
//   };

//   const gameLoop = () => {
//     if (gameState !== 'playing' || isPaused) {
//       const canvas = canvasRef.current;
//       if (canvas) {
//         const ctx = canvas.getContext('2d');
//         draw(ctx);
//       }
//       return;
//     }

//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');

//     // Paddle movement
//     paddle.current.x += paddle.current.dx;
//     if (paddle.current.x < 0) paddle.current.x = 0;
//     if (paddle.current.x + paddle.current.w > CANVAS_WIDTH) {
//       paddle.current.x = CANVAS_WIDTH - paddle.current.w;
//     }

//     // Ball movement
//     ball.current.x += ball.current.dx;
//     ball.current.y += ball.current.dy;

//     // Wall collision
//     if (ball.current.x + ball.current.size > CANVAS_WIDTH || ball.current.x - ball.current.size < 0) {
//       ball.current.dx *= -1;
//     }
//     if (ball.current.y - ball.current.size < 0) {
//       ball.current.dy *= -1;
//     }

//     // Paddle collision with angle calculation
//     if (
//       ball.current.x >= paddle.current.x &&
//       ball.current.x <= paddle.current.x + paddle.current.w &&
//       ball.current.y + ball.current.size >= paddle.current.y &&
//       ball.current.y + ball.current.size <= paddle.current.y + paddle.current.h + 5
//     ) {
//       const hitPos = (ball.current.x - paddle.current.x) / paddle.current.w;
//       const angle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degrees
//       const speed = ball.current.speed;
//       ball.current.dx = Math.sin(angle) * speed;
//       ball.current.dy = -Math.abs(Math.cos(angle) * speed);
//     }

//     // Brick collision
//     let bricksLeft = 0;
//     let hit = false;
//     const updatedBricks = bricks.map(row =>
//       row.map(brick => {
//         if (brick.visible) {
//           bricksLeft++;
//           if (!hit &&
//             ball.current.x + ball.current.size > brick.x &&
//             ball.current.x - ball.current.size < brick.x + brick.w &&
//             ball.current.y + ball.current.size > brick.y &&
//             ball.current.y - ball.current.size < brick.y + brick.h
//           ) {
//             // Determine collision side
//             const ballCenterX = ball.current.x;
//             const ballCenterY = ball.current.y;
//             const brickCenterX = brick.x + brick.w / 2;
//             const brickCenterY = brick.y + brick.h / 2;
            
//             const dx = ballCenterX - brickCenterX;
//             const dy = ballCenterY - brickCenterY;
            
//             if (Math.abs(dx / brick.w) > Math.abs(dy / brick.h)) {
//               ball.current.dx *= -1;
//             } else {
//               ball.current.dy *= -1;
//             }
            
//             setScore(prev => prev + 10);
//             hit = true;
//             return { ...brick, visible: false };
//           }
//         }
//         return brick;
//       })
//     );

//     setBricks(updatedBricks);

//     // Win condition
//     if (bricksLeft === 0) {
//       setGameState('win');
//       return;
//     }

//     // Lose a life
//     if (ball.current.y + ball.current.size > CANVAS_HEIGHT) {
//       setLives(prev => {
//         const newLives = prev - 1;
//         if (newLives <= 0) {
//           setGameState('lose');
//         } else {
//           // Reset ball and paddle position
//           ball.current.x = CANVAS_WIDTH / 2;
//           ball.current.y = CANVAS_HEIGHT / 2;
//           ball.current.dx = ball.current.speed * (Math.random() > 0.5 ? 1 : -1);
//           ball.current.dy = -ball.current.speed;
//           paddle.current.x = CANVAS_WIDTH / 2 - paddle.current.w / 2;
//         }
//         return newLives;
//       });
//     }

//     draw(ctx);
//   };

//   const startGame = (mode) => {
//     // Clear any existing game loop
//     if (gameLoopRef.current) {
//       clearInterval(gameLoopRef.current);
//     }

//     // Reset game state
//     setScore(0);
//     setLives(3);
//     setIsPaused(false);
    
//     // Generate new bricks
//     const newBricks = generateBricks();
//     setBricks(newBricks);

//     // Reset positions
//     paddle.current.x = CANVAS_WIDTH / 2 - paddle.current.w / 2;
//     paddle.current.y = CANVAS_HEIGHT - 40;
//     paddle.current.dx = 0;

//     ball.current.x = CANVAS_WIDTH / 2;
//     ball.current.y = CANVAS_HEIGHT / 2;
    
//     const speeds = { easy: 4, medium: 5, hard: 6 };
//     ball.current.speed = speeds[mode] || 5;
//     ball.current.dx = ball.current.speed * (Math.random() > 0.5 ? 1 : -1);
//     ball.current.dy = -ball.current.speed;

//     setDifficulty(mode);
//     setGameState('playing');

//     // Start game loop
//     gameLoopRef.current = setInterval(gameLoop, 1000 / 60); // 60 FPS
//   };

//   const togglePause = () => {
//     if (gameState === 'playing') {
//       setIsPaused(prev => !prev);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (gameState !== 'playing') return;
    
//     switch (e.key) {
//       case 'ArrowRight':
//       case 'd':
//       case 'D':
//         paddle.current.dx = paddle.current.speed;
//         break;
//       case 'ArrowLeft':
//       case 'a':
//       case 'A':
//         paddle.current.dx = -paddle.current.speed;
//         break;
//       case ' ':
//         e.preventDefault();
//         togglePause();
//         break;
//     }
//   };

//   const handleKeyUp = (e) => {
//     if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || 
//         e.key === 'd' || e.key === 'D' || e.key === 'a' || e.key === 'A') {
//       paddle.current.dx = 0;
//     }
//   };

//   // Touch controls for mobile
//   const handleTouchStart = (e) => {
//     e.preventDefault();
//     const rect = canvasRef.current?.getBoundingClientRect();
//     if (!rect) return;
    
//     const touch = e.touches[0];
//     const x = touch.clientX - rect.left;
//     const centerX = rect.width / 2;
    
//     if (x < centerX) {
//       paddle.current.dx = -paddle.current.speed;
//     } else {
//       paddle.current.dx = paddle.current.speed;
//     }
//   };

//   const handleTouchEnd = () => {
//     paddle.current.dx = 0;
//   };

//   const resetGame = () => {
//     if (gameLoopRef.current) {
//       clearInterval(gameLoopRef.current);
//     }
//     setGameState('start');
//     setScore(0);
//     setLives(3);
//     setDifficulty(null);
//     setBricks([]);
//     setIsPaused(false);
//     paddle.current.dx = 0;
//   };

//   useEffect(() => {
//     window.addEventListener('keydown', handleKeyDown);
//     window.addEventListener('keyup', handleKeyUp);
    
//     const canvas = canvasRef.current;
//     if (canvas) {
//       canvas.addEventListener('touchstart', handleTouchStart);
//       canvas.addEventListener('touchend', handleTouchEnd);
//     }

//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//       window.removeEventListener('keyup', handleKeyUp);
//       if (canvas) {
//         canvas.removeEventListener('touchstart', handleTouchStart);
//         canvas.removeEventListener('touchend', handleTouchEnd);
//       }
//       if (gameLoopRef.current) {
//         clearInterval(gameLoopRef.current);
//       }
//     };
//   }, []);

//   // Handle game state changes
//   useEffect(() => {
//     if (gameState === 'win' || gameState === 'lose') {
//       if (gameLoopRef.current) {
//         clearInterval(gameLoopRef.current);
//       }
//     }
//   }, [gameState]);

//   // Draw initial state
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (canvas) {
//       const ctx = canvas.getContext('2d');
//       if (gameState === 'start') {
//         // Draw empty canvas with gradient
//         const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
//         gradient.addColorStop(0, '#1e293b');
//         gradient.addColorStop(0.5, '#581c87');
//         gradient.addColorStop(1, '#1e293b');
//         ctx.fillStyle = gradient;
//         ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
//         // Welcome text
//         ctx.font = 'bold 36px Arial';
//         ctx.fillStyle = '#fff';
//         ctx.textAlign = 'center';
//         ctx.fillText('BRICK BREAKER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
//         ctx.font = '20px Arial';
//         ctx.fillText('Select difficulty to start!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
//       } else {
//         draw(ctx);
//       }
//     }
//   }, [gameState, bricks, score, lives, difficulty, isPaused]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden">
//       <div className="flex flex-col items-center justify-center min-h-screen p-4">
//         <div className="text-center mb-8">
//           <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
//             🎮 BRICK BREAKER
//           </h1>
//           <p className="text-lg text-gray-300">Break all the bricks to win!</p>
//         </div>

//         {gameState === 'start' && (
//           <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
//             <h2 className="text-2xl font-bold mb-6 text-center">Select Difficulty</h2>
//             <div className="flex flex-col sm:flex-row gap-4">
//               <button 
//                 className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105"
//                 onClick={() => startGame('easy')}
//               >
//                 🟢 Easy
//               </button>
//               <button 
//                 className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105"
//                 onClick={() => startGame('medium')}
//               >
//                 🟡 Medium
//               </button>
//               <button 
//                 className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105"
//                 onClick={() => startGame('hard')}
//               >
//                 🔴 Hard
//               </button>
//             </div>
//             <div className="mt-6 text-sm text-gray-400 text-center">
//               <p>Use arrow keys or A/D to move paddle</p>
//               <p>Press SPACE to pause during game</p>
//               <p className="md:hidden">Tap left/right side of screen to move on mobile</p>
//             </div>
//           </div>
//         )}

//         {gameState !== 'start' && (
//           <div className="flex flex-col items-center">
//             <canvas
//               ref={canvasRef}
//               width={CANVAS_WIDTH}
//               height={CANVAS_HEIGHT}
//               className="border-4 border-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-xl shadow-2xl max-w-full h-auto"
//               style={{
//                 background: 'linear-gradient(135deg, #1e293b 0%, #581c87 50%, #1e293b 100%)',
//                 maxWidth: '100vw',
//                 maxHeight: '70vh'
//               }}
//             />
            
//             {gameState === 'win' && (
//               <div className="mt-6 text-center bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-green-500/20">
//                 <p className="text-3xl font-bold text-green-400 mb-2">🏆 Victory!</p>
//                 <p className="text-xl mb-4">Final Score: {score}</p>
//               </div>
//             )}
            
//             {gameState === 'lose' && (
//               <div className="mt-6 text-center bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-red-500/20">
//                 <p className="text-3xl font-bold text-red-400 mb-2">💀 Game Over</p>
//                 <p className="text-xl mb-4">Final Score: {score}</p>
//               </div>
//             )}
            
//             {(gameState === 'win' || gameState === 'lose') && (
//               <div className="flex gap-4 mt-4">
//                 <button 
//                   className="px-6 py-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 text-black font-bold rounded-xl transition-all duration-200 transform hover:scale-105"
//                   onClick={resetGame}
//                 >
//                   🎮 Play Again
//                 </button>
//               </div>
//             )}
            
//             {gameState === 'playing' && (
//               <div className="mt-4 flex gap-4">
//                 <button 
//                   className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
//                   onClick={togglePause}
//                 >
//                   {isPaused ? '▶️ Resume' : '⏸️ Pause'}
//                 </button>
//                 <button 
//                   className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200"
//                   onClick={resetGame}
//                 >
//                   🏠 Menu
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BrickBreaker;

import React, { useEffect, useRef, useState } from 'react';

const BrickBreaker = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [difficulty, setDifficulty] = useState('');

  // Game objects
  const gameObjects = useRef({
    paddle: { x: 350, y: 550, w: 100, h: 15, dx: 0, speed: 8 },
    ball: { x: 400, y: 300, size: 10, dx: 4, dy: -4, speed: 4 },
    bricks: []
  });

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  // Create bricks
  const createBricks = () => {
    const bricks = [];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
    
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 10; col++) {
        bricks.push({
          x: col * 75 + 25,
          y: row * 30 + 80,
          w: 70,
          h: 25,
          visible: true,
          color: colors[row]
        });
      }
    }
    return bricks;
  };

  // Draw everything
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const { paddle, ball, bricks } = gameObjects.current;

    // Draw paddle
    ctx.fillStyle = '#f97316';
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

    // Draw ball
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();

    // Draw bricks
    bricks.forEach(brick => {
      if (brick.visible) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
      }
    });

    // Draw UI
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Lives: ${lives}`, 20, 55);
    ctx.fillText(`Difficulty: ${difficulty}`, 600, 30);
  };

  // Update game
  const update = () => {
    if (gameState !== 'playing') return;

    const { paddle, ball, bricks } = gameObjects.current;

    // Move paddle
    paddle.x += paddle.dx;
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.w > CANVAS_WIDTH) paddle.x = CANVAS_WIDTH - paddle.w;

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball wall collision
    if (ball.x <= ball.size || ball.x >= CANVAS_WIDTH - ball.size) {
      ball.dx = -ball.dx;
    }
    if (ball.y <= ball.size) {
      ball.dy = -ball.dy;
    }

    // Ball paddle collision
    if (ball.y + ball.size >= paddle.y &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.w) {
      ball.dy = -Math.abs(ball.dy);
    }

    // Ball brick collision
    let bricksLeft = 0;
    bricks.forEach(brick => {
      if (!brick.visible) return;
      bricksLeft++;

      if (ball.x + ball.size > brick.x &&
          ball.x - ball.size < brick.x + brick.w &&
          ball.y + ball.size > brick.y &&
          ball.y - ball.size < brick.y + brick.h) {
        brick.visible = false;
        ball.dy = -ball.dy;
        setScore(prev => prev + 10);
      }
    });

    // Check win
    if (bricksLeft === 0) {
      setGameState('win');
      return;
    }

    // Check lose life
    if (ball.y > CANVAS_HEIGHT) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('lose');
        } else {
          // Reset ball
          ball.x = CANVAS_WIDTH / 2;
          ball.y = CANVAS_HEIGHT / 2;
          ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
          ball.dy = -ball.speed;
        }
        return newLives;
      });
    }
  };

  // Game loop
  const gameLoop = () => {
    update();
    draw();
  };

  // Start game
  const startGame = (mode) => {
    console.log('Starting game with difficulty:', mode);
    
    // Stop any existing game loop
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    // Reset game state
    setScore(0);
    setLives(3);
    setDifficulty(mode);

    // Reset game objects
    const speeds = { easy: 3, medium: 4, hard: 5 };
    const speed = speeds[mode] || 4;

    gameObjects.current = {
      paddle: { x: 350, y: 550, w: 100, h: 15, dx: 0, speed: 8 },
      ball: { x: 400, y: 300, size: 10, dx: speed, dy: -speed, speed },
      bricks: createBricks()
    };

    setGameState('playing');

    // Start game loop
    gameLoopRef.current = setInterval(gameLoop, 1000 / 60);
  };

  // Reset to start
  const resetGame = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    setGameState('start');
    setScore(0);
    setLives(3);
    setDifficulty('');
  };

  // Handle keyboard input
  const handleKeyDown = (e) => {
    if (gameState !== 'playing') return;
    
    const { paddle } = gameObjects.current;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      paddle.dx = -paddle.speed;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      paddle.dx = paddle.speed;
    }
  };

  const handleKeyUp = (e) => {
    if (gameState !== 'playing') return;
    
    const { paddle } = gameObjects.current;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
        e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D') {
      paddle.dx = 0;
    }
  };

  // Setup event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState]);

  // Initial draw
  useEffect(() => {
    draw();
  }, [gameState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            🎮 BRICK BREAKER
          </h1>
          <p className="text-lg text-gray-300">Break all the bricks to win!</p>
        </div>

        {/* Start Screen */}
        {gameState === 'start' && (
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Select Difficulty</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105"
                onClick={() => startGame('easy')}
              >
                🟢 Easy
              </button>
              <button 
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105"
                onClick={() => startGame('medium')}
              >
                🟡 Medium
              </button>
              <button 
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105"
                onClick={() => startGame('hard')}
              >
                🔴 Hard
              </button>
            </div>
            <div className="mt-6 text-sm text-gray-400 text-center">
              <p>Use arrow keys or A/D to move paddle</p>
            </div>
          </div>
        )}

        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-xl shadow-2xl bg-slate-800"
          style={{ maxWidth: '100%', height: 'auto' }}
        />

        {/* Game Over Screens */}
        {gameState === 'win' && (
          <div className="mt-6 text-center bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-green-500/20">
            <p className="text-3xl font-bold text-green-400 mb-2">🏆 Victory!</p>
            <p className="text-xl mb-4">Final Score: {score}</p>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 text-black font-bold rounded-xl transition-all duration-200 transform hover:scale-105"
              onClick={resetGame}
            >
              🎮 Play Again
            </button>
          </div>
        )}

        {gameState === 'lose' && (
          <div className="mt-6 text-center bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-red-500/20">
            <p className="text-3xl font-bold text-red-400 mb-2">💀 Game Over</p>
            <p className="text-xl mb-4">Final Score: {score}</p>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 text-black font-bold rounded-xl transition-all duration-200 transform hover:scale-105"
              onClick={resetGame}
            >
              🎮 Play Again
            </button>
          </div>
        )}

        {/* In-game controls */}
        {gameState === 'playing' && (
          <div className="mt-4">
            <button 
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200"
              onClick={resetGame}
            >
              🏠 Menu
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default BrickBreaker;