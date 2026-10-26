const BOARD_SIZE = 3;

function Gameboard() {
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
  const board = Gameboard();

  const players = [
    {
      name: "Player One",
      value: 1,
    },
    {
      name: "Player Two",
      value: 2,
    },
  ];

  let activePlayer = players[0];

  const getActivePlayer = () => activePlayer;

  const switchActivePlayer = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const printRound = () => {
    board.printBoard();
    console.log(`It's ${activePlayer.name}'s turn`);
  };

  const checkWin = (row, col) => {
    const currentBoard = board.getBoard();
    let won = false;

    const directions = [
      [1, 0], // Vertical
      [0, 1], // Horizontal
      [1, 1], // Diagonal TL
      [-1, 1], // Diagonal TR
    ];

    for (const dir of directions) {
      let score = 1;

      for (const neg of [1, -1]) {
        let newRow = row;
        let newCol = col;
        let withinBoard = true;
        let multi = 1;

        while (withinBoard) {
          newRow += dir[0] * multi * neg;
          newCol += dir[1] * multi * neg;

          const rowSafe = newRow >= 0 && newRow < BOARD_SIZE;
          const colSafe = newCol >= 0 && newCol < BOARD_SIZE;

          if (rowSafe && colSafe) {
            const currentVal = currentBoard[newRow][newCol].getValue();
            if (currentVal === activePlayer.value) ++score;
          } else {
            withinBoard = false;
          }
        }

        multi++;
      }

      if (score >= BOARD_SIZE) {
        won = true;
        break;
      }
    }

    return won;
  };

  const playRound = (row, col) => {
    if (board.changeCell(row, col, activePlayer.value)) {
      if (checkWin(row, col)) {
        board.printBoard();
        console.log(activePlayer.name + " won the game!");
      } else {
        switchActivePlayer();
        printRound();
      }
    } else {
      console.log("That cell has already been selected, try again.");
      printRound();
    }
  };

  const restartGame = () => {
    board.resetBoard();
    activePlayer = players[0];
    printRound();
  };

  printRound();

  return { getActivePlayer, playRound, restartGame };
}

const game = GameController();
