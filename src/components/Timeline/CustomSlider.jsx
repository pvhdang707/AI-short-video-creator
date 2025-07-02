import React from "react";

const CustomSlider = ({ min, max, step, value, onChange, className = "", ...rest }) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className={`slider ${className}`}
      {...rest}
      style={{
        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - min) / (max - min)) * 100}%, #374151 ${((value - min) / (max - min)) * 100}%, #374151 100%)`,
        ...rest.style,
      }}
    />
  );
};

export default CustomSlider; 