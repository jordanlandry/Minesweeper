let xCount = 25;
let yCount = 25;
let aspectRatio, gameWidth, gameHeight, cellWidth;

// Percentage of the screen that the game should take up
const sizePercent = 0.95;

let mines = 125;
let mousedown = false;

let isFirstClick = true;

let restarted = false;

let bombCount = mines;

let topMenuSize = window.innerHeight * 0.075;

let doTimer = true;

let count = 0;

const targetNumber = xCount * yCount - mines;

// handle timer
const timer = document.getElementById("timer");
let interval;

function handleTimer() {
  timer.textContent = parseInt(timer.textContent) + 1;
  if (timer.textContent.length === 1) timer.textContent = `00${timer.textContent}`;
  if (timer.textContent.length === 2) timer.textContent = `0${timer.textContent}`;
}

const board = new Array(xCount).fill(0).map(() => new Array(yCount).fill(0));
const bombMap = new Array(xCount).fill(0).map(() => new Array(yCount).fill(0));

function run() {
  createGame();
}

function openCell(x, y, showingNeighbours = false) {
  const cell = document.getElementById(`${x}-${y}`);
  cell.classList.add("open");
  cell.classList.remove("mousedown");
  cell.classList.remove("flag");
  if (cell.children.length > 0) cell.removeChild(cell.children[0]);

  if (isBomb(x, y)) {
    if (!showingNeighbours) {
      cell.classList.add("bomb");
      gameOver();
    }

    return;
  }

  count++;

  if (count === targetNumber) gameOver(false);

  cell.classList.add("number");

  if (isFirstClick) firstClick(x, y);

  const number = board[x][y];

  if (number === 0) {
    showNeighbours(x, y);
    return;
  }

  cell.textContent = number;
  cell.classList.add(`value-${number}`);
}

function isBomb(x, y) {
  return bombMap[x][y];
}

function showNeighbours(x, y) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const x2 = x + i;
      const y2 = y + j;

      if (x2 < 0 || x2 >= xCount || y2 < 0 || y2 >= yCount) continue;

      const cell = document.getElementById(`${x2}-${y2}`);

      if (cell.classList.contains("open")) continue;

      openCell(x2, y2, true);
    }
  }
}

function restart() {
  restarted = true;
  const gameWrapper = document.getElementById("game-wrapper");

  while (gameWrapper.firstChild) {
    gameWrapper.removeChild(gameWrapper.firstChild);
  }

  clearInterval(interval);

  isFirstClick = true;
  createGame();

  count = 0;
}

function gameOver(lose = true) {
  // Show all the bombs

  for (let i = 0; i < xCount; i++) {
    for (let j = 0; j < yCount; j++) {
      const cell = document.getElementById(`${i}-${j}`);

      if (lose) {
        if (isBomb(i, j) && !cell.classList.contains("flag")) cell.classList.add("bomb");
        if (!isBomb(i, j) && cell.classList.contains("flag")) cell.classList.add("wrong-flag");
      }

      cell.onmousedown = null;
      cell.onmouseup = null;
      cell.onmouseleave = null;
      cell.onmouseenter = null;
    }
  }

  const smiley = document.getElementById("smiley");
  if (lose) smiley.style.backgroundImage = "url('./assets/sad.png')";
  else smiley.style.backgroundImage = "url('./assets/sunglasses.png')";

  clearInterval(interval);
}

// Generates the mines and the numbers, so that you can't click on a mine on the first click
function firstClick(x, y) {
  isFirstClick = false;
  generateBombs(x, y);
  generateNumbers();
}

function generateBombs(x, y) {
  const safeRadius = 2;
  const safePositions = new Set();

  for (let i = -safeRadius; i <= safeRadius; i++) {
    for (let j = -safeRadius; j <= safeRadius; j++) {
      const x1 = i + x;
      const y1 = j + y;

      if (x1 < 0 || x1 >= xCount || y1 < 0 || y1 >= yCount) continue;

      safePositions.add(`${x1}-${y1}`);
    }
  }
  for (let i = 0; i < mines; i++) {
    let x, y;

    do {
      x = Math.floor(Math.random() * xCount);
      y = Math.floor(Math.random() * yCount);
    } while (bombMap[x][y] || safePositions.has(`${x}-${y}`));

    bombMap[x][y] = 1;
  }
}

function generateNumbers() {
  for (let i = 0; i < xCount; i++) {
    for (let j = 0; j < yCount; j++) {
      if (bombMap[i][j]) continue;

      let count = 0;

      for (let k = -1; k <= 1; k++) {
        for (let l = -1; l <= 1; l++) {
          const x = i + k;
          const y = j + l;

          if (x < 0 || x >= xCount || y < 0 || y >= yCount) continue;

          if (bombMap[x][y]) count++;
        }
      }

      board[i][j] = count;
    }
  }
}

