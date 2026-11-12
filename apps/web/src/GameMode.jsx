import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { Shape } from './WorldScenery.jsx';
import { adventureApi, LESSONS } from './adventure-api.js';
function ArenaLabel({ position, children }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#203455';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(children), 256, 64);
    const value = new CanvasTexture(canvas);
    value.colorSpace = SRGBColorSpace;
    return value;
  }, [children]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={position} scale={[2, 0.5, 1]}>
      <spriteMaterial map={texture} depthTest={false} />
    </sprite>
  );
}
const COLORS = ['#f16c68', '#46a9f5', '#35cc8a', '#ffd344'];
function Arena({ mode, lane, floor, bridge, theme, jump, duck, progress, chase }) {
  const road = useRef();
  const gate = useRef();
  const player = useRef();
  useFrame((_, delta) => {
    if (gate.current) gate.current.position.z = Math.min(3, -30 + (progress.current / 12) * 32);
    if (road.current) road.current.position.z = (progress.current * 3) % 12;
    if (player.current) {
      player.current.position.x +=
        ((mode === 'tower' ? (lane % 2 ? 2 : -2) : lane * 2 - 3) - player.current.position.x) *
        Math.min(1, delta * 12);
      player.current.position.z =
        mode === 'tower' ? (lane < 2 ? -2 : 1) : mode === 'bridge' ? 2 - bridge * 3 : 2;
      player.current.position.y = (mode === 'tower' ? (floor - 1) * 5 : 0) + (jump ? 1.5 : 0);
    }
  });
  const sky = theme === 'space' ? '#10152d' : theme === 'beach' ? '#9ce7f0' : '#b6dce6';
  return (
    <>
      <color attach="background" args={[sky]} />
      <ambientLight intensity={1.8} />
      <directionalLight position={[5, 12, 5]} intensity={2} />
      {mode === 'runner' ? (
        <>
          <Shape position={[0, -0.3, -25]} scale={[9, 0.4, 100]} color="#647586" />
          <group ref={road}>
            {Array.from({ length: 18 }, (_, i) => (
              <group key={i} position={[0, 0, -i * 6]}>
                {[-2, 0, 2].map((x) => (
                  <Shape key={x} position={[x, 0.01, 0]} scale={[0.05, 0.03, 2]} color="#fff" />
                ))}
                <Shape
                  position={[(i % 4) * 2 - 3, 0.7, 0]}
                  scale={[0.3, 0.6, 0.3]}
                  color="#ffd344"
                  type="cylinder"
                />
                {i % 3 === 0 && (
                  <Shape
                    position={[(i % 4) * 2 - 3, 0.5, -3]}
                    scale={[1, 0.9, 1]}
                    color="#ea876c"
                  />
                )}
              </group>
            ))}
          </group>
          <group ref={gate} position={[0, 0, -30]}>
            {COLORS.map((color, i) => (
              <group position={[i * 2 - 3, 0, 0]} key={color}>
                <Shape position={[0, 1, 0]} scale={[1.9, 2, 0.15]} color={color} />
                <ArenaLabel position={[0, 2.7, 0]}>{'ABCD'[i]}</ArenaLabel>
              </group>
            ))}
          </group>
          {Array.from({ length: 10 }, (_, i) => (
            <group key={i} position={[i % 2 ? 7 : -7, 0, -i * 7]}>
              {theme === 'beach' ? (
                <>
                  <Shape position={[0, 1.7, 0]} scale={[0.2, 3.4, 0.2]} color="#93704a" />
                  <Shape position={[0, 3.5, 0]} scale={[2, 0.1, 0.5]} color="#439b68" />
                </>
              ) : theme === 'space' ? (
                <Shape position={[0, 0.4, 0]} scale={[1, 0.6, 1]} color="#9095b1" type="sphere" />
              ) : (
                <Shape position={[0, 2, 0]} scale={[2, 4, 2]} color={COLORS[i % 4]} />
              )}
            </group>
          ))}
        </>
      ) : mode === 'tower' ? (
        <>
          {[1, 2, 3, 4].map((level) => (
            <group key={level} position={[0, (level - 1) * 5, 0]}>
              <Shape position={[0, -0.3, 0]} scale={[10, 0.4, 8]} color="#f9f8ee" />
              {COLORS.map((color, i) => (
                <group key={color} position={[i % 2 ? 2 : -2, 0, i < 2 ? -2 : 1]}>
                  <Shape position={[0, 0, 0]} scale={[3.9, 0.15, 2.9]} color={color} />
                  <ArenaLabel position={[0, 0.3, 0]}>{'ABCD'[i]}</ArenaLabel>
                </group>
              ))}
              <ArenaLabel position={[-5, 1, 0]}>{`Lantai ${level}`}</ArenaLabel>
            </group>
          ))}
        </>
      ) : mode === 'bridge' ? (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <Shape
              key={i}
              position={[0, -0.4, -i * 3]}
              scale={[5, 0.5, 2.8]}
              color={i <= bridge ? '#e2bf77' : '#5a799f'}
            />
          ))}
          <ArenaLabel position={[0, 1, -21]}>FINIS</ArenaLabel>
        </>
      ) : (
        <>
          <Shape position={[0, -0.4, 0]} scale={[16, 0.5, 14]} color="#b8d5a0" />
          {[-4, 4].map((x) => (
            <Shape
              key={x}
              position={[x, 1, -3]}
              scale={[2, 2, 2]}
              color={mode === 'market' ? '#eab666' : '#6788be'}
            />
          ))}
        </>
      )}
      {chase && (
        <group position={[lane * 2 - 3, 0, 5]}>
          <Shape position={[0, 0.4, 0]} scale={[0.5, 0.4, 0.7]} color="#fff" />
          <Shape position={[0, 0.9, 0]} scale={[0.15, 0.7, 0.15]} color="#fff" />
          <Shape position={[0, 1.3, 0.2]} scale={[0.18, 0.15, 0.4]} color="#ffb53f" />
        </group>
      )}
      <group
        ref={player}
        position={[lane * 2 - 3, mode === 'tower' ? (floor - 1) * 5 : 0, 2]}
        scale={[1, duck ? 0.5 : 1, 1]}
      >
        <Shape position={[0, 0.4, 0]} scale={[0.5, 0.8, 0.4]} color="#263854" />
        <Shape position={[0, 1, 0]} scale={[0.8, 0.6, 0.4]} color="#965ae1" />
        <Shape position={[0, 1.6, 0]} scale={[0.5, 0.5, 0.5]} color="#f0c892" />
      </group>
      <OrbitControls
        target={[0, mode === 'tower' ? (floor - 1) * 5 : 0, mode === 'bridge' ? -8 : -3]}
        enablePan={false}
        minDistance={10}
        maxDistance={28}
      />
    </>
  );
}
export function GameMode({
  mode,
  topic,
  theme = 'city',
  name,
  onExit,
  onPlayer,
  sound,
  roomId,
  resumeId,
  autoRead = false,
}) {
  const [run, setRun] = useState(null),
    [lane, setLane] = useState(0),
    [feedback, setFeedback] = useState(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [paused, setPaused] = useState(false),
    [seconds, setSeconds] = useState(15),
    [clues, setClues] = useState([]),
    [caseReady, setCaseReady] = useState(false),
    [jump, setJump] = useState(false),
    [duck, setDuck] = useState(false);
  const laneRef = useRef(0),
    sent = useRef(false),
    progress = useRef(0),
    pickup = useRef(-1),
    obstacle = useRef(-1),
    generation = useRef(0);
  const createKey = useRef(`${Date.now()}-${Math.random().toString(36).slice(2)}`);
  laneRef.current = lane;
  useEffect(() => {
    let alive = true;
    const id = ++generation.current;
    (resumeId
      ? adventureApi(`/runs/${resumeId}`)
      : adventureApi('/runs', {
          mode,
          topic,
          requestId: createKey.current,
          world: 'city',
          ...(roomId ? { roomId } : {}),
        })
    )
      .then((value) => {
        if (alive && generation.current === id) {
          setRun(value);
          setPaused(value.paused);
          localStorage.setItem(
            'office-active-run',
            JSON.stringify({ id: value.id, mode, topic, theme, roomId }),
          );
        }
      })
      .catch((e) => setError(e.message));
    return () => {
      alive = false;
    };
  }, [mode, topic, roomId, resumeId, theme]);
  useEffect(() => {
    progress.current = 0;
  }, [run?.index]);
  useEffect(() => {
    if (!run || feedback || paused || run.completed) return;
    let last = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      progress.current += (now - last) / 1000;
      last = now;
      if (run.deadline) setSeconds(Math.max(0, Math.ceil((run.deadline - now) / 1000)));
    }, 100);
    return () => clearInterval(timer);
  }, [run, feedback, paused]);
  useEffect(() => {
    if (!run?.deadline || feedback || paused || run.completed) return;
    adventureApi(`/runs/${run.id}/selection`, { answer: lane }).catch((e) => {
      if (Date.now() < run.deadline) setError(e.message);
    });
  }, [lane, run?.id, run?.index, run?.deadline, run?.completed, feedback, paused]);
  function speakQuestion() {
    if (!window.speechSynthesis) return;
    const localVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.localService && voice.lang.startsWith('id'));
    if (!localVoice) {
      setError('Suara pembaca offline Bahasa Indonesia belum tersedia.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(run?.question?.prompt || '');
    utterance.lang = 'id-ID';
    utterance.voice = localVoice;
    window.speechSynthesis.speak(utterance);
  }
  useEffect(() => {
    if (autoRead && run?.question && window.speechSynthesis) {
      const localVoice = window.speechSynthesis
        .getVoices()
        .find((voice) => voice.localService && voice.lang.startsWith('id'));
      if (!localVoice) return;
      const utterance = new SpeechSynthesisUtterance(run.question.prompt);
      utterance.voice = localVoice;
      utterance.lang = 'id-ID';
      window.speechSynthesis.speak(utterance);
    }
    return () => window.speechSynthesis?.cancel();
  }, [autoRead, run?.question]);
  async function submit(answer) {
    if (sent.current || !run?.question) return;
    sent.current = true;
    setBusy(true);
    try {
      const data = await adventureApi(`/runs/${run.id}/answers`, {
        questionId: run.question.id,
        answer,
      });
      setFeedback(data);
      onPlayer(data.player);
      sound(data.result.isCorrect ? 'correct' : 'wrong');
    } catch (e) {
      setError(e.message);
      sent.current = false;
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!run?.deadline || feedback || paused || run.completed) return;
    const timer = setInterval(() => {
      if (Date.now() >= run.deadline) submit(laneRef.current);
    }, 200);
    return () => clearInterval(timer);
  });
  useEffect(() => {
    const handle = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || feedback || paused) return;
      if (['ArrowLeft', 'a'].includes(e.key)) {
        e.preventDefault();
        setLane((l) => (mode === 'tower' ? Math.max(0, l - 1) : Math.max(0, l - 1)));
      }
      if (['ArrowRight', 'd'].includes(e.key)) {
        e.preventDefault();
        setLane((l) => Math.min(3, l + 1));
      }
      if (mode === 'tower' && ['w', 'ArrowUp'].includes(e.key)) setLane((l) => l % 2);
      if (mode === 'tower' && ['s', 'ArrowDown'].includes(e.key)) setLane((l) => (l % 2) + 2);
      if (e.code === 'Space') {
        e.preventDefault();
        setJump(true);
        setTimeout(() => setJump(false), 700);
      }
      if (e.key === 'Control') {
        setDuck(true);
        setTimeout(() => setDuck(false), 700);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [mode, feedback, paused]);
  async function next() {
    let state = feedback.session;
    if (state.completed) localStorage.removeItem('office-active-run');
    if (state.deadline) state = await adventureApi(`/runs/${run.id}/resume`, {});
    setRun(state);
    setFeedback(null);
    sent.current = false;
    pickup.current = -1;
  }
  async function pause() {
    try {
      if (!paused) await adventureApi(`/runs/${run.id}/pause`, {});
      else setRun(await adventureApi(`/runs/${run.id}/resume`, {}));
      setPaused(!paused);
    } catch (e) {
      setError(e.message);
    }
  }
  const collect = useCallback(() => {
    if (pickup.current === run.index) return;
    pickup.current = run.index;
    adventureApi(`/runs/${run.id}/pickup`, { index: run.index })
      .then((player) => {
        onPlayer(player);
        sound('book');
      })
      .catch((e) => setError(e.message));
  }, [run, onPlayer, sound]);
  useEffect(() => {
    if (mode !== 'runner' || !run || feedback || paused || run.completed) return;
    const elapsed = (run.deadline - Date.now()) / 1000;
    if (elapsed < 9 && pickup.current !== run.index && lane === run.index % 4) collect();
    if (elapsed < 6 && obstacle.current !== run.index) {
      obstacle.current = run.index;
      if (lane === (run.index + 1) % 4 && !(run.index % 2 ? duck : jump))
        adventureApi(`/runs/${run.id}/obstacle`, {})
          .then(setRun)
          .catch((e) => setError(e.message));
    }
  }, [seconds, mode, run, feedback, paused, lane, jump, duck, collect]);
  const [clueText, setClueText] = useState('');
  const title = {
    quiz: 'Kuis Kelas',
    npc: 'Tantangan Warga',
    runner: 'Lari Kilat',
    tower: 'Jatuh Bangun',
    detective: 'Detektif Kota Ilmu',
    market: 'Pasar Nusantara',
    bridge: 'Jembatan Juara',
  }[mode];
  return (
    <section className="mode-screen">
      <div className="mode-scene">
        <Canvas
          camera={{
            position: [8, mode === 'tower' ? (run?.floor - 1 || 0) * 5 + 12 : 9, 13],
            fov: 48,
          }}
          dpr={[1, 1.5]}
        >
          <Arena
            mode={mode}
            lane={lane}
            floor={run?.floor || 1}
            bridge={run?.bridge || 0}
            theme={theme}
            jump={jump}
            duck={duck}
            chase={run?.hits > 0}
            progress={progress}
          />
        </Canvas>
      </div>
      <div className="mode-hud">
        <div className="mode-heading">
          <b>{title}</b>
          <span>
            {name} · {run?.score || 0} XP
          </span>
          <button
            className="soft-button"
            onClick={() => {
              if (
                confirm(
                  'Keluar dari aktivitas? Sesi belum selesai tetap tersimpan, hadiah diberikan setelah selesai.',
                )
              )
                onExit();
            }}
          >
            Keluar
          </button>
          {['runner', 'tower'].includes(mode) && !roomId && run && !run.completed && (
            <button className="soft-button" onClick={pause}>
              {paused ? 'Lanjut' : 'Jeda'}
            </button>
          )}
        </div>
        {run?.hits > 0 && (
          <p>Angsa mendekat! Tabrakan: {run.hits}. Tetap berlari, tidak ada eliminasi.</p>
        )}
        {error && (
          <p role="alert" className="error-banner">
            {error}
            <button onClick={() => setError('')}>Tutup</button>
          </p>
        )}
        {error && run && (
          <button
            className="soft-button"
            onClick={() =>
              adventureApi(`/runs/${run.id}`)
                .then((value) => {
                  setRun(value);
                  setFeedback(null);
                  setPaused(value.paused);
                  sent.current = false;
                  setError('');
                })
                .catch((e) => setError(e.message))
            }
          >
            Sinkronkan sesi kembali
          </button>
        )}
        {!run ? (
          <p>Menyiapkan sesi…</p>
        ) : run.completed ? (
          <>
            <h2>Petualangan selesai!</h2>
            <p>
              {run.correctCount}/{run.total} benar · {run.score} XP ·{' '}
              {run.mode === 'bridge'
                ? `${run.bridge} bagian jembatan terbuka`
                : mode === 'tower'
                  ? `Lantai akhir ${run.floor}/4`
                  : ''}
            </p>
            <button className="primary-button" onClick={onExit}>
              Kembali ke beranda
            </button>
          </>
        ) : (
          <>
            <span className="dialog-kicker">
              SOAL {run.index + 1}/{run.total} {mode === 'tower' ? `· LANTAI ${run.floor}/4` : ''}{' '}
              {run.deadline ? `· ${seconds} DETIK` : ''}
            </span>
            {mode === 'detective' && !caseReady ? (
              <>
                <h2>Kasus Dokumen Hilang</h2>
                <p>
                  Baca empat petunjuk sebelum menjawab. Tentukan pilihan yang sesuai prosedur
                  Office.
                </p>
                {clueText && <p className="lesson-content">{clueText}</p>}
                <div className="clue-grid">
                  {['Surat Bu Sari', 'Catatan operator', 'Berita sekolah', 'Kesaksian warga'].map(
                    (label, index) => (
                      <button
                        key={label}
                        className="soft-button"
                        onClick={() => {
                          setClues([...new Set([...clues, index])]);
                          sound('click');
                          setClueText(
                            [
                              LESSONS.word,
                              LESSONS.excel,
                              LESSONS.powerpoint,
                              'Gunakan Find untuk mencari kata. File Word .docx, Excel .xlsx, presentasi .pptx. Periksa informasi sebelum mengubah dokumen.',
                            ][index],
                          );
                        }}
                      >
                        {label} {clues.includes(index) ? '✓' : ''}
                      </button>
                    ),
                  )}
                </div>
                <button
                  className="primary-button"
                  disabled={clues.length < 4}
                  onClick={() => setCaseReady(true)}
                >
                  Sudah membaca 4 petunjuk · Pecahkan kasus
                </button>
              </>
            ) : (
              <>
                <h2>{run.question?.prompt}</h2>
                <button
                  className="soft-button"
                  disabled={!('speechSynthesis' in window)}
                  onClick={speakQuestion}
                >
                  Bacakan soal
                </button>
                <div className="quiz-answers">
                  {run.question?.options.map((option, index) => (
                    <button
                      key={option}
                      className={`${lane === index ? 'option-selected' : ''} ${feedback?.result.correctAnswer === index ? 'is-correct' : ''}`}
                      disabled={busy || Boolean(feedback) || paused}
                      onClick={() => {
                        setLane(index);
                        if (!run.deadline) submit(index);
                      }}
                    >
                      <b>{'ABCD'[index]}</b>
                      {option}
                    </button>
                  ))}
                </div>
                {run.deadline && !feedback && (
                  <p>
                    Pilih bidang/lajur. Jawaban dikunci otomatis saat waktu habis.{' '}
                    {mode === 'tower'
                      ? 'Benar naik, salah turun satu lantai; tidak ada eliminasi.'
                      : 'Panah pindah lajur, Spasi lompat, Ctrl runduk. Rintangan muncul di lajur berikutnya saat tersisa 6 detik; gagal menghindar -25 skor.'}
                  </p>
                )}
              </>
            )}
            {mode === 'runner' && !feedback && (
              <div className="dialog-actions">
                <button
                  className="soft-button"
                  onClick={() => {
                    setJump(true);
                    setTimeout(() => setJump(false), 700);
                  }}
                >
                  Lompat
                </button>
                <button
                  className="soft-button"
                  onClick={() => {
                    setDuck(true);
                    setTimeout(() => setDuck(false), 700);
                  }}
                >
                  Runduk
                </button>
              </div>
            )}
            {mode === 'runner' && !feedback && !paused && (
              <button
                className="soft-button"
                disabled={pickup.current === run.index}
                onClick={collect}
              >
                Ambil koin lintasan (+1 per soal)
              </button>
            )}
            {feedback && (
              <div role="status" className="quiz-feedback">
                <b>{feedback.result.isCorrect ? 'Benar! +100 XP' : 'Belum tepat.'}</b>
                <p>{feedback.result.explanation}</p>
                <button
                  className="primary-button"
                  onClick={() => next().catch((e) => setError(e.message))}
                >
                  {feedback.session.completed ? 'Lihat hasil' : 'Lanjut'}
                </button>
              </div>
            )}
            {paused && <p>Permainan dijeda.</p>}
          </>
        )}
      </div>
    </section>
  );
}
