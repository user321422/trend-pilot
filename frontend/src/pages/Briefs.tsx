import { useBriefs } from '../hooks/useBriefs';

export default function Briefs() {
  const { data: briefs, isLoading, approve } = useBriefs();

  return (
    <div style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
      <div className="page-container">
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: '36px', margin: '0 0 8px', color: 'var(--ink)' }}>Content Briefs</h1>
          <p style={{ color: 'var(--body)', fontSize: '16px' }}>Agent 2: AI-generated editorial outlines waiting for approval.</p>
        </div>

        {isLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>Loading briefs...</div>
        ) : briefs.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center', background: 'var(--surface-card)', borderRadius: '12px', border: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: 'var(--ink)' }}>Brief Queue Empty</h3>
            <p style={{ color: 'var(--muted)' }}>Generate briefs from the Chat Assistant or Trends page to see them here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {briefs.map((brief: any) => (
              <div key={brief.id} style={{ padding: '24px', background: 'var(--surface-card)', border: '1px solid var(--hairline)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--ink)' }}>{brief.trend?.title || 'Unknown Trend'}</h2>
                      <span style={{ 
                        fontSize: '12px', 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontWeight: 600,
                        background: brief.status === 'APPROVED' ? 'var(--primary)' : brief.status === 'REJECTED' ? 'var(--error)' : 'var(--hairline)',
                        color: brief.status === 'APPROVED' || brief.status === 'REJECTED' ? 'white' : 'var(--ink)'
                      }}>
                        {brief.status}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--muted)', fontSize: '14px' }}>Created: {new Date(brief.createdAt).toLocaleString()}</p>
                  </div>
                  {brief.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => approve(brief.id, 'APPROVED')}
                        style={{ height: '36px', padding: '0 16px', border: 'none', borderRadius: '6px', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 500 }}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => approve(brief.id, 'REJECTED')}
                        style={{ height: '36px', padding: '0 16px', border: '1px solid var(--hairline)', borderRadius: '6px', background: 'transparent', color: 'var(--ink)', cursor: 'pointer', fontWeight: 500 }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid-2col" style={{ marginBottom: '24px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Summary</h4>
                    <p style={{ margin: 0, color: 'var(--body)', fontSize: '14px', lineHeight: 1.6 }}>{brief.summary}</p>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Audience Analysis</h4>
                    <p style={{ margin: 0, color: 'var(--body)', fontSize: '14px', lineHeight: 1.6 }}>{brief.audienceAnalysis}</p>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Angle</h4>
                    <p style={{ margin: 0, color: 'var(--body)', fontSize: '14px', lineHeight: 1.6 }}>{brief.angle}</p>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SEO Details</h4>
                    <p style={{ margin: '0 0 4px', color: 'var(--body)', fontSize: '14px' }}><strong>Target Word Count:</strong> {brief.wordCount}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {brief.seoKeywords?.map((kw: string) => (
                        <span key={kw} style={{ background: 'var(--canvas)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: 'var(--ink)', border: '1px solid var(--hairline)' }}>
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--canvas)', padding: '20px', borderRadius: '8px', border: '1px solid var(--hairline)', marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Proposed Article Structure</h4>
                  <h1 style={{ margin: '0 0 16px', fontSize: '24px', color: 'var(--ink)' }}>{brief.h1}</h1>
                  {brief.headingStructure?.map((block: any, idx: number) => (
                    <div key={idx} style={{ marginBottom: '16px' }}>
                      <h2 style={{ margin: '0 0 8px', fontSize: '18px', color: 'var(--ink)' }}>{block.h2}</h2>
                      <ul style={{ margin: 0, paddingLeft: '24px', color: 'var(--body)', fontSize: '14px' }}>
                        {block.h3?.map((h3: string, i: number) => (
                          <li key={i} style={{ marginBottom: '4px' }}>{h3}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {brief.publishingGuidance && (
                  <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      Publishing Guidance
                    </h4>
                    <p style={{ margin: 0, color: 'var(--body)', fontSize: '14px', lineHeight: 1.6 }}>{brief.publishingGuidance}</p>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