function handleRightClick(x, y) {
  const cell = document.getElementById(`${x}-${y}`);

  if (cell.classList.contains("open")) return;

  cell.classList.toggle("flag");

  const mines = document.getElementById("mines");
  if (cell.classList.contains("flag")) mines.textContent = parseInt(mines.textContent) - 1;
  if (!cell.classList.contains("flag")) mines.textContent = parseInt(mines.textContent) + 1;
}

function createGame() {
  const body = document.getElementById("game-wrapper");

  for (let i = 0; i < xCount; i++) {
    for (let j = 0; j < yCount; j++) {
      if (restarted) {
        board[i][j] = 0;
        bombMap[i][j] = 0;
      }

      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.id = `${i}-${j}`;

      body.appendChild(cell);

      cell.onmouseup = (e) => {
        if (e.button === 0 && !cell.classList.contains("flag")) {
          document.getElementById("smiley").style.backgroundImage = "url('./assets/smile.png')";
          openCell(i, j);
        }
      };

      cell.onmousedown = (e) => {
        if (e.button === 2) handleRightClick(i, j);
        else if (e.button === 0 && !cell.classList.contains("flag")) {
          cell.classList.toggle("mousedown");
          document.getElementById("smiley").style.backgroundImage = "url('./assets/shock.png')";
        }
      };

      cell.onmouseleave = () => cell.classList.remove("mousedown");
      cell.onmouseenter = () => {
        if (mousedown) cell.classList.add("mousedown");
      };
    }

    const timer = document.getElementById("timer");
    timer.textContent = "000";

    doTimer = true;

    const mines = document.getElementById("mines");
    mines.textContent = bombCount;
  }

  interval = setInterval(handleTimer, 1000);

  const gameWrapper = document.getElementById("game-wrapper");
  gameWrapper.style.gridTemplateColumns = `repeat(${xCount}, 1fr)`;

  handleResize();

  document.getElementById("game-wrapper").style.display = "grid";
  document.getElementById("loading-screen").style.display = "none";

  const smiley = document.getElementById("smiley");
  smiley.style.backgroundImage = "url('./assets/smile.png')";
}

// This makes sure the game always fits the screen regardless of the screen size, and the grid dimensions
function handleResize() {
  // Adjust variables
  aspectRatio = xCount / yCount;
  gameWidth = window.innerWidth * sizePercent;
  gameHeight = window.innerHeight * sizePercent - topMenuSize;
  cellWidth = Math.min(gameHeight / yCount, gameWidth / xCount);

  // Resize elements
  for (let i = 0; i < xCount; i++) {
    for (let j = 0; j < yCount; j++) {
      const cell = document.getElementById(`${i}-${j}`);

      cell.style.width = `${cellWidth}px`;
      cell.style.height = `${cellWidth}px`;

      cell.style.borderTopWidth = `${cellWidth / 7.5}px`;
      cell.style.borderBottomWidth = `${cellWidth / 7.5}px`;
      cell.style.borderLeftWidth = `${cellWidth / 7.5}px`;
      cell.style.borderRightWidth = `${cellWidth / 7.5}px`;
      cell.style.fontSize = `${cellWidth}px`;
    }
  }

  // Update the grid size
  const gameWrapper = document.getElementById("game-wrapper");
  gameWrapper.style.width = `${cellWidth * xCount}px`;
  gameWrapper.style.height = `${cellWidth * yCount}px`;

  const game = document.getElementById("game");
  game.style.width = `${cellWidth * xCount}px`;

  const topMenu = document.getElementById("top-menu");
  topMenuSize = window.innerHeight * 0.075;
  topMenu.style.height = `${topMenuSize}px`;
  topMenu.style.fontSize = `${topMenuSize / 2}px`;

  const smiley = document.getElementById("smiley");

  smiley.style.width = `${topMenuSize - 5}px`;
  smiley.style.height = `${topMenuSize - 5}px`;

  timer.style.width = `${topMenuSize * 2}px`;

  const mines = document.getElementById("mines");
  mines.style.width = `${topMenuSize * 2}px`;
}

window.addEventListener("resize", handleResize);
window.addEventListener("mousedown", (e) => {
  if (e.button === 0) mousedown = true;
});

document.addEventListener("contextmenu", (e) => e.preventDefault());
window.addEventListener("mouseup", () => (mousedown = false));

run();
