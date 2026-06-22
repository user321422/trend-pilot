import { useState, useEffect } from 'react';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('tp_openai_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('tp_openai_api_key', apiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: '36px', margin: '0 0 8px', color: 'var(--ink)' }}>Settings</h1>
        <p style={{ color: 'var(--body)', fontSize: '16px' }}>Configure application preferences.</p>
      </div>

      <div style={{ padding: '32px', background: 'var(--surface-card)', borderRadius: '12px', border: '1px solid var(--hairline)' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: 'var(--ink)' }}>Local API Configuration</h3>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
          Provide your own API key to run AI tasks on your local device. This key is stored securely in your browser's local storage and is never transmitted to our servers.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '500px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--body-strong)' }}>API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            style={{
              padding: '12px 16px',
              borderRadius: '6px',
              border: '1px solid var(--hairline)',
              background: 'var(--canvas)',
              color: 'var(--ink)',
              fontSize: '15px'
            }}
          />
          <button 
            onClick={handleSave}
            style={{
              marginTop: '8px',
              padding: '12px 24px',
              borderRadius: '6px',
              background: 'var(--primary)',
              color: 'var(--on-primary)',
              fontWeight: 600,
              fontSize: '14px',
              alignSelf: 'flex-start',
              transition: 'background 0.2s'
            }}
          >
            {isSaved ? 'Saved!' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
