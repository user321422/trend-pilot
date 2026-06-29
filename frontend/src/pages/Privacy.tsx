import { useNavigate } from 'react-router-dom';

export default function Privacy() {
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
        <h1 style={{ fontFamily: 'var(--display)', fontSize: '48px', color: 'var(--ink)', marginBottom: '8px' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '40px' }}>Last Updated: June 22, 2026</p>
        
        <div style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--body)' }}>
          <p style={{ marginBottom: '24px' }}>
            At Trendy AI ("we," "our," or "us"), we are committed to protecting your privacy. This Privacy Policy explains how your information is collected, used, and disclosed by Trendy AI. By using our application, you consent to the data practices described in this statement.
          </p>

          <h2 style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink)', marginTop: '40px', marginBottom: '16px' }}>1. Information We Collect</h2>
          <p style={{ marginBottom: '16px' }}>
            <strong>Local API Keys:</strong> Trendy AI allows you to input third-party API keys (e.g., OpenAI keys) to process data locally. These keys are stored solely in your browser's local storage (`localStorage`). They are never transmitted to our servers or any third party other than the designated API provider.
          </p>
          <p style={{ marginBottom: '24px' }}>
            <strong>Account Information:</strong> If you register for an account, we collect basic information such as your name, email address, and assigned organisational role. This information is used strictly for authentication and application routing.
          </p>

          <h2 style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink)', marginTop: '40px', marginBottom: '16px' }}>2. How We Use Your Information</h2>
          <p style={{ marginBottom: '24px' }}>
            The information we collect is used primarily to maintain the functionality and security of the Trendy platform. Your local API key is used directly by your browser to send requests to the AI provider. Your content, including drafts, trends, and editorial briefs, are processed on your device and are not harvested by Trendy AI for model training or data brokering.
          </p>

          <h2 style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink)', marginTop: '40px', marginBottom: '16px' }}>3. Data Sharing and Disclosure</h2>
          <p style={{ marginBottom: '24px' }}>
            We do not sell, trade, or rent your personal identification information to others. Content generated through your usage of the application is routed through the API provider of your choice, and is therefore subject to the privacy policies of that specific provider (e.g., OpenAI, Anthropic). We strongly encourage you to review their respective privacy agreements.
          </p>

          <h2 style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink)', marginTop: '40px', marginBottom: '16px' }}>4. Security of Your Information</h2>
          <p style={{ marginBottom: '24px' }}>
            We implement a variety of security measures to maintain the safety of your personal information. However, please be aware that no method of transmission over the internet, or method of electronic storage, is 100% secure. You are responsible for keeping your API keys safe and ensuring your personal device is secure.
          </p>

          <h2 style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink)', marginTop: '40px', marginBottom: '16px' }}>5. Changes to This Privacy Policy</h2>
          <p style={{ marginBottom: '24px' }}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </div>
      </main>
    </div>
  );
}
