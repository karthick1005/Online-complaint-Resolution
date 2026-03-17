import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
};

const toastVariants = {
  initial: { opacity: 0, y: 50, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

export const Notification = ({ type = 'info', message, description, onClose }) => {
  return (
    <motion.div
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl shadow-lg border backdrop-blur-md bg-white/90 dark:bg-slate-900/90 max-w-md w-full",
        type === 'success' && "border-green-100 dark:border-green-900",
        type === 'error' && "border-red-100 dark:border-red-900",
        type === 'info' && "border-blue-100 dark:border-blue-900",
        type === 'warning' && "border-amber-100 dark:border-amber-900"
      )}
    >
      <div className="mt-0.5">{icons[type]}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{message}</h4>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <X className="w-4 h-4 text-slate-400" />
      </button>
    </motion.div>
  );
};

export const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {notifications.map((notif) => (
          <Notification
            key={notif.id}
            {...notif}
            onClose={() => removeNotification(notif.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
