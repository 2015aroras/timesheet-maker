import React, { useReducer, useEffect } from 'react';
import DayOfWeek from '../DayOfWeek'
import { cloneDeep } from "lodash"
import { TimeSheetProps } from '../TimeSheet';
import { TimeSheetState, initialState, initialTimeTableProps } from './TimeSheetState';
import { loadTimeSheetFromLocalStorage } from '../store/TimeSheetStore';
import { startOfWeek } from '../Utils';

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
  AddTimeTable,
  DeleteTimeTable
}

function useTimeSheetReducer(props: TimeSheetProps): [TimeSheetState, React.Dispatch<TimeSheetAction>] {
  const [state, dispatch] = useReducer(
    (state: TimeSheetState, action: TimeSheetAction) => reducer(props, state, action),
    initialState(props.date))

  useEffect(() => {
    const localState = loadTimeSheetFromLocalStorage(startOfWeek(props.date))
    dispatch({
      type: TimeSheetActionType.SetState,
      value: localState ?? initialState(props.date)
    })
    
    // return () => {
    //   console.log('Setting state')
    //   localStorage.setItem('state', JSON.stringify(state))
    // };
  }, [props.date]);

  return [state, dispatch]
}

function reducer(
    props: TimeSheetProps,
    state: TimeSheetState,
    action: TimeSheetAction): TimeSheetState {
  switch (action.type) {
    case TimeSheetActionType.StartTimeUpdate:
    case TimeSheetActionType.EndTimeUpdate:
    case TimeSheetActionType.BreaksLengthUpdate:
    case TimeSheetActionType.IsDayOffUpdate:
      return valueUpdater(state, action)
    case TimeSheetActionType.SetState:
      return action.value as TimeSheetState
    case TimeSheetActionType.AddTimeTable:
      return timeTableAdder(props, state, action)
    case TimeSheetActionType.DeleteTimeTable:
      return timeTableDeleter(state, action)
    default:
      throw new Error(`Action type ${action.type} is not supported by ${reducer}`)
  }
}

function valueUpdater(state: TimeSheetState, action: TimeSheetAction): TimeSheetState {
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
      throw new Error(`Action type ${action.type} is not supported by ${valueUpdater}`)
  }

  const updatedState = cloneDeep(state)
  updatedState.timeTablePropsMap[action.personName].dayColumnsProps[action.dow]
    = updatedDayColumn
  return updatedState
}

function timeTableAdder(
    props: TimeSheetProps,
    state: TimeSheetState,
    action: TimeSheetAction): TimeSheetState {
  if (action.personName === undefined) {
    throw new Error('Person name is undefined for time sheet add')
  }
  if (action.personName in state.timeTablePropsMap) {
    throw new Error(`Person name ${action.personName} cannot be added because they already have a time table`)
  }

  const updatedState = cloneDeep(state)
  updatedState.timeTablePropsMap[action.personName] = initialTimeTableProps(props, action.personName)
  return updatedState
}

function timeTableDeleter(state: TimeSheetState, action: TimeSheetAction): TimeSheetState {
  if (action.personName === undefined) {
    throw new Error('Person name is undefined for time sheet delete')
  }
  if (!(action.personName in state.timeTablePropsMap)) {
    throw new Error(`Person name ${action.personName} cannot be deleted because they have no time table`)
  }

  const updatedState = cloneDeep(state)
  delete updatedState.timeTablePropsMap[action.personName]
  return updatedState
}

export type { TimeSheetAction }
export { useTimeSheetReducer, TimeSheetActionType }