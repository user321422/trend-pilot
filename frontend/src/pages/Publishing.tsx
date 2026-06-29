import { useEffect, useState } from 'react';
import type { Assignment, PublishSchedule, SocialPosts, ExportPayload, DispatchTargets } from '../services/api';
import { assignments as assignmentsApi, publish as publishApi } from '../services/api';

export default function Publishing() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'schedule' | 'social' | 'export' | 'targets'>('schedule');

  const [schedule, setSchedule] = useState<PublishSchedule | null>(null);
  const [socialPosts, setSocialPosts] = useState<SocialPosts | null>(null);
  const [exportPayload, setExportPayload] = useState<ExportPayload | null>(null);

  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  const [targets, setTargets] = useState<DispatchTargets>({
    medium: { enabled: false, token: '', pubId: '' },
    devto: { enabled: false, apiKey: '' },
    webhook: { enabled: false, url: '', secret: '' },
    wordpress: { enabled: false, url: '', username: '', password: '' },
    ghost: { enabled: false, url: '', apiKey: '' },
    linkedin: { enabled: false, token: '' },
    twitter: { enabled: false, apiKey: '' },
  });

  const [publishing, setPublishing] = useState(false);
  const [publishReport, setPublishReport] = useState<any>(null);

  const [publishingPlatform, setPublishingPlatform] = useState<Record<string, boolean>>({
    medium: false,
    devto: false,
    webhook: false,
    wordpress: false,
    ghost: false,
    linkedin: false,
    twitter: false,
  });

  const [verifyStatus, setVerifyStatus] = useState<Record<string, { loading: boolean; error?: string; successMsg?: string }>>({
    medium: { loading: false },
    devto: { loading: false },
    webhook: { loading: false },
    wordpress: { loading: false },
    ghost: { loading: false },
    linkedin: { loading: false },
    twitter: { loading: false },
  });

  useEffect(() => {
    const saved = localStorage.getItem('tp_publish_targets');
    if (saved) {
      try {
        setTargets(prev => ({
          ...prev,
          ...JSON.parse(saved)
        }));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveConfiguration = () => {
    localStorage.setItem('tp_publish_targets', JSON.stringify(targets));
    alert('Publishing destinations configuration saved!');
  };

  const handlePublish = async () => {
    if (selectedAssignment?.draft) {
      setPublishing(true);
      setPublishReport(null);
      try {
        const res = await publishApi.dispatch(selectedAssignment.draft.id, targets);
        setPublishReport(res.results);
      } catch (e: any) {
        alert(e.message || 'Publish dispatch failed');
      } finally {
        setPublishing(false);
      }
    }
  };

  const handlePublishSingle = async (platform: 'medium' | 'devto' | 'webhook' | 'wordpress' | 'ghost' | 'linkedin' | 'twitter') => {
    if (!selectedAssignment?.draft) return;
    setPublishingPlatform(prev => ({ ...prev, [platform]: true }));
    try {
      const targetConfig: DispatchTargets = {
        [platform]: {
          enabled: true,
          apiKey: platform === 'devto' ? targets.devto?.apiKey : (platform === 'ghost' ? targets.ghost?.apiKey : (platform === 'twitter' ? targets.twitter?.apiKey : undefined)),
          token: platform === 'medium' ? targets.medium?.token : (platform === 'linkedin' ? targets.linkedin?.token : undefined),
          url: platform === 'webhook' ? targets.webhook?.url : (platform === 'wordpress' ? targets.wordpress?.url : undefined),
          secret: platform === 'webhook' ? targets.webhook?.secret : undefined,
          username: platform === 'wordpress' ? targets.wordpress?.username : undefined,
          password: platform === 'wordpress' ? targets.wordpress?.password : undefined,
        }
      };

      const res = await publishApi.dispatch(selectedAssignment.draft.id, targetConfig);
      const result = res.results[platform];
      if (result?.success) {
        alert(`Successfully published to ${platform.toUpperCase()}!\nLink: ${(result as any).url || 'N/A'}`);
      } else {
        alert(`Failed to publish to ${platform.toUpperCase()}: ${result?.error || 'Unknown error'}`);
      }
    } catch (e: any) {
      alert(`Error publishing to ${platform.toUpperCase()}: ${e.message}`);
    } finally {
      setPublishingPlatform(prev => ({ ...prev, [platform]: false }));
    }
  };

  const testConnection = async (type: 'medium' | 'devto' | 'webhook' | 'wordpress' | 'ghost' | 'linkedin' | 'twitter') => {
    setVerifyStatus(prev => ({
      ...prev,
      [type]: { loading: true, error: undefined, successMsg: undefined }
    }));
    try {
      const credentials = targets[type];
      const res = await publishApi.verifyTarget(type, credentials);
      if (res.success) {
        setVerifyStatus(prev => ({
          ...prev,
          [type]: { loading: false, successMsg: res.message || 'Connected successfully!' }
        }));
      } else {
        setVerifyStatus(prev => ({
          ...prev,
          [type]: { loading: false, error: res.error || 'Connection failed' }
        }));
      }
    } catch (e: any) {
      setVerifyStatus(prev => ({
        ...prev,
        [type]: { loading: false, error: e.message || 'Unknown error' }
      }));
    }
  };

  useEffect(() => {
    assignmentsApi.list()
      .then(res => {
        const list = Array.isArray(res) ? res : (res.assignments || []);
        const filtered = list.filter(a => a.draft && a.draft.content.trim().length > 0);
        setAssignments(filtered);
        if (filtered.length > 0) {
          setSelectedId(filtered[0].id);
        }
      })
      .catch(e => setErrorMsg(e.message))
      .finally(() => setLoadingQueue(false));
  }, []);

  const selectedAssignment = assignments.find(a => a.id === selectedId);

  useEffect(() => {
    if (!selectedAssignment) return;

    if (activeTab === 'schedule' && !schedule) {
      setLoadingSchedule(true);
      publishApi.schedule(selectedAssignment.briefId)
        .then(res => setSchedule(res.schedule))
        .catch(err => console.error(err))
        .finally(() => setLoadingSchedule(false));
    } else if (activeTab === 'social' && !socialPosts && selectedAssignment.draft) {
      setLoadingSocial(true);
      publishApi.social(selectedAssignment.draft.id)
        .then(res => setSocialPosts(res.posts))
        .catch(err => console.error(err))
        .finally(() => setLoadingSocial(false));
    } else if (activeTab === 'export' && !exportPayload && selectedAssignment.draft) {
      setLoadingExport(true);
      publishApi.export(selectedAssignment.draft.id)
        .then(res => setExportPayload(res))
        .catch(err => console.error(err))
        .finally(() => setLoadingExport(false));
    }
  }, [selectedId, activeTab]);

  useEffect(() => {
    setSchedule(null);
    setSocialPosts(null);
    setExportPayload(null);
  }, [selectedId]);

  const downloadJsonExport = () => {
    if (!exportPayload) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `trendy-export-${selectedAssignment?.brief?.h1?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'draft'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Sidebar: queue of completed assignments */}
      <div style={{
        width: '320px',
        borderRight: '1px solid var(--hairline)',
        background: 'var(--surface-soft)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--hairline)' }}>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--display)', margin: '0 0 4px', color: 'var(--ink)' }}>
            Publishing & Distribution
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
            Agent 5: Scheduler, Social Planner & Exporter.
          </p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {loadingQueue ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
              Loading queue...
            </div>
          ) : errorMsg ? (
            <div style={{ padding: '20px', color: '#ef4444', fontSize: '14px' }}>
              {errorMsg}
            </div>
          ) : assignments.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚀</div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '4px' }}>
                Queue empty
              </div>
              <p style={{ fontSize: '12px', margin: 0 }}>
                No drafts have been reviewed and approved for publication yet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {assignments.map(item => {
                const isSelected = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '14px',
                      borderRadius: '8px',
                      background: isSelected ? 'var(--surface-card)' : 'transparent',
                      border: isSelected ? '1px solid var(--hairline)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      fontWeight: 600,
                      fontSize: '14px',
                      color: 'var(--ink)',
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.brief?.h1 || 'Untitled Document'}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                      color: 'var(--muted)'
                    }}>
                      <span>By {item.writer?.name || 'AI Writer'}</span>
                      <span style={{
                        background: item.status === 'COMPLETED' ? '#d1fae5' : '#dbeafe',
                        color: item.status === 'COMPLETED' ? '#065f46' : '#1e40af',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        fontSize: '10px'
                      }}>
                        {item.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main content pane */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        background: 'var(--canvas)'
      }}>
        {selectedAssignment ? (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div style={{
              padding: '30px 40px',
              borderBottom: '1px solid var(--hairline)',
              background: 'var(--surface-card)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{
                    fontSize: '24px',
                    fontFamily: 'var(--display)',
                    color: 'var(--ink)',
                    margin: '0 0 8px'
                  }}>
                    {selectedAssignment.brief?.h1 || 'Untitled Article'}
                  </h1>
                  <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
                    Select scheduling details, generated social hooks, or export the finalized document schema.
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
                <button
                  onClick={() => setActiveTab('schedule')}
                  style={{
                    padding: '8px 4px',
                    border: 'none',
                    background: 'transparent',
                    color: activeTab === 'schedule' ? 'var(--accent)' : 'var(--muted)',
                    borderBottom: activeTab === 'schedule' ? '2px solid var(--accent)' : '2px solid transparent',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'schedule' ? 600 : 500,
                    fontSize: '14px'
                  }}
                >
                  📅 Publish Schedule
                </button>
                <button
                  onClick={() => setActiveTab('social')}
                  style={{
                    padding: '8px 4px',
                    border: 'none',
                    background: 'transparent',
                    color: activeTab === 'social' ? 'var(--accent)' : 'var(--muted)',
                    borderBottom: activeTab === 'social' ? '2px solid var(--accent)' : '2px solid transparent',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'social' ? 600 : 500,
                    fontSize: '14px'
                  }}
                >
                  ✨ Social Shares
                </button>
                <button
                  onClick={() => setActiveTab('export')}
                  style={{
                    padding: '8px 4px',
                    border: 'none',
                    background: 'transparent',
                    color: activeTab === 'export' ? 'var(--accent)' : 'var(--muted)',
                    borderBottom: activeTab === 'export' ? '2px solid var(--accent)' : '2px solid transparent',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'export' ? 600 : 500,
                    fontSize: '14px'
                  }}
                >
                  📦 CMS Export Package
                </button>
                <button
                  onClick={() => setActiveTab('targets')}
                  style={{
                    padding: '8px 4px',
                    border: 'none',
                    background: 'transparent',
                    color: activeTab === 'targets' ? 'var(--accent)' : 'var(--muted)',
                    borderBottom: activeTab === 'targets' ? '2px solid var(--accent)' : '2px solid transparent',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'targets' ? 600 : 500,
                    fontSize: '14px'
                  }}
                >
                  🌐 Publishing Targets
                </button>
              </div>
            </div>

            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
              {/* Tab 1: Schedule */}
              {activeTab === 'schedule' && (
                <div style={{ maxWidth: '650px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {loadingSchedule ? (
                    <div style={{ color: 'var(--muted)' }}>Calculating optimum publish windows...</div>
                  ) : schedule ? (
                    <>
                      <div style={{
                        background: 'var(--surface-card)',
                        border: '1px solid var(--hairline)',
                        borderRadius: '12px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}>
                        <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--ink)' }}>AI Scheduling Strategy</h3>
                        <div style={{ height: '1px', background: 'var(--hairline)' }} />
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Recommended Publish Date
                          </div>
                          <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>
                            {new Date(schedule.suggestedPublishAt).toLocaleDateString(undefined, {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Optimal Peak Times
                          </div>
                          <div style={{ fontSize: '15px', color: 'var(--ink)' }}>
                            {schedule.recommendedTimeUTC} ({schedule.recommendedDays})
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Scheduling Rationale
                          </div>
                          <p style={{ fontSize: '14px', color: 'var(--body)', lineHeight: 1.6, margin: 0 }}>
                            {schedule.rationale}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => alert('Article scheduled for automatic release.')}
                        style={{
                          background: 'var(--accent)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '12px 24px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          alignSelf: 'flex-start'
                        }}
                      >
                        Approve & Queue Schedule
                      </button>
                    </>
                  ) : (
                    <div style={{ color: 'var(--muted)' }}>No scheduling recommendations available.</div>
                  )}
                </div>
              )}

              {/* Tab 2: Social Shares */}
              {activeTab === 'social' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
                  {loadingSocial ? (
                    <div style={{ color: 'var(--muted)' }}>Drafting social media campaigns...</div>
                  ) : socialPosts ? (
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                      {/* LinkedIn block */}
                      <div style={{
                        flex: 1,
                        minWidth: '300px',
                        background: 'var(--surface-card)',
                        border: '1px solid var(--hairline)',
                        borderRadius: '12px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '15px' }}>LinkedIn Post</span>
                            <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                              Professional
                            </span>
                          </div>
                          <p style={{
                            fontSize: '14px',
                            color: 'var(--body)',
                            lineHeight: 1.6,
                            background: 'var(--canvas)',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid var(--hairline)',
                            whiteSpace: 'pre-wrap',
                            margin: '0 0 20px'
                          }}>
                            {socialPosts.linkedin.post}
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <button
                            onClick={() => copyToClipboard(socialPosts.linkedin.post)}
                            style={{
                              width: '100%',
                              background: 'var(--surface-soft)',
                              border: '1px solid var(--hairline)',
                              borderRadius: '6px',
                              padding: '10px',
                              fontWeight: 600,
                              color: 'var(--ink)',
                              cursor: 'pointer'
                            }}
                          >
                            Copy LinkedIn Copy
                          </button>
                          <button
                            onClick={() => handlePublishSingle('linkedin')}
                            disabled={publishingPlatform.linkedin}
                            style={{
                              width: '100%',
                              background: 'var(--accent)',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '10px',
                              fontWeight: 600,
                              color: 'white',
                              cursor: publishingPlatform.linkedin ? 'not-allowed' : 'pointer',
                              opacity: publishingPlatform.linkedin ? 0.7 : 1
                            }}
                          >
                            {publishingPlatform.linkedin ? 'Sharing...' : 'Share Now to LinkedIn 🚀'}
                          </button>
                        </div>
                      </div>

                      {/* Twitter block */}
                      <div style={{
                        flex: 1,
                        minWidth: '300px',
                        background: 'var(--surface-card)',
                        border: '1px solid var(--hairline)',
                        borderRadius: '12px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '15px' }}>Twitter / X Post</span>
                            <span style={{ fontSize: '11px', background: '#f3e8ff', color: '#6b21a8', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                              Short Hook
                            </span>
                          </div>
                          <p style={{
                            fontSize: '14px',
                            color: 'var(--body)',
                            lineHeight: 1.6,
                            background: 'var(--canvas)',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid var(--hairline)',
                            whiteSpace: 'pre-wrap',
                            margin: '0 0 20px'
                          }}>
                            {socialPosts.twitter.post}
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <button
                            onClick={() => copyToClipboard(socialPosts.twitter.post)}
                            style={{
                              width: '100%',
                              background: 'var(--surface-soft)',
                              border: '1px solid var(--hairline)',
                              borderRadius: '6px',
                              padding: '10px',
                              fontWeight: 600,
                              color: 'var(--ink)',
                              cursor: 'pointer'
                            }}
                          >
                            Copy Tweet Copy
                          </button>
                          <button
                            onClick={() => handlePublishSingle('twitter')}
                            disabled={publishingPlatform.twitter}
                            style={{
                              width: '100%',
                              background: 'var(--accent)',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '10px',
                              fontWeight: 600,
                              color: 'white',
                              cursor: publishingPlatform.twitter ? 'not-allowed' : 'pointer',
                              opacity: publishingPlatform.twitter ? 0.7 : 1
                            }}
                          >
                            {publishingPlatform.twitter ? 'Sharing...' : 'Share Now to Twitter 🚀'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--muted)' }}>No social posts generated yet.</div>
                  )}
                </div>
              )}

              {/* Tab 3: CMS Export Package */}
              {activeTab === 'export' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
                  {loadingExport ? (
                    <div style={{ color: 'var(--muted)' }}>Packaging CMS assets...</div>
                  ) : exportPayload ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--ink)' }}>Export Schema (JSON)</h3>
                        <button
                          onClick={downloadJsonExport}
                          style={{
                            background: 'var(--accent)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Download JSON Export
                        </button>
                      </div>
                      <pre style={{
                        background: 'var(--surface-soft)',
                        border: '1px solid var(--hairline)',
                        borderRadius: '8px',
                        padding: '24px',
                        overflowX: 'auto',
                        fontSize: '13px',
                        fontFamily: 'var(--mono)',
                        color: 'var(--body)',
                        margin: 0,
                        maxHeight: '400px'
                      }}>
                        {JSON.stringify(exportPayload, null, 2)}
                      </pre>
                    </>
                  ) : (
                    <div style={{ color: 'var(--muted)' }}>No export payload generated.</div>
                  )}
                </div>
              )}

              {/* Tab 4: Publishing Targets */}
              {activeTab === 'targets' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '750px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Dev.to Publication */}
                    <div style={{
                      background: 'var(--surface-card)',
                      border: '1px solid var(--hairline)',
                      borderRadius: '12px',
                      padding: '24px',
                      boxShadow: '0 2px 8px rgba(20, 20, 19, 0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--ink)' }}>Dev.to Publication</h3>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>Publish directly to the Dev.to community feed</p>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={targets.devto?.enabled || false}
                            onChange={e => setTargets({
                              ...targets,
                              devto: { ...targets.devto, enabled: e.target.checked }
                            })}
                          />
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>Enable</span>
                        </label>
                      </div>
                      {targets.devto?.enabled && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>API Key</label>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <input
                              type="password"
                              placeholder="Enter your Dev.to API Key"
                              value={targets.devto.apiKey || ''}
                              onChange={e => setTargets({
                                ...targets,
                                devto: { ...targets.devto, apiKey: e.target.value }
                              })}
                              style={{
                                flex: 1,
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--hairline)',
                                background: 'var(--surface-soft)',
                                color: 'var(--ink)',
                                fontSize: '14px'
                              }}
                            />
                            <button
                              onClick={() => testConnection('devto')}
                              disabled={verifyStatus.devto.loading || !targets.devto.apiKey}
                              style={{
                                padding: '10px 16px',
                                background: 'var(--surface-soft)',
                                border: '1px solid var(--hairline)',
                                borderRadius: '6px',
                                color: 'var(--ink)',
                                fontWeight: 600,
                                fontSize: '13px',
                                cursor: 'pointer'
                              }}
                            >
                              {verifyStatus.devto.loading ? 'Testing...' : 'Test Connection'}
                            </button>
                            <button
                              onClick={() => handlePublishSingle('devto')}
                              disabled={publishingPlatform.devto || !targets.devto.apiKey}
                              style={{
                                padding: '10px 16px',
                                background: 'var(--accent)',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '13px',
                                cursor: (publishingPlatform.devto || !targets.devto.apiKey) ? 'not-allowed' : 'pointer',
                                opacity: (publishingPlatform.devto || !targets.devto.apiKey) ? 0.7 : 1
                              }}
                            >
                              {publishingPlatform.devto ? 'Publishing...' : 'Publish to Dev.to 🚀'}
                            </button>
                          </div>
                          {verifyStatus.devto.successMsg && (
                            <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 500, marginTop: '4px' }}>
                              ✓ {verifyStatus.devto.successMsg}
                            </div>
                          )}
                          {verifyStatus.devto.error && (
                            <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 500, marginTop: '4px' }}>
                              ✗ {verifyStatus.devto.error}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Medium Publication */}
                    <div style={{
                      background: 'var(--surface-card)',
                      border: '1px solid var(--hairline)',
                      borderRadius: '12px',
                      padding: '24px',
                      boxShadow: '0 2px 8px rgba(20, 20, 19, 0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--ink)' }}>Medium Publication</h3>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>Publish as a draft on your Medium profile</p>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={targets.medium?.enabled || false}
                            onChange={e => setTargets({
                              ...targets,
                              medium: { ...targets.medium, enabled: e.target.checked }
                            })}
                          />
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>Enable</span>
                        </label>
                      </div>
                      {targets.medium?.enabled && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Integration Token</label>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <input
                              type="password"
                              placeholder="Enter Medium Integration Token"
                              value={targets.medium.token || ''}
                              onChange={e => setTargets({
                                ...targets,
                                medium: { ...targets.medium, token: e.target.value }
                              })}
                              style={{
                                flex: 1,
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--hairline)',
                                background: 'var(--surface-soft)',
                                color: 'var(--ink)',
                                fontSize: '14px'
                              }}
                            />
                            <button
                              onClick={() => testConnection('medium')}
                              disabled={verifyStatus.medium.loading || !targets.medium.token}
                              style={{
                                padding: '10px 16px',
                                background: 'var(--surface-soft)',
                                border: '1px solid var(--hairline)',
                                borderRadius: '6px',
                                color: 'var(--ink)',
                                fontWeight: 600,
                                fontSize: '13px',
                                cursor: 'pointer'
                              }}
                            >
                              {verifyStatus.medium.loading ? 'Testing...' : 'Test Connection'}
                            </button>
                            <button
                              onClick={() => handlePublishSingle('medium')}
                              disabled={publishingPlatform.medium || !targets.medium.token}
                              style={{
                                padding: '10px 16px',
                                background: 'var(--accent)',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '13px',
                                cursor: (publishingPlatform.medium || !targets.medium.token) ? 'not-allowed' : 'pointer',
                                opacity: (publishingPlatform.medium || !targets.medium.token) ? 0.7 : 1
                              }}
                            >
                              {publishingPlatform.medium ? 'Publishing...' : 'Publish to Medium 🚀'}
                            </button>
                          </div>
                          {verifyStatus.medium.successMsg && (
                            <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 500, marginTop: '4px' }}>
                              ✓ {verifyStatus.medium.successMsg}
                            </div>
                          )}
                          {verifyStatus.medium.error && (
                            <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 500, marginTop: '4px' }}>
                              ✗ {verifyStatus.medium.error}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* LinkedIn Publication */}
                    <div style={{
                      background: 'var(--surface-card)',
                      border: '1px solid var(--hairline)',
                      borderRadius: '12px',
                      padding: '24px',
                      boxShadow: '0 2px 8px rgba(20, 20, 19, 0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--ink)' }}>LinkedIn Publication</h3>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>Automatically post updates directly to your LinkedIn page</p>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={targets.linkedin?.enabled || false}
                            onChange={e => setTargets({
                              ...targets,
                              linkedin: { ...targets.linkedin, enabled: e.target.checked }
                            })}
                          />
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>Enable</span>
                        </label>
                      </div>
                      {targets.linkedin?.enabled && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Access Token</label>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <input
                              type="password"
                              placeholder="Enter LinkedIn Access Token"
                              value={targets.linkedin.token || ''}
                              onChange={e => setTargets({
                                ...targets,
                                linkedin: { ...targets.linkedin, token: e.target.value }
                              })}
                              style={{
                                flex: 1,
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--hairline)',
                                background: 'var(--surface-soft)',
                                color: 'var(--ink)',
                                fontSize: '14px'
                              }}
                            />
                            <button
                              onClick={() => testConnection('linkedin')}
                              disabled={verifyStatus.linkedin.loading || !targets.linkedin.token}
                              style={{
                                padding: '10px 16px',
                                background: 'var(--surface-soft)',
                                border: '1px solid var(--hairline)',
                                borderRadius: '6px',
                                color: 'var(--ink)',
                                fontWeight: 600,
                                fontSize: '13px',
                                cursor: 'pointer'
                              }}
                            >
                              {verifyStatus.linkedin.loading ? 'Testing...' : 'Test Connection'}
                            </button>
                          </div>
                          {verifyStatus.linkedin.successMsg && (
                            <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 500, marginTop: '4px' }}>
                              ✓ {verifyStatus.linkedin.successMsg}
                            </div>
                          )}
                          {verifyStatus.linkedin.error && (
                            <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 500, marginTop: '4px' }}>
                              ✗ {verifyStatus.linkedin.error}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Twitter/X Publication */}
                    <div style={{
                      background: 'var(--surface-card)',
                      border: '1px solid var(--hairline)',
                      borderRadius: '12px',
                      padding: '24px',
                      boxShadow: '0 2px 8px rgba(20, 20, 19, 0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--ink)' }}>Twitter / X Publication</h3>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>Automatically post updates directly to your Twitter/X account</p>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={targets.twitter?.enabled || false}
                            onChange={e => setTargets({
                              ...targets,
                              twitter: { ...targets.twitter, enabled: e.target.checked }
                            })}
                          />
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>Enable</span>
                        </label>
                      </div>
                      {targets.twitter?.enabled && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>API Key / Bearer Token</label>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <input
                              type="password"
                              placeholder="Enter Twitter API Key"
                              value={targets.twitter.apiKey || ''}
                              onChange={e => setTargets({
                                ...targets,
                                twitter: { ...targets.twitter, apiKey: e.target.value }
                              })}
                              style={{
                                flex: 1,
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--hairline)',
                                background: 'var(--surface-soft)',
                                color: 'var(--ink)',
                                fontSize: '14px'
                              }}
                            />
                            <button
                              onClick={() => testConnection('twitter')}
                              disabled={verifyStatus.twitter.loading || !targets.twitter.apiKey}
                              style={{
                                padding: '10px 16px',
                                background: 'var(--surface-soft)',
                                border: '1px solid var(--hairline)',
                                borderRadius: '6px',
                                color: 'var(--ink)',
                                fontWeight: 600,
                                fontSize: '13px',
                                cursor: 'pointer'
                              }}
                            >
                              {verifyStatus.twitter.loading ? 'Testing...' : 'Test Connection'}
                            </button>
                          </div>
                          {verifyStatus.twitter.successMsg && (
                            <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 500, marginTop: '4px' }}>
                              ✓ {verifyStatus.twitter.successMsg}
                            </div>
                          )}
                          {verifyStatus.twitter.error && (
                            <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 500, marginTop: '4px' }}>
                              ✗ {verifyStatus.twitter.error}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Custom API Webhook */}
                    <div style={{
                      background: 'var(--surface-card)',
                      border: '1px solid var(--hairline)',
                      borderRadius: '12px',
                      padding: '24px',
                      boxShadow: '0 2px 8px rgba(20, 20, 19, 0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--ink)' }}>Custom API Webhook</h3>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                            Send publication JSON payloads to a custom endpoint (Slack, Zapier, etc.)
                          </p>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={targets.webhook?.enabled || false}
                            onChange={e => setTargets({
                              ...targets,
                              webhook: { ...targets.webhook, enabled: e.target.checked }
                            })}
                          />
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>Enable</span>
                        </label>
                      </div>
                      {targets.webhook?.enabled && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                              Webhook Endpoint URL
                            </label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <input
                                type="text"
                                placeholder="https://yourserver.com/api/webhook"
                                value={targets.webhook.url || ''}
                                onChange={e => setTargets({
                                  ...targets,
                                  webhook: { ...targets.webhook, url: e.target.value }
                                })}
                                style={{
                                  flex: 1,
                                  padding: '10px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--hairline)',
                                  background: 'var(--surface-soft)',
                                  color: 'var(--ink)',
                                  fontSize: '14px'
                                }}
                              />
                              <button
                                onClick={() => testConnection('webhook')}
                                disabled={verifyStatus.webhook.loading || !targets.webhook.url}
                                style={{
                                  padding: '10px 16px',
                                  background: 'var(--surface-soft)',
                                  border: '1px solid var(--hairline)',
                                  borderRadius: '6px',
                                  color: 'var(--ink)',
                                  fontWeight: 600,
                                  fontSize: '13px',
                                  cursor: 'pointer'
                                }}
                              >
                                {verifyStatus.webhook.loading ? 'Testing...' : 'Test Connection'}
                              </button>
                              <button
                                onClick={() => handlePublishSingle('webhook')}
                                disabled={publishingPlatform.webhook || !targets.webhook.url}
                                style={{
                                  padding: '10px 16px',
                                  background: 'var(--accent)',
                                  border: 'none',
                                  borderRadius: '6px',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '13px',
                                  cursor: (publishingPlatform.webhook || !targets.webhook.url) ? 'not-allowed' : 'pointer',
                                  opacity: (publishingPlatform.webhook || !targets.webhook.url) ? 0.7 : 1
                                }}
                              >
                                {publishingPlatform.webhook ? 'Triggering...' : 'Trigger Webhook 🚀'}
                              </button>
                            </div>
                            {verifyStatus.webhook.successMsg && (
                              <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 500, marginTop: '4px' }}>
                                ✓ {verifyStatus.webhook.successMsg}
                              </div>
                            )}
                            {verifyStatus.webhook.error && (
                              <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 500, marginTop: '4px' }}>
                                ✗ {verifyStatus.webhook.error}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                              Secret Key Signature (Optional)
                            </label>
                            <input
                              type="password"
                              placeholder="Enter Webhook signature secret"
                              value={targets.webhook.secret || ''}
                              onChange={e => setTargets({
                                ...targets,
                                webhook: { ...targets.webhook, secret: e.target.value }
                              })}
                              style={{
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--hairline)',
                                background: 'var(--surface-soft)',
                                color: 'var(--ink)',
                                fontSize: '14px'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* WordPress Site */}
                    <div style={{
                      background: 'var(--surface-card)',
                      border: '1px solid var(--hairline)',
                      borderRadius: '12px',
                      padding: '24px',
                      boxShadow: '0 2px 8px rgba(20, 20, 19, 0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--ink)' }}>WordPress Site</h3>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                            Publish directly to your individual WordPress website
                          </p>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={targets.wordpress?.enabled || false}
                            onChange={e => setTargets({
                              ...targets,
                              wordpress: { ...targets.wordpress, enabled: e.target.checked }
                            })}
                          />
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>Enable</span>
                        </label>
                      </div>
                      {targets.wordpress?.enabled && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                              WordPress Site URL
                            </label>
                            <input
                              type="text"
                              placeholder="https://yourwordpressblog.com"
                              value={targets.wordpress.url || ''}
                              onChange={e => setTargets({
                                ...targets,
                                wordpress: { ...targets.wordpress, url: e.target.value }
                              })}
                              style={{
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--hairline)',
                                background: 'var(--surface-soft)',
                                color: 'var(--ink)',
                                fontSize: '14px'
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                                Username
                              </label>
                              <input
                                type="text"
                                placeholder="WordPress Username"
                                value={targets.wordpress.username || ''}
                                onChange={e => setTargets({
                                  ...targets,
                                  wordpress: { ...targets.wordpress, username: e.target.value }
                                })}
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--hairline)',
                                  background: 'var(--surface-soft)',
                                  color: 'var(--ink)',
                                  fontSize: '14px'
                                }}
                              />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                                Application Password
                              </label>
                              <div style={{ display: 'flex', gap: '12px' }}>
                                <input
                                  type="password"
                                  placeholder="xxxx xxxx xxxx xxxx"
                                  value={targets.wordpress.password || ''}
                                  onChange={e => setTargets({
                                    ...targets,
                                    wordpress: { ...targets.wordpress, password: e.target.value }
                                  })}
                                  style={{
                                    flex: 1,
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--hairline)',
                                    background: 'var(--surface-soft)',
                                    color: 'var(--ink)',
                                    fontSize: '14px'
                                  }}
                                />
                                <button
                                  onClick={() => testConnection('wordpress')}
                                  disabled={verifyStatus.wordpress.loading || !targets.wordpress.url || !targets.wordpress.username || !targets.wordpress.password}
                                  style={{
                                    padding: '10px 16px',
                                    background: 'var(--surface-soft)',
                                    border: '1px solid var(--hairline)',
                                    borderRadius: '6px',
                                    color: 'var(--ink)',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {verifyStatus.wordpress.loading ? 'Testing...' : 'Test Connection'}
                                </button>
                                <button
                                  onClick={() => handlePublishSingle('wordpress')}
                                  disabled={publishingPlatform.wordpress || !targets.wordpress.url || !targets.wordpress.username || !targets.wordpress.password}
                                  style={{
                                    padding: '10px 16px',
                                    background: 'var(--accent)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    cursor: (publishingPlatform.wordpress || !targets.wordpress.url || !targets.wordpress.username || !targets.wordpress.password) ? 'not-allowed' : 'pointer',
                                    opacity: (publishingPlatform.wordpress || !targets.wordpress.url || !targets.wordpress.username || !targets.wordpress.password) ? 0.7 : 1
                                  }}
                                >
                                  {publishingPlatform.wordpress ? 'Publishing...' : 'Publish to WordPress 🚀'}
                                </button>
                              </div>
                            </div>
                          </div>
                          {verifyStatus.wordpress.successMsg && (
                            <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 500, marginTop: '4px' }}>
                              ✓ {verifyStatus.wordpress.successMsg}
                            </div>
                          )}
                          {verifyStatus.wordpress.error && (
                            <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 500, marginTop: '4px' }}>
                              ✗ {verifyStatus.wordpress.error}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Ghost Site */}
                    <div style={{
                      background: 'var(--surface-card)',
                      border: '1px solid var(--hairline)',
                      borderRadius: '12px',
                      padding: '24px',
                      boxShadow: '0 2px 8px rgba(20, 20, 19, 0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--ink)' }}>Ghost Site</h3>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                            Publish directly to your Ghost publication editor
                          </p>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={targets.ghost?.enabled || false}
                            onChange={e => setTargets({
                              ...targets,
                              ghost: { ...targets.ghost, enabled: e.target.checked }
                            })}
                          />
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>Enable</span>
                        </label>
                      </div>
                      {targets.ghost?.enabled && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                              Ghost URL
                            </label>
                            <input
                              type="text"
                              placeholder="https://yourghostblog.com"
                              value={targets.ghost.url || ''}
                              onChange={e => setTargets({
                                ...targets,
                                ghost: { ...targets.ghost, url: e.target.value }
                              })}
                              style={{
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--hairline)',
                                background: 'var(--surface-soft)',
                                color: 'var(--ink)',
                                fontSize: '14px'
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                              Admin API Key
                            </label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <input
                                type="password"
                                placeholder="id:secret"
                                value={targets.ghost.apiKey || ''}
                                onChange={e => setTargets({
                                  ...targets,
                                  ghost: { ...targets.ghost, apiKey: e.target.value }
                                })}
                                style={{
                                  flex: 1,
                                  padding: '10px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--hairline)',
                                  background: 'var(--surface-soft)',
                                  color: 'var(--ink)',
                                  fontSize: '14px'
                                }}
                              />
                              <button
                                onClick={() => testConnection('ghost')}
                                disabled={verifyStatus.ghost.loading || !targets.ghost.url || !targets.ghost.apiKey}
                                style={{
                                  padding: '10px 16px',
                                  background: 'var(--surface-soft)',
                                  border: '1px solid var(--hairline)',
                                  borderRadius: '6px',
                                  color: 'var(--ink)',
                                  fontWeight: 600,
                                  fontSize: '13px',
                                  cursor: 'pointer'
                                }}
                              >
                                {verifyStatus.ghost.loading ? 'Testing...' : 'Test Connection'}
                              </button>
                              <button
                                onClick={() => handlePublishSingle('ghost')}
                                disabled={publishingPlatform.ghost || !targets.ghost.url || !targets.ghost.apiKey}
                                style={{
                                  padding: '10px 16px',
                                  background: 'var(--accent)',
                                  border: 'none',
                                  borderRadius: '6px',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '13px',
                                  cursor: (publishingPlatform.ghost || !targets.ghost.url || !targets.ghost.apiKey) ? 'not-allowed' : 'pointer',
                                  opacity: (publishingPlatform.ghost || !targets.ghost.url || !targets.ghost.apiKey) ? 0.7 : 1
                                }}
                              >
                                {publishingPlatform.ghost ? 'Publishing...' : 'Publish to Ghost 🚀'}
                              </button>
                            </div>
                            {verifyStatus.ghost.successMsg && (
                              <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 500, marginTop: '4px' }}>
                                ✓ {verifyStatus.ghost.successMsg}
                              </div>
                            )}
                            {verifyStatus.ghost.error && (
                              <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 500, marginTop: '4px' }}>
                                ✗ {verifyStatus.ghost.error}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button
                      onClick={saveConfiguration}
                      style={{
                        background: 'var(--surface-soft)',
                        border: '1px solid var(--hairline)',
                        color: 'var(--ink)',
                        borderRadius: '6px',
                        padding: '12px 24px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Save Configuration
                    </button>
                    <button
                      onClick={handlePublish}
                      disabled={publishing || (!targets.devto?.enabled && !targets.medium?.enabled && !targets.webhook?.enabled && !targets.wordpress?.enabled && !targets.ghost?.enabled && !targets.linkedin?.enabled && !targets.twitter?.enabled)}
                      style={{
                        background: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '12px 24px',
                        fontWeight: 600,
                        cursor: publishing || (!targets.devto?.enabled && !targets.medium?.enabled && !targets.webhook?.enabled && !targets.wordpress?.enabled && !targets.ghost?.enabled && !targets.linkedin?.enabled && !targets.twitter?.enabled) ? 'not-allowed' : 'pointer',
                        opacity: publishing || (!targets.devto?.enabled && !targets.medium?.enabled && !targets.webhook?.enabled && !targets.wordpress?.enabled && !targets.ghost?.enabled && !targets.linkedin?.enabled && !targets.twitter?.enabled) ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {publishing ? 'Publishing...' : '🚀 Publish Now'}
                    </button>
                  </div>

                  {publishReport && (
                    <div style={{
                      background: 'var(--surface-soft)',
                      border: '1px solid var(--hairline)',
                      borderRadius: '12px',
                      padding: '24px',
                      marginTop: '8px'
                    }}>
                      <h4 style={{ margin: '0 0 16px', fontSize: '15px', color: 'var(--ink)' }}>Publishing Report</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {targets.devto?.enabled && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>Dev.to</span>
                            {publishReport.devto?.success ? (
                              <a href={publishReport.devto.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                                View Draft Link ↗
                              </a>
                            ) : (
                              <span style={{ color: '#ef4444' }}>Error: {publishReport.devto?.error || 'Failed'}</span>
                            )}
                          </div>
                        )}
                        {targets.medium?.enabled && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>Medium</span>
                            {publishReport.medium?.success ? (
                              <a href={publishReport.medium.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                                View Draft Link ↗
                              </a>
                            ) : (
                              <span style={{ color: '#ef4444' }}>Error: {publishReport.medium?.error || 'Failed'}</span>
                            )}
                          </div>
                        )}
                        {targets.linkedin?.enabled && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>LinkedIn</span>
                            {publishReport.linkedin?.success ? (
                              <a href={publishReport.linkedin.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                                View Post Link ↗
                              </a>
                            ) : (
                              <span style={{ color: '#ef4444' }}>Error: {publishReport.linkedin?.error || 'Failed'}</span>
                            )}
                          </div>
                        )}
                        {targets.twitter?.enabled && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>Twitter / X</span>
                            {publishReport.twitter?.success ? (
                              <a href={publishReport.twitter.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                                View Tweet Link ↗
                              </a>
                            ) : (
                              <span style={{ color: '#ef4444' }}>Error: {publishReport.twitter?.error || 'Failed'}</span>
                            )}
                          </div>
                        )}
                        {targets.wordpress?.enabled && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>WordPress Site</span>
                            {publishReport.wordpress?.success ? (
                              <a href={publishReport.wordpress.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                                View Live Link ↗
                              </a>
                            ) : (
                              <span style={{ color: '#ef4444' }}>Error: {publishReport.wordpress?.error || 'Failed'}</span>
                            )}
                          </div>
                        )}
                        {targets.ghost?.enabled && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>Ghost Site</span>
                            {publishReport.ghost?.success ? (
                              <a href={publishReport.ghost.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                                View Live Editor Link ↗
                              </a>
                            ) : (
                              <span style={{ color: '#ef4444' }}>Error: {publishReport.ghost?.error || 'Failed'}</span>
                            )}
                          </div>
                        )}
                        {targets.webhook?.enabled && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>API Webhook</span>
                            {publishReport.webhook?.success ? (
                              <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Sent successfully</span>
                            ) : (
                              <span style={{ color: '#ef4444' }}>Error: {publishReport.webhook?.error || 'Failed'}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted)'
          }}>
            Select an article from the sidebar queue to manage publishing.
          </div>
        )}
      </div>
    </div>
  );
}
