'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, rectIntersection } from '@dnd-kit/core';
import { Task, Theme } from '@/types';
import TaskPanel from '@/components/TaskPanel';
import Calendar from '@/components/Calendar';
import TaskItem from '@/components/TaskItem';
import TaskModal from '@/components/TaskModal';
import CustomCursor from '@/components/CustomCursor';
import Sidebar, { ViewType } from '@/components/Sidebar';
import Analytics from '@/components/Analytics';
import Settings from '@/components/Settings';

export default function Home() {
  const [theme, setTheme] = useState<Theme>('glass');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const savedTasks = localStorage.getItem('chronos-tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Failed to parse tasks', e);
      }
    }
    
    const savedTheme = localStorage.getItem('chronos-theme') as Theme;
    if (savedTheme && ['glass', 'natural', 'paper', 'nebula', 'cyberpunk'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('chronos-tasks', JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('chronos-theme', theme);
    }
  }, [theme, isMounted]);

  if (!isMounted) return null;

  const handleAddTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substring(2, 9),
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (selectedTask?.id === id) {
      setSelectedTask(null);
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const isCompleting = !t.completed;
        let newTimeSpent = t.timeSpent || 0;
        let newTimerRunning = t.timerRunning;
        let newTimerStartTime = t.timerStartTime;

        if (isCompleting && t.timerRunning && t.timerStartTime) {
          newTimeSpent += Math.floor((Date.now() - t.timerStartTime) / 1000);
          newTimerRunning = false;
          newTimerStartTime = undefined;
        }

        return { 
          ...t, 
          completed: isCompleting,
          completedAt: isCompleting ? new Date().toISOString() : undefined,
          timeSpent: newTimeSpent,
          timerRunning: newTimerRunning,
          timerStartTime: newTimerStartTime
        };
      }
      return t;
    }));
  };

  const handleToggleTimer = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        if (t.timerRunning) {
          // Stop timer
          const elapsed = t.timerStartTime ? Math.floor((Date.now() - t.timerStartTime) / 1000) : 0;
          return {
            ...t,
            timerRunning: false,
            timerStartTime: undefined,
            timeSpent: (t.timeSpent || 0) + elapsed
          };
        } else {
          // Start timer
          return {
            ...t,
            timerRunning: true,
            timerStartTime: Date.now()
          };
        }
      } else if (t.timerRunning) {
        // Stop other running timers
        const elapsed = t.timerStartTime ? Math.floor((Date.now() - t.timerStartTime) / 1000) : 0;
        return {
          ...t,
          timerRunning: false,
          timerStartTime: undefined,
          timeSpent: (t.timeSpent || 0) + elapsed
        };
      }
      return t;
    }));
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    
    if (over.id === 'unassigned-tasks') {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, date: undefined, time: undefined } : t));
    } else {
      // over.id is like "2023-10-25-14"
      const overIdStr = String(over.id);
      const parts = overIdStr.split('-');
      if (parts.length === 4) {
        const dateStr = `${parts[0]}-${parts[1]}-${parts[2]}`;
        const time = parseInt(parts[3], 10);
        
        setTasks(tasks.map(t => t.id === taskId ? { ...t, date: dateStr, time } : t));
      }
    }
  };

  const handleImportTasks = (importedTasks: Task[]) => {
    // Merge tasks, avoiding duplicates by ID
    const existingIds = new Set(tasks.map(t => t.id));
    const newTasks = importedTasks.filter(t => !existingIds.has(t.id));
    setTasks([...tasks, ...newTasks]);
  };

  const handleClearTasks = () => {
    setTasks([]);
  };

  return (
    <div className={`h-screen flex theme-${theme} relative overflow-hidden`}>
      <CustomCursor theme={theme} />
      {theme === 'glass' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center opacity-[0.03]">
          <h1 className="text-[15vw] font-bold text-white tracking-widest select-none">NEW PIXELS</h1>
        </div>
      )}
      {theme === 'nebula' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center opacity-[0.05]">
          <h1 className="text-[15vw] font-bold text-purple-300 tracking-widest select-none blur-sm">NEBULA</h1>
        </div>
      )}
      {theme === 'cyberpunk' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center opacity-[0.05]">
          <h1 className="text-[15vw] font-bold text-yellow-400 tracking-widest select-none">CYBERPUNK</h1>
        </div>
      )}
      
      <Sidebar currentView={currentView} onViewChange={setCurrentView} theme={theme} />

      <main className="flex-1 flex flex-col overflow-hidden z-10 relative">
        {currentView === 'dashboard' && (
          <div className="flex-1 flex overflow-hidden p-4 gap-4">
            <DndContext 
              onDragStart={handleDragStart} 
              onDragEnd={handleDragEnd}
              collisionDetection={rectIntersection}
            >
              <TaskPanel 
                tasks={tasks} 
                theme={theme} 
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onToggleComplete={handleToggleComplete}
                onToggleTimer={handleToggleTimer}
                onTaskClick={handleTaskClick}
              />
              <Calendar 
                tasks={tasks} 
                theme={theme} 
                currentWeek={currentWeek} 
                onWeekChange={setCurrentWeek} 
                onToggleComplete={handleToggleComplete}
                onToggleTimer={handleToggleTimer}
                onTaskClick={handleTaskClick}
              />
              
              <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                {activeTask ? (
                  <div className="opacity-90 scale-105 rotate-2 shadow-2xl shadow-black/20 cursor-grabbing">
                    <TaskItem task={activeTask} theme={theme} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        )}

        {currentView === 'analytics' && (
          <Analytics tasks={tasks} theme={theme} />
        )}

        {currentView === 'settings' && (
          <Settings 
            theme={theme} 
            onThemeChange={setTheme} 
            tasks={tasks}
            onImportTasks={handleImportTasks}
            onClearTasks={handleClearTasks}
          />
        )}
      </main>

      <TaskModal 
        task={selectedTask} 
        onClose={() => setSelectedTask(null)} 
        theme={theme} 
        onUpdateTask={handleUpdateTask}
      />
    </div>
  );
}
