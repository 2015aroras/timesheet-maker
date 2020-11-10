import React from 'react';

type TimeCellProps = {
  time: Date,
  onTimeChange: React.Dispatch<Date>
}

function TimeCell(props: TimeCellProps) {
  return (
    <input
      className="timeCellInput"
      type="time"
      min="08:00:00"
      max="21:00:00"
      step={15 * 60}
      value={timeToInputValue(props.time)}
      placeholder="Set the time"
      onChange={(evt) => updateTimeFromInput(evt)}
    />
  );

  function timeToInputValue(time: Date): string {
    let hours: string = time.getHours().toString().padStart(2, '0')
    let minutes: string = time.getMinutes().toString().padStart(2, '0')
    let seconds: string = time.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  function updateTimeFromInput(evt: React.ChangeEvent<HTMLInputElement>): void {
    let inputTime: Date | null = evt.target.valueAsDate
    if (inputTime === null) {
      return
    }

    let newTime: Date = new Date(props.time)
    newTime.setHours(inputTime.getUTCHours())
    newTime.setMinutes(inputTime.getUTCMinutes())
    newTime.setSeconds(inputTime.getUTCSeconds())
    newTime.setMilliseconds(inputTime.getUTCMilliseconds())
    props.onTimeChange(newTime)
  }
}

export default TimeCell;
export type { TimeCellProps };