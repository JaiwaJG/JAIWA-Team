const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");

const restartBtn = document.getElementById("restart");
const newGameBtn = document.getElementById("newGame");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameRunning = true;

let xScore = 0;
let oScore = 0;
let drawScore = 0;

const winPatterns = [
    [0,1,2],
    [3,4,5],
    [6,7,8],

    [0,3,6],
    [1,4,7],
    [2,5,8],

    [0,4,8],
    [2,4,6]
];

cells.forEach(cell => {
    cell.addEventListener("click", cellClicked);
});

restartBtn.addEventListener("click", restartRound);

newGameBtn.addEventListener("click", newGame);

function cellClicked(){

    const index = this.dataset.index;

    if(board[index] !== "" || !gameRunning) return;

    board[index] = currentPlayer;

    this.textContent = currentPlayer;

    this.classList.add(currentPlayer.toLowerCase());

    checkWinner();

}

function checkWinner(){

    let roundWon = false;

    for(let pattern of winPatterns){

        const a = board[pattern[0]];
        const b = board[pattern[1]];
        const c = board[pattern[2]];

        if(a === "" || b === "" || c === "") continue;

        if(a === b && b === c){

            roundWon = true;

            pattern.forEach(i => {
                cells[i].classList.add("winner");
            });

            break;

        }

    }

    if(roundWon){

        statusText.textContent =
        `Player ${currentPlayer} Wins!`;

        gameRunning = false;

        if(currentPlayer === "X"){

            xScore++;

            scoreX.textContent = xScore;

        }else{

            oScore++;

            scoreO.textContent = oScore;

        }

        return;

    }

    if(!board.includes("")){

        statusText.textContent = "🤝 Draw!";

        drawScore++;

        scoreDraw.textContent = drawScore;

        gameRunning = false;

        return;

    }

    currentPlayer =
    currentPlayer === "X"
    ? "O"
    : "X";

    statusText.textContent =
    `Player ${currentPlayer} Turn`;

}

function restartRound(){

    board =
    ["","","","","","","","",""];

    currentPlayer = "X";

    gameRunning = true;

    statusText.textContent =
    "Player X Turn";

    cells.forEach(cell=>{

        cell.textContent = "";

        cell.classList.remove(
            "x",
            "o",
            "winner"
        );

    });

}

function newGame(){

    xScore = 0;

    oScore = 0;

    drawScore = 0;

    scoreX.textContent = 0;

    scoreO.textContent = 0;

    scoreDraw.textContent = 0;

    restartRound();

}