import React from 'react';

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  name,
  className = '',
  disabled = false,
  required = false,
}) => {
  const baseStyles = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed';

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      disabled={disabled}
      required={required}
      className={`${baseStyles} ${className}`}
    />
  );
};
