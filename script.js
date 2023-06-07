const table = document.getElementById("table");
const cells = document.querySelectorAll("td");
const container = document.getElementById("container");
const prompt = document.querySelector("#prompt h1");
const blackCorner = document.getElementById("black-corner")
const yellowCorner = document.getElementById("yellow-corner")
const blackBench = document.getElementById("black-bench");
const yellowBench = document.getElementById("yellow-bench");
const blackScore = document.getElementById("black-score");
const yellowScore = document.getElementById("yellow-score");
const blackName = document.getElementById("black-name");
const yellowName = document.getElementById("yellow-name");
const gameBoard = document.getElementById("game-board");
const player1 = document.getElementById("player1");
const player2 = document.getElementById("player2");
const pointsToWin = document.getElementById("points-to-win");
const boardDimensions = document.getElementById("board-dimensions");
const numberOfKittens = document.getElementById("number-of-kittens");
const form = document.getElementById("form-container");
const startScreen = document.getElementById("start-screen");
const startGameButton = document.getElementById("start-game-btn");
const restartGameButton = document.getElementById("restart-game-btn");
let blackKittens = [];
let yellowKittens = [];
let currPlayer = "black";
let opponent = "yellow";
let score = {
    black: 0,
    yellow: 0
};
let gameOver = false;
let winningScore = 5;
let kittensPerPlayer;
let boardSize;

function createGame(p1, p2, points, size, kittens) {
    startScreen.style.display = "none";
    restartGameButton.style.display = "none";
    container.style.display = "flex";
    blackName.innerText = p1;
    yellowName.innerText = p2;
    winningScore = points;
    kittensPerPlayer = kittens;
    boardSize = size;
    table.style.width = `50%`;
    table.style.height = `100%`;
    table.style.display = "grid";
    table.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    table.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    table.style.boxSizing = "border-box";
    let kittenSize = Math.sqrt(80000 / kittens);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.createElement("td");
            cell.id = `${i}${j}`;
            cell.classList.add("empty-cell");
            cell.style.width = `${table.style.width / size}px`;
            cell.style.height = `${table.style.height / size}px`;
            cell.setAttribute("ondragover", "event.preventDefault();");
            cell.setAttribute("ondrop", "drop(event)");
            cell.setAttribute("ondragenter", "dragEnter(event)");
            cell.setAttribute("onmouseover", "handleMouseOver(event)");
            cell.setAttribute("onmouseout", "handleMouseOver(event)");
            table.appendChild(cell);
        }
    }
    for (let i = 0; i < kittens; i++) {
        const black = document.createElement("div");
        black.classList.add("black");
        black.style.width =  `${kittenSize}px` ;
        black.style.height =   `${kittenSize}px`;
        black.setAttribute("draggable", "true");
        blackBench.appendChild(black);
        blackKittens.push(black);
        const yellow = document.createElement("div");
        yellow.classList.add("yellow");
        yellow.style.width = `${kittenSize}px`;
        yellow.style.height = `${kittenSize}px`;
        yellowBench.appendChild(yellow);
        yellowKittens.push(yellow);
        yellow.setAttribute("draggable", "true");
    }

}
function delegate(parent, type, selector, handler) {
    if (gameOver) { return; }
    parent.addEventListener(type, function (event) {
        const targetElement = event.target.closest(selector);
        if (this.contains(targetElement)) {
            handler.call(targetElement, event);
        }
    });
}

function getNewPosition(id, row, col) {
    const adjRow = parseInt(id[0]);
    const adjCol = parseInt(id[1]);
    let newRow, newCol;
    if (adjRow < row) {
        newRow = adjRow - 1;
    } else if (adjRow > row) {
        newRow = adjRow + 1;
    } else {
        newRow = adjRow;
    }
    if (adjCol < col) {
        newCol = adjCol - 1;
    } else if (adjCol > col) {
        newCol = adjCol + 1;
    } else {
        newCol = adjCol;
    }
    return `${newRow}${newCol}`;
}

