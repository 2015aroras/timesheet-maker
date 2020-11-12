import React from 'react';
import {
  HashRouter,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.css';
import Home from './pages/Home';
import TimeSheetPage from './pages/TimeSheetPage';
import { getSavedTimeSheetDates } from './store/TimeSheetStore';
import { addTime, toReadableDateString } from './Utils';

const baseUrl = '/timesheet-maker'

function App() {
  const savedTimeSheetDates = getSavedTimeSheetDates()

  return (
    <HashRouter basename={baseUrl}>
      <>
        <nav>
          <ul>
            <li>
              <Link to='/'>Home</Link>
            </li>
            {savedTimeSheetDates.sort().map(date => 
            <li key={date.toISOString()}>
              <Link to={`/${date.toISOString()}`}>
                {toReadableDateString(date, true)} – {toReadableDateString(addTime(date, 7), true)}
              </Link>
            </li>)}
          </ul>
        </nav>

        <Switch>
          <Route path='/:date' component=
            {TimeSheetPage}
          >
            
          </Route>
          <Route path=''>
            <Home />
          </Route>
        </Switch>
      </>
    </HashRouter>
    // <section className="App">
    //   <TimeSheet date={new Date(Date.now())} />
    // </section>
  );
}

export default App;