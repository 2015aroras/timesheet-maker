import React, { useReducer, useEffect } from 'react';
import DayOfWeek from '../DayOfWeek'
import { cloneDeep } from "lodash"
import { TimeSheetProps } from '../TimeSheet';
import { TimeSheetState, initialState, initialTimeTableProps } from './TimeSheetState';
import { loadTimeSheetFromLocalStorage } from '../store/TimeSheetStore';
import { startOfWeek } from '../Utils';
import { TimeTableProps } from '../TimeTable';

interface TimeSheetAction {
  type: TimeSheetActionType,
  personName?: string,
  dow?: DayOfWeek,
  value?: any
}

enum TimeSheetActionType {
  StartTimeUpdate,
  EndTimeUpdate,
  BreaksLengthUpdate,
  IsDayOffUpdate,
  SetState,
  ResetTimeTableOrder,
  MoveTimeTableUp,
  MoveTimeTableDown,
  AddTimeTable,
  DeleteTimeTable
}

function useTimeSheetReducer(props: TimeSheetProps): [TimeSheetState, React.Dispatch<TimeSheetAction>] {
  const [state, dispatch] = useReducer(
    (state: TimeSheetState, action: TimeSheetAction) => reduce(props, state, action),
    initialState(props.date))

  useEffect(() => loadStateFromStorage(dispatch, props.date), [props.date]);

  return [state, dispatch]
}

function loadStateFromStorage(dispatch: React.Dispatch<TimeSheetAction>, date: Date) {
  const localState = loadTimeSheetFromLocalStorage(startOfWeek(date))
  const newState = localState ?? initialState(date)
  dispatch({
    type: TimeSheetActionType.SetState,
    value: newState
  })

  const personNames: string[] = Object.keys(newState.timeTablePropsMap)
  if (personNames.some(person => newState.timeTablePropsMap[person].timeTablePos === undefined)) {
    dispatch({
      type: TimeSheetActionType.ResetTimeTableOrder
    })
  }
}

function reduce(
    props: TimeSheetProps,
    state: TimeSheetState,
    action: TimeSheetAction): TimeSheetState {
  switch (action.type) {
    case TimeSheetActionType.StartTimeUpdate:
    case TimeSheetActionType.EndTimeUpdate:
    case TimeSheetActionType.BreaksLengthUpdate:
    case TimeSheetActionType.IsDayOffUpdate:
      return updateValue(state, action)
    case TimeSheetActionType.SetState:
      return action.value as TimeSheetState
    case TimeSheetActionType.AddTimeTable:
      return addTimeTable(props, state, action)
    case TimeSheetActionType.DeleteTimeTable:
      return deleteTimetable(state, action)
    case TimeSheetActionType.ResetTimeTableOrder:
      return resetTimeTableOrder(state)
    case TimeSheetActionType.MoveTimeTableUp:
      return moveTimeTableUp(state, action.personName!)
    case TimeSheetActionType.MoveTimeTableDown:
      return moveTimeTableDown(state, action.personName!)
    default:
      throw new Error(`Action type ${action.type} is not supported by ${reduce}`)
  }
}

function updateValue(state: TimeSheetState, action: TimeSheetAction): TimeSheetState {
  if (action.personName === undefined) {
    throw new Error('Person name is undefined for time sheet update')
  }
  if (action.dow === undefined) {
    throw new Error('Day of week is undefined for time sheet update')
  }

  const timeTable = state.timeTablePropsMap[action.personName]
  const dayColumn = timeTable.dayColumnsProps[action.dow]
  
  const updatedDayColumn = {...dayColumn}
  switch (action.type) {
    case TimeSheetActionType.StartTimeUpdate:
      updatedDayColumn.startTime = action.value
      break
    case TimeSheetActionType.EndTimeUpdate:
      updatedDayColumn.endTime = action.value
      break
    case TimeSheetActionType.BreaksLengthUpdate:
      updatedDayColumn.breaksLength = action.value
      break
    case TimeSheetActionType.IsDayOffUpdate:
      updatedDayColumn.isDayOff = action.value
      break
    default:
      throw new Error(`Action type ${action.type} is not supported by ${updateValue}`)
  }

  const updatedState = cloneDeep(state)
  updatedState.timeTablePropsMap[action.personName].dayColumnsProps[action.dow]
    = updatedDayColumn
  return updatedState
}

