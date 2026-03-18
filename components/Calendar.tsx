'use client';

import { useDroppable } from '@dnd-kit/core';
import { Task, Theme } from '@/types';
import TaskItem from './TaskItem';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  tasks: Task[];
  theme: Theme;
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
  onToggleComplete: (id: string) => void;
  onToggleTimer?: (id: string) => void;
  onTaskClick: (task: Task) => void;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

function TimeSlot({ date, hour, tasks, theme, onToggleComplete, onToggleTimer, onTaskClick }: { date: Date; hour: number; tasks: Task[]; theme: Theme; onToggleComplete: (id: string) => void; onToggleTimer?: (id: string) => void; onTaskClick: (task: Task) => void }) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const id = `${dateStr}-${hour}`;
  
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { date: dateStr, time: hour }
  });

  return (
    <div 
      ref={setNodeRef}
      className={`min-h-[120px] h-full border-b border-r border-[var(--panel-border)] p-1.5 transition-all duration-300 flex flex-col gap-1.5 ${isOver ? 'bg-[var(--accent)]/20 shadow-inner' : ''}`}
    >
      <AnimatePresence>
        {tasks.map(task => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
            transition={{ duration: 0.2 }}
          >
            <TaskItem task={task} theme={theme} onToggleComplete={onToggleComplete} onToggleTimer={onToggleTimer} onClick={onTaskClick} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function Calendar({ tasks, theme, currentWeek, onWeekChange, onToggleComplete, onToggleTimer, onTaskClick }: CalendarProps) {
  const startDate = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start on Monday
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const panelClass = theme === 'glass' ? 'glass-panel' : theme === 'natural' ? 'natural-panel' : 'paper-border';

  return (
    <motion.div 
      className={`flex-1 flex flex-col h-full bg-[var(--panel-bg)] ${panelClass} overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--panel-border)] flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onWeekChange(addDays(currentWeek, -7))}
            className="p-2 rounded-full hover:bg-[var(--panel-border)] transition-colors text-[var(--text-main)]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-[var(--text-main)]">
            {format(startDate, 'MMMM yyyy')}
          </h2>
          <button 
            onClick={() => onWeekChange(addDays(currentWeek, 7))}
            className="p-2 rounded-full hover:bg-[var(--panel-border)] transition-colors text-[var(--text-main)]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button 
          onClick={() => onWeekChange(new Date())}
          className="px-4 py-2 rounded text-sm font-medium border border-[var(--panel-border)] text-[var(--text-main)] hover:bg-[var(--panel-border)] transition-colors"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto flex flex-col relative">
        <div className="min-w-[800px] flex flex-col h-full">
          {/* Days Header */}
          <div className="flex border-b border-[var(--panel-border)] sticky top-0 bg-[var(--panel-bg)]/90 backdrop-blur-md z-20">
            <div className="w-20 border-r border-[var(--panel-border)] shrink-0"></div>
            {days.map(day => {
              const isToday = isSameDay(day, new Date());
              return (
                <div key={day.toISOString()} className="flex-1 min-w-[100px] text-center py-3 border-r border-[var(--panel-border)]">
                  <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-lg mt-1 ${isToday ? 'w-8 h-8 mx-auto bg-[var(--accent)] text-white rounded-full flex items-center justify-center font-bold shadow-[0_0_10px_var(--accent)]' : 'text-[var(--text-main)]'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Grid */}
          <div className="flex flex-1 relative">
            {/* Time Labels */}
            <div className="w-20 border-r border-[var(--panel-border)] shrink-0 flex flex-col sticky left-0 bg-[var(--panel-bg)]/90 backdrop-blur-md z-10">
              {HOURS.map(hour => (
                <div key={hour} className="h-[120px] border-b border-[var(--panel-border)] flex items-center justify-center">
                  <span className="text-sm text-[var(--text-muted)] font-mono font-medium">
                    {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </span>
                </div>
              ))}
            </div>

            {/* Droppable Slots */}
            <div className="flex-1 flex">
              {days.map(day => (
                <div key={day.toISOString()} className="flex-1 min-w-[100px] flex flex-col">
                  {HOURS.map(hour => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const slotTasks = tasks.filter(t => t.date === dateStr && t.time === hour && !t.completed);
                    return (
                      <TimeSlot 
                        key={`${dateStr}-${hour}`} 
                        date={day} 
                        hour={hour} 
                        tasks={slotTasks} 
                        theme={theme} 
                        onToggleComplete={onToggleComplete}
                        onToggleTimer={onToggleTimer}
                        onTaskClick={onTaskClick}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
