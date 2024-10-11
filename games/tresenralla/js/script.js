let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const statusMessage = document.getElementById('status-message');
const cells = document.querySelectorAll('.cell');
const restartButton = document.getElementById('restart');

function handleCellClick(event) {
    const cellIndex = event.target.getAttribute('data-index');

    if (board[cellIndex] !== "" || !isGameActive) {
        return;
    }

    board[cellIndex] = currentPlayer;
    event.target.textContent = currentPlayer;

    checkWinner();
}

function checkWinner() {
    let roundWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];

        if (a === "" || b === "" || c === "") {
            continue;
        }

        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusMessage.textContent = `Jugador ${currentPlayer} ha ganado!`;
        isGameActive = false;
        return;
    }

    if (!board.includes("")) {
        statusMessage.textContent = "Es un empate!";
        isGameActive = false;
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
}

function restartGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameActive = true;
    statusMessage.textContent = "";
    cells.forEach(cell => {
        cell.textContent = "";
    });
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', restartGame);
