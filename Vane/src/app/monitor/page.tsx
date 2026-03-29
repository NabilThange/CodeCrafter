'use client';

import { useEffect } from 'react';

export default function MonitorPage() {
  useEffect(() => {
    // Get WorldMonitor URL - use tunnel URL if available, otherwise localhost
    const worldMonitorUrl = process.env.NEXT_PUBLIC_WORLDMONITOR_URL || 'http://localhost:5173';
    
    // If we're on a cloudflare domain, redirect to the WorldMonitor tunnel
    // Otherwise redirect to localhost
    const isCloudflare = window.location.hostname.includes('trycloudflare.com');
    const targetUrl = isCloudflare ? worldMonitorUrl : 'http://localhost:5173';
    
    window.location.href = targetUrl;
  }, []);

  const worldMonitorUrl = process.env.NEXT_PUBLIC_WORLDMONITOR_URL || 'http://localhost:5173';

  return (
    <div className="flex items-center justify-center h-screen bg-light-primary dark:bg-dark-primary">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto"></div>
        <p className="text-black/70 dark:text-white/70">
          Redirecting to World Monitor...
        </p>
        <p className="text-sm text-black/50 dark:text-white/50">
          If you're not redirected, <a href={worldMonitorUrl} className="underline">click here</a>
        </p>
      </div>
    </div>
  );
}
