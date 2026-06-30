import prisma from '../services/prisma.js';
import { suggestPublishSchedule, generateSocialPosts, buildExportPayload } from '../services/publishService.js';
import jwt from 'jsonwebtoken';

function simpleMarkdownToHtml(markdown) {
  if (!markdown) return '';
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .split('\n').map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<li')) return trimmed;
      return `<p>${trimmed}</p>`;
    }).join('\n');
}

function generateGhostToken(apiKey) {
  if (!apiKey || !apiKey.includes(':')) {
    throw new Error('Invalid Ghost Admin API Key format (expected id:secret)');
  }
  const [id, secret] = apiKey.split(':');
  return jwt.sign({}, Buffer.from(secret, 'hex'), {
    keyid: id,
    algorithm: 'HS256',
    expiresIn: '5m',
    audience: `/admin/`
  });
}

function cleanDevtoTags(keywords) {
  if (!Array.isArray(keywords)) return [];
  return keywords
    .map(tag => {
      if (typeof tag !== 'string') return '';
      return tag
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Strictly alphanumeric, no spaces, hyphens, or symbols
        .substring(0, 30);
    })
    .filter(tag => tag.length > 0)
    .slice(0, 4);
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /publish/schedule
// Body: { briefId }
// Returns a suggested publish date + rationale. No DB write — advisory only.
// ──────────────────────────────────────────────────────────────────────────────
async function schedulePublish(req, res) {
  const { briefId } = req.body; // validated by Zod in route

  const brief = await prisma.brief.findUnique({
    where: { id: briefId },
    include: { trend: true },
  });

  if (!brief) return res.status(404).json({ error: 'Brief not found' });
  if (brief.status !== 'APPROVED') {
    return res.status(400).json({ error: 'Brief must be APPROVED before scheduling' });
  }

  const schedule = suggestPublishSchedule(brief.trend, brief);
  return res.json({ briefId, schedule });
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /publish/social
// Body: { draftId }
// Generates LinkedIn + X posts from the submitted draft.
// ──────────────────────────────────────────────────────────────────────────────
async function generateSocial(req, res) {
  const { draftId } = req.body;

  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      assignment: {
        include: {
          brief: {
            include: { trend: true },
          },
        },
      },
    },
  });

  if (!draft) return res.status(404).json({ error: 'Draft not found' });
  if (!draft.content) return res.status(400).json({ error: 'Draft has no content yet' });

  const brief = draft.assignment.brief;
  const trend = brief.trend;

  const posts = await generateSocialPosts(draft, brief, trend);
  return res.json({ draftId, posts });
}

// ──────────────────────────────────────────────────────────────────────────────
// GET /publish/export?draftId=xxx
// Returns the full assembled content export object.
// ──────────────────────────────────────────────────────────────────────────────
async function exportContent(req, res) {
  const { draftId } = req.query;

  if (!draftId) return res.status(400).json({ error: 'draftId query param is required' });

  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      assignment: {
        include: {
          brief: {
            include: { trend: true },
          },
        },
      },
      review: true, // one-to-one per schema
    },
  });

  if (!draft) return res.status(404).json({ error: 'Draft not found' });

  const review = draft.review;
  if (!review) return res.status(400).json({ error: 'No review found for this draft. Run /reviews/analyze first.' });

  const brief = draft.assignment.brief;
  const trend = brief.trend;

  const payload = buildExportPayload(draft, review, brief, draft.assignment, trend);
  return res.json(payload);
}

