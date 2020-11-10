import React from 'react';
import TimeCell, { TimeCellProps } from '../cells/TimeCell'
import DayOfWeek, { daysOfWeek } from '../DayOfWeek'

type TimeRowProps = {
  children: JSX.Element,
  timeProps: {[dow in DayOfWeek]: TimeCellProps}
}

function TimeRow(props: TimeRowProps) {
  const timeCells = daysOfWeek.map((dow) =>
    <td key={dow}>
      {getTimeCell(dow)}
    </td>)

  return (
    <tr>
      <th>{props.children}</th>
      {timeCells}
    </tr>
  );

  function getTimeCell(dow: DayOfWeek): JSX.Element {
    const timeCellProps = props.timeProps[dow]
    return React.createElement(
      TimeCell,
      timeCellProps
    );
  }
}

export default TimeRow;
