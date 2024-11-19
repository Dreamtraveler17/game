const gameBoard = document.getElementById("gameBoard");
const instructions = document.getElementById("instructions");
const result = document.getElementById("result");
const modeSelector = document.getElementById("modeSelector");

const board = Array(9).fill(null).map(() => Array(9).fill(null)); // 主遊戲板
const miniBoards = Array(9).fill(null).map(() => Array(3).fill(null).map(() => Array(3).fill(null))); // 9個九宮格
let currentPlayer = "X";
let nextMiniBoard = null;
let gameOver = false;

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
                nextMiniBoard &&
                Math.floor(i / 3) === nextMiniBoard.row &&
                Math.floor(j / 3) === nextMiniBoard.col &&
                board[i][j] === null
            ) {
                button.textContent = "*";
                button.classList.add("marked");
            }

            button.dataset.row = i;
            button.dataset.col = j;
            button.addEventListener("click", handleCellClick);

            gameBoard.appendChild(button);

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

    const winner = checkMiniBoardWinner(miniBoards[miniRow * 3 + miniCol]);
    if (winner) {
        instructions.textContent = `九宮格 (${miniRow}, ${miniCol}) 被 ${winner} 佔領！`;
    }

    nextMiniBoard = { row: cellRow, col: cellCol };
    if (isMiniBoardFull(nextMiniBoard.row, nextMiniBoard.col)) {
        nextMiniBoard = null; // 如果九宮格填滿，可以在任意位置下
    }

    // 檢查是否有贏家
    if (checkGameOver()) {
        gameOver = true;
        result.textContent = `遊戲結束！玩家 ${currentPlayer} 贏了！`;
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
        const validMoves = availableMoves.filter(move =>
            Math.floor(move.row / 3) === nextMiniBoard.row &&
            Math.floor(move.col / 3) === nextMiniBoard.col
        );
        if (validMoves.length > 0) {
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        }
    }
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// 檢查小九宮格獲勝
function checkMiniBoardWinner(miniBoard) {
    const lines = [
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]],
    ];

    for (const line of lines) {
        const [a, b, c] = line;
        if (miniBoard[a[0]][a[1]] &&
            miniBoard[a[0]][a[1]] === miniBoard[b[0]][b[1]] &&
            miniBoard[a[0]][a[1]] === miniBoard[c[0]][c[1]]) {
            return miniBoard[a[0]][a[1]];
        }
    }
    return null;
}

// 檢查遊戲是否結束
function checkGameOver() {
    // TODO: 判斷大九宮格的連線規則
    return false;
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


