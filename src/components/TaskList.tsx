'use client';

import React from 'react';
import { Task } from '@/types';
import { useTasks } from '@/contexts/TaskContext';
import TaskItem from './TaskItem';

const TaskList: React.FC = () => {
  const { state } = useTasks();
  const { tasks, filter } = state;

  // Filter tasks based on current filter settings
  const filteredTasks = tasks.filter((task) => {
    if (filter.category && task.category !== filter.category) {
      return false;
    }
    
    if (filter.tag && !task.tags.includes(filter.tag)) {
      return false;
    }
    
    if (filter.completed !== undefined && task.completed !== filter.completed) {
      return false;
    }
    
    if (filter.priority && task.priority !== filter.priority) {
      return false;
    }
    
    return true;
  });

  // Sort tasks by priority and due date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // First sort by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    // Then by due date (if both have due dates)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    // Tasks with due dates come first
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    // Finally by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-2">
      {sortedTasks.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-3">No tasks found</p>
          <p className="text-sm">Try adjusting your filters or add a new task</p>
        </div>
      ) : (
        sortedTasks.map((task) => <TaskItem key={task.id} task={task} />)
      )}
    </div>
  );
};

export default TaskList;