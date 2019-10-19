import { CellState } from './App';
import * as Collections from 'typescript-collections';

export interface Coordinate {
    col: number;
    row: number;
}

// Parallel structure to the grid for tracking the path and costs
export class PathHelper {
    location: Coordinate = {col: 0, row: 0};
    parentCol: number = 0;
    parentRow: number = 0;
    costToHere: number = 0;
    estimateToDestination: number = 0;
    estimateTotal: number = 0; // costToHere + estimateToDestination
    visited: boolean = false;
}

// Class for finding a path for a grid
export class PathFinder {
    private grid: CellState[][];
    private pathHelper: PathHelper[][];
    private rowCount: number;
    private colCount: number;

    constructor(grid: CellState[][], colCount: number, rowCount: number) {
        this.colCount = colCount;
        this.rowCount = rowCount;

        this.grid = [...grid];

        // Create the array of columns, each an array of pathHelpers
        this.pathHelper = new Array<PathHelper[]>(colCount);

        // For each of those columns, create an array to represent one pathHelper for each row
        for (var col: number = 0; col < colCount; col++) {
            this.pathHelper[col] = new Array<PathHelper>(rowCount);
        }

        for (col = 0; col < this.colCount; col++) {
            for (var row: number = 0; row < this.rowCount; row++) {
                this.pathHelper[col][row] = new PathHelper();
                this.pathHelper[col][row].location.col = col;
                this.pathHelper[col][row].location.row = row;
            }
        }
    }

    private IsValidCoordinates = (col: number, row: number): boolean => {
        return (row >= 0) && (row < this.rowCount) &&
            (col >= 0) && (col < this.colCount);
    }

    private IsBlocked = (col: number, row: number): boolean => {
        // Returns true if the cell is not blocked else false 
        return this.grid[col][row] === CellState.Blocked;
    }

    private IsEnd = (col: number, row: number): boolean => {
        // Returns true if the cell is not blocked else false 
        return this.grid[col][row] === CellState.End;
    }

    private IsVisited = (col: number, row: number): boolean => {
        // Returns true if the cell is not blocked else false 
        return this.pathHelper[col][row].visited;
    }

    private EstimatedDistance = (x1: number, y1: number, x2: number, y2: number): number => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    tracePath = (col: number, row: number): Coordinate[] => { 
        const path: Coordinate[] = new Array<Coordinate>();
      
        // Begin with the destination, and follow the parents back to the start
        while (this.grid[col][row] !== CellState.Start) { 
            path.unshift({col, row}); 
            const temp_row = this.pathHelper[col][row].parentRow; 
            const temp_col = this.pathHelper[col][row].parentCol; 
            // console.log("pathing back from: " + col + ", " + row + " to " + temp_col + ", " + temp_row);
            row = temp_row; 
            col = temp_col; 
        } 

        // This puts the start on the front of the path
        path.unshift ({col, row}); 
      
        return path; 
    } 

    findPath = (colStart: number, rowStart: number, colEnd: number, rowEnd: number): { path: Coordinate[], helper: PathHelper[][] } => {
        // Set up
        for (var col: number = 0; col < this.colCount; col++) {
            for (var row: number = 0; row < this.rowCount; row++) {
                // Mark each node as not visited 
                this.pathHelper[col][row].visited = false;

                // Reset previous cost to locations
                this.pathHelper[col][row].costToHere = Number.MAX_SAFE_INTEGER;

                // Reset estimated distance to destination
                this.pathHelper[col][row].estimateToDestination = this.EstimatedDistance(col, row, colEnd, rowEnd);

                // Reset estimate overall
                this.pathHelper[col][row].estimateTotal = Number.MAX_SAFE_INTEGER;
            }
        }

        // Set up start
        this.pathHelper[colStart][rowStart].visited = true;
        this.pathHelper[colStart][rowStart].costToHere = 0;
        
        // A* Search Algorithm
        // Create a heap to track nodes to consider
        const considerList = new Collections.Heap<PathHelper>((a:PathHelper, b:PathHelper) => {
            if (a.estimateTotal < b.estimateTotal) {
                return -1;
            } else if (b.estimateTotal < a.estimateTotal) {
                return 1;
            } else {
                return 0;
            }
        });

        considerList.add(this.pathHelper[colStart][rowStart]);

        const relativeSuccessorList: { coord: Coordinate, cost: number }[] = [
            // Orthagonal
            {coord: {col: -1, row:  0, }, cost: 1},
            {coord: {col:  0, row: -1, }, cost: 1},
            {coord: {col:  0, row:  1, }, cost: 1},
            {coord: {col:  1, row:  0, }, cost: 1},
            // Diagonal
            {coord: {col: -1, row: -1, }, cost: 1.4},
            {coord: {col: -1, row:  1, }, cost: 1.4},
            {coord: {col:  1, row: -1, }, cost: 1.4},
            {coord: {col:  1, row:  1, }, cost: 1.4},
        ];

        while (!considerList.isEmpty()) {
            // The root of the heap should have the shortest estimate
            var nodeToConsider: PathHelper = considerList.removeRoot()!;

            // Location of the node under consideration
            const col = nodeToConsider.location.col;
            const row = nodeToConsider.location.row;

            // Mark visited
            this.pathHelper[col][row].visited = true;

            // Calculate relative successors 
            for (var delta of relativeSuccessorList) {
                const successorCol = col + delta.coord.col;
                const successorRow = row + delta.coord.row;
                const isValidCoordinates = this.IsValidCoordinates(successorCol, successorRow);

                if (isValidCoordinates) {
                    const isBlocked = this.IsBlocked(successorCol, successorRow);
                    const isVisited = this.IsVisited(successorCol, successorRow);

                    if (!isVisited && !isBlocked) {
                        // Check for end state
                        if (this.IsEnd(successorCol, successorRow)) {
                            this.pathHelper[successorCol][successorRow].parentCol = col;
                            this.pathHelper[successorCol][successorRow].parentRow = row;
                            return { path: this.tracePath(colEnd, rowEnd), helper: this.pathHelper };
                        }

                        // This successor's cost through this path is the previous cost plus one step
                        const extraCost = (this.grid[successorCol][successorRow] === CellState.Mud ? 2 : 0);
                        const costToHere = this.pathHelper[col][row].costToHere + delta.cost + extraCost;
                        const estimateTotal = costToHere + this.pathHelper[successorCol][successorRow].estimateToDestination;

                        if (estimateTotal < this.pathHelper[successorCol][successorRow].estimateTotal) {
                            this.pathHelper[successorCol][successorRow].costToHere = costToHere;
                            this.pathHelper[successorCol][successorRow].estimateTotal = estimateTotal;
                            this.pathHelper[successorCol][successorRow].parentCol = col;
                            this.pathHelper[successorCol][successorRow].parentRow = row;
                            
                            considerList.add(this.pathHelper[successorCol][successorRow]);
                        }
                    }
                }
            }
        }

        return { path: Array<Coordinate>(0), helper: this.pathHelper };
    }
}