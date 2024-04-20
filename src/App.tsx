import React from 'react';
import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import  PushChess from './chess'
import { useHotkeys } from 'react-hotkeys-hook'

  const startingFen = '2r2qKq/2q1N1qq/4qQ2/2R1r3/2brrnb1/8/6r1/7B w HAha - 0 1'

function App() {
  const [history, setHistory] = useState(Array<PushChess>());
  const [future, setFuture] = useState(Array<PushChess>());
  const [currentBoard, setCurrentBoard] = useState(PushChess.fromFen(startingFen));

  useHotkeys('ctrl+z', () => undo());
  useHotkeys('ctrl+y', () => redo());

  const onPieceDrop = ( sourceSquare: string, targetSquare: string, piece: string ) =>
  {
    if (sourceSquare === targetSquare) {
      return false;
    }
    try {
      let newBoard = currentBoard.move(sourceSquare, targetSquare);
      setHistory(history.concat(currentBoard));
      setCurrentBoard(newBoard);
      return true;
    } catch (error) {
      return false;
    }
  };

  const undo = () => {
    let previousBoard = history.at(-1);
    if (previousBoard !== undefined) {
      let newHistory = history.slice(0,-1);
      let newFuture = future.concat(currentBoard);
      setCurrentBoard(previousBoard);
      setHistory(newHistory);
      setFuture(newFuture);
    }
  }

  const redo = () => {
    let nextBoard = future.at(-1);
    if (nextBoard !== undefined) {
      let newFuture = future.slice(0, -1);
      let newHistory = history.concat(currentBoard);
      setCurrentBoard(nextBoard);
      setFuture(newFuture);
      setHistory(newHistory);
    }
  }

  let moveablePieces = currentBoard.moveablePieces();
  let checkers = currentBoard.checkers();
  const highlightStyle = {
    background: "rgba(255, 255, 0, 0.8)"
  };
  const dangerStyle = {
    background: "rgba(255, 0, 0 , 0.8)"
  };
  let styles = moveablePieces.map(s => [s, highlightStyle]).concat(checkers.map(s => [s, dangerStyle]));
  const isDraggablePiece = (args: { piece: string, sourceSquare: string }) => moveablePieces.some(e => e === args.sourceSquare);

  const liStyle : React.CSSProperties = {margin: '.5em 0', textAlign: 'center'}
  return (
    <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height:'100vh', width:'100vw', overflow:'hidden'}}>
      <ul style={{listStyleType: 'none', position:'absolute', zIndex:2, top:0, backgroundColor:"rgba(255,255,255,.4)", padding:'0em 1.5em'}}>
        <li style={liStyle}>Click + Drag &rarr; move pieces.</li>
        <li style={liStyle}>CTRL+Z/CTRL+Y &rarr; undo/redo.</li>
      </ul>
      <div style={{width: '100vmin', height: '100vmin'}}>
      <Chessboard id="BasicBoard"
        position={currentBoard.fen()}
        isDraggablePiece={isDraggablePiece}
        onPieceDrop={onPieceDrop} 
        customSquareStyles={Object.fromEntries(styles)}
        boardOrientation='black'
        />
        </div>
    </div>
  );
}

export default App;
