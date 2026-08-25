import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface Step {
  label: string;
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, className }) => {
  return (
    <div className={cn("w-full flex items-center justify-between", className)}>
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;
        
        return (
          <div key={idx} className="flex-1 flex flex-col items-center relative group">
            {/* Connecting line */}
            {idx !== steps.length - 1 && (
              <div className="absolute top-5 left-1/2 w-full h-[2px] bg-white/10">
                <motion.div
                  className="h-full bg-[#D4AF37]"
                  initial={{ width: '0%' }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            )}
            
            {/* Step Circle */}
            <div
              className={cn(
                "relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 font-sans",
                isCompleted 
                  ? "bg-[#D4AF37] text-[#102542]" 
                  : isCurrent 
                    ? "bg-[#102542] border-2 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]" 
                    : "bg-[#102542] border-2 border-white/20 text-gray-500"
              )}
            >
              {isCompleted ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                  <Check className="w-5 h-5" />
                </motion.div>
              ) : (
                idx + 1
              )}
            </div>
            
            {/* Step Label */}
            <span
              className={cn(
                "mt-3 text-xs md:text-sm font-sans font-medium text-center transition-colors duration-300",
                isCurrent ? "text-white" : isCompleted ? "text-gray-300" : "text-gray-500"
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;