'use client';

import React from 'react';
import { useTasks } from '@/contexts/TaskContext';

const SyncStatus: React.FC = () => {
  const { state, syncTasks, loadTasks } = useTasks();
  const { syncStatus, webDavConfig } = state;

  const handleSync = async () => {
    await Promise.all([loadTasks(), syncTasks()]);
  };

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'syncing':
        return (
          <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'success':
        return (
          <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-4 w-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
    }
  };

  const getStatusText = () => {
    switch (syncStatus.status) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return syncStatus.lastSyncTime
          ? `Last synced: ${new Date(syncStatus.lastSyncTime).toLocaleString()}`
          : 'Synced successfully';
      case 'error':
        return `Error: ${syncStatus.error || 'Sync failed'}`;
      default:
        return webDavConfig.enabled ? 'Ready to sync' : 'WebDAV disabled';
    }
  };

  if (!webDavConfig.enabled) {
    return null;
  }

  return (
    <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center">
        <img
          src="https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/c55a69de6d344e398fca145eef5b9251~tplv-a9rns2rl98-image.image?rcl=20251209151130624BD4160BDAE38C5664&rk3s=8e244e95&rrcfp=f06b921b&x-expires=1767856304&x-signature=gslukEIhG34jVSDKye1d5DWEUKQ%3D"
          alt="WebDAV"
          className="h-6 w-6 mr-2"
        />
        <div className="flex items-center">
          {getStatusIcon()}
          <span className="text-sm text-gray-600">{getStatusText()}</span>
        </div>
      </div>
      <button
        onClick={handleSync}
        disabled={syncStatus.status === 'syncing'}
        className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {syncStatus.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
      </button>
    </div>
  );
};

export default SyncStatus;