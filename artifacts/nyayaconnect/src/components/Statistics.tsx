import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const stats = [
  { value: 10000, suffix: '+', label: 'Verified Lawyers' },
  { value: 1000000, suffix: '+', label: 'Cases Solved', format: (v: number) => (v / 1000000).toFixed(1) + 'M' },
  { value: 500, suffix: '+', label: 'Cities Covered' },
  { value: 4.8, suffix: '/5', label: 'Average Rating', isFloat: true },
];

const Counter = ({ value, suffix, isFloat, format }: { value: number, suffix: string, isFloat?: boolean, format?: (v:number) => string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const duration = 2000; // ms
    const incrementTime = 20;
    const steps = duration / incrementTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, isInView]);

  const displayValue = format 
    ? format(count) 
    : isFloat 
      ? count.toFixed(1) 
      : Math.floor(count).toLocaleString();

  return (
    <div ref={ref} className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#D4AF37] mb-2 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
      {displayValue}{suffix}
    </div>
  );
};

const Statistics = () => {
  return (
    <section className="py-20 relative bg-gradient-to-r from-[#0a1a2e] to-[#102542] border-y border-[#D4AF37]/20">
      {/* Decorative Gold Elements */}
      <div className="absolute left-0 top-0 w-1/4 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
      <div className="absolute right-0 bottom-0 w-1/4 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
      
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x-0 md:divide-x divide-white/10">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              className="flex flex-col items-center justify-center p-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Counter 
                value={stat.value} 
                suffix={stat.suffix} 
                isFloat={stat.isFloat} 
                format={stat.format} 
              />
              <div className="font-sans text-sm md:text-base font-medium text-gray-300 uppercase tracking-wider mt-2">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;