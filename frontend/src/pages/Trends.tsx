import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrends } from '../hooks/useTrends';
import { useBriefs } from '../hooks/useBriefs';

export default function Trends() {
  const navigate = useNavigate();
  const { data: trendData, isLoading, refresh, syncInterval, updateSyncInterval } = useTrends();
  const { generate, autoGenerate } = useBriefs();
  
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [researchStep, setResearchStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const steps = [
    "Searching trend sources...",
    "Analyzing Hacker News...",
    "Reviewing Reddit discussions...",
    "Scanning Dev.to trends...",
    "Ranking opportunities...",
    "Generating recommendations..."
  ];

  useEffect(() => {
    if (refreshing) {
      setResearchStep(0);
      setIsExpanded(false);
      const interval = setInterval(() => {
        setResearchStep(prev => Math.min(prev + 1, steps.length - 1));
      }, 1500); // simulate 1.5s per step
      return () => clearInterval(interval);
    }
  }, [refreshing]);

  async function handleSync() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: '36px', margin: '0 0 8px', color: 'var(--ink)' }}>Trends & Sync</h1>
          <p style={{ color: 'var(--body)', fontSize: '16px' }}>Trendy: Discovering and scoring high-opportunity topics.</p>
          
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--muted)' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Background Sync:
            <select 
              value={syncInterval} 
              onChange={(e) => updateSyncInterval(Number(e.target.value))}
              style={{ background: 'transparent', border: '1px solid var(--hairline)', borderRadius: '4px', padding: '2px 8px', color: 'var(--ink)', fontSize: '13px', cursor: 'pointer' }}
            >
              <option value={0}>Disabled</option>
              <option value={15}>Every 15m</option>
              <option value={30}>Every 30m</option>
              <option value={60}>Every 1h</option>
              <option value={120}>Every 2h</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="button outline" 
            onClick={async () => {
              setAutoGenerating(true);
              try {
                const res = await autoGenerate();
                if (res.count > 0) {
                  navigate('/briefs');
                } else {
                  alert((res as any).message || "No available trends to generate briefs for.");
                }
              } catch (e: any) {
                alert(e.message);
              }
              setAutoGenerating(false);
            }} 
            disabled={autoGenerating || refreshing}
            style={{ height: '40px', padding: '0 16px', border: '1px solid var(--hairline)', borderRadius: '6px', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 500 }}
          >
            {autoGenerating ? 'Agent 2 Generating...' : 'Auto-Generate Top 3'}
          </button>
          <button 
            className="button outline" 
            onClick={handleSync} 
            disabled={refreshing || autoGenerating}
            style={{ height: '40px', padding: '0 16px', border: '1px solid var(--hairline)', borderRadius: '6px', background: 'var(--surface-card)', color: 'var(--ink)', cursor: 'pointer', fontWeight: 500 }}
          >
            {refreshing ? 'Syncing...' : 'Sync Live Sources'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {refreshing ? (
          <div className="reasoning-container" style={{ background: 'transparent', border: 'none', padding: '16px 0' }}>
            <div 
              className="reasoning-header" 
              onClick={() => setIsExpanded(!isExpanded)}
              style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--surface-card)', border: '1px solid var(--hairline)', borderRadius: '20px', width: 'fit-content' }}
            >
              <div className="reasoning-spinner" style={{ width: '14px', height: '14px', borderWidth: '1.5px' }}></div>
              <span style={{ fontSize: '14px', color: 'var(--body)' }}>{isExpanded ? "Trendy is actively researching..." : steps[researchStep]}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--muted)', marginLeft: '8px' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            
            {isExpanded && (
              <div className="collapsible-section" style={{ marginTop: '8px', border: 'none' }}>
                <div className="collapsible-content" style={{ padding: '16px', background: 'var(--surface-card)', border: '1px solid var(--hairline)', borderRadius: '8px', gap: '12px' }}>
                  {steps.map((step, idx) => (
                    idx <= researchStep && (
                      <div key={idx} className={`reasoning-step ${idx === researchStep ? 'active' : 'completed'}`}>
                        <div className="step-icon">
                          {idx < researchStep ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          ) : (
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.5s infinite' }}></div>
                          )}
                        </div>
                        <span>{step}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            <div className="skeleton" style={{ height: '80px', marginTop: '24px' }}></div>
            <div className="skeleton" style={{ height: '80px', marginTop: '16px' }}></div>
          </div>
        ) : isLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>Loading trends...</div>
        ) : trendData.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', background: 'var(--surface-card)', borderRadius: '12px', border: '1px solid var(--hairline)' }}>
            <p style={{ color: 'var(--muted)' }}>No trends discovered yet. Click Sync Live Sources to begin.</p>
          </div>
        ) : (
          trendData.map((trend, i) => (
            <div key={trend.id} className="trend-card-enter" style={{ display: 'flex', flexDirection: 'column', padding: '24px', background: 'var(--surface-card)', border: '1px solid var(--hairline)', borderRadius: '8px', animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: 'var(--ink)' }}>{trend.title}</h3>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '13px', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>
                    <span>Source: {trend.source}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Opportunity Score</div>
                  <div style={{ fontSize: '24px', fontFamily: 'var(--display)', color: 'var(--primary)' }}>{trend.opportunityScore.toFixed(0)}</div>
                </div>
              </div>
              {trend.aiExplanation && (
                <div style={{ marginTop: '16px', padding: '16px', background: 'var(--canvas)', border: '1px solid var(--hairline)', borderRadius: '6px', fontSize: '14px', color: 'var(--body)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: '4px' }}>Trendy Insight:</strong>
                  {trend.aiExplanation}
                </div>
              )}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={async () => {
                    setGeneratingId(trend.id);
                    try {
                      await generate(trend.id);
                      navigate('/briefs');
                    } catch (e: any) {
                      alert(e.message);
                    }
                    setGeneratingId(null);
                  }}
                  disabled={generatingId === trend.id}
                  style={{ height: '36px', padding: '0 16px', border: 'none', borderRadius: '6px', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}
                >
                  {generatingId === trend.id ? 'Agent 2 Drafting...' : 'Select & Generate Brief'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}
