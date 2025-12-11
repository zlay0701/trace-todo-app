import { Task, WebDavConfig } from '@/types';
import { webDavClient } from './webDavClient';

export async function syncTasksWithWebDav(tasks: Task[], config: WebDavConfig): Promise<void> {
  try {
    webDavClient.configure(config);
    await webDavClient.saveTasks(tasks);
  } catch (error) {
    console.error('WebDAV sync failed:', error);
    throw error;
  }
}

export async function loadTasksFromWebDav(config: WebDavConfig): Promise<Task[]> {
  try {
    webDavClient.configure(config);
    return await webDavClient.loadTasks();
  } catch (error) {
    console.error('WebDAV load failed:', error);
    throw error;
  }
}

export async function testWebDavConnection(config: WebDavConfig): Promise<boolean> {
  try {
    webDavClient.configure(config);
    return await webDavClient.testConnection();
  } catch (error) {
    console.error('WebDAV connection test failed:', error);
    return false;
  }
}

export function resolveConflicts(localTasks: Task[], remoteTasks: Task[]): Task[] {
  // Create a map of tasks by ID for easy lookup
  const localTaskMap = new Map(localTasks.map(task => [task.id, task]));
  const remoteTaskMap = new Map(remoteTasks.map(task => [task.id, task]));
  
  const resolvedTasks: Task[] = [];
  const processedIds = new Set<string>();
  
  // Process all tasks from both sources
  [...localTasks, ...remoteTasks].forEach(task => {
    if (processedIds.has(task.id)) return;
    processedIds.add(task.id);
    
    const localTask = localTaskMap.get(task.id);
    const remoteTask = remoteTaskMap.get(task.id);
    
    // If task exists only in one source, use that version
    if (!localTask) {
      resolvedTasks.push(remoteTask!);
      return;
    }
    
    if (!remoteTask) {
      resolvedTasks.push(localTask);
      return;
    }
    
    // If both exist, use the one with the later update time
    const localUpdateTime = new Date(localTask.updatedAt).getTime();
    const remoteUpdateTime = new Date(remoteTask.updatedAt).getTime();
    
    if (localUpdateTime >= remoteUpdateTime) {
      resolvedTasks.push(localTask);
    } else {
      resolvedTasks.push(remoteTask);
    }
  });
  
  return resolvedTasks;
}