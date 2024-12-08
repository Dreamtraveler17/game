const gameBoard = document.getElementById("gameBoard");
const instructions = document.getElementById("instructions");
const result = document.getElementById("result");
const modeSelector = document.getElementById("modeSelector");
const score = document.getElementById("score");

const board = Array(9)
  .fill(null)
  .map(() => Array(9).fill(null)); // 主遊戲板
const miniBoards = Array(9)
  .fill(null)
  .map(() =>
    Array(3)
      .fill(null)
      .map(() => Array(3).fill(null))
  ); // 9個九宮格
let currentPlayer = "X";
let nextMiniBoard = null;
let gameOver = false;
let lineCount = Array(2) /* X : O */
  .fill(null)
  .map(() => Array(9).fill(0));
let X_score = 0;
let O_score = lineCount[1].reduce((total, current) => total + current, 0);
// 渲染遊戲
function renderBoard() {
  gameBoard.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const button = document.createElement("button");
      button.classList.add("cell");
      button.textContent = board[i][j] || ""; // 顯示 X 或 O

      if (board[i][j] !== null) button.classList.add("taken");

      // 標記玩家合法可下的位置
      if (
        // 一般棋
        nextMiniBoard &&
        Math.floor(i / 3) === nextMiniBoard.row &&
        Math.floor(j / 3) === nextMiniBoard.col &&
        board[i][j] === null
      ) {
        button.textContent = "*";
        button.classList.add("marked");
      } else if (
        // 自由棋
        nextMiniBoard === null &&
        board[i][j] === null
      ) {
        button.textContent = "*";
        button.classList.add("marked");
      }

      button.dataset.row = i;
      button.dataset.col = j;
      button.addEventListener("click", handleCellClick);

      gameBoard.appendChild(button);

      /* 比分 */
      X_score = lineCount[0].reduce((total, current) => total + current, 0);
      O_score = lineCount[1].reduce((total, current) => total + current, 0);
      score.textContent = `X: ${X_score} VS. O: ${O_score}`;

      // 添加分隔線
      if (j === 2 || j === 5) {
        const divider = document.createElement("span");
        divider.textContent = "|";
        gameBoard.appendChild(divider);
      }
    }
    if (i === 2 || i === 5) {
      const rowDivider = document.createElement("div");
      rowDivider.classList.add("row-divider");
      gameBoard.appendChild(rowDivider);
    }
  }
}

