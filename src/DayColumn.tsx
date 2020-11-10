import React, { useContext } from 'react';
import TimeCell from './cells/TimeCell'
import NumberCell from './cells/NumberCell'
import DayOfWeekCell from './cells/DayOfWeekCell';
import DayOfWeek from './DayOfWeek';
import { TimeSheetContextData, TimeSheetContext } from './TimeSheet';
import { TimeSheetActionType } from './state/TimeSheetReducer';

interface DayColumnProps {
  personName: string,
  dow: DayOfWeek,
  startTime: Date,
  endTime: Date,
  breaksLength: number,
}

function GetDayColumn(props: DayColumnProps) {
  const timeSheetContext = useContext(TimeSheetContext)
  if (timeSheetContext === null) {
    throw new Error(`Time sheet context is null in ${GetDayColumn.name}`)
  }

  return React.Children.toArray([
    <DayOfWeekCell key={0} dow={props.dow} />,
    <TimeCell
      key={1}
      time={props.startTime}
      onTimeChange={date => handleStartTimeChange(props, timeSheetContext, date)} />,
    <TimeCell
      key={2}
      time={props.endTime}
      onTimeChange={date => handleEndTimeChange(props, timeSheetContext, date)} />,
    <NumberCell
      key={3}
      number={props.breaksLength}
      step={15}
      onNumberChange={number => handleBreaksLengthChange(props, timeSheetContext, number)} />,
    <NumberCell
      key={4}
      number={getTotalHoursWorking(props)}
      readOnly={true}/>
  ]);
}

function getTotalHoursWorking(props: DayColumnProps): number {
  return props.endTime.getHours() - props.startTime.getHours()
         - props.breaksLength / 60
         + (props.endTime.getMinutes() - props.startTime.getMinutes()) / 60
         + (props.endTime.getSeconds() - props.startTime.getSeconds()) / (60 * 60)
}

function handleStartTimeChange(
  props: DayColumnProps,
  timeSheetContext: TimeSheetContextData | null,
  newTime: Date) {

  handleChange(props, timeSheetContext, TimeSheetActionType.StartTimeUpdate, newTime)
}

function handleEndTimeChange(
  props: DayColumnProps,
  timeSheetContext: TimeSheetContextData | null,
  newTime: Date) {

  handleChange(props, timeSheetContext, TimeSheetActionType.EndTimeUpdate, newTime)
}

function handleBreaksLengthChange(
    props: DayColumnProps,
    timeSheetContext: TimeSheetContextData | null,
    newNumber: number) {

  handleChange(props, timeSheetContext, TimeSheetActionType.BreaksLengthUpdate, newNumber)
}

function handleChange<T>(
  props: DayColumnProps,
  timeSheetContext: TimeSheetContextData | null,
  actionType: TimeSheetActionType,
  newValue: T) {

  if (timeSheetContext === null) {
    throw new Error('Context cannot be null in number change')
  }

  timeSheetContext.dispatch({
    personName: props.personName,
    dow: props.dow,
    type: actionType,
    value: newValue
  })
}

export default GetDayColumn;
export type { DayColumnProps };
