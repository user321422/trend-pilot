// frontend/src/pages/Assignments.tsx

import { useEffect, useState } from 'react';
import type { Brief, WriterRecommendation, Assignment } from '../services/api';
import { briefs as briefsApi, assignments as assignmentsApi } from '../services/api';

// ── Score bar colour ───────────────────────────────────────────────────────
function scoreColour(score: number): string {
  if (score >= 80) return 'var(--accent)';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

// ── Writer Card ────────────────────────────────────────────────────────────
function WriterCard({
  rec,
  rank,
  onAssign,
  assigning,
}: {
  rec: WriterRecommendation;
  rank: number;
  onAssign: (writerId: string) => void;
  assigning: boolean;
}) {
  const colour = scoreColour(rec.matchScore);

  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--hairline)',
        borderRadius: 12,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>
              #{rank}
            </span>
            <span style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 16 }}>
              {rec.name}
            </span>
            {rec.email.endsWith('.internal') && (
              <span style={{
                fontSize: 10,
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                padding: '2px 8px',
                borderRadius: 4,
                fontWeight: 600
              }}>AI AGENT</span>
            )}
          </div>
          {!rec.email.endsWith('.internal') && (
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>{rec.email}</div>
          )}
        </div>

        <div
          style={{
            background: colour,
            color: '#fff',
            borderRadius: 20,
            padding: '4px 12px',
            fontWeight: 700,
            fontSize: 14,
            whiteSpace: 'nowrap',
          }}
        >
          {rec.matchScore} / 100
        </div>
      </div>

      {/* Score bar */}
      <div style={{ background: 'var(--hairline)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
        <div
          style={{
            width: `${rec.matchScore}%`,
            height: '100%',
            background: colour,
            borderRadius: 4,
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Stat chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Chip label="Active assignments" value={rec.currentLoad} warn={rec.currentLoad >= 3} />
        <Chip label="Completed" value={rec.completedCount} />
        <Chip label="Avg score" value={`${rec.avgReviewScore.toFixed(1)}%`} />
      </div>

      {/* AI reasoning */}
      <blockquote
        style={{
          margin: 0,
          paddingLeft: 12,
          borderLeft: `3px solid var(--hairline)`,
          color: 'var(--muted)',
          fontSize: 13,
          fontStyle: 'italic',
          lineHeight: 1.5,
        }}
      >
        {rec.reasoning}
      </blockquote>

      {/* Assign button */}
      <button
        onClick={() => onAssign(rec.writerId)}
        disabled={assigning || rec.currentLoad >= 3}
        style={{
          alignSelf: 'flex-end',
          background: rec.currentLoad >= 3 ? 'var(--hairline)' : 'var(--accent)',
          color: rec.currentLoad >= 3 ? 'var(--muted)' : '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '8px 20px',
          fontWeight: 600,
          fontSize: 14,
          cursor: rec.currentLoad >= 3 ? 'not-allowed' : 'pointer',
          opacity: assigning ? 0.7 : 1,
        }}
      >
        {assigning ? 'Assigning…' : rec.currentLoad >= 3 ? 'Overloaded' : 'Assign'}
      </button>
    </div>
  );
}

function Chip({
  label,
  value,
  warn = false,
}: {
  label: string;
  value: string | number;
  warn?: boolean;
}) {
  return (
    <span
      style={{
        background: warn ? '#fef3c7' : 'var(--surface-card)',
        border: `1px solid ${warn ? '#f59e0b' : 'var(--hairline)'}`,
        borderRadius: 6,
        padding: '3px 10px',
        fontSize: 12,
        color: warn ? '#92400e' : 'var(--ink)',
      }}
    >
      <strong>{value}</strong> {label}
    </span>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    ASSIGNED: { bg: '#dbeafe', color: '#1e40af' },
    IN_PROGRESS: { bg: '#fef3c7', color: '#92400e' },
    SUBMITTED: { bg: '#e0f2fe', color: '#0369a1' },
    COMPLETED: { bg: '#d1fae5', color: '#065f46' },
    CANCELLED: { bg: '#fee2e2', color: '#991b1b' },
  };
  const style = map[status] || { bg: 'var(--hairline)', color: 'var(--ink)' };

  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        borderRadius: 6,
        padding: '3px 10px',
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function Assignments() {
  const [approvedBriefs, setApprovedBriefs] = useState<Brief[]>([]);
  const [selectedBriefId, setSelectedBriefId] = useState('');
  const [recommendations, setRecommendations] = useState<WriterRecommendation[]>([]);
  const [briefTitle, setBriefTitle] = useState('');
  const [assignmentList, setAssignmentList] = useState<Assignment[]>([]); // ← renamed to avoid conflict

  const [loadingBriefs, setLoadingBriefs] = useState(true);
  const [loadingRec, setLoadingRec] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [writingId, setWritingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleTriggerAIWrite(assignmentId: string) {
    setWritingId(assignmentId);
    setError('');
    setSuccessMsg('');
    try {
      const res = await assignmentsApi.write(assignmentId);
      setSuccessMsg('✍ AI Draft generated successfully! You can review it in Draft Reviews.');
      setAssignmentList(prev => prev.map(item => item.id === assignmentId ? res.assignment : item));
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e: any) {
      setError(e.message || 'Failed to write draft');
    } finally {
      setWritingId(null);
    }
  }

  // Load approved briefs + existing assignments on mount
  useEffect(() => {
    Promise.all([briefsApi.approved(), assignmentsApi.list()])
      .then(([briefsRes, assignsRes]) => {
        const briefsList = Array.isArray(briefsRes) ? briefsRes : (briefsRes.briefs || []);
        const assignsList = Array.isArray(assignsRes) ? assignsRes : (assignsRes.assignments || []);
        setApprovedBriefs(briefsList);
        setAssignmentList(assignsList);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingBriefs(false));
  }, []);

  // Find best writers
  async function handleRecommend() {
    if (!selectedBriefId) return;
    setLoadingRec(true);
    setRecommendations([]);
    setError('');

    try {
      const data = await assignmentsApi.recommend(selectedBriefId);
      setRecommendations(data.recommendations);
      setBriefTitle(data.briefTitle);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingRec(false);
    }
  }

  // Assign a writer
  async function handleAssign(writerId: string) {
    if (!selectedBriefId) return;
    setAssigningId(writerId);
    setError('');

    try {
      const res = await assignmentsApi.create(selectedBriefId, writerId);
      setSuccessMsg('✅ Assigned successfully!');
      setAssignmentList((prev) => [res.assignment, ...prev]);
      setRecommendations([]);
      setSelectedBriefId('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAssigningId(null);
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: 800 }}>
      <h1 style={{ color: 'var(--ink)', marginBottom: 4 }}>Assignments</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32, fontSize: 15 }}>
        Select an approved brief and let AI find the best-matched writer.
      </p>

      {/* ── Brief Selector ── */}
      <div
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--hairline)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
        }}
      >
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}>
          Select Approved Brief
        </label>

        {loadingBriefs ? (
          <p style={{ color: 'var(--muted)' }}>Loading briefs…</p>
        ) : (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <select
              value={selectedBriefId}
              onChange={(e) => {
                setSelectedBriefId(e.target.value);
                setRecommendations([]);
              }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid var(--hairline)',
                background: 'var(--surface-card)',
                color: 'var(--ink)',
                fontSize: 14,
              }}
            >
              <option value="">— Choose a brief —</option>
              {approvedBriefs.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.h1 ?? b.id}  {/* ← h1 not title */}
                </option>
              ))}
            </select>

            <button
              onClick={handleRecommend}
              disabled={!selectedBriefId || loadingRec}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontWeight: 600,
                fontSize: 14,
                cursor: !selectedBriefId || loadingRec ? 'not-allowed' : 'pointer',
                opacity: !selectedBriefId || loadingRec ? 0.6 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {loadingRec ? 'Finding…' : '✦ Find Best Writer'}
            </button>
          </div>
        )}

        {approvedBriefs.length === 0 && !loadingBriefs && (
          <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: 13 }}>
            No approved briefs yet. Approve a brief from the Briefs page first.
          </p>
        )}
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div
          style={{
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 24,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            background: '#d1fae5',
            color: '#065f46',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 24,
            fontSize: 14,
          }}
        >
          {successMsg}
        </div>
      )}

      {/* ── Writer Recommendations ── */}
      {recommendations.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ color: 'var(--ink)', marginBottom: 4, fontSize: 18 }}>
            Recommended Writers
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
            Ranked by AI match score for <strong>"{briefTitle}"</strong>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {recommendations.map((rec, i) => (
              <WriterCard
                key={rec.writerId}
                rec={rec}
                rank={i + 1}
                onAssign={handleAssign}
                assigning={assigningId === rec.writerId}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Existing Assignments List ── */}
      <section>
        <h2 style={{ color: 'var(--ink)', marginBottom: 16, fontSize: 18 }}>
          All Assignments
        </h2>

        {assignmentList.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>No assignments yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {assignmentList.map((a) => (
              <div
                key={a.id}
                style={{
                  background: 'var(--surface-card)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 14 }}>
                    {a.brief?.h1 ?? a.briefId}  {/* ← h1 not title */}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{a.writer?.name}</span>
                    {a.writer?.email?.endsWith('.internal') ? (
                      <span style={{
                        fontSize: 10,
                        background: 'var(--accent-soft)',
                        color: 'var(--accent)',
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontWeight: 600
                      }}>AI AGENT</span>
                    ) : (
                      <>
                        <span>·</span>
                        <span>{a.writer?.email}</span>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {a.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleTriggerAIWrite(a.id)}
                      disabled={writingId === a.id}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        opacity: writingId === a.id ? 0.6 : 1
                      }}
                    >
                      {writingId === a.id ? 'Writing...' : '✍ Trigger AI Writer'}
                    </button>
                  )}
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}