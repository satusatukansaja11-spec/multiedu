import { describe, it, expect } from 'vitest';
import { createSession, snapshot, submitAnswer } from './game-service.js';
import { questions } from './questions.js';
describe('server-authoritative practice', () => {
  it('does not expose the answer before submission', () => {
    const state = snapshot(createSession('Explorer', 'word'));
    expect(state.question.answer).toBeUndefined();
    expect(state.question.explanation).toBeUndefined();
    expect(state.total).toBe(6);
  });
  it('scores an answer only once when a request is retried', () => {
    const session = createSession('Explorer', 'excel');
    const question = questions.find((item) => item.topic === 'excel');
    submitAnswer(session, question.id, question.answer);
    submitAnswer(session, question.id, question.answer);
    expect(session.score).toBe(100);
    expect(session.index).toBe(1);
  });
  it('rejects an answer for a future question', () => {
    const session = createSession('Explorer', 'word');
    expect(() => submitAnswer(session, 'word-3', 0)).toThrow();
    expect(session.score).toBe(0);
  });
  it('completes all topics and keeps incorrect answers at zero', () => {
    for (const topic of ['word', 'excel', 'powerpoint']) {
      const session = createSession('Explorer', topic);
      for (const question of questions.filter((item) => item.topic === topic))
        submitAnswer(session, question.id, (question.answer + 1) % 4);
      expect(snapshot(session).question).toBeNull();
      expect(session.score).toBe(0);
      expect(session.answers).toHaveLength(6);
    }
  });
});
