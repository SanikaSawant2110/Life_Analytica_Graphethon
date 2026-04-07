import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X, CheckCircle, AlertTriangle, Clock, Save, Trash2, Heart, Wind, Activity } from 'lucide-react';
import styles from './VoiceRecorder.module.css';

const API = 'http://localhost:5050/api';

const ZONE_COLORS = {
  rest:         { color: '#1A6BCC', bg: '#EBF4FF' },
  stress:       { color: '#DC2626', bg: '#FEE2E2' },
  exercise:     { color: '#D97706', bg: '#FEF3C7' },
  conversation: { color: '#6D28D9', bg: '#EDE9FE' },
  recovery:     { color: '#0891B2', bg: '#E0F7FA' },
};

export default function VoiceRecorder({ onClose }) {
  const [isRecording, setIsRecording]   = useState(false);
  const [transcript,  setTranscript]    = useState('');
  const [interimText, setInterimText]   = useState('');
  const [duration,    setDuration]      = useState(0);
  const [sessions,    setSessions]      = useState([]);
  const [saving,      setSaving]        = useState(false);
  const [savedResult, setSavedResult]   = useState(null);
  const [error,       setError]         = useState('');
  const [supported,   setSupported]     = useState(true);

  const recognitionRef = useRef(null);
  const timerRef       = useRef(null);
  const startTimeRef   = useRef(null);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsRecording(false);
    setInterimText('');
  }, []);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSupported(false);
    return () => stopRecording();
  }, [stopRecording]);

  const startRecording = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    setError('');
    setSavedResult(null);
    const recognition = new SR();
    recognition.continuous      = true;
    recognition.interimResults  = true;
    recognition.lang            = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      let final = ''; let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + ' ';
        else interim = t;
      }
      if (final) setTranscript(prev => prev + final);
      setInterimText(interim);
    };

    recognition.onerror = (e) => {
      if (e.error !== 'no-speech') {
        setError(`Microphone error: ${e.error}. Please allow mic access.`);
        stopRecording();
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current && isRecording) {
        try { recognition.start(); } catch (_) {}
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, [isRecording, stopRecording]);

  const handleSave = useCallback(async () => {
    const fullText = transcript.trim();
    if (!fullText) { setError('Nothing to save — record something first.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API}/transcripts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: fullText,
          duration,
          timestamp: new Date().toLocaleString('en-IN', { hour12: false }),
        })
      });
      const data = await res.json();
      if (data.success) {
        setSavedResult(data);
        setSessions(prev => [{
          transcript: fullText,
          duration,
          zone:       data.zone,
          keywords:   data.keywords,
          flag:       data.flag,
          timestamp:  data.timestamp,
          biometrics: data.biometrics,
          sensor_row: data.sensor_row,
        }, ...prev]);
        setTranscript('');
        setDuration(0);
      } else {
        setError(data.error || 'Save failed');
      }
    } catch (e) {
      setError('Could not reach backend — is Flask running?');
    }
    setSaving(false);
  }, [transcript, duration]);

  const handleDiscard = () => {
    stopRecording();
    setTranscript(''); setDuration(0); setSavedResult(null); setError('');
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  if (!supported) return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.unsupported}>
          <MicOff size={32} color="#DC2626" />
          <h3>Browser not supported</h3>
          <p>Web Speech API requires Chrome or Edge. Please open this page in Chrome.</p>
          <button className={styles.closeBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Mic size={16} color="#6D28D9" />
            <span>Voice Session Recorder</span>
          </div>
          <button className={styles.closeX} onClick={() => { stopRecording(); onClose(); }}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.recArea}>

            {/* Mic button */}
            <button
              className={`${styles.micBtn} ${isRecording ? styles.micActive : ''}`}
              onClick={isRecording ? stopRecording : startRecording}>
              {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
              {isRecording && <span className={styles.micRing} />}
            </button>

            <div className={styles.recStatus}>
              {isRecording
                ? <><span className={styles.recDot} /> Recording · {fmt(duration)}</>
                : transcript ? 'Recording paused — save or continue'
                : 'Click the mic to start speaking'}
            </div>

            {/* Transcript box */}
            <div className={styles.transcriptBox}>
              {transcript    && <span className={styles.finalText}>{transcript}</span>}
              {interimText   && <span className={styles.interimText}>{interimText}</span>}
              {!transcript && !interimText && (
                <span className={styles.placeholder}>Your words will appear here as you speak…</span>
              )}
            </div>

            {error && (
              <div className={styles.errorBanner}>
                <AlertTriangle size={13} /> {error}
              </div>
            )}

            {/* Save result with biometrics */}
            {savedResult && (
              <div className={styles.savedBanner}>
                <div className={styles.savedTop}>
                  <CheckCircle size={14} color="#16A34A" />
                  <strong>Saved to SensorLog &amp; VoiceTranscripts</strong>
                  <span className={styles.savedZone}
                    style={{
                      background: ZONE_COLORS[savedResult.zone]?.bg || '#F1F5F9',
                      color:      ZONE_COLORS[savedResult.zone]?.color || '#64748B',
                    }}>
                    {savedResult.zone}
                  </span>
                  {savedResult.flag === 'stress' && (
                    <span className={styles.stressFlag}>
                      <AlertTriangle size={11} /> Stress flagged
                    </span>
                  )}
                  {savedResult.sensor_row && (
                    <span className={styles.rowBadge}>Row {savedResult.sensor_row}</span>
                  )}
                </div>

                {/* Biometrics row */}
                {savedResult.biometrics && (
                  <div className={styles.bioRow}>
                    <div className={styles.bioChip} style={{ color: '#DC2626', background: '#FEE2E2' }}>
                      <Heart size={11} strokeWidth={2} />
                      {savedResult.biometrics.hr} bpm
                    </div>
                    <div className={styles.bioChip} style={{ color: '#1A6BCC', background: '#EBF4FF' }}>
                      <Wind size={11} strokeWidth={2} />
                      {savedResult.biometrics.spo2}%
                    </div>
                    <div className={styles.bioChip} style={{ color: '#0891B2', background: '#E0F7FA' }}>
                      <Activity size={11} strokeWidth={2} />
                      {savedResult.biometrics.temp}°C
                    </div>
                    <div className={styles.bioChip} style={{ color: '#6D28D9', background: '#EDE9FE' }}>
                      <Mic size={11} strokeWidth={2} />
                      {savedResult.biometrics.db} dB
                    </div>
                  </div>
                )}

                <div className={styles.savedKeywords}>Keywords: {savedResult.keywords}</div>
              </div>
            )}

            {transcript && (
              <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                  <Save size={14} />
                  {saving ? 'Saving…' : 'Save to Excel'}
                </button>
                <button className={styles.discardBtn} onClick={handleDiscard}>
                  <Trash2 size={14} /> Discard
                </button>
              </div>
            )}
          </div>

          {/* Session history */}
          {sessions.length > 0 && (
            <div className={styles.history}>
              <div className={styles.historyHead}>
                <Clock size={13} />
                Session Log ({sessions.length} entries)
              </div>
              {sessions.map((s, i) => {
                const zc = ZONE_COLORS[s.zone] || { color: '#64748B', bg: '#F1F5F9' };
                return (
                  <div key={i} className={styles.historyRow}>
                    <div className={styles.historyMeta}>
                      <span className={styles.historyTime}>{s.timestamp}</span>
                      <span className={styles.historyZone} style={{ background: zc.bg, color: zc.color }}>
                        {s.zone}
                      </span>
                      {s.flag === 'stress' && (
                        <span className={styles.historyStress}>
                          <AlertTriangle size={10} /> stress
                        </span>
                      )}
                      {s.biometrics && (
                        <span className={styles.historyBio}>
                          ♥ {s.biometrics.hr}bpm · {s.biometrics.spo2}%
                        </span>
                      )}
                      <span className={styles.historyDur}>{fmt(s.duration)}</span>
                    </div>
                    <div className={styles.historyText}>
                      {s.transcript.slice(0, 140)}{s.transcript.length > 140 ? '…' : ''}
                    </div>
                    {s.keywords && <div className={styles.historyKw}>Keywords: {s.keywords}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span>Saved to: <code>LifeAnalytica_SensorLog.xlsx</code> + <code>VoiceTranscripts.xlsx</code></span>
          <span>Chrome / Edge only</span>
        </div>
      </div>
    </div>
  );
}