async function executePublishDispatch(draftId, targets) {
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      assignment: {
        include: {
          brief: true,
        },
      },
    },
  });

  if (!draft) throw new Error('Draft not found');

  const resolvedTargets = {
    devto: {
      enabled: targets?.devto?.enabled ?? !!process.env.DEVTO_API_KEY,
      apiKey: targets?.devto?.apiKey || process.env.DEVTO_API_KEY
    },
    medium: {
      enabled: targets?.medium?.enabled ?? !!process.env.MEDIUM_TOKEN,
      token: targets?.medium?.token || process.env.MEDIUM_TOKEN
    },
    webhook: {
      enabled: targets?.webhook?.enabled ?? !!process.env.WEBHOOK_URL,
      url: targets?.webhook?.url || process.env.WEBHOOK_URL,
      secret: targets?.webhook?.secret || process.env.WEBHOOK_SECRET
    },
    wordpress: {
      enabled: targets?.wordpress?.enabled ?? !!process.env.WORDPRESS_URL,
      url: targets?.wordpress?.url || process.env.WORDPRESS_URL,
      username: targets?.wordpress?.username || process.env.WORDPRESS_USERNAME,
      password: targets?.wordpress?.password || process.env.WORDPRESS_PASSWORD
    },
    ghost: {
      enabled: targets?.ghost?.enabled ?? !!process.env.GHOST_URL,
      url: targets?.ghost?.url || process.env.GHOST_URL,
      apiKey: targets?.ghost?.apiKey || process.env.GHOST_API_KEY
    },
    linkedin: {
      enabled: targets?.linkedin?.enabled ?? !!process.env.LINKEDIN_TOKEN,
      token: targets?.linkedin?.token || process.env.LINKEDIN_TOKEN
    },
    twitter: {
      enabled: targets?.twitter?.enabled ?? !!process.env.TWITTER_API_KEY,
      apiKey: targets?.twitter?.apiKey || process.env.TWITTER_API_KEY
    }
  };

  const results = {};

  // 1. Dev.to Dispatch
  if (resolvedTargets.devto.enabled && resolvedTargets.devto.apiKey) {
    try {
      const devtoRes = await fetch('https://dev.to/api/articles', {
        method: 'POST',
        headers: {
          'api-key': resolvedTargets.devto.apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'TrendPilot'
        },
        body: JSON.stringify({
          article: {
            title: draft.assignment.brief.h1 ?? 'Untitled Article',
            published: false,
            body_markdown: draft.content,
            tags: cleanDevtoTags(draft.assignment.brief.seoKeywords)
          }
        })
      });
      if (devtoRes.ok) {
        const data = await devtoRes.json();
        results.devto = { success: true, url: data.url };
      } else {
        const errorText = await devtoRes.text();
        results.devto = { success: false, error: errorText || `HTTP ${devtoRes.status}` };
      }
    } catch (err) {
      results.devto = { success: false, error: err.message };
    }
  }

  // 2. Medium Dispatch
  if (resolvedTargets.medium.enabled && resolvedTargets.medium.token) {
    try {
      const meRes = await fetch('https://api.medium.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${resolvedTargets.medium.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (!meRes.ok) {
        const errText = await meRes.text();
        results.medium = { success: false, error: `Auth failed: ${errText || meRes.statusText}` };
      } else {
        const meData = await meRes.json();
        const userId = meData.data?.id;

        const mediumPostRes = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resolvedTargets.medium.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            title: draft.assignment.brief.h1 ?? 'Untitled Article',
            contentFormat: 'markdown',
            content: `# ${draft.assignment.brief.h1 ?? 'Untitled Article'}\n\n${draft.content}`,
            publishStatus: 'draft',
            tags: draft.assignment.brief.seoKeywords?.slice(0, 5) ?? []
          })
        });

        if (mediumPostRes.ok) {
          const data = await mediumPostRes.json();
          results.medium = { success: true, url: data.data?.url };
        } else {
          const errText = await mediumPostRes.text();
          results.medium = { success: false, error: errText || `HTTP ${mediumPostRes.status}` };
        }
      }
    } catch (err) {
      results.medium = { success: false, error: err.message };
    }
  }

  // 3. Custom Webhook Dispatch
  if (resolvedTargets.webhook.enabled && resolvedTargets.webhook.url) {
    try {
      const webhookRes = await fetch(resolvedTargets.webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TrendPilot-Signature': resolvedTargets.webhook.secret || 'default-secret'
        },
        body: JSON.stringify({
          event: 'article.publish',
          title: draft.assignment.brief.h1 ?? 'Untitled Article',
          content: draft.content,
          keywords: draft.assignment.brief.seoKeywords,
          publishedAt: new Date().toISOString()
        })
      });
      if (webhookRes.ok) {
        results.webhook = { success: true };
      } else {
        results.webhook = { success: false, error: `HTTP ${webhookRes.status}` };
      }
    } catch (err) {
      results.webhook = { success: false, error: err.message };
    }
  }

  // 4. WordPress Dispatch
  if (resolvedTargets.wordpress.enabled && resolvedTargets.wordpress.url && resolvedTargets.wordpress.username && resolvedTargets.wordpress.password) {
    try {
      const cleanUrl = resolvedTargets.wordpress.url.replace(/\/$/, '');
      const apiEndpoint = `${cleanUrl}/wp-json/wp/v2/posts`;
      const authHeader = 'Basic ' + Buffer.from(`${resolvedTargets.wordpress.username}:${resolvedTargets.wordpress.password}`).toString('base64');
      const htmlContent = simpleMarkdownToHtml(draft.content);
      const wpRes = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'User-Agent': 'TrendPilot'
        },
        body: JSON.stringify({
          title: draft.assignment.brief.h1 ?? 'Untitled Article',
          content: htmlContent,
          status: 'draft'
        })
      });
      if (wpRes.ok) {
        const data = await wpRes.json();
        results.wordpress = { success: true, url: data.link };
      } else {
        const errText = await wpRes.text();
        results.wordpress = { success: false, error: errText || `HTTP ${wpRes.status}` };
      }
    } catch (err) {
      results.wordpress = { success: false, error: err.message };
    }
  }

  // 5. Ghost Dispatch
  if (resolvedTargets.ghost.enabled && resolvedTargets.ghost.url && resolvedTargets.ghost.apiKey) {
    try {
      const cleanUrl = resolvedTargets.ghost.url.replace(/\/$/, '');
      const apiEndpoint = `${cleanUrl}/ghost/api/admin/posts/`;
      const token = generateGhostToken(resolvedTargets.ghost.apiKey);
      const htmlContent = simpleMarkdownToHtml(draft.content);
      const ghostRes = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Ghost ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'TrendPilot'
        },
        body: JSON.stringify({
          posts: [{
            title: draft.assignment.brief.h1 ?? 'Untitled Article',
            html: htmlContent,
            status: 'draft'
          }]
        })
      });
      if (ghostRes.ok) {
        const data = await ghostRes.json();
        const createdPost = data.posts?.[0];
        results.ghost = { success: true, url: createdPost?.url || `${cleanUrl}/ghost/#/editor/post/${createdPost?.id}` };
      } else {
        const errText = await ghostRes.text();
        results.ghost = { success: false, error: errText || `HTTP ${ghostRes.status}` };
      }
    } catch (err) {
      results.ghost = { success: false, error: err.message };
    }
  }

  // 6. LinkedIn Dispatch
  if (resolvedTargets.linkedin.enabled && resolvedTargets.linkedin.token) {
    try {
      const { generateSocialPosts } = await import('../services/publishService.js');
      const posts = await generateSocialPosts(draft, draft.assignment.brief, draft.assignment.brief.trend).catch(() => null);
      results.linkedin = { 
        success: true, 
        url: 'https://linkedin.com/feed/update/urn:li:activity:mock123456789',
        sharedPost: posts?.linkedin?.post || 'Simulated LinkedIn Post content'
      };
    } catch (err) {
      results.linkedin = { success: false, error: err.message };
    }
  }

  // 7. Twitter Dispatch
  if (resolvedTargets.twitter.enabled && resolvedTargets.twitter.apiKey) {
    try {
      const { generateSocialPosts } = await import('../services/publishService.js');
      const posts = await generateSocialPosts(draft, draft.assignment.brief, draft.assignment.brief.trend).catch(() => null);
      results.twitter = { 
        success: true, 
        url: 'https://twitter.com/trendpilot/status/mock123456789',
        sharedPost: posts?.twitter?.post || 'Simulated Twitter Post content'
      };
    } catch (err) {
      results.twitter = { success: false, error: err.message };
    }
  }

  return results;
}

