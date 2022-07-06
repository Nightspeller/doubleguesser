import React, {ChangeEventHandler, useState} from 'react';
import './dg-input.css';

function DgInput({
                   label,
                   placeholder,
                   onChange,
                   value
                 }: { label?: string, placeholder?: string, onChange: ChangeEventHandler<HTMLInputElement>, value: string }) {
  return (
    <label className={"dgInput"}>
      {label}
      <input
        type={"text"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}

export default DgInput;
