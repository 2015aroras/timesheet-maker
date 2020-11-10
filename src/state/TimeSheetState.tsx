import { TimeTableProps } from '../TimeTable'
import DayOfWeek, { daysOfWeek } from '../DayOfWeek'
import { DayColumnProps } from '../DayColumn';
import { TimeSheetProps } from '../TimeSheet';
import { timeFromDate, addTime, startOfWeek } from '../Utils';


interface TimeSheetState {
  weekStartDate: Date,
  timeTablePropsMap: {[personName: string]: TimeTableProps}
}

function initialState(props: TimeSheetProps): TimeSheetState {
  return {
    weekStartDate: startOfWeek(props.date),
    timeTablePropsMap: {}
  }
}

function initialTimeTableProps(props: TimeSheetProps, personName: string): TimeTableProps {
  return {
    personName: personName,
    date: props.date,
    dayColumnsProps: daysOfWeek.reduce((map, dow) => {
      map[dow] = initialDayColumnProps(props, personName, dow)
      return map
    }, {} as {[dow in DayOfWeek]?: DayColumnProps}
    ) as {[dow in DayOfWeek]: DayColumnProps}
  }
}

function initialDayColumnProps(props: TimeSheetProps,
    personName: string, dow: DayOfWeek): DayColumnProps {
  const startTime = addTime(timeFromDate(props.date, 8, 0, 0), dow)
  const endTime = addTime(startTime, 0, 0, 30)

  return {
    personName: personName,
    dow: dow,
    startTime: startTime,
    endTime: endTime,
    breaksLength: 0,
  }
}

export type { TimeSheetState }
export {
  initialState,
  initialTimeTableProps,
}