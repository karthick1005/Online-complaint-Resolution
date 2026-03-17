import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const variants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
  secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100",
  outline: "border-2 border-slate-200 hover:border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/50",
  ghost: "bg-transparent hover:bg-slate-100/10 text-slate-600 dark:text-slate-400 hover:dark:bg-slate-800",
  danger: "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20",
  success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20",
}

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3.5 text-base rounded-2xl",
  icon: "p-2 rounded-xl aspect-square flex items-center justify-center",
}

export const ModernButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  isLoading, 
  disabled, 
  icon: Icon,
  ...props 
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || isLoading}
      className={cn(
        "relative font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {Icon && <Icon className={cn(size === 'sm' ? "w-4 h-4" : "w-5 h-5")} />}
          {children}
        </>
      )}
    </motion.button>
  );
};
