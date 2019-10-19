import React, { useState, Fragment } from 'react';
import './App.css';
import { Tile } from './Tile';
import { ToolPalette } from './ToolPalette';
import { PathFinder, PathHelper } from './PathFinder';
import * as generator from 'generate-maze';

interface MazeCell {
  x: number;        // Horizontal position, integer
  y: number;        // Vertical position, integer
  top: boolean;     // Top/Up has a wall/blocked if true, boolean 
  left: boolean;    // Left has a wall/blocked if true, boolean
  bottom: boolean;  // Bottom/Down has a wall/blocked if true, boolean
  right: boolean;   // Right has a wall/blocked if true, boolean
  set: number;      // Set # used to generate maze, can be ignored
}

export enum CellState {
  Empty = 1,
  Start,
  End,
  Path,
  Blocked,
  Mud,
}

export const cellStateToColor: { [key: number]: string } = {
  1: "white",
  2: "green",
  3: "red",
  4: "lightblue",
  5: "darkgrey",
  6: "brown",
};

const colCount = 15;
const rowCount = 15;
const defaultColStart = 1;
const defaultRowStart = 1;
const defaultColEnd = colCount - 2;
const defaultRowEnd = rowCount - 2;

const InitGrid = (colCount: number, rowCount: number): CellState[][] => {
  // Create the array of columns, each an array of CellStates
  var grid = new Array<CellState[]>(colCount);

  // For each of those columns, create an array to represent one pathHelper for each row
  for (var col: number = 0; col < colCount; col++) {
    grid[col] = new Array<CellState>(rowCount);
  }

  // Initialize each spot to Empty
  for (col = 0; col < colCount; col++) {
    for (var row: number = 0; row < rowCount; row++) {
      grid[col][row] = CellState.Empty;
    }
  }

  grid[defaultColStart][defaultRowStart] = CellState.Start;
  grid[defaultColEnd][defaultRowEnd] = CellState.End;
  return grid;
}


const App: React.FC = () => {
  const defaultGrid = InitGrid(colCount, rowCount);
  const [grid, setGrid] = useState<CellState[][]>(defaultGrid);
  const [tool, setTool] = useState<CellState>(CellState.Start);
  const [startCol, setStartCol] = useState(defaultColStart);
  const [startRow, setStartRow] = useState(defaultRowStart);
  const [endCol, setEndCol] = useState(defaultColEnd);
  const [endRow, setEndRow] = useState(defaultRowEnd);
  const [pathHelper, setPathHelper] = useState<PathHelper[][]>();

  const onGenerateMaze = () => {
    const mazeColCount = (colCount - 1) / 2;
    const mazeRowCount = (rowCount - 1) / 2;
    // Generate maze, see https://www.npmjs.com/package/generate-maze
    const maze = generator(mazeColCount, mazeRowCount) as MazeCell[][];
    const newGrid = InitGrid(colCount, rowCount);
    var col;
    var row;

    // Convert to block maze, see https://weblog.jamisbuck.org/2015/10/31/mazes-blockwise-geometry.html
    // North wall always blocked
    for (col = 0; col < colCount; col++) {
      newGrid[col][0] = CellState.Blocked;
    }

    // West wall always blocked
    for (row = 0; row < rowCount; row++) {
      newGrid[0][row] = CellState.Blocked;
    }

    // Set up the maze itself
    for (col = 0; col < mazeColCount; col++) {
      for (row = 0; row < mazeRowCount; row++) {
        // Divide the maze generated cell into quarters, but reserve a n and w row
        const w = col * 2 + 1;
        const n = row * 2 + 1;
        const s = n + 1;
        const e = w + 1;

        // nw subcell is [implicitly] passage, mark se sub blocked
        newGrid[e][s] = CellState.Blocked;

        // if generated maze s is blocked, mark that in the sw
        if (maze[row][col].bottom) {
          newGrid[w][s] = CellState.Blocked;
        }
        // if generated maze e is blocked, mark that in ne
        if (maze[row][col].right) {
          newGrid[e][n] = CellState.Blocked;
        }
      }
    }

    setGrid(newGrid);
    setPathHelper(undefined);
    setStartCol(defaultColStart);
    setStartRow(defaultRowStart);
    setEndCol(defaultColEnd);
    setEndRow(defaultRowEnd);
  }

  const onFindPathClick = () => {
    const newGrid = [...grid];
    var col;
    var row;

    // clear previous state
    for (col = 0; col < colCount; col++) {
      for (row = 0; row < rowCount; row++) {
        if (grid[col][row] === CellState.Path) {
          newGrid[col][row] = CellState.Empty;
        }
      }
    }


    // Do pathing
    const pathFinder = new PathFinder(grid, colCount, rowCount);
    console.log("finding path from: " + startCol + ", " + startRow + " to " + endCol + ", " + endRow);

    const {path, helper } = pathFinder.findPath(startCol, startRow, endCol, endRow);

    for (var node of path) { 
      if (grid[node.col][node.row] === CellState.Empty) {
        newGrid[node.col][node.row] = CellState.Path;
      }
    }
    setGrid(newGrid);
    setPathHelper(helper);
  }

  return (
    <div className="App">
      <ToolPalette currentTool={tool} onToolChange={setTool} />
      <table className="Grid"><tbody>
        {grid.map((col, colNumber) => {
          return (
            <Fragment key={colNumber}>
              <tr >
                {col.map((cell, rowNumber) => {
                  return (
                    <Fragment key={rowNumber}>
                      <td className="Grid">
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
                            // console.log("Clicked on: " + col + ", " + row + " new state: " + newGrid[col][row]);
                            setGrid(newGrid);
                          }
                        }}>
                        <Fragment>
                        {
                          (() => {
                            if (pathHelper) {
                              return (
                                <Fragment>
                                  <div>
                                    {pathHelper[colNumber][rowNumber].costToHere !== Number.MAX_SAFE_INTEGER ? "" : ""}
                                  </div>
                                </Fragment>
                                );
                            }
                            return "";
                          })()
                        }</Fragment>
                        </Tile>
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
      <button onClick={onFindPathClick}>Find Path</button>
      <button onClick={onGenerateMaze}>Generate Maze</button>
    </div>
  );
}

export default App;
