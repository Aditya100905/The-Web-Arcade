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
  const [isMobile, setIsMobile] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    document.title = "Brick Breaker";
  }, []);

  // Detect mobile and set canvas size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || "ontouchstart" in window;
      setIsMobile(mobile);

      // Set responsive canvas size
      const maxWidth = Math.min(window.innerWidth - 32, 800);
      const maxHeight = Math.min(window.innerHeight * 0.6, 600);
      const aspectRatio = 800 / 600;

      let width, height;
      if (maxWidth / aspectRatio <= maxHeight) {
        width = maxWidth;
        height = maxWidth / aspectRatio;
      } else {
        height = maxHeight;
        width = maxHeight * aspectRatio;
      }

      setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Game configuration based on difficulty - reduced speeds for better playability
  const getDifficultyConfig = (diff) => {
    const configs = {
      easy: { ballSpeed: 3, paddleSpeed: 8, paddleWidth: 140, lives: 5 },
      medium: { ballSpeed: 4, paddleSpeed: 7, paddleWidth: 120, lives: 3 },
      hard: { ballSpeed: 5, paddleSpeed: 6, paddleWidth: 100, lives: 2 },
    };
    return configs[diff];
  };

  // Dynamic canvas dimensions
  const CANVAS_WIDTH = canvasSize.width;
  const CANVAS_HEIGHT = canvasSize.height;
  const PADDLE_Y = CANVAS_HEIGHT - 50;

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
    touchStartX: null,
    lastTouchTime: 0,
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
      try {
        const stored = localStorage.getItem("brickBreakerHighScores");
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.log("LocalStorage not available, using memory storage");
      }
      return { easy: 0, medium: 0, hard: 0 };
    };

    const scores = loadHighScores();
    setSavedHighScores(scores);
    setHighScore(scores[difficulty]);
  }, []);

  // Save high score (simulating localStorage)
  const saveHighScore = useCallback((newScore, diff) => {
    setSavedHighScores((prev) => {
      const updated = { ...prev, [diff]: Math.max(prev[diff], newScore) };
      try {
        localStorage.setItem("brickBreakerHighScores", JSON.stringify(updated));
      } catch (error) {
        console.log("LocalStorage not available");
      }
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
      radius: Math.max(8, Math.min(10, CANVAS_WIDTH / 80)), // Responsive ball size
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
  const initializeBricks = useCallback(
    (level) => {
      const bricks = [];
      const rows = Math.min(4 + Math.floor(level / 3), 7); // Fewer rows on mobile
      const cols = isMobile ? 8 : 10; // Fewer columns on mobile
      const brickWidth = Math.floor((CANVAS_WIDTH - 40) / cols) - 2;
      const brickHeight = Math.max(20, Math.floor(CANVAS_HEIGHT / 30));
      const padding = 2;
      const offsetTop = Math.floor(CANVAS_HEIGHT * 0.15);
      const totalWidth = cols * brickWidth + (cols - 1) * padding;
      const offsetLeft = (CANVAS_WIDTH - totalWidth) / 2;

      const pattern = generateBrickPattern(level);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (!pattern(r, c, rows, cols)) continue;

          // More varied hit counts based on position and level
          let hitCount;
          if (r < 2)
            hitCount = Math.min(
              1 + Math.floor(level / 4),
              3
            ); // Top rows harder
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
    },
    [CANVAS_WIDTH, CANVAS_HEIGHT, isMobile]
  );

  // Create powerup
  const createPowerup = (x, y) => {
    const types = Object.keys(POWERUP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      x,
      y,
      width: Math.max(25, Math.floor(CANVAS_WIDTH / 30)),
      height: Math.max(18, Math.floor(CANVAS_HEIGHT / 35)),
      type,
      dy: 1.5, // Slower falling powerups
      active: true,
    };
  };

  // Reset game state
  const resetGame = useCallback(() => {
    const game = gameRef.current;
    const config = getDifficultyConfig(difficulty);

    // Scale paddle size based on canvas width
    const scaledPaddleWidth = Math.floor(
      (config.paddleWidth * CANVAS_WIDTH) / 800
    );

    game.paddle.x = CANVAS_WIDTH / 2 - scaledPaddleWidth / 2;
    game.paddle.y = PADDLE_Y;
    game.paddle.width = scaledPaddleWidth;
    game.paddle.height = Math.max(12, Math.floor(CANVAS_HEIGHT / 40));
    game.paddle.speed = config.paddleSpeed;
    game.originalPaddleWidth = scaledPaddleWidth;

    game.balls = [createBall()];
    game.bricks = initializeBricks(level);
    game.powerups = [];
    game.gameStarted = false;

    setLives(config.lives);
  }, [
    level,
    difficulty,
    initializeBricks,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    PADDLE_Y,
  ]);

  // Apply powerup effects with better balance
  const applyPowerup = useCallback(
    (type) => {
      const game = gameRef.current;
      const maxPaddleWidth = Math.floor(CANVAS_WIDTH * 0.25);
      const minPaddleWidth = Math.floor(CANVAS_WIDTH * 0.08);

      switch (POWERUP_TYPES[type].effect) {
        case "expand":
          game.paddle.width = Math.min(
            game.paddle.width + Math.floor(CANVAS_WIDTH / 32),
            maxPaddleWidth
          );
          break;
        case "shrink":
          game.paddle.width = Math.max(
            game.paddle.width - Math.floor(CANVAS_WIDTH / 50),
            minPaddleWidth
          );
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
            if (ball.active)
              ball.radius = Math.min(
                ball.radius + 2,
                Math.floor(CANVAS_WIDTH / 50)
              );
          });
          break;
      }
    },
    [CANVAS_WIDTH]
  );

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
          powerup.x >= paddleRect.x - powerup.width / 2 &&
          powerup.x <= paddleRect.x + paddleRect.width + powerup.width / 2 &&
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
          ctx.font = `bold ${Math.max(
            10,
            Math.floor(CANVAS_HEIGHT / 50)
          )}px Arial`;
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
        ctx.font = `bold ${Math.max(
          12,
          Math.floor(CANVAS_HEIGHT / 45)
        )}px Arial`;
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
      ctx.font = `${Math.max(16, Math.floor(CANVAS_HEIGHT / 35))}px Arial`;
      ctx.textAlign = "center";
      const instructionText = isMobile
        ? "Touch to start and move paddle!"
        : "Press ARROW KEYS or SPACE to start!";
      ctx.fillText(instructionText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
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
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    isMobile,
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

    if (!isMobile) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
    }

    return () => {
      if (!isMobile) {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      }
    };
  }, [gameState, isMobile]);

  // Enhanced mouse/touch controls
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

    const handleClick = (e) => {
      if (gameState === "playing" && !gameRef.current.gameStarted) {
        gameRef.current.gameStarted = true;
      }
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      gameRef.current.touchStartX = (touch.clientX - rect.left) * scaleX;
      gameRef.current.lastTouchTime = Date.now();
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (gameState === "playing") {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const x = (touch.clientX - rect.left) * scaleX;
        gameRef.current.paddle.x = Math.max(
          0,
          Math.min(
            x - gameRef.current.paddle.width / 2,
            CANVAS_WIDTH - gameRef.current.paddle.width
          )
        );
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      const currentTime = Date.now();
      const timeDiff = currentTime - gameRef.current.lastTouchTime;

      if (
        gameState === "playing" &&
        !gameRef.current.gameStarted &&
        timeDiff < 300
      ) {
        gameRef.current.gameStarted = true;
      }
    };

    if (isMobile) {
      canvas.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
      canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    } else {
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("click", handleClick);
    }

    return () => {
      if (isMobile) {
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchmove", handleTouchMove);
        canvas.removeEventListener("touchend", handleTouchEnd);
      } else {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("click", handleClick);
      }
    };
  }, [gameState, CANVAS_WIDTH, isMobile]);

  // Start new game
  const startNewGame = () => {
    setScore(0);
    setLevel(1);
    setGameState("playing");
    resetGame();
  };

  // Continue to next level
  const nextLevel = () => {
    setLevel((prev) => prev + 1);
    setGameState("playing");
    resetGame();
  };

  // Restart current level
  const restartLevel = () => {
    setGameState("playing");
    resetGame();
  };

  // Update high score when difficulty changes
  useEffect(() => {
    setHighScore(savedHighScores[difficulty]);
  }, [difficulty, savedHighScores]);

  // Reset game when difficulty changes
  useEffect(() => {
    if (gameState === "playing") {
      resetGame();
    }
  }, [difficulty, resetGame, gameState]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="text-center mb-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text sm:text-transparent">
          BRICK BREAKER
        </h1>
        <div className="flex flex-wrap justify-center gap-4 text-white text-sm md:text-lg">
          <div>
            Score: <span className="font-bold text-cyan-400">{score}</span>
          </div>
          <div>
            Lives: <span className="font-bold text-red-400">{lives}</span>
          </div>
          <div>
            Level: <span className="font-bold text-green-400">{level}</span>
          </div>
          <div>
            High Score:{" "}
            <span className="font-bold text-yellow-400">{highScore}</span>
          </div>
        </div>
      </div>

      {gameState === "menu" && (
        <div className="text-center">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Welcome to Brick Breaker!
            </h2>
            <p className="text-gray-300 mb-6 max-w-md">
              Break all the bricks to advance to the next level. Collect
              power-ups to help you succeed!
            </p>
            <button
              onClick={() => setGameState("difficulty")}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105"
            >
              START GAME
            </button>
          </div>
        </div>
      )}

      {gameState === "difficulty" && (
        <div className="text-center">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Choose Difficulty
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {["easy", "medium", "hard"].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    difficulty === diff
                      ? "border-cyan-400 bg-cyan-400/20 text-cyan-400"
                      : "border-gray-600 bg-gray-800/50 text-white hover:border-gray-400"
                  }`}
                >
                  <div className="font-bold text-xl capitalize">{diff}</div>
                  <div className="text-sm opacity-75">
                    {diff === "easy" && "5 Lives • Slow Ball • Wide Paddle"}
                    {diff === "medium" &&
                      "3 Lives • Medium Ball • Normal Paddle"}
                    {diff === "hard" && "2 Lives • Fast Ball • Narrow Paddle"}
                  </div>
                  <div className="text-xs mt-1">
                    High Score: {savedHighScores[diff]}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={startNewGame}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105"
              >
                PLAY
              </button>
              <button
                onClick={() => setGameState("menu")}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all duration-200"
              >
                BACK
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === "playing" && (
        <div className="text-center">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="border-2 border-cyan-400 rounded-lg shadow-2xl shadow-cyan-500/20 mb-4"
            style={{ touchAction: "none" }}
          />
          <div className="flex flex-wrap justify-center gap-2 text-white text-xs md:text-sm">
            {!isMobile && (
              <>
                <span>←→ Move</span>
                <span>•</span>
                <span>SPACE Pause</span>
                <span>•</span>
              </>
            )}
            <span>Power-ups: ⬌Expand ⬍Shrink ●●Multi ♥Life ●Big</span>
          </div>
        </div>
      )}

      {gameState === "paused" && (
        <div className="text-center">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="border-2 border-gray-500 rounded-lg shadow-2xl opacity-50 mb-4"
          />
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-3xl font-bold text-white mb-4">PAUSED</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setGameState("playing")}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200"
              >
                RESUME
              </button>
              <button
                onClick={restartLevel}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200"
              >
                RESTART LEVEL
              </button>
              <button
                onClick={() => setGameState("menu")}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200"
              >
                MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === "gameOver" && (
        <div className="text-center">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-8">
            <h2 className="text-4xl font-bold text-red-400 mb-4">GAME OVER</h2>
            <div className="text-white mb-6">
              <div className="text-2xl mb-2">
                Final Score:{" "}
                <span className="text-cyan-400 font-bold">{score}</span>
              </div>
              <div className="text-lg">
                Level Reached:{" "}
                <span className="text-green-400 font-bold">{level}</span>
              </div>
              {score >= highScore && (
                <div className="text-yellow-400 font-bold text-xl mt-2">
                  🎉 NEW HIGH SCORE! 🎉
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={startNewGame}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105"
              >
                PLAY AGAIN
              </button>
              <button
                onClick={() => setGameState("difficulty")}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105"
              >
                CHANGE DIFFICULTY
              </button>
              <button
                onClick={() => setGameState("menu")}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all duration-200"
              >
                MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === "victory" && (
        <div className="text-center">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-8">
            <h2 className="text-4xl font-bold text-green-400 mb-4">
              LEVEL COMPLETE!
            </h2>
            <div className="text-white mb-6">
              <div className="text-2xl mb-2">
                Score: <span className="text-cyan-400 font-bold">{score}</span>
              </div>
              <div className="text-lg">
                Level: <span className="text-green-400 font-bold">{level}</span>
              </div>
              <div className="text-yellow-400 font-bold text-xl mt-2">
                🎉 EXCELLENT! 🎉
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={nextLevel}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105"
              >
                NEXT LEVEL
              </button>
              <button
                onClick={restartLevel}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all duration-200"
              >
                REPLAY LEVEL
              </button>
              <button
                onClick={() => setGameState("menu")}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all duration-200"
              >
                MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrickBreakerGame;
