import { parseJson, areEqual, startOfWeek, includes } from '../Utils'
import { TimeSheetState } from '../state/TimeSheetState'

const timeSheetDatesKey: string = 'timeSheetDates'

function getSavedTimeSheetDates(): Array<Date> {
  const savedDatesString = localStorage.getItem(timeSheetDatesKey)
  if (savedDatesString === null) {
    return []
  }
  return parseJson<Array<string>>(savedDatesString).map(dateString => new Date(dateString))
}

function setSavedTimeSheetDates(dates: Array<Date>): void {
  dates.forEach(validateIsStartOfWeekDate)
  localStorage.setItem(timeSheetDatesKey, JSON.stringify(dates))
}

function addSavedTimeSheetDate(date: Date): void {
  validateIsStartOfWeekDate(date)

  const savedDates = getSavedTimeSheetDates()
  if (!includes(savedDates, date)) {
    setSavedTimeSheetDates([date, ...savedDates])
  }
}

function deleteSavedTimeSheetDate(date: Date): void {
  validateIsStartOfWeekDate(date)

  const savedDates = getSavedTimeSheetDates()
  setSavedTimeSheetDates(savedDates.filter(savedDate => !areEqual(date, savedDate)))
}

function saveTimeSheetToLocalStorage(date: Date, state: TimeSheetState): void {
  validateIsStartOfWeekDate(date)

  localStorage.setItem(`timeSheet-${date.toISOString()}`, JSON.stringify(state))
  addSavedTimeSheetDate(date)
}

function existsTimeSheetInLocalStorage(date: Date): boolean {
  validateIsStartOfWeekDate(date)

  // return includes(getSavedTimeSheetDates(), date, savedDate)
  //   || localStorage.getItem(`timeSheet-${date.toISOString()}`) !== null
  return localStorage.getItem(`timeSheet-${date.toISOString()}`) !== null
}

function loadTimeSheetFromLocalStorage(date: Date): TimeSheetState | null {
  validateIsStartOfWeekDate(date)

  const localStateString = localStorage.getItem(`timeSheet-${date.toISOString()}`)
  if (localStateString === null) {
    return null
  }

  return parseJson(localStateString)
}

function deleteTimeSheetFromLocalStorage(date: Date): boolean {
  validateIsStartOfWeekDate(date)

  deleteSavedTimeSheetDate(date)

  if (!existsTimeSheetInLocalStorage(date)) {
    return false
  }

  localStorage.removeItem(`timeSheet-${date.toISOString()}`)
  return true
}

function validateIsStartOfWeekDate(date: Date): void {
  if (!areEqual(date, startOfWeek(date))) {
    throw new Error(`Date ${date} does not match start of week ${startOfWeek(date)}`)
  }
}

export {
  getSavedTimeSheetDates,
  addSavedTimeSheetDate,
  deleteSavedTimeSheetDate,
  saveTimeSheetToLocalStorage,
  existsTimeSheetInLocalStorage,
  loadTimeSheetFromLocalStorage,
  deleteTimeSheetFromLocalStorage
}