import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Assignment } from '../services/api';
import { assignments as assignmentsApi, reviews as reviewsApi } from '../services/api';

function ScoreCard({ title, score }: { title: string; score: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'var(--accent)';
    if (s >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{
      background: 'var(--canvas)',
      border: '1px solid var(--hairline)',
      borderRadius: '8px',
      padding: '12px 16px',
      flex: '1',
      minWidth: '100px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '20px', fontWeight: 'bold', color: getScoreColor(score) }}>{score}%</div>
    </div>
  );
}

export default function Drafts() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState('');

  const fetchDrafts = () => {
    setLoading(true);
    assignmentsApi.list()
      .then(res => {
        const list = Array.isArray(res) ? res : (res.assignments || []);
        const withDrafts = list.filter((a: Assignment) => a.draft && a.draft.content.trim().length > 0);
        setAssignments(withDrafts);
        if (withDrafts.length > 0 && !selectedId) {
          setSelectedId(withDrafts[0].id);
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleRunReview = async (draftId: string) => {
    setReviewing(true);
    setError('');
    try {
      await reviewsApi.analyze(draftId);
      // reload assignments
      const res = await assignmentsApi.list();
      const list = Array.isArray(res) ? res : (res.assignments || []);
      const withDrafts = list.filter((a: Assignment) => a.draft && a.draft.content.trim().length > 0);
      setAssignments(withDrafts);
    } catch (e: any) {
      setError(e.message || 'Failed to analyze draft');
    } finally {
      setReviewing(false);
    }
  };

  const selectedAssignment = assignments.find(a => a.id === selectedId);

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Sidebar List */}
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
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--display)', margin: '0 0 4px', color: 'var(--ink)' }}>Draft Reviews</h2>
          <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>Agent 4: Automated quality & SEO reviews.</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>Loading drafts...</div>
          ) : error ? (
            <div style={{ padding: '20px', color: '#ef4444', fontSize: '14px' }}>{error}</div>
          ) : assignments.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '4px' }}>No drafts submitted</div>
              <p style={{ fontSize: '12px', margin: 0 }}>Waiting for the AI Writer to submit drafts.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {assignments.map(a => {
                const isActive = a.id === selectedId;
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelectedId(a.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '14px',
                      borderRadius: '8px',
                      background: isActive ? 'var(--surface-card)' : 'transparent',
                      border: isActive ? '1px solid var(--hairline)' : '1px solid transparent',
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
                      {a.brief?.h1 || 'Untitled Document'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--muted)' }}>
                      <span>By {a.writer?.name || 'AI Agent'}</span>
                      {a.draft?.review && (
                        <span style={{
                          background: 'var(--accent-soft)',
                          color: 'var(--accent)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}>
                          Score: {a.draft.review.briefComplianceScore}%
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Content View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--canvas)' }}>
        {selectedAssignment ? (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', width: '100%' }}>
            {/* Left: Article Reader */}
            <div style={{
              flex: 3,
              padding: '40px',
              overflowY: 'auto',
              borderRight: '1px solid var(--hairline)',
              height: '100%'
            }}>
              <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontFamily: 'var(--mono)',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    background: 'var(--surface-soft)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    Draft Content
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    Written by {selectedAssignment.writer?.name}
                  </span>
                </div>
                <div className="markdown-body">
                  <ReactMarkdown>{selectedAssignment.draft?.content || ''}</ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Right: AI Review Panel */}
            <div style={{
              flex: 2,
              background: 'var(--surface-soft)',
              padding: '40px 30px',
              overflowY: 'auto',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div>
                <h3 style={{ fontSize: '18px', fontFamily: 'var(--display)', margin: '0 0 4px', color: 'var(--ink)' }}>Agent 4: AI Audit Report</h3>
                <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>Automated SEO & compliance checks.</p>
              </div>

              {selectedAssignment.draft?.review ? (
                <>
                  {/* Scores Grid */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <ScoreCard title="SEO Score" score={selectedAssignment.draft.review.seoComplianceScore} />
                    <ScoreCard title="Readability" score={selectedAssignment.draft.review.readabilityScore} />
                    <ScoreCard title="Keywords" score={selectedAssignment.draft.review.keywordCoverage} />
                    <ScoreCard title="Compliance" score={selectedAssignment.draft.review.briefComplianceScore} />
                  </div>

                  {/* AI Notes */}
                  <div style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--hairline)',
                    borderRadius: '8px',
                    padding: '20px'
                  }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 8px' }}>Editorial Insights</h4>
                    <p style={{ color: 'var(--body)', fontSize: '14px', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                      "{selectedAssignment.draft.review.aiNotes}"
                    </p>
                  </div>

                  {/* SEO Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>SEO Keyword Coverage</h4>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {(selectedAssignment.brief?.seoKeywords || []).map((kw, idx) => {
                        const isFound = selectedAssignment.draft?.content?.toLowerCase().includes(kw.toLowerCase()) ?? false;
                        return (
                          <span
                            key={idx}
                            style={{
                              fontSize: '12px',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              border: isFound ? '1px solid var(--accent)' : '1px solid var(--hairline)',
                              background: isFound ? 'var(--accent-soft)' : 'var(--canvas)',
                              color: isFound ? 'var(--accent)' : 'var(--muted)',
                              fontWeight: 500
                            }}
                          >
                            {isFound ? '✓' : '✗'} {kw}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{
                  background: 'var(--surface-card)',
                  border: '1px solid var(--hairline)',
                  borderRadius: '8px',
                  padding: '32px',
                  textAlign: 'center',
                  color: 'var(--muted)'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '12px' }}>⚙</div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 8px' }}>No Review Yet</h4>
                  <p style={{ fontSize: '13px', margin: '0 0 20px', lineHeight: 1.5 }}>Ready for automated SEO, readability, & brief compliance checks.</p>
                  
                  <button
                    onClick={() => handleRunReview(selectedAssignment.draft!.id)}
                    disabled={reviewing}
                    style={{
                      padding: '10px 20px',
                      background: 'var(--accent)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      opacity: reviewing ? 0.6 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    {reviewing ? 'Running Review...' : '🔍 Run AI Review & Complete'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
            Select a draft from the sidebar to view details.
          </div>
        )}
      </div>
    </div>
  );
}
