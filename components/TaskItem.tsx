'use client';

import { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Task, Theme } from '@/types';
import { Clock, CheckCircle2, Circle, Edit2, Trash2, Play, Square } from 'lucide-react';
import { isToday, parseISO } from 'date-fns';

interface TaskItemProps {
  task: Task;
  theme: Theme;
  onToggleComplete?: (id: string) => void;
  onToggleTimer?: (id: string) => void;
  onClick?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

export default function TaskItem({ task, theme, onToggleComplete, onToggleTimer, onClick, onEdit, onDelete }: TaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (task.timerRunning && task.timerStartTime) {
      interval = setInterval(() => {
        setNow(Date.now());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [task.timerRunning, task.timerStartTime]);

  const liveTime = task.timerRunning && task.timerStartTime 
    ? (task.timeSpent || 0) + Math.floor((now - task.timerStartTime) / 1000)
    : (task.timeSpent || 0);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  const panelClass = theme === 'glass' ? 'glass-panel' : 
                     theme === 'natural' ? 'natural-panel' : 
                     theme === 'nebula' ? 'nebula-panel' :
                     theme === 'cyberpunk' ? 'cyberpunk-panel' : 'paper-panel';
  
  const priorityClass = task.priority ? `priority-${task.priority}` : '';
  
  const isDueToday = task.dueDate && isToday(parseISO(task.dueDate));
  const dueClass = isDueToday && task.priority === 'high' && !task.completed ? 'due-today-high' : '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onClick?.(task)}
      className={`relative group p-1.5 sm:p-2 cursor-grab active:cursor-grabbing bg-[var(--task-bg)] border ${task.timerRunning ? 'border-[var(--accent)] shadow-[0_0_10px_var(--accent)]' : 'border-[var(--task-border)]'} ${panelClass} ${theme === 'paper' ? 'paper-hover-effect' : ''} ${priorityClass} ${dueClass} ${task.completed ? 'opacity-60' : ''} w-full overflow-hidden flex flex-col gap-0.5`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-1.5 w-full">
        {onToggleComplete && (
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
            className="mt-0.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors shrink-0"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {task.completed ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Circle className="w-3.5 h-3.5" />}
          </button>
        )}

        <div className={`flex-1 min-w-0 ${task.completed ? 'line-through text-[var(--text-muted)]' : ''}`}>
          <h4 className="font-semibold text-[11px] sm:text-xs leading-tight text-[var(--text-main)] line-clamp-2 break-words" title={task.title}>{task.title}</h4>
          {task.description && (
            <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] mt-0.5 line-clamp-2 break-words leading-tight" title={task.description}>{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[9px] text-[var(--text-muted)] font-mono">
            <div className="flex items-center gap-0.5 shrink-0">
              <Clock className="w-2.5 h-2.5" />
              <span>{task.duration}h</span>
            </div>
            {task.category && (
              <div className="flex items-center gap-0.5 shrink-0 px-1 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] capitalize">
                <span>{task.category}</span>
              </div>
            )}
            {task.dueDate && (
              <div className={`flex items-center gap-0.5 shrink-0 ${isDueToday && !task.completed ? 'text-red-500 font-bold' : ''}`}>
                <span>Due: {task.dueDate.slice(5)}</span>
              </div>
            )}
            {liveTime > 0 && (
              <div className={`flex items-center gap-0.5 shrink-0 px-1 py-0.5 rounded ${task.timerRunning ? 'bg-[var(--accent)] text-white' : 'bg-[var(--panel-border)] text-[var(--text-main)]'}`}>
                <span>{formatTime(liveTime)}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Actions - only show when not dragging and if handlers provided */}
        {!isDragging && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 shrink-0 bg-[var(--panel-bg)]/80 backdrop-blur-md rounded p-0.5 absolute right-1 top-1 shadow-sm">
            {onToggleTimer && !task.completed && (
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleTimer(task.id); }}
                className={`p-1 transition-colors ${task.timerRunning ? 'text-red-500 hover:text-red-600' : 'text-[var(--text-muted)] hover:text-[var(--accent)]'}`}
                onPointerDown={(e) => e.stopPropagation()}
                title={task.timerRunning ? "Stop Timer" : "Start Timer"}
              >
                {task.timerRunning ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              </button>
            )}
            {onEdit && (
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
      
      {theme === 'paper' && (
        <div className="ancient-script top-0.5 right-1 rotate-12 text-lg">
          {task.title.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
