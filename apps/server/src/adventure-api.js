import { Router } from 'express';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { z } from 'zod';
import { questions, topics } from './questions.js';
const file = new URL('../data/adventure.json', import.meta.url);
await mkdir(new URL('../data/', import.meta.url), { recursive: true });
let state = { players: {}, teachers: {}, auth: {}, packs: {}, rooms: {}, runs: {} };
try {
  state = JSON.parse(await readFile(file, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const token = () => randomBytes(24).toString('hex');
const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), { status });
};
const nameSchema = z.string().trim().min(1).max(24);
const topicSchema = z.enum(['word', 'excel', 'powerpoint', 'mixed']);
const modeSchema = z.enum(['quiz', 'npc', 'runner', 'tower', 'detective', 'market', 'bridge']);
export const worldIds = [
  'city',
  'ocean',
  'space',
  'forest',
  'islands',
  'global',
  'body',
  'prehistoric',
  'history',
  'extreme',
  'future',
];
export const wardrobe = [
  {
    id: 'shirt-gold',
    category: 'color',
    label: 'Kaos emas',
    value: '#e8b83c',
    price: 20,
    level: 1,
  },
  {
    id: 'pants-blue',
    category: 'pants',
    label: 'Celana biru',
    value: '#284d9c',
    price: 0,
    level: 1,
  },
  {
    id: 'pants-red',
    category: 'pants',
    label: 'Celana merah',
    value: '#9b3544',
    price: 15,
    level: 1,
  },
  {
    id: 'hair-short',
    category: 'hair',
    label: 'Rambut pendek',
    value: 'short',
    price: 0,
    level: 1,
  },
  { id: 'hair-tall', category: 'hair', label: 'Rambut tinggi', value: 'tall', price: 15, level: 1 },
  {
    id: 'hair-brown',
    category: 'hairColor',
    label: 'Rambut cokelat',
    value: '#74442e',
    price: 0,
    level: 1,
  },
  {
    id: 'hair-black',
    category: 'hairColor',
    label: 'Rambut hitam',
    value: '#242333',
    price: 0,
    level: 1,
  },
  { id: 'hat-none', category: 'hat', label: 'Tanpa topi', value: 'none', price: 0, level: 1 },
  { id: 'hat-cap', category: 'hat', label: 'Topi penjelajah', value: 'cap', price: 30, level: 2 },
  { id: 'face-smile', category: 'face', label: 'Senyum', value: 'smile', price: 0, level: 1 },
  {
    id: 'face-glasses',
    category: 'face',
    label: 'Kacamata',
    value: 'glasses',
    price: 20,
    level: 1,
  },
];
const day = () => new Date().toISOString().slice(0, 10);
function missions(player) {
  const completed = Object.keys(player.buildings).length;
  return [
    ['first', 'Langkah Pertama', completed, 1, 25],
    ['books', 'Kolektor Buku', player.books.length, 10, 40],
    ['reading', 'Pelajar Teliti', player.lessons.length, 3, 25],
    ['helper', 'Penolong Warga', player.helped, 3, 30],
    ['combo', 'Combo Jawaban', player.bestCombo, 5, 35],
    [
      'explorer',
      'Penjelajah Office',
      new Set(Object.keys(player.buildings).map((k) => k.split(':')[1])).size,
      3,
      60,
    ],
    ['perfect', 'Nilai Sempurna', player.perfect, 1, 40],
    ['diligent', 'Pelajar Rajin', player.correct, 30, 50],
    [`daily-${day()}`, 'Misi Harian (UTC)', player.daily[day()] || 0, 5, 20],
  ].map(([id, label, progress, target, reward]) => ({
    id,
    label,
    progress,
    target,
    reward,
    claimed: player.claims.includes(id),
  }));
}
function publicPlayer(player) {
  return {
    ...player,
    level: Math.floor(player.xp / 500) + 1,
    missions: missions(player),
    badges: missions(player)
      .filter((m) => m.progress >= m.target)
      .map((m) => m.label),
  };
}
function actor(req, role = 'player') {
  const credential = req.headers.authorization?.replace(/^Bearer /, '');
  const auth = state.auth[credential];
  if (!auth || auth.role !== role || auth.expires < Date.now())
    fail('Akses tidak tersedia. Masuk kembali.', 401);
  return role === 'teacher' ? state.teachers[auth.id] : state.players[auth.id];
}
function ownerRoom(req) {
  const teacher = actor(req, 'teacher');
  const room = state.rooms[req.params.id];
  if (!room || room.teacherId !== teacher.id) fail('Kelas tidak ditemukan.', 404);
  return room;
}
function playerRun(req) {
  const player = actor(req);
  const run = state.runs[req.params.id];
  if (!run || run.playerId !== player.id) fail('Sesi tidak ditemukan.', 404);
  return { player, run };
}
function roomView(room) {
  return {
    id: room.id,
    name: room.name,
    mode: room.mode,
    topic: room.topic,
    phase: room.phase,
    startedAt: room.startedAt,
    players: Object.values(room.players)
      .map((p) => ({ name: p.name, ready: p.ready, score: p.score, done: p.done }))
      .sort((a, b) => b.score - a.score),
  };
}
function runView(run) {
  const question = run.questions[run.index];
  return {
    id: run.id,
    mode: run.mode,
    topic: run.topic,
    index: run.index,
    total: run.questions.length,
    score: run.score,
    correctCount: run.correctCount,
    floor: run.floor,
    bridge: run.bridge,
    selection: run.selection ?? -1,
    hits: run.hits || 0,
    deadline: run.deadline,
    paused: run.paused,
    remainingMs: run.remainingMs,
    completed: run.completed,
    question: question
      ? { id: question.id, prompt: question.prompt, options: question.options }
      : null,
    answers: run.answers,
  };
}
function saveResult(run, player) {
  if (run.completed) return;
  run.completed = true;
  run.question = null;
  player.xp += run.score;
  player.coins += run.correctCount * 2;
  if (run.correctCount === run.questions.length) player.perfect++;
  if (run.mode === 'npc' && run.correctCount > 0) player.helped++;
  if (run.mode === 'quiz' && run.correctCount / run.questions.length >= 0.5)
    player.buildings[`${run.world}:${run.topic}`] = true;
  const result = {
    id: run.id,
    mode: run.mode,
    topic: run.topic,
    score: run.score,
    correctCount: run.correctCount,
    total: run.questions.length,
    completedAt: new Date().toISOString(),
  };
  player.history.unshift(result);
  player.history = player.history.slice(0, 100);
  if (run.roomId) {
    const room = state.rooms[run.roomId];
    if (room?.players[player.id]) {
      room.players[player.id].done = true;
      room.players[player.id].score = run.score;
    }
  }
}
const duration = (mode) => (mode === 'runner' ? 12000 : mode === 'tower' ? 15000 : null);
let queue = Promise.resolve();
export const adventureRouter = Router();
function route(method, path, handler) {
  adventureRouter[method](path, (req, res) => {
    const task = async () => {
      const before = method !== 'get' ? structuredClone(state) : null;
      try {
        const result = await handler(req);
        if (method !== 'get') {
          await writeFile(new URL('../data/adventure.tmp', import.meta.url), JSON.stringify(state));
          await rename(new URL('../data/adventure.tmp', import.meta.url), file);
        }
        res.json(result ?? { ok: true });
      } catch (error) {
        if (before) state = before;
        throw error;
      }
    };
    queue = queue
      .catch(() => {})
      .then(task)
      .catch((error) => {
        res.status(error instanceof z.ZodError ? 400 : error.status || 500).json({
          error: {
            message:
              error instanceof z.ZodError
                ? 'Data tidak valid. Periksa isian.'
                : error.status
                  ? error.message
                  : 'Tidak dapat menyimpan data. Coba kembali.',
          },
        });
      });
  });
}
route('post', '/players', (req) => {
  const name = nameSchema.parse(req.body.name);
  const id = randomUUID(),
    credential = token();
  const old = req.body.legacy;
  const color = z
    .string()
    .regex(/^#[0-9a-f]{6}$/i)
    .catch('#8e59e8')
    .parse(old?.color);
  state.players[id] = {
    id,
    name,
    color: ['#8e59e8', '#397ced', '#29a474', '#e76753'].includes(color) ? color : '#8e59e8',
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
    owned: wardrobe.filter((i) => i.price === 0).map((i) => i.id),
    history: [],
    helped: 0,
    correct: 0,
    combo: 0,
    bestCombo: 0,
    perfect: 0,
    daily: {},
  };
  state.auth[credential] = { role: 'player', id, expires: Date.now() + 365 * 86400000 };
  return { token: credential, player: publicPlayer(state.players[id]) };
});
route('get', '/profile', (req) => publicPlayer(actor(req)));
route('post', '/profile', (req) => {
  const player = actor(req);
  const data = z
    .object({ name: nameSchema, color: z.string().regex(/^#[0-9a-f]{6}$/i) })
    .parse(req.body);
  if (
    !['#8e59e8', '#397ced', '#29a474', '#e76753'].includes(data.color) &&
    !wardrobe.some(
      (item) =>
        item.category === 'color' && item.value === data.color && player.owned.includes(item.id),
    )
  )
    fail('Beli item warna ini sebelum memakainya.');
  Object.assign(player, data);
  return publicPlayer(player);
});
route('get', '/catalog', () => ({ wardrobe, topics, worldIds }));
route('post', '/books', (req) => {
  const player = actor(req);
  const { world, index } = z
    .object({ world: z.enum(worldIds), index: z.number().int().min(0).max(4) })
    .parse(req.body);
  const id = `${world}:${index}`;
  if (!player.books.includes(id)) {
    player.books.push(id);
    player.coins += 5;
  }
  return publicPlayer(player);
});
route('post', '/lessons', (req) => {
  const player = actor(req);
  const topic = z.enum(['word', 'excel', 'powerpoint']).parse(req.body.topic);
  if (!player.lessons.includes(topic)) player.lessons.push(topic);
  return publicPlayer(player);
});
route('post', '/claims', (req) => {
  const player = actor(req);
  const mission = missions(player).find((m) => m.id === req.body.id);
  if (!mission || mission.progress < mission.target) fail('Misi belum selesai.');
  if (!mission.claimed) {
    player.claims.push(mission.id);
    player.coins += mission.reward;
  }
  return publicPlayer(player);
});
route('post', '/wardrobe', (req) => {
  const player = actor(req);
  const item = wardrobe.find((i) => i.id === req.body.id);
  if (!item) fail('Item tidak ditemukan.');
  if (Math.floor(player.xp / 500) + 1 < item.level) fail('Level belum cukup.');
  if (!player.owned.includes(item.id)) {
    if (req.body.confirm !== true) fail('Konfirmasi pembelian diperlukan.');
    if (player.coins < item.price) fail('Koin belum cukup.');
    player.coins -= item.price;
    player.owned.push(item.id);
  }
  player[item.category] = item.value;
  return publicPlayer(player);
});
route('post', '/reset', (req) => {
  const player = actor(req);
  if (req.body.confirm !== true) fail('Konfirmasi diperlukan.');
  Object.assign(player, {
    xp: 0,
    coins: 0,
    books: [],
    lessons: [],
    buildings: {},
    claims: [],
    owned: wardrobe.filter((i) => i.price === 0).map((i) => i.id),
    history: [],
    helped: 0,
    correct: 0,
    combo: 0,
    bestCombo: 0,
    perfect: 0,
    daily: {},
    hat: 'none',
    face: 'smile',
    hair: 'short',
    hairColor: '#3c2a28',
    pants: '#263656',
  });
  return publicPlayer(player);
});
route('post', '/runs', (req) => {
  const player = actor(req);
  const input = z
    .object({
      topic: topicSchema,
      mode: modeSchema,
      world: z.enum(worldIds).default('city'),
      roomId: z.string().optional(),
      requestId: z.string().max(80).optional(),
    })
    .parse(req.body);
  if (input.requestId) {
    const existing = Object.values(state.runs).find(
      (r) => r.playerId === player.id && r.requestId === input.requestId,
    );
    if (existing) return runView(existing);
  }
  let list = questions.filter((q) => input.topic === 'mixed' || q.topic === input.topic),
    room;
  if (input.roomId) {
    room = state.rooms[input.roomId];
    if (!room?.players[player.id] || room.phase !== 'playing' || Date.now() < room.startedAt)
      fail('Kelas belum dimulai.');
    input.topic = room.topic;
    input.mode = room.mode;
    list = room.packId
      ? state.packs[room.packId].questions
      : questions.filter((q) => room.topic === 'mixed' || q.topic === room.topic);
    const existing = Object.values(state.runs).find(
      (r) => r.roomId === room.id && r.playerId === player.id,
    );
    if (existing) return runView(existing);
  }
  if (input.mode === 'detective')
    list = [
      {
        id: 'case-1',
        topic: 'word',
        prompt:
          'Laporan Bu Sari terselip di antara berkas Office. Berkas mana yang merupakan dokumen Word?',
        options: ['laporan.pptx', 'laporan.xlsx', 'laporan.docx', 'laporan.mp3'],
        answer: 2,
        explanation:
          'Dokumen Word berekstensi .docx. Berkas .xlsx adalah Excel, .pptx adalah presentasi.',
      },
      {
        id: 'case-2',
        topic: 'word',
        prompt: 'Bagaimana mencari kata dalam laporan yang ditemukan?',
        options: ['Ctrl+F', 'Ctrl+P', 'Ctrl+N', 'Ctrl+V'],
        answer: 0,
        explanation: 'Find (Ctrl+F) mencari kata dalam dokumen.',
      },
    ];
  if (input.mode === 'market')
    list = [
      {
        id: 'market-1',
        topic: 'excel',
        prompt:
          'Pembeli membeli 3 buku seharga Rp8.000 per buku. Rumus dan total yang benar adalah…',
        options: ['=3+8000 → 8003', '=3*8000 → 24000', '=8000/3 → 2666', '=3-8000 → -7997'],
        answer: 1,
        explanation: 'Perkalian ditulis dengan *. 3 × 8.000 = Rp24.000.',
      },
      {
        id: 'market-2',
        topic: 'excel',
        prompt: 'Total belanja Rp24.000, dibayar Rp50.000. Berapa kembaliannya?',
        options: ['Rp74.000', 'Rp24.000', 'Rp26.000', 'Rp16.000'],
        answer: 2,
        explanation: '=50000-24000 menghasilkan 26000.',
      },
      {
        id: 'market-3',
        topic: 'excel',
        prompt: 'Diskon 10% untuk barang Rp30.000. Harga setelah diskon adalah…',
        options: ['Rp27.000', 'Rp3.000', 'Rp33.000', 'Rp29.990'],
        answer: 0,
        explanation: '=30000*(1-10%) menghasilkan Rp27.000.',
      },
    ];
  if (input.mode === 'bridge') list = list.slice(0, 6);
  const id = randomUUID();
  const run = {
    id,
    playerId: player.id,
    ...input,
    questions: JSON.parse(JSON.stringify(list)),
    index: 0,
    answers: [],
    score: 0,
    correctCount: 0,
    floor: 1,
    bridge: 0,
    completed: false,
    deadline: duration(input.mode) ? Date.now() + duration(input.mode) : null,
    paused: false,
  };
  state.runs[id] = run;
  return runView(run);
});
route('post', '/runs/:id/pickup', (req) => {
  const { player, run } = playerRun(req);
  if (run.mode !== 'runner' || run.completed || run.paused) fail('Koleksi tidak aktif.');
  const index = z.number().int().min(0).parse(req.body.index);
  if (index !== run.index) fail('Koleksi tidak aktif.');
  run.pickups ||= [];
  if (!run.pickups.includes(index)) {
    run.pickups.push(index);
    player.coins++;
  }
  return publicPlayer(player);
});
route('post', '/runs/:id/obstacle', (req) => {
  const { run } = playerRun(req);
  if (run.mode !== 'runner' || run.completed || run.paused || Date.now() < run.deadline - 6000)
    fail('Rintangan belum aktif.');
  run.obstacles ||= [];
  if (!run.obstacles.includes(run.index)) {
    run.obstacles.push(run.index);
    run.hits = (run.hits || 0) + 1;
    run.score = Math.max(0, run.score - 25);
  }
  return runView(run);
});
route('get', '/runs/:id', (req) => runView(playerRun(req).run));
route('post', '/runs/:id/pause', (req) => {
  const { run } = playerRun(req);
  if (run.roomId) fail('Waktu kelas tidak dapat dijeda.');
  if (run.deadline && !run.paused) {
    run.remainingMs = Math.max(0, run.deadline - Date.now());
    run.paused = true;
  }
  return runView(run);
});
route('post', '/runs/:id/resume', (req) => {
  const { run } = playerRun(req);
  if (run.paused) {
    run.deadline = Date.now() + run.remainingMs;
    run.paused = false;
  }
  return runView(run);
});
route('post', '/runs/:id/selection', (req) => {
  const { run } = playerRun(req);
  const { answer } = z.object({ answer: z.number().int().min(-1).max(3) }).parse(req.body);
  if (!run.deadline || run.paused || Date.now() >= run.deadline)
    fail('Pilihan telah dikunci.', 409);
  run.selection = answer;
  return { ok: true };
});
route('post', '/runs/:id/answers', (req) => {
  const { player, run } = playerRun(req);
  const { questionId, answer } = z
    .object({ questionId: z.string().max(80), answer: z.number().int().min(-1).max(3) })
    .parse(req.body);
  const previous = run.answers.find((a) => a.questionId === questionId);
  if (previous) return { result: previous, session: runView(run), player: publicPlayer(player) };
  const question = run.questions[run.index];
  if (!question || question.id !== questionId) fail('Soal tidak aktif.', 409);
  if (run.paused) fail('Sesi dijeda.');
  if (run.roomId && state.rooms[run.roomId]?.phase !== 'playing')
    fail('Sesi kelas telah diakhiri.');
  if (run.deadline && Date.now() < run.deadline) fail('Gerbang/timer belum berakhir.', 409);
  const chosen = run.deadline ? (run.selection ?? -1) : answer;
  const correct = chosen === question.answer;
  run.score += correct ? 100 : 0;
  run.correctCount += correct ? 1 : 0;
  run.floor = Math.max(1, Math.min(4, run.floor + (correct ? 1 : -1)));
  run.bridge += correct ? 1 : 0;
  player.correct += correct ? 1 : 0;
  player.combo = correct ? player.combo + 1 : 0;
  player.bestCombo = Math.max(player.bestCombo, player.combo);
  if (correct) player.daily[day()] = (player.daily[day()] || 0) + 1;
  const result = {
    questionId,
    answer: chosen,
    isCorrect: correct,
    correctAnswer: question.answer,
    explanation: question.explanation,
    score: run.score,
  };
  run.answers.push(result);
  run.index++;
  run.selection = -1;
  if (run.index >= run.questions.length) saveResult(run, player);
  run.deadline = !run.completed && duration(run.mode) ? Date.now() + duration(run.mode) : null;
  if (run.deadline) {
    run.paused = true;
    run.remainingMs = duration(run.mode);
  }
  if (run.roomId) state.rooms[run.roomId].players[player.id].score = run.score;
  return { result, session: runView(run), player: publicPlayer(player) };
});
const credentials = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8).max(128),
});
route('post', '/teachers/register', (req) => {
  const data = credentials.parse(req.body);
  if (Object.values(state.teachers).some((t) => t.username === data.username))
    fail('Nama akun telah dipakai.');
  const salt = token(),
    id = randomUUID();
  state.teachers[id] = {
    id,
    username: data.username,
    salt,
    hash: scryptSync(data.password, salt, 64).toString('hex'),
  };
  return { ok: true };
});
route('post', '/teachers/login', (req) => {
  const data = credentials.parse(req.body);
  const teacher = Object.values(state.teachers).find((t) => t.username === data.username);
  if (
    !teacher ||
    !timingSafeEqual(scryptSync(data.password, teacher.salt, 64), Buffer.from(teacher.hash, 'hex'))
  )
    fail('Nama akun atau password salah.', 401);
  const credential = token();
  state.auth[credential] = { role: 'teacher', id: teacher.id, expires: Date.now() + 86400000 };
  return { token: credential, username: teacher.username };
});
route('post', '/teachers/logout', (req) => {
  actor(req, 'teacher');
  delete state.auth[req.headers.authorization.replace(/^Bearer /, '')];
  return { ok: true };
});
const questionSchema = z.object({
  prompt: z.string().trim().min(5).max(500),
  options: z.array(z.string().trim().min(1).max(250)).length(4),
  answer: z.number().int().min(0).max(3),
  explanation: z.string().min(1).max(1000),
  topic: z.enum(['word', 'excel', 'powerpoint']),
});
route('get', '/teacher', (req) => {
  const teacher = actor(req, 'teacher');
  return {
    username: teacher.username,
    packs: Object.values(state.packs).filter((p) => p.teacherId === teacher.id),
    rooms: Object.values(state.rooms)
      .filter((r) => r.teacherId === teacher.id)
      .map(roomView),
  };
});
route('post', '/packs', (req) => {
  const teacher = actor(req, 'teacher');
  const input = z
    .object({
      title: z.string().trim().min(1).max(100),
      questions: z.array(questionSchema).min(1).max(30),
    })
    .parse(req.body);
  const id = randomUUID();
  state.packs[id] = {
    id,
    teacherId: teacher.id,
    title: input.title,
    questions: input.questions.map((q, i) => ({ ...q, id: `${id}-${i}` })),
  };
  return { id };
});
route('post', '/packs/:id', (req) => {
  const teacher = actor(req, 'teacher');
  const pack = state.packs[req.params.id];
  if (!pack || pack.teacherId !== teacher.id) fail('Paket tidak ditemukan.', 404);
  const input = z
    .object({
      title: z.string().min(1).max(100),
      questions: z.array(questionSchema).min(1).max(30),
      confirm: z.literal(true),
    })
    .parse(req.body);
  pack.title = input.title;
  pack.questions = input.questions.map((q, i) => ({ ...q, id: `${pack.id}-${i}` }));
  return { id: pack.id };
});
route('post', '/rooms', (req) => {
  const teacher = actor(req, 'teacher');
  const input = z
    .object({
      name: z.string().trim().min(1).max(60),
      topic: topicSchema,
      mode: modeSchema,
      packId: z.string().optional(),
    })
    .parse(req.body);
  if (input.packId && state.packs[input.packId]?.teacherId !== teacher.id)
    fail('Paket tidak ditemukan.', 404);
  let id;
  do {
    id = String(Math.floor(100000 + Math.random() * 900000));
  } while (state.rooms[id]);
  state.rooms[id] = { id, ...input, teacherId: teacher.id, phase: 'lobby', players: {} };
  return roomView(state.rooms[id]);
});
route('post', '/rooms/:id/join', (req) => {
  const player = actor(req);
  const room = state.rooms[req.params.id];
  if (!room || room.phase === 'ended') fail('Kode kelas tidak aktif.', 404);
  if (!room.players[player.id])
    room.players[player.id] = {
      id: player.id,
      name: player.name,
      ready: false,
      score: 0,
      done: false,
    };
  return roomView(room);
});
route('post', '/rooms/:id/ready', (req) => {
  const player = actor(req),
    room = state.rooms[req.params.id];
  if (!room?.players[player.id]) fail('Gabung kelas dahulu.', 403);
  room.players[player.id].ready = true;
  return roomView(room);
});
route('get', '/rooms/:id', (req) => {
  const player = actor(req),
    room = state.rooms[req.params.id];
  if (!room?.players[player.id]) fail('Kelas tidak ditemukan.', 404);
  return roomView(room);
});
route('get', '/rooms/:id/manage', (req) => roomView(ownerRoom(req)));
route('post', '/rooms/:id/start', (req) => {
  const room = ownerRoom(req);
  if (room.phase !== 'lobby') fail('Kelas telah dimulai.');
  if (!Object.keys(room.players).length || Object.values(room.players).some((p) => !p.ready))
    fail('Tunggu semua peserta siap.');
  room.phase = 'playing';
  room.startedAt = Date.now() + 3000;
  return roomView(room);
});
route('post', '/rooms/:id/end', (req) => {
  const room = ownerRoom(req);
  room.phase = 'ended';
  return roomView(room);
});
route('get', '/rooms/:id/report', (req) => {
  const room = ownerRoom(req);
  return Object.values(state.runs)
    .filter((r) => r.roomId === room.id)
    .map((run) => ({
      name: state.players[run.playerId]?.name,
      mode: run.mode,
      topic: run.topic,
      score: run.score,
      correct: run.correctCount,
      total: run.questions.length,
      completed: run.completed,
      objectives: [...new Set(run.questions.map((q) => q.topic))].map((topic) => {
        const list = run.questions.filter((q) => q.topic === topic);
        const answers = run.answers.filter((a) => list.some((q) => q.id === a.questionId));
        return {
          topic,
          percent: Math.round((answers.filter((a) => a.isCorrect).length / list.length) * 100),
          answered: answers.length,
          total: list.length,
        };
      }),
    }));
});