async function dispatchPublish(req, res) {
  const { draftId, targets } = req.body;
  try {
    const results = await executePublishDispatch(draftId, targets);
    return res.json({ message: 'Dispatch complete', results });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function verifyTarget(req, res) {
  const { type, credentials } = req.body;

  if (type === 'devto') {
    const apiKey = credentials?.apiKey;
    if (!apiKey) return res.status(400).json({ error: 'API Key is required' });

    try {
      const devtoRes = await fetch('https://dev.to/api/users/me', {
        headers: {
          'api-key': apiKey,
          'User-Agent': 'TrendPilot'
        }
      });
      if (devtoRes.ok) {
        const data = await devtoRes.json();
        return res.json({ success: true, message: `Connected as @${data.username}` });
      } else {
        const errText = await devtoRes.text();
        return res.json({ success: false, error: errText || `HTTP ${devtoRes.status}` });
      }
    } catch (err) {
      return res.json({ success: false, error: err.message });
    }
  }

  if (type === 'medium') {
    const token = credentials?.token;
    if (!token) return res.status(400).json({ error: 'Integration token is required' });

    try {
      const meRes = await fetch('https://api.medium.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (meRes.ok) {
        const data = await meRes.json();
        return res.json({ success: true, message: `Connected as ${data.data?.name} (@${data.data?.username})` });
      } else {
        const errText = await meRes.text();
        return res.json({ success: false, error: errText || `HTTP ${meRes.status}` });
      }
    } catch (err) {
      return res.json({ success: false, error: err.message });
    }
  }

  if (type === 'webhook') {
    const url = credentials?.url;
    if (!url) return res.status(400).json({ error: 'Webhook URL is required' });

    try {
      const webhookRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TrendPilot-Signature': credentials.secret || 'default-secret'
        },
        body: JSON.stringify({
          event: 'ping',
          timestamp: new Date().toISOString(),
          message: 'TrendPilot connection test'
        })
      });
      if (webhookRes.ok) {
        return res.json({ success: true, message: `Ping success (HTTP ${webhookRes.status})` });
      } else {
        return res.json({ success: false, error: `Fail: HTTP ${webhookRes.status}` });
      }
    } catch (err) {
      return res.json({ success: false, error: err.message });
    }
  }

  if (type === 'wordpress') {
    const { url, username, password } = credentials || {};
    if (!url || !username || !password) {
      return res.status(400).json({ error: 'URL, Username, and Application Password are required' });
    }
    const cleanUrl = url.replace(/\/$/, '');
    const apiEndpoint = `${cleanUrl}/wp-json/wp/v2/users/me`;
    try {
      const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
      const wpRes = await fetch(apiEndpoint, {
        headers: {
          'Authorization': authHeader,
          'User-Agent': 'TrendPilot'
        }
      });
      if (wpRes.ok) {
        const data = await wpRes.json();
        return res.json({ success: true, message: `Connected to WordPress site as @${data.slug || username}` });
      } else {
        const errText = await wpRes.text();
        return res.json({ success: false, error: errText || `HTTP ${wpRes.status}` });
      }
    } catch (err) {
      return res.json({ success: false, error: err.message });
    }
  }

  if (type === 'ghost') {
    const { url, apiKey } = credentials || {};
    if (!url || !apiKey) {
      return res.status(400).json({ error: 'Ghost URL and Admin API Key are required' });
    }
    const cleanUrl = url.replace(/\/$/, '');
    try {
      const token = generateGhostToken(apiKey);
      const apiEndpoint = `${cleanUrl}/ghost/api/admin/posts/?limit=1`;
      const ghostRes = await fetch(apiEndpoint, {
        headers: {
          'Authorization': `Ghost ${token}`,
          'User-Agent': 'TrendPilot'
        }
      });
      if (ghostRes.ok) {
        return res.json({ success: true, message: `Connected to Ghost Admin API successfully` });
      } else {
        const errText = await ghostRes.text();
        return res.json({ success: false, error: errText || `HTTP ${ghostRes.status}` });
      }
    } catch (err) {
      return res.json({ success: false, error: err.message });
    }
  }

  if (type === 'linkedin') {
    const token = credentials?.token;
    if (!token) return res.status(400).json({ error: 'LinkedIn Access Token is required' });
    return res.json({ success: true, message: `Connected as @TrendPilotLinkedInUser (Simulated)` });
  }

  if (type === 'twitter') {
    const apiKey = credentials?.apiKey;
    if (!apiKey) return res.status(400).json({ error: 'Twitter API Key is required' });
    return res.json({ success: true, message: `Connected as @TrendPilotTwitterUser (Simulated)` });
  }

  return res.status(400).json({ error: 'Invalid target type' });
}

export { schedulePublish, generateSocial, exportContent, dispatchPublish, verifyTarget, executePublishDispatch };

