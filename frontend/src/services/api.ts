// ─────────────────────────────────────────────────────────────────────────────
// api.ts — Centralised HTTP client for Trendy
//
// Base URL:  /api  (proxied by Vite to http://localhost:3000 in dev)
//            In production set VITE_API_URL env variable.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL ?? '/api';

function getToken(): string | null {
  return localStorage.getItem('tp_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('tp_token');
      localStorage.removeItem('tp_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Convenience wrappers ──────────────────────────────────────────────────────
const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) });
const patch = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });

// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────
export interface LoginPayload { email: string; password: string }
export interface AuthResponse { token: string; user: User }

export interface User {
  id: string;
  name: string;
  email: string;
  currentLoad: number;
  completedCount: number;  // ← NEW
  avgReviewScore: number;  // ← NEW
}

export const auth = {
  login: (p: LoginPayload) => post<AuthResponse>('/auth/login', p),
  register: (p: Partial<User> & { password: string }) =>
    post<AuthResponse>('/auth/register', p),
};

// ─────────────────────────────────────────────────────────────────────────────
// Trends
// ─────────────────────────────────────────────────────────────────────────────
export interface Trend {
  id: string;
  title: string;
  source: string;
  trendScore: number;
  relevanceScore: number;
  opportunityScore: number;
  aiExplanation?: string;
  createdAt: string;
}

export interface TrendsResponse { count: number; trends: Trend[] }

