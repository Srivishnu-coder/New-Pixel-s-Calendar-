'use client';

import { useState, useEffect } from 'react';
import { Task, SubTask } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Calendar as CalIcon, AlertCircle, Plus, CheckCircle2, Circle, Trash2, Play, Square, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  theme: string;
  onUpdateTask?: (task: Task) => void;
}

export default function TaskModal({ task, onClose, theme, onUpdateTask }: TaskModalProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!task) return;
    let interval: NodeJS.Timeout;
    if (task.timerRunning && task.timerStartTime) {
      interval = setInterval(() => {
        setNow(Date.now());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [task?.timerRunning, task?.timerStartTime, task]);

  if (!task) return null;

  const liveTime = task.timerRunning && task.timerStartTime 
    ? (task.timeSpent || 0) + Math.floor((now - task.timerStartTime) / 1000)
    : (task.timeSpent || 0);

  const panelClass = theme === 'glass' ? 'glass-panel' : theme === 'natural' ? 'natural-panel' : theme === 'nebula' ? 'nebula-panel' : theme === 'cyberpunk' ? 'cyberpunk-panel' : 'paper-border bg-[var(--panel-bg)]';

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !onUpdateTask) return;

    const newSubtask: SubTask = {
      id: Math.random().toString(36).substring(2, 9),
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    onUpdateTask({
      ...task,
      subtasks: [...(task.subtasks || []), newSubtask],
    });
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    if (!onUpdateTask) return;
    onUpdateTask({
      ...task,
      subtasks: task.subtasks?.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      ),
    });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!onUpdateTask) return;
    onUpdateTask({
      ...task,
      subtasks: task.subtasks?.filter(st => st.id !== subtaskId),
    });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-lg p-6 relative ${panelClass} max-h-[90vh] overflow-y-auto`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--panel-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4 pr-8">
            <h2 className={`text-2xl font-bold text-[var(--text-main)] ${task.completed ? 'line-through opacity-70' : ''}`}>
              {task.title}
            </h2>
            {task.priority === 'high' && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
          </div>

          <div className="space-y-6">
            {task.description && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Description</h3>
                <p className="text-[var(--text-main)] leading-relaxed whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Status</h3>
                <div className="flex items-center gap-2 text-[var(--text-main)] flex-wrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${task.completed ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {task.completed ? 'Completed' : 'Active'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize priority-${task.priority}`}>
                    {task.priority} Priority
                  </span>
                  {task.category && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] capitalize">
                      {task.category}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Duration</h3>
                <div className="flex items-center gap-2 text-[var(--text-main)]">
                  <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                  <span>{task.duration} {task.duration === 1 ? 'hour' : 'hours'}</span>
                </div>
              </div>

              {task.dueDate && (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Due Date</h3>
                  <div className="flex items-center gap-2 text-[var(--text-main)]">
                    <CalIcon className="w-4 h-4 text-[var(--text-muted)]" />
                    <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              )}

              {task.date && (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Scheduled</h3>
                  <div className="flex items-center gap-2 text-[var(--text-main)]">
                    <CalIcon className="w-4 h-4 text-[var(--text-muted)]" />
                    <span>{format(new Date(task.date), 'MMM d, yyyy')} at {task.time === 12 ? '12 PM' : task.time && task.time > 12 ? `${task.time - 12} PM` : `${task.time} AM`}</span>
                  </div>
                </div>
              )}

              {(liveTime > 0 || task.timerRunning) && (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Time Spent</h3>
                  <div className="flex items-center gap-2 text-[var(--text-main)]">
                    {task.timerRunning ? <Play className="w-4 h-4 text-[var(--accent)] fill-current" /> : <Clock className="w-4 h-4 text-[var(--text-muted)]" />}
                    <span className={task.timerRunning ? 'text-[var(--accent)] font-bold' : ''}>{formatTime(liveTime)}</span>
                  </div>
                </div>
              )}

              {task.completedAt && (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Completed At</h3>
                  <div className="flex items-center gap-2 text-[var(--text-main)]">
                    <CheckSquare className="w-4 h-4 text-green-500" />
                    <span>{format(new Date(task.completedAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Subtasks Section */}
            <div className="border-t border-[var(--panel-border)] pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Subtasks</h3>
                {totalSubtasks > 0 && (
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    {completedSubtasks} / {totalSubtasks} ({progress}%)
                  </span>
                )}
              </div>

              {totalSubtasks > 0 && (
                <div className="w-full bg-[var(--panel-border)] h-1.5 rounded-full mb-4 overflow-hidden">
                  <div 
                    className="bg-[var(--accent)] h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 mb-4">
                <AnimatePresence>
                  {task.subtasks?.map((subtask) => (
                    <motion.div
                      key={subtask.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between group p-2 rounded hover:bg-[var(--panel-border)]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleSubtask(subtask.id)}
                          className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors shrink-0"
                        >
                          {subtask.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <span className={`text-sm truncate ${subtask.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'}`}>
                          {subtask.title}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteSubtask(subtask.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-red-500 transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {totalSubtasks === 0 && (
                  <p className="text-sm text-[var(--text-muted)] italic">No subtasks added yet.</p>
                )}
              </div>

              {onUpdateTask && (
                <form onSubmit={handleAddSubtask} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 p-2 text-sm rounded bg-[var(--panel-bg)] border border-[var(--panel-border)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    type="submit"
                    disabled={!newSubtaskTitle.trim()}
                    className="p-2 rounded bg-[var(--accent)] text-white disabled:opacity-50 hover:bg-[var(--accent-hover)] transition-colors shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