function addTimeTable(
    props: TimeSheetProps,
    state: TimeSheetState,
    action: TimeSheetAction): TimeSheetState {
  if (action.personName === undefined) {
    throw new Error('Person name is undefined for time sheet add')
  }
  if (action.personName in state.timeTablePropsMap) {
    throw new Error(`Person name ${action.personName} cannot be added because they already have a time table`)
  }

  const newPersonPos: number = Object.keys(state.timeTablePropsMap).length

  const updatedState = cloneDeep(state)
  updatedState.timeTablePropsMap[action.personName] = initialTimeTableProps(props, action.personName, newPersonPos)

  return updatedState
}

function deleteTimetable(state: TimeSheetState, action: TimeSheetAction): TimeSheetState {
  if (action.personName === undefined) {
    throw new Error('Person name is undefined for time sheet delete')
  }
  if (!(action.personName in state.timeTablePropsMap)) {
    throw new Error(`Person name ${action.personName} cannot be deleted because they have no time table`)
  }

  let updatedState: TimeSheetState = cloneDeep(state)
  while (updatedState.timeTablePropsMap[action.personName].timeTablePos
      !== Object.keys(state.timeTablePropsMap).length - 1) {
    console.log(updatedState.timeTablePropsMap[action.personName].timeTablePos)
    updatedState = moveTimeTableDown(updatedState, action.personName)
  }

  delete updatedState.timeTablePropsMap[action.personName]
  return updatedState
}

function resetTimeTableOrder(state: TimeSheetState): TimeSheetState {
  const updatedState = cloneDeep(state)
  const sortedPersonNames = Object.keys(state.timeTablePropsMap)
  
  sortedPersonNames.forEach((personName, i) => {
    updatedState.timeTablePropsMap[personName].timeTablePos = i
  })

  return updatedState
}

function moveTimeTableUp(state: TimeSheetState, personName: string): TimeSheetState {
  const timeTablePosition = state.timeTablePropsMap[personName].timeTablePos
  if (timeTablePosition === undefined) {
    throw new Error(`Time table position is undefined`)
  }

  if (timeTablePosition === 0) {
    return cloneDeep(state)
  }
  
  return moveTimeTableAtPositionUp(state, timeTablePosition)
}

function moveTimeTableDown(state: TimeSheetState, personName: string): TimeSheetState {
  const timeTablePosition = state.timeTablePropsMap[personName].timeTablePos
  if (timeTablePosition === undefined) {
    throw new Error(`Time table position is undefined`)
  }

  if (timeTablePosition === Object.keys(state.timeTablePropsMap).length - 1) {
    return cloneDeep(state)
  }

  return moveTimeTableAtPositionUp(state, timeTablePosition + 1)
}

function moveTimeTableAtPositionUp(state: TimeSheetState, timeTablePosition: number): TimeSheetState {
  if (!Number.isInteger(timeTablePosition)) {
    throw new Error(`Time table position ${timeTablePosition} is not an integer`)
  }
  const timeTableCount = Object.keys(state.timeTablePropsMap).length
  if (timeTablePosition < 0 || timeTablePosition >= timeTableCount) {
    throw new Error(`Time table position ${timeTablePosition} is less than 0 or greater than ${timeTableCount}`)
  }

  const updatedState = cloneDeep(state)

  if (timeTablePosition === 0) {
    return updatedState
  }

  const timeTableAtPos = getTimeTableAtPos(updatedState, timeTablePosition)
  const timeTableAbove = getTimeTableAtPos(updatedState, timeTablePosition - 1)

  timeTableAtPos.timeTablePos = timeTablePosition - 1
  timeTableAbove.timeTablePos = timeTablePosition

  return updatedState
}

function getTimeTableAtPos(state: TimeSheetState, timeTablePos: number): TimeTableProps {
  if (!Number.isInteger(timeTablePos)) {
    throw new Error(`Time table position ${timeTablePos} is not an integer`)
  }
  const timeTableCount = Object.keys(state.timeTablePropsMap).length
  if (timeTablePos < 0 || timeTablePos >= timeTableCount) {
    throw new Error(`Time table position ${timeTablePos} is less than 0 or greater than ${timeTableCount}`)
  }

  const timeTablesAtPos = Object.values(state.timeTablePropsMap)
    .filter(timeTableProp => timeTableProp.timeTablePos === timeTablePos)
  if (timeTablesAtPos.length !== 1)  {
    throw new Error(`Expected 1 timetable at position ${timeTablePos}, found ${timeTablesAtPos.length}`)
  }

  return timeTablesAtPos[0]
}

export type { TimeSheetAction }
export { useTimeSheetReducer, TimeSheetActionType }