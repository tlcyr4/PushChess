
enum PieceType {
    Pawn,
    Bishop,
    Knight,
    Rook,
    Queen,
    King
}

enum PieceColor {
    White,
    Black
}


interface Piece {
    Type: PieceType;
    Color: PieceColor;
    HasMoved: boolean;
}

export class PushChess {
    private board : Piece[][];
    private constructor(board: Piece[][]) {
        this.board = board;
    }

    public moveablePieces(): string[] {
        let indices  = Array.from(Array(8).keys());
        let allSquares = indices.flatMap(row => indices.map(col => ({row:row,col:col})));
        let moveablePieces = allSquares.filter(square => {
            let piece = this.board[square.row][square.col];
            return piece && piece.Color === PieceColor.White && !piece.HasMoved;
        });
        return moveablePieces.map(PushChess.printSquare);
    }

    public checkers(): string[] {
        let indices  = Array.from(Array(8).keys());
        let allSquares = indices.flatMap(row => indices.map(col => ({row:row,col:col})));
        let whiteKingCoords = allSquares.find(square => {
            let piece = this.board[square.row][square.col];
            return piece && piece.Color === PieceColor.White && piece.Type === PieceType.King;
        })

        if (whiteKingCoords !== undefined) {
            let checkers = allSquares.filter(square => {
                let piece = this.board[square.row][square.col];
                return piece && piece.Color === PieceColor.Black && this.isLegalChessMove(square, whiteKingCoords!, piece);
            })
    
            return checkers.map(PushChess.printSquare);
        } else {
            return [];
        }

        
    }

    public static fromFen(fen: string) : PushChess {
        function parseRow(fenRow:string): Array<Piece> {
            return fenRow.split('').map(parseChar).flat()
    
            function parseChar(char: string) : Array<Piece> {
                if (/\d/.test(char)) {
                    let blankCount = parseInt(char);
                    return Array(blankCount).fill(null)
                } else {
                    return [ParsePiece(char)]
                }
            }
        }
        const piecePlacement = fen.split(' ')[0];
        const rows = piecePlacement.split('/');
        return new PushChess(rows.map(parseRow));
    }

    public fen(): string {
        interface TextPlusBlanks {
            text: string;
            trailingBlankCount: number;
        }

        function printRow(row:Array<Piece>): string {
            function reducer(acc: TextPlusBlanks, next: Piece) : TextPlusBlanks {
                if (next) {
                    let blanksChar = '' + (acc.trailingBlankCount ? acc.trailingBlankCount : '');
                    let pieceChar = PrintPiece(next);
                    return { text:acc.text + blanksChar + pieceChar, trailingBlankCount: 0}
                } else {
                    return { text: acc.text, trailingBlankCount: acc.trailingBlankCount + 1}
                }
            }
            let textPlusBlanks = row.reduce(reducer, {text:'', trailingBlankCount:0});
            return textPlusBlanks.text + (textPlusBlanks.trailingBlankCount ? textPlusBlanks.trailingBlankCount : '');
        }
        const piecePlacement = this.board.map(printRow);
        const fen = `${piecePlacement.join('/')} w HAha - 0 1`; // Other FEN components are placeholders
        return fen;
    }

    static isInBounds(coords: Coordinates): boolean{
        return 0 <= coords.row && coords.row < 8
            && 0 <= coords.col && coords.col < 8;
    }

    private isLegalChessMove(src: Coordinates, dst: Coordinates, piece: Piece) : boolean {
        switch (piece.Type) {
            case PieceType.Bishop:
                return this.isLegalBishopMove(src, dst);
            case PieceType.Knight:
                return this.isLegalKnightMove(src, dst);
            case PieceType.Rook:
                return this.isLegalRookMove(src, dst);
            case PieceType.Queen:
                return this.isLegalQueenMove(src, dst);
            case PieceType.King:
                return this.isLegalKingMove(src, dst);
            case PieceType.Pawn:
                throw new Error('not implemented');
        }
    }

    public move(srcName: string, dstName: string) : PushChess {
        let src = PushChess.parseSquare(srcName);
        let dst = PushChess.parseSquare(dstName);

        if (!PushChess.isInBounds(dst)) {
            throw new RangeError();
        }

        let piece = this.board[src.row][src.col];

        if (!this.isLegalChessMove(src, dst, piece)) {
            throw new IllegalMoveError("illegal chess move");
        }

        if (piece.Type === PieceType.Knight) {
            return this.swap(src, dst, true);
        } else {
            return this.push(src, dst, true);
        }
    }

    private isLegalBishopMove(src: Coordinates, dst: Coordinates) : boolean {
        return PushChess.isNonZeroMove(src, dst)
            && PushChess.isDiagonalMove(src, dst)
            && this.hasNoObstacles(src, dst);
    }

    private static isDiagonalMove(src: Coordinates, dst: Coordinates) {
        return Math.abs(dst.row - src.row) === Math.abs(dst.col - src.col);
    }

    private static isOneDimensionalMove(src: Coordinates, dst: Coordinates) {
        return dst.row === src.row || dst.col === src.col;
    }

