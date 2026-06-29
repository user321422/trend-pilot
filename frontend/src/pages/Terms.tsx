import { useNavigate } from 'react-router-dom';

export default function Terms() {
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
        <h1 style={{ fontFamily: 'var(--display)', fontSize: '48px', color: 'var(--ink)', marginBottom: '8px' }}>Terms of Service</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '40px' }}>Effective Date: June 22, 2026</p>
        
        <div style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--body)' }}>
          <p style={{ marginBottom: '24px' }}>
            Welcome to Trendy AI. These Terms of Service ("Terms") govern your access to and use of our website, application, and related services. Please read these Terms carefully before using the platform.
          </p>

          <h2 style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink)', marginTop: '40px', marginBottom: '16px' }}>1. Acceptance of Terms</h2>
          <p style={{ marginBottom: '24px' }}>
            By accessing or using Trendy AI, you agree to be bound by these Terms and all applicable laws and regulations. If you do not agree with any part of these Terms, you are prohibited from using or accessing this site.
          </p>

          <h2 style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink)', marginTop: '40px', marginBottom: '16px' }}>2. Use License</h2>
          <p style={{ marginBottom: '16px' }}>
            Permission is granted to temporarily download one copy of the materials (information or software) on Trendy AI for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul style={{ marginBottom: '24px', paddingLeft: '24px' }}>
            <li style={{ marginBottom: '8px' }}>modify or copy the materials;</li>
            <li style={{ marginBottom: '8px' }}>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li style={{ marginBottom: '8px' }}>attempt to decompile or reverse engineer any software contained on Trendy AI;</li>
            <li style={{ marginBottom: '8px' }}>remove any copyright or other proprietary notations from the materials; or</li>
            <li style={{ marginBottom: '8px' }}>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink)', marginTop: '40px', marginBottom: '16px' }}>3. Third-Party API Usage</h2>
          <p style={{ marginBottom: '24px' }}>
            Trendy AI allows you to connect third-party AI services via your own API keys. You are solely responsible for compliance with the terms of service, usage policies, and billing requirements of those third-party providers. Trendy AI shall not be liable for any costs, suspensions, or bans resulting from your use of third-party APIs.
          </p>

          <h2 style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink)', marginTop: '40px', marginBottom: '16px' }}>4. Content Generation and Ownership</h2>
          <p style={{ marginBottom: '24px' }}>
            You retain all rights and ownership to the content generated through your use of Trendy AI. However, you are entirely responsible for the nature and legality of the generated content. Trendy AI expressly disclaims any liability arising from copyright infringement, plagiarism, or the generation of offensive material resulting from your prompts or configurations.
          </p>

          <h2 style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink)', marginTop: '40px', marginBottom: '16px' }}>5. Disclaimer</h2>
          <p style={{ marginBottom: '24px' }}>
            The materials on Trendy AI are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>

          <h2 style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink)', marginTop: '40px', marginBottom: '16px' }}>6. Limitations</h2>
          <p style={{ marginBottom: '24px' }}>
            In no event shall Trendy AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Trendy AI, even if we have been notified orally or in writing of the possibility of such damage.
          </p>

          <h2 style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink)', marginTop: '40px', marginBottom: '16px' }}>7. Governing Law</h2>
          <p style={{ marginBottom: '24px' }}>
            These terms and conditions are governed by and construed in accordance with the laws of your jurisdiction, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
        </div>
      </main>
    </div>
  );
}
