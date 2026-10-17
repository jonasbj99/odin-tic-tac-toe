function Gameboard() {
  const boardSize = 3;
  const board = [];

  for (let i = 0; i < boardSize; i++) {
    board[i] = [];
    for (let j = 0; j < boardSize; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => board;

  const changeCell = (row, column, player) => {
    const cell = board[row][column];

    if (cell.getValue() != 0) return;

    board[row][column].setValue(player);
  };

  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue()),
    );
    console.log(boardWithCellValues);
  };

  return { getBoard, changeCell, printBoard };
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

  const checkWin = () => {
    const b = board.getBoard();

    // Test Check
    if (
      b[0][0].getValue() === b[0][1].getValue() &&
      b[0][1].getValue() === b[0][2].getValue()
    ) {
      return true;
    } else {
      return false;
    }
  };

  const playRound = (row, column) => {
    board.changeCell(row, column, activePlayer.value);

    if (checkWin()) {
      console.log("Game Finished");
    } else {
      switchActivePlayer();
      printRound();
    }
  };

  printRound();

  return { getActivePlayer, playRound };
}

const game = GameController();
