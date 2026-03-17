import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => {
  const colorMap = {
    blue: "from-blue-500/10 to-blue-600/5 text-blue-600 border-blue-200/50",
    emerald: "from-emerald-500/10 to-emerald-600/5 text-emerald-600 border-emerald-200/50",
    amber: "from-amber-500/10 to-amber-600/5 text-amber-600 border-amber-200/50",
    rose: "from-rose-500/10 to-rose-600/5 text-rose-600 border-rose-200/50",
    indigo: "from-indigo-500/10 to-indigo-600/5 text-indigo-600 border-indigo-200/50",
  };

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden p-6 rounded-3xl border bg-gradient-to-br shadow-sm",
        colorMap[color] || colorMap.blue
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</h3>
          
          {trendValue && (
            <div className="flex items-center mt-2 gap-1">
              <span className={cn(
                "text-xs font-bold px-1.5 py-0.5 rounded-md",
                trend === 'up' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              )}>
                {trend === 'up' ? '+' : '-'}{trendValue}%
              </span>
              <span className="text-xs opacity-60">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-sm",
          color === 'blue' && "text-blue-600",
          color === 'emerald' && "text-emerald-600",
          color === 'amber' && "text-amber-600",
          color === 'rose' && "text-rose-600",
        )}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      
      {/* Decorative background shape */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-current opacity-5 rounded-full blur-2xl" />
    </motion.div>
  );
};
