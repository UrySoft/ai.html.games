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
const turnIndicator = document.getElementById('turn-indicator');

function handleCellClick(event) {
    const cellIndex = event.target.getAttribute('data-index');

    if (board[cellIndex] !== "" || !isGameActive) {
        return;
    }

    board[cellIndex] = currentPlayer;
    event.target.textContent = currentPlayer;

    checkWinner();
    updateTurnIndicator();
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
            highlightWinningCells(winCondition);
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

function highlightWinningCells(winCondition) {
    winCondition.forEach(index => {
        cells[index].classList.add('winning');
    });
}

function updateTurnIndicator() {
    if (isGameActive) {
        turnIndicator.textContent = `Turno del jugador: ${currentPlayer}`;
    }
}

function restartGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameActive = true;
    statusMessage.textContent = "";
    turnIndicator.textContent = `Turno del jugador: X`;
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('winning');
    });
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', restartGame);
