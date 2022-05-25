let canvas = null;
let ctx = null
let xCount, yCount, width, height, w

let bombCount = 1
const board = []

let firstClick = true
let firstSpot

let difficulty = 'MEDIUM'

const bombImage = new Image()
bombImage.src = 'https://esraa-alaarag.github.io/Minesweeper/images/bomb.png'

const flagImage = new Image()
flagImage.src = 'https://inotgo.com/imagesLocal/202108/03/20210803020506364t_4.png'

const defaultImage = new Image()
defaultImage.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Minesweeper_unopened_square.svg/768px-Minesweeper_unopened_square.svg.png'

const menuSize = 100;

let time = 0
let timer = null

let nonBombCount = 0 
let remainingCells = 1000000

const handleTimer = () => {
  time += 1
  drawTimerOnScreen()
}

function startGame(diff = difficulty) {
  init(diff)
  
  clearBackground()
  generateCells()
  update();
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const init = (diff) => {
  timer = setInterval(handleTimer, 1000)

  switch (diff) {
    case 'BEGINNER':
      xCount = 9;
      yCount = 9;
      bombCount = 10
      break
    case 'HARD':
      xCount = 30
      yCount = 16
      bombCount = 99
      break
    default:  // Medium
      xCount = 16
      yCount = 16
      bombCount = 40
  }

  width = window.innerWidth - 10
  height = width;

  w = width / xCount
  height = Math.floor(yCount / xCount * width)
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')

  height += menuSize

  canvas.setAttribute('width', width)
  canvas.setAttribute('height', height)

  canvas.addEventListener('mousedown', handleMouseClick, true)
  canvas.addEventListener('contextmenu', handleRemoveRightClick, true)

  nonBombCount = xCount * yCount - bombCount;
  remainingCells = nonBombCount

  // window.addEventListener('resize', handleResize, true)

  ctx.font = `bold ${w + 2}px serif`
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
}

const handleRemoveRightClick = (e) => {
  e.preventDefault();
}


const handleMouseClick = (e) => {
  if (e.button !== 0 && e.button !== 2) return    // Only run on left click or right click
  // Get mouse position
  let i = Math.floor((e.x - canvas.offsetLeft + document.documentElement.scrollLeft) / w)
  let j = Math.floor((e.y - canvas.offsetTop + document.documentElement.scrollTop - menuSize) / w)
  
  // If you somehow click out of bounds
  if (j < 0 || i < 0) return
  if (i >= xCount) i = xCount -1
  if (j >= yCount) j = yCount -1

  // Right click
  if (e.button === 2) {
    board[i][j].toggleFlag()
    board[i][j].draw()
    return
  } board[i][j].show()
  
  // If it's your first time clicking, generate the bomb positions
  if (firstClick) {
    firstSpot = {i, j}
    generateBombPositions()
    generateBoardValues()
    board[i][j].show()    // Re draw it with the board value
    firstClick = false

    update();
  }

  // Show the gauranteed safe spots automatically 
  if (board[i][j].value === 0) {
    board[i][j].showNeighbours()
  }
  if (board[i][j].isFlagged) board[i][j].isFlagged = false
}

const update = () => {
  showAll()
}

// Re render
const showAll = () => {
  clearBackground()
  drawTimerOnScreen()

  // Grid
  board.forEach(row => {
    row.forEach(cell => {
      cell.draw()
    })
  })

  // drawBorder()
}

const showAllBombs = () => {
  board.forEach(row => {
    row.forEach(cell => {
      if (cell.isBomb && !cell.isShown && !cell.isFlagged) {
        cell.isShown = true
        cell.draw()
      }

      if (cell.isFlagged && !cell.isBomb) {
        ctx.strokeStyle = 'red'
        ctx.lineWidth = 3
        // Draw X
        ctx.beginPath();

        ctx.moveTo(cell.x, cell.y);
        ctx.lineTo(cell.x + w, cell.y + w)

        ctx.moveTo(cell.x + w, cell.y)
        ctx.lineTo(cell.x, cell.y + w)
        ctx.stroke();
      }
    })
  })
}


// **** START OF GAME **** \\
const generateCells = () => {
  for (let i = 0; i < xCount; i++) {
    board.push([])

    for (let j = 0; j < yCount; j++) {
      board[i].push(new Cell(i, j))}
  }

  
  board.forEach((col) => {
    col.forEach(cell => {
      cell.y += menuSize;
    })
  })
}

// **** START OF GAME **** \\
const generateBombPositions = () => {
  const safeRadius = 2    // Bombs should not be able to go inside of the safe area radius
  const safeSpots = []

  for (let i = -safeRadius; i <= safeRadius; i++) {
    for (let j = -safeRadius; j <= safeRadius; j++) {
      
      // Randomize safe area to prevent forced guess from only a sqaure of information
      let randomOffset = 0
      if (i === -safeRadius || i === safeRadius) randomOffset = Math.random() < 0.7 ? i < 0 ? -1 : 1 : 0
      if (j === -safeRadius || j === safeRadius) randomOffset = Math.random() < 0.7 ? j < 0 ? -1 : 1 : 0

      safeSpots.push({x: firstSpot.i - i, y: firstSpot.j - j})
      
      if (randomOffset !== 0) safeSpots.push({x: firstSpot.i - i + randomOffset, y: firstSpot.j - j + randomOffset})

    }
  }
  
  if (bombCount > xCount * yCount / 2) bombCount = Math.floor(xCount * yCount / 2)

  for (let i = 0; i < bombCount; i++) {
    const randX = Math.floor(Math.random() * xCount) 
    const randY = Math.floor(Math.random() * yCount)

    const spot = { x: randX, y: randY }

    if (obInArr(spot, safeSpots)) {
      i--
      continue
    }

    board[randX][randY].isBomb = true
  }
}

// Checks if an object exists in an array
const obInArr = (ob, arr) => {
  for (let i = 0; i < arr.length; i++) {
    if (JSON.stringify(arr[i]) === JSON.stringify(ob)) return true
  } return false
}

const generateBoardValues = () => {
  board.forEach(row => {
    row.forEach((cell) => {
      cell.generateValue();
    })
  })
}

// ----------------------------------------------------- 
class Cell {
  constructor(i, j) {
    this.i = i
    this.j = j

    this.x = i * w
    this.y = j * w

    this.isBomb = false;
    this.isShown = false;
    this.isFlagged = false;

    this.value = 0
  }

  show() {
    if (this.isShown) return
    if (this.isBomb) {
      ctx.fillStyle = 'red'
      ctx.fillRect(this.x, this.y, w, w)
      gameLost()
      return
    }

    remainingCells--

    this.isShown = true
    this.draw()
    checkState()
  }

  showNeighbours() {
    this.show()
    this.draw()

    if (this.value !== 0 || this.isBomb) return
    for (let i = this.i - 1; i <= this.i + 1; i++) {
      if (i < 0 || i >= xCount) continue    // Boundries

      for (let j = this.j - 1; j <= this.j + 1; j++) {
        if (j < 0 || j >= yCount) continue    // Boundries 

        if (!board[i][j].isShown) board[i][j].showNeighbours()
      }
    }
  }

  toggleFlag() {
    if (this.isShown) return
    this.isFlagged = !this.isFlagged
  }

  draw() {
    let img = ''
    if (this.isBomb && this.isShown) img = bombImage
    else if (this.isFlagged && !this.isShown) img = flagImage
    else if (!this.isShown) img = defaultImage

    if (img !== '') {
      ctx.drawImage(img, this.x, this.y, w, w)
    }

    else {
      ctx.fillStyle = '#cfced2'
      ctx.fillRect(this.x, this.y, w, w)
    }

    // Border
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    ctx.strokeRect(this.x, this.y, w, w)

    // Text content
    if (this.value === 0 || !this.isShown || this.isFlagged) return
    ctx.fillStyle = 
      this.value === 8 ? 'grey' : 
      this.value === 7 ? 'black' : 
      this.value === 6 ? 'cyan' : 
      this.value === 5 ? 'brown' : 
      this.value === 4 ? 'darkblue' : 
      this.value === 3 ? 'red' : 
      this.value === 2 ? 'green': 'blue'

    ctx.font = `${w + 2}px serif`
    ctx.fillText(this.value, this.x + w / 2, this.y + w / 2 + 2)
  }

  generateValue() {
    if (this.isBomb) return

    for (let i = this.i - 1; i <= this.i + 1; i++) {
      if (i < 0 || i >= xCount) continue    // Boundries

      for (let j = this.j - 1; j <= this.j + 1; j++) {
        if (j < 0 || j >= yCount) continue    // Boundries 

        if (board[i][j].isBomb) this.value++
      }
    }
  }
}

const gameLost = () => {
  showAllBombs();
  gameOver()
  
}

const gameOver = () => {
  // Remove functionality for the game
  canvas.removeEventListener('mousedown', handleMouseClick, true)
  canvas.removeEventListener('contextmenu', handleRemoveRightClick, true)

  clearInterval(timer)
}

const checkState = () => {
  if (remainingCells <= 0) gameWon()
}

const gameWon = () => {
  drawWinScreen()
  gameOver()
}

// ***** GRAPHICS FUNCTIONS ***** \\
const clearBackground = () => {
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)
}

const drawBorder = () => {
  ctx.strokeStyle = 'black'
  ctx.strokeRect(0, 0, width, height);
}

const drawTimerOnScreen = () => {
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, menuSize);
  ctx.font = `${w / 2}px serif`
  ctx.fillStyle = 'red'
  ctx.fillText(time, width / 2, menuSize / 2, width, menuSize)
}

const drawWinScreen = () => {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, width, height)

  ctx.font = `${w / 3}px serif`
  ctx.fillStyle = 'white';
  ctx.fillText("YOU WIN! REFRESH TO PLAY AGAIN", width / 2, height / 2, width)
}
