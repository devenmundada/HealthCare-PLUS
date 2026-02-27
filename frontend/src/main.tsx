import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';  // Change this from Home to App
import 'leaflet/dist/leaflet.css';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />  {/* Change this from AuthProvider+Home to just App */}
  </React.StrictMode>
);