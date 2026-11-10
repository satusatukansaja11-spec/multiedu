import express from 'express';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { questions, topics } from './questions.js';
import { createSession, getSession, snapshot, submitAnswer } from './game-service.js';
const app = express();
app.use(express.json({ limit: '32kb' }));
const dataPath = fileURLToPath(new URL('../data/results.json', import.meta.url));
await mkdir(path.dirname(dataPath), { recursive: true });
let results = [];
try {
  results = JSON.parse(await readFile(dataPath, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
let pendingWrite = Promise.resolve();
function saveResults() {
  pendingWrite = pendingWrite
    .catch(() => {})
    .then(async () => {
      await writeFile(`${dataPath}.tmp`, JSON.stringify(results));
      await rename(`${dataPath}.tmp`, dataPath);
    });
  return pendingWrite;
}
app.get('/api/health', (_req, res) => res.json({ status: 'ok', mode: 'individual-practice' }));
app.get('/api/topics', (_req, res) =>
  res.json(
    topics.map((topic) => ({
      ...topic,
      questionCount: questions.filter((q) => q.topic === topic.id).length,
    })),
  ),
);
app.get('/api/questions', (_req, res) =>
  res.json(
    questions.map(({ answer: _answer, ...question }) => ({ ...question, answer: undefined })),
  ),
);
app.get('/api/results', (_req, res) => res.json(results.slice(-100).reverse()));
app.post('/api/sessions', (req, res) => {
  const input = z
    .object({
      name: z.string().trim().min(1).max(24),
      topic: z.enum(['word', 'excel', 'powerpoint']),
    })
    .parse(req.body);
  res.status(201).json(snapshot(createSession(input.name, input.topic)));
});
app.get('/api/sessions/:id', (req, res) => {
  const session = getSession(req.params.id);
  if (!session)
    return res.status(404).json({ error: { message: 'Sesi berakhir. Mulai latihan baru.' } });
  res.json(snapshot(session));
});
app.post('/api/sessions/:id/answers', async (req, res) => {
  const session = getSession(req.params.id);
  if (!session)
    return res.status(404).json({ error: { message: 'Sesi berakhir. Mulai latihan baru.' } });
  const input = z
    .object({ questionId: z.string().max(60), answer: z.number().int().min(0).max(3) })
    .parse(req.body);
  const result = submitAnswer(session, input.questionId, input.answer);
  const state = snapshot(session);
  if (!state.question && !results.some((item) => item.id === session.id)) {
    results.push({
      id: session.id,
      name: session.name,
      topic: session.topic,
      score: session.score,
      correctCount: session.correctCount,
      total: state.total,
      completedAt: new Date().toISOString(),
    });
    results = results.slice(-500);
  }
  if (!state.question) await saveResults();
  res.json({ result, session: state });
});
const distPath = fileURLToPath(new URL('../../web/dist', import.meta.url));
app.use(express.static(distPath));
app.get('/{*path}', (req, res, next) =>
  req.path.startsWith('/api/') ? next() : res.sendFile(path.join(distPath, 'index.html')),
);
app.use((error, _req, res, _next) => {
  if (!(error instanceof z.ZodError)) console.error(error.message);
  res.status(error instanceof z.ZodError ? 400 : 500).json({
    error: {
      message:
        error instanceof z.ZodError
          ? 'Data tidak valid. Periksa nama dan pilihanmu.'
          : 'Operasi gagal. Coba kembali.',
    },
  });
});
app.listen(Number(process.env.PORT) || 3001, '0.0.0.0', () =>
  console.log('Multiedu API: port 3001'),
);
