import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import LandingPage   from './LandingPage';
import App           from './App';
import VoiceRecorder from './VoiceRecorder';
import StressDetail  from './StressDetail';
import './index.css';

function Root() {
  // page: 'landing' | 'dashboard' | 'stress'
  const [page,          setPage]          = useState('landing');
  const [voiceOpen,     setVoiceOpen]     = useState(false);

  return (
    <>
      {page === 'landing' && (
        <LandingPage
          onEnterDashboard={() => setPage('dashboard')}
          onOpenVoice={() => setVoiceOpen(true)}
        />
      )}

      {page === 'dashboard' && (
        <App
          onGoLanding={() => setPage('landing')}
          onGoStress={()  => setPage('stress')}
          onOpenVoice={()  => setVoiceOpen(true)}
        />
      )}

      {page === 'stress' && (
        <StressDetail onBack={() => setPage('dashboard')} />
      )}

      {voiceOpen && (
        <VoiceRecorder onClose={() => setVoiceOpen(false)} />
      )}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