export const trends = {
  list: (sort?: string, source?: string) => {
    const params = new URLSearchParams();
    if (sort) params.set('sort', sort);
    if (source) params.set('source', source);
    const qs = params.toString();
    return get<TrendsResponse>(`/trends${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => get<Trend>(`/trends/${id}`),
  refresh: () => post<{ message: string; count: number }>('/trends/refresh', {}),
  getConfig: () => get<{intervalMinutes: number}>('/trends/config'),
  updateConfig: (intervalMinutes: number) => post<{message: string, intervalMinutes: number}>('/trends/config', { intervalMinutes }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Briefs
// ─────────────────────────────────────────────────────────────────────────────
export interface HeadingBlock { h2: string; h3: string[] }

export interface Brief {
  id: string;
  trendId: string;
  summary?: string;
  audienceAnalysis?: string;
  angle?: string;
  seoKeywords: string[];
  h1?: string;
  headingStructure?: HeadingBlock[];
  wordCount?: number;
  publishingGuidance?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export const briefs = {
  generate: (trendId: string) =>
    post<{ brief: Brief }>('/briefs/generate', { trendId }),
  autoGenerate: () =>
    post<{ count: number; briefs: Brief[] }>('/briefs/auto-generate', {}),
  approve: (id: string, status: 'APPROVED' | 'REJECTED', edits?: Partial<Brief>) =>
    patch<{ brief: Brief }>('/briefs/approve', { id, status, ...edits }),
  list: () => get<{ count: number; briefs: Brief[] }>('/briefs'),
  approved: () => get<{ count: number; briefs: Brief[] }>('/briefs?status=APPROVED'), // ← NEW
};

// ─────────────────────────────────────────────────────────────────────────────
// Assignments
// ─────────────────────────────────────────────────────────────────────────────
export interface Draft {
  id: string;
  assignmentId: string;
  content: string;
  submittedAt?: string;
  review?: Review;
}

export interface Assignment {
  id: string;
  briefId: string;
  writerId: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED';
  assignedAt: string;
  writer?: User;
  brief?: Brief;
  draft?: Draft;
}

// ← NEW: replaces the old `{ writers: User[] }` shape
export interface WriterRecommendation {
  writerId: string;
  name: string;
  email: string;
  currentLoad: number;
  completedCount: number;
  avgReviewScore: number;
  matchScore: number;
  reasoning: string;
}

// ← NEW
export interface RecommendResponse {
  briefId: string;
  briefTitle: string;
  recommendations: WriterRecommendation[];
}

export const assignments = {
  create: (briefId: string, writerId: string) =>
    post<{ assignment: Assignment }>('/assignments', { briefId, writerId }),

  recommend: (briefId: string) =>
    get<RecommendResponse>(`/assignments/recommend?briefId=${briefId}`), // ← return type updated

  list: () => get<{ assignments: Assignment[] }>('/assignments'),
  write: (assignmentId: string) =>
    post<{ assignment: Assignment }>(`/assignments/${assignmentId}/write`, {}),
};

// ─────────────────────────────────────────────────────────────────────────────
// Reviews
// ─────────────────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  draftId: string;
  seoComplianceScore: number;
  readabilityScore: number;
  keywordCoverage: number;
  missingSections: string[];
  briefComplianceScore: number;
  aiNotes?: string;
  createdAt: string;
}

export const reviews = {
  analyze: (draftId: string) =>
    post<{ review: Review }>('/reviews/analyze', { draftId }),
  get: (draftId: string) => get<Review>(`/reviews/${draftId}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Publish
// ─────────────────────────────────────────────────────────────────────────────
export interface PublishSchedule {
  suggestedPublishAt: string;
  rationale: string;
  recommendedTimeUTC: string;
  recommendedDays: string;
}

export interface SocialPosts {
  linkedin: { post: string; hashtags: string[] };
  twitter: { post: string; hashtags: string[] };
}

export interface ExportPayload {
  meta: {
    exportedAt: string;
    trendTitle: string;
    opportunityScore: number;
    briefStatus: string;
  };
  content: {
    h1: string;
    headingStructure: HeadingBlock[];
    seoKeywords: string[];
    recommendedWordCount: number;
    body: string;
    actualWordCount: number;
  };
  quality: {
    seoComplianceScore: number;
    readabilityScore: number;
    keywordCoverage: number;
    briefComplianceScore: number;
    missingSections: string[];
    aiNotes: string;
  };
  assignment: {
    writerId: string;
    assignedAt: string;
    draftSubmittedAt: string;
  };
}

export interface DispatchTargets {
  medium?: { enabled?: boolean; token?: string; pubId?: string };
  devto?: { enabled?: boolean; apiKey?: string };
  webhook?: { enabled?: boolean; url?: string; secret?: string };
  wordpress?: { enabled?: boolean; url?: string; username?: string; password?: string };
  ghost?: { enabled?: boolean; url?: string; apiKey?: string };
  linkedin?: { enabled?: boolean; token?: string };
  twitter?: { enabled?: boolean; apiKey?: string };
}

export interface DispatchResponse {
  message: string;
  results: {
    medium?: { success: boolean; url?: string; error?: string };
    devto?: { success: boolean; url?: string; error?: string };
    webhook?: { success: boolean; error?: string };
    wordpress?: { success: boolean; url?: string; error?: string };
    ghost?: { success: boolean; url?: string; error?: string };
    linkedin?: { success: boolean; url?: string; error?: string };
    twitter?: { success: boolean; url?: string; error?: string };
  };
}

export const publish = {
  schedule: (briefId: string) =>
    post<{ briefId: string; schedule: PublishSchedule }>('/publish/schedule', { briefId }),
  social: (draftId: string) =>
    post<{ draftId: string; posts: SocialPosts }>('/publish/social', { draftId }),
  export: (draftId: string) =>
    get<ExportPayload>(`/publish/export?draftId=${draftId}`),
  dispatch: (draftId: string, targets: DispatchTargets) =>
    post<DispatchResponse>('/publish/dispatch', { draftId, targets }),
  verifyTarget: (type: 'medium' | 'devto' | 'webhook' | 'wordpress' | 'ghost' | 'linkedin' | 'twitter', credentials: any) =>
    post<{ success: boolean; message?: string; error?: string }>('/publish/verify-target', { type, credentials }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Chat
// ─────────────────────────────────────────────────────────────────────────────
export const chat = {
  send: (messages: { role: string; content: string }[]) =>
    post<{ reply: string }>('/chat', { messages }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Orchestrator
// ─────────────────────────────────────────────────────────────────────────────
export interface OrchestratorStatus {
  isRunning: boolean;
  lastStarted: string | null;
  lastCompleted: string | null;
  lastError: string | null;
  currentStep?: string;
  logs?: { timestamp: string; message: string; isError?: boolean }[];
}

export const orchestrator = {
  status: () => get<OrchestratorStatus>('/orchestrator/status'),
  run: () => post<{ message: string }>('/orchestrator/run', {}),
};