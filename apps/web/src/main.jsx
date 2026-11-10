import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BookOpen,
  Trophy,
  ArrowUpRight,
  Play,
  X,
  ChevronRight,
  Volume2,
  VolumeX,
  Maximize,
  GraduationCap,
  LayoutGrid,
  Check,
  Sparkles,
  Target,
  CheckCircle2,
  RotateCcw,
  Compass,
  Move,
  Flag,
} from 'lucide-react';
import { World } from './World.jsx';
import './styles.css';
async function api(url, body) {
  const response = await fetch(
    `/api${url}`,
    body
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      : {},
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Tidak dapat terhubung ke server.');
  return data;
}
const TOPIC_ICONS = { word: 'W', excel: 'X', powerpoint: 'P' };
const ANSWER_COLORS = ['#f16c68', '#46a9f5', '#35cc8a', '#ffd344'];
function App() {
  const [topics, setTopics] = useState([]),
    [topic, setTopic] = useState('word'),
    [view, setView] = useState('adventure');
  const [modal, setModal] = useState(null),
    [name, setName] = useState(localStorage.getItem('multiedu-name') || 'Penjelajah');
  const [session, setSession] = useState(null),
    [feedback, setFeedback] = useState(null),
    [selected, setSelected] = useState(-1),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [results, setResults] = useState([]),
    [bank, setBank] = useState([]),
    [movement, setMovement] = useState(null),
    [muted, setMuted] = useState(true);
  const activeTopic = topics.find((item) => item.id === topic);
  const active = Boolean(session?.question);
  useEffect(() => {
    api('/topics')
      .then(setTopics)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (view !== 'adventure') {
      api('/results')
        .then(setResults)
        .catch((e) => setError(e.message));
      if (view === 'teacher')
        api('/questions')
          .then(setBank)
          .catch((e) => setError(e.message));
    }
  }, [view]);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement;
    const handleKey = (event) => {
      if (event.key === 'Escape') setModal(null);
      if (event.key !== 'Tab') return;
      const elements = [...document.querySelectorAll('.modal button:not(:disabled), .modal input')];
      const first = elements[0],
        last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      previous?.focus();
    };
  }, [modal]);
  async function handleStart() {
    setBusy(true);
    setError('');
    try {
      const data = await api('/sessions', { name, topic });
      setSession(data);
      setFeedback(null);
      setSelected(-1);
      setModal(null);
      localStorage.setItem('multiedu-name', name);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function playTone(correct) {
    if (muted) return;
    try {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.frequency.value = correct ? 660 : 220;
      gain.gain.setValueAtTime(0.06, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.25);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.25);
      oscillator.onended = () => context.close();
    } catch {
      /* Audio is optional on unsupported devices. */
    }
  }
  async function handleAnswer() {
    if (selected < 0 || busy || feedback) return;
    setBusy(true);
    setError('');
    try {
      const data = await api(`/sessions/${session.id}/answers`, {
        questionId: session.question.id,
        answer: selected,
      });
      setFeedback({ ...data.result, next: data.session });
      playTone(data.result.isCorrect);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function handleNext() {
    setSession(feedback.next);
    setFeedback(null);
    setSelected(-1);
  }
  function handleExit() {
    setSession(null);
    setFeedback(null);
    setSelected(-1);
    setModal(null);
  }
  const completed = session && !session.question;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView('adventure');
          }}
        >
          <span className="brand-mark">
            <GraduationCap size={24} />
          </span>
          <span>
            multi<span className="gold-text">edu</span>
            <small>LEARN. PLAY. LEVEL UP.</small>
          </span>
        </a>
        <div className="workspace-label">RUANG BELAJAR</div>
        <nav>
          {[
            { id: 'adventure', label: 'Petualangan', icon: Compass },
            { id: 'results', label: 'Papan peringkat', icon: Trophy },
            { id: 'teacher', label: 'Ruang guru', icon: GraduationCap },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${view === id ? 'nav-item--active' : ''}`}
              onClick={() => setView(id)}
            >
              <Icon size={19} />
              {label}
              {view === id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-guide">
          <span className="guide-icon">
            <Sparkles size={21} />
          </span>
          <b>Belajar jadi petualangan.</b>
          <p>Satu jawaban benar, satu langkah lebih hebat.</p>
          <button onClick={() => setModal('guide')}>
            Cara bermain <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="sidebar-footer">
          <span className="status-dot" /> Mode latihan individual
          <small>Office Adventure · v0.1</small>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="breadcrumbs">
            Ruang belajar <ChevronRight size={14} />
            <span>
              {view === 'adventure'
                ? 'Petualangan'
                : view === 'teacher'
                  ? 'Ruang guru'
                  : 'Papan peringkat'}
            </span>
          </div>
          <div className="topbar-right">
            <span className="office-tag">
              <span /> OFFICE ADVENTURE
            </span>
            <button className="profile-button" onClick={() => setModal('profile')}>
              <span className="profile-avatar">{name.slice(0, 1).toUpperCase()}</span>
              <span>
                {name}
                <small>Penjelajah digital</small>
              </span>
            </button>
          </div>
        </header>
        <div className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span /> BELAJAR SAMBIL MENJELAJAH
              </div>
              <h1>
                {view === 'adventure' ? (
                  <>
                    Petualangan <span>dimulai di sini.</span>
                  </>
                ) : view === 'teacher' ? (
                  <>
                    Ruang <span>guru.</span>
                  </>
                ) : (
                  <>
                    Jejak <span>penjelajah.</span>
                  </>
                )}
              </h1>
              <p>
                {view === 'adventure'
                  ? 'Kuasai Microsoft Office. Selesaikan tantangan. Naikkan levelmu.'
                  : view === 'teacher'
                    ? 'Jelajahi bank materi dan pantau hasil latihan yang tersimpan di server ini.'
                    : 'Setiap latihan adalah langkah baru. Lihat pencapaian para penjelajah.'}
              </p>
            </div>
            <button
              className="button button--outline help-button"
              onClick={() => setModal('guide')}
            >
              <BookOpen size={16} /> Panduan bermain
            </button>
          </div>
          {error && (
            <div className="error-banner" role="alert">
              {error}
              <button onClick={() => setError('')} aria-label="Tutup pesan">
                <X size={16} />
              </button>
            </div>
          )}
          {view === 'adventure' ? (
            <>
              <section className="adventure-layout">
                <div className="arena-card">
                  <div className="arena-top">
                    <span className="live-label">
                      <span />
                      {active ? 'TANTANGAN BERLANGSUNG' : 'LOBI PULAU LANGIT'}
                    </span>
                    <span className="arena-mode">
                      <LayoutGrid size={13} /> {active ? 'Jatuh Bangun' : 'Dunia belajar 3D'}
                    </span>
                  </div>
                  <div className="arena-scene">
                    <World
                      feedback={feedback}
                      active={active}
                      movement={movement}
                      onZone={setSelected}
                      topic={topic}
                    />
                    <div className="scene-profile">
                      <span className="mini-avatar">{name.slice(0, 1).toUpperCase()}</span>
                      <div>
                        <b>{name}</b>
                        <small>
                          {session ? `${session.score} XP diperoleh` : 'Penjelajah digital'}
                        </small>
                        <span className="xp-track">
                          <i style={{ width: `${session ? session.score / 6 : 0}%` }} />
                        </span>
                      </div>
                    </div>
                    <div className="scene-tools">
                      <button
                        title={muted ? 'Aktifkan suara jawaban' : 'Matikan suara jawaban'}
                        onClick={() => setMuted(!muted)}
                      >
                        {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                      </button>
                      <button
                        title="Layar penuh"
                        onClick={() => {
                          if (document.fullscreenElement) document.exitFullscreen?.();
                          else
                            document
                              .querySelector('.arena-card')
                              .requestFullscreen?.()
                              .catch(() => setError('Layar penuh tidak tersedia.'));
                        }}
                      >
                        <Maximize size={17} />
                      </button>
                    </div>
                    {!active && !completed && (
                      <div className="lobby-caption">
                        <span className="pill">
                          <span /> ARENA LATIHAN SIAP
                        </span>
                        <h2>
                          Dunia kecil.
                          <br />
                          Kemampuan besar.
                        </h2>
                        <p>
                          Jelajahi pulau, pilih materi,
                          <br />
                          dan taklukkan tantangan Office.
                        </p>
                      </div>
                    )}
                    <div className="scene-bottom">
                      <span>
                        <Move size={14} /> WASD / panah untuk bergerak
                      </span>
                      <span>Geser untuk putar kamera</span>
                    </div>
                    <div className="touch-controls" aria-label="Kontrol gerak">
                      {[
                        ['up', '↑'],
                        ['left', '←'],
                        ['down', '↓'],
                        ['right', '→'],
                      ].map(([direction, label]) => (
                        <button
                          key={direction}
                          aria-label={`Bergerak ${direction}`}
                          onPointerDown={(e) => {
                            e.currentTarget.setPointerCapture(e.pointerId);
                            setMovement(direction);
                          }}
                          onPointerUp={() => setMovement(null)}
                          onPointerCancel={() => setMovement(null)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="arena-footer">
                    <div>
                      <span className="island-icon">
                        <Flag size={18} />
                      </span>
                      <span>
                        <b>Pulau Pengetahuan</b>
                        <small>
                          {active
                            ? `${activeTopic?.name} · Soal ${session.index + 1} dari ${session.total}`
                            : '3 gedung materi · 18 tantangan'}
                        </small>
                      </span>
                    </div>
                    <span className="solo-badge">LATIHAN SOLO</span>
                  </div>
                </div>
                <aside className="mission-panel">
                  <div className="section-kicker">
                    <Target size={16} /> MISI PILIHANMU
                  </div>
                  <h2>{active ? 'Taklukkan soalnya.' : 'Siap naik level?'}</h2>
                  <p>
                    {active
                      ? 'Bergerak ke bidang A–D atau tekan pilihan jawaban di bawah arena.'
                      : 'Pilih materi di bawah, baca bekalnya, lalu mulai petualanganmu.'}
                  </p>
                  <div className={`topic-symbol topic-symbol--${topic}`}>
                    {TOPIC_ICONS[topic]}
                    <span>
                      <Sparkles size={20} />
                    </span>
                  </div>
                  <h3>{activeTopic?.name || 'Memuat materi…'}</h3>
                  <span className="difficulty">
                    PEMULA <i /> 6 SOAL
                  </span>
                  <div className="mission-details">
                    <span>
                      <Target size={16} /> Target latihan <b>6 jawaban</b>
                    </span>
                    <span>
                      <Sparkles size={16} /> XP maksimum <b>600 XP</b>
                    </span>
                    <span>
                      <BookOpen size={16} /> Waktu bermain <b>Tanpa batas</b>
                    </span>
                  </div>
                  <button
                    className="button button--gold start-button"
                    disabled={busy || !activeTopic}
                    onClick={() => (active ? setModal('exit') : setModal('start'))}
                  >
                    {active ? <Flag size={17} /> : <Play size={17} fill="currentColor" />}
                    {active ? 'Akhiri latihan' : 'Mulai petualangan'}
                    <ArrowUpRight size={18} />
                  </button>
                  <small className="mission-footnote">
                    {active
                      ? 'Hasil disimpan setelah 6 soal selesai.'
                      : 'Belajar dengan ritmemu sendiri.'}
                  </small>
                </aside>
              </section>
              {active && (
                <section className="question-card">
                  <div className="question-header">
                    <span className="eyebrow">
                      JATUH BANGUN · SOAL {session.index + 1}/{session.total}
                    </span>
                    <b className="gold-text">{feedback ? feedback.score : session.score} XP</b>
                  </div>
                  <h2>{session.question.prompt}</h2>
                  <div className="answer-grid">
                    {session.question.options.map((option, index) => (
                      <button
                        key={option}
                        disabled={busy || Boolean(feedback)}
                        style={{ '--answer-color': ANSWER_COLORS[index] }}
                        className={`answer ${selected === index ? 'answer--selected' : ''} ${feedback && feedback.correctAnswer === index ? 'answer--correct' : ''}`}
                        onClick={() => setSelected(index)}
                      >
                        <b>{'ABCD'[index]}</b>
                        <span>{option}</span>
                        {selected === index && <Check size={18} />}
                      </button>
                    ))}
                  </div>
                  {feedback ? (
                    <div className="feedback" role="status">
                      <div>
                        <b>
                          {feedback.isCorrect
                            ? 'Benar! Kamu naik satu langkah. +100 XP'
                            : `Belum tepat. Jawaban yang benar: ${'ABCD'[feedback.correctAnswer]}.`}
                        </b>
                        <p>{feedback.explanation}</p>
                      </div>
                      <button className="button button--gold" onClick={handleNext}>
                        {feedback.next.question ? 'Soal berikutnya' : 'Lihat hasil'}
                        <ChevronRight size={17} />
                      </button>
                    </div>
                  ) : (
                    <div className="question-action">
                      <small>Pilih bidang di arena atau klik jawaban, lalu konfirmasi.</small>
                      <button
                        className="button button--gold"
                        disabled={selected < 0 || busy}
                        onClick={handleAnswer}
                      >
                        {busy ? 'Memeriksa…' : 'Kunci jawaban'}
                        <Check size={17} />
                      </button>
                    </div>
                  )}
                </section>
              )}
              {completed && (
                <section className="completion-card">
                  <span className="completion-icon">
                    <Trophy size={32} />
                  </span>
                  <div>
                    <span className="eyebrow">PETUALANGAN SELESAI</span>
                    <h2>Hebat, {session.name}!</h2>
                    <p>
                      {session.correctCount} dari {session.total} jawaban benar · {session.score}{' '}
                      XP.{' '}
                      {session.correctCount < session.total
                        ? 'Baca kembali bekal materi dan coba lagi.'
                        : 'Kamu menaklukkan semua tantangan!'}
                    </p>
                  </div>
                  <button className="button button--gold" onClick={handleExit}>
                    <RotateCcw size={16} /> Kembali ke lobi
                  </button>
                </section>
              )}
              <section className="materials-section">
                <div className="section-heading">
                  <div>
                    <h2>
                      Pilih jalur belajarmu <span>03</span>
                    </h2>
                    <p>Tiga keterampilan penting. Satu petualangan seru.</p>
                  </div>
                  <span className="material-note">
                    <BookOpen size={14} /> Materi Microsoft Office
                  </span>
                </div>
                <div className="topic-grid">
                  {topics.map((item, index) => (
                    <button
                      key={item.id}
                      disabled={active}
                      onClick={() => {
                        setTopic(item.id);
                        setSession(null);
                      }}
                      className={`topic-card ${topic === item.id ? 'topic-card--selected' : ''}`}
                      style={{ '--topic-color': item.color }}
                    >
                      <div className="topic-card-top">
                        <span className={`app-icon app-icon--${item.id}`}>{item.short}</span>
                        <span className="topic-number">0{index + 1}</span>
                      </div>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <div className="topic-card-bottom">
                        <span>
                          {item.questionCount} tantangan <i /> Pemula
                        </span>
                        {topic === item.id ? (
                          <span className="selected-label">
                            <CheckCircle2 size={14} /> Dipilih
                          </span>
                        ) : (
                          <ArrowUpRight size={19} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
              <section className="lesson-strip">
                <span className="lesson-icon">
                  <BookOpen size={23} />
                </span>
                <div>
                  <span className="eyebrow">BEKAL SEBELUM BERANGKAT</span>
                  <h3>{activeTopic?.name}</h3>
                  <p>{activeTopic?.lesson}</p>
                </div>
              </section>
            </>
          ) : (
            <section className="dashboard">
              <div className="stats-grid">
                <div>
                  <Target />
                  <small>Latihan selesai</small>
                  <b>{results.length}</b>
                </div>
                <div>
                  <Sparkles />
                  <small>XP terkumpul</small>
                  <b>{results.reduce((sum, item) => sum + item.score, 0)}</b>
                </div>
                <div>
                  <BookOpen />
                  <small>Materi tersedia</small>
                  <b>3</b>
                </div>
              </div>
              <div className="section-heading">
                <h2>{view === 'teacher' ? 'Penguasaan per materi' : 'Hasil latihan terbaru'}</h2>
                <span className="solo-badge">DATA LATIHAN LOKAL SERVER</span>
              </div>
              {view === 'teacher' && (
                <div className="mastery-grid">
                  {topics.map((item) => {
                    const matches = results.filter((result) => result.topic === item.id);
                    const rate = matches.length
                      ? Math.round(
                          matches.reduce(
                            (sum, result) => sum + (result.correctCount / result.total) * 100,
                            0,
                          ) / matches.length,
                        )
                      : null;
                    return (
                      <div className="mastery-card" key={item.id}>
                        <span className={`app-icon app-icon--${item.id}`}>{item.short}</span>
                        <h3>{item.name}</h3>
                        <b>{rate === null ? 'Belum ada data' : `${rate}%`}</b>
                        <div className="progress">
                          <i style={{ width: `${rate || 0}%`, background: item.color }} />
                        </div>
                        <small>{matches.length} latihan selesai</small>
                      </div>
                    );
                  })}
                </div>
              )}
              {results.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Penjelajah</th>
                        <th>Materi</th>
                        <th>Benar</th>
                        <th>XP</th>
                        <th>Selesai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...results]
                        .sort((a, b) => (view === 'results' ? b.score - a.score : 0))
                        .map((item) => (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{topics.find((t) => t.id === item.topic)?.name}</td>
                            <td>
                              {item.correctCount}/{item.total}
                            </td>
                            <td className="gold-text">{item.score}</td>
                            <td>{new Date(item.completedAt).toLocaleString('id-ID')}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <Trophy size={36} />
                  <h3>Petualanganmu menunggu.</h3>
                  <p>Selesaikan satu latihan untuk melihat hasil di sini.</p>
                  <button className="button button--gold" onClick={() => setView('adventure')}>
                    Mulai belajar
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
              {view === 'teacher' && (
                <>
                  <div className="section-heading">
                    <h2>Bank soal Office</h2>
                    <span>{bank.length} soal bawaan · hanya baca</span>
                  </div>
                  <div className="bank-list">
                    {bank.map((item) => (
                      <details key={item.id}>
                        <summary>
                          <span className={`app-icon app-icon--${item.topic}`}>
                            {TOPIC_ICONS[item.topic]}
                          </span>
                          {item.prompt}
                          <ChevronRight size={16} />
                        </summary>
                        <ol type="A">
                          {item.options.map((option) => (
                            <li key={option}>{option}</li>
                          ))}
                        </ol>
                        <p>{item.explanation}</p>
                      </details>
                    ))}
                  </div>
                  <p className="scope-note">
                    Ruang guru ini adalah pratinjau analitik latihan tanpa akun. Pengelolaan kelas,
                    editor soal, impor AI, dan proyektor multiplayer belum tersedia. Gunakan nama
                    samaran; jangan masukkan data pribadi murid.
                  </p>
                </>
              )}
            </section>
          )}
          <footer className="page-footer">
            <span>© {new Date().getFullYear()} Multiedu. Belajar tanpa batas.</span>
            <span>
              <span className="status-dot" /> Latihan individual · Bukan layanan resmi Microsoft
            </span>
          </footer>
        </div>
      </main>
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Tutup"
              onClick={() => setModal(null)}
              autoFocus
            >
              <X size={20} />
            </button>
            {modal === 'guide' ? (
              <>
                <span className="modal-icon">
                  <Compass size={28} />
                </span>
                <h2 id="modal-title">Panduan penjelajah</h2>
                <ol className="guide-steps">
                  <li>
                    <b>Pilih materi</b>
                    <p>Pilih Word, Excel, atau PowerPoint, lalu baca bekal materi.</p>
                  </li>
                  <li>
                    <b>Jelajahi arena</b>
                    <p>
                      Gerakkan avatar dengan WASD, tombol panah, atau kontrol sentuh. Geser arena
                      untuk memutar kamera.
                    </p>
                  </li>
                  <li>
                    <b>Jawab dan naik level</b>
                    <p>
                      Berdiri di bidang A–D atau klik jawaban, lalu kunci pilihan. Jawaban benar
                      mendapat 100 XP, salah 0 XP. Tidak ada batas waktu.
                    </p>
                  </li>
                  <li>
                    <b>Lihat hasil</b>
                    <p>
                      Selesaikan enam soal. Hasil disimpan di server lokal dan muncul di papan
                      peringkat.
                    </p>
                  </li>
                </ol>
                <button className="button button--gold" onClick={() => setModal(null)}>
                  Siap berpetualang <ArrowUpRight size={17} />
                </button>
              </>
            ) : modal === 'exit' ? (
              <>
                <h2 id="modal-title">Akhiri latihan ini?</h2>
                <p>Progres latihan yang belum selesai tidak masuk ke rekap hasil.</p>
                <div className="modal-actions">
                  <button className="button button--outline" onClick={() => setModal(null)}>
                    Lanjut belajar
                  </button>
                  <button className="button button--gold" onClick={handleExit}>
                    Kembali ke lobi
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className={`app-icon app-icon--${topic}`}>{TOPIC_ICONS[topic]}</span>
                <h2 id="modal-title">
                  {modal === 'profile' ? 'Siapa nama penjelajahmu?' : `Misi ${activeTopic?.name}`}
                </h2>
                <p>
                  {modal === 'profile'
                    ? 'Gunakan nama samaran. Nama ini tersimpan di browser perangkatmu.'
                    : 'Enam soal, satu petualangan. Baca bekal materi lalu uji pemahamanmu.'}
                </p>
                <label className="input-label" htmlFor="player-name">
                  Nama penjelajah
                </label>
                <input
                  id="player-name"
                  value={name}
                  maxLength={24}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Bintang"
                />
                <small className="input-note">1–24 karakter · gunakan nama samaran</small>
                {modal === 'start' && <div className="modal-lesson">{activeTopic?.lesson}</div>}
                <button
                  className="button button--gold"
                  disabled={!name.trim() || busy}
                  onClick={() =>
                    modal === 'profile'
                      ? (localStorage.setItem('multiedu-name', name.trim()),
                        setName(name.trim()),
                        setModal(null))
                      : handleStart()
                  }
                >
                  {busy ? 'Menyiapkan arena…' : modal === 'profile' ? 'Simpan nama' : 'Masuk arena'}
                  <ArrowUpRight size={17} />
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
