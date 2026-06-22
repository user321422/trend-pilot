import { useState, useEffect } from 'react';

export default function Appearance() {
  const [theme, setTheme] = useState(localStorage.getItem('tp_theme') || 'system');

  useEffect(() => {
    localStorage.setItem('tp_theme', theme);
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const buttonStyle = (selected: boolean) => ({
    padding: '12px 24px',
    borderRadius: '8px',
    border: `1px solid ${selected ? 'var(--primary)' : 'var(--hairline)'}`,
    background: selected ? 'rgba(204, 120, 92, 0.1)' : 'var(--canvas)',
    color: selected ? 'var(--primary)' : 'var(--ink)',
    fontWeight: selected ? 600 : 500,
    cursor: 'pointer',
    flex: 1
  });

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: '36px', margin: '0 0 8px', color: 'var(--ink)' }}>Appearance</h1>
        <p style={{ color: 'var(--body)', fontSize: '16px' }}>Customize the look and feel of Trendy.</p>
      </div>

      <div style={{ padding: '32px', background: 'var(--surface-card)', borderRadius: '12px', border: '1px solid var(--hairline)' }}>
        <h3 style={{ margin: '0 0 24px', fontSize: '18px', color: 'var(--ink)' }}>Theme Preference</h3>
        <div style={{ display: 'flex', gap: '16px', maxWidth: '600px' }}>
          <button style={buttonStyle(theme === 'bright')} onClick={() => setTheme('bright')}>
            Bright Mode
          </button>
          <button style={buttonStyle(theme === 'dark')} onClick={() => setTheme('dark')}>
            Dark Mode
          </button>
          <button style={buttonStyle(theme === 'system')} onClick={() => setTheme('system')}>
            System Default
          </button>
        </div>
      </div>
    </div>
  );
}
