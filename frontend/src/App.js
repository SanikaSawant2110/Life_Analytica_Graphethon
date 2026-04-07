import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
  Heart, Activity, Wind, Thermometer, Mic, Brain,
  AlertTriangle, CheckCircle, Clock, ChevronRight,
  RefreshCw, Cpu, User, FileText, BarChart2,
  GitBranch, TrendingUp, Shield, ArrowLeft, ExternalLink
} from 'lucide-react';
import styles from './App.module.css';

const API = 'http://localhost:5050/api';

const ZONE_META = {
  rest:         { label: 'Rest',         color: '#1A6BCC', bg: '#EBF4FF' },
  walk:         { label: 'Walk',         color: '#16A34A', bg: '#DCFCE7' },
  stress:       { label: 'Stress',       color: '#DC2626', bg: '#FEE2E2' },
  exercise:     { label: 'Exercise',     color: '#D97706', bg: '#FEF3C7' },
  recovery:     { label: 'Recovery',     color: '#0891B2', bg: '#E0F7FA' },
  conversation: { label: 'Conversation', color: '#6D28D9', bg: '#EDE9FE' },
};

function useFetch(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${API}${endpoint}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [endpoint]);
  return { data, loading };
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function NavBar({ onGoLanding, onOpenVoice }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.navBrand}>
        <button className={styles.navBack} onClick={onGoLanding}>
          <ArrowLeft size={13} />
        </button>
        <div className={styles.navLogoMark}>
          <Activity size={15} color="#4DA6FF" strokeWidth={2.5} />
        </div>
        <span className={styles.navLogo}>
          <span className={styles.navLogoBlue}>Life</span>Analytica
        </span>
        <span className={styles.navDivider} />
        <span className={styles.navTag}>Clinical Dashboard</span>
      </div>
      <div className={styles.navMeta}>
        <span className={styles.navChip}>
          <User size={11} />
          Patient: Demo Session
        </span>
        <span className={styles.navChip}>
          <Clock size={11} />
          09:00 – 11:00
        </span>
        <button className={styles.navVoiceBtn} onClick={onOpenVoice}>
          <Mic size={12} />
          Voice Session
        </button>
        <span className={styles.navChipAccent}>
          <Shield size={11} />
          IIT Madras
        </span>
      </div>
    </nav>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, unit, sub, color, bg, flagText, onClick }) {
  return (
    <div className={styles.kpi} style={{ '--accent': color, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}>
      <div className={styles.kpiTop}>
        <div className={styles.kpiIcon} style={{ background: bg, color }}>
          <Icon size={15} strokeWidth={2} />
        </div>
        {flagText && (
          <span className={styles.kpiFlagWarn}>
            <AlertTriangle size={10} />
            {flagText}
          </span>
        )}
        {onClick && <ExternalLink size={11} color="#94A3B8" style={{ marginLeft: 'auto' }} />}
      </div>
      <div className={styles.kpiValue} style={{ color }}>
        {value}<span className={styles.kpiUnit}>{unit}</span>
      </div>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiSub}>{sub}</div>
    </div>
  );
}

// ─── Zone Badge ───────────────────────────────────────────────────────────────
function ZoneBadge({ zone }) {
  const m = ZONE_META[zone] || { label: zone, color: '#64748B', bg: '#F1F5F9' };
  return (
    <span className={styles.zoneBadge} style={{ background: m.bg, color: m.color }}>
      {m.label}
    </span>
  );
}

// ─── Vitals Chart ─────────────────────────────────────────────────────────────
function VitalsChart({ data }) {
  if (!data) return <Skeleton h={260} />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#DC2626" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#1A6BCC" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#1A6BCC" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F8" vertical={false} />
        <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="hr"   domain={[50, 140]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="spo2" orientation="right" domain={[94, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: 8, color: '#F1F5F9', fontSize: 12, padding: '8px 12px' }} labelStyle={{ color: '#4DA6FF', fontFamily: 'DM Mono, monospace', marginBottom: 4 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
        <ReferenceLine yAxisId="hr" y={100} stroke="#DC2626" strokeDasharray="4 2" strokeOpacity={0.4} />
        <Area yAxisId="hr"   type="monotone" dataKey="hr"   name="Heart Rate (bpm)" stroke="#DC2626" fill="url(#hrGrad)"   strokeWidth={1.5} dot={false} />
        <Area yAxisId="spo2" type="monotone" dataKey="spo2" name="SpO2 (%)"         stroke="#1A6BCC" fill="url(#spo2Grad)" strokeWidth={1.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Audio / Motion Chart ─────────────────────────────────────────────────────
function AudioMotionChart({ data }) {
  if (!data) return <Skeleton h={200} />;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F8" vertical={false} />
        <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="db" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="ax" orientation="right" domain={[0, 2]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: 8, color: '#F1F5F9', fontSize: 12, padding: '8px 12px' }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
        <Line yAxisId="db" type="monotone" dataKey="db"   name="Audio dB"   stroke="#6D28D9" strokeWidth={1.5} dot={false} />
        <Line yAxisId="ax" type="monotone" dataKey="ax"   name="Motion (g)" stroke="#D97706" strokeWidth={1.5} dot={false} />
        <Line yAxisId="db" type="monotone" dataKey="temp" name="Temp (°C)"  stroke="#0891B2" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, warn }) {
  return (
    <div className={styles.statPill} data-warn={warn ? 'true' : 'false'}>
      <Icon size={12} strokeWidth={2} />
      <span className={styles.spLabel}>{label}</span>
      <span className={styles.spValue}>{value}</span>
    </div>
  );
}

// ─── Hourly Summary ───────────────────────────────────────────────────────────
function HourlySummaryCards({ data }) {
  if (!data) return <Skeleton h={160} />;
  return (
    <div className={styles.hourlyGrid}>
      {data.map((h, i) => (
        <div key={i} className={styles.hourlyCard}>
          <div className={styles.hourlyHeader}>
            <Clock size={13} color={i === 0 ? '#1A6BCC' : '#0891B2'} />
            <span className={styles.hourlyTitle}>{h.label}</span>
            <span className={styles.hourlyFlag} data-ok={h.flag === 'normal' ? 'true' : 'false'}>
              {h.flag === 'normal'
                ? <><CheckCircle size={11} /> Normal</>
                : <><AlertTriangle size={11} /> {h.flag.replace('_', ' ')}</>
              }
            </span>
          </div>
          <div className={styles.hourlyStats}>
            <StatPill icon={Heart}       label="Avg HR"  value={`${h.avg_hr} bpm`} warn={h.avg_hr > 90} />
            <StatPill icon={TrendingUp}  label="Max HR"  value={h.max_hr}           warn={h.max_hr > 100} />
            <StatPill icon={Wind}        label="SpO2"    value={`${h.avg_spo2}%`}   warn={h.avg_spo2 < 97} />
            <StatPill icon={Thermometer} label="Temp"    value={`${h.avg_temp}°C`}  warn={false} />
            <StatPill icon={Mic}         label="Audio"   value={`${h.avg_db} dB`}   warn={h.avg_db > 60} />
            <div className={styles.statPill}>
              <span className={styles.spLabel}>Zone</span>
              <ZoneBadge zone={h.dominant_zone} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Semantic Timeline ────────────────────────────────────────────────────────
function SemanticTimeline({ data, onGoStress }) {
  if (!data) return <Skeleton h={400} />;
  return (
    <div className={styles.timeline}>
      {data.map((seg, i) => {
        const m = ZONE_META[seg.zone] || {};
        const isStress = seg.zone === 'stress';
        return (
          <div key={i}
            className={styles.timelineRow}
            style={{
              '--zc': m.color || '#888',
              cursor: isStress ? 'pointer' : 'default',
              background: isStress ? '#FFF5F5' : undefined,
              border: isStress ? '1.5px solid #FCA5A5' : undefined,
              borderRadius: isStress ? 8 : undefined,
            }}
            onClick={isStress ? onGoStress : undefined}
            title={isStress ? 'Click to view voice transcripts for this stress episode' : undefined}
          >
            <div className={styles.tlLeft}>
              <span className={styles.tlTime}>{seg.window}</span>
              <ZoneBadge zone={seg.zone} />
              <span className={styles.tlHr}>
                <Heart size={11} />
                {seg.avg_hr} bpm
              </span>
              {isStress && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: '0.65rem', fontWeight: 600,
                  color: '#DC2626', background: '#FEE2E2',
                  padding: '2px 8px', borderRadius: 4,
                  marginTop: 4,
                }}>
                  <ExternalLink size={10} /> View Transcripts
                </span>
              )}
            </div>
            <div className={styles.tlRight}>
              <p className={styles.tlObs}>{seg.observation}</p>
              <p className={styles.tlNote}>
                <ChevronRight size={11} />
                {seg.note}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sensor Log Table ─────────────────────────────────────────────────────────
function SensorLogTable({ data }) {
  const [page, setPage] = useState(0);
  const PER_PAGE = 20;
  if (!data) return <Skeleton h={400} />;
  const slice = data.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const pages = Math.ceil(data.length / PER_PAGE);
  return (
    <div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {['Time','Zone','HR','SpO2','Temp','Ax','Ay','Az','Gx','dB','Freq','Flag'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => (
              <tr key={i}
                className={r.flag !== 'normal' ? styles.trFlagged : i % 2 === 0 ? styles.trStripe : ''}>
                <td className={styles.tdMono}>{r.timestamp}</td>
                <td><ZoneBadge zone={r.zone} /></td>
                <td className={styles.tdNum} style={{ color: r.hr > 100 ? '#DC2626' : undefined, fontWeight: r.hr > 100 ? 600 : 400 }}>{r.hr}</td>
                <td className={styles.tdNum} style={{ color: r.spo2 < 97 ? '#D97706' : '#16A34A', fontWeight: 600 }}>{r.spo2}</td>
                <td className={styles.tdMono}>{r.temp}</td>
                <td className={styles.tdMono}>{r.ax}</td>
                <td className={styles.tdMono}>{r.ay}</td>
                <td className={styles.tdMono}>{r.az}</td>
                <td className={styles.tdMono}>{r.gx}</td>
                <td className={styles.tdMono}>{r.db}</td>
                <td className={styles.tdMono}>{r.freq}</td>
                <td>
                  <span className={r.flag === 'normal' ? styles.flagOk : styles.flagWarn}>
                    {r.flag === 'normal'
                      ? <><CheckCircle size={11} /> normal</>
                      : <><AlertTriangle size={11} /> {r.flag.replace('_', ' ')}</>
                    }
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.pagination}>
        <span className={styles.pageInfo}>
          Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, data.length)} of {data.length} rows
        </span>
        <div className={styles.pageBtns}>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={i === page ? styles.pageActive : styles.pageBtn}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AI Summary ───────────────────────────────────────────────────────────────
function AISummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource]   = useState('');

  const generate = useCallback(() => {
    setLoading(true);
    fetch(`${API}/ai-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
      .then(r => r.json())
      .then(d => { setSummary(d.summary); setSource(d.source); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { generate(); }, [generate]);

  const lines = summary ? summary.split('\n') : [];

  return (
    <div className={styles.aiBox}>
      <div className={styles.aiHeader}>
        <Brain size={14} />
        <span>AI Clinical Report</span>
        <span className={styles.aiSource}>
          {source === 'gemini' ? 'Gemini 1.5 Flash' : 'Clinical Template'}
        </span>
        <button className={styles.regenBtn} onClick={generate} disabled={loading}>
          <RefreshCw size={12} className={loading ? styles.spin : ''} />
          {loading ? 'Generating…' : 'Regenerate'}
        </button>
      </div>
      {loading ? (
        <div className={styles.aiLoading}>
          {[100, 82, 68, 90, 55].map((w, i) => (
            <div key={i} className={styles.pulse} style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      ) : (
        <div className={styles.aiContent}>
          {lines.map((line, i) => {
            if (line.startsWith('##')) return (
              <h4 key={i} className={styles.aiSection}>{line.replace(/^#+\s*/, '')}</h4>
            );
            if (line.match(/^[-•]\s/)) return (
              <div key={i} className={styles.aiItem}
                dangerouslySetInnerHTML={{ __html: line.replace(/^[-•]\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            );
            if (line.trim() === '') return <div key={i} style={{ height: 8 }} />;
            return (
              <p key={i} className={styles.aiPara}
                dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const HOW_CARDS = [
  { icon: Mic,         color: '#6D28D9', bg: '#EDE9FE', title: 'MEMS / PDM Audio',      desc: 'Studio-grade microphone array captures ambient sound, voice, and silence. Diarization identifies patient vs. other voices. Audio dB and dominant frequency reveal emotional tone and conflict without storing raw audio.' },
  { icon: Heart,       color: '#DC2626', bg: '#FEE2E2', title: 'Biometric Stream',       desc: 'Continuous heart rate (PPG), SpO₂, and skin temperature logged per-minute. Stress spikes, exercise response, and recovery curves identified through inter-beat interval analysis and multi-signal correlation.' },
  { icon: Activity,    color: '#D97706', bg: '#FEF3C7', title: 'Accelerometer / IMU',    desc: '3-axis acceleration and gyroscope detect posture, movement type (rest, walk, run), tremor, and agitation. Motion patterns fused with biometrics to distinguish exercise-HR from anxiety-HR.' },
  { icon: Brain,       color: '#0891B2', bg: '#E0F7FA', title: 'Gemini AI Synthesis',    desc: 'All sensor streams are fused and semantically labeled. The AI generates human-readable clinical observations, identifies behavioural patterns, and produces therapist-ready recommendations.' },
];

function Skeleton({ h = 80 }) {
  return <div className={styles.skeleton} style={{ height: h }} />;
}

const TABS = [
  { id: 'overview', label: 'Overview',          icon: BarChart2 },
  { id: 'timeline', label: 'Semantic Timeline',  icon: GitBranch },
  { id: 'log',      label: 'Raw Sensor Log',     icon: FileText  },
  { id: 'ai',       label: 'AI Clinical Report', icon: Brain     },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function App({ onGoLanding, onGoStress, onOpenVoice }) {
  const { data: vitalsData }   = useFetch('/vitals-chart');
  const { data: semanticData } = useFetch('/semantic-timeline');
  const { data: hourlyData }   = useFetch('/hourly-summary');
  const { data: logData }      = useFetch('/sensor-log');
  const [tab, setTab] = useState('overview');

  const avgHr    = vitalsData ? Math.round(vitalsData.reduce((s, r) => s + r.hr,   0) / vitalsData.length) : '–';
  const avgSpo2  = vitalsData ? (vitalsData.reduce((s, r) => s + r.spo2, 0) / vitalsData.length).toFixed(1) : '–';
  const avgTemp  = vitalsData ? (vitalsData.reduce((s, r) => s + r.temp, 0) / vitalsData.length).toFixed(2) : '–';
  const avgDb    = vitalsData ? Math.round(vitalsData.reduce((s, r) => s + r.db,   0) / vitalsData.length) : '–';
  const maxHr    = vitalsData ? Math.max(...vitalsData.map(r => r.hr)) : '–';
  const stressEv = logData    ? logData.filter(r => r.zone === 'stress').length : '–';

  return (
    <div className={styles.app}>
      <NavBar onGoLanding={onGoLanding} onOpenVoice={onOpenVoice} />

      <div className={styles.kpiStrip}>
        <KpiCard icon={Heart}         label="Avg Heart Rate"    value={avgHr}    unit=" bpm" sub={`Peak ${maxHr} bpm`}              color="#DC2626" bg="#FEE2E2" flagText={maxHr > 100 ? 'Elevated' : null} />
        <KpiCard icon={Wind}          label="Blood Oxygen"      value={avgSpo2}  unit="%"    sub="Avg SpO2 over session"             color="#1A6BCC" bg="#EBF4FF" />
        <KpiCard icon={Thermometer}   label="Skin Temperature"  value={avgTemp}  unit="°C"   sub="Avg over 2 hours"                  color="#0891B2" bg="#E0F7FA" />
        <KpiCard icon={Mic}           label="Audio Level"       value={avgDb}    unit=" dB"  sub="MEMS microphone array"             color="#6D28D9" bg="#EDE9FE" flagText={avgDb > 55 ? 'Elevated' : null} />
        <KpiCard icon={AlertTriangle} label="Stress Duration"   value={stressEv} unit=" min" sub="Click to view transcripts"  color="#D97706" bg="#FEF3C7" onClick={onGoStress} />
        <KpiCard icon={CheckCircle}   label="Session Status"    value="Active"   unit=""     sub="2-hour continuous monitoring"      color="#16A34A" bg="#DCFCE7" />
      </div>

      <div className={styles.tabBar}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={tab === t.id ? styles.tabActive : styles.tabBtn}>
            <t.icon size={13} strokeWidth={2} />
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>

        {tab === 'overview' && (
          <>
            <div className={styles.twoCol}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <Heart size={14} color="#DC2626" />
                  <span>Heart Rate &amp; SpO2</span>
                  <span className={styles.cardBadge}>Full 2-hour session</span>
                </div>
                <VitalsChart data={vitalsData} />
                <p className={styles.chartNote}>Red: Heart Rate · Blue: SpO₂ · Dashed = 100 bpm threshold</p>
              </div>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <Mic size={14} color="#6D28D9" />
                  <span>Audio, Motion &amp; Temperature</span>
                  <span className={styles.cardBadge}>Sensor fusion</span>
                </div>
                <AudioMotionChart data={vitalsData} />
                <p className={styles.chartNote}>Purple: Audio dB · Amber: Motion (g) · Teal: Skin temp</p>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHead}>
                <Clock size={14} color="#1A6BCC" />
                <span>Hourly Clinical Summary</span>
              </div>
              <HourlySummaryCards data={hourlyData} />
            </div>

            <div className={styles.card}>
              <div className={styles.cardHead}>
                <Cpu size={14} color="#D97706" />
                <span>Sensor Fusion — How It Works</span>
              </div>
              <div className={styles.howGrid}>
                {HOW_CARDS.map((h, i) => (
                  <div key={i} className={styles.howCard}>
                    <div className={styles.howIconWrap} style={{ background: h.bg, color: h.color }}>
                      <h.icon size={18} strokeWidth={1.5} />
                    </div>
                    <div className={styles.howTitle}>{h.title}</div>
                    <div className={styles.howDesc}>{h.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'timeline' && (
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <GitBranch size={14} color="#1A6BCC" />
              <span>Semantic Behavioral Timeline</span>
              <span className={styles.cardBadge}>09:00 – 11:00 · 8 windows</span>
              <button
                onClick={onGoStress}
                style={{
                  marginLeft: 'auto',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 13px',
                  background: '#FEE2E2', color: '#DC2626',
                  border: '1px solid #FCA5A5', borderRadius: 6,
                  fontSize: '0.75rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                }}>
                <AlertTriangle size={12} /> View Voice Transcripts
              </button>
            </div>
            <p className={styles.sectionDesc}>
              Each 15-minute window is inferred from fused sensor data — not self-reported. This gives clinicians an objective, continuous behavioural diary to complement patient recall.
              <strong style={{ color: '#DC2626' }}> Click any stress row to drill into voice transcripts.</strong>
            </p>
            <SemanticTimeline data={semanticData} onGoStress={onGoStress} />
          </div>
        )}

        {tab === 'log' && (
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <FileText size={14} color="#1A6BCC" />
              <span>Raw Sensor Log</span>
              <span className={styles.cardBadge}>120 rows · 12 channels</span>
            </div>
            <p className={styles.sectionDesc}>
              Per-minute data from all four sensor subsystems: MEMS audio, biometrics (HR / SpO₂ / Temp), accelerometer (X/Y/Z), and gyroscope (X/Y/Z). Flagged rows are highlighted.
            </p>
            <SensorLogTable data={logData} />
          </div>
        )}

        {tab === 'ai' && (
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <Brain size={14} color="#6D28D9" />
              <span>AI-Generated Clinical Report</span>
              <span className={styles.cardBadge}>Powered by Gemini</span>
            </div>
            <p className={styles.sectionDesc}>
              Gemini 1.5 Flash analyses session statistics and produces a structured clinical summary suitable for a therapist or psychiatrist. Set <code>GEMINI_API_KEY</code> to enable live generation.
            </p>
            <AISummary />
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <span>LifeAnalytica · Pre-Incubated at Nirmaan IIT Madras</span>
        <span>Clinical use only · Not a replacement for professional diagnosis</span>
      </footer>
    </div>
  );
}