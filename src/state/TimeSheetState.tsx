import { TimeTableProps } from '../TimeTable'
import DayOfWeek, { daysOfWeek } from '../DayOfWeek'
import { DayColumnProps } from '../DayColumn';
import { TimeSheetProps } from '../TimeSheet';
import { timeFromDate, addTime, startOfWeek } from '../Utils';


interface TimeSheetState {
  weekStartDate: Date,
  timeTablePropsMap: {[personName: string]: TimeTableProps}
}

function initialState(date: Date): TimeSheetState {
  return {
    weekStartDate: startOfWeek(date),
    timeTablePropsMap: {}
  }
}

function initialTimeTableProps(props: TimeSheetProps, personName: string, personPos: number): TimeTableProps {
  return {
    personName: personName,
    timeTablePos: personPos,
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
    isDayOff: true,
    dow: dow,
    startTime: startTime,
    endTime: endTime,
    breaksLength: 0,
  }
}

function cloneStateWithNewDate(state: TimeSheetState, date: Date): TimeSheetState {
  const copiedPropsMapWithNewDate: {[personName: string]: TimeTableProps} = {}
  for (const personName in state.timeTablePropsMap) {
    copiedPropsMapWithNewDate[personName] = cloneTimeTablePropsWithNewDate(state.timeTablePropsMap[personName], date)
  }

  return {
    ...state,
    weekStartDate: startOfWeek(date),
    timeTablePropsMap: copiedPropsMapWithNewDate
  }
}

function cloneTimeTablePropsWithNewDate(props: TimeTableProps, date: Date): TimeTableProps {
  return {
    ...props,
    date: date,
    dayColumnsProps: daysOfWeek.reduce((map, dow) => {
      map[dow] = cloneDayColumnPropsWithNewDate(props.dayColumnsProps[dow], dow, date)
      return map
    }, {} as {[dow in DayOfWeek]?: DayColumnProps}
    ) as {[dow in DayOfWeek]: DayColumnProps}
  }
}

function cloneDayColumnPropsWithNewDate(props: DayColumnProps, dow: DayOfWeek, date: Date): DayColumnProps {
  const newDate = addTime(date, dow)

  return {
    ...props,
    startTime: timeFromDate(newDate, props.startTime.getHours(), props.startTime.getMinutes(), props.startTime.getSeconds()),
    endTime: timeFromDate(newDate, props.endTime.getHours(), props.endTime.getMinutes(), props.endTime.getSeconds()),
  }
}

export type { TimeSheetState }
export {
  initialState,
  initialTimeTableProps,
  cloneStateWithNewDate
}