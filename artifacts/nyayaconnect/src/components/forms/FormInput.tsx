import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  icon?: LucideIcon;
  hint?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required,
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
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={cn(
            "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 font-sans transition-all duration-300 outline-none",
            "focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/30 focus:shadow-[0_0_15px_rgba(212,175,55,0.15)]",
            Icon ? "pl-11" : "",
            error ? "border-red-400/60 focus:border-red-400/60 focus:ring-red-400/30" : "",
          )}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-400 font-sans">{error}</span>}
      {!error && hint && <span className="text-xs text-gray-400 font-sans">{hint}</span>}
    </div>
  );
};

export default FormInput;