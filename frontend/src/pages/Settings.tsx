import { useState, useEffect } from 'react';
import { orchestrator } from '../services/api';
import type { OrchestratorSettings } from '../services/api';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [orchSettings, setOrchSettings] = useState<OrchestratorSettings>({
    autoGenerateBriefs: true,
    autoAssignBriefs: true,
    autoWriteDrafts: true,
    autoReviewDrafts: true,
    autoPublish: false
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saveOrchSuccess, setSaveOrchSuccess] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('tp_openai_api_key');
    if (savedKey) setApiKey(savedKey);

    orchestrator.getSettings()
      .then(res => {
        setOrchSettings(res);
      })
      .catch(err => console.error("Failed to load orchestrator settings:", err))
      .finally(() => setLoadingSettings(false));
  }, []);

  const handleSave = () => {
    localStorage.setItem('tp_openai_api_key', apiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleOrchSettingChange = async (key: keyof OrchestratorSettings, value: boolean) => {
    const updated = { ...orchSettings, [key]: value };
    setOrchSettings(updated);
    setSaveOrchSuccess(false);
    try {
      await orchestrator.updateSettings(updated);
      setSaveOrchSuccess(true);
      setTimeout(() => setSaveOrchSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to update orchestrator settings:", e);
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
      <div className="page-container">
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

      {/* Autonomous Orchestrator Settings */}
      <div style={{ padding: '32px', background: 'var(--surface-card)', borderRadius: '12px', border: '1px solid var(--hairline)', marginTop: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: 'var(--ink)' }}>Autonomous Engine Configuration</h3>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
          Select which parts of the content creation lifecycle are automatically handled by background agents when triggered.
        </p>

        {loadingSettings ? (
          <p style={{ color: 'var(--muted)' }}>Loading configuration...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', color: 'var(--ink)' }}>
              <input
                type="checkbox"
                checked={orchSettings.autoGenerateBriefs}
                onChange={(e) => handleOrchSettingChange('autoGenerateBriefs', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)' }}
              />
              <div>
                <strong>Auto-Generate Briefs</strong>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>Automatically construct comprehensive content outlines for discovered trends.</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', color: 'var(--ink)' }}>
              <input
                type="checkbox"
                checked={orchSettings.autoAssignBriefs}
                onChange={(e) => handleOrchSettingChange('autoAssignBriefs', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)' }}
              />
              <div>
                <strong>Auto-Assign Writers</strong>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>Identify the best qualified team member or AI agent for approved briefs.</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', color: 'var(--ink)' }}>
              <input
                type="checkbox"
                checked={orchSettings.autoWriteDrafts}
                onChange={(e) => handleOrchSettingChange('autoWriteDrafts', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)' }}
              />
              <div>
                <strong>Auto-Write Drafts</strong>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>Use Alibaba Qwen Cloud to automatically compose first-draft articles.</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', color: 'var(--ink)' }}>
              <input
                type="checkbox"
                checked={orchSettings.autoReviewDrafts}
                onChange={(e) => handleOrchSettingChange('autoReviewDrafts', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)' }}
              />
              <div>
                <strong>Auto-Review Drafts</strong>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>Review compliance, SEO keywords, and assign readability score automatically.</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', color: 'var(--ink)' }}>
              <input
                type="checkbox"
                checked={orchSettings.autoPublish}
                onChange={(e) => handleOrchSettingChange('autoPublish', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)' }}
              />
              <div>
                <strong>Auto-Publish Articles</strong>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>Instantly push final documents to your active publishing targets (Medium, Dev.to, etc.).</div>
              </div>
            </label>
            
            {saveOrchSuccess && (
              <span style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600, marginTop: '8px' }}>✓ Settings updated and applied successfully!</span>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
