import React, { CSSProperties, Fragment } from 'react';
import './App.css';
import { CellState, cellStateToColor } from './App';

export interface ToolPaletteProps {
    currentTool: CellState;
    onToolChange: (newTool: CellState) => void;
}


export const ToolPalette: React.FC<ToolPaletteProps> = (props) => {
    return (
        <Fragment>
            <div>
                <Tool tool={CellState.Empty}    currentTool={props.currentTool} onToolChange={props.onToolChange}/>
                <Tool tool={CellState.Start}    currentTool={props.currentTool} onToolChange={props.onToolChange}/>
                <Tool tool={CellState.End}      currentTool={props.currentTool} onToolChange={props.onToolChange}/>
                <Tool tool={CellState.Blocked}  currentTool={props.currentTool} onToolChange={props.onToolChange}/>
                <Tool tool={CellState.Mud}      currentTool={props.currentTool} onToolChange={props.onToolChange}/>
            </div>
        </Fragment>
    );
}

interface ToolProps {
    tool: CellState;
    currentTool: CellState;
    onToolChange: (newTool: CellState) => void;
}

const Tool: React.FC<ToolProps> = (props) => {
    var inlineStyle: CSSProperties = {
        backgroundColor: cellStateToColor[props.tool],
    }
    if (props.tool === props.currentTool) {
        inlineStyle = {
            ...inlineStyle,
            borderWidth: "3px",
        }
    }
    return (<div className="Tile" style={inlineStyle}  onClick={ () => props.onToolChange(props.tool) } />);
}
