export default function Assignments() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: '36px', margin: '0 0 8px', color: 'var(--ink)' }}>Writers</h1>
        <p style={{ color: 'var(--body)', fontSize: '16px' }}>Agent 3: AI-driven workload balancing and writer matching.</p>
      </div>

      <div style={{ padding: '64px', textAlign: 'center', background: 'var(--surface-card)', borderRadius: '12px', border: '1px solid var(--hairline)' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>👥</div>
        <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: 'var(--ink)' }}>No Approved Briefs</h3>
        <p style={{ color: 'var(--muted)' }}>Once a brief is approved, the AI will recommend the best available writer here.</p>
      </div>
    </div>
    </div>
  );
}
