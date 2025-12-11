'use client';

import React, { useState } from 'react';
import { useTasks } from '@/contexts/TaskContext';
import { testWebDavConnection } from '@/utils/syncManager';

const WebDavConfig: React.FC = () => {
  const { state, setWebDavConfig } = useTasks();
  const { webDavConfig } = state;
  
  const [serverUrl, setServerUrl] = useState(webDavConfig.serverUrl);
  const [username, setUsername] = useState(webDavConfig.username);
  const [password, setPassword] = useState(webDavConfig.password);
  const [autoSync, setAutoSync] = useState(webDavConfig.autoSync);
  const [syncInterval, setSyncInterval] = useState(webDavConfig.syncInterval.toString());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSave = () => {
    const config = {
      serverUrl,
      username,
      password,
      enabled: !!serverUrl && !!username && !!password,
      autoSync,
      syncInterval: parseInt(syncInterval, 10) || 5,
    };
    
    setWebDavConfig(config);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const config = {
        serverUrl,
        username,
        password,
        enabled: true,
        autoSync,
        syncInterval: parseInt(syncInterval, 10) || 5,
      };
      
      const success = await testWebDavConnection(config);
      
      setTestResult({
        success,
        message: success 
          ? 'Connection successful!' 
          : 'Connection failed. Please check your settings.',
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">WebDAV Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Server URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="serverUrl"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="https://example.com/webdav"
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoSync"
            checked={autoSync}
            onChange={(e) => setAutoSync(e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="autoSync" className="text-sm text-gray-700">
            Enable auto-sync
          </label>
        </div>

        {autoSync && (
          <div>
            <label htmlFor="syncInterval" className="block text-sm font-medium text-gray-700 mb-1">
              Sync interval (minutes)
            </label>
            <input
              type="number"
              id="syncInterval"
              value={syncInterval}
              onChange={(e) => setSyncInterval(e.target.value)}
              min="1"
              max="60"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleTest}
            disabled={isTesting || !serverUrl || !username || !password}
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isTesting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </button>
          
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Save Settings
          </button>
        </div>

        {testResult && (
          <div className={`p-3 rounded-md ${testResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebDavConfig;