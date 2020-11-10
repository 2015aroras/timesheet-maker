import React from 'react';
import TimeSheet from '../TimeSheet';
import { useParams } from 'react-router-dom';

interface TimeSheetPageParams {
  date: string
}

function TimeSheetPage() {
  const pageParams: TimeSheetPageParams = useParams<TimeSheetPageParams>()
  const date: Date = new Date(pageParams.date)

  return (
    <section className="time-sheet">
      <TimeSheet date={date} />
    </section>
  );
}

export default TimeSheetPage;
