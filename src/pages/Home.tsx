import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { addTime, toReadableWeekString, startOfWeek, includes, toReadableDateString } from '../Utils';
import { saveTimeSheetToLocalStorage, loadTimeSheetFromLocalStorage } from '../store/TimeSheetStore';
import { cloneStateWithNewDate } from '../state/TimeSheetState';

interface HomeProps {
  timeSheetDates: Date[],
  addTimeSheetDate: React.Dispatch<Date>
}

const noTemplateTimeSheetValue = 'None'

function Home(props: HomeProps) {
  const [date, setDate] = useState(new Date(Date.now()))
  const [isAddedTimeSheet, setIsAddedTimeSheet] = useState(false)

  const [templateTimeSheetWeek, setTemplateTimeSheetWeek] = useState(noTemplateTimeSheetValue)

  return (
    <>
      {isAddedTimeSheet &&
        <Redirect to={`/${date.toISOString()}`} />
      }
      <h2>
        Home
      </h2>
      <form onSubmit={(evt) => addTimeSheet(evt, date, setIsAddedTimeSheet, props.addTimeSheetDate, props.timeSheetDates, templateTimeSheetWeek)}>
        <label htmlFor='date'>
          Date:
        </label>
        <input name='date' type="date" value={dateToInputValue(date)} onChange={(evt) => onDateChange(evt, setDate)} />
        <label htmlFor='copyFrom'>
          Copy from:
        </label>
        <select value={templateTimeSheetWeek} onChange={evt => onTemplateTimeSheetWeekChange(props.timeSheetDates, evt, setTemplateTimeSheetWeek)}>
          <option key={noTemplateTimeSheetValue} value={noTemplateTimeSheetValue}>
            None
          </option>
          {props.timeSheetDates.map(timeSheetDate =>
          <option key={timeSheetDate.toISOString()} value={timeSheetDate.toISOString()}>
            {toReadableWeekString(timeSheetDate, true /* includeYear */)}
          </option>)}
        </select>
        <input type="submit" value="Add new time sheet" />
      </form>
    </>
  );
}

function addTimeSheet(
    event: React.FormEvent<HTMLFormElement>,
    date: Date,
    setIsAddedTimeSheet: React.Dispatch<React.SetStateAction<boolean>>,
    addTimeSheetDate: React.Dispatch<Date>,
    timeSheetDates: Date[],
    templateTimeSheetWeek: string) {

  event.preventDefault()

  validateTimeSheetWeek(timeSheetDates, templateTimeSheetWeek)

  const startOfWeekDate = startOfWeek(date)
  if (includes(timeSheetDates, startOfWeekDate)) {
    alert(`Time sheet already exists for ${toReadableDateString(date)} (week ${toReadableWeekString(startOfWeekDate)})`)
    return
  }

  if (templateTimeSheetWeek !== noTemplateTimeSheetValue) {
    const templateStartOfWeekDate = getStartDateFromTimeSheetWeek(timeSheetDates, templateTimeSheetWeek)
    const templateTimeSheetState = loadTimeSheetFromLocalStorage(templateStartOfWeekDate)
    if (templateTimeSheetState === null) {
      throw new Error(`Saved week ${toReadableWeekString(templateStartOfWeekDate)} has no local saved data`)
    }

    const clonedTimeSheetState = cloneStateWithNewDate(templateTimeSheetState, startOfWeekDate)
    saveTimeSheetToLocalStorage(startOfWeekDate, clonedTimeSheetState)
  }
 
  addTimeSheetDate(startOfWeekDate)
  setIsAddedTimeSheet(true)
}

function dateToInputValue(date: Date): string {
  let year: string = date.getFullYear().toString()
  let month: string = (date.getMonth() + 1).toString().padStart(2, '0')
  let dayOfMonth: string = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${dayOfMonth}`
}

function onDateChange(
    event: React.ChangeEvent<HTMLInputElement>,
    setDate: React.Dispatch<React.SetStateAction<Date>>) {
  const inputDate = event.target.valueAsDate
  if (inputDate === null) {
    throw new Error(`Failed to set date in ${Home.name}`)
  }

  const newDate = addTime(inputDate, 0, 0, inputDate.getTimezoneOffset())
  setDate(newDate)
}

function onTemplateTimeSheetWeekChange(
    timeSheetDates: Date[],
    event: React.ChangeEvent<HTMLSelectElement>,
    setTemplateTimeSheetWeek: React.Dispatch<React.SetStateAction<string>>) {

  const selectedDateString = event.target.value
  if (selectedDateString === null) {
    throw new Error(`Failed to set 'copy from' time sheet in ${Home.name}`)
  }
  validateTimeSheetWeek(timeSheetDates, selectedDateString)

  setTemplateTimeSheetWeek(selectedDateString)
}

function validateTimeSheetWeek(timeSheetDates: Date[], timeSheetWeek: string) {
  if (timeSheetWeek !== noTemplateTimeSheetValue &&
      !getStartDateFromTimeSheetWeek(timeSheetDates, timeSheetWeek)) {
    throw new Error(`Selected time sheet week ${timeSheetWeek} is not none or an existing week`)
  }
}

function getStartDateFromTimeSheetWeek(timeSheetDates: Date[], timeSheetWeek: string): Date {
  const matchingDates: Date[] = timeSheetDates.filter(date => date.toISOString() === timeSheetWeek)
  if (matchingDates.length !== 1) {
    throw new Error(`${timeSheetWeek} matches ${matchingDates.length} dates from ${timeSheetDates}, expected 1 match`)
  }

  return matchingDates[0]
}

export default Home;
