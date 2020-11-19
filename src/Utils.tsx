function areEqual(date: Date, otherDate: Date): boolean {
  return date.toISOString() === otherDate.toISOString()
}

function includes(dates: Date[], queryDate: Date): boolean {
  return dates.some(date => areEqual(date, queryDate))
}

function parseJson<T>(jsonString: string): T {
  return JSON.parse(jsonString, (key, value) => {
    if (key.toLowerCase().endsWith('date') || key.toLowerCase().endsWith('time')) {
      return new Date(value)
    }
    return value
  })
}

function startOfWeek(date: Date): Date {
  let startOfWeek = addTime(date, - date.getDay())
  startOfWeek.setHours(0)
  startOfWeek.setMinutes(0)
  startOfWeek.setSeconds(0)
  startOfWeek.setMilliseconds(0)
  return startOfWeek
}

function timeFromDate(date: Date, hours: number, minutes: number, seconds: number): Date {
  let time: Date = new Date(date)
  time.setHours(hours)
  time.setMinutes(minutes)
  time.setSeconds(seconds)
  time.setMilliseconds(0)
  return time
}

function addTime(date: Date, days?: number, hours?: number,
    minutes?: number, seconds?: number): Date {
  return new Date(date.getTime()
    + (days ?? 0) * 24 * 60 * 60 * 1000 
    + (hours ?? 0) * 60 * 60 * 1000
    + (minutes ?? 0) * 60 * 1000
    + (seconds ?? 0) * 1000
  )
}

function toReadableDateString(date: Date, includeYear=false): string {
  const yearSuffix = includeYear ? `/${date.getFullYear()}` : ''
  return `${date.getDate()}/${date.getMonth() + 1}` + yearSuffix
}

function toReadableWeekString(date: Date, includeYear=false): string {
  const startOfWeekDate = startOfWeek(date)
  return `${toReadableDateString(startOfWeekDate, includeYear)} – ${toReadableDateString(addTime(startOfWeekDate, 7), includeYear)}`
}

export {
  areEqual,
  includes,
  parseJson,
  startOfWeek,
  timeFromDate,
  addTime,
  toReadableDateString,
  toReadableWeekString
}