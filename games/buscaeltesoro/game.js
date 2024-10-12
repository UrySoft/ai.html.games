const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');
const restartButton = document.getElementById('restart-btn');

const boardSize = 6;
const treasures = 4;
const traps = 4;
let board = [];
let treasuresFound = 0;
let gameOver = false;

function createBoard() {
    board = Array(boardSize).fill().map(() => Array(boardSize).fill({ type: 'empty', revealed: false }));
    placeRandomItems('treasure', treasures);
    placeRandomItems('trap', traps);
    renderBoard();
}

function placeRandomItems(type, count) {
    let placed = 0;
    while (placed < count) {
        const x = Math.floor(Math.random() * boardSize);
        const y = Math.floor(Math.random() * boardSize);
        if (board[x][y].type === 'empty') {
            board[x][y] = { type: type, revealed: false };
            placed++;
        }
    }
}

function renderBoard() {
    boardElement.innerHTML = '';
    for (let x = 0; x < boardSize; x++) {
        for (let y = 0; y < boardSize; y++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (board[x][y].revealed) {
                cell.classList.add('revealed');
                if (board[x][y].type === 'treasure') {
                    cell.classList.add('treasure');
                    cell.textContent = '💰';
                } else if (board[x][y].type === 'trap') {
                    cell.classList.add('trap');
                    cell.textContent = '💥';
                }
            }
            cell.addEventListener('click', () => handleCellClick(x, y));
            boardElement.appendChild(cell);
        }
    }
}

function handleCellClick(x, y) {
    if (gameOver || board[x][y].revealed) return;

    board[x][y].revealed = true;
    if (board[x][y].type === 'treasure') {
        treasuresFound++;
        if (treasuresFound === treasures) {
            messageElement.textContent = '¡Has encontrado todos los tesoros!';
            gameOver = true;
        }
    } else if (board[x][y].type === 'trap') {
        messageElement.textContent = '¡Has caído en una trampa!';
        gameOver = true;
    }
    renderBoard();
}

function resetGame() {
    treasuresFound = 0;
    gameOver = false;
    messageElement.textContent = '';
    createBoard();
}

restartButton.addEventListener('click', resetGame);

resetGame();
