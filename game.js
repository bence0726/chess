
var board;
var game = new Chess();

// do not pick up pieces if the game is over
// only pick up pieces for White
var onDragStart = function(source, piece, position, orientation) {
  if (game.in_checkmate() === true || game.in_draw() === true ||
    piece.search(/^b/) !== -1) {
    return false;
  }
};

var makeRandomMove = function() {
  var possibleMoves = game.moves();

  // game over
  if (possibleMoves.length === 0) return;

  var randomIndex = Math.floor(Math.random() * possibleMoves.length);
  return possibleMoves[randomIndex];
};

var minimaxRoot =function() {

    var newGameMoves = game.moves();
    var bestMove = 9999;
    var bestMoveFound;

    for(var i = 0; i < newGameMoves.length; i++) {
        var newGameMove = newGameMoves[i]
        game.move(newGameMove);
        var value = minimax(2, game, -10000, 10000, true);
        game.undo();
        if(value <= bestMove) {
            bestMove = value;
            bestMoveFound = newGameMove;
        }
    }
    game.move(bestMoveFound);
    board.position(game.fen());;
};

var evaluateBoard = function (board) {
  var totalEvaluation = 0;
  for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
          totalEvaluation = totalEvaluation + getPieceValue(board[i][j]);
      }
  }
  return totalEvaluation;
};

var getPieceValue = function (piece) {
  if (piece === null) {
      return 0;
  }
  var getAbsoluteValue = function (piece) {
      if (piece.type === 'p') {
          return 10;
      } else if (piece.type === 'r') {
          return 50;
      } else if (piece.type === 'n') {
          return 30;
      } else if (piece.type === 'b') {
          return 30;
      } else if (piece.type === 'q') {
          return 90;
      } else if (piece.type === 'k') {
          return 900;
      }
      throw "Unknown piece type: " + piece.type;
  };

  var absoluteValue = getAbsoluteValue(piece);
  return piece.color === 'w' ? absoluteValue : -absoluteValue;
};

var minimax = function (depth, game,alpha,beta, isMaximisingPlayer) {
  if (depth === 0) {
      return evaluateBoard(game.board());
  }
  var newGameMoves = game.moves();
  if (isMaximisingPlayer) {
      var bestMove = -9999;
      for (var i = 0; i < newGameMoves.length; i++) {
          game.move(newGameMoves[i]);
          bestMove = Math.max(bestMove, minimax(depth - 1, game,alpha,beta, !isMaximisingPlayer));
          game.undo();
          alpha = Math.max(alpha, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
      }
      return bestMove;
  } else {
      var bestMove = 9999;
      for (var i = 0; i < newGameMoves.length; i++) {
          game.move(newGameMoves[i]);
          bestMove = Math.min(bestMove, minimax(depth - 1, game,alpha,beta, !isMaximisingPlayer));
          game.undo();
          beta = Math.min(beta, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
      }
      return bestMove;
  }
};

var onDrop = function(source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return 'snapback';

  // make random legal move for black
  window.setTimeout(minimaxRoot, 1);
};

// update the board position after the piece snap
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
  board.position(game.fen());
};

var cfg = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
};
board = ChessBoard('board', cfg);