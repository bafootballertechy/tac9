import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App';

const container = document.getElementById('root')!;
const globalWin = typeof window !== 'undefined' ? (window as any) : undefined;
const root = (globalWin && globalWin.__REACT_ROOT__) || createRoot(container);
if (globalWin && !globalWin.__REACT_ROOT__) {
  globalWin.__REACT_ROOT__ = root;
}
root.render(<App />);
