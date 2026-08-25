import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FormPasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  name: string;
  error?: string;
  showStrengthMeter?: boolean;
}

export const FormPasswordInput: React.FC<FormPasswordInputProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  placeholder,
  showStrengthMeter = false,
  className,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const calculateStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strength = calculateStrength(String(value || ''));

  const strengthLabels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      <label htmlFor={name} className="block font-sans text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Lock className="w-5 h-5" />
        </div>
        <input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={cn(
            "w-full bg-white/5 border border-white/15 rounded-xl pl-11 pr-12 py-3 text-white placeholder:text-gray-500 font-sans transition-all duration-300 outline-none",
            "focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/30 focus:shadow-[0_0_15px_rgba(212,175,55,0.15)]",
            error ? "border-red-400/60 focus:border-red-400/60 focus:ring-red-400/30" : ""
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      
      {error && <span className="text-xs text-red-400 font-sans">{error}</span>}
      
      {showStrengthMeter && String(value || '').length > 0 && !error && (
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex gap-1 h-1.5 w-full">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  "flex-1 rounded-full transition-all duration-300",
                  level <= strength ? strengthColors[strength] : "bg-white/10"
                )}
              />
            ))}
          </div>
          <span className={cn("text-xs font-sans text-right", strengthColors[strength].replace('bg-', 'text-'))}>
            {strengthLabels[strength]}
          </span>
        </div>
      )}
    </div>
  );
};

export default FormPasswordInput;