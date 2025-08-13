// Chess movement rules and validation logic

import { 
  Position, 
  Piece, 
  PieceType, 
  Team, 
  isValidPosition, 
  positionsEqual 
} from '../types/game.types';

export class ChessRules {
  /**
   * Get all valid moves for a piece at the given position
   */
  static getValidMoves(piece: Piece, board: (Piece | null)[][], includeCaptures: boolean = true): Position[] {
    const validMoves: Position[] = [];
    
    switch (piece.type) {
      case PieceType.PAWN:
        validMoves.push(...this.getPawnMoves(piece, board));
        break;
      case PieceType.KNIGHT:
        validMoves.push(...this.getKnightMoves(piece, board));
        break;
      case PieceType.BISHOP:
        validMoves.push(...this.getBishopMoves(piece, board));
        break;
      case PieceType.ROOK:
        validMoves.push(...this.getRookMoves(piece, board));
        break;
      case PieceType.QUEEN:
        validMoves.push(...this.getQueenMoves(piece, board));
        break;
      case PieceType.KING:
        validMoves.push(...this.getKingMoves(piece, board));
        break;
    }

    // Filter out moves that would put own king in check
    return validMoves.filter(pos => 
      isValidPosition(pos) && !this.wouldMoveResultInCheck(piece, pos, board)
    );
  }

  /**
   * Check if a move is valid for the given piece
   */
  static isMoveValid(piece: Piece, to: Position, board: (Piece | null)[][]): boolean {
    const validMoves = this.getValidMoves(piece, board);
    return validMoves.some(move => positionsEqual(move, to));
  }

  /**
   * Check if a move would result in the player's own king being in check
   */
  static wouldMoveResultInCheck(piece: Piece, to: Position, board: (Piece | null)[][]): boolean {
    // Create a copy of the board and simulate the move
    const boardCopy = board.map(row => [...row]);
    const originalPiece = boardCopy[to.y][to.x];
    
    // Simulate move
    boardCopy[to.y][to.x] = { ...piece, position: to };
    boardCopy[piece.position.y][piece.position.x] = null;
    
    const wouldBeInCheck = this.isKingInCheck(piece.team, boardCopy);
    
    // Restore board (not needed since we made a copy, but good practice)
    return wouldBeInCheck;
  }

  /**
   * Get valid moves for a pawn
   */
  private static getPawnMoves(piece: Piece, board: (Piece | null)[][]): Position[] {
    const moves: Position[] = [];
    const { x, y } = piece.position;
    const direction = piece.team === Team.WHITE ? -1 : 1; // White moves up (-y), Black moves down (+y)
    const startRow = piece.team === Team.WHITE ? 6 : 1;

    // Forward moves
    const oneForward = { x, y: y + direction };
    if (isValidPosition(oneForward) && !board[oneForward.y][oneForward.x]) {
      moves.push(oneForward);

      // Two squares forward from starting position
      if (y === startRow) {
        const twoForward = { x, y: y + (direction * 2) };
        if (isValidPosition(twoForward) && !board[twoForward.y][twoForward.x]) {
          moves.push(twoForward);
        }
      }
    }

    // Diagonal captures
    const captureLeft = { x: x - 1, y: y + direction };
    const captureRight = { x: x + 1, y: y + direction };

    [captureLeft, captureRight].forEach(pos => {
      if (isValidPosition(pos)) {
        const targetPiece = board[pos.y][pos.x];
        if (targetPiece && targetPiece.team !== piece.team) {
          moves.push(pos);
        }
      }
    });

    // En passant will be implemented later
    
    return moves;
  }

  /**
   * Get valid moves for a knight
   */
  private static getKnightMoves(piece: Piece, board: (Piece | null)[][]): Position[] {
    const moves: Position[] = [];
    const { x, y } = piece.position;

    const knightMoves = [
      { x: x + 2, y: y + 1 }, { x: x + 2, y: y - 1 },
      { x: x - 2, y: y + 1 }, { x: x - 2, y: y - 1 },
      { x: x + 1, y: y + 2 }, { x: x + 1, y: y - 2 },
      { x: x - 1, y: y + 2 }, { x: x - 1, y: y - 2 }
    ];

    knightMoves.forEach(pos => {
      if (isValidPosition(pos)) {
        const targetPiece = board[pos.y][pos.x];
        if (!targetPiece || targetPiece.team !== piece.team) {
          moves.push(pos);
        }
      }
    });

    return moves;
  }

  /**
   * Get valid moves for a bishop
   */
  private static getBishopMoves(piece: Piece, board: (Piece | null)[][]): Position[] {
    return this.getDiagonalMoves(piece, board);
  }

