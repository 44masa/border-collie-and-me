// Game Configuration
interface GameConfig {
  sheepCount: number;
  targetSheepCount: number;
  dogSpeed: number;
  sheepSpeed: number;
  dogInfluenceRadius: number;
  gateWidth: number;
  gateHeight: number;
  timeLimit: number; // in seconds
  level: number; // Current game level
  maxLevel: number; // Maximum level (game clear)
  mapWidth: number; // Canvas width based on level
  mapHeight: number; // Canvas height based on level
}

// Game Entities
interface Dog {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: "up" | "down" | "left" | "right";
  speed: number;
}

interface Sheep {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  inGate: boolean;
  visible: boolean;
  gateTimer?: number; // Timer for tracking how long sheep has been in gate
  gateCooldown?: number; // Cooldown timer to prevent immediate re-entry
  stationaryTimer?: number; // Timer for tracking how long sheep has been stationary
  lastX?: number; // Last X position to detect if sheep is stationary
  lastY?: number; // Last Y position to detect if sheep is stationary
  effect?: {
    type: "enter" | "exit"; // Type of effect
    timer: number; // Timer for effect duration
    maxTime: number; // Maximum time for the effect
  };
}

interface Gate {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Wall {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Game State
interface GameState {
  dog: Dog;
  sheep: Sheep[];
  gate: Gate;
  wall: Wall; // Added wall to the left of the gate
  keys: {
    ArrowUp: boolean;
    ArrowDown: boolean;
    ArrowLeft: boolean;
    ArrowRight: boolean;
  };
  sheepInGate: number;
  levelComplete: boolean;
  gameOver: boolean;
  gameClear: boolean; // True when all levels are completed
  timeRemaining: number; // in seconds
}

// Game Assets
interface GameAssets {
  dogUp: HTMLImageElement;
  dogDown: HTMLImageElement;
  dogLeft: HTMLImageElement;
  dogRight: HTMLImageElement;
  sheepUp: HTMLImageElement;
  sheepDown: HTMLImageElement;
  sheepLeft: HTMLImageElement;
  sheepRight: HTMLImageElement;
}

// Import dog and sheep images
import dogUpImage from "./assets/images/dog/top.png";
import dogDownImage from "./assets/images/dog/down.png";
import dogLeftImage from "./assets/images/dog/left.png";
import dogRightImage from "./assets/images/dog/right.png";
import sheepUpImage from "./assets/images/sheep/up.png";
import sheepDownImage from "./assets/images/sheep/down.png";
import sheepLeftImage from "./assets/images/sheep/left.png";
import sheepRightImage from "./assets/images/sheep/right.png";

// Game class
export class HerdingGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: GameConfig;
  private state: GameState;
  private assets: GameAssets;
  private timer: number | null = null;
  private lastTime: number = 0;

  // UI Elements
  private sheepCountElement: HTMLElement;
  private targetCountElement: HTMLElement;
  private timeElement: HTMLElement;
  private levelElement: HTMLElement;
  private levelCompleteMessage: HTMLElement;
  private timeoutMessage: HTMLElement;
  private gameClearMessage: HTMLElement;
  private nextLevelButton: HTMLElement;
  private restartButton: HTMLElement;
  private timeoutRestartButton: HTMLElement;

