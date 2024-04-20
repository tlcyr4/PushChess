import {describe, expect, test} from '@jest/globals';

import { PushChess, IllegalMoveError } from '../src/chess';

describe('chess module', () => {
    test('loads an empty board', () => {
        let chess = PushChess.fromFen('8/8/8/8/8/8/8/8 w - - 0 1');
        expect(chess.fen()).toMatch(/(8\/){7}8/)
    });

    test('loads a bishop', () => {
        let chess = PushChess.fromFen('B7/8/8/8/8/8/8/8 w - - 0 1');
        expect(chess.fen()).toMatch(/B7(\/8){7}/)
    })

    test('loads a knight', () => {
        let chess = PushChess.fromFen('N7/8/8/8/8/8/8/8 w - - 0 1');
        expect(chess.fen()).toMatch(/N7(\/8){7}/)
    })

    test('loads a rook', () => {
        let chess = PushChess.fromFen('R7/8/8/8/8/8/8/8 w - - 0 1');
        expect(chess.fen()).toMatch(/R7(\/8){7}/)
    })

    test('loads a Queen', () => {
        let chess = PushChess.fromFen('Q7/8/8/8/8/8/8/8 w - - 0 1');
        expect(chess.fen()).toMatch(/Q7(\/8){7}/)
    })

    test('loads a king', () => {
        let chess = PushChess.fromFen('K7/8/8/8/8/8/8/8 w - - 0 1');
        expect(chess.fen()).toMatch(/K7(\/8){7}/)
    })

    test('loads a black piece', () => {
        let chess = PushChess.fromFen('k7/8/8/8/8/8/8/8 w - - 0 1');
        expect(chess.fen()).toMatch(/k7(\/8){7}/)
    })

    test('moves a king to an empty space', () => {
        let startingBoard = PushChess.fromFen('K7/8/8/8/8/8/8/8 w - - 0 1');
        let afterMove = startingBoard.move('a8','b8')
        expect(afterMove.fen()).toMatch(/1K6(\/8){7}/)
    })

    test('pushes a king with another king', () => {
        let startingBoard = PushChess.fromFen('Kk6/8/8/8/8/8/8/8 w - - 0 1');
        let afterMove = startingBoard.move('a8','b8')
        expect(afterMove.fen()).toMatch(/1Kk5(\/8){7}/)
    });

    test('swaps a knight with another piece', () => {
        let startingBoard = PushChess.fromFen('K7/8/1N6/8/8/8/8/8 w - - 0 1');
        let afterMove = startingBoard.move('b6','a8')
        expect(afterMove.fen()).toMatch('N7/8/1K6/8/8/8/8/8')
    })

    test('diagonal push', () => {
        let startingBoard = PushChess.fromFen('8/6B1/8/8/8/8/1K6/8 w - - 0 1');
        let afterMove = startingBoard.move('g7','b2')
        expect(afterMove.fen()).toMatch('8/8/8/8/8/8/1B6/K7')
    })

    test('double push', () => {
        let startingBoard = PushChess.fromFen('7B/6q1/5q2/4q3/3q4/2q5/1q6/8 w - - 0 1');
        let afterMove = startingBoard.move('h8','g7')
        expect(afterMove.fen()).toMatch('8/6B1/5q2/4q3/3q4/2q5/1q6/q7')
    })

    test('illegal bishop', () => {
        let startingBoard = PushChess.fromFen('B7/8/8/8/8/8/8/8 w - - 0 1');
        expect(() => startingBoard.move('a8','g8')).toThrowError(IllegalMoveError);
    })

    test('illegal knight', () => {
        let startingBoard = PushChess.fromFen('N7/8/8/8/8/8/8/8 w - - 0 1');
        expect(() => startingBoard.move('a8','g8')).toThrowError(IllegalMoveError);
    })

    test('illegal rook', () => {
        let startingBoard = PushChess.fromFen('R7/8/8/8/8/8/8/8 w - - 0 1');
        expect(() => startingBoard.move('a8','b7')).toThrowError(IllegalMoveError);
    })

    test('illegal queen', () => {
        let startingBoard = PushChess.fromFen('Q7/8/8/8/8/8/8/8 w - - 0 1');
        expect(() => startingBoard.move('a8','b6')).toThrowError(IllegalMoveError);
    })

    test('illegal king', () => {
        let startingBoard = PushChess.fromFen('K7/8/8/8/8/8/8/8 w - - 0 1');
        expect(() => startingBoard.move('a8','a6')).toThrowError(IllegalMoveError);
    })

    test('illegal nomove', () => {
        let startingBoard = PushChess.fromFen('Q7/8/8/8/8/8/8/8 w - - 0 1');
        expect(() => startingBoard.move('a8','a8')).toThrowError(IllegalMoveError);
    })

    test('illegal push-through', () => {
        let startingBoard = PushChess.fromFen('QQQ5/8/8/8/8/8/8/8 w - - 0 1');
        expect(() => startingBoard.move('a8','c8')).toThrowError(IllegalMoveError);
    })

    test('illegal push-out', () => {
        let startingBoard = PushChess.fromFen('Q5QQ/8/8/8/8/8/8/8 w - - 0 1');
        expect(() => startingBoard.move('a8','g8')).toThrowError(IllegalMoveError);
    })


    

    test('starts out moveable', () => {
        let startingBoard = PushChess.fromFen('K7/8/8/8/8/8/8/8 w - - 0 1');
        expect(startingBoard.moveablePieces().some(e => e === "a8"))
    })

    test('becomes unmoveable', () => {
        let startingBoard = PushChess.fromFen('K7/8/8/8/8/8/8/8 w - - 0 1');
        let afterMove = startingBoard.move('a8', 'b8');
        expect(!afterMove.moveablePieces())
    })

    test('stays moveable after being pushed', () => {
        let startingBoard = PushChess.fromFen('Kk6/8/8/8/8/8/8/8 w - - 0 1');
        let afterMove = startingBoard.move('a8', 'b8');
        expect(afterMove.moveablePieces().some(e => e === 'c8'))
    })

    test('stays moveable after being swapped', () => {
        let startingBoard = PushChess.fromFen('N7/8/1K6/8/8/8/8/8 w - - 0 1');
        let afterMove = startingBoard.move('a8', 'b6');
        expect(afterMove.moveablePieces().some(e => e === 'a8'))
    })

    test('correct starter moveable pieces', () => {
        let startingBoard = PushChess.fromFen('2r2qKq/2q1N1qq/4qQ2/2R1r3/2brrnb1/8/6r1/7B w HAha - 0 1');
        expect(startingBoard.moveablePieces().some(e => e === 'g8'))
    })

    test('correct checkers', () => {
        let startingBoard = PushChess.fromFen('2r2qKq/2q1N1qq/4rQ2/2R1r3/2brrnb1/8/6r1/7B w H - 0 1');
        let checkers = startingBoard.checkers();
        expect(checkers.some(e => e === 'f8'))
        expect(checkers.some(e => e === 'h8'))
        expect(checkers.some(e => e === 'g7'))
        expect(checkers.some(e => e === 'h7'))
    })
})