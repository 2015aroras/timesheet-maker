import React, { useState } from 'react';
import { addSavedTimeSheetDate } from '../store/TimeSheetStore';
import { Redirect } from 'react-router-dom';
import { addTime, startOfWeek } from '../Utils';
import { baseUrl } from '../App';

function Home() {
  const [date, setDate] = useState(new Date(Date.now()))
  const [isAddedTimeSheet, setIsAddedTimeSheet] = useState(false)

  return (
    <>
      {isAddedTimeSheet &&
        <Redirect to={`${baseUrl}/${date.toISOString()}`} />
      }
      <form onSubmit={(evt) => addTimeSheet(evt, date, setIsAddedTimeSheet)}>
        <label htmlFor='date'>
          Date:
        </label>
        <input name='date' type="date" value={dateToInputValue(date)} onChange={(evt) => onDateChange(evt, setDate)} />
        <input type="submit" value="Add new time sheet" />
      </form>
    </>
  );
}

function addTimeSheet(
    event: React.FormEvent<HTMLFormElement>,
    date: Date,
    setIsAddedTimeSheet: React.Dispatch<React.SetStateAction<boolean>>) {

  event.preventDefault()

  const startOfWeekDate = startOfWeek(date)
  addSavedTimeSheetDate(startOfWeekDate)

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

export default Home;
