import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      agent: "Agent 1: Trend Spotter",
      role: "Discovery & Scoring",
      description: "Continuously monitors global feeds (Reddit, Hacker News, Dev.to) to identify and opportunity-score high-value rising tech topics.",
      details: "Calculates scores based on community engagement, velocity of discussion, and target audience alignment scores.",
      color: "var(--primary)"
    },
    {
      agent: "Agent 2: SEO Architect",
      role: "Brief Generator",
      description: "Extracts key concepts, defines semantic SEO keywords, outlines heading hierarchies (H2/H3), and recommends target word counts.",
      details: "Performs real-time competitive analysis to craft briefs that guarantee SEO compliance and clear narrative angles.",
      color: "#4a7c59"
    },
    {
      agent: "Agent 3: Matchmaker",
      role: "Writer Assignment",
      description: "Evaluates the pending brief and matches it to the optimal specialized AI Agent (e.g., Tech, Marketing, or Creative Specialist).",
      details: "Balances current queue loads, historical quality ratings, and category match scoring to select the perfect copywriter.",
      color: "#5c85cc"
    },
    {
      agent: "Agent 4: AI Copywriter",
      role: "Drafting & Quality Audit",
      description: "Generates long-form drafts and performs automated multi-dimensional compliance and readability audits.",
      details: "Checks keyword coverage, heading alignment, structure compliance, and scores draft quality before submission.",
      color: "#8e5ccc"
    },
    {
      agent: "Agent 5: Distribution",
      role: "Publishing & Socials",
      description: "Calculates peak engagement schedule windows and drafts custom promotion posts for LinkedIn and Twitter/X.",
      details: "Prepares clean CMS-ready packages and social assets, pushing finished posts directly to publishing queues.",
      color: "#cc5c99"
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--canvas)', 
      color: 'var(--ink)', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: 'var(--sans)',
      overflowX: 'hidden'
    }}>
      {/* Navigation */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 40px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        borderBottom: '1px solid var(--hairline)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '22px', fontFamily: 'var(--display)', fontWeight: 600 }}>
          <span className="brand-mark" style={{ width: '16px', height: '16px', background: 'var(--ink)' }} />
          <span>Trendy</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#pipeline" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>The Pipeline</a>
          <a href="#stats" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>System Stats</a>
          <button 
            onClick={() => navigate(user ? '/app' : '/login')}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              border: '1px solid var(--hairline)',
              background: 'var(--surface-dark)',
              color: 'var(--on-dark)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {user ? 'Enter Dashboard' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: '900px',
        margin: '80px auto 40px',
        padding: '0 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ 
          fontSize: '12px', 
          textTransform: 'uppercase', 
          letterSpacing: '1.5px', 
          color: 'var(--primary)', 
          fontWeight: 600,
          marginBottom: '16px',
          background: 'rgba(204, 120, 92, 0.08)',
          padding: '4px 12px',
          borderRadius: '12px'
        }}>
          Autonomous Content Autopilot
        </div>
        <h1 style={{ 
          fontFamily: 'var(--display)', 
          fontSize: '64px', 
          fontWeight: 400, 
          lineHeight: '1.1',
          margin: '0 0 24px',
          letterSpacing: '-0.02em',
          color: 'var(--ink)'
        }}>
          Content operations on absolute autopilot.
        </h1>
        <p style={{ 
          fontSize: '20px', 
          color: 'var(--muted)', 
          lineHeight: '1.6', 
          maxWidth: '700px',
          margin: '0 0 36px' 
        }}>
          A synchronized team of five specialized AI agents crawling sources, generating SEO briefs, drafting long-form articles, auditing quality, and scheduling socials. 100% autonomously.
        </p>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => navigate(user ? '/app' : '/login')}
            style={{
              padding: '14px 28px',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: 'var(--on-primary)',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 12px rgba(204, 120, 92, 0.2)'
            }}
          >
            Access Console
          </button>
          <a 
            href="#pipeline"
            style={{
              padding: '14px 28px',
              borderRadius: '8px',
              border: '1px solid var(--hairline)',
              background: 'var(--canvas)',
              color: 'var(--ink)',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            See How it Works
          </a>
        </div>
      </section>

      {/* Live Agent Pipeline Visual */}
      <section id="pipeline" style={{
        maxWidth: '1100px',
        width: '100%',
        margin: '60px auto',
        padding: '0 24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--display)', fontSize: '36px', margin: '0 0 8px', fontWeight: 500 }}>The Autonomous Pipeline</h2>
          <p style={{ color: 'var(--muted)', fontSize: '16px' }}>Click through the stages to see how our AI Agent network collaborates.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr',
          gap: '40px',
          background: 'var(--surface-soft)',
          border: '1px solid var(--hairline)',
          borderRadius: '16px',
          padding: '40px'
        }}>
          {/* Left: Interactive selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid ' + (activeStep === idx ? 'var(--hairline)' : 'transparent'),
                  background: activeStep === idx ? 'var(--canvas)' : 'transparent',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: step.color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '14px'
                }}>
                  {idx + 1}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: activeStep === idx ? 'var(--ink)' : 'var(--muted)' }}>
                    {step.agent.split(': ')[1]}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {step.role}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Detailed card */}
          <div style={{
            background: 'var(--canvas)',
            border: '1px solid var(--hairline)',
            borderRadius: '12px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '300px',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <span style={{ 
              fontSize: '11px', 
              fontFamily: 'var(--mono)', 
              color: 'var(--muted)', 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              display: 'inline-block',
              marginBottom: '12px'
            }}>
              Active Agent Node
            </span>
            <h3 style={{ 
              fontFamily: 'var(--display)', 
              fontSize: '28px', 
              color: 'var(--ink)', 
              margin: '0 0 16px',
              fontWeight: 500
            }}>
              {steps[activeStep].agent}
            </h3>
            <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--body)', margin: '0 0 20px' }}>
              {steps[activeStep].description}
            </p>
            <div style={{ 
              padding: '16px', 
              background: 'var(--surface-soft)', 
              borderRadius: '8px', 
              borderLeft: '4px solid ' + steps[activeStep].color,
              fontSize: '14px',
              color: 'var(--muted)',
              lineHeight: '1.5'
            }}>
              <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: '4px' }}>Agent Strategy:</strong>
              {steps[activeStep].details}
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section id="stats" style={{
        background: 'var(--surface-soft)',
        borderTop: '1px solid var(--hairline)',
        borderBottom: '1px solid var(--hairline)',
        padding: '60px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--display)', fontSize: '32px', fontWeight: 500, marginBottom: '40px' }}>Pipeline In Full Swing</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px'
          }}>
            <div style={{ background: 'var(--canvas)', padding: '24px', borderRadius: '12px', border: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: '40px', fontFamily: 'var(--display)', color: 'var(--primary)', marginBottom: '8px' }}>142</div>
              <div style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 500 }}>Live Trends Discovered</div>
            </div>
            <div style={{ background: 'var(--canvas)', padding: '24px', borderRadius: '12px', border: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: '40px', fontFamily: 'var(--display)', color: '#4a7c59', marginBottom: '8px' }}>89</div>
              <div style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 500 }}>Briefs Architecturalized</div>
            </div>
            <div style={{ background: 'var(--canvas)', padding: '24px', borderRadius: '12px', border: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: '40px', fontFamily: 'var(--display)', color: '#5c85cc', marginBottom: '8px' }}>94%</div>
              <div style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 500 }}>AI Audit Compliance Rate</div>
            </div>
            <div style={{ background: 'var(--canvas)', padding: '24px', borderRadius: '12px', border: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: '40px', fontFamily: 'var(--display)', color: '#8e5ccc', marginBottom: '8px' }}>100%</div>
              <div style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 500 }}>Autonomous Execution</div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section style={{
        maxWidth: '900px',
        margin: '80px auto',
        padding: '0 24px'
      }}>
        <h2 style={{ fontFamily: 'var(--display)', fontSize: '32px', fontWeight: 500, textAlign: 'center', marginBottom: '40px' }}>Built for Modern Publishing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div style={{ padding: '24px', background: 'var(--surface-soft)', borderRadius: '12px', border: '1px solid var(--hairline)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px' }}>Traditional Operations</h3>
            <ul style={{ paddingLeft: '20px', color: 'var(--body)', lineHeight: '1.8', fontSize: '15px' }}>
              <li>Manual feed crawling across RSS/social channels.</li>
              <li>Hour-long drafting of SEO specifications.</li>
              <li>Chasing freelance writers and negotiating rates.</li>
              <li>Proofreading drafts and manual compliance checking.</li>
              <li>Scheduling across platforms one-by-one.</li>
            </ul>
          </div>
          <div style={{ padding: '24px', background: 'rgba(204, 120, 92, 0.04)', borderRadius: '12px', border: '1px solid var(--primary)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--primary)', marginBottom: '16px' }}>Trendy Autonomous Way</h3>
            <ul style={{ paddingLeft: '20px', color: 'var(--ink)', lineHeight: '1.8', fontSize: '15px' }}>
              <li>Continuous background crawl and discovery scoring.</li>
              <li>Brief generated instantly by specialized AI.</li>
              <li>Auto-assign matching based on AI writer load.</li>
              <li>Instant draft writing & automated multi-point audit.</li>
              <li>Optimized publishing schedules and automated posts.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section style={{
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto 60px',
        padding: '0 24px'
      }}>
        <div style={{
          background: 'var(--surface-dark)',
          color: 'var(--on-dark)',
          borderRadius: '16px',
          padding: '60px 40px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h2 style={{ fontFamily: 'var(--display)', fontSize: '40px', fontWeight: 400, margin: '0 0 16px', color: 'var(--on-dark)' }}>
            Experience the future of content.
          </h2>
          <p style={{ color: 'var(--on-dark-soft)', fontSize: '18px', maxWidth: '600px', margin: '0 0 32px' }}>
            Get started today by accessing the Trendy dashboard control console. 
          </p>
          <button 
            onClick={() => navigate(user ? '/app' : '/login')}
            style={{
              padding: '14px 32px',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: 'var(--on-primary)',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              border: 'none',
              transition: 'background 0.2s'
            }}
          >
            {user ? 'Go to Dashboard' : 'Sign in as Admin'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '32px 24px',
        borderTop: '1px solid var(--hairline)',
        fontSize: '13px',
        color: 'var(--muted)'
      }}>
        <p>© 2026 Trendy Platforms Inc. All rights reserved.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
          <button onClick={() => navigate('/about')} style={{ color: 'var(--muted)', fontSize: '13px' }}>About</button>
          <span>•</span>
          <button onClick={() => navigate('/privacy')} style={{ color: 'var(--muted)', fontSize: '13px' }}>Privacy Policy</button>
          <span>•</span>
          <button onClick={() => navigate('/terms')} style={{ color: 'var(--muted)', fontSize: '13px' }}>Terms & Conditions</button>
        </div>
      </footer>
    </div>
  );
}