function getKittensToRemove(row, col) {
    let adjacentCellColors = [];
    let adjacentCells = [];
    let merged = [];
    let kittensToRemove = [];
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            if (i < 0 || i > boardSize - 1 || j < 0 || j > boardSize - 1) {
                continue;
            }
            if (i === row && j === col) {
                continue;
            }
            adjacentCells.push(`${i}${j}`);
            adjacentCellColors.push(document.getElementById(`${i}${j}`).classList[0]);
        }
    }
    for (let i = 0; i < adjacentCells.length; i++) {
        merged.push([adjacentCells[i], adjacentCellColors[i]]);
    }
    for (let i = 0; i < merged.length; i++) {
        if (merged[i][1] === "black" || merged[i][1] === "yellow") {
            kittensToRemove.push(merged[i]);
        } else {
            continue;
        }
    }
    return kittensToRemove;
}

function pushKittens(row, col) {
    let kittensToPush = getKittensToRemove(row, col);
    for (let i = 0; i < kittensToPush.length; i++) {
        const newCell = document.getElementById(getNewPosition(kittensToPush[i][0], row, col));
        if (newCell === null) {
            const cell = document.getElementById(kittensToPush[i][0]);
            cell.classList.remove(kittensToPush[i][1]);
            cell.classList.add("empty-cell");
            cell.style.backgroundColor = "white";
            if (kittensToPush[i][1] === "black" && blackBench.childElementCount < kittensPerPlayer) {
                const black = document.createElement("div");
                black.classList.add("black");
                black.style.width = `100px`;
                black.style.height = `${800 / kittensPerPlayer}px`;
                black.setAttribute("draggable", "true");
                blackBench.appendChild(black);
                blackKittens.push(black);
            } else if (kittensToPush[i][1] === "yellow" && yellowBench.childElementCount < kittensPerPlayer) {
                const yellow = document.createElement("div");
                yellow.classList.add("yellow");
                yellow.style.width = `100px`;
                yellow.style.height = `${800 / kittensPerPlayer}px`;
                yellowBench.appendChild(yellow);
                yellowKittens.push(yellow);
                yellow.setAttribute("draggable", "true");
            }

        } else {
            if (newCell.classList.contains("black") || newCell.classList.contains("yellow")) {
                continue;
            } else if (newCell.classList.contains("empty-cell")) {
                const cell = document.getElementById(kittensToPush[i][0]);
                cell.classList.remove(kittensToPush[i][1]);
                cell.classList.add("empty-cell");
                newCell.classList.remove("empty-cell");
                newCell.classList.add(kittensToPush[i][1]);
                cell.style.backgroundColor = "white";
                newCell.style.backgroundColor = "white";
            }

        }
    }

}

function updateScore() {
    if (gameOver) { return; }

    function isAligned(c, c1, c2, c3) {
        if (c1.classList[0] !== "empty-cell" &&
            c1.classList[0] === c2.classList[0] &&
            c2.classList[0] === c3.classList[0]) {
            if (c === "black") {
                for (let i = 0; i < 3; i++) {
                    const b = document.createElement("div");
                    b.classList.add("black");
                    blackBench.appendChild(b);
                    blackKittens.push(b);

                }
            } else if (c === "yellow") {
                for (let i = 0; i < 3; i++) {
                    const y = document.createElement("div");
                    y.classList.add("yellow");
                    yellowBench.appendChild(y);
                    yellowKittens.push(y);
                }
            }
            score[c]++;
            c1.classList.replace(c1.classList[0], "empty-cell");
            c2.classList.replace(c2.classList[0], "empty-cell");
            c3.classList.replace(c3.classList[0], "empty-cell");
        }

    }

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (i < boardSize - 2) {
                let cell1 = document.getElementById(`${i}${j}`);
                let cell2 = document.getElementById(`${i + 1}${j}`);
                let cell3 = document.getElementById(`${i + 2}${j}`);
                isAligned(cell1.classList[0], cell1, cell2, cell3);
            }
            if (j < boardSize - 2) {
                let cell1 = document.getElementById(`${i}${j}`);
                let cell2 = document.getElementById(`${i}${j + 1}`);
                let cell3 = document.getElementById(`${i}${j + 2}`);
                isAligned(cell1.classList[0], cell1, cell2, cell3);
            }
            if (i < boardSize - 2 && j < boardSize - 2) {
                let cell1 = document.getElementById(`${i}${j}`);
                let cell2 = document.getElementById(`${i + 1}${j + 1}`);
                let cell3 = document.getElementById(`${i + 2}${j + 2}`);
                isAligned(cell1.classList[0], cell1, cell2, cell3);
            }
            if (i < boardSize - 2 && j >= 2) {
                let cell1 = document.getElementById(`${i}${j}`);
                let cell2 = document.getElementById(`${i + 1}${j - 1}`);
                let cell3 = document.getElementById(`${i + 2}${j - 2}`);
                isAligned(cell1.classList[0], cell1, cell2, cell3);
            }
        }
    }
    blackScore.innerText = score.black;
    yellowScore.innerText = score.yellow;
}



function isGameOver() {
    if (blackKittens.length === 0 && currPlayer === "black") {
        prompt.textContent = "Black ran out of kittens, game over! Yellow wins!";
        restartGameButton.style.display = "block";
        gameOver = true;
    } else if (yellowKittens.length === 0 && currPlayer === "yellow") {
        prompt.textContent = "Yellow ran out of kittens, game over! Black wins!";
        restartGameButton.style.display = "block";
        gameOver = true;
    }
    if (blackScore.innerText === winningScore) {
        prompt.innerText = `Black wins!`;
        restartGameButton.style.display = "block";
        gameOver = true;
    } else if (yellowScore.innerText === winningScore) {
        prompt.innerText = `Yellow wins!`;
        restartGameButton.style.display = "block";
        gameOver = true;
    }
}

function handleElementClick(event) {
    if (gameOver) {
        return;
    }
    const c = event.target;
    const row = parseInt(c.id[0]);
    const col = parseInt(c.id[1]);
    let removed = null;

    if (c.classList.contains("black") || c.classList.contains("yellow")) { return; }
    else if (c.classList.contains("empty-cell")) {
        if (currPlayer === "black") {
            c.classList.add("black");
            currPlayer = "yellow";
            prompt.textContent = "Yellow's turn";
            removed = blackKittens.pop();
        } else {
            c.classList.add("yellow");
            currPlayer = "black";
            prompt.textContent = "Black's turn";
            removed = yellowKittens.pop();
        }
        if (removed !== null) {
            removed.remove();
        }
        c.classList.remove("empty-cell");
    }
    pushKittens(row, col);
    updateScore();
    isGameOver();
}

function handleMouseOver(event) {
    let eventType = event.type;
    const c = event.target;
    const row = parseInt(c.id[0]);
    const col = parseInt(c.id[1]);
    let kittensToHighlight = getKittensToRemove(row, col);
    for (let i = 0; i < kittensToHighlight.length; i++) {
        const newCell = document.getElementById(getNewPosition(kittensToHighlight[i][0], row, col));
        if (newCell === null) {
            const cell = document.getElementById(kittensToHighlight[i][0]);
            if (eventType === "mouseover") {
                c.style.backgroundColor = "#737a89";
                cell.style.backgroundColor = "#FBF719 ";
                newCell.style.backgroundColor = "#5DE23C";
            } else {
                c.style.backgroundColor = "white";
                cell.style.backgroundColor = "white";
                newCell.style.backgroundColor = "white";
            }
        } else {
            if (newCell.classList.contains("black") || newCell.classList.contains("yellow")) {
                continue;
            } else if (newCell.classList.contains("empty-cell")) {
                const cell = document.getElementById(kittensToHighlight[i][0]);
                if (eventType === "mouseover") {
                    c.style.backgroundColor = "#737a89";
                    newCell.style.backgroundColor = "#5DE23C";
                    cell.style.backgroundColor = "#FBF719 ";
                } else {
                    c.style.backgroundColor = "white";
                    cell.style.backgroundColor = "white";
                    newCell.style.backgroundColor = "white";
                }
            }
        }

    }
}

function handleMouseOut(event) {
    const c = event.target;
    const row = parseInt(c.id[0]);
    const col = parseInt(c.id[1]);
    let removeHighlight = getKittensToRemove(row, col);
    for (let i = 0; i < removeHighlight.length; i++) {
        const newCell = document.getElementById(getNewPosition(removeHighlight[i][0], row, col));
        if (newCell === null) {
            const cell = document.getElementById(removeHighlight[i][0]);
            cell.style.backgroundColor = "";
            newCell.style.backgroundColor = "";
        } else {
            if (newCell.classList.contains("black") || newCell.classList.contains("yellow")) {
                continue;
            } else if (newCell.classList.contains("empty-cell")) {
                const cell = document.getElementById(removeHighlight[i][0]);
                newCell.style.backgroundColor = "";
                cell.style.backgroundColor = "";
            }
        }

    }
}



