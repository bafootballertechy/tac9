import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded bg-[#c6ff1f] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#a0d600] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Install App
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded border border-[#333] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#222]"
        >
          Install App
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-sm rounded-xl bg-[#111] p-6 shadow-xl border border-[#333]">
              <h3 className="text-lg font-semibold text-white">Install on iPhone / iPad</h3>
              <p className="mt-2 text-sm text-gray-400">
                1. Tap the <strong className="text-white">Share</strong> button in Safari toolbar.<br />
                2. Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded bg-[#c6ff1f] py-2 text-sm font-semibold text-black hover:bg-[#a0d600]"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
