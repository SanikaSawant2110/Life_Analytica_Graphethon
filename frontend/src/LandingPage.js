import React from 'react';
import { Activity, Heart, Mic, Brain, Shield, ChevronRight, Cpu, Wind, Thermometer, BarChart2 } from 'lucide-react';
import styles from './LandingPage.module.css';

const FEATURES = [
  { icon: Mic,         color: '#6D28D9', bg: '#EDE9FE', title: 'Voice & Audio Logging',     desc: 'MEMS microphone array captures ambient sound and voice. Real-time transcription logs what you say with timestamps — no manual journaling needed.' },
  { icon: Heart,       color: '#DC2626', bg: '#FEE2E2', title: 'Biometric Monitoring',       desc: 'Continuous heart rate, SpO₂, and skin temperature tracked per-minute. Stress spikes, recovery curves, and baseline drift detected automatically.' },
  { icon: Activity,    color: '#D97706', bg: '#FEF3C7', title: 'Motion & Activity Tracking', desc: '3-axis accelerometer and gyroscope distinguish rest, walking, exercise, and agitation — fused with biometrics to decode true physiological state.' },
  { icon: Brain,       color: '#0891B2', bg: '#E0F7FA', title: 'AI Clinical Synthesis',      desc: 'Gemini AI fuses all sensor streams into a structured clinical report — semantic zones, trigger identification, and therapist-ready recommendations.' },
  { icon: BarChart2,   color: '#1A6BCC', bg: '#EBF4FF', title: 'Clinical Timeline',          desc: 'All signals merged into a scrollable timeline. Clinicians see when distress occurred, what the environment sounded like, and how the body responded.' },
  { icon: Shield,      color: '#16A34A', bg: '#DCFCE7', title: 'Privacy-First Architecture', desc: 'SLM-based on-device processing keeps data local. No raw audio stored. All computation happens within India — a key strategic advantage.' },
];

const STATS = [
  { value: '$90B+', label: 'Total Addressable Market' },
  { value: '1 device', label: 'All sensors unified' },
  { value: '120 min', label: 'Continuous monitoring' },
  { value: '4 streams', label: 'Audio · Bio · Motion · AI' },
];

