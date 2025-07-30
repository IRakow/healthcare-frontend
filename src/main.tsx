// File: src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import App from './TestApp'; // TEMPORARY TEST
import { BrandingProvider } from '@/contexts/BrandingProvider';
import '@/styles/globals.css';

console.log('[main.tsx] React app starting...');

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

console.log('[main.tsx] About to render React app...');

root.render(
  <React.StrictMode>
    <BrandingProvider>
      <App />
    </BrandingProvider>
  </React.StrictMode>
);

console.log('[main.tsx] React render called');
