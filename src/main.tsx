import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';

import './styles/index.css';
import App from './app';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <App />
    <Toaster richColors position="bottom-center" />
  </StrictMode>
);
