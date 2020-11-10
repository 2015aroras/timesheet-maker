import React from 'react';

interface NumberCellProps {
  number: number,
  onNumberChange?: React.Dispatch<number>,
  readOnly?: boolean,
  step?: number
}

function NumberCell(props: NumberCellProps) {

  return (
    <input
      className="numberCellInput"
      type="number"
      min="0"
      step={props.step}
      readOnly={props.readOnly}
      value={props.number}
      placeholder="Set the time"
      onChange={handleChangeFunction(props)}
    />
  );
}

function handleChangeFunction(props: NumberCellProps) {
  if (props.onNumberChange === undefined) {
    if (!props.readOnly) {
      throw new Error('No number change handler provided for non-readonly input')
    }
    return undefined
  }

  return function(evt: React.ChangeEvent<HTMLInputElement>) {
    props.onNumberChange!(evt.target.valueAsNumber)
  }
}

export default NumberCell;
