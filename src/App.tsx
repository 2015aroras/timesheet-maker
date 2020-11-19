import React, { useState, SetStateAction } from 'react';
import {
  HashRouter,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.css';
import Home from './pages/Home';
import TimeSheetPage from './pages/TimeSheetPage';
import { getSavedTimeSheetDates, addSavedTimeSheetDate, deleteSavedTimeSheetDate } from './store/TimeSheetStore';
import { startOfWeek, toReadableWeekString, includes } from './Utils';

const baseUrl = '/timesheet-maker'

function App() {
  const [timeSheetDates, setTimeSheetDates] = useState(getSavedTimeSheetDates())

  return (
    <HashRouter basename={baseUrl}>
      <>
        <nav>
          <ul>
            <li>
              <Link to='/'>Home</Link>
            </li>
            {timeSheetDates.sort().map(date => 
            <li key={date.toISOString()}>
              <Link to={`/${date.toISOString()}`}>
                {toReadableWeekString(date, true)}
              </Link>
            </li>)}
          </ul>
        </nav>

        <Switch>
          <Route path='/:date'>
            <TimeSheetPage isDeletedTimeSheetDate={date => isDeletedTimeSheetDate(timeSheetDates, date)}
              addTimeSheetDate={date => addTimeSheetDate(timeSheetDates, setTimeSheetDates, date)}
              deleteTimeSheetDate={date => deleteTimeSheetDate(timeSheetDates, setTimeSheetDates, date)} />
          </Route>
          <Route path=''>
            <Home timeSheetDates={timeSheetDates}
              addTimeSheetDate={date => addTimeSheetDate(timeSheetDates, setTimeSheetDates, date)} />
          </Route>
        </Switch>
      </>
    </HashRouter>
  );
}

function addTimeSheetDate(
    timeSheetDates: Date[],
    setTimeSheetDates: React.Dispatch<SetStateAction<Date[]>>,
    date: Date): void {
  
  const startOfWeekDate = startOfWeek(date)
  if (!includes(timeSheetDates, startOfWeekDate)) {
    addSavedTimeSheetDate(startOfWeekDate)
    setTimeSheetDates(getSavedTimeSheetDates())
  }
}

function deleteTimeSheetDate(
  timeSheetDates: Date[],
  setTimeSheetDates: React.Dispatch<SetStateAction<Date[]>>,
  date: Date): void {
    
  const startOfWeekDate = startOfWeek(date)
  if (includes(timeSheetDates, startOfWeekDate)) {
    deleteSavedTimeSheetDate(startOfWeekDate)
    setTimeSheetDates(getSavedTimeSheetDates())
  }
}

function isDeletedTimeSheetDate(
  timeSheetDates: Date[],
  date: Date): boolean {
    
  const startOfWeekDate = startOfWeek(date)
  return !includes(timeSheetDates, startOfWeekDate)
}

export default App;