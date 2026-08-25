import React from 'react';
import { LucideIcon, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  options: FormSelectOption[];
  error?: string;
  icon?: LucideIcon;
  hint?: string;
  placeholder?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  required,
  placeholder,
  icon: Icon,
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
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={cn(
            "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white font-sans transition-all duration-300 outline-none appearance-none",
            "focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/30 focus:shadow-[0_0_15px_rgba(212,175,55,0.15)]",
            Icon ? "pl-11" : "",
            error ? "border-red-400/60 focus:border-red-400/60 focus:ring-red-400/30" : "",
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-[#102542] text-gray-500">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#102542] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37] pointer-events-none">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
      {error && <span className="text-xs text-red-400 font-sans">{error}</span>}
      {!error && hint && <span className="text-xs text-gray-400 font-sans">{hint}</span>}
    </div>
  );
};

export default FormSelect;