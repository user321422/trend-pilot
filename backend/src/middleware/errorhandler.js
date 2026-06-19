// ── asyncHandler ──────────────────────────────────────────────────────────────
// Wraps async route handlers so thrown errors reach Express error middleware.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ── withTimeout ───────────────────────────────────────────────────────────────
// Wraps any async function call with a timeout.
// Usage: const result = await withTimeout(callQwenJSON(prompt), 15000);
function withTimeout(promise, ms = 10000, label = 'Operation') {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

// ── withRetry ─────────────────────────────────────────────────────────────────
// Retries an async fn up to `attempts` times with exponential backoff.
// Usage: const result = await withRetry(() => callQwenJSON(prompt), 3);
async function withRetry(fn, attempts = 3, delayMs = 500) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}

// ── errorHandler ──────────────────────────────────────────────────────────────
// Centralized Express error middleware — MUST have 4 args.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Prisma not found
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }
  // Prisma unique constraint
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Duplicate entry', field: err.meta?.target });
  }
  // Timeout errors (from withTimeout)
  if (err.message?.includes('timed out')) {
    return res.status(504).json({ error: err.message });
  }
  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const status = err.status ?? err.statusCode ?? 500;
  return res.status(status).json({
    error: err.message ?? 'Internal server error',
  });
}

export { asyncHandler, errorHandler, withTimeout, withRetry };