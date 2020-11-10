import React, { FormEvent, useState, SetStateAction, useRef } from 'react';
import TimeTable from './TimeTable'
import { useTimeSheetReducer, TimeSheetAction, TimeSheetActionType } from './state/TimeSheetReducer';
import { TimeSheetState } from './state/TimeSheetState';
import { saveTimeSheetToLocalStorage, deleteTimeSheetFromLocalStorage, existsTimeSheetInLocalStorage } from './store/TimeSheetStore';

interface TimeSheetProps {
  date: Date,
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

  const [isSaved, setIsSaved] = useState(initialIsSavedTimeSheet(state.weekStartDate))

  return (
    <TimeSheetContext.Provider value={timeSheetContext}>
      <button disabled={!canSaveTimeSheet(state.weekStartDate, state)} onClick={() => saveTimeSheet(state.weekStartDate, state, setIsSaved)}>
        Save Time Sheet To Local Storage
      </button>
      <button disabled={!canDeleteTimeSheet(state.weekStartDate, isSaved)} onClick={() => deleteTimeSheet(state.weekStartDate, setIsSaved)}>
        Delete Time Sheet From Local Storage
      </button>
      <form onSubmit={(evt) => addTimeTable(evt, timeSheetContext, addPersonValue, setAddPersonValue, addPersonInputRef)}>
        <label htmlFor='person'>
          Person:
        </label>
        <input name='person' type="text" ref={addPersonInputRef} value={addPersonValue} onChange={(evt) => setAddPersonValue(evt.target.value)} />
        <input type="submit" value="Add new timetable" />
      </form>
      {Object.keys(state.timeTablePropsMap).map(personName => (
      <div className='container' key={personName}>
        {React.createElement(
          TimeTable,
          state.timeTablePropsMap[personName])}
      </div>))}
    </TimeSheetContext.Provider>
  );
}

function initialIsSavedTimeSheet(date: Date) {
  return existsTimeSheetInLocalStorage(date)
}

function canSaveTimeSheet(date: Date, state: TimeSheetState) {
  return true
}

function canDeleteTimeSheet(date: Date, isSaved: boolean) {
  return isSaved
}

function saveTimeSheet(
    date: Date,
    state: TimeSheetState,
    setIsSaved: React.Dispatch<React.SetStateAction<boolean>>) {
  saveTimeSheetToLocalStorage(date, state)
  setIsSaved(true)
}

function deleteTimeSheet(
    date: Date,
    setIsSaved: React.Dispatch<React.SetStateAction<boolean>>) {
  deleteTimeSheetFromLocalStorage(date)
  setIsSaved(false)
}

function addTimeTable(
    event: FormEvent<HTMLFormElement>,
    context: TimeSheetContextData,
    personName: string,
    setAddPersonValue: React.Dispatch<SetStateAction<string>>,
    addPersonInputRef: React.MutableRefObject<HTMLInputElement | null>) {

  event.preventDefault()

  if (personName === '') {
    alert('Cannot add timetable for nameless person')
    return
  }

  context.dispatch({
    type: TimeSheetActionType.AddTimeTable,
    personName: personName
  })

  setAddPersonValue(defaultAddPersonValue)
  addPersonInputRef.current!.focus()
}

export default TimeSheet
export { TimeSheetContext }
export type { TimeSheetContextData, TimeSheetProps }