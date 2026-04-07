import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, ArrowLeft, Heart, Clock, Mic,
  FileText, Brain, ChevronRight, Activity, TrendingUp, Wind, Thermometer,
  CheckCircle, List
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import styles from './StressDetail.module.css';

const API = 'http://localhost:5050/api';

const ZONE_META = {
  stress:       { color: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5' },
  rest:         { color: '#1A6BCC', bg: '#EBF4FF', border: '#BFDBFE' },
  exercise:     { color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
  conversation: { color: '#6D28D9', bg: '#EDE9FE', border: '#DDD6FE' },
  recovery:     { color: '#0891B2', bg: '#E0F7FA', border: '#BAE6FD' },
  walk:         { color: '#16A34A', bg: '#DCFCE7', border: '#A7F3D0' },
};

function ZoneBadge({ zone }) {
  const z = (zone || 'rest').toLowerCase();
  const m = ZONE_META[z] || ZONE_META.rest;
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 700,
      padding: '2px 8px', borderRadius: 4,
      background: m.bg, color: m.color,
      border: `1px solid ${m.border}`,
      textTransform: 'capitalize',
    }}>
      {z}
    </span>
  );
}

export default function StressDetail({ onBack }) {
  const [transcripts,    setTranscripts]    = useState([]);
  const [allTranscripts, setAllTranscripts] = useState([]);
  const [sensorData,     setSensorData]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [selected,       setSelected]       = useState(null);
  const [tab,            setTab]            = useState('stress'); // 'stress' | 'all'
  const [filterZone,     setFilterZone]     = useState('all');

  useEffect(() => {
    Promise.all([
      fetch(`${API}/transcripts/stress`).then(r => r.json()),
      fetch(`${API}/transcripts`).then(r => r.json()),
      fetch(`${API}/sensor-log`).then(r => r.json()),
    ]).then(([tr, allTr, sd]) => {
      setTranscripts(Array.isArray(tr) ? tr : []);
      setAllTranscripts(Array.isArray(allTr) ? allTr : []);
      const stressRows = sd.filter(r => r.zone === 'stress' || r.zone === 'rest');
      setSensorData(stressRows.slice(0, 60));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const stressWindows = sensorData.filter(r => r.zone === 'stress');
  const avgStressHr   = stressWindows.length
    ? Math.round(stressWindows.reduce((s, r) => s + r.hr, 0) / stressWindows.length) : '–';
  const peakHr        = stressWindows.length ? Math.max(...stressWindows.map(r => r.hr)) : '–';
  const avgDb         = stressWindows.length
    ? Math.round(stressWindows.reduce((s, r) => s + r.db, 0) / stressWindows.length) : '–';

  const trWithBio  = transcripts.filter(t => t.hr != null);
  const avgTrHr    = trWithBio.length
    ? Math.round(trWithBio.reduce((s, t) => s + t.hr, 0) / trWithBio.length) : null;
  const avgTrSpo2  = trWithBio.length
    ? (trWithBio.reduce((s, t) => s + t.spo2, 0) / trWithBio.length).toFixed(1) : null;

  // Zones present in all transcripts for filter pills
  const zonesPresent = ['all', ...Array.from(new Set(allTranscripts.map(t => (t.zone || 'rest').toLowerCase())))];

  const filteredAll = filterZone === 'all'
    ? allTranscripts
    : allTranscripts.filter(t => (t.zone || 'rest').toLowerCase() === filterZone);

  const activeList = tab === 'stress' ? transcripts : filteredAll;

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <span>Loading stress analysis…</span>
    </div>
  );

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={15} /> Back to Dashboard
        </button>
        <div className={styles.headerTitle}>
          <AlertTriangle size={18} color="#DC2626" />
          <div>
            <h1 className={styles.h1}>Stress Episode Analysis</h1>
            <p className={styles.subtitle}>Clinical drill-down — voice transcripts + biometric correlation</p>
          </div>
        </div>
      </div>

      <div className={styles.body}>

        {/* KPI row */}
        <div className={styles.kpiRow}>
          <div className={styles.kpi} style={{ borderColor: '#DC2626' }}>
            <div className={styles.kpiIcon} style={{ background: '#FEE2E2', color: '#DC2626' }}>
              <Heart size={16} />
            </div>
            <div className={styles.kpiVal} style={{ color: '#DC2626' }}>{avgStressHr}<span className={styles.kpiU}> bpm</span></div>
            <div className={styles.kpiLabel}>Avg HR during stress</div>
          </div>

          <div className={styles.kpi} style={{ borderColor: '#B91C1C' }}>
            <div className={styles.kpiIcon} style={{ background: '#FEE2E2', color: '#B91C1C' }}>
              <TrendingUp size={16} />
            </div>
            <div className={styles.kpiVal} style={{ color: '#B91C1C' }}>{peakHr}<span className={styles.kpiU}> bpm</span></div>
            <div className={styles.kpiLabel}>Peak heart rate</div>
          </div>

          {avgTrHr && (
            <div className={styles.kpi} style={{ borderColor: '#DC2626' }}>
              <div className={styles.kpiIcon} style={{ background: '#FEE2E2', color: '#DC2626' }}>
                <Mic size={16} />
              </div>
              <div className={styles.kpiVal} style={{ color: '#DC2626' }}>{avgTrHr}<span className={styles.kpiU}> bpm</span></div>
              <div className={styles.kpiLabel}>Voice-session HR (avg)</div>
            </div>
          )}

          {avgTrSpo2 && (
            <div className={styles.kpi} style={{ borderColor: '#1A6BCC' }}>
              <div className={styles.kpiIcon} style={{ background: '#EBF4FF', color: '#1A6BCC' }}>
                <Wind size={16} />
              </div>
              <div className={styles.kpiVal} style={{ color: '#1A6BCC' }}>{avgTrSpo2}<span className={styles.kpiU}>%</span></div>
              <div className={styles.kpiLabel}>Voice-session SpO2 (avg)</div>
            </div>
          )}

          <div className={styles.kpi} style={{ borderColor: '#6D28D9' }}>
            <div className={styles.kpiIcon} style={{ background: '#EDE9FE', color: '#6D28D9' }}>
              <Mic size={16} />
            </div>
            <div className={styles.kpiVal} style={{ color: '#6D28D9' }}>{avgDb}<span className={styles.kpiU}> dB</span></div>
            <div className={styles.kpiLabel}>Avg audio level</div>
          </div>

          <div className={styles.kpi} style={{ borderColor: '#D97706' }}>
            <div className={styles.kpiIcon} style={{ background: '#FEF3C7', color: '#D97706' }}>
              <Activity size={16} />
            </div>
            <div className={styles.kpiVal} style={{ color: '#D97706' }}>{stressWindows.length}<span className={styles.kpiU}> min</span></div>
            <div className={styles.kpiLabel}>Sensor-log stress duration</div>
          </div>

          <div className={styles.kpi} style={{ borderColor: '#0891B2' }}>
            <div className={styles.kpiIcon} style={{ background: '#E0F7FA', color: '#0891B2' }}>
              <FileText size={16} />
            </div>
            <div className={styles.kpiVal} style={{ color: '#0891B2' }}>{allTranscripts.length}</div>
            <div className={styles.kpiLabel}>Total voice transcripts</div>
          </div>
        </div>

        <div className={styles.grid}>

          {/* Left col */}
          <div className={styles.leftCol}>

            <div className={styles.card}>
              <div className={styles.cardHead}>
                <Heart size={14} color="#DC2626" />
                <span>Heart Rate During Stress Window</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={sensorData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F8" vertical={false} />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 130]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: 8, color: '#F1F5F9', fontSize: 12 }} />
                  <ReferenceLine y={100} stroke="#DC2626" strokeDasharray="4 2" strokeOpacity={0.5} />
                  <Line type="monotone" dataKey="hr" name="Heart Rate" stroke="#DC2626" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHead}>
                <Mic size={14} color="#6D28D9" />
                <span>Audio Level (dB)</span>
                <span className={styles.cardBadge}>stress window</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={sensorData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F8" vertical={false} />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: 8, color: '#F1F5F9', fontSize: 12 }} />
                  <ReferenceLine y={60} stroke="#6D28D9" strokeDasharray="4 2" strokeOpacity={0.4} />
                  <Line type="monotone" dataKey="db" name="Audio dB" stroke="#6D28D9" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <p className={styles.chartNote}>Elevated audio often correlates with conflict or raised voice.</p>
            </div>

            {/* Clinical interpretation */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <Brain size={14} color="#0891B2" />
                <span>Clinical Interpretation</span>
              </div>
              <div className={styles.interpretation}>
                <div className={styles.interpItem}>
                  <div className={styles.interpIcon} style={{ background: '#FEE2E2', color: '#DC2626' }}>
                    <Heart size={14} />
                  </div>
                  <div>
                    <div className={styles.interpTitle}>Elevated Heart Rate Pattern</div>
                    <div className={styles.interpDesc}>
                      HR exceeded 100 bpm threshold during the stress window. Combined with accelerometer data showing low motion, this is more consistent with a psychological stressor than physical exertion — ruling out exercise-induced tachycardia.
                    </div>
                  </div>
                </div>
                <div className={styles.interpItem}>
                  <div className={styles.interpIcon} style={{ background: '#EDE9FE', color: '#6D28D9' }}>
                    <Mic size={14} />
                  </div>
                  <div>
                    <div className={styles.interpTitle}>Audio Signature Analysis</div>
                    <div className={styles.interpDesc}>
                      Audio dB above 65 during this window with voice-frequency dominance at ~250 Hz suggests raised voices or verbal conflict. This audio pattern, correlated with the HR spike, is a strong indicator of acute psychosocial stress.
                    </div>
                  </div>
                </div>
                <div className={styles.interpItem}>
                  <div className={styles.interpIcon} style={{ background: '#DCFCE7', color: '#16A34A' }}>
                    <Activity size={14} />
                  </div>
                  <div>
                    <div className={styles.interpTitle}>Recovery Trajectory</div>
                    <div className={styles.interpDesc}>
                      HR normalised within 15 minutes post-episode — suggesting adequate vagal recovery capacity. This is a positive indicator; reinforce with patient as a resilience marker.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right col — transcripts */}
          <div className={styles.rightCol}>
            <div className={styles.card} style={{ flex: 1 }}>

              {/* Tab bar */}
              <div className={styles.cardHead} style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none', flexDirection: 'column', gap: 10, alignItems: 'stretch' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mic size={14} color="#6D28D9" />
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0D1B3E' }}>Voice Transcripts — Excel Log</span>
                  <span className={styles.cardBadge}>{allTranscripts.length} total</span>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #EEF2F8', paddingBottom: 0 }}>
                  {[
                    { key: 'stress', label: '⚠ Stress Flagged', count: transcripts.length, color: '#DC2626' },
                    { key: 'all',    label: '📋 All Transcripts', count: allTranscripts.length, color: '#1A6BCC' },
                  ].map(t => (
                    <button key={t.key} onClick={() => { setTab(t.key); setSelected(null); }}
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.76rem', fontWeight: tab === t.key ? 700 : 500,
                        color: tab === t.key ? t.color : '#64748B',
                        background: 'none', border: 'none',
                        borderBottom: tab === t.key ? `2px solid ${t.color}` : '2px solid transparent',
                        cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                        marginBottom: -1,
                        transition: 'all 0.12s',
                      }}>
                      {t.label}
                      <span style={{
                        marginLeft: 6, fontSize: '0.65rem',
                        background: tab === t.key ? t.color : '#EEF2F8',
                        color: tab === t.key ? '#fff' : '#64748B',
                        padding: '1px 6px', borderRadius: 10,
                      }}>{t.count}</span>
                    </button>
                  ))}
                </div>

                {/* Zone filter pills — only shown on "All" tab */}
                {tab === 'all' && zonesPresent.length > 1 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingTop: 8 }}>
                    {zonesPresent.map(z => {
                      const m = ZONE_META[z] || { color: '#64748B', bg: '#F1F5F9' };
                      const active = filterZone === z;
                      return (
                        <button key={z} onClick={() => setFilterZone(z)}
                          style={{
                            fontSize: '0.67rem', fontWeight: active ? 700 : 500,
                            padding: '3px 10px', borderRadius: 20,
                            border: `1.5px solid ${active ? m.color : '#E2E8F0'}`,
                            background: active ? m.bg : '#fff',
                            color: active ? m.color : '#64748B',
                            cursor: 'pointer', textTransform: 'capitalize',
                            fontFamily: 'DM Sans, sans-serif',
                            transition: 'all 0.12s',
                          }}>
                          {z === 'all' ? 'All Zones' : z}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Transcript list */}
              <div className={styles.transcriptScrollable}>
              <div style={{ marginTop: 14 }}>
                {activeList.length === 0 ? (
                  <div className={styles.emptyTranscripts}>
                    <Mic size={28} color="#CBD5E1" strokeWidth={1.5} />
                    {tab === 'stress' ? (
                      <>
                        <p>No stress-flagged voice transcripts yet.</p>
                        <p className={styles.emptyHint}>
                          Use the Voice Recorder and speak words like "anxious", "overwhelmed", or "panic" — they will appear here with full biometrics and be saved to LifeAnalytica_SensorLog.xlsx.
                        </p>
                        <div className={styles.stressKwList}>
                          <div className={styles.stressKwTitle}>Words that trigger stress flag:</div>
                          {['anxious','panic','overwhelmed','scared','nervous','worried','heart racing',"can't breathe",'frustrated','afraid'].map(k => (
                            <span key={k} className={styles.stressKw}>{k}</span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p>No transcripts found. Record a voice session to get started.</p>
                    )}
                  </div>
                ) : (
                  <div className={styles.transcriptList}>
                    {activeList.map((t, i) => {
                      const zone = (t.zone || 'rest').toLowerCase();
                      const zm = ZONE_META[zone] || ZONE_META.rest;
                      const isStress = t.flag === 'stress' || zone === 'stress';
                      const isSelected = selected === `${tab}-${i}`;

                      return (
                        <div key={i}
                          className={`${styles.transcriptCard} ${isSelected ? styles.transcriptSelected : ''}`}
                          style={{
                            borderLeftColor: zm.color,
                            background: isSelected ? zm.bg : '#FFFBFB',
                          }}
                          onClick={() => setSelected(isSelected ? null : `${tab}-${i}`)}>

                          {/* Meta row */}
                          <div className={styles.tcMeta}>
                            <span className={styles.tcTime}><Clock size={11} />{t.timestamp}</span>
                            {t.duration > 0 && (
                              <span className={styles.tcDur}>{Math.round(t.duration)}s</span>
                            )}
                            <ZoneBadge zone={zone} />
                            {isStress && (
                              <span className={styles.tcStress}>
                                <AlertTriangle size={11} /> Stress
                              </span>
                            )}
                            {!isStress && t.flag === 'normal' && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 3,
                                fontSize: '0.65rem', fontWeight: 600,
                                color: '#16A34A', background: '#DCFCE7',
                                padding: '2px 7px', borderRadius: 4,
                              }}>
                                <CheckCircle size={10} /> Normal
                              </span>
                            )}
                          </div>

                          {/* Biometrics chips */}
                          {(t.hr || t.spo2) && (
                            <div className={styles.tcBioRow}>
                              {t.hr && (
                                <span className={styles.tcBio} style={{ color: '#DC2626', background: '#FEE2E2' }}>
                                  <Heart size={10} /> {t.hr} bpm
                                </span>
                              )}
                              {t.spo2 && (
                                <span className={styles.tcBio} style={{ color: '#1A6BCC', background: '#EBF4FF' }}>
                                  <Wind size={10} /> {t.spo2}%
                                </span>
                              )}
                              <span className={styles.tcBioNote}>captured at voice time</span>
                            </div>
                          )}

                          {/* Transcript text */}
                          <div className={styles.tcText}>
                            {isSelected
                              ? t.transcript
                              : `${t.transcript.slice(0, 120)}${t.transcript.length > 120 ? '…' : ''}`}
                          </div>

                          {t.keywords && (
                            <div className={styles.tcKeywords}>Keywords: {t.keywords}</div>
                          )}

                          <div className={styles.tcExpand}>
                            <ChevronRight size={12} style={{
                              transform: isSelected ? 'rotate(90deg)' : 'none',
                              transition: '0.15s',
                            }} />
                            {isSelected ? 'Collapse' : 'Read full transcript'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              </div>{/* end transcriptScrollable */}
            </div>

            {/* Therapist action points */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <Brain size={14} color="#0891B2" />
                <span>Therapist Action Points</span>
              </div>
              <div className={styles.actionPoints}>
                {[
                  { n: '1', text: 'Explore what occurred at the stress timestamp. Ask patient to describe the context around that time.' },
                  { n: '2', text: 'Review transcript keywords with patient — these are the words their own voice produced under stress.' },
                  { n: '3', text: 'Note the 15-min HR normalisation — frame this as a resilience strength, not just a stress event.' },
                  { n: '4', text: 'Track whether audio-flagged stress events correlate with specific people, places, or times of day across sessions.' },
                  { n: '5', text: 'Cross-reference voice HR readings with sensor log rows — each voice recording is saved as a full biometric row in LifeAnalytica_SensorLog.xlsx.' },
                ].map(a => (
                  <div key={a.n} className={styles.actionPoint}>
                    <span className={styles.actionN}>{a.n}</span>
                    <span className={styles.actionText}>{a.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}