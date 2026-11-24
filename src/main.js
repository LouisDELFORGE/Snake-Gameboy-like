const canvas = document.querySelector('#game-screen');
const context = canvas.getContext('2d');

const width = 160;
const height = 144;
const cellSize = 8;
const columns = width / cellSize;
const rows = 16;

canvas.width = width;
canvas.height = height;

const palette = {
  screen: '#829080',
  dark: '#1f2a20',
  snake: '#3d513d',
  light: '#a5b09a'
};

let snake;
let food;
let direction;
let pendingDirection;
let score;
let isGameOver;
let isPaused;
let lastStep = 0;

function resetGame() {
  snake = [
    {x:10,y:9},
    {x:9,y:9},
    {x:8,y:9},
  ];
  direction = { x: 1, y: 0 };
  pendingDirection = direction;
  score = 0;
  isGameOver = false;
  isPaused = false;
  placeFood();
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * columns),
      y: Math.floor(Math.random() * rows),
    };
  } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
}

function setDirection(nextDirection) {
  if (isGameOver) {
    resetGame();
    return;
  }

  if (isPaused) {
    isPaused = false;
  }

  if (direction.x + nextDirection.x == 0 && direction.y + nextDirection.y == 0) {
    return;
  }

  pendingDirection = nextDirection;
}

function step() {
  if (isGameOver || isPaused) return;

  direction = pendingDirection;
  const head = snake[0];
  const nextHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };

  const hitWall = nextHead.x < 0 || nextHead.x >= columns || nextHead.y < 0 || nextHead.y >= rows;
  const hitSnake = snake.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

  if (hitWall || hitSnake) {
    isGameOver = true;
    return;
  }

  snake.unshift(nextHead);

  if (nextHead.x == food.x && nextHead.y == food.y) {
    score += 1;
    placeFood();
  } else {
    snake.pop();
  }
}

function draw() {
  context.fillStyle = palette.screen;
  context.fillRect(0, 0, width, height);

  context.fillStyle = palette.dark;
  context.font = '8px monospace';
  context.fillText(`SCORE ${String(score).padStart(3, '0')}`, 4, 9);

  context.fillStyle = palette.snake;
  for (const segment of snake) {
    context.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 12, cellSize - 2, cellSize - 2);
  }

  context.fillStyle = palette.dark;
  context.fillRect(food.x * cellSize + 2, food.y * cellSize + 14, cellSize - 4, cellSize - 4);

  if (isPaused) {
    drawMessage('PAUSED');
  } else if (isGameOver) {
    drawMessage('GAME OVER', 'PRESS START');
  }
}

function drawMessage(message, subtitle = '') {
  context.fillStyle = palette.screen;
  context.fillRect(25, 53, 110, subtitle ? 34 : 24);
  context.strokeStyle = palette.dark;
  context.strokeRect(25, 53, 110, subtitle ? 34 : 24);

  context.fillStyle = palette.dark;
  context.textAlign = 'center';
  context.fillText(message, width / 2, 68);
  if (subtitle) context.fillText(subtitle, width / 2, 80);
  context.textAlign = 'left';
}

function gameLoop(time) {
  if (time - lastStep >= 150) { // dt pour lock les et attendre duree de 150ms entre chaque x secondews
    step();
    lastStep = time;
  }
  draw();
  requestAnimationFrame(gameLoop);
}

const keyDirections = {
  ArrowUp: { x: 0, y: -1 },
  w: { x: 0, y: -1 },
  W: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  s: { x: 0, y: 1 },
  S: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  a: { x: -1, y: 0 },
  A: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  d: { x: 1, y: 0 },
  D: { x: 1, y: 0 },
};

window.addEventListener('keydown', (event) => {
  if (keyDirections[event.key]) {
    event.preventDefault();
  }

  const nextDirection = keyDirections[event.key];
  if (nextDirection) setDirection(nextDirection);

  if (event.key === 'Enter' || event.key === ' ') {
    if (isGameOver) resetGame();
    else isPaused = !isPaused;
  }
});

const dpadVertical = document.querySelector('.dpad-vertical');
const dpadHorizontal = document.querySelector('.dpad-horizontal');

dpadVertical.addEventListener('pointerdown', (event) => {
  const bounds = dpadVertical.getBoundingClientRect();
  setDirection(event.clientY < bounds.top + bounds.height / 2 ? { x: 0, y: -1 } : { x: 0, y: 1 });
});

dpadHorizontal.addEventListener('pointerdown', (event) => {
  const bounds = dpadHorizontal.getBoundingClientRect();
  setDirection(event.clientX < bounds.left + bounds.width / 2 ? { x: -1, y: 0 } : { x: 1, y: 0 });
});

const menuButtons = document.querySelectorAll('.menu-button');
menuButtons[0]?.addEventListener('click', () => { isPaused = !isPaused; });
menuButtons[1]?.addEventListener('click', () => {
  if (isGameOver) resetGame();
  else isPaused = !isPaused;
});

document.querySelectorAll('.action-button')[0]?.addEventListener('click', () => { isPaused = !isPaused; });
document.querySelectorAll('.action-button')[1]?.addEventListener('click', () => { resetGame(); });

resetGame();
requestAnimationFrame(gameLoop);