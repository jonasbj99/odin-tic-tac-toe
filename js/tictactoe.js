const BOARD_SIZE = 3;

// Elements
const startDialog = document.getElementById("startDialog");
const p1Input = document.getElementById("p1Input");
const p2Input = document.getElementById("p2Input");
const startBtn = document.getElementById("startBtn");
const endDialog = document.getElementById("endDialog");
const endTitle = document.getElementById("endTitle");
const restartBtn = document.getElementById("restartBtn");
const p1Tag = document.getElementById("p1Tag");
const p2Tag = document.getElementById("p2Tag");
const gameboardEl = document.getElementById("gameboardEl");
const messageEl = document.getElementById("messageEl");

function BoardController() {
  const board = [];

  for (let i = 0; i < BOARD_SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < BOARD_SIZE; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => board;

  const changeCell = (row, column, player) => {
    const cell = board[row][column];

    if (cell.getValue() != 0) return false;

    board[row][column].setValue(player);

    return true;
  };

  const resetBoard = () => {
    board.map((row) => row.map((cell) => cell.setValue(0)));
  };

  return { getBoard, changeCell, resetBoard };
}

function Cell() {
  let value = 0;

  const setValue = (player) => (value = player);

  const getValue = () => value;

  return { setValue, getValue };
}

function GameController() {
  const board = BoardController();

  let placedCells = [];

  const players = [
    {
      name: "Player 1",
      value: 1,
      element: p1Tag,
      token: "url(./img/jbj-circle.svg)",
    },
    {
      name: "Player 2",
      value: 2,
      element: p2Tag,
      token: "url(./img/jbj-cross.svg)",
    },
  ];

  let activePlayer = players[0];

  const getActivePlayer = () => activePlayer;

  const setPlayerNames = (name1, name2) => {
    players[0].name = name1;
    players[0].element.querySelector("p").textContent = name1;

    players[1].name = name2;
    players[1].element.querySelector("p").textContent = name2;
  };

  const switchActivePlayer = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const checkWin = (row, col) => {
    const currentBoard = board.getBoard();
    const rowInt = parseInt(row);
    const colInt = parseInt(col);
    let won = false;
    let line = [];

    const directions = [
      [1, 0], // Vertical
      [0, 1], // Horizontal
      [1, 1], // Diagonal TL
      [-1, 1], // Diagonal TR
    ];

    for (const dir of directions) {
      line = [[rowInt, colInt]];

      for (const neg of [1, -1]) {
        let newRow = rowInt;
        let newCol = colInt;
        let withinBoard = true;
        let multi = 1;

        while (withinBoard) {
          newRow += dir[0] * multi * neg;
          newCol += dir[1] * multi * neg;

          const rowSafe = newRow >= 0 && newRow < BOARD_SIZE;
          const colSafe = newCol >= 0 && newCol < BOARD_SIZE;

          if (rowSafe && colSafe) {
            const currentVal = currentBoard[newRow][newCol].getValue();
            if (currentVal === activePlayer.value) line.push([newRow, newCol]);
          } else {
            withinBoard = false;
          }
        }

        multi++;
      }

      if (line.length >= BOARD_SIZE) {
        won = true;
        break;
      }
    }

    return { won, line };
  };

  const playRound = (row, col) => {
    board.changeCell(row, col, activePlayer.value);
    placedCells.push([row, col]);

    const { won, line } = checkWin(row, col);
    const tie = placedCells.length >= BOARD_SIZE * BOARD_SIZE;

    if (!won && !tie) {
      switchActivePlayer();
    }

    return { tie, won, line };
  };

  const restartGame = () => {
    placedCells = [];
    board.resetBoard();
    switchActivePlayer();
  };

  return {
    getActivePlayer,
    playRound,
    restartGame,
    getBoard: board.getBoard,
    setPlayerNames,
  };
}

const display = (() => {
  const game = GameController();

  const startGame = () => {
    // !!! ADD INPUT VALIDATION
    const p1Name = p1Input.value;
    const p2Name = p2Input.value;

    game.setPlayerNames(p1Name, p2Name);

    createDisplayBoard();

    startDialog.close();
  };

  const displayActivePlayer = () => {
    const activePlayer = game.getActivePlayer();

    p1Tag.classList.remove("active");
    p2Tag.classList.remove("active");

    activePlayer.element.classList.add("active");
    messageEl.textContent = `${activePlayer.name}'s turn`;
  };

  const createDisplayBoard = () => {
    const board = game.getBoard();
    board.map((row, i) => {
      row.map((cell, j) => {
        const cellBtn = document.createElement("button");
        cellBtn.dataset.row = i;
        cellBtn.dataset.col = j;
        cellBtn.classList.add("board-btn");
        cellBtn.addEventListener("click", cellClickHandler);
        gameboardEl.appendChild(cellBtn);
      });
    });

    displayActivePlayer();
  };

  function cellClickHandler(e) {
    const active = game.getActivePlayer();
    const row = e.target.dataset.row;
    const col = e.target.dataset.col;

    e.target.removeEventListener("click", cellClickHandler);
    e.target.classList.add(`selected-${active.value}`);
    e.target.style.backgroundImage = active.token;

    const { tie, won, line } = game.playRound(row, col);

    if (won) {
      displayWin(line);
    } else if (tie) {
      displayTie();
    } else {
      displayActivePlayer();
    }
  }

  const clearDisplay = () => {
    const children = gameboardEl.querySelectorAll("*");
    children.forEach((child) => child.remove());
  };

  const resetDisplay = () => {
    endDialog.close();
    clearDisplay();
    game.restartGame();
    createDisplayBoard();
  };

  const displayWin = (line) => {
    const activePlayer = game.getActivePlayer();

    p1Tag.classList.remove("active");
    p2Tag.classList.remove("active");
    activePlayer.element.classList.add("active");

    messageEl.textContent = `${activePlayer.name} won!`;

    line.forEach((cell) => {
      const cellEl = gameboardEl.querySelector(
        `[data-row="${cell[0]}"][data-col="${cell[1]}"]`,
      );
      cellEl.classList.add("winner");
    });

    hideTokens();

    messageEl.textContent = "We have a winner!";
    endTitle.textContent = `${activePlayer.name} wins`;
    endDialog.showModal();
  };

  const displayTie = () => {
    p1Tag.classList.remove("active");
    p2Tag.classList.remove("active");

    hideTokens();

    messageEl.textContent = "You both lose and win equally...";
    endTitle.textContent = `It's a tie`;
    endDialog.showModal();
  };

  const hideTokens = () => {
    const children = gameboardEl.querySelectorAll("button:not(.winner)");
    children.forEach((child) => {
      child.classList.add("selected-1");
      child.removeEventListener("click", cellClickHandler);
      child.style.opacity = 0.4;
    });
  };

  return { startGame, resetDisplay };
})();

// Event Listeners
startBtn.addEventListener("click", display.startGame);
restartBtn.addEventListener("click", display.resetDisplay);

startDialog.showModal();
