function GameBoard() {
    const rows = 3;
    const cols = 3;
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < cols; j++) {
            board[i][j] = Cell();
        }
    }

    const getBoard = () => board;

    const markSpot = (row, col, player) => {
        board[row][col].setValue(player);
    };

    const printBoard = () => {
        for (let row in board) {
            let str = '';
            for (let col in board[row]) {
                str += board[row][col].getValue() + ' ';
            }
            console.log(str);
        }
    };

    const resetBoard = () => {
        for (let i = 0; i < rows; i++) {
            board[i] = [];
            for (let j = 0; j < cols; j++) {
                board[i][j] = Cell();
            }
        }
    }

    return {getBoard, markSpot, resetBoard, printBoard};
}

function Cell() {
    let value = '';

    const getValue = () => value;
    const setValue = (player) => {
        value = player;
    };

    return {getValue, setValue};
}

function Spaces() {
    const board = GameBoard().getBoard();
    const available = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].getValue() === '') {
                available.push(`${i} + ${j}`);
            }
        }
    }

    const numSpaces = () => available.length;
    const open = (row, col) => {
        return available.includes(`${row} + ${col}`);
    };
    const getAvailSpaces = () => available;
    const removeSpace = (row, col) => {
        let idx = available.indexOf(`${row} + ${col}`);
        return available.splice(idx, 1);
    };
    
    return {numSpaces, open, getAvailSpaces, removeSpace};
}

function GameController(playerOne = 'Player One', playerTwo = 'Player Two') {
    const board = GameBoard();
    const availSpaces = Spaces();

    const players = [
        {name: playerOne, marker: 'X', markedSpots: markedSpotsInfo()}, 
        {name: playerTwo, marker: 'O', markedSpots: markedSpotsInfo()}];

    function markedSpotsInfo() {
        let rows = [0, 0, 0];
        let cols = [0, 0, 0];
        let positiveDiagonal = 0;
        let negativeDiagonal = 0;

        const getRow = (row) => rows[row];
        const incrRow = (row) => rows[row]++;
        const getCol = (col) => cols[col];
        const incrCol = (col) => cols[col]++;
        const incrPosDiag = () => positiveDiagonal++;
        const incrNegDiag = () => negativeDiagonal++;
        const getPosDiag = () => positiveDiagonal;
        const getNegDiag = () => negativeDiagonal;

        return {getRow, getCol, getPosDiag, getNegDiag, incrRow, incrCol, incrPosDiag, incrNegDiag};
    }

    let currPlayer = players[0];
    const getCurrPlayer = () => currPlayer;
    const switchPlayer = () => {
        return currPlayer = currPlayer === players[0] ? players[1] : players[0];
    };

    const newRound = () => {
        board.printBoard();
        console.log(`${getCurrPlayer().name}'s turn....`);
    };

    const playRound = (row, col) => {
        console.log(availSpaces);
        if (row < 0 || col < 0 || row >= 3 || col >= 3) {
            console.log('Invalid input');
            return;
        } else if (availSpaces.numSpaces() === 0) {
            console.log('Start a new game.');
            return;
        } else if (!availSpaces.open(row, col)) {
            console.log('Pick a different spot.');
            return;
        }

        console.log(`Marking a spot for ${getCurrPlayer().name}...`);

        board.markSpot(row, col, currPlayer.marker);

        availSpaces.removeSpace(row, col);
        currPlayer.markedSpots.incrRow(row);
        currPlayer.markedSpots.incrCol(col);

        if (row + col === 2) currPlayer.markedSpots.incrPosDiag();
        if (row - col === 0) currPlayer.markedSpots.incrNegDiag();
        
        
        board.printBoard();

        const won = () => {
            return currPlayer.markedSpots.getNegDiag() === 3 || 
            currPlayer.markedSpots.getPosDiag() === 3 || 
            currPlayer.markedSpots.getRow(row) === 3 || 
            currPlayer.markedSpots.getCol(col) === 3;
        };

        if (won()) {
            console.log(`${currPlayer.name} won! Game Over.`);
            // start a new game
            return;
        } else if (availSpaces.numSpaces() === 0) {
            console.log('Game ended in a tie.');
            // start a new game
            return;
        } else {
            switchPlayer();
            newRound();
        }
    };

    newRound();

    return {playRound, getCurrPlayer, getBoard: board.getBoard()};
}

// button for each grid cell
// disable the button if its taken
// add listener for the board
function ScreenController() {
    const game = GameController();
    const playerDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');

    const updateScreen = () => {
        const board = game.getBoard;
        const player = game.getCurrPlayer().name;

        boardDiv.textContent = '';
        playerDiv.textContent = `${player}'s turn....`;

        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                const btn = document.createElement('button');

                btn.dataset.row = i;
                btn.dataset.column = j;

                btn.textContent = board[i][j].getValue();
                boardDiv.appendChild(btn);
            }
        }
    };

    boardDiv.addEventListener('click', (e) => {
        let row = parseInt(e.target.dataset.row);
        let col = parseInt(e.target.dataset.column);
        game.playRound(row, col);
        updateScreen();
    });

    updateScreen();
}

ScreenController();