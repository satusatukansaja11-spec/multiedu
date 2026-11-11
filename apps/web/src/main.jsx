import React from 'react';
import { createRoot } from 'react-dom/client';
import { OfficeAdventure } from './OfficeAdventure.jsx';
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OfficeAdventure />
  </React.StrictMode>,
);
