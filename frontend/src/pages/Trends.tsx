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
        {isLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>Loading trends...</div>
        ) : trendData.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', background: 'var(--surface-card)', borderRadius: '12px', border: '1px solid var(--hairline)' }}>
            <p style={{ color: 'var(--muted)' }}>No trends discovered yet. Click Sync Live Sources to begin.</p>
          </div>
        ) : (
          trendData.map(trend => (
            <div key={trend.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', background: 'var(--surface-card)', border: '1px solid var(--hairline)', borderRadius: '8px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: 'var(--ink)' }}>{trend.title}</h3>
                <div style={{ display: 'flex', gap: '12px', fontSize: '13px', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>
                  <span>Source: {trend.source}</span>
                  <span>Status: {trend.status}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Score</div>
                <div style={{ fontSize: '24px', fontFamily: 'var(--display)', color: 'var(--primary)' }}>{trend.opportunityScore.toFixed(0)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
