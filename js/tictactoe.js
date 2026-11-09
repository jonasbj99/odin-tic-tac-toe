const BOARD_SIZE = 3;

// Elements
const startDialog = document.getElementById("startDialog");
const winDialog = document.getElementById("winDialog");
const gameboardEl = document.getElementById("gameboardEl");
const messageEl = document.getElementById("messageEl");
const player1El = document.getElementById("p1Tag");
const player2El = document.getElementById("p2Tag");

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

  const printBoard = () => {
    const cellValueBoard = board.map((row) =>
      row.map((cell) => cell.getValue()),
    );
    console.log(cellValueBoard);
  };

  const resetBoard = () => {
    board.map((row) => row.map((cell) => cell.setValue(0)));
  };

  return { getBoard, changeCell, printBoard, resetBoard };
}

function Cell() {
  let value = 0;

  const setValue = (player) => (value = player);

  const getValue = () => value;

  return { setValue, getValue };
}

function GameController() {
  const board = BoardController();

  const players = [
    {
      name: "Player 1",
      value: 1,
      element: player1El,
      token: "url(./img/jbj-circle.svg)",
    },
    {
      name: "Player 2",
      value: 2,
      element: player2El,
      token: "url(./img/jbj-cross.svg)",
    },
  ];

  let activePlayer = players[0];

  const getActivePlayer = () => activePlayer;

  const setPlayerName = (p, name) => {
    player[p].name = name;
  };

  const switchActivePlayer = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const printRound = () => {
    board.printBoard();
    console.log(`It's ${activePlayer.name}'s turn`);
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
    const { won, line } = checkWin(row, col);

    if (!won) {
      switchActivePlayer();
      printRound();
    }

    return { won, line };
  };

  const restartGame = () => {
    board.resetBoard();
    switchActivePlayer();
    printRound();
  };

  return {
    getActivePlayer,
    playRound,
    restartGame,
    getBoard: board.getBoard,
    printRound,
    setPlayerName,
  };
}

function DisplayController() {
  const game = GameController();

  const startGame = () => {};

  const displayActivePlayer = () => {
    const activePlayer = game.getActivePlayer();

    player1El.classList.remove("active");
    player2El.classList.remove("active");

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

    const { won, line } = game.playRound(row, col);

    if (won) {
      displayWin(line);
    } else {
      displayActivePlayer();
    }
  }

  const clearDisplay = () => {
    const children = gameboardEl.querySelectorAll("*");
    children.forEach((child) => child.remove());
  };

  const resetDisplay = () => {
    clearDisplay();
    game.restartGame();
    createDisplayBoard();
  };

  const displayWin = (line) => {
    const activePlayer = game.getActivePlayer();
    messageEl.textContent = `${activePlayer.name} won!`;

    line.forEach((cell) => {
      const cellEl = gameboardEl.querySelector(
        `[data-row="${cell[0]}"][data-col="${cell[1]}"]`,
      );
      cellEl.classList.add("winner");
    });

    const children = gameboardEl.querySelectorAll("button:not(.winner)");
    children.forEach((child) => {
      child.classList.add("selected-1");
      child.removeEventListener("click", cellClickHandler);
      child.style.opacity = 0.4;
    });

    // !!! Display restart button/dialog
  };

  createDisplayBoard();

  return { resetDisplay, displayWin };
}

const display = DisplayController();

// !!! REMOVE PRINT FUNCTIONS
