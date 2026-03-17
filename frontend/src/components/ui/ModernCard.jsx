import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const Card = ({ children, className, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm hover:shadow-md transition-all",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className, ...props }) => (
  <div className={cn("px-6 py-4 border-b border-slate-100/60 dark:border-slate-800/60", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn("text-lg font-bold text-slate-900 dark:text-white", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className, ...props }) => (
  <p className={cn("text-sm text-slate-500 dark:text-slate-400 mt-1", className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={cn("px-6 py-4", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div className={cn("px-6 py-4 border-t border-slate-100/60 dark:border-slate-800/60", className)} {...props}>
    {children}
  </div>
);
