import React from 'react';
import { cn } from '../../lib/utils';

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  required,
  rows = 4,
  maxLength,
  hint,
  className,
  ...props
}) => {
  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      <label htmlFor={name} className="block font-sans text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 font-sans transition-all duration-300 outline-none resize-y",
            "focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/30 focus:shadow-[0_0_15px_rgba(212,175,55,0.15)]",
            error ? "border-red-400/60 focus:border-red-400/60 focus:ring-red-400/30" : "",
          )}
          {...props}
        />
        {maxLength && (
          <div className="absolute bottom-3 right-3 text-xs text-gray-500 font-sans">
            {String(value || '').length}/{maxLength}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-400 font-sans">{error}</span>}
      {!error && hint && <span className="text-xs text-gray-400 font-sans">{hint}</span>}
    </div>
  );
};

export default FormTextarea;