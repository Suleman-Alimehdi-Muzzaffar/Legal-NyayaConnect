import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FormRadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

export interface FormRadioGroupProps {
  label: string;
  name: string;
  options: FormRadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export const FormRadioGroup: React.FC<FormRadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  className
}) => {
  return (
    <div className={cn("w-full flex flex-col gap-3", className)}>
      <label className="block font-sans text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const Icon = opt.icon;
          return (
            <label
              key={opt.value}
              className={cn(
                "relative flex flex-col items-start p-4 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden",
                "bg-white/5 border backdrop-blur-xl",
                isSelected 
                  ? "border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]" 
                  : "border-white/10 hover:border-white/30 hover:bg-white/10"
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center gap-3 w-full mb-1 z-10">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-300",
                    isSelected ? "border-[#D4AF37]" : "border-gray-500"
                  )}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="w-2 h-2 rounded-full bg-[#D4AF37]"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {Icon && (
                  <Icon className={cn("w-5 h-5", isSelected ? "text-[#D4AF37]" : "text-gray-400")} />
                )}
                <span className={cn("font-sans font-medium", isSelected ? "text-white" : "text-gray-300")}>
                  {opt.label}
                </span>
              </div>
              {opt.description && (
                <p className="font-sans text-xs text-gray-400 ml-7 z-10">
                  {opt.description}
                </p>
              )}
              {isSelected && (
                <motion.div
                  layoutId={`${name}-highlight`}
                  className="absolute inset-0 bg-[#D4AF37]/5 z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </label>
          );
        })}
      </div>
      {error && <span className="text-xs text-red-400 font-sans">{error}</span>}
    </div>
  );
};

export default FormRadioGroup;