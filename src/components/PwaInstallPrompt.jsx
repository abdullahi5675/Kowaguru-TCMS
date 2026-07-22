"use client";

import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPromptEvent(e);
      // Show the customized install prompt
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If already installed, hide it
    window.addEventListener('appinstalled', () => {
      setIsVisible(false);
      setInstallPromptEvent(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) return;
    
    // Show the install prompt
    installPromptEvent.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPromptEvent.userChoice;
    
    // We no longer need the prompt. Clear it up
    setInstallPromptEvent(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-6 md:w-96 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-white dark:bg-zinc-800 shadow-2xl rounded-2xl border border-red-100 dark:border-zinc-700 p-4 flex items-start gap-4">
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-2.5 rounded-xl flex-shrink-0">
          <Download size={24} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Install Kowaguru TCMS App</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Install this app on your device for a faster, offline-capable, and full-screen experience.
          </p>
          
          <div className="mt-3 flex gap-2">
            <button 
              onClick={handleInstallClick}
              className="flex-1 bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-2 rounded-lg transition-colors"
            >
              Install Now
            </button>
            <button 
              onClick={handleDismiss}
              className="px-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-600 dark:text-gray-300 text-xs font-bold py-2 rounded-lg transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
        
        <button 
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