function dragStart(event) {
    let pickedUp = this.classList[0];
    if (this.classList.contains(currPlayer)) {
        this.classList.add("dragging");
    }
}
function dragEnd(event) {
    this.classList.remove("dragging");
}
function dragEnter(event) {
    event.preventDefault();
    let eventType = event.type;
    const c = event.target;
    const row = parseInt(c.id[0]);
    const col = parseInt(c.id[1]);
    let kittensToHighlight = getKittensToRemove(row, col);
    for (let i = 0; i < kittensToHighlight.length; i++) {
        const newCell = document.getElementById(getNewPosition(kittensToHighlight[i][0], row, col));
        if (newCell === null) {
            const cell = document.getElementById(kittensToHighlight[i][0]);
            if (eventType === "mouseover") {
                c.style.backgroundColor = "#737a89";
                cell.style.backgroundColor = "#FBF719 ";
                newCell.style.backgroundColor = "#5DE23C";
            } else {
                c.style.backgroundColor = "white";
                cell.style.backgroundColor = "white";
                newCell.style.backgroundColor = "white";
            }
        } else {
            if (newCell.classList.contains("black") || newCell.classList.contains("yellow")) {
                continue;
            } else if (newCell.classList.contains("empty-cell")) {
                const cell = document.getElementById(kittensToHighlight[i][0]);
                if (eventType === "mouseover") {
                    c.style.backgroundColor = "#737a89";
                    newCell.style.backgroundColor = "#5DE23C";
                    cell.style.backgroundColor = "#FBF719 ";
                } else {
                    c.style.backgroundColor = "white";
                    cell.style.backgroundColor = "white";
                    newCell.style.backgroundColor = "white";
                }
            }
        }

    }

}
function drop(event) {
    event.preventDefault();
    if (gameOver) return;
        if (gameOver) {
            return;
        }
        const c = event.target;
        const row = parseInt(c.id[0]);
        const col = parseInt(c.id[1]);
        let removed = null;
    
        if (c.classList.contains("black") || c.classList.contains("yellow")) { return; }
        else if (c.classList.contains("empty-cell")) {
            if (currPlayer === "black") {
                c.classList.add("black");
                currPlayer = "yellow";
                prompt.textContent = "Yellow's turn";
                removed = blackKittens.pop();
            } else {
                c.classList.add("yellow");
                currPlayer = "black";
                prompt.textContent = "Black's turn";
                removed = yellowKittens.pop();
            }
            if (removed !== null) {
                removed.remove();
            }
            c.classList.remove("empty-cell");
        }
        pushKittens(row, col);
        updateScore();
        isGameOver();
    
}



startGameButton.addEventListener("click", function (event) {
    event.preventDefault();
    createGame(player1.value, player2.value, pointsToWin.value, boardDimensions.value, numberOfKittens.value);
});
restartGameButton.addEventListener("click", function (event) {
    event.preventDefault();
    blackKittens = [];
    yellowKittens = [];
    blackBench.innerHTML = "";
    yellowBench.innerHTML = "";
    currPlayer = "black";
    score = {
        black: 0,
        yellow: 0
    };
    gameOver = false;
    table.innerHTML = "";
    blackScore.innerText = "0";
    yellowScore.innerText = "0";
    prompt.innerText = "Black kittens start the game!";
    createGame(player1.value, player2.value, pointsToWin.value, boardDimensions.value, numberOfKittens.value);
}
);

delegate(table, "click", "td", handleElementClick);
delegate(table, "mouseover", "td", handleMouseOver);
delegate(table, "mouseout", "td", handleMouseOver);
delegate(blackBench, "dragstart", "img", dragStart);
delegate(blackBench, "dragend", "img", dragEnd);
delegate(blackBench, "dragenter", "td", dragEnter);
delegate(blackBench, "drop", "td", drop);
delegate(yellowBench, "dragstart", "img", dragStart);
delegate(yellowBench, "dragend", "img", dragEnd);
delegate(yellowBench, "dragenter", "td", dragEnter);
delegate(yellowBench, "drop", "td", drop);
