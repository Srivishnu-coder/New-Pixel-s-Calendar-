'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Task, Theme, Priority, Category } from '@/types';
import TaskItem from './TaskItem';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, ListTodo, CheckSquare, Filter } from 'lucide-react';

interface TaskPanelProps {
  tasks: Task[];
  theme: Theme;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onToggleTimer?: (id: string) => void;
  onTaskClick: (task: Task) => void;
}

export default function TaskPanel({ tasks, theme, onAddTask, onUpdateTask, onDeleteTask, onToggleComplete, onToggleTimer, onTaskClick }: TaskPanelProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned-tasks',
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(1);
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('work');
  const [dueDate, setDueDate] = useState('');
  
  const [filter, setFilter] = useState<'active' | 'completed'>('active');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<Category | 'all'>('all');
  const [historyPriorityFilter, setHistoryPriorityFilter] = useState<Priority | 'all'>('all');
  const [showHistoryFilters, setShowHistoryFilters] = useState(false);

  const unassignedTasks = tasks.filter((t) => {
    if (filter === 'active') {
      return !t.date && !t.completed;
    } else {
      // History view shows all completed tasks, even those with dates
      if (!t.completed) return false;
      if (historyCategoryFilter !== 'all' && t.category !== historyCategoryFilter) return false;
      if (historyPriorityFilter !== 'all' && t.priority !== historyPriorityFilter) return false;
      return true;
    }
  });

  const panelClass = theme === 'glass' ? 'glass-panel' : theme === 'natural' ? 'natural-panel' : theme === 'nebula' ? 'nebula-panel' : theme === 'cyberpunk' ? 'cyberpunk-panel' : 'paper-border';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      onUpdateTask({ ...editingTask, title, description, duration, priority, category, dueDate: dueDate || undefined });
    } else {
      onAddTask({ title, description, duration, priority, category, completed: false, dueDate: dueDate || undefined, subtasks: [] });
    }
    resetForm();
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setDuration(1);
    setPriority('medium');
    setCategory('work');
    setDueDate('');
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setDuration(task.duration);
    setPriority(task.priority);
    setCategory(task.category || 'work');
    setDueDate(task.dueDate || '');
    setIsAdding(true);
  };

  return (
    <motion.div 
      className={`w-80 flex flex-col h-full bg-[var(--panel-bg)] ${panelClass} overflow-hidden`}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="p-4 border-b border-[var(--panel-border)] flex justify-between items-center">
        <h2 className="text-xl font-bold text-[var(--text-main)]">Tasks</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="p-2 rounded-full bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex border-b border-[var(--panel-border)]">
        <button 
          onClick={() => setFilter('active')}
          className={`flex-1 py-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${filter === 'active' ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
        >
          <ListTodo className="w-4 h-4" /> Active
        </button>
        <button 
          onClick={() => setFilter('completed')}
          className={`flex-1 py-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${filter === 'completed' ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
        >
          <CheckSquare className="w-4 h-4" /> History
        </button>
      </div>

      {filter === 'completed' && (
        <div className="px-4 py-2 border-b border-[var(--panel-border)] flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setShowHistoryFilters(!showHistoryFilters)}
              className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <Filter className="w-3 h-3" /> Filters
            </button>
            {unassignedTasks.length > 0 && (
              <button
                onClick={() => {
                  unassignedTasks.forEach(t => onDeleteTask(t.id));
                }}
                className="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Clear Shown
              </button>
            )}
          </div>
          
          <AnimatePresence>
            {showHistoryFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex gap-2 overflow-hidden"
              >
                <select 
                  value={historyCategoryFilter}
                  onChange={(e) => setHistoryCategoryFilter(e.target.value as Category | 'all')}
                  className="flex-1 text-xs p-1 rounded bg-[var(--bg-color)] border border-[var(--panel-border)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] capitalize"
                >
                  <option value="all">All Categories</option>
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="health">Health</option>
                  <option value="learning">Learning</option>
                  <option value="other">Other</option>
                </select>
                <select 
                  value={historyPriorityFilter}
                  onChange={(e) => setHistoryPriorityFilter(e.target.value as Priority | 'all')}
                  className="flex-1 text-xs p-1 rounded bg-[var(--bg-color)] border border-[var(--panel-border)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] capitalize"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-[var(--panel-border)] bg-[var(--bg-color)]/50 overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-[var(--text-main)]">{editingTask ? 'Edit Task' : 'New Task'}</h3>
                <button type="button" onClick={resetForm} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 rounded bg-[var(--panel-bg)] border border-[var(--panel-border)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                autoFocus
              />
              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 rounded bg-[var(--panel-bg)] border border-[var(--panel-border)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] resize-none h-20"
              />
              <div className="flex gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs text-[var(--text-muted)]">Priority</label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full p-2 rounded bg-[var(--panel-bg)] border border-[var(--panel-border)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs text-[var(--text-muted)]">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full p-2 rounded bg-[var(--panel-bg)] border border-[var(--panel-border)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] capitalize"
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="health">Health</option>
                    <option value="learning">Learning</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs text-[var(--text-muted)]">Duration (hrs)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                    className="w-full p-2 rounded bg-[var(--panel-bg)] border border-[var(--panel-border)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs text-[var(--text-muted)]">Due Date (Optional)</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 rounded bg-[var(--panel-bg)] border border-[var(--panel-border)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 mt-2 rounded bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
              >
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-4 transition-colors ${isOver ? 'bg-[var(--accent)]/10' : ''}`}
      >
        {unassignedTasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm italic text-center">
            {filter === 'active' ? 'No active unassigned tasks.\nClick + to add one.' : 'No completed tasks yet.'}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {unassignedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2 }}
                >
                  <TaskItem 
                    task={task} 
                    theme={theme} 
                    onEdit={handleEdit}
                    onDelete={onDeleteTask}
                    onToggleComplete={onToggleComplete}
                    onToggleTimer={onToggleTimer}
                    onClick={onTaskClick}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
