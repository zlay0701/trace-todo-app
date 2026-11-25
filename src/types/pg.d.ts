declare module 'pg' {
  export class Pool {
    constructor(config?: { connectionString?: string; [key: string]: unknown });
    query(...args: unknown[]): Promise<unknown>;
    connect(...args: unknown[]): Promise<unknown>;
    end(): Promise<void>;
  }
}
