import React, { useContext } from 'react';
import { DayColumnProps, getTotalHoursWorking } from './DayColumn'
import DayOfWeek, { daysOfWeek } from './DayOfWeek'
import GetDayColumn from './DayColumn';
import { TimeSheetContext, TimeSheetContextData } from './TimeSheet';
import { TimeSheetActionType } from './state/TimeSheetReducer';

const headerRowName = [
  'PERSON',
]
const bodyRowNames = [
  'DAY',
  'START',
  'END',
  'UNPAID BREAKS',
  'DAILY HOURS TOTAL'
]

interface TimeTableProps {
  personName: string,
  date: Date,
  dayColumnsProps: {[dow in DayOfWeek]: DayColumnProps}
}

function TimeTable(props: TimeTableProps) {
  const timeSheetContext = useContext(TimeSheetContext)
  if (timeSheetContext === null) {
    throw new Error(`Time sheet context is null in ${GetDayColumn.name}`)
  }

  const dayColumnsElements = daysOfWeek
    .map(dow => props.dayColumnsProps[dow])
    .map(props => GetDayColumn(props))

  const transposedDayColumnsElements = transpose(dayColumnsElements)
  const bodyRows = bodyRowNames.map((rowName, rowNum) => {
    return {
      rowName: rowName,
      transposedDayColumnElements: transposedDayColumnsElements[rowNum]
    }})

  return (
    <table>
      <thead>
        <tr>
          <th scope='row'>
            {headerRowName}
            <button onClick={() => deleteTimeTable(timeSheetContext, props.personName)}>Delete</button>
          </th>
          <td colSpan={daysOfWeek.length}>
            {props.personName}: {getTotalHoursWorkingInWeek(props)} hours
          </td>
        </tr>
      </thead>
      <tbody>
        {bodyRows.map(row => (
        <tr key={row.rowName}>
          <th scope='row'>
            {row.rowName}
          </th>
          {row.transposedDayColumnElements.map((cell, i) => (
          <td key={i}>
            {cell}
          </td>))}
        </tr>
        ))}
      </tbody>
    </table>
  );
}

function transpose<T>(array: Array<Array<T>>) {
  return array[0].map((_, colIndex) => array.map(row => row[colIndex]));
}

function deleteTimeTable(context: TimeSheetContextData, personName: string) {
  context.dispatch({
    type: TimeSheetActionType.DeleteTimeTable,
    personName: personName
  })
}

function getTotalHoursWorkingInWeek(props: TimeTableProps): number {
  return daysOfWeek
    .map(dow => getTotalHoursWorking(props.dayColumnsProps[dow]))
    .reduce((hoursSoFar, hoursToday) => hoursSoFar + hoursToday, 0)
}

export default TimeTable;
export type { TimeTableProps };
