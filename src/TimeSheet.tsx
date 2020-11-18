import React, { FormEvent, useState, SetStateAction, useRef } from 'react';
import TimeTable, { getTotalHoursWorkingInWeek } from './TimeTable'
import { useTimeSheetReducer, TimeSheetAction, TimeSheetActionType } from './state/TimeSheetReducer';
import { TimeSheetState } from './state/TimeSheetState';
import { saveTimeSheetToLocalStorage, deleteTimeSheetFromLocalStorage } from './store/TimeSheetStore';
import { toReadableWeekString } from './Utils';

interface TimeSheetProps {
  date: Date,
  addTimeSheetDate: (date: Date) => void,
  deleteTimeSheetDate: (date: Date) => void,
  isDeletedTimeSheetDate: boolean
}

interface TimeSheetContextData {
  weekStartDate: Date,
  dispatch: React.Dispatch<TimeSheetAction>
}

const TimeSheetContext = React.createContext<TimeSheetContextData | null>(null)
const defaultAddPersonValue = ''

function TimeSheet(props: TimeSheetProps) {
  const [state, dispatch] = useTimeSheetReducer(props)
  const timeSheetContext: TimeSheetContextData = {
    weekStartDate: state.weekStartDate,
    dispatch: dispatch
  }

  const [addPersonValue, setAddPersonValue] = useState(defaultAddPersonValue)
  const addPersonInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <TimeSheetContext.Provider value={timeSheetContext}>
      <h2>
        Week: {toReadableWeekString(props.date)}
      </h2>
      <button disabled={!canSaveTimeSheet(state.weekStartDate, state)} onClick={() => saveTimeSheet(state.weekStartDate, state, props.addTimeSheetDate)}>
        Save Time Sheet To Local Storage
      </button>
      <button disabled={!canDeleteTimeSheet(state.weekStartDate, props.isDeletedTimeSheetDate)} onClick={() => deleteTimeSheet(state.weekStartDate, props.deleteTimeSheetDate)}>
        Delete Time Sheet From Local Storage
      </button>
      <form onSubmit={(evt) => addTimeTable(evt, state, timeSheetContext, addPersonValue, setAddPersonValue, addPersonInputRef)}>
        <label htmlFor='person'>
          Person:
        </label>
        <input name='person' type="text" ref={addPersonInputRef} value={addPersonValue} onChange={(evt) => setAddPersonValue(evt.target.value)} />
        <input type="submit" value="Add new timetable" />
      </form>
      <p>
        Total hours working in week: {getAllPeopleTotalHoursWorking(state)}
      </p>
      {Object.keys(state.timeTablePropsMap).map(personName => (
      <div className='container' key={personName}>
        {React.createElement(
          TimeTable,
          state.timeTablePropsMap[personName])}
      </div>))}
    </TimeSheetContext.Provider>
  );
}

function canSaveTimeSheet(date: Date, state: TimeSheetState) {
  return true
}

function canDeleteTimeSheet(date: Date, isDeletedTimeSheetDate: boolean) {
  return !isDeletedTimeSheetDate
}

function saveTimeSheet(
    date: Date,
    state: TimeSheetState,
    addTimeSheetDate: React.Dispatch<Date>) {

  saveTimeSheetToLocalStorage(date, state)
  addTimeSheetDate(date)

  window.alert(`Successfully saved time sheet for ${toReadableWeekString(date)}`)
}

function deleteTimeSheet(
    date: Date,
    deleteTimeSheetDate: React.Dispatch<Date>) {

  const confirmedCancel = window.confirm(`Are you sure you want to delete time sheet save data for ${toReadableWeekString(date)}?`)

  if (confirmedCancel) {
    deleteTimeSheetDate(date)
    deleteTimeSheetFromLocalStorage(date)
  
    window.alert(`Successfully deleted time sheet save data for ${toReadableWeekString(date)}`)
  }
}

function addTimeTable(
    event: FormEvent<HTMLFormElement>,
    state: TimeSheetState,
    context: TimeSheetContextData,
    personName: string,
    setAddPersonValue: React.Dispatch<SetStateAction<string>>,
    addPersonInputRef: React.MutableRefObject<HTMLInputElement | null>) {

  event.preventDefault()

  if (personName === '') {
    alert('Cannot add timetable for nameless person')
    return
  }
  if (Object.keys(state.timeTablePropsMap).some(person => person.toLowerCase() === personName.toLowerCase())) {
    alert(`Timetable already exists for person ${personName}`)
    return
  }

  context.dispatch({
    type: TimeSheetActionType.AddTimeTable,
    personName: personName
  })

  setAddPersonValue(defaultAddPersonValue)
  addPersonInputRef.current!.focus()
}

function getAllPeopleTotalHoursWorking(state: TimeSheetState): number {
  return Object.values(state.timeTablePropsMap)
    .map(timeTableProp => getTotalHoursWorkingInWeek(timeTableProp))
    .reduce((hoursSoFar, hoursToday) => hoursSoFar + hoursToday, 0)
}

export default TimeSheet
export { TimeSheetContext }
export type { TimeSheetContextData, TimeSheetProps }