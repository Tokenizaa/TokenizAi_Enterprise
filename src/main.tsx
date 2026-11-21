import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { agencyCatalogService } from './services/agencyCatalogService';

declare global {
  interface Window {
    agencyCatalogService?: typeof agencyCatalogService;
  }
}
window.agencyCatalogService = agencyCatalogService;

createRoot(document.getElementById('root')!).render(<App />);
