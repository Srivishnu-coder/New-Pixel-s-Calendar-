'use client';

import { Task, Theme } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'motion/react';
import { format, subDays, isSameDay } from 'date-fns';

interface AnalyticsProps {
  tasks: Task[];
  theme: Theme;
}

export default function Analytics({ tasks, theme }: AnalyticsProps) {
  const panelClass = theme === 'glass' ? 'glass-panel' : theme === 'natural' ? 'natural-panel' : theme === 'nebula' ? 'nebula-panel' : theme === 'cyberpunk' ? 'cyberpunk-panel' : 'paper-border';

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Priority distribution
  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#ef4444' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#eab308' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  // Category distribution
  const categoryData = [
    { name: 'Work', value: tasks.filter(t => t.category === 'work').length, color: '#8b5cf6' },
    { name: 'Personal', value: tasks.filter(t => t.category === 'personal').length, color: '#10b981' },
    { name: 'Health', value: tasks.filter(t => t.category === 'health').length, color: '#f43f5e' },
    { name: 'Learning', value: tasks.filter(t => t.category === 'learning').length, color: '#0ea5e9' },
    { name: 'Other', value: tasks.filter(t => !t.category || t.category === 'other').length, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  // Last 7 days completion trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      date: format(d, 'MMM dd'),
      completed: tasks.filter(t => t.completed && t.date && isSameDay(new Date(t.date), d)).length,
      added: tasks.filter(t => t.date && isSameDay(new Date(t.date), d)).length,
    };
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-[var(--text-main)]">Analytics Dashboard</h1>
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl bg-[var(--panel-bg)] ${panelClass} flex flex-col gap-2`}>
          <h3 className="text-[var(--text-muted)] font-medium uppercase tracking-wider text-sm">Total Tasks</h3>
          <p className="text-4xl font-bold text-[var(--text-main)]">{totalTasks}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`p-6 rounded-2xl bg-[var(--panel-bg)] ${panelClass} flex flex-col gap-2`}>
          <h3 className="text-[var(--text-muted)] font-medium uppercase tracking-wider text-sm">Completed</h3>
          <p className="text-4xl font-bold text-green-500">{completedTasks}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`p-6 rounded-2xl bg-[var(--panel-bg)] ${panelClass} flex flex-col gap-2`}>
          <h3 className="text-[var(--text-muted)] font-medium uppercase tracking-wider text-sm">Completion Rate</h3>
          <p className="text-4xl font-bold text-[var(--accent)]">{completionRate}%</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`p-6 rounded-2xl bg-[var(--panel-bg)] ${panelClass} h-[400px] flex flex-col`}>
          <h3 className="text-lg font-bold text-[var(--text-main)] mb-6">Last 7 Days Activity</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'var(--panel-border)', opacity: 0.5 }}
                  contentStyle={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px', color: 'var(--text-main)' }}
                />
                <Legend />
                <Bar dataKey="added" name="Tasks Added" fill="var(--text-muted)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Tasks Completed" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Distribution Charts */}
        <div className="flex flex-col gap-6 h-[400px]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`p-6 rounded-2xl bg-[var(--panel-bg)] ${panelClass} flex-1 flex flex-col`}>
            <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">Priority Distribution</h3>
            <div className="flex-1 min-h-0">
              {priorityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px', color: 'var(--text-main)' }} />
                    <Legend verticalAlign="middle" align="right" layout="vertical" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[var(--text-muted)]">No data</div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className={`p-6 rounded-2xl bg-[var(--panel-bg)] ${panelClass} flex-1 flex flex-col`}>
            <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">Category Distribution</h3>
            <div className="flex-1 min-h-0">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px', color: 'var(--text-main)' }} />
                    <Legend verticalAlign="middle" align="right" layout="vertical" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[var(--text-muted)]">No data</div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