  constructor(canvasId: string) {
    // Get canvas and context
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    // Game configuration
    this.config = {
      sheepCount: 1, // Start with 1 sheep at level 1
      targetSheepCount: 1,
      dogSpeed: 3,
      sheepSpeed: 1.5,
      dogInfluenceRadius: 100,
      gateWidth: 100,
      gateHeight: 60,
      timeLimit: 60, // 1 minute
      level: 1, // Start at level 1
      maxLevel: 10, // Game clear at level 10
      mapWidth: 400, // Half of original 800
      mapHeight: 300, // Half of original 600
    };

    // Set canvas size based on level
    this.canvas.width = this.config.mapWidth;
    this.canvas.height = this.config.mapHeight;

    // Initialize game state
    this.state = {
      dog: {
        x: this.config.mapWidth / 2,
        y: this.config.mapHeight / 2,
        width: 60,
        height: 60,
        direction: "down",
        speed: this.config.dogSpeed,
      },
      sheep: [],
      gate: {
        x: this.config.mapWidth - 100,
        y: this.config.mapHeight / 2 - this.config.gateHeight / 2,
        width: this.config.gateWidth,
        height: this.config.gateHeight,
      },
      wall: {
        width: 5, // Wall thickness
        x: this.config.mapWidth - 100 - 5, // Initial position, will be updated properly in updateLevelConfig
        y: this.config.mapHeight / 2 - this.config.gateHeight / 2, // Same y-position as gate
        height: this.config.gateHeight, // Same height as gate
      },
      keys: {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
      },
      sheepInGate: 0,
      levelComplete: false,
      gameOver: false,
      gameClear: false,
      timeRemaining: this.config.timeLimit,
    };

    // Load assets
    this.assets = {
      dogUp: new Image(),
      dogDown: new Image(),
      dogLeft: new Image(),
      dogRight: new Image(),
      sheepUp: new Image(),
      sheepDown: new Image(),
      sheepLeft: new Image(),
      sheepRight: new Image(),
    };

    // Load dog images using imported assets
    this.assets.dogUp.src = dogUpImage;
    this.assets.dogDown.src = dogDownImage;
    this.assets.dogLeft.src = dogLeftImage;
    this.assets.dogRight.src = dogRightImage;

    // Load sheep images using imported assets
    this.assets.sheepUp.src = sheepUpImage;
    this.assets.sheepDown.src = sheepDownImage;
    this.assets.sheepLeft.src = sheepLeftImage;
    this.assets.sheepRight.src = sheepRightImage;

    // Get UI elements
    this.sheepCountElement = document.getElementById(
      "sheepCount"
    ) as HTMLElement;
    this.targetCountElement = document.getElementById(
      "targetCount"
    ) as HTMLElement;
    this.timeElement = document.getElementById("timeRemaining") as HTMLElement;
    this.levelElement = document.getElementById("currentLevel") as HTMLElement;
    this.levelCompleteMessage = document.getElementById(
      "levelCompleteMessage"
    ) as HTMLElement;
    this.timeoutMessage = document.getElementById(
      "timeoutMessage"
    ) as HTMLElement;
    this.gameClearMessage = document.getElementById(
      "gameClearMessage"
    ) as HTMLElement;
    this.nextLevelButton = document.getElementById(
      "nextLevelButton"
    ) as HTMLElement;
    this.restartButton = document.getElementById(
      "restartButton"
    ) as HTMLElement;
    this.timeoutRestartButton = document.getElementById(
      "timeoutRestartButton"
    ) as HTMLElement;

    // Set UI elements
    this.targetCountElement.textContent =
      this.config.targetSheepCount.toString();
    this.levelElement.textContent = this.config.level.toString();

    // Initialize event listeners
    this.initEventListeners();

    // Initialize the game
    this.initGame();
  }

  private initEventListeners(): void {
    // Keyboard event listeners
    window.addEventListener("keydown", (e) => {
      if (
        this.state.keys.hasOwnProperty(e.key as keyof typeof this.state.keys)
      ) {
        this.state.keys[e.key as keyof typeof this.state.keys] = true;
        // Prevent default browser behavior for arrow keys
        if (e.key.startsWith("Arrow")) {
          e.preventDefault();
        }
      }
    });

    window.addEventListener("keyup", (e) => {
      if (
        this.state.keys.hasOwnProperty(e.key as keyof typeof this.state.keys)
      ) {
        this.state.keys[e.key as keyof typeof this.state.keys] = false;
        // Prevent default browser behavior for arrow keys
        if (e.key.startsWith("Arrow")) {
          e.preventDefault();
        }
      }
    });

    // Button event listeners
    this.nextLevelButton.addEventListener("click", () => this.nextLevel());
    this.restartButton.addEventListener("click", () => this.restartGame());
    this.timeoutRestartButton.addEventListener("click", () =>
      this.restartGame()
    );
  }

