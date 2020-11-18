import React from 'react';
import TimeSheet from '../TimeSheet';
import { useParams, Redirect } from 'react-router-dom';

interface TimeSheetPageParams {
  date: string
}

interface TimeSheetPageProps {
  isDeletedTimeSheetDate: (date: Date) => boolean,
  addTimeSheetDate: (date: Date) => void,
  deleteTimeSheetDate: (date: Date) => void,
}

function TimeSheetPage(props: TimeSheetPageProps) {
  const pageParams: TimeSheetPageParams = useParams<TimeSheetPageParams>()
  const date: Date = new Date(pageParams.date)

  return (
    <>
      {props.isDeletedTimeSheetDate(date) &&
        <Redirect to={`/`} />
      }
      <section className="time-sheet">
        <TimeSheet date={date}
          addTimeSheetDate={props.addTimeSheetDate}
          deleteTimeSheetDate={props.deleteTimeSheetDate}
          isDeletedTimeSheetDate={props.isDeletedTimeSheetDate(date)} />
      </section>
    </>
  );
}

export default TimeSheetPage;
