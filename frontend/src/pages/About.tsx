import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100svh', background: 'var(--canvas)', color: 'var(--body)' }}>
      <header style={{ padding: '24px 40px', borderBottom: '1px solid var(--hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: '24px', fontWeight: 500, color: 'var(--ink)' }}>
          Trendy AI
        </div>
        <button 
          onClick={() => navigate(-1)}
          style={{ padding: '8px 16px', borderRadius: '6px', background: 'var(--surface-card)', border: '1px solid var(--hairline)', color: 'var(--ink)', fontWeight: 500 }}
        >
          Back
        </button>
      </header>
      
      <main style={{ maxWidth: '800px', margin: '64px auto', padding: '0 24px' }}>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: '48px', color: 'var(--ink)', marginBottom: '24px' }}>About Trendy AI</h1>
        
        <div style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--body)' }}>
          <p style={{ marginBottom: '24px', fontSize: '20px', color: 'var(--ink)', fontWeight: 500 }}>
            Trendy AI is the next-generation editorial platform designed to empower content teams with intelligent automation and data-driven insights.
          </p>

          <h2 style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink)', marginTop: '48px', marginBottom: '16px' }}>Our Mission</h2>
          <p style={{ marginBottom: '24px' }}>
            In an era of endless information, standing out requires more than just good writing—it requires strategic insight, perfect timing, and flawless execution. Our mission is to bridge the gap between creative storytelling and data-driven strategy. We built Trendy AI to eliminate the guesswork from content creation, allowing writers and editors to focus on what they do best: crafting compelling narratives.
          </p>

          <h2 style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink)', marginTop: '48px', marginBottom: '16px' }}>How It Works</h2>
          <p style={{ marginBottom: '24px' }}>
            Trendy operates as an autonomous editorial assistant, managing the entire lifecycle of a publication pipeline:
          </p>
          <ul style={{ marginBottom: '24px', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '12px' }}><strong>Trend Discovery:</strong> Our agents continuously monitor global data streams to identify rising topics before they peak.</li>
            <li style={{ marginBottom: '12px' }}><strong>Brief Generation:</strong> Once a trend is identified, the system generates comprehensive, SEO-optimised content briefs tailored to your specific audience.</li>
            <li style={{ marginBottom: '12px' }}><strong>Intelligent Matching:</strong> The platform analyses the availability, historical performance, and domain expertise of your writing team to assign the brief to the perfect candidate.</li>
            <li style={{ marginBottom: '12px' }}><strong>Automated Review:</strong> Submitted drafts are rigorously evaluated for readability, keyword density, and adherence to the original brief.</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink)', marginTop: '48px', marginBottom: '16px' }}>Privacy-First Architecture</h2>
          <p style={{ marginBottom: '24px' }}>
            We believe your data belongs to you. Unlike traditional cloud-based AI tools that siphon your proprietary strategies and content for training purposes, Trendy AI is designed to run locally. By allowing users to plug in their own API keys, we ensure that sensitive editorial strategies remain securely within your organisation's perimeter.
          </p>
        </div>
      </main>
    </div>
  );
}