  private restartGame(): void {
    // Reset to level 1
    this.config.level = 1;
    this.updateLevelConfig();
    this.initLevel();
  }

  private nextLevel(): void {
    // Advance to next level
    this.config.level++;
    this.updateLevelConfig();
    this.initLevel();
  }

  private updateLevelConfig(): void {
    // Update configuration based on current level
    if (this.config.level <= 4) {
      // Levels 1-4: Small map, increasing sheep
      this.config.sheepCount = this.config.level;
      this.config.targetSheepCount = this.config.level;
      this.config.mapWidth = 400; // Half of original
      this.config.mapHeight = 300; // Half of original
    } else {
      // Levels 5-10: Larger map, increasing sheep
      this.config.sheepCount = this.config.level;
      this.config.targetSheepCount = this.config.level;
      this.config.mapWidth = 600; // 1.5x the small map
      this.config.mapHeight = 450; // 1.5x the small map
    }

    // Update canvas size
    this.canvas.width = this.config.mapWidth;
    this.canvas.height = this.config.mapHeight;

    // Update gate position based on new map size
    this.state.gate.x = this.config.mapWidth - 100;
    this.state.gate.y = this.config.mapHeight / 2 - this.config.gateHeight / 2;

    // Update wall position based on gate position
    this.state.wall.x = this.state.gate.x - 5; // Position wall to the left of the gate
    this.state.wall.y = this.state.gate.y; // Same y-position as gate
    this.state.wall.height = this.config.gateHeight; // Same height as gate
  }

  private initLevel(): void {
    // Reset game state for current level
    this.state.dog.x = this.config.mapWidth / 2;
    this.state.dog.y = this.config.mapHeight / 2;
    this.state.dog.direction = "down";
    this.state.sheepInGate = 0;
    this.state.levelComplete = false;
    this.state.gameOver = false;
    this.state.gameClear = false;
    this.state.timeRemaining = this.config.timeLimit;

    // Update UI
    this.sheepCountElement.textContent = "0";
    this.targetCountElement.textContent =
      this.config.targetSheepCount.toString();
    this.levelElement.textContent = this.config.level.toString();
    this.timeElement.textContent = this.formatTime(this.state.timeRemaining);
    this.levelCompleteMessage.style.display = "none";
    this.timeoutMessage.style.display = "none";
    this.gameClearMessage.style.display = "none";

    // Initialize sheep
    this.initializeSheep();

    // Start the game loop
    this.lastTime = performance.now();
    if (this.timer) {
      cancelAnimationFrame(this.timer);
    }
    this.gameLoop(this.lastTime);
  }

  private initGame(): void {
    // Initialize the first level
    this.restartGame();
  }

  private initializeSheep(): void {
    this.state.sheep = [];
    for (let i = 0; i < this.config.sheepCount; i++) {
      // Position sheep randomly, but not too close to the gate
      let x, y;
      do {
        x = Math.random() * (this.canvas.width - 100);
        y = Math.random() * this.canvas.height;
      } while (
        x > this.state.gate.x - 100 &&
        y > this.state.gate.y - 50 &&
        y < this.state.gate.y + this.state.gate.height + 50
      );

      this.state.sheep.push({
        x,
        y,
        vx: 0,
        vy: 0,
        width: 60,
        height: 60,
        inGate: false,
        visible: true,
        gateTimer: 0,
        gateCooldown: 0,
        stationaryTimer: 0,
        lastX: x,
        lastY: y,
      });
    }
  }

