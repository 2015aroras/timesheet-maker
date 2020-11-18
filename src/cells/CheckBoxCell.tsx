import React from 'react';

type CheckBoxCellProps = {
  value: string,
  isChecked: boolean,
  onCheckedChange: React.Dispatch<boolean>
}

function CheckBoxCell(props: CheckBoxCellProps) {
  return (
    <input
      className="checkBoxCellInput"
      type="checkbox"
      value={props.value}
      onChange={updateCheckedFromInput}
      checked={props.isChecked}
    />
  );

  function updateCheckedFromInput(): void {
    props.onCheckedChange(!props.isChecked)
  }
}

export default CheckBoxCell;
export type { CheckBoxCell };