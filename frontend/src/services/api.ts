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
export interface Assignment {
  id: string;
  briefId: string;
  writerId: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED';
  assignedAt: string;
  writer?: User;
  brief?: Brief;
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
export interface PublishPayload {
  assignmentId: string;
  scheduledAt?: string; // ISO 8601
}

export interface PublishResult {
  schedule: { publishAt: string; platform: string }[];
  linkedInPost: string;
  twitterPost: string;
  contentExport: string;
}

export const publish = {
  prepare: (payload: PublishPayload) =>
    post<PublishResult>('/publish/prepare', payload),
};

// ─────────────────────────────────────────────────────────────────────────────
// Chat
// ─────────────────────────────────────────────────────────────────────────────
export const chat = {
  send: (messages: { role: string; content: string }[]) =>
    post<{ reply: string }>('/chat', { messages }),
};