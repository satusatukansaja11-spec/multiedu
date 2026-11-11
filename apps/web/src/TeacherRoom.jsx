import { useEffect, useState } from 'react';
import { adventureApi, MODES } from './adventure-api.js';
export function TeacherRoom() {
  const [grade, setGrade] = useState('SMP'),
    [count, setCount] = useState(6),
    [notes, setNotes] = useState('');
  const [logged, setLogged] = useState(Boolean(localStorage.getItem('office-teacher-token'))),
    [username, setUsername] = useState(''),
    [password, setPassword] = useState(''),
    [data, setData] = useState(null),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [title, setTitle] = useState('Paket Office'),
    [json, setJson] = useState(''),
    [room, setRoom] = useState(null),
    [topic, setTopic] = useState('word'),
    [mode, setMode] = useState('quiz'),
    [pack, setPack] = useState(''),
    [report, setReport] = useState([]);
  async function refresh() {
    try {
      setData(await adventureApi('/teacher', undefined, true));
    } catch (e) {
      setError(e.message);
      if (e.status === 401) {
        localStorage.removeItem('office-teacher-token');
        setLogged(false);
      }
    }
  }
  useEffect(() => {
    if (logged) refresh();
  }, [logged]);
  const roomId = room?.id;
  useEffect(() => {
    if (!roomId || !logged) return;
    let alive = true;
    const poll = async () => {
      try {
        const value = await adventureApi(`/rooms/${roomId}/manage`, undefined, true);
        if (alive) setRoom(value);
        const rows = await adventureApi(`/rooms/${roomId}/report`, undefined, true);
        if (alive) setReport(rows);
      } catch (e) {
        if (alive) setError(e.message);
      }
    };
    poll();
    const timer = setInterval(poll, 1500);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [roomId, logged]);
  async function action(fn) {
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    }
  }
  const prompt = `Buat ${count} soal pilihan ganda Microsoft ${topic}, jenjang ${grade}. Catatan: ${notes}. Kembalikan hanya array JSON. Setiap objek wajib: {"topic":"${topic === 'mixed' ? 'word' : topic}","prompt":"Pertanyaan","options":["A","B","C","D"],"answer":0,"explanation":"Pembahasan"}. answer adalah indeks 0–3. Tanpa markdown. Pastikan kunci benar. Ini latihan Office untuk murid.`;
  return (
    <section className="teacher-panel">
      <h2>Ruang Guru</h2>
      <p>
        Akun guru lokal server. Gunakan password unik minimal 8 karakter dan nama samaran peserta.
      </p>
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      {!logged ? (
        <>
          <label htmlFor="teacher-user">Nama akun</label>
          <input
            id="teacher-user"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <label htmlFor="teacher-password">Password</label>
          <input
            id="teacher-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <div className="dialog-actions">
            <button
              className="primary-button"
              onClick={() =>
                action(async () => {
                  const value = await adventureApi('/teachers/login', { username, password });
                  localStorage.setItem('office-teacher-token', value.token);
                  setPassword('');
                  setLogged(true);
                })
              }
            >
              Masuk guru
            </button>
            <button
              className="soft-button"
              onClick={() =>
                action(async () => {
                  await adventureApi('/teachers/register', { username, password });
                  setNotice('Akun dibuat. Silakan masuk.');
                })
              }
            >
              Daftar guru
            </button>
          </div>
        </>
      ) : (
        <>
          <button
            className="soft-button"
            onClick={() =>
              action(async () => {
                await adventureApi('/teachers/logout', {}, true);
                localStorage.removeItem('office-teacher-token');
                setLogged(false);
                setData(null);
              })
            }
          >
            Keluar akun guru
          </button>
          <h3>1. Paket soal & bantuan AI</h3>
          <label htmlFor="pack-title">Judul paket / kelas</label>
          <input id="pack-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <label htmlFor="teacher-topic">Materi</label>
          <select id="teacher-topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="word">Word</option>
            <option value="excel">Excel</option>
            <option value="powerpoint">PowerPoint</option>
            <option value="mixed">Campuran</option>
          </select>
          <p>
            Jumlah soal prompt: {count} · Jenis: pilihan ganda. Untuk jenjang atau catatan tambahan,
            sunting instruksi sebelum mengirim ke AI.
          </p>
          <label htmlFor="ai-grade">Jenjang / kelas</label>
          <input
            id="ai-grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            maxLength="60"
          />
          <label htmlFor="ai-count">Jumlah soal (1–30)</label>
          <input
            id="ai-count"
            type="number"
            min="1"
            max="30"
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
          />
          <label htmlFor="ai-notes">Catatan tambahan</label>
          <input
            id="ai-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength="500"
          />
          <textarea aria-label="Perintah AI" value={prompt} readOnly rows="5" />
          <button
            className="soft-button"
            onClick={() =>
              action(async () => {
                await navigator.clipboard.writeText(prompt);
                setNotice('Perintah disalin. Jalankan di layanan AI pilihan Anda.');
              })
            }
          >
            Salin perintah
          </button>
          <div className="dialog-actions">
            {[
              ['ChatGPT', 'https://chatgpt.com'],
              ['Gemini', 'https://gemini.google.com'],
              ['Claude', 'https://claude.ai'],
            ].map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noreferrer" className="soft-button">
                {name} ↗
              </a>
            ))}
          </div>
          <label htmlFor="question-json">Tempel hasil AI atau tulis soal manual (JSON)</label>
          <textarea
            id="question-json"
            rows="9"
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder='[{"topic":"word","prompt":"…","options":["…","…","…","…"],"answer":0,"explanation":"…"}]'
          />
          <p>
            Tinjau pertanyaan dan kunci sebelum menyimpan. Impor hanya menerima 1–30 soal
            berstruktur valid.
          </p>
          <button
            className="primary-button"
            onClick={() =>
              action(async () => {
                const questions = JSON.parse(json);
                await adventureApi('/packs', { title, questions }, true);
                await refresh();
                setNotice('Paket disimpan di server.');
              })
            }
          >
            Validasi dan simpan paket baru
          </button>
          {data?.packs.map((item) => (
            <details key={item.id}>
              <summary>
                {item.title} · {item.questions.length} soal
              </summary>
              {item.questions.map((q) => (
                <p key={q.id}>
                  <b>{q.prompt}</b>
                  <br />
                  {q.options.map((o, i) => `${'ABCD'[i]}. ${o}`).join(' · ')}
                  <br />
                  Kunci: {'ABCD'[q.answer]} · {q.explanation}
                </p>
              ))}
              <button
                className="soft-button"
                onClick={() => {
                  setJson(JSON.stringify(item.questions, null, 2));
                  setTitle(item.title);
                }}
              >
                Salin ke editor untuk revisi
              </button>
              <button
                className="soft-button"
                onClick={() =>
                  action(async () => {
                    if (!confirm('Ganti semua soal paket ini dengan isi editor?')) return;
                    await adventureApi(
                      `/packs/${item.id}`,
                      { title, questions: JSON.parse(json), confirm: true },
                      true,
                    );
                    await refresh();
                  })
                }
              >
                Ganti semua soal dari editor
              </button>
            </details>
          ))}
          <h3>2. Sesi kelas</h3>
          <label htmlFor="room-mode">Mode kelas</label>
          <select id="room-mode" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="quiz">Kuis gedung</option>
            {MODES.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
          <label htmlFor="room-pack">Paket</label>
          <select id="room-pack" value={pack} onChange={(e) => setPack(e.target.value)}>
            <option value="">Bank soal bawaan sesuai materi</option>
            {data?.packs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <button
            className="primary-button"
            onClick={() =>
              action(async () => {
                setRoom(
                  await adventureApi(
                    '/rooms',
                    { name: title, topic, mode, ...(pack ? { packId: pack } : {}) },
                    true,
                  ),
                );
                await refresh();
              })
            }
          >
            Buka lobi kelas
          </button>
          <div className="dialog-actions">
            {data?.rooms.map((r) => (
              <button key={r.id} className="soft-button" onClick={() => setRoom(r)}>
                {r.name} · {r.id}
              </button>
            ))}
          </div>
          {room && (
            <>
              <h3>
                {room.name} · Kode {room.id}
              </h3>
              <p>Status: {room.phase} · Pembaruan setiap 1,5 detik</p>
              <div className="dialog-actions">
                <button
                  className="primary-button"
                  disabled={room.phase !== 'lobby'}
                  onClick={() =>
                    action(async () =>
                      setRoom(await adventureApi(`/rooms/${room.id}/start`, {}, true)),
                    )
                  }
                >
                  Mulai kelas
                </button>
                <button
                  className="soft-button"
                  disabled={room.phase === 'ended'}
                  onClick={() =>
                    action(async () => {
                      if (confirm('Akhiri sesi kelas?'))
                        setRoom(await adventureApi(`/rooms/${room.id}/end`, {}, true));
                    })
                  }
                >
                  Akhiri kelas
                </button>
                <a
                  href={`?projector=${room.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="soft-button"
                >
                  Buka proyektor ↗
                </a>
              </div>
              <Leaderboard room={room} />
              <h3>Rekap materi dan tindak lanjut</h3>
              {report.map((r, i) => (
                <div className="report-row" key={i}>
                  <b>
                    {r.name} · {r.correct}/{r.total} · {r.completed ? 'Selesai' : 'Belum selesai'}
                  </b>
                  {r.objectives.map((o) => (
                    <p key={o.topic}>
                      {o.topic}: {o.percent}% ({o.answered}/{o.total} dijawab).{' '}
                      {o.percent < 75
                        ? 'Perlu latihan ulang materi ini.'
                        : 'Capaian latihan memenuhi acuan 75%.'}
                    </p>
                  ))}
                  <p>
                    Draf catatan: {r.name} menjawab benar {r.correct} dari {r.total} soal. Guru
                    perlu meninjau hasil dan konteks sebelum dipakai untuk rapor.
                  </p>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </section>
  );
}
export function Leaderboard({ room }) {
  return (
    <div className="leaderboard">
      <h3>{room.name} · Papan peringkat</h3>
      {room.players.length ? (
        room.players.map((p, i) => (
          <div className="history-row" key={`${p.name}-${i}`}>
            <b>
              {i + 1}. {p.name}
            </b>
            <span>{p.score} XP</span>
            <small>{p.done ? 'Selesai' : p.ready ? 'Siap' : 'Menunggu'}</small>
          </div>
        ))
      ) : (
        <p>Belum ada peserta.</p>
      )}
    </div>
  );
}
export function ClassLobby({ onPlay }) {
  const [code, setCode] = useState(''),
    [room, setRoom] = useState(null),
    [error, setError] = useState(''),
    [now, setNow] = useState(Date.now());
  const launched = useState(() => new Set())[0];
  const roomId = room?.id;
  useEffect(() => {
    if (!roomId) return;
    let alive = true;
    const timer = setInterval(async () => {
      setNow(Date.now());
      try {
        const value = await adventureApi(`/rooms/${roomId}`);
        if (!alive) return;
        setRoom(value);
        setError('');
        if (value.phase === 'playing' && Date.now() >= value.startedAt && !launched.has(value.id)) {
          launched.add(value.id);
          onPlay(value);
        }
      } catch (e) {
        if (alive) setError(e.message);
      }
    }, 1000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [roomId, onPlay, launched]);
  return (
    <>
      <h2>Gabung kelas / Ajak teman</h2>
      <label htmlFor="class-code">Kode kelas enam angka</label>
      <input
        id="class-code"
        inputMode="numeric"
        maxLength="6"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button
        className="primary-button"
        onClick={() =>
          adventureApi(`/rooms/${code}/join`, {})
            .then(setRoom)
            .catch((e) => setError(e.message))
        }
      >
        Gabung kelas
      </button>
      {error && <p role="alert">{error}</p>}
      {room && (
        <>
          <h3>{room.name}</h3>
          <p>
            {room.phase === 'lobby'
              ? 'Menunggu guru menekan Mulai'
              : room.phase === 'ended'
                ? 'Sesi diakhiri'
                : `Mulai dalam ${Math.max(0, Math.ceil((room.startedAt - now) / 1000))} detik`}
          </p>
          <button
            className="soft-button"
            disabled={room.phase !== 'lobby'}
            onClick={() =>
              adventureApi(`/rooms/${room.id}/ready`, {})
                .then(setRoom)
                .catch((e) => setError(e.message))
            }
          >
            Saya siap
          </button>
          <Leaderboard room={room} />
        </>
      )}
    </>
  );
}
export function Projector({ id }) {
  const [room, setRoom] = useState(null),
    [error, setError] = useState('');
  useEffect(() => {
    const poll = () =>
      adventureApi(`/rooms/${id}/manage`, undefined, true)
        .then((value) => {
          setRoom(value);
          setError('');
        })
        .catch((e) => setError(e.message));
    poll();
    const t = setInterval(poll, 1500);
    return () => clearInterval(t);
  }, [id]);
  return (
    <main className="projector">
      <h1>Proyektor kelas</h1>
      {error && (
        <p role="alert">Data terakhir · {error}. Masuk sebagai guru di browser yang sama.</p>
      )}
      {room ? <Leaderboard room={room} /> : <p>Memuat sesi…</p>}
    </main>
  );
}