  private updateDog(): void {
    // Store previous position to revert if collision occurs
    const prevX = this.state.dog.x;
    const prevY = this.state.dog.y;
    let moved = false;

    // Update dog position based on key presses
    if (this.state.keys.ArrowUp) {
      this.state.dog.y -= this.state.dog.speed;
      this.state.dog.direction = "up";
      moved = true;
    }
    if (this.state.keys.ArrowDown) {
      this.state.dog.y += this.state.dog.speed;
      this.state.dog.direction = "down";
      moved = true;
    }
    if (this.state.keys.ArrowLeft) {
      this.state.dog.x -= this.state.dog.speed;
      this.state.dog.direction = "left";
      moved = true;
    }
    if (this.state.keys.ArrowRight) {
      this.state.dog.x += this.state.dog.speed;
      this.state.dog.direction = "right";
      moved = true;
    }

    // Only update position if dog actually moved
    if (moved) {
      // Keep dog within canvas bounds
      this.state.dog.x = Math.max(
        0,
        Math.min(this.canvas.width - this.state.dog.width, this.state.dog.x)
      );
      this.state.dog.y = Math.max(
        0,
        Math.min(this.canvas.height - this.state.dog.height, this.state.dog.y)
      );

      // Check collision with wall
      if (this.checkCollision(this.state.dog, this.state.wall)) {
        // Revert to previous position if collision occurs
        this.state.dog.x = prevX;
        this.state.dog.y = prevY;
      }
    }
  }