    private static isNonZeroMove(src: Coordinates, dst: Coordinates) : boolean {
        return src.row !== dst.row || src.col !== dst.col;
    }

    private hasNoObstacles(src: Coordinates, dst : Coordinates) : boolean {
        let rowChange = dst.row - src.row;
        let colChange = dst.col - src.col;

        let rowChangeSign = Math.sign(rowChange);
        let colChangeSign = Math.sign(colChange);

        let maxDistance = Math.max(Math.abs(rowChange), Math.abs(colChange));

        let indices = Array.from(Array(maxDistance).keys()).filter(i => 0 < i && i < maxDistance);
        let intermediateSquares : Coordinates[] = indices.map(i => ({ row: src.row + i * rowChangeSign, col: src.col + i * colChangeSign }));
        
        let obstacles = intermediateSquares.map(coords => this.board[coords.row][coords.col]);

        return obstacles.every(x => x === null);
    }

    private isLegalKnightMove(src: Coordinates, dst: Coordinates) : boolean {
        let rowChange = Math.abs(dst.row - src.row);
        let colChange = Math.abs(dst.col - src.col);

        return (rowChange === 1 && colChange === 2) || (rowChange === 2 && colChange === 1);
    }

    private isLegalRookMove(src: Coordinates, dst: Coordinates) : boolean {
        return PushChess.isNonZeroMove(src, dst)
            && PushChess.isOneDimensionalMove(src, dst)
            && this.hasNoObstacles(src, dst);
    }

    private isLegalQueenMove(src: Coordinates, dst: Coordinates) : boolean {
        return this.isLegalBishopMove(src, dst) || this.isLegalRookMove(src, dst);
    }

    private isLegalKingMove(src: Coordinates, dst: Coordinates) : boolean {
        let distanceSquared = (dst.row - src.row)**2 + (dst.col - src.col)**2;
        return 1 <= distanceSquared && distanceSquared <= 2;
    }

    private swap(src : Coordinates, dst: Coordinates, isInstigator: boolean) : PushChess {
        let indices  = Array.from(Array(8).keys());
        let newBoard = indices.map(row => indices.map(col => 
            {
                if (row === src.row && col === src.col) {
                    return this.board[dst.row][dst.col];
                } else if (row === dst.row && col === dst.col) {
                    if (isInstigator) {
                        let instigator = this.board[src.row][src.col];
                        return {Type: instigator.Type, Color: instigator.Color, HasMoved: true}
                    } else {
                        return this.board[src.row][src.col];
                    }
                } else {
                    return this.board[row][col];
                }
            }
        ));

        return new PushChess(newBoard);
    }

    private push(src : Coordinates, dst: Coordinates, isInstigator: boolean) : PushChess {
        if (!PushChess.isInBounds(dst)) {
            throw new IllegalMoveError("push out of bounds");
        }

        if (this.board[dst.row][dst.col] === null) {
            return this.swap(src, dst, isInstigator);
        } else {
            let rowSign = Math.sign(dst.row - src.row);
            let colSign = Math.sign(dst.col - src.col);
            let nextDst = {row: dst.row + rowSign, col: dst.col + colSign}
            return this.push(dst, nextDst, false).swap(src, dst, isInstigator);
        }

    }

    private static parseSquare(square : string) : Coordinates {
        return {
            row: 8 - parseInt(square[1]),
            col: square.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0)
        }
    }

    private static printSquare(square: Coordinates): string {
        return (square.col + 10).toString(36).toLowerCase() + (8 - square.row);
    }
}

export class IllegalMoveError extends Error {
    constructor(message:string) {
      super(message);
      this.name = 'IllegalMoveError';
    }
  }

interface Coordinates {
    row: number,
    col: number
}

function ParsePiece(char: string): Piece {
    let uppercase = char.toUpperCase();
    let color = (char === uppercase) ? PieceColor.White : PieceColor.Black
    switch (uppercase) {
        case 'P':
            return {Type: PieceType.Pawn, Color : color, HasMoved: false}
        case 'B':
            return {Type: PieceType.Bishop, Color : color, HasMoved: false}
        case 'N':
            return {Type: PieceType.Knight, Color : color, HasMoved: false}
        case 'R':
            return {Type: PieceType.Rook, Color : color, HasMoved: false}
        case 'Q':
            return {Type: PieceType.Queen, Color : color, HasMoved: false}
        case 'K':
            return {Type: PieceType.King, Color : color, HasMoved: false}
        default:
            throw new Error("invalid notation");
    }
}

function PrintPiece(piece: Piece): string {
    let applyColor = (letter: string, color: PieceColor) =>
        (color === PieceColor.White) ? letter.toUpperCase() : letter.toLowerCase();
    switch (piece.Type) {
        case PieceType.Pawn:
            return applyColor('P', piece.Color)
        case PieceType.Bishop:
            return applyColor('B', piece.Color)
        case PieceType.Knight:
            return applyColor('N', piece.Color)
        case PieceType.Rook:
            return applyColor('R', piece.Color)
        case PieceType.Queen:
            return applyColor('Q', piece.Color)
        case PieceType.King:
            return applyColor('K', piece.Color)
    
        default:
            throw new Error("impossible");
    }
}


export default PushChess;