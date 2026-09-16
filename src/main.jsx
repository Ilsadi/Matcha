import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initTransport } from './services/transport.js';
import App from './App.jsx';

await initTransport();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);