import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  children?: React.ReactNode;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  label,
  checked,
  onChange,
  error,
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
          <input
            type="checkbox"
            className="sr-only"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            {...props}
          />
          <div
            className={cn(
              "w-5 h-5 rounded border transition-all duration-300 flex items-center justify-center",
              checked 
                ? "bg-[#D4AF37] border-[#D4AF37]" 
                : "bg-white/5 border-white/20 group-hover:border-[#D4AF37]/50"
            )}
          >
            {checked && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <Check className="w-3.5 h-3.5 text-[#102542]" strokeWidth={3} />
              </motion.div>
            )}
          </div>
        </div>
        <div className="font-sans text-sm text-gray-300 select-none">
          {children || label}
        </div>
      </label>
      {error && <span className="text-xs text-red-400 font-sans ml-8">{error}</span>}
    </div>
  );
};

export default FormCheckbox;