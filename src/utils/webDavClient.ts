import { createClient, WebDAVClient } from 'webdav';
import { Task, WebDavConfig } from '@/types';

const TODO_FILE_NAME = 'tasks.json';

export class WebDavClientService {
  private client: WebDAVClient | null = null;

  configure(config: WebDavConfig): void {
    if (!config.serverUrl || !config.username || !config.password) {
      throw new Error('WebDAV configuration is incomplete');
    }

    this.client = createClient(config.serverUrl, {
      username: config.username,
      password: config.password,
      digest: false,
    });
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    if (!this.client) {
      throw new Error('WebDAV client not configured');
    }

    try {
      const tasksJson = JSON.stringify(tasks, null, 2);
      await this.client.putFileContents(TODO_FILE_NAME, tasksJson, {
        overwrite: true,
      });
    } catch (error) {
      console.error('Failed to save tasks to WebDAV:', error);
      throw new Error(`Failed to save tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async loadTasks(): Promise<Task[]> {
    if (!this.client) {
      throw new Error('WebDAV client not configured');
    }

    try {
      // Check if file exists
      const exists = await this.client.exists(TODO_FILE_NAME);
      if (!exists) {
        return [];
      }

      const tasksJson = await this.client.getFileContents(TODO_FILE_NAME, {
        format: 'text',
      }) as string;

      return JSON.parse(tasksJson);
    } catch (error) {
      console.error('Failed to load tasks from WebDAV:', error);
      throw new Error(`Failed to load tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) {
      throw new Error('WebDAV client not configured');
    }

    try {
      await this.client.getDirectoryContents('/');
      return true;
    } catch (error) {
      console.error('WebDAV connection test failed:', error);
      return false;
    }
  }
}

export const webDavClient = new WebDavClientService();