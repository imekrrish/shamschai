import { openLaunchEmail } from '../utils/launchMail';
import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, CheckCircle2, AlertCircle, Beaker, Sparkles, Send } from 'lucide-react';
import { Eyebrow, Reveal } from '../components/ui';
import { labExperiments } from '../data/content';
import RecipeWaitlist from '../components/RecipeWaitlist';

const teaGrades = [
  { grade: 'BOP', name: 'Broken Orange Pekoe', role: 'Strong cupping tea with high briskness and deep liquor color.' },
  { grade: 'BP', name: 'Broken Pekoe', role: 'Substantial leaf cut giving rounded body and balanced extraction speed.' },
  { grade: 'PF', name: 'Pekoe Fannings', role: 'Fine particles engineered for rapid liquor release and Kadak density.' },
  { grade: 'PD', name: 'Pekoe Dust', role: 'Instant color and pungent tannin backbone to anchor whole milk.' },
];

const masalaSpices = [
  { spice: 'Cardamom', role: 'Lively, cooling top aromatics that bloom immediately on first steam.' },
  { spice: 'Cinnamon', role: 'Natural woody sweetness and lingering middle palate warmth.' },
  { spice: 'Clove', role: 'Pungent depth, numbing warmth, and rounded structural presence.' },
  { spice: 'Pepper', role: 'Crisp throat bite and heat that cuts through milk solids.' },
  { spice: 'Nutmeg', role: 'Sweet, buttery luxury and soothing late-palate comfort.' },
];

const variables = [
  'Strength',
  'Aroma',
  'Body',
  'Astringency',
  'Spice intensity',
  'Finish',
];

const processSteps = [
  { step: '01', name: 'QUESTION', desc: 'Start with an idea or an unresolved cup.' },
  { step: '02', name: 'EXPLORE', desc: 'Try different combinations of leaf cuts and spice grades.' },
  { step: '03', name: 'TASTE', desc: 'Look beyond the first sip—evaluate the 4th minute finish.' },
  { step: '04', name: 'REFINE', desc: 'Change what isn’t working, remove excess noise.' },
  { step: '05', name: 'LOCK', desc: 'When a recipe is ready, it becomes an immutable formula.' },
  { step: '06', name: 'LAUNCH', desc: 'Give it a name. Give it a personality. Give it a place in Shams.' },
  { step: '07', name: 'EXPLORE AGAIN', desc: 'Because one great recipe doesn’t mean we’re finished.' },
];

