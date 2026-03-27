import app from './app.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

app.listen(PORT, () => {
  console.log(`Dev Fortune API running on http://localhost:${PORT}`);
  console.log(`Swagger UI:  http://localhost:${PORT}/api/docs`);
  console.log(`Spec JSON:   http://localhost:${PORT}/api/docs/spec.json`);
  console.log(`Health:      http://localhost:${PORT}/health`);
});
