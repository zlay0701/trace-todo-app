'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { TaskState, TaskAction, Task, WebDavConfig, SyncStatus } from '@/types';
import { syncTasksWithWebDav, loadTasksFromWebDav } from '@/utils/syncManager';

// Initial state
const initialState: TaskState = {
  tasks: [],
  categories: ['Personal', 'Work', 'Study', 'Other'],
  tags: [],
  filter: {},
  webDavConfig: {
    serverUrl: '',
    username: '',
    password: '',
    enabled: false,
    autoSync: false,
    syncInterval: 5,
  },
  syncStatus: {
    status: 'idle',
  },
};

// Reducer
const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask: Task = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        tasks: [...state.tasks, newTask],
      };
    }

    case 'UPDATE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : task
        ),
      };
    }

    case 'DELETE_TASK': {
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    }

    case 'TOGGLE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
            : task
        ),
      };
    }

    case 'SET_FILTER': {
      return {
        ...state,
        filter: { ...state.filter, ...action.payload },
      };
    }

    case 'ADD_CATEGORY': {
      if (state.categories.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };
    }

    case 'ADD_TAG': {
      if (state.tags.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        tags: [...state.tags, action.payload],
      };
    }

    case 'SET_WEBDAV_CONFIG': {
      return {
        ...state,
        webDavConfig: action.payload,
      };
    }

    case 'SET_SYNC_STATUS': {
      return {
        ...state,
        syncStatus: action.payload,
      };
    }

    case 'SYNC_TASKS': {
      // Only update tasks if they have changed
      const tasksHaveChanged = action.payload.length !== state.tasks.length || 
        action.payload.some((task, index) => JSON.stringify(task) !== JSON.stringify(state.tasks[index]));
      
      if (!tasksHaveChanged) {
        return state;
      }
      
      return {
        ...state,
        tasks: action.payload,
      };
    }

    default:
      return state;
  }
};

// Context
interface TaskContextType {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setFilter: (filter: Partial<TaskState['filter']>) => void;
  addCategory: (category: string) => void;
  addTag: (tag: string) => void;
  setWebDavConfig: (config: WebDavConfig) => void;
  syncTasks: () => Promise<void>;
  loadTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider
interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Load tasks from API on initial render only if user is logged in
  useEffect(() => {
    // We'll load tasks after user logs in, so we don't need to load them here
  }, []);

  // Load tasks from API
  const loadTasksFromApi = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SYNC_TASKS', payload: data.tasks });
      }
    } catch (error) {
      console.error('Error loading tasks from API:', error);
    }
  }, [dispatch]);

  // Auto-sync if enabled
  useEffect(() => {
    if (state.webDavConfig.enabled && state.webDavConfig.autoSync) {
      const interval = setInterval(() => {
        syncTasks();
      }, state.webDavConfig.syncInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [state.webDavConfig]);

  // Helper functions
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'ADD_TASK', payload: data.task });
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'UPDATE_TASK', payload: { id, updates: data.task } });
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        dispatch({ type: 'DELETE_TASK', payload: id });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleTask = async (id: string) => {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { completed: !task.completed });
    }
  };

  const setFilter = (filter: Partial<TaskState['filter']>) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const addCategory = (category: string) => {
    dispatch({ type: 'ADD_CATEGORY', payload: category });
  };

  const addTag = (tag: string) => {
    dispatch({ type: 'ADD_TAG', payload: tag });
  };

  const setWebDavConfig = (config: WebDavConfig) => {
    dispatch({ type: 'SET_WEBDAV_CONFIG', payload: config });
  };

  const syncTasks = async () => {
    if (!state.webDavConfig.enabled) return;

    dispatch({
      type: 'SET_SYNC_STATUS',
      payload: { status: 'syncing' },
    });

    try {
      await syncTasksWithWebDav(state.tasks, state.webDavConfig);
      dispatch({
        type: 'SET_SYNC_STATUS',
        payload: {
          status: 'success',
          lastSyncTime: new Date().toISOString(),
        },
      });
    } catch (error) {
      dispatch({
        type: 'SET_SYNC_STATUS',
        payload: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Sync failed',
        },
      });
    }
  };

  const loadTasks = useCallback(async () => {
    await loadTasksFromApi();
  }, [loadTasksFromApi]);

  const value = {
    state,
    dispatch,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    setFilter,
    addCategory,
    addTag,
    setWebDavConfig,
    syncTasks,
    loadTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

// Custom hook
export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};