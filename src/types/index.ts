export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebDavConfig {
  serverUrl: string;
  username: string;
  password: string;
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // in minutes
}

export interface SyncStatus {
  lastSyncTime?: string;
  status: 'idle' | 'syncing' | 'success' | 'error';
  error?: string;
}

export interface TaskState {
  tasks: Task[];
  categories: string[];
  tags: string[];
  filter: {
    category?: string;
    tag?: string;
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
  };
  webDavConfig: WebDavConfig;
  syncStatus: SyncStatus;
}

export type TaskAction =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'SET_FILTER'; payload: Partial<TaskState['filter']> }
  | { type: 'ADD_CATEGORY'; payload: string }
  | { type: 'ADD_TAG'; payload: string }
  | { type: 'SET_WEBDAV_CONFIG'; payload: WebDavConfig }
  | { type: 'SET_SYNC_STATUS'; payload: SyncStatus }
  | { type: 'SYNC_TASKS'; payload: Task[] };