import React from 'react';
import DayOfWeek from '../DayOfWeek';

interface DayOfWeekCellProps {
  dow: DayOfWeek,
}

function DayOfWeekCell(props: DayOfWeekCellProps) {
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  return (
    <input
      className="dayOfWeekCellInput"
      type='text'
      readOnly={true}
      value={daysOfWeek[props.dow]}
    />
  );
}

export default DayOfWeekCell;