  // Helper method to check collision between two rectangles
  private checkCollision(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  private updateSheep(deltaTime: number): void {
    // Reset sheep in gate count
    this.state.sheepInGate = 0;

    // Count sheep in gate (including invisible ones)
    this.state.sheep.forEach((sheep) => {
      if (sheep.inGate) {
        this.state.sheepInGate++;
      }
    });

    // Update each sheep
    this.state.sheep.forEach((sheep) => {
      // Update effect timer if active
      if (sheep.effect) {
        sheep.effect.timer += deltaTime / 1000;
        if (sheep.effect.timer >= sheep.effect.maxTime) {
          sheep.effect = undefined; // Remove effect when timer expires
        }
      }

      // Check if sheep is stationary (outside the gate)
      if (!sheep.inGate) {
        // Initialize last position if not set
        if (sheep.lastX === undefined || sheep.lastY === undefined) {
          sheep.lastX = sheep.x;
          sheep.lastY = sheep.y;
          sheep.stationaryTimer = 0;
        }

        // Calculate distance moved since last check
        const dx = sheep.x - sheep.lastX;
        const dy = sheep.y - sheep.lastY;
        const distanceMoved = Math.sqrt(dx * dx + dy * dy);

        // If sheep has barely moved, increment stationary timer
        // Using a slightly larger threshold (5 pixels) to better detect "stuck" sheep
        if (distanceMoved < 5) {
          // Initialize stationaryTimer if undefined
          if (sheep.stationaryTimer === undefined) {
            sheep.stationaryTimer = 0;
          }

          sheep.stationaryTimer += deltaTime / 1000;

          // If sheep has been stationary for more than 3 seconds, give it a random velocity
          if (sheep.stationaryTimer > 3) {
            // Random angle
            const angle = Math.random() * Math.PI * 2;
            // Set velocity in random direction with a stronger impulse to ensure it gets unstuck
            sheep.vx = Math.cos(angle) * this.config.sheepSpeed * 1.5;
            sheep.vy = Math.sin(angle) * this.config.sheepSpeed * 1.5;
            // Reset timer
            sheep.stationaryTimer = 0;

            console.log(
              "Sheep was stuck for 3+ seconds - applying random movement"
            );
          }
        } else {
          // Reset timer if sheep is moving significantly
          sheep.stationaryTimer = 0;
        }

        // Update last position
        sheep.lastX = sheep.x;
        sheep.lastY = sheep.y;
      }

      // If sheep is in gate, update timer
      if (sheep.inGate) {
        if (sheep.gateTimer !== undefined) {
          sheep.gateTimer += deltaTime / 1000; // Convert to seconds

          // After 3 seconds, sheep can leave the gate
          if (sheep.gateTimer >= 3) {
            // Allow sheep to move freely again
            sheep.inGate = false; // Reset gate status so sheep can move normally
            sheep.gateTimer = 0; // Reset timer
            sheep.gateCooldown = 1.0; // Set cooldown to prevent immediate re-entry (1 second)

            // No exit effect

            // Make sheep jump out randomly either upward or downward
            sheep.vx = 0; // No horizontal velocity initially

            // Randomly choose up or down direction with full speed
            if (Math.random() < 0.5) {
              // Jump upward
              sheep.vy = -this.config.sheepSpeed * 1.5; // Faster than normal speed
            } else {
              // Jump downward
              sheep.vy = this.config.sheepSpeed * 1.5; // Faster than normal speed
            }

            return; // Continue with normal movement in the next frame
          } else {
            // During the 3 seconds, sheep can move inside the gate but not leave
            // Calculate forces for movement inside the gate
            sheep.vx += (Math.random() - 0.5) * 0.1;
            sheep.vy += (Math.random() - 0.5) * 0.1;

            // Limit speed
            const speed = Math.sqrt(sheep.vx * sheep.vx + sheep.vy * sheep.vy);
            if (speed > this.config.sheepSpeed * 0.5) {
              sheep.vx = (sheep.vx / speed) * this.config.sheepSpeed * 0.5;
              sheep.vy = (sheep.vy / speed) * this.config.sheepSpeed * 0.5;
            }

            // Update position
            sheep.x += sheep.vx;
            sheep.y += sheep.vy;

            // Keep sheep within gate bounds
            sheep.x = Math.max(
              this.state.gate.x + 3,
              Math.min(
                this.state.gate.x + this.state.gate.width - sheep.width - 3,
                sheep.x
              )
            );
            sheep.y = Math.max(
              this.state.gate.y + 2,
              Math.min(
                this.state.gate.y + this.state.gate.height - sheep.height - 2,
                sheep.y
              )
            );

            return; // Skip regular movement processing
          }
        }
      }

      // Update gate cooldown timer if active
      if (sheep.gateCooldown && sheep.gateCooldown > 0) {
        sheep.gateCooldown -= deltaTime / 1000;
        if (sheep.gateCooldown < 0) {
          sheep.gateCooldown = 0;
        }
      }

      // Always ensure sheep are visible
      sheep.visible = true;

      // Check if sheep is in gate (only if not in cooldown)
      // Using sheep center point for more accurate gate detection
      const sheepCenterX = sheep.x + sheep.width / 2;
      const sheepCenterY = sheep.y + sheep.height / 2;

      if (
        (!sheep.gateCooldown || sheep.gateCooldown <= 0) &&
        sheepCenterX > this.state.gate.x &&
        sheepCenterX < this.state.gate.x + this.state.gate.width &&
        sheepCenterY > this.state.gate.y &&
        sheepCenterY < this.state.gate.y + this.state.gate.height
      ) {
        // No enter effect
        sheep.inGate = true;
        sheep.gateTimer = 0; // Start the timer

        // Debug gate entry
        console.log("Sheep entered gate at", sheepCenterX, sheepCenterY);
      } else if (!sheep.inGate) {
        // Only set to false if not already in gate (to avoid overriding the 3-second timer logic)
        sheep.inGate = false;
      }

      // Calculate forces for Boids algorithm
      let separationX = 0;
      let separationY = 0;
      let cohesionX = 0;
      let cohesionY = 0;
      let alignmentX = 0;
      let alignmentY = 0;
      let flockCount = 0;

      // Calculate distance to dog
      const dogDx =
        this.state.dog.x + this.state.dog.width / 2 - sheep.x - sheep.width / 2;
      const dogDy =
        this.state.dog.y +
        this.state.dog.height / 2 -
        sheep.y -
        sheep.height / 2;
      const dogDistance = Math.sqrt(dogDx * dogDx + dogDy * dogDy);

      // Calculate flee force from dog
      let fleeX = 0;
      let fleeY = 0;

      if (dogDistance < this.config.dogInfluenceRadius) {
        // Flee from dog with strength inversely proportional to distance
        const fleeFactor = 1 - dogDistance / this.config.dogInfluenceRadius;
        fleeX = -dogDx * fleeFactor * 0.05;
        fleeY = -dogDy * fleeFactor * 0.05;
      }

      // Calculate flock forces (Boids algorithm)
      this.state.sheep.forEach((otherSheep) => {
        if (sheep === otherSheep) return;

        const dx = otherSheep.x - sheep.x;
        const dy = otherSheep.y - sheep.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Separation: avoid crowding flock-mates
        if (distance < 30) {
          separationX -= dx / distance;
          separationY -= dy / distance;
        }

        // Only consider sheep within a certain radius for cohesion and alignment
        if (distance < 70) {
          // Cohesion: steer towards center of flock
          cohesionX += otherSheep.x;
          cohesionY += otherSheep.y;

          // Alignment: steer in the same direction as flock-mates
          alignmentX += otherSheep.vx;
          alignmentY += otherSheep.vy;

          flockCount++;
        }
      });

      // Calculate final forces
      if (flockCount > 0) {
        // Cohesion: steer towards center of flock
        cohesionX = (cohesionX / flockCount - sheep.x) * 0.0005;
        cohesionY = (cohesionY / flockCount - sheep.y) * 0.0005;

        // Alignment: steer in the same direction as flock-mates
        alignmentX = (alignmentX / flockCount) * 0.1;
        alignmentY = (alignmentY / flockCount) * 0.1;
      }

      // Apply separation force
      separationX *= 0.05;
      separationY *= 0.05;

      // Calculate boundary avoidance with special corner handling
      let boundaryX = 0;
      let boundaryY = 0;

      const boundaryMargin = 80; // Even larger margin to keep sheep further from edges
      const cornerMargin = 100; // Special margin for corner detection
      const cornerFactor = 5.0; // Much stronger force in corners
      const baseForce = 0.2; // Stronger base force

      // Detect if sheep is in a corner region
      const inLeftSide = sheep.x < cornerMargin;
      const inRightSide = sheep.x > this.canvas.width - cornerMargin;
      const inTopSide = sheep.y < cornerMargin;
      const inBottomSide = sheep.y > this.canvas.height - cornerMargin;

      // Check for corner cases first (they take priority)
      if (inLeftSide && inTopSide) {
        // Top-left corner
        boundaryX = cornerFactor * baseForce;
        boundaryY = cornerFactor * baseForce;

        // Add random jitter to help escape
        boundaryX += Math.random() * baseForce;
        boundaryY += Math.random() * baseForce;
      } else if (inRightSide && inTopSide) {
        // Top-right corner
        boundaryX = -cornerFactor * baseForce;
        boundaryY = cornerFactor * baseForce;

        // Add random jitter to help escape
        boundaryX -= Math.random() * baseForce;
        boundaryY += Math.random() * baseForce;
      } else if (inLeftSide && inBottomSide) {
        // Bottom-left corner
        boundaryX = cornerFactor * baseForce;
        boundaryY = -cornerFactor * baseForce;

        // Add random jitter to help escape
        boundaryX += Math.random() * baseForce;
        boundaryY -= Math.random() * baseForce;
      } else if (inRightSide && inBottomSide) {
        // Bottom-right corner
        boundaryX = -cornerFactor * baseForce;
        boundaryY = -cornerFactor * baseForce;

        // Add random jitter to help escape
        boundaryX -= Math.random() * baseForce;
        boundaryY -= Math.random() * baseForce;
      }
      // If not in a corner, check regular boundaries
      else {
        // Check if sheep is near left boundary
        if (sheep.x < boundaryMargin) {
          boundaryX = (boundaryMargin - sheep.x) * baseForce;
        }
        // Check if sheep is near right boundary
        else if (sheep.x > this.canvas.width - boundaryMargin) {
          boundaryX =
            (this.canvas.width - boundaryMargin - sheep.x) * baseForce;
        }

        // Check if sheep is near top boundary
        if (sheep.y < boundaryMargin) {
          boundaryY = (boundaryMargin - sheep.y) * baseForce;
        }
        // Check if sheep is near bottom boundary
        else if (sheep.y > this.canvas.height - boundaryMargin) {
          boundaryY =
            (this.canvas.height - boundaryMargin - sheep.y) * baseForce;
        }
      }

      // Update sheep velocity
      sheep.vx += cohesionX + alignmentX + separationX + fleeX + boundaryX;
      sheep.vy += cohesionY + alignmentY + separationY + fleeY + boundaryY;

      // Limit sheep speed
      const speed = Math.sqrt(sheep.vx * sheep.vx + sheep.vy * sheep.vy);
      if (speed > this.config.sheepSpeed) {
        sheep.vx = (sheep.vx / speed) * this.config.sheepSpeed;
        sheep.vy = (sheep.vy / speed) * this.config.sheepSpeed;
      }

      // Store previous position to revert if collision occurs
      const prevX = sheep.x;
      const prevY = sheep.y;

      // Update sheep position
      sheep.x += sheep.vx;
      sheep.y += sheep.vy;

      // Keep sheep within canvas bounds with extra safety margin
      const safetyMargin = 10; // Extra margin to ensure sheep don't get stuck at the very edge
      sheep.x = Math.max(
        safetyMargin,
        Math.min(this.canvas.width - sheep.width - safetyMargin, sheep.x)
      );
      sheep.y = Math.max(
        safetyMargin,
        Math.min(this.canvas.height - sheep.height - safetyMargin, sheep.y)
      );

      // Check collision with wall
      if (this.checkCollision(sheep, this.state.wall)) {
        // Revert to previous position
        sheep.x = prevX;
        sheep.y = prevY;

        // Bounce off the wall with some randomness
        sheep.vx = -sheep.vx * 0.8 + (Math.random() - 0.5) * 0.5;
        sheep.vy = sheep.vy * 0.8 + (Math.random() - 0.5) * 0.5;
      }

      // Ensure sheep is visible and has valid coordinates
      sheep.visible = true;

      // Additional safety check for NaN or invalid positions
      if (
        isNaN(sheep.x) ||
        isNaN(sheep.y) ||
        !isFinite(sheep.x) ||
        !isFinite(sheep.y)
      ) {
        // Reset to a safe position if coordinates are invalid
        sheep.x = this.canvas.width / 2;
        sheep.y = this.canvas.height / 2;
        sheep.vx = 0;
        sheep.vy = 0;
        console.log("Rescued a sheep with invalid coordinates");
      }
    });

    // Update UI
    this.sheepCountElement.textContent = this.state.sheepInGate.toString();

    // Check level completion - all sheep must be in gate
    const allSheepInGate = this.state.sheep.every((sheep) => sheep.inGate);
    if (allSheepInGate && !this.state.levelComplete && !this.state.gameOver) {
      this.state.levelComplete = true;

      if (this.config.level >= this.config.maxLevel) {
        // Game clear - completed all levels
        this.state.gameClear = true;
        this.gameClearMessage.style.display = "block";
        this.showGameClearEffect();
      } else {
        // Level complete, but not game clear
        this.levelCompleteMessage.style.display = "block";
      }
    }
  }

  private updateTime(deltaTime: number): void {
    // Update time remaining
    if (!this.state.levelComplete && !this.state.gameOver) {
      this.state.timeRemaining -= deltaTime / 1000;
      this.timeElement.textContent = this.formatTime(this.state.timeRemaining);

      // Check if time is up
      if (this.state.timeRemaining <= 0) {
        this.state.timeRemaining = 0;
        this.state.gameOver = true;
        this.timeoutMessage.style.display = "block";
      }
    }
  }

  private showGameClearEffect(): void {
    // Create a celebratory effect for game clear
    const effectCount = 100;
    const colors = [
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#FF00FF",
      "#00FFFF",
    ];

    // Create particles
    for (let i = 0; i < effectCount; i++) {
      setTimeout(() => {
        if (!this.ctx) return;

        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        const size = 5 + Math.random() * 10;
        const color = colors[Math.floor(Math.random() * colors.length)];

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
      }, i * 20); // Stagger the particles
    }
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.floor(Math.max(0, seconds) % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw wall to the left of the gate
    this.ctx.fillStyle = "#5D4037"; // Dark brown for wall
    this.ctx.fillRect(
      this.state.wall.x,
      this.state.wall.y,
      this.state.wall.width,
      this.state.wall.height
    );

    // Debug visualization of collision boundaries (uncomment for debugging)
    // this.ctx.strokeStyle = "red";
    // this.ctx.strokeRect(
    //   this.state.wall.x,
    //   this.state.wall.y,
    //   this.state.wall.width,
    //   this.state.wall.height
    // );

    // Draw gate
    this.ctx.fillStyle = "#8B4513"; // Brown color for gate
    this.ctx.fillRect(
      this.state.gate.x,
      this.state.gate.y,
      this.state.gate.width,
      this.state.gate.height
    );

    // Draw gate posts
    this.ctx.fillStyle = "#5D4037"; // Darker brown for posts
    this.ctx.fillRect(
      this.state.gate.x,
      this.state.gate.y,
      3, // Thinner gate posts
      this.state.gate.height
    );
    this.ctx.fillRect(
      this.state.gate.x + this.state.gate.width - 3, // Adjusted position for thinner post
      this.state.gate.y,
      3, // Thinner gate posts
      this.state.gate.height
    );

    // Draw sheep
    this.state.sheep.forEach((sheep) => {
      // Always ensure sheep are visible before drawing
      sheep.visible = true;

      // Determine sheep direction based on velocity
      let sheepImage: HTMLImageElement;

      // Use the velocity to determine the predominant direction
      if (Math.abs(sheep.vx) > Math.abs(sheep.vy)) {
        // Horizontal movement is stronger
        if (sheep.vx > 0) {
          sheepImage = this.assets.sheepRight;
        } else {
          sheepImage = this.assets.sheepLeft;
        }
      } else {
        // Vertical movement is stronger
        if (sheep.vy > 0) {
          sheepImage = this.assets.sheepDown;
        } else {
          sheepImage = this.assets.sheepUp;
        }
      }

      // Default to down direction if no movement
      if (sheep.vx === 0 && sheep.vy === 0) {
        sheepImage = this.assets.sheepDown;
      }

      // Draw the sheep image
      this.ctx.drawImage(
        sheepImage,
        sheep.x,
        sheep.y,
        sheep.width,
        sheep.height
      );

      // No effects
    });

    // Draw dog with appropriate image based on direction
    let dogImage: HTMLImageElement;
    switch (this.state.dog.direction) {
      case "up":
        dogImage = this.assets.dogUp;
        break;
      case "down":
        dogImage = this.assets.dogDown;
        break;
      case "left":
        dogImage = this.assets.dogLeft;
        break;
      case "right":
        dogImage = this.assets.dogRight;
        break;
      default:
        dogImage = this.assets.dogDown;
    }

    this.ctx.drawImage(
      dogImage,
      this.state.dog.x,
      this.state.dog.y,
      this.state.dog.width,
      this.state.dog.height
    );
  }

  private gameLoop(currentTime: number): void {
    // Calculate delta time
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update game state
    if (!this.state.levelComplete && !this.state.gameOver) {
      this.updateDog();
      this.updateSheep(deltaTime);
      this.updateTime(deltaTime);
    }

    // Render game
    this.render();

    // Request next frame
    this.timer = requestAnimationFrame((time) => this.gameLoop(time));
  }
}
