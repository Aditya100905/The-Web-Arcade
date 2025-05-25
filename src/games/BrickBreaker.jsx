import React, { useState, useEffect, useCallback, useRef } from "react";

const BrickBreakerGame = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [gameState, setGameState] = useState("menu"); // 'menu', 'difficulty', 'playing', 'paused', 'gameOver', 'victory'
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState("medium");

  // Game configuration based on difficulty - reduced speeds for better playability
  const getDifficultyConfig = (diff) => {
    const configs = {
      easy: { ballSpeed: 3, paddleSpeed: 8, paddleWidth: 140, lives: 5 },
      medium: { ballSpeed: 4, paddleSpeed: 7, paddleWidth: 120, lives: 3 },
      hard: { ballSpeed: 5, paddleSpeed: 6, paddleWidth: 100, lives: 2 },
    };
    return configs[diff];
  };

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PADDLE_Y = 550;

  // Power-up types
  const POWERUP_TYPES = {
    EXPAND_PADDLE: { color: "#10b981", symbol: "⬌", effect: "expand" },
    SHRINK_PADDLE: { color: "#ef4444", symbol: "⬍", effect: "shrink" },
    MULTI_BALL: { color: "#f59e0b", symbol: "●●", effect: "multiball" },
    EXTRA_LIFE: { color: "#ec4899", symbol: "♥", effect: "life" },
    BIGGER_BALL: { color: "#8b5cf6", symbol: "●", effect: "bigball" },
  };

  // Game objects
  const gameRef = useRef({
    balls: [],
    paddle: { x: 0, y: PADDLE_Y, width: 120, height: 15, speed: 8 },
    bricks: [],
    powerups: [],
    keys: {},
    gameStarted: false,
    originalPaddleWidth: 120,
  });

  // Load high score from memory (simulating localStorage)
  const [savedHighScores, setSavedHighScores] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  // Initialize high scores on mount
  useEffect(() => {
    const loadHighScores = () => {
      const stored = localStorage.getItem("brickBreakerHighScores");
      if (stored) {
        return JSON.parse(stored);
      } else {
        return { easy: 0, medium: 0, hard: 0 };
      }
    };

    const scores = loadHighScores();
    setSavedHighScores(scores);
    setHighScore(scores[difficulty]);
  }, []);

  // Save high score (simulating localStorage)
  const saveHighScore = useCallback((newScore, diff) => {
    setSavedHighScores((prev) => {
      const updated = { ...prev, [diff]: Math.max(prev[diff], newScore) };
      localStorage.setItem("brickBreakerHighScores", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Initialize balls with better physics
  const createBall = (
    x = CANVAS_WIDTH / 2,
    y = CANVAS_HEIGHT / 2,
    dx = null,
    dy = null
  ) => {
    const config = getDifficultyConfig(difficulty);
    // Gradually increase speed with level but keep it reasonable
    const levelSpeedMultiplier = 1 + (level - 1) * 0.1; // 10% increase per level
    const ballSpeed = config.ballSpeed * Math.min(levelSpeedMultiplier, 1.5); // Cap at 1.5x

    return {
      x,
      y,
      dx: dx || ballSpeed * (Math.random() > 0.5 ? 1 : -1),
      dy: dy || -ballSpeed,
      radius: 10,
      active: true,
      lastCollision: null, // Track last collision to prevent stuck balls
    };
  };

  // Generate randomized brick patterns
  const generateBrickPattern = (level) => {
    const patterns = [
      // Standard grid
      (r, c, rows, cols) => true,
      // Pyramid
      (r, c, rows, cols) => {
        const center = Math.floor(cols / 2);
        const width = Math.floor(((rows - r) * cols) / rows / 2);
        return Math.abs(c - center) <= width;
      },
      // Diamond
      (r, c, rows, cols) => {
        const centerR = Math.floor(rows / 2);
        const centerC = Math.floor(cols / 2);
        const distance = Math.abs(r - centerR) + Math.abs(c - centerC);
        return distance <= Math.min(centerR, centerC);
      },
      // Checkerboard with gaps
      (r, c, rows, cols) => (r + c) % 2 === 0 && Math.random() > 0.2,
      // Random scattered
      (r, c, rows, cols) => Math.random() > 0.3,
      // Side walls
      (r, c, rows, cols) => c < 2 || c >= cols - 2 || r < 2,
    ];

    const patternIndex = (level - 1) % patterns.length;
    return patterns[patternIndex];
  };

  // Initialize bricks with randomized layouts and better hit mechanics
  const initializeBricks = useCallback((level) => {
    const bricks = [];
    const rows = Math.min(5 + Math.floor(level / 3), 8); // Slower row increase
    const cols = 10;
    const brickWidth = 75;
    const brickHeight = 25;
    const padding = 2;
    const offsetTop = 80;
    const totalWidth = cols * brickWidth + (cols - 1) * padding;
    const offsetLeft = (CANVAS_WIDTH - totalWidth) / 2;

    const pattern = generateBrickPattern(level);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!pattern(r, c, rows, cols)) continue;

        // More varied hit counts based on position and level
        let hitCount;
        if (r < 2)
          hitCount = Math.min(1 + Math.floor(level / 4), 3); // Top rows harder
        else if (r < 4) hitCount = Math.min(1 + Math.floor(level / 6), 2);
        else hitCount = 1;

        // Add some randomization
        if (Math.random() < 0.2) hitCount = Math.min(hitCount + 1, 4);

        const maxHits = hitCount;

        // Determine brick color based on hits required
        let color;
        if (hitCount === 1) color = "#06b6d4"; // cyan
        else if (hitCount === 2) color = "#3b82f6"; // blue
        else if (hitCount === 3) color = "#4f46e5"; // indigo
        else color = "#7c3aed"; // purple

        bricks.push({
          x: c * (brickWidth + padding) + offsetLeft,
          y: r * (brickHeight + padding) + offsetTop,
          width: brickWidth,
          height: brickHeight,
          hits: hitCount,
          maxHits: maxHits,
          color: color,
          visible: true,
          points: hitCount * 10 + level * 5, // Better scoring
          hasPowerup: Math.random() < 0.12, // Slightly reduced powerup chance
          lastHit: 0, // Track when brick was last hit
        });
      }
    }
    return bricks;
  }, []);

  // Create powerup
  const createPowerup = (x, y) => {
    const types = Object.keys(POWERUP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      x,
      y,
      width: 30,
      height: 20,
      type,
      dy: 1.5, // Slower falling powerups
      active: true,
    };
  };

  // Reset game state
  const resetGame = useCallback(() => {
    const game = gameRef.current;
    const config = getDifficultyConfig(difficulty);

    game.paddle.x = CANVAS_WIDTH / 2 - config.paddleWidth / 2;
    game.paddle.width = config.paddleWidth;
    game.paddle.speed = config.paddleSpeed;
    game.originalPaddleWidth = config.paddleWidth;

    game.balls = [createBall()];
    game.bricks = initializeBricks(level);
    game.powerups = [];
    game.gameStarted = false;

    setLives(config.lives);
  }, [level, difficulty, initializeBricks]);

  // Apply powerup effects with better balance
  const applyPowerup = useCallback((type) => {
    const game = gameRef.current;

    switch (POWERUP_TYPES[type].effect) {
      case "expand":
        game.paddle.width = Math.min(game.paddle.width + 25, 180);
        break;
      case "shrink":
        game.paddle.width = Math.max(game.paddle.width - 15, 70);
        break;
      case "multiball":
        if (game.balls.length < 4) {
          // Limit to 4 balls max
          const mainBall = game.balls.find((b) => b.active);
          if (mainBall) {
            const angle1 = Math.PI / 6; // 30 degrees
            const angle2 = -Math.PI / 6; // -30 degrees
            const speed = Math.sqrt(
              mainBall.dx * mainBall.dx + mainBall.dy * mainBall.dy
            );

            game.balls.push(
              createBall(
                mainBall.x,
                mainBall.y,
                speed * Math.sin(angle1),
                -speed * Math.cos(angle1)
              )
            );
            game.balls.push(
              createBall(
                mainBall.x,
                mainBall.y,
                speed * Math.sin(angle2),
                -speed * Math.cos(angle2)
              )
            );
          }
        }
        break;
      case "life":
        setLives((prev) => Math.min(prev + 1, 5));
        break;
      case "bigball":
        game.balls.forEach((ball) => {
          if (ball.active) ball.radius = Math.min(ball.radius + 2, 14);
        });
        break;
    }
  }, []);

  // Improved collision detection
  const circleRectCollision = (circle, rect) => {
    const distX = Math.abs(circle.x - rect.x - rect.width / 2);
    const distY = Math.abs(circle.y - rect.y - rect.height / 2);

    if (distX > rect.width / 2 + circle.radius) return false;
    if (distY > rect.height / 2 + circle.radius) return false;

    if (distX <= rect.width / 2) return true;
    if (distY <= rect.height / 2) return true;

    const dx = distX - rect.width / 2;
    const dy = distY - rect.height / 2;
    return dx * dx + dy * dy <= circle.radius * circle.radius;
  };

  // Better brick collision handling
  const handleBrickCollision = (ball, brick) => {
    const ballCenterX = ball.x;
    const ballCenterY = ball.y;
    const brickCenterX = brick.x + brick.width / 2;
    const brickCenterY = brick.y + brick.height / 2;

    const deltaX = ballCenterX - brickCenterX;
    const deltaY = ballCenterY - brickCenterY;

    const overlapX = brick.width / 2 + ball.radius - Math.abs(deltaX);
    const overlapY = brick.height / 2 + ball.radius - Math.abs(deltaY);

    // Determine collision side based on overlap
    if (overlapX < overlapY) {
      // Horizontal collision
      ball.dx = -ball.dx;
      ball.x =
        deltaX > 0
          ? brick.x + brick.width + ball.radius
          : brick.x - ball.radius;
    } else {
      // Vertical collision
      ball.dy = -ball.dy;
      ball.y =
        deltaY > 0
          ? brick.y + brick.height + ball.radius
          : brick.y - ball.radius;
    }

    // Add slight randomness to prevent straight bouncing
    ball.dx += (Math.random() - 0.5) * 0.5;
    ball.dy += (Math.random() - 0.5) * 0.2;

    // Normalize speed to prevent acceleration
    const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    const config = getDifficultyConfig(difficulty);
    const targetSpeed = config.ballSpeed * (1 + (level - 1) * 0.1);

    if (currentSpeed > targetSpeed * 1.2) {
      ball.dx = (ball.dx / currentSpeed) * targetSpeed;
      ball.dy = (ball.dy / currentSpeed) * targetSpeed;
    }
  };

  // Game loop with improved physics
  const gameLoop = useCallback(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const game = gameRef.current;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );
    gradient.addColorStop(0, "#0f172a");
    gradient.addColorStop(0.5, "#581c87");
    gradient.addColorStop(1, "#0f172a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Handle paddle movement with smoother controls
    const paddleSpeed = game.paddle.speed;
    if (game.keys["ArrowLeft"] && game.paddle.x > 0) {
      game.paddle.x = Math.max(0, game.paddle.x - paddleSpeed);
    }
    if (
      game.keys["ArrowRight"] &&
      game.paddle.x + game.paddle.width < CANVAS_WIDTH
    ) {
      game.paddle.x = Math.min(
        CANVAS_WIDTH - game.paddle.width,
        game.paddle.x + paddleSpeed
      );
    }

    // Start ball movement on first input
    if (
      !game.gameStarted &&
      (game.keys["ArrowLeft"] || game.keys["ArrowRight"] || game.keys[" "])
    ) {
      game.gameStarted = true;
    }

    // Move balls with improved physics
    if (game.gameStarted) {
      game.balls.forEach((ball) => {
        if (!ball.active) return;

        ball.x += ball.dx;
        ball.y += ball.dy;

        // Ball collision with walls
        if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= CANVAS_WIDTH) {
          ball.dx = -ball.dx;
          ball.x = Math.max(
            ball.radius,
            Math.min(CANVAS_WIDTH - ball.radius, ball.x)
          );
        }
        if (ball.y - ball.radius <= 0) {
          ball.dy = Math.abs(ball.dy); // Always bounce down from top
          ball.y = ball.radius;
        }

        // Ball collision with paddle - improved physics
        const paddleRect = {
          x: game.paddle.x,
          y: game.paddle.y,
          width: game.paddle.width,
          height: game.paddle.height,
        };

        if (circleRectCollision(ball, paddleRect) && ball.dy > 0) {
          const paddleCenter = game.paddle.x + game.paddle.width / 2;
          const hitPos = (ball.x - paddleCenter) / (game.paddle.width / 2);

          // Clamp hit position
          const clampedHitPos = Math.max(-1, Math.min(1, hitPos));

          // Calculate angle based on hit position (max 60 degrees)
          const maxAngle = Math.PI / 3;
          const angle = clampedHitPos * maxAngle;

          const config = getDifficultyConfig(difficulty);
          const speed = config.ballSpeed * (1 + (level - 1) * 0.1);

          ball.dx = speed * Math.sin(angle);
          ball.dy = -Math.abs(speed * Math.cos(angle));

          // Ensure ball is above paddle
          ball.y = game.paddle.y - ball.radius - 1;
        }

        // Ball collision with bricks - improved detection
        game.bricks.forEach((brick, brickIndex) => {
          if (brick.visible && circleRectCollision(ball, brick)) {
            // Prevent multiple hits in same frame
            if (ball.lastCollision === brickIndex) return;
            ball.lastCollision = brickIndex;

            brick.hits--;
            brick.lastHit = Date.now();

            if (brick.hits <= 0) {
              brick.visible = false;
              setScore((prev) => prev + brick.points);

              // Create powerup if brick had one
              if (brick.hasPowerup) {
                game.powerups.push(
                  createPowerup(
                    brick.x + brick.width / 2,
                    brick.y + brick.height
                  )
                );
              }
            } else {
              setScore((prev) => prev + Math.floor(brick.points / 3)); // Partial hit points
            }

            handleBrickCollision(ball, brick);
          }
        });

        // Reset collision tracking after some distance
        if (Math.abs(ball.dx) + Math.abs(ball.dy) > 0) {
          ball.lastCollision = null;
        }

        // Check if ball fell off screen
        if (ball.y > CANVAS_HEIGHT + 50) {
          ball.active = false;
        }
      });

      // Remove inactive balls and check for game over
      game.balls = game.balls.filter((ball) => ball.active);
      if (game.balls.length === 0) {
        setLives((prev) => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameState("gameOver");
            saveHighScore(score, difficulty);
            setHighScore(Math.max(savedHighScores[difficulty], score));
          } else {
            game.balls = [createBall()];
            game.gameStarted = false;
          }
          return newLives;
        });
      }
    }

    // Move powerups
    game.powerups.forEach((powerup) => {
      if (powerup.active) {
        powerup.y += powerup.dy;

        // Check powerup collision with paddle
        const paddleRect = {
          x: game.paddle.x,
          y: game.paddle.y,
          width: game.paddle.width,
          height: game.paddle.height,
        };

        if (
          powerup.x >= paddleRect.x &&
          powerup.x <= paddleRect.x + paddleRect.width &&
          powerup.y + powerup.height >= paddleRect.y &&
          powerup.y <= paddleRect.y + paddleRect.height
        ) {
          powerup.active = false;
          applyPowerup(powerup.type);
        }

        // Remove powerups that fall off screen
        if (powerup.y > CANVAS_HEIGHT) {
          powerup.active = false;
        }
      }
    });

    game.powerups = game.powerups.filter((p) => p.active);

    // Check for victory
    const visibleBricks = game.bricks.filter((brick) => brick.visible);
    if (visibleBricks.length === 0) {
      setGameState("victory");
    }

    // Draw paddle with gradient
    const paddleGradient = ctx.createLinearGradient(
      game.paddle.x,
      game.paddle.y,
      game.paddle.x + game.paddle.width,
      game.paddle.y + game.paddle.height
    );
    paddleGradient.addColorStop(0, "#06b6d4");
    paddleGradient.addColorStop(0.5, "#3b82f6");
    paddleGradient.addColorStop(1, "#4f46e5");

    ctx.fillStyle = paddleGradient;
    ctx.shadowColor = "#06b6d4";
    ctx.shadowBlur = 15;
    ctx.fillRect(
      game.paddle.x,
      game.paddle.y,
      game.paddle.width,
      game.paddle.height
    );
    ctx.shadowBlur = 0;

    // Draw balls
    game.balls.forEach((ball) => {
      if (ball.active) {
        const ballGradient = ctx.createRadialGradient(
          ball.x,
          ball.y,
          0,
          ball.x,
          ball.y,
          ball.radius
        );
        ballGradient.addColorStop(0, "#ffffff");
        ballGradient.addColorStop(0.6, "#06b6d4");
        ballGradient.addColorStop(1, "#4f46e5");

        ctx.fillStyle = ballGradient;
        ctx.shadowColor = "#06b6d4";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Draw bricks with hit indicators and damage effects
    game.bricks.forEach((brick) => {
      if (brick.visible) {
        const alpha = brick.hits / brick.maxHits;
        const timeSinceHit = Date.now() - brick.lastHit;
        const flashEffect =
          timeSinceHit < 200 ? Math.sin(timeSinceHit / 20) * 0.3 : 0;

        ctx.fillStyle = brick.color;
        ctx.globalAlpha = Math.max(0.3, alpha * 0.7 + flashEffect);
        ctx.shadowColor = brick.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

        // Add highlight
        const highlight = ctx.createLinearGradient(
          brick.x,
          brick.y,
          brick.x,
          brick.y + brick.height
        );
        highlight.addColorStop(0, "rgba(255, 255, 255, 0.4)");
        highlight.addColorStop(1, "rgba(255, 255, 255, 0.1)");
        ctx.fillStyle = highlight;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

        // Draw hit count
        if (brick.maxHits > 1) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = "white";
          ctx.font = "bold 12px Arial";
          ctx.textAlign = "center";
          ctx.fillText(
            brick.hits.toString(),
            brick.x + brick.width / 2,
            brick.y + brick.height / 2 + 4
          );
        }

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
    });

    // Draw powerups
    game.powerups.forEach((powerup) => {
      if (powerup.active) {
        ctx.fillStyle = POWERUP_TYPES[powerup.type].color;
        ctx.shadowColor = POWERUP_TYPES[powerup.type].color;
        ctx.shadowBlur = 10;
        ctx.fillRect(
          powerup.x - powerup.width / 2,
          powerup.y,
          powerup.width,
          powerup.height
        );

        ctx.fillStyle = "white";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          POWERUP_TYPES[powerup.type].symbol,
          powerup.x,
          powerup.y + powerup.height / 2 + 4
        );
        ctx.shadowBlur = 0;
      }
    });

    // Draw instructions if game hasn't started
    if (!game.gameStarted) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        "Press ARROW KEYS or SPACE to start!",
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 + 50
      );
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [
    gameState,
    score,
    difficulty,
    level,
    applyPowerup,
    saveHighScore,
    savedHighScores,
  ]);

  // Start game loop
  useEffect(() => {
    if (gameState === "playing") {
      animationRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();
      gameRef.current.keys[e.key] = true;

      if (e.key === " ") {
        if (gameState === "playing") {
          setGameState("paused");
        } else if (gameState === "paused") {
          setGameState("playing");
        }
      }
    };

    const handleKeyUp = (e) => {
      gameRef.current.keys[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  // Mouse/touch controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e) => {
      if (gameState === "playing") {
        const rect = canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const x = (e.clientX - rect.left) * scaleX;
        gameRef.current.paddle.x = Math.max(
          0,
          Math.min(
            x - gameRef.current.paddle.width / 2,
            CANVAS_WIDTH - gameRef.current.paddle.width
          )
        );
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (gameState === "playing" && e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const x = (e.touches[0].clientX - rect.left) * scaleX;
        gameRef.current.paddle.x = Math.max(
          0,
          Math.min(
            x - gameRef.current.paddle.width / 2,
            CANVAS_WIDTH - gameRef.current.paddle.width
          )
        );
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, [gameState]);

  // Update high score when difficulty changes
  useEffect(() => {
    setHighScore(savedHighScores[difficulty]);
  }, [difficulty, savedHighScores]);

  // Game control functions
  const startGame = () => {
    setScore(0);
    setLevel(1);
    resetGame();
    setGameState("playing");
  };

  const selectDifficulty = (diff) => {
    setDifficulty(diff);
    setGameState("menu");
  };

  const nextLevel = () => {
    setLevel((prev) => prev + 1);
    resetGame();
    setGameState("playing");
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      resetGame();
    }
  }, [resetGame]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-x-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-cyan-400 rounded-full animate-pulse opacity-40 animation-delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse opacity-50 animation-delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-indigo-400 rounded-full animate-pulse opacity-30 animation-delay-3000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-6 drop-shadow-2xl animate-pulse">
            BRICK BREAKER
          </h1>
          <div className="flex justify-center flex-wrap gap-6 text-xl">
            <div className="flex flex-col items-center bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
              <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">
                Score
              </span>
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                {score.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col items-center bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-red-500/30 shadow-lg hover:shadow-red-500/20 transition-all duration-300">
              <span className="text-red-400 font-semibold text-sm uppercase tracking-wider">
                Lives
              </span>
              <div className="text-3xl">
                {Array.from({ length: lives }, (_, i) => (
                  <span
                    key={i}
                    className="text-red-500 drop-shadow-lg animate-pulse"
                  >
                    ♥
                  </span>
                ))}
                {Array.from(
                  { length: getDifficultyConfig(difficulty).lives - lives },
                  (_, i) => (
                    <span key={i} className="text-gray-600/50">
                      ♡
                    </span>
                  )
                )}
              </div>
            </div>
            <div className="flex flex-col items-center bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30 shadow-lg hover:shadow-yellow-500/20 transition-all duration-300">
              <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">
                Level
              </span>
              <span className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                {level}
              </span>
            </div>
            <div className="flex flex-col items-center bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <span className="text-purple-400 font-semibold text-sm uppercase tracking-wider">
                High Score
              </span>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent">
                {highScore.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 capitalize mt-1 px-2 py-1 bg-slate-700/50 rounded-full">
                ({difficulty})
              </span>
            </div>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="border-4 border-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-2xl shadow-2xl shadow-orange-500/30 bg-gradient-to-br bg-from-slate-900 bg-to-purple-900 hover:shadow-orange-500/50 transition-shadow duration-500"
              style={{ maxWidth: "100%", height: "auto" }}
            />

            {/* Game State Overlays */}
            {gameState === "menu" && (
              <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-slate-900/90 to-purple-900/90 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <div className="text-center p-8">
                  <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent animate-pulse">
                    Welcome to Brick Breaker!
                  </h2>
                  <div className="space-y-6">
                    <button
                      onClick={() => setGameState("difficulty")}
                      className="block w-full px-10 py-5 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 rounded-xl font-bold text-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-orange-500/50 border border-orange-400/30"
                    >
                      🎮 Start Game
                    </button>
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30">
                      <p className="text-orange-300 text-xl font-semibold mb-4">
                        🎯 Controls
                      </p>
                      <div className="space-y-2 text-gray-300 text-lg">
                        <p className="flex items-center justify-center gap-2">
                          <span className="bg-slate-700 px-3 py-1 rounded-lg text-sm">
                            ←→
                          </span>{" "}
                          Arrow keys or mouse to move paddle
                        </p>
                        <p className="flex items-center justify-center gap-2">
                          <span className="bg-slate-700 px-3 py-1 rounded-lg text-sm">
                            SPACE
                          </span>{" "}
                          Pause/Unpause
                        </p>
                        <p className="text-yellow-400">
                          ✨ Collect power-ups for special effects!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {gameState === "difficulty" && (
              <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-slate-900/90 to-purple-900/90 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <div className="text-center p-8">
                  <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                    🎯 Choose Difficulty
                  </h2>
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        selectDifficulty("easy");
                        startGame();
                      }}
                      className="block w-full px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50 border border-green-400/30"
                    >
                      🟢 Easy{" "}
                      <span className="text-sm opacity-80">
                        (5 Lives, Slow Ball)
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        selectDifficulty("medium");
                        startGame();
                      }}
                      className="block w-full px-10 py-5 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/50 border border-yellow-400/30"
                    >
                      🟡 Medium{" "}
                      <span className="text-sm opacity-80">
                        (3 Lives, Normal Ball)
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        selectDifficulty("hard");
                        startGame();
                      }}
                      className="block w-full px-10 py-5 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/50 border border-red-400/30"
                    >
                      🔴 Hard{" "}
                      <span className="text-sm opacity-80">
                        (2 Lives, Fast Ball)
                      </span>
                    </button>
                    <button
                      onClick={() => setGameState("menu")}
                      className="mt-6 px-8 py-3 bg-slate-700/50 hover:bg-slate-600/50 backdrop-blur-sm rounded-xl font-semibold transition-all duration-300 border border-slate-500/30"
                    >
                      ← Back
                    </button>
                  </div>
                </div>
              </div>
            )}

            {gameState === "paused" && (
              <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-slate-900/90 to-purple-900/90 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <div className="text-center p-8">
                  <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-pulse">
                    ⏸️ Game Paused
                  </h2>
                  <p className="text-2xl mb-8 text-gray-300">
                    Press{" "}
                    <span className="bg-slate-700 px-3 py-1 rounded-lg text-yellow-400">
                      SPACEBAR
                    </span>{" "}
                    to continue
                  </p>
                  <div className="space-y-4">
                    <button
                      onClick={() => setGameState("playing")}
                      className="block w-full px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50 border border-green-400/30"
                    >
                      ▶️ Resume
                    </button>
                    <button
                      onClick={() => setGameState("menu")}
                      className="block w-full px-10 py-5 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/50 border border-red-400/30"
                    >
                      🏠 Quit to Menu
                    </button>
                  </div>
                </div>
              </div>
            )}

            {gameState === "gameOver" && (
              <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-red-900/20 to-slate-900/95 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <div className="text-center p-8">
                  <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                    💥 Game Over!
                  </h2>
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-red-500/30">
                    <p className="text-3xl mb-3">
                      Final Score:{" "}
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-bold">
                        {score.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-2xl mb-3">
                      Level Reached:{" "}
                      <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent font-bold">
                        {level}
                      </span>
                    </p>
                    {score === highScore && score > 0 && (
                      <p className="text-3xl mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-bold animate-pulse">
                        🎉 NEW HIGH SCORE! 🎉
                      </p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <button
                      onClick={startGame}
                      className="block w-full px-10 py-5 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/50 border border-orange-400/30"
                    >
                      🔄 Play Again
                    </button>
                    <button
                      onClick={() => setGameState("difficulty")}
                      className="block w-full px-10 py-5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/50 border border-purple-400/30"
                    >
                      🎯 Change Difficulty
                    </button>
                    <button
                      onClick={() => setGameState("menu")}
                      className="block w-full px-10 py-5 bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-400/30"
                    >
                      🏠 Main Menu
                    </button>
                  </div>
                </div>
              </div>
            )}

            {gameState === "victory" && (
              <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-yellow-900/20 to-slate-900/90 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <div className="text-center p-8">
                  <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                    🎉 Level Complete! 🎉
                  </h2>
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-yellow-500/30">
                    <p className="text-3xl mb-3">
                      Score:{" "}
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-bold">
                        {score.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-2xl mb-3 text-green-400">
                      Level {level} cleared! ✅
                    </p>
                  </div>
                  <div className="space-y-4">
                    <button
                      onClick={nextLevel}
                      className="block w-full px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50 border border-green-400/30"
                    >
                      ➡️ Next Level
                    </button>
                    <button
                      onClick={() => setGameState("menu")}
                      className="block w-full px-10 py-5 bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-400/30"
                    >
                      🏠 Main Menu
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Power-up Legend */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            ⚡ Power-ups
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-green-500/50 shadow-lg hover:shadow-green-500/30 transition-all duration-300 hover:scale-105 text-center">
              <div className="text-3xl mb-2 text-green-500 drop-shadow-lg">
                ⬌
              </div>
              <div className="text-sm font-semibold text-green-300">
                Expand Paddle
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-red-500/50 shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:scale-105 text-center">
              <div className="text-3xl mb-2 text-red-500 drop-shadow-lg">⬍</div>
              <div className="text-sm font-semibold text-red-300">
                Shrink Paddle
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/50 shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 hover:scale-105 text-center">
              <div className="text-3xl mb-2 text-yellow-500 drop-shadow-lg">
                ●●
              </div>
              <div className="text-sm font-semibold text-yellow-300">
                Multi Ball
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-pink-500/50 shadow-lg hover:shadow-pink-500/30 transition-all duration-300 hover:scale-105 text-center">
              <div className="text-3xl mb-2 text-pink-500 drop-shadow-lg">
                ♥
              </div>
              <div className="text-sm font-semibold text-pink-300">
                Extra Life
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/50 shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 text-center">
              <div className="text-3xl mb-2 text-purple-500 drop-shadow-lg">
                ●
              </div>
              <div className="text-sm font-semibold text-purple-300">
                Bigger Ball
              </div>
            </div>
          </div>
        </div>

        {/* Game Controls */}
        {gameState === "playing" && (
          <div className="text-center mt-8">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setGameState("paused")}
                className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border border-yellow-500/30"
              >
                ⏸️ Pause <span className="text-sm opacity-80">(Space)</span>
              </button>
              <button
                onClick={() => setGameState("menu")}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border border-red-500/30"
              >
                🏠 Quit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrickBreakerGame;