export function TheLab() {
  const [activeExp, setActiveExp] = useState(labExperiments[0].id);



  return (
    <div className="lab-page">
      {/* Hero */}
      <section className="page-hero lab-hero">
        <Eyebrow>THE SHAMS LAB</Eyebrow>
        <h1>
          Welcome to the lab.<br />
          <em>We like to question chai.</em>
        </h1>
        <div className="lab-questions-lead">
          <p>What happens when the tea changes?</p>
          <p>What happens when the masala changes?</p>
          <p>What happens when the ratio changes?</p>
          <p>What happens when the balance shifts?</p>
          <p>What happens when something unexpected just… works?</p>
          <strong>That’s where Shams begins.</strong>
        </div>
      </section>

      {/* Exploration: Tea & Masala */}
      <section className="section lab-exploration">
        <div className="section-heading-row">
          <Eyebrow>THE EXPLORATION</Eyebrow>
          <h2>Tea grades &amp; spice variables.</h2>
        </div>

        <div className="exploration-grid">
          {/* Tea Leaf Section */}
          <div className="exploration-col">
            <div className="col-header">
              <span className="col-badge">TEA</span>
              <h3>BOP · BP · PF · PD</h3>
              <p>Different grades. Different characteristics. Different possibilities.</p>
            </div>
            <div className="grade-cards">
              {teaGrades.map((g) => (
                <div key={g.grade} className="grade-item">
                  <span className="grade-code">{g.grade}</span>
                  <div>
                    <strong>{g.name}</strong>
                    <p>{g.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Masala Section */}
          <div className="exploration-col">
            <div className="col-header">
              <span className="col-badge">MASALA</span>
              <h3>Cardamom · Cinnamon · Clove · Pepper · Nutmeg</h3>
              <p>Different proportions. Different personalities. Different outcomes.</p>
            </div>
            <div className="grade-cards">
              {masalaSpices.map((s) => (
                <div key={s.spice} className="grade-item">
                  <span className="grade-code">{s.spice.slice(0, 3).toUpperCase()}</span>
                  <div>
                    <strong>{s.spice}</strong>
                    <p>{s.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Variables strip */}
        <div className="variables-strip">
          <div className="variables-title">
            <span>THE SIX VARIABLES</span>
            <small>We change. We taste. We compare. We refine.</small>
          </div>
          <div className="variables-tags">
            {variables.map((v) => (
              <span key={v} className="variable-tag">
                {v}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* The Process */}
      <section className="section lab-process-section">
        <Eyebrow>THE PROCESS</Eyebrow>
        <h2>From an inquiry to a permanent recipe.</h2>
        <div className="process-pipeline">
          {processSteps.map((p, i) => (
            <div key={p.step} className="pipeline-node">
              <div className="node-number">{p.step}</div>
              <div className="node-content">
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
              </div>
              {i < processSteps.length - 1 && <span className="pipeline-arrow">↓</span>}
            </div>
          ))}
        </div>

        <div className="process-quote-banner">
          <span>THE RECIPE IS FIXED.</span>
          <strong>THE EXPLORATION ISN’T.</strong>
        </div>
      </section>

      {/* The Archive */}
      <section className="section lab-archive-section">
        <div className="section-heading-row">
          <div>
            <Eyebrow>THE ARCHIVE</Eyebrow>
            <h2>Not everything makes the collection.</h2>
          </div>
          <p className="archive-subtext">
            Some experiments become recipes. Some become lessons. Some are never made again. And that’s okay.
          </p>
        </div>

        <div className="archive-grid">
          <div className="archive-nav">
            {labExperiments.map((exp) => (
              <button
                key={exp.id}
                type="button"
                className={`archive-tab-btn ${activeExp === exp.id ? 'active' : ''}`}
                onClick={() => setActiveExp(exp.id)}
              >
                <div>
                  <span className="exp-code">{exp.code}</span>
                  <strong className="exp-title">{exp.title}</strong>
                </div>
                <span className={`status-pill status-${exp.status.toLowerCase()}`}>
                  {exp.status}
                </span>
              </button>
            ))}
          </div>

          <div className="archive-detail-card">
            {(() => {
              const current = labExperiments.find((e) => e.id === activeExp) || labExperiments[0];
              return (
                <div>
                  <div className="archive-detail-head">
                    <span className="detail-code">{current.code}</span>
                    <span className={`status-pill status-${current.status.toLowerCase()}`}>
                      {current.status}
                    </span>
                  </div>
                  <h3>{current.title}</h3>

                  <div className="archive-qa-block">
                    <small>WHAT WERE WE TRYING TO FIND?</small>
                    <p>{current.intent}</p>
                  </div>

                  <div className="archive-qa-block">
                    <small>WHAT DID WE LEARN?</small>
                    <p>{current.learned}</p>
                  </div>

                  <div className="archive-qa-block highlight">
                    <small>WHERE DID IT END?</small>
                    <p>{current.outcome}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="archive-closing-tag">
          <span>SOME CHAI IS MEANT TO STAY IN THE LAB.</span>
        </div>
      </section>

      {/* The Next Drop: Recipe 005 — Classified */}
      <section className="section next-drop-section">
        <div className="drop-card-classified">
          <div className="classified-header">
            <span className="badge-classified"><Lock size={13} /> CLASSIFIED DROP</span>
            <span className="drop-code">WHAT’S NEXT?</span>
          </div>

          <h2>RECIPE 02</h2>
          <p className="drop-description">
            We’re working on something.<br />
            We’re tasting. We’re refining.<br />
            And we’re not ready to tell you yet.
          </p>

          <div className="drop-signup-box">
            <span>WANT FIRST SIP?</span>
            <RecipeWaitlist />
            <small>Drops are our launch mechanism for limited laboratory debuts.</small>
          </div>
        </div>
      </section>

      {/* Community / Tasting Feedback */}
      <section className="section lab-community-section">
        <Eyebrow>COMMUNITY</Eyebrow>
        <h2>Shams isn’t finished being written.</h2>
        <p className="lead-community">
          We’ve created the recipes. Now we want to know what happens when they meet you.
        </p>

        <div className="verdict-banner">
          <span>KEEP IT.</span>
          <span>REFINE IT.</span>
          <span>OR RETIRE IT.</span>
        </div>

        <p className="tasting-subtext">
          Your feedback doesn’t replace our craft. It helps us understand the people we’re making it for.
        </p>

        <button
          type="button"
          className="btn btn-outline"
          onClick={() => openLaunchEmail('community-tasting')}
        >
          Join The Next Tasting <ArrowRight size={14} />
        </button>
      </section>
    </div>
  );
}
