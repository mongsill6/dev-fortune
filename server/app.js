import express from 'express';
import { cors } from './middleware/cors.js';
import { rateLimit } from './middleware/rateLimit.js';
import { setupSwagger } from './swagger.js';
import quotesRouter from './routes/quotes.js';

const app = express();

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------
app.use(cors);
app.use(rateLimit);
app.use(express.json());

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api', quotesRouter);

// Health check — useful for container/load-balancer probes
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ---------------------------------------------------------------------------
// API documentation (Swagger UI)
// ---------------------------------------------------------------------------
setupSwagger(app);

// ---------------------------------------------------------------------------
// 404 handler — must be last
// ---------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// ---------------------------------------------------------------------------
// Error handler
// ---------------------------------------------------------------------------
 
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