export default function LandingPage({ onEnterDashboard, onOpenVoice }) {
  return (
    <div className={styles.page}>

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <div className={styles.navMark}>
            <Activity size={15} color="#4DA6FF" strokeWidth={2.5} />
          </div>
          <span className={styles.navLogo}>
            <span className={styles.blue}>Life</span>Analytica
          </span>
        </div>
        <div className={styles.navLinks}>
          <span className={styles.navChip}>
            <Shield size={11} />
            Nirmaan · IIT Madras
          </span>
          <button className={styles.navCta} onClick={onEnterDashboard}>
            Open Dashboard <ChevronRight size={13} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <span className={styles.heroDot} />
            Pre-Incubated at Nirmaan IIT Madras
          </div>
          <h1 className={styles.heroH1}>
            One Device.<br />
            <span className={styles.blue}>Total Awareness.</span>
          </h1>
          <p className={styles.heroSub}>
            The world's first wearable that unifies biometrics, ambient sound logging, and context-aware behavioural insights — giving therapists an objective clinical diary, not patient recall.
          </p>
          <div className={styles.heroCtas}>
            <button className={styles.ctaPrimary} onClick={onOpenVoice}>
              <Mic size={16} />
              Start Voice Session
            </button>
            <button className={styles.ctaSecondary} onClick={onEnterDashboard}>
              View Clinical Dashboard <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Live preview card */}
        <div className={styles.heroCard}>
          <div className={styles.heroCardHead}>
            <span className={styles.liveIndicator} />
            Live Session · Demo
          </div>
          <div className={styles.heroMetrics}>
            {[
              { icon: Heart,       label: 'Heart Rate', value: '82', unit: 'bpm', color: '#DC2626', bg: '#FEE2E2' },
              { icon: Wind,        label: 'SpO2',       value: '98.1', unit: '%',  color: '#1A6BCC', bg: '#EBF4FF' },
              { icon: Thermometer, label: 'Temp',       value: '36.5', unit: '°C', color: '#0891B2', bg: '#E0F7FA' },
              { icon: Mic,         label: 'Audio',      value: '42',  unit: 'dB',  color: '#6D28D9', bg: '#EDE9FE' },
            ].map((m, i) => (
              <div key={i} className={styles.heroMetric}>
                <div className={styles.hmIcon} style={{ background: m.bg, color: m.color }}>
                  <m.icon size={14} strokeWidth={2} />
                </div>
                <div>
                  <div className={styles.hmVal} style={{ color: m.color }}>{m.value}<span className={styles.hmUnit}>{m.unit}</span></div>
                  <div className={styles.hmLabel}>{m.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.heroZone}>
            <div className={styles.zoneBar}>
              {['Rest','Walk','Stress','Exercise','Recovery','Convo'].map((z, i) => (
                <div key={i} className={styles.zoneCell}
                  style={{ background: ['#EBF4FF','#DCFCE7','#FEE2E2','#FEF3C7','#E0F7FA','#EDE9FE'][i],
                           color:      ['#1A6BCC','#16A34A','#DC2626','#D97706','#0891B2','#6D28D9'][i],
                           fontWeight: i === 2 ? 700 : 400,
                           border:     i === 2 ? '1.5px solid #DC2626' : '1.5px solid transparent' }}>
                  {z}
                </div>
              ))}
            </div>
            <div className={styles.zoneNote}>Current zone detected from sensor fusion</div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className={styles.statsStrip}>
        {STATS.map((s, i) => (
          <div key={i} className={styles.stat}>
            <div className={styles.statVal}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features grid */}
      <section className={styles.features}>
        <div className={styles.sectionLabel}>Platform Capabilities</div>
        <h2 className={styles.sectionH2}>Every signal. One unified picture.</h2>
        <div className={styles.featGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.featCard}>
              <div className={styles.featIcon} style={{ background: f.bg, color: f.color }}>
                <f.icon size={20} strokeWidth={1.5} />
              </div>
              <div className={styles.featTitle}>{f.title}</div>
              <div className={styles.featDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Voice CTA section */}
      <section className={styles.voiceSection}>
        <div className={styles.voiceInner}>
          <div className={styles.voiceIconBig}>
            <Mic size={32} color="#6D28D9" strokeWidth={1.5} />
          </div>
          <h2 className={styles.voiceH2}>Start a voice session now</h2>
          <p className={styles.voiceSub}>
            Speak naturally. LifeAnalytica transcribes in real time, detects emotional zone from your words, and logs everything to the clinical Excel sheet — timestamped and therapist-ready.
          </p>
          <button className={styles.voiceBtn} onClick={onOpenVoice}>
            <Mic size={16} />
            Open Voice Recorder
          </button>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.how}>
        <div className={styles.sectionLabel}>Workflow</div>
        <h2 className={styles.sectionH2}>From sensor to clinical insight</h2>
        <div className={styles.howSteps}>
          {[
            { n: '01', icon: Mic,       title: 'Capture',   desc: 'Voice, biometrics, and motion captured continuously by the wearable ring.' },
            { n: '02', icon: Cpu,       title: 'Fuse',      desc: 'On-device sensor fusion correlates audio, HR spikes, and motion into behavioural zones.' },
            { n: '03', icon: Brain,     title: 'Analyse',   desc: 'Gemini AI generates a structured semantic timeline with clinical observations.' },
            { n: '04', icon: BarChart2, title: 'Deliver',   desc: 'Therapist receives a complete diary — transcripts, vitals, and recommendations.' },
          ].map((s, i) => (
            <div key={i} className={styles.howStep}>
              <div className={styles.howN}>{s.n}</div>
              <div className={styles.howIcon}>
                <s.icon size={20} strokeWidth={1.5} color="#1A6BCC" />
              </div>
              <div className={styles.howTitle}>{s.title}</div>
              <div className={styles.howDesc}>{s.desc}</div>
              {i < 3 && <div className={styles.howArrow}><ChevronRight size={18} color="#CBD5E1" /></div>}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <span className={styles.blue}>Life</span>Analytica
        </div>
        <div className={styles.footerMeta}>
          Pre-Incubated at Nirmaan IIT Madras · Clinical use only · Not a replacement for professional diagnosis
        </div>
      </footer>
    </div>
  );
}
