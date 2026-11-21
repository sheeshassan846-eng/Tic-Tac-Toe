const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset-btn");
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
let scores = { X: 0, O: 0, draws: 0 };

function handleCellClick(event) {
  const cell = event.target;
  const index = Number(cell.dataset.index);

  if (board[index] !== "" || !gameActive) return;

  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());

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
    statusText.textContent = `Player ${currentPlayer} wins!`;
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
  statusText.textContent = `Player ${currentPlayer}'s turn`;
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
  statusText.textContent = "Player X's turn";

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("x", "o", "win");
  });
}

cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
resetBtn.addEventListener("click", resetBoard);