  /**
   * Get valid moves for a rook
   */
  private static getRookMoves(piece: Piece, board: (Piece | null)[][]): Position[] {
    return this.getStraightMoves(piece, board);
  }

  /**
   * Get valid moves for a queen
   */
  private static getQueenMoves(piece: Piece, board: (Piece | null)[][]): Position[] {
    return [
      ...this.getStraightMoves(piece, board),
      ...this.getDiagonalMoves(piece, board)
    ];
  }

  /**
   * Get valid moves for a king
   */
  private static getKingMoves(piece: Piece, board: (Piece | null)[][]): Position[] {
    const moves: Position[] = [];
    const { x, y } = piece.position;

    // King can move one square in any direction
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue; // Skip current position
        
        const pos = { x: x + dx, y: y + dy };
        if (isValidPosition(pos)) {
          const targetPiece = board[pos.y][pos.x];
          if (!targetPiece || targetPiece.team !== piece.team) {
            moves.push(pos);
          }
        }
      }
    }

    // Castling
    if (!piece.hasMoved && !this.isKingInCheck(piece.team, board)) {
      const castlingMoves = this.getCastlingMoves(piece, board);
      moves.push(...castlingMoves);
    }
    
    return moves;
  }

  /**
   * Get castling moves for the king
   */
  private static getCastlingMoves(king: Piece, board: (Piece | null)[][]): Position[] {
    const moves: Position[] = [];
    const { x, y } = king.position;
    
    // Kingside castling
    const kingsideRook = board[y][7];
    if (kingsideRook && kingsideRook.type === PieceType.ROOK && 
        kingsideRook.team === king.team && !kingsideRook.hasMoved) {
      // Check if squares between king and rook are empty
      if (!board[y][5] && !board[y][6]) {
        // Check if king would pass through check
        if (!this.wouldMoveResultInCheck(king, { x: 5, y }, board) &&
            !this.wouldMoveResultInCheck(king, { x: 6, y }, board)) {
          moves.push({ x: 6, y });
        }
      }
    }
    
    // Queenside castling
    const queensideRook = board[y][0];
    if (queensideRook && queensideRook.type === PieceType.ROOK && 
        queensideRook.team === king.team && !queensideRook.hasMoved) {
      // Check if squares between king and rook are empty
      if (!board[y][1] && !board[y][2] && !board[y][3]) {
        // Check if king would pass through check
        if (!this.wouldMoveResultInCheck(king, { x: 3, y }, board) &&
            !this.wouldMoveResultInCheck(king, { x: 2, y }, board)) {
          moves.push({ x: 2, y });
        }
      }
    }
    
    return moves;
  }

  /**
   * Check if a move is a castling move
   */
  static isCastlingMove(king: Piece, to: Position): boolean {
    const dx = Math.abs(to.x - king.position.x);
    return king.type === PieceType.KING && dx === 2;
  }

  /**
   * Execute castling move (moves both king and rook)
   */
  static executeCastling(king: Piece, to: Position, board: (Piece | null)[][]): void {
    const isKingside = to.x > king.position.x;
    const rookFromX = isKingside ? 7 : 0;
    const rookToX = isKingside ? 5 : 3;
    
    const rook = board[king.position.y][rookFromX];
    if (rook) {
      // Move rook
      board[king.position.y][rookToX] = { ...rook, position: { x: rookToX, y: king.position.y }, hasMoved: true };
      board[king.position.y][rookFromX] = null;
      
      // King will be moved by the calling function
    }
  }

  /**
   * Get diagonal moves (for bishop and queen)
   */
  private static getDiagonalMoves(piece: Piece, board: (Piece | null)[][]): Position[] {
    const moves: Position[] = [];
    const { x, y } = piece.position;

    const directions = [
      { dx: 1, dy: 1 },   // up-right
      { dx: 1, dy: -1 },  // down-right
      { dx: -1, dy: 1 },  // up-left
      { dx: -1, dy: -1 }  // down-left
    ];

    directions.forEach(({ dx, dy }) => {
      for (let i = 1; i < 8; i++) {
        const pos = { x: x + (dx * i), y: y + (dy * i) };
        
        if (!isValidPosition(pos)) break;
        
        const targetPiece = board[pos.y][pos.x];
        
        if (!targetPiece) {
          moves.push(pos); // Empty square
        } else {
          if (targetPiece.team !== piece.team) {
            moves.push(pos); // Enemy piece - can capture
          }
          break; // Stop at any piece
        }
      }
    });

    return moves;
  }

  /**
   * Get straight moves (for rook and queen)
   */
  private static getStraightMoves(piece: Piece, board: (Piece | null)[][]): Position[] {
    const moves: Position[] = [];
    const { x, y } = piece.position;

    const directions = [
      { dx: 0, dy: 1 },   // up
      { dx: 0, dy: -1 },  // down
      { dx: 1, dy: 0 },   // right
      { dx: -1, dy: 0 }   // left
    ];

    directions.forEach(({ dx, dy }) => {
      for (let i = 1; i < 8; i++) {
        const pos = { x: x + (dx * i), y: y + (dy * i) };
        
        if (!isValidPosition(pos)) break;
        
        const targetPiece = board[pos.y][pos.x];
        
        if (!targetPiece) {
          moves.push(pos); // Empty square
        } else {
          if (targetPiece.team !== piece.team) {
            moves.push(pos); // Enemy piece - can capture
          }
          break; // Stop at any piece
        }
      }
    });

    return moves;
  }

  /**
   * Check if the king is in check
   */
  static isKingInCheck(team: Team, board: (Piece | null)[][]): boolean {
    // Find the king
    let kingPosition: Position | null = null;
    
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece && piece.type === PieceType.KING && piece.team === team) {
          kingPosition = { x, y };
          break;
        }
      }
      if (kingPosition) break;
    }

    if (!kingPosition) return false; // No king found (shouldn't happen)

    // Check if any enemy piece can attack the king
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece && piece.team !== team && piece.isAlive) {
          const moves = this.getRawValidMoves(piece, board); // Use raw moves to avoid infinite recursion
          if (moves.some(move => positionsEqual(move, kingPosition!))) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Get raw valid moves without checking if they put own king in check (to avoid infinite recursion)
   */
  private static getRawValidMoves(piece: Piece, board: (Piece | null)[][]): Position[] {
    const validMoves: Position[] = [];
    
    switch (piece.type) {
      case PieceType.PAWN:
        validMoves.push(...this.getPawnMoves(piece, board));
        break;
      case PieceType.KNIGHT:
        validMoves.push(...this.getKnightMoves(piece, board));
        break;
      case PieceType.BISHOP:
        validMoves.push(...this.getBishopMoves(piece, board));
        break;
      case PieceType.ROOK:
        validMoves.push(...this.getRookMoves(piece, board));
        break;
      case PieceType.QUEEN:
        validMoves.push(...this.getQueenMoves(piece, board));
        break;
      case PieceType.KING:
        validMoves.push(...this.getBasicKingMoves(piece, board)); // Basic moves without castling
        break;
    }

    return validMoves.filter(pos => isValidPosition(pos));
  }

  /**
   * Get basic king moves without castling (to avoid recursion in check detection)
   */
  private static getBasicKingMoves(piece: Piece, board: (Piece | null)[][]): Position[] {
    const moves: Position[] = [];
    const { x, y } = piece.position;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        
        const pos = { x: x + dx, y: y + dy };
        if (isValidPosition(pos)) {
          const targetPiece = board[pos.y][pos.x];
          if (!targetPiece || targetPiece.team !== piece.team) {
            moves.push(pos);
          }
        }
      }
    }
    
    return moves;
  }

  /**
   * Check if the game is in checkmate
   */
  static isCheckmate(team: Team, board: (Piece | null)[][]): boolean {
    if (!this.isKingInCheck(team, board)) return false;

    // Check if any move can get the king out of check
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece && piece.team === team && piece.isAlive) {
          const moves = this.getValidMoves(piece, board);
          
          if (moves.length > 0) {
            return false; // Found a valid move that gets out of check
          }
        }
      }
    }

    return true; // No moves can get out of check - checkmate
  }

  /**
   * Check if the game is in stalemate
   */
  static isStalemate(team: Team, board: (Piece | null)[][]): boolean {
    if (this.isKingInCheck(team, board)) return false; // Not stalemate if in check

    // Check if player has any valid moves
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece && piece.team === team && piece.isAlive) {
          const moves = this.getValidMoves(piece, board);
          if (moves.length > 0) {
            return false; // Found a valid move
          }
        }
      }
    }

    return true; // No valid moves available - stalemate
  }

  /**
   * Check if position is on same diagonal as another position
   */
  static isOnDiagonal(pos1: Position, pos2: Position): boolean {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return dx === dy && dx > 0;
  }

  /**
   * Check if position is on same straight line as another position
   */
  static isOnStraightLine(pos1: Position, pos2: Position): boolean {
    return (pos1.x === pos2.x && pos1.y !== pos2.y) || 
           (pos1.y === pos2.y && pos1.x !== pos2.x);
  }
}
