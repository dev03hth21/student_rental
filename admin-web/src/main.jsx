import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

const splash = document.getElementById('initial-splash');
if (splash) {
  requestAnimationFrame(() => {
    splash.style.opacity = '0';
    splash.style.transition = 'opacity 180ms ease';
    setTimeout(() => splash.remove(), 220);
  });
}
