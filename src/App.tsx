import React, { useState, Fragment } from 'react';
import './App.css';
import { Tile } from './Tile';
import { ToolPalette } from './ToolPalette';

export enum CellState {
  Empty = 1,
  Start,
  End,
  Path,
  Blocked,
}

export const cellStateToColor: { [key: number]: string } = {
  1: "white",
  2: "green",
  3: "yellow",
  4: "lightblue",
  5: "red",
};

const defaultGrid = [
  [CellState.Start, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty,],
  [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.End,],
];

const App: React.FC = () => {

  const [grid, setGrid] = useState<CellState[][]>(defaultGrid);
  const [tool, setTool] = useState<CellState>(CellState.Start);
  const [startCol, setStartCol] = useState(0);
  const [startRow, setStartRow] = useState(0);
  const [endCol, setEndCol] = useState(19);
  const [endRow, setEndRow] = useState(19);

  return (
    <div className="App">
      <ToolPalette currentTool={tool} onToolChange={setTool} />
      <table><tbody>
        {grid.map((col, colNumber) => {
          return (
            <Fragment key={colNumber}>
              <tr >
                {col.map((cell, rowNumber) => {
                  return (
                    <Fragment key={rowNumber}>
                      <td >
                        <Tile row={rowNumber} col={colNumber} color={cellStateToColor[cell]} onClick={(col: number, row: number) => {
                          const newGrid = [...grid];
                          const canWrite = (grid[col][row] !== CellState.Start) && (grid[col][row] !== CellState.End);

                          if (canWrite) {
                            switch (tool) {
                              case CellState.Start:
                                newGrid[startCol][startRow] = CellState.Empty;
                                setStartCol(col);
                                setStartRow(row);
                                break;
                              case CellState.End:
                                newGrid[endCol][endRow] = CellState.Empty;
                                setEndCol(col);
                                setEndRow(row);
                                break;
                            }
                            newGrid[col][row] = tool;
                            console.log("Clicked on: " + col + ", " + row + " new state: " + newGrid[col][row]);
                            setGrid(newGrid);
                          }
                        }} />
                      </td>
                    </Fragment>
                  );
                })
                }
              </tr>
            </Fragment>
          );
        })}
      </tbody></table>
    </div>
  );
}

export default App;
