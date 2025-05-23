import React, { useState } from 'react';
import PropTypes from 'prop-types';

const PromptInput = ({
  value = '',
  onChange,
  placeholder = 'Describe your video...',
  label = '',
  showAdvanced = true,
  advancedOptions = [],
  onGenerate,
  generateText = 'Generate Video',
  disabled = false,
  className = ''
}) => {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (onChange) {
      onChange(e);
    }
  };

  const handleGenerateClick = () => {
    if (onGenerate) onGenerate(localValue);
  };

  return (
    <div className={`space-y-4  ${className}`}>
      {/* Label và Textarea */}
      <div>
        {label && (
          <label htmlFor="prompt-input" className="block text-sm font-medium text-white mb-2">
            {label}
          </label>
        )}
        <textarea
          id="prompt-input"
          rows={4}
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:border-blue-500 border-2 border-gray-600 resize-y transition-all duration-300 bg-gradient-to-br from-gray-900 to-gray-800 transition"
          disabled={disabled}
        />
      </div>

      {/* Advanced Options Toggle */}
      {showAdvanced && advancedOptions.length > 0 && (
        <div className="mt-2 flex items-center">
          <button
            type="button"
            onClick={() => setIsAdvanced(!isAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center focus:outline-none"
            disabled={disabled}
          >
            {isAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
            <svg
              className={`ml-1 h-4 w-4 transform ${isAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Advanced Options */}
      {isAdvanced && showAdvanced && advancedOptions.length > 0 && (
        <div className="mt-4 space-y-4 p-4  rounded-lg border border-gray-200">
          {advancedOptions.map((option) => (
            <div key={option.id}>
              <label className="block text-sm font-medium text-white mb-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-md px-3 py-2">{option.label}</label>
              {option.type === 'select' ? (
                <select
                  className="w-full border border-gray-300 bg-gradient-to-br from-gray-900 to-gray-800 rounded-md px-3 py-2"
                  value={option.value}
                  onChange={option.onChange}
                  disabled={disabled}
                >
                  {option.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : option.type === 'slider' ? (
                <div>
                  <input
                    type="range"
                    min={option.min}
                    max={option.max}
                    value={option.value}
                    onChange={option.onChange}
                    className="w-full bg-gradient-to-br from-gray-900 to-gray-800"
                    disabled={disabled}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1 bg-gradient-to-br from-gray-900 to-gray-800">
                    {option.labels?.map((label, idx) => (
                      <span key={idx}>{label}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <input
                  type={option.type || 'text'}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gradient-to-br from-gray-900 to-gray-800"
                  value={option.value}
                  onChange={option.onChange}
                  placeholder={option.placeholder}
                  disabled={disabled}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Generate Button */}
      {onGenerate && (
        <div className="flex justify-end">
          <button
            onClick={handleGenerateClick}
            disabled={disabled || !localValue.trim()}
            className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-medium ${
              disabled || !localValue.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            } transition`}
          >
            {generateText}
          </button>
        </div>
      )}
    </div>
  );
};

PromptInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  showAdvanced: PropTypes.bool,
  advancedOptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['text', 'select', 'slider', 'number']),
      value: PropTypes.any,
      onChange: PropTypes.func,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.any.isRequired,
          label: PropTypes.string.isRequired
        })
      ),
      min: PropTypes.number,
      max: PropTypes.number,
      labels: PropTypes.arrayOf(PropTypes.string),
      placeholder: PropTypes.string
    })
  ),
  onGenerate: PropTypes.func,
  generateText: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default PromptInput;