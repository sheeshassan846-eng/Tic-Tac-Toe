const modeSelectScreen = document.getElementById("mode-select");
const gameScreen = document.getElementById("game-screen");
const btnAi = document.getElementById("btn-ai");
const btnFriend = document.getElementById("btn-friend");
const menuBtn = document.getElementById("menu-btn");

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset-btn");
const labelX = document.getElementById("label-x");
const labelO = document.getElementById("label-o");
const scoreXEl = document.getElementById("score-x");
const scoreOEl = document.getElementById("score-o");
const scoreDrawsEl = document.getElementById("score-draws");

const WIN_PATTERNS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;
let vsAI = false;
let aiPlaysToWin = true;
let scores = { X: 0, O: 0, draws: 0 };

function startGame(aiMode) {
  vsAI = aiMode;
  scores = { X: 0, O: 0, draws: 0 };
  updateScoreboard();

  labelX.textContent = vsAI ? "You (X)" : "Player X";
  labelO.textContent = vsAI ? "AI (O)" : "Player O";

  modeSelectScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  resetBoard();
}

function showModeMenu() {
  gameScreen.classList.add("hidden");
  modeSelectScreen.classList.remove("hidden");
}

function handleCellClick(event) {
  const cell = event.target;
  const index = Number(cell.dataset.index);

  if (board[index] !== "" || !gameActive) return;
  if (vsAI && currentPlayer === "O") return;

  makeMove(index, currentPlayer);

  if (gameActive && vsAI && currentPlayer === "O") {
    statusText.textContent = "AI is thinking...";
    setTimeout(() => {
      const aiIndex = getAIMove();
      if (aiIndex !== null) {
        makeMove(aiIndex, "O");
      }
    }, 300);
  }
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add(player.toLowerCase());
  checkResult();
}

function checkResult() {
  let winningCombo = null;

  for (const pattern of WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      winningCombo = pattern;
      break;
    }
  }

  if (winningCombo) {
    gameActive = false;
    winningCombo.forEach((index) => cells[index].classList.add("win"));
    if (vsAI) {
      statusText.textContent = currentPlayer === "X" ? "You win!" : "AI wins!";
    } else {
      statusText.textContent = `Player ${currentPlayer} wins!`;
    }
    scores[currentPlayer]++;
    updateScoreboard();
    return;
  }

  if (!board.includes("")) {
    gameActive = false;
    statusText.textContent = "It's a draw!";
    scores.draws++;
    updateScoreboard();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  if (vsAI) {
    statusText.textContent = currentPlayer === "X" ? "Your turn (X)" : "AI's turn (O)";
  } else {
    statusText.textContent = `Player ${currentPlayer}'s turn`;
  }
}

function getAIMove() {
  const scoredMoves = [];

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";
      const score = minimax(board, 0, false);
      board[i] = "";
      scoredMoves.push({ index: i, score });
    }
  }

  if (scoredMoves.length === 0) return null;

  // Sort moves from strongest to weakest
  scoredMoves.sort((a, b) => b.score - a.score);

  if (aiPlaysToWin) {
    // 70% rounds: pick the strongest move
    const bestScore = scoredMoves[0].score;
    const bestMoves = scoredMoves.filter((m) => m.score === bestScore);
    return bestMoves[Math.floor(Math.random() * bestMoves.length)].index;
  } else {
    // 30% rounds: pick a weaker move so the player can win
    const weakMoves = scoredMoves.slice(1);
    if (weakMoves.length > 0) {
      return weakMoves[Math.floor(Math.random() * weakMoves.length)].index;
    }
    return scoredMoves[0].index;
  }
}

function minimax(currentBoard, depth, isMaximizing) {
  const winner = evaluateWinner(currentBoard);
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (!currentBoard.includes("")) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === "") {
        currentBoard[i] = "O";
        bestScore = Math.max(bestScore, minimax(currentBoard, depth + 1, false));
        currentBoard[i] = "";
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === "") {
        currentBoard[i] = "X";
        bestScore = Math.min(bestScore, minimax(currentBoard, depth + 1, true));
        currentBoard[i] = "";
      }
    }
    return bestScore;
  }
}

function evaluateWinner(b) {
  for (const [a, c, d] of WIN_PATTERNS) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) {
      return b[a];
    }
  }
  return null;
}

function updateScoreboard() {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDrawsEl.textContent = scores.draws;
}

function resetBoard() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;
  // 70% chance AI plays sharply, 30% chance AI leaves openings for the player
  aiPlaysToWin = Math.random() < 0.7;
  statusText.textContent = vsAI ? "Your turn (X)" : "Player X's turn";

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("x", "o", "win");
  });
}

btnAi.addEventListener("click", () => startGame(true));
btnFriend.addEventListener("click", () => startGame(false));
menuBtn.addEventListener("click", showModeMenu);
cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
resetBtn.addEventListener("click", resetBoard);
