import { randomUUID } from 'node:crypto';
import { questions } from './questions.js';
export const sessions = new Map();
export function createSession(name, topic) {
  const selected = questions.filter((q) => q.topic === topic);
  if (!selected.length) throw new Error('Materi tidak tersedia.');
  const session = {
    id: randomUUID(),
    name,
    topic,
    index: 0,
    score: 0,
    correctCount: 0,
    answers: [],
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + 3600000,
  };
  sessions.set(session.id, session);
  return session;
}
export function getSession(id) {
  const session = sessions.get(id);
  return session && session.expiresAt > Date.now() ? session : null;
}
export function getQuestion(session) {
  const question = questions.filter((q) => q.topic === session.topic)[session.index];
  if (!question) return null;
  return { id: question.id, prompt: question.prompt, options: question.options };
}
export function submitAnswer(session, questionId, answer) {
  const previous = session.answers.find((item) => item.questionId === questionId);
  if (previous) return previous;
  const question = questions.filter((q) => q.topic === session.topic)[session.index];
  if (!question || question.id !== questionId)
    throw new Error('Soal sudah berubah. Muat ulang sesi.');
  const isCorrect = question.answer === answer;
  if (isCorrect) {
    session.score += 100;
    session.correctCount += 1;
  }
  const result = {
    questionId,
    answer,
    isCorrect,
    correctAnswer: question.answer,
    explanation: question.explanation,
    score: session.score,
  };
  session.answers.push(result);
  session.index += 1;
  return result;
}
export function snapshot(session) {
  return {
    id: session.id,
    name: session.name,
    topic: session.topic,
    score: session.score,
    correctCount: session.correctCount,
    index: session.index,
    total: questions.filter((q) => q.topic === session.topic).length,
    question: getQuestion(session),
  };
}
