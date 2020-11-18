import React, { useContext } from 'react';
import TimeCell from './cells/TimeCell'
import NumberCell from './cells/NumberCell'
import DayOfWeekCell from './cells/DayOfWeekCell';
import DayOfWeek from './DayOfWeek';
import { TimeSheetContextData, TimeSheetContext } from './TimeSheet';
import { TimeSheetActionType } from './state/TimeSheetReducer';
import CheckBoxCell from './cells/CheckBoxCell';

interface DayColumnProps {
  personName: string,
  dow: DayOfWeek,
  isDayOff?: boolean, // Optional for backwards compatibility
  startTime: Date,
  endTime: Date,
  breaksLength: number,
}

function GetDayColumn(props: DayColumnProps) {
  const timeSheetContext = useContext(TimeSheetContext)
  if (timeSheetContext === null) {
    throw new Error(`Time sheet context is null in ${GetDayColumn.name}`)
  }

  const dayOfWeekCell = <DayOfWeekCell key={0} dow={props.dow} />
  const checkBoxCell = <CheckBoxCell
    key={5}
    isChecked={props.isDayOff ?? false}
    onCheckedChange={isChecked => handleIsDayOffChange(props, timeSheetContext, isChecked)}
    value={props.dow.toString()} />

  if (props.isDayOff) {
    return React.Children.toArray([
      dayOfWeekCell,
      <></>,
      <></>,
      <></>,
      <></>,
      checkBoxCell
    ]);
  }

  return React.Children.toArray([
    dayOfWeekCell,
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
      readOnly={true}/>,
    checkBoxCell
  ]);
}

function getTotalHoursWorking(props: DayColumnProps): number {
  if (props.isDayOff) {
    return 0;
  }

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

function handleIsDayOffChange(
  props: DayColumnProps,
  timeSheetContext: TimeSheetContextData | null,
  newIsChecked: boolean) {

  handleChange(props, timeSheetContext, TimeSheetActionType.IsDayOffUpdate, newIsChecked)
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
export { getTotalHoursWorking }; // hack
