import { beforeEach, expect, it, vi } from 'vitest';
import { offlineApi } from './offline-store.js';
import { questions } from './data/office-content.js';
beforeEach(() => {
  const store = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key) => store.get(key) || null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  });
});
it('contains six bundled questions per Office topic, scores and persists without fetch', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      throw new Error('Network forbidden');
    }),
  );
  await offlineApi('/players', { name: 'Offline' });
  for (const topic of ['word', 'excel', 'powerpoint']) {
    let run = await offlineApi('/runs', { mode: 'quiz', topic, world: 'city' });
    expect(run.total).toBe(6);
    for (const q of questions.filter((q) => q.topic === topic)) {
      const result = await offlineApi(`/runs/${run.id}/answers`, {
        questionId: q.id,
        answer: q.answer,
      });
      const duplicate = await offlineApi(`/runs/${run.id}/answers`, {
        questionId: q.id,
        answer: q.answer,
      });
      expect(duplicate.session.score).toBe(result.session.score);
      run = result.session;
    }
    expect(run.completed).toBe(true);
    expect(run.score).toBe(600);
  }
  expect((await offlineApi('/profile')).xp).toBe(1800);
  expect(fetch).not.toHaveBeenCalled();
});
it('does not grant duplicate book coins or mission rewards', async () => {
  await offlineApi('/players', { name: 'Offline' });
  for (const world of ['city', 'ocean'])
    for (let i = 0; i < 5; i++) await offlineApi('/books', { world, index: i });
  expect((await offlineApi('/books', { world: 'city', index: 0 })).coins).toBe(50);
  expect((await offlineApi('/claims', { id: 'books' })).coins).toBe(90);
  expect((await offlineApi('/claims', { id: 'books' })).coins).toBe(90);
});
it('locks the last local selection at the timer deadline', async () => {
  vi.useFakeTimers();
  try {
    await offlineApi('/players', { name: 'Offline timer' });
    const run = await offlineApi('/runs', { mode: 'tower', topic: 'word', world: 'city' });
    await offlineApi(`/runs/${run.id}/selection`, { answer: 0 });
    await expect(
      offlineApi(`/runs/${run.id}/answers`, { questionId: run.question.id, answer: 0 }),
    ).rejects.toThrow('Waktu belum habis');
    vi.advanceTimersByTime(15001);
    const result = await offlineApi(`/runs/${run.id}/answers`, {
      questionId: run.question.id,
      answer: 3,
    });
    expect(result.result.isCorrect).toBe(true);
    expect(result.session.floor).toBe(2);
  } finally {
    vi.useRealTimers();
  }
});
