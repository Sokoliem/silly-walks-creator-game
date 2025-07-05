import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize audio system on first user interaction
let audioInitialized = false;
const initializeAudio = () => {
  if (!audioInitialized) {
    import('@/lib/audio').then(({ audioManager }) => {
      audioManager.initialize();
      audioInitialized = true;
    });
  }
};

// Add event listeners for first user interaction  
document.addEventListener('click', initializeAudio, { once: true });
document.addEventListener('keydown', initializeAudio, { once: true });
document.addEventListener('touchstart', initializeAudio, { once: true });

createRoot(document.getElementById("root")!).render(<App />);
