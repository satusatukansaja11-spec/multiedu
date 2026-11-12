import { questions, topics } from './data/office-content.js';
import { wardrobe } from './data/wardrobe.js';
const KEY = 'multiedu-offline-v1';
const day = () => new Date().toISOString().slice(0, 10);
const clone = (value) => JSON.parse(JSON.stringify(value));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { player: null, runs: {} };
  } catch {
    throw new Error(
      'Data lokal tidak dapat dibaca. Jangan hapus penyimpanan sebelum membuat cadangan.',
    );
  }
}
function missions(p) {
  return [
    ['first', 'Langkah Pertama', Object.keys(p.buildings).length, 1, 25],
    ['books', 'Kolektor Buku', p.books.length, 10, 40],
    ['reading', 'Pelajar Teliti', p.lessons.length, 3, 25],
    ['helper', 'Penolong Warga', p.helped, 3, 30],
    ['combo', 'Combo Jawaban', p.bestCombo, 5, 35],
    [
      'explorer',
      'Penjelajah Office',
      new Set(Object.keys(p.buildings).map((k) => k.split(':')[1])).size,
      3,
      60,
    ],
    ['perfect', 'Nilai Sempurna', p.perfect, 1, 40],
    ['diligent', 'Pelajar Rajin', p.correct, 30, 50],
    [`daily-${day()}`, 'Misi Harian (UTC)', p.daily[day()] || 0, 5, 20],
  ].map(([id, label, progress, target, reward]) => ({
    id,
    label,
    progress,
    target,
    reward,
    claimed: p.claims.includes(id),
  }));
}
function viewPlayer(p) {
  return {
    ...p,
    level: Math.floor(p.xp / 500) + 1,
    missions: missions(p),
    badges: missions(p)
      .filter((m) => m.progress >= m.target)
      .map((m) => m.label),
  };
}
function fresh(name = 'Penjelajah', color = '#8e59e8') {
  return {
    id: uid(),
    name,
    color,
    pants: '#263656',
    hair: 'short',
    hairColor: '#3c2a28',
    hat: 'none',
    face: 'smile',
    xp: 0,
    coins: 0,
    books: [],
    lessons: [],
    buildings: {},
    claims: [],
    owned: wardrobe.filter((i) => !i.price).map((i) => i.id),
    history: [],
    helped: 0,
    correct: 0,
    combo: 0,
    bestCombo: 0,
    perfect: 0,
    daily: {},
  };
}
function viewRun(r) {
  const q = r.questions[r.index];
  return {
    ...r,
    questions: undefined,
    question: q ? { id: q.id, prompt: q.prompt, options: q.options } : null,
    total: r.questions.length,
  };
}
const duration = (mode) => (mode === 'runner' ? 12000 : mode === 'tower' ? 15000 : null);
const cases = {
  detective: [
    {
      id: 'case-1',
      topic: 'word',
      prompt: 'Berkas mana yang merupakan dokumen Word?',
      options: ['laporan.pptx', 'laporan.xlsx', 'laporan.docx', 'laporan.mp3'],
      answer: 2,
      explanation: 'Dokumen Word menggunakan .docx.',
    },
    {
      id: 'case-2',
      topic: 'word',
      prompt: 'Bagaimana mencari kata dalam laporan?',
      options: ['Ctrl+F', 'Ctrl+P', 'Ctrl+N', 'Ctrl+V'],
      answer: 0,
      explanation: 'Find (Ctrl+F) mencari kata.',
    },
  ],
  market: [
    {
      id: 'market-1',
      topic: 'excel',
      prompt: 'Pembeli membeli 3 buku, Rp8.000 per buku. Rumus total yang benar?',
      options: ['=3+8000', '=3*8000', '=8000/3', '=3-8000'],
      answer: 1,
      explanation: '3 × Rp8.000 = Rp24.000.',
    },
    {
      id: 'market-2',
      topic: 'excel',
      prompt: 'Belanja Rp24.000 dibayar Rp50.000. Kembaliannya?',
      options: ['Rp74.000', 'Rp24.000', 'Rp26.000', 'Rp16.000'],
      answer: 2,
      explanation: '=50000-24000 menghasilkan Rp26.000.',
    },
    {
      id: 'market-3',
      topic: 'excel',
      prompt: 'Diskon 10% dari Rp30.000. Harga akhir?',
      options: ['Rp27.000', 'Rp3.000', 'Rp33.000', 'Rp29.990'],
      answer: 0,
      explanation: '=30000*(1-10%) menghasilkan Rp27.000.',
    },
  ],
};
export async function offlineApi(path, body) {
  const state = load();
  const p = state.player;
  const save = (result) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      throw new Error('Penyimpanan perangkat penuh/tidak tersedia. Progres belum tersimpan.');
    }
    return clone(result);
  };
  if (path === '/players') {
    state.player ||= fresh(body.name, body.legacy?.color);
    return save({ token: 'offline-local', player: viewPlayer(state.player) });
  }
  if (path === '/catalog') return { wardrobe, topics };
  assert(p, 'Profil offline belum siap. Muat ulang permainan.');
  if (path === '/profile') {
    if (body) {
      assert(body.name?.trim(), 'Isi nama penjelajah.');
      p.name = body.name.trim().slice(0, 24);
      assert(
        ['#8e59e8', '#397ced', '#29a474', '#e76753'].includes(body.color) ||
          wardrobe.some((i) => i.value === body.color && p.owned.includes(i.id)),
        'Warna belum dimiliki.',
      );
      p.color = body.color;
      return save(viewPlayer(p));
    }
    return viewPlayer(p);
  }
  if (path === '/books') {
    assert(Number.isInteger(body.index) && body.index >= 0 && body.index < 5, 'Buku tidak valid.');
    const id = `${body.world}:${body.index}`;
    if (!p.books.includes(id)) {
      p.books.push(id);
      p.coins += 5;
    }
    return save(viewPlayer(p));
  }
  if (path === '/lessons') {
    assert(
      topics.some((t) => t.id === body.topic),
      'Materi tidak tersedia.',
    );
    if (!p.lessons.includes(body.topic)) p.lessons.push(body.topic);
    return save(viewPlayer(p));
  }
  if (path === '/claims') {
    const m = missions(p).find((m) => m.id === body.id);
    assert(m && m.progress >= m.target, 'Misi belum selesai.');
    if (!m.claimed) {
      p.claims.push(m.id);
      p.coins += m.reward;
    }
    return save(viewPlayer(p));
  }
  if (path === '/wardrobe') {
    const item = wardrobe.find((i) => i.id === body.id);
    assert(item, 'Item tidak ditemukan.');
    assert(Math.floor(p.xp / 500) + 1 >= item.level, 'Level belum cukup.');
    if (!p.owned.includes(item.id)) {
      assert(body.confirm && p.coins >= item.price, 'Konfirmasi atau koin belum cukup.');
      p.coins -= item.price;
      p.owned.push(item.id);
    }
    p[item.category] = item.value;
    return save(viewPlayer(p));
  }
  if (path === '/reset') {
    assert(body.confirm, 'Konfirmasi diperlukan.');
    state.player = fresh(p.name, p.color);
    state.runs = {};
    localStorage.removeItem('office-active-run');
    return save(viewPlayer(state.player));
  }
  if (path === '/runs') {
    assert(!body.roomId, 'Kelas lintas perangkat tidak tersedia dalam mode offline.');
    const existing = Object.values(state.runs).find(
      (r) => body.requestId && r.requestId === body.requestId,
    );
    if (existing) return viewRun(existing);
    let list =
      cases[body.mode] || questions.filter((q) => body.topic === 'mixed' || q.topic === body.topic);
    if (body.mode === 'bridge') list = list.slice(0, 6);
    assert(list.length, 'Materi belum tersedia.');
    const r = {
      ...body,
      id: uid(),
      index: 0,
      score: 0,
      correctCount: 0,
      floor: 1,
      bridge: 0,
      completed: false,
      paused: false,
      selection: -1,
      answers: [],
      questions: clone(list),
      deadline: duration(body.mode) ? Date.now() + duration(body.mode) : null,
      hits: 0,
      pickups: [],
      obstacles: [],
    };
    state.runs[r.id] = r;
    const ids = Object.keys(state.runs);
    if (ids.length > 100) delete state.runs[ids[0]];
    return save(viewRun(r));
  }
  const match = path.match(/^\/runs\/([^/]+)(?:\/(\w+))?$/);
  if (match) {
    const r = state.runs[match[1]],
      action = match[2];
    assert(r, 'Aktivitas offline tidak ditemukan. Mulai permainan baru.');
    if (!action) return viewRun(r);
    if (action === 'pause') {
      if (r.deadline && !r.paused) {
        r.remainingMs = Math.max(0, r.deadline - Date.now());
        r.paused = true;
      }
      return save(viewRun(r));
    }
    if (action === 'resume') {
      if (r.paused) {
        r.deadline = Date.now() + r.remainingMs;
        r.paused = false;
      }
      return save(viewRun(r));
    }
    if (action === 'selection') {
      assert(r.deadline && !r.paused && Date.now() < r.deadline, 'Pilihan telah dikunci.');
      assert(body.answer >= -1 && body.answer <= 3, 'Pilihan tidak valid.');
      r.selection = body.answer;
      return save({ ok: true });
    }
    if (action === 'pickup') {
      assert(
        r.mode === 'runner' && !r.completed && !r.paused && body.index === r.index,
        'Koin tidak aktif.',
      );
      if (!r.pickups.includes(r.index)) {
        r.pickups.push(r.index);
        p.coins++;
      }
      return save(viewPlayer(p));
    }
    if (action === 'obstacle') {
      assert(
        r.mode === 'runner' && !r.paused && !r.completed && Date.now() >= r.deadline - 6000,
        'Rintangan tidak aktif.',
      );
      if (!r.obstacles.includes(r.index)) {
        r.obstacles.push(r.index);
        r.hits++;
        r.score = Math.max(0, r.score - 25);
      }
      return save(viewRun(r));
    }
    if (action === 'answers') {
      const prior = r.answers.find((a) => a.questionId === body.questionId);
      if (prior) return { result: prior, session: viewRun(r), player: viewPlayer(p) };
      const q = r.questions[r.index];
      assert(q && q.id === body.questionId && !r.paused, 'Soal tidak aktif.');
      assert(!r.deadline || Date.now() >= r.deadline, 'Waktu belum habis.');
      assert(
        Number.isInteger(body.answer) && body.answer >= -1 && body.answer <= 3,
        'Jawaban tidak valid.',
      );
      const answer = r.deadline ? r.selection : body.answer,
        correct = answer === q.answer;
      r.score += correct ? 100 : 0;
      r.correctCount += correct ? 1 : 0;
      r.floor = Math.max(1, Math.min(4, r.floor + (correct ? 1 : -1)));
      r.bridge += correct ? 1 : 0;
      p.correct += correct ? 1 : 0;
      p.combo = correct ? p.combo + 1 : 0;
      p.bestCombo = Math.max(p.bestCombo, p.combo);
      if (correct) p.daily[day()] = (p.daily[day()] || 0) + 1;
      const result = {
        questionId: q.id,
        answer,
        isCorrect: correct,
        correctAnswer: q.answer,
        explanation: q.explanation,
        score: r.score,
      };
      r.answers.push(result);
      r.index++;
      r.selection = -1;
      if (r.index === r.questions.length) {
        r.completed = true;
        p.xp += r.score;
        p.coins += r.correctCount * 2;
        if (r.correctCount === r.questions.length) p.perfect++;
        if (r.mode === 'npc' && r.correctCount) p.helped++;
        if (r.mode === 'quiz' && r.correctCount / r.questions.length >= 0.5)
          p.buildings[`${r.world}:${r.topic}`] = true;
        p.history.unshift({
          id: r.id,
          mode: r.mode,
          topic: r.topic,
          score: r.score,
          correctCount: r.correctCount,
          total: r.questions.length,
          completedAt: new Date().toISOString(),
        });
        p.history = p.history.slice(0, 100);
        r.deadline = null;
      } else if (duration(r.mode)) {
        r.remainingMs = duration(r.mode);
        r.deadline = Date.now() + r.remainingMs;
        r.paused = true;
      }
      return save({ result, session: viewRun(r), player: viewPlayer(p) });
    }
  }
  throw new Error(
    'Fitur kelas dan akun guru memerlukan server lokal; tidak tersedia pada permainan offline.',
  );
}