// 處理點擊格子邏輯
function handleCellClick(e) {
  if (gameOver) return;
  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);

  // 如果格子已被占用或不合法
  if (board[row][col] !== null) {
    alert("該格已被佔用！");
    return;
  }
  if (nextMiniBoard !== null) {
    //there is a assigned mini board
    const miniRow = Math.floor(row / 3);
    const miniCol = Math.floor(col / 3);
    if (nextMiniBoard.row !== miniRow || nextMiniBoard.col !== miniCol) {
      alert("你必須在指定的九宮格內下子！");
      return;
    }
  }

  // 更新遊戲狀態
  board[row][col] = currentPlayer;

  const miniRow = Math.floor(row / 3);
  const miniCol = Math.floor(col / 3);
  const cellRow = row % 3;
  const cellCol = col % 3;
  miniBoards[miniRow * 3 + miniCol][cellRow][cellCol] = currentPlayer;

  /* 更新總連線數 */
  const lines = countMiniBoardLines(miniBoards[miniRow * 3 + miniCol]);
  if (currentPlayer === "X") {
    lineCount[0][miniRow * 3 + miniCol] = lines;
  } else if (currentPlayer === "O") {
    lineCount[1][miniRow * 3 + miniCol] = lines;
  }

  nextMiniBoard = { row: cellRow, col: cellCol };
  if (isMiniBoardFull(nextMiniBoard.row, nextMiniBoard.col)) {
    nextMiniBoard = null; // 如果九宮格填滿，可以在任意位置下
  }

  // 檢查是否有贏家
  if (checkGameOver()) {
    gameOver = true;

    /* 結局展示 */
    gameBoard.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const button = document.createElement("button");
        button.classList.add("cell");
        button.textContent = board[i][j] || ""; // 顯示 X 或 O
        gameBoard.appendChild(button);

        /* 比分 */
        score.textContent = `X: ${lineCount[0].reduce(
          (total, current) => total + current,
          0
        )} VS. O: ${lineCount[1].reduce(
          (total, current) => total + current,
          0
        )}`;

        // 添加分隔線
        if (j === 2 || j === 5) {
          const divider = document.createElement("span");
          divider.textContent = "|";
          gameBoard.appendChild(divider);
        }
      }
      if (i === 2 || i === 5) {
        const rowDivider = document.createElement("div");
        rowDivider.classList.add("row-divider");
        gameBoard.appendChild(rowDivider);
      }
    }
    if (X_score > O_score) {
      result.textContent = `遊戲結束！玩家 X 贏了！`;
    } else if (X_score < O_score) {
      result.textContent = `遊戲結束！玩家 O 贏了！`;
    } else {
      result.textContent = `遊戲結束！結果是平局`;
    }
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  instructions.textContent = `輪到玩家 ${currentPlayer} 下棋`;

  // AI 回合
  if (modeSelector.value === "ai" && currentPlayer === "O") {
    const move = aiMove();
    handleCellClick({ target: { dataset: { row: move.row, col: move.col } } });
  }

  renderBoard();
}

// AI 隨機選擇動作
function aiMove() {
  const availableMoves = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === null) {
        availableMoves.push({ row: i, col: j });
      }
    }
  }
  if (nextMiniBoard !== null) {
    const validMoves = availableMoves.filter(
      (move) =>
        Math.floor(move.row / 3) === nextMiniBoard.row &&
        Math.floor(move.col / 3) === nextMiniBoard.col
    );
    if (validMoves.length > 0) {
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
  }
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

/* 計算當前玩家在最新點擊的小九宮格內有多少條連線 */
function countMiniBoardLines(miniBoard) {
  const lines = [
    /*
        a
        b
        c
    */
    [
      [0, 0],
      [0, 1],
      [0, 2],
    ], // top horizon
    [
      [1, 0],
      [1, 1],
      [1, 2],
    ], // mid horizon
    [
      [2, 0],
      [2, 1],
      [2, 2],
    ], // button horizon
    [
      [0, 0],
      [1, 0],
      [2, 0],
    ], // left vertical
    [
      [0, 1],
      [1, 1],
      [2, 1],
    ], // mid vertical
    [
      [0, 2],
      [1, 2],
      [2, 2],
    ], // right vertical
    [
      [0, 0],
      [1, 1],
      [2, 2],
    ], // SE
    [
      [0, 2],
      [1, 1],
      [2, 0],
    ], // NE
  ];

  let count = 0;
  for (const line of lines) {
    const [a, b, c] = line;
    if (
      miniBoard[a[0]][a[1]] === currentPlayer /* 其中的元素是currentPlayer */ &&
      miniBoard[a[0]][a[1]] ===
        miniBoard[b[0]][b[1]] /* 一條線上的元素相同 */ &&
      miniBoard[a[0]][a[1]] === miniBoard[c[0]][c[1]]
    ) {
      /* 找到一條成功的連線 */
      count++;
    }
  }
  return count;
}

// 檢查遊戲是否結束
function checkGameOver() {
  /* Board中沒有未被點擊到的cell */
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] == null) {
        return false;
      }
    }
  }

  return true;
}

// 檢查九宮格是否填滿
function isMiniBoardFull(row, col) {
  const miniBoard = miniBoards[row * 3 + col];
  for (const row of miniBoard) {
    if (row.includes(null)) return false;
  }
  return true;
}

// 初始化遊戲
renderBoard();



