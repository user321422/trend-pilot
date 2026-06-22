import { useState } from 'react';
import { useTrends } from '../hooks/useTrends';

export default function Trends() {
  const { data: trendData, isLoading, refresh } = useTrends();
  const [refreshing, setRefreshing] = useState(false);

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
          <p style={{ color: 'var(--body)', fontSize: '16px' }}>Agent 1: Discovering and scoring high-opportunity topics.</p>
        </div>
        <button 
          className="button outline" 
          onClick={handleSync} 
          disabled={refreshing}
          style={{ height: '40px', padding: '0 16px', border: '1px solid var(--hairline)', borderRadius: '6px', background: 'var(--surface-card)', color: 'var(--ink)', cursor: 'pointer', fontWeight: 500 }}
        >
          {refreshing ? 'Syncing...' : 'Sync Live Sources'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {refreshing ? (
          <div style={{ padding: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-card)', borderRadius: '12px', border: '1px solid var(--hairline)', position: 'relative', overflow: 'hidden' }}>
            <div className="radar-scanner"></div>
            <img src="/mascot.png" alt="Trendy Mascot" className="mascot-sprite" />
            <h3 style={{ margin: '0 0 12px', fontSize: '20px', color: 'var(--ink)' }}>Agent 1 is scanning live sources</h3>
            <p style={{ color: 'var(--muted)', fontSize: '15px', fontFamily: 'var(--mono)' }}>Analyzing semantic relevance & calculating opportunity scores...</p>
          </div>
        ) : isLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>Loading trends...</div>
        ) : trendData.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', background: 'var(--surface-card)', borderRadius: '12px', border: '1px solid var(--hairline)' }}>
            <p style={{ color: 'var(--muted)' }}>No trends discovered yet. Click Sync Live Sources to begin.</p>
          </div>
        ) : (
          trendData.map((trend, i) => (
            <div key={trend.id} className="trend-card-enter" style={{ display: 'flex', flexDirection: 'column', padding: '24px', background: 'var(--surface-card)', border: '1px solid var(--hairline)', borderRadius: '8px', animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: 'var(--ink)' }}>{trend.title}</h3>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '13px', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>
                    <span>Source: {trend.source}</span>
                    <span>Status: {trend.status}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Opportunity Score</div>
                  <div style={{ fontSize: '24px', fontFamily: 'var(--display)', color: 'var(--primary)' }}>{trend.opportunityScore.toFixed(0)}</div>
                </div>
              </div>
              {trend.aiExplanation && (
                <div style={{ marginTop: '16px', padding: '16px', background: 'var(--canvas)', border: '1px solid var(--hairline)', borderRadius: '6px', fontSize: '14px', color: 'var(--body)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: '4px' }}>Agent 1 Insight:</strong>
                  {trend.aiExplanation}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}
