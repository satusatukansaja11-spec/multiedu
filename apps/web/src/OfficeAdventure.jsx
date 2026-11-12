import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Compass,
  Play,
  Settings,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  X,
  Pause,
  Shirt,
  Flag,
  Trophy,
  ArrowRight,
  GraduationCap,
  Map,
  Check,
  Coins,
} from 'lucide-react';
import { CITY_BUILDINGS, cityToMap } from './city-layout.js';
import { World, BOOKS } from './World.jsx';
import { adventureApi, WORLDS, MODES, LESSONS, OFFLINE_MODE } from './adventure-api.js';
import { GameMode } from './GameMode.jsx';
import { TeacherRoom, ClassLobby, Projector } from './TeacherRoom.jsx';
import { playSfx } from './sfx.js';
import './adventure.css';
const COLORS = ['#8e59e8', '#397ced', '#29a474', '#e76753'];
function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
export function OfficeAdventure() {
  const [cameraView, setCameraView] = useState('overview');
  const [resumeId, setResumeId] = useState(null);
  const [world, setWorld] = useState('city'),
    [topic, setTopic] = useState('word'),
    [gameMode, setGameMode] = useState(null),
    [setupMode, setSetupMode] = useState('runner'),
    [runnerTheme, setRunnerTheme] = useState('city'),
    [roomId, setRoomId] = useState(null);
  const [catalog, setCatalog] = useState([]),
    [costumeCategory, setCostumeCategory] = useState('pants'),
    [missionTab, setMissionTab] = useState('Misi'),
    [lessonRead, setLessonRead] = useState(false),
    [activitySource, setActivitySource] = useState('quiz');
  const [quality, setQuality] = useState(() => read('office-quality', 'high')),
    [autoRead, setAutoRead] = useState(() => read('office-auto-read', false)),
    [gameReady, setGameReady] = useState(false);
  useEffect(() => {
    let alive = true;
    const init = async () => {
      try {
        let player;
        if (
          !localStorage.getItem('office-legacy-profile') &&
          localStorage.getItem('office-profile')
        )
          localStorage.setItem('office-legacy-profile', localStorage.getItem('office-profile'));
        if (localStorage.getItem(OFFLINE_MODE ? 'office-offline-ready' : 'office-player-token'))
          player = await adventureApi('/profile');
        else {
          const value = await adventureApi('/players', {
            name: read('office-profile', {}).name || 'Penjelajah',
            legacy: read('office-profile', {}),
          });
          localStorage.setItem(
            OFFLINE_MODE ? 'office-offline-ready' : 'office-player-token',
            value.token,
          );
          player = value.player;
        }
        if (alive) {
          setProfile(player);
          setGameReady(true);
        }
        const value = await adventureApi('/catalog');
        if (alive) setCatalog(value.wardrobe);
      } catch (e) {
        if (alive) setError(e.message);
      }
    };
    init();
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    localStorage.setItem('office-quality', JSON.stringify(quality));
    localStorage.setItem('office-auto-read', JSON.stringify(autoRead));
  }, [quality, autoRead]);
  const [screen, setScreen] = useState('home'),
    [modal, setModal] = useState(null);
  const [profile, setProfile] = useState(() =>
    read('office-profile', { name: 'Penjelajah', color: COLORS[0], books: [], xp: 0 }),
  );
  const [theme, setTheme] = useState(() => read('office-theme', 'dark'));
  const [volume, setVolume] = useState(() => read('office-volume', 0.4)),
    [muted, setMuted] = useState(() => read('office-muted', false));
  const [toast, setToast] = useState(''),
    [nearby, setNearby] = useState(null),
    [movement, setMovement] = useState(null);
  const [session, setSession] = useState(null),
    [feedback, setFeedback] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false),
    [results, setResults] = useState([]);
  const [mapPosition, setMapPosition] = useState([0, 3]);
  const position = useRef([0, 3]),
    bookIds = useRef(profile.books),
    toastTimer = useRef();
  const dialog = useRef();
  const volumeRef = useRef(0);
  volumeRef.current = muted ? 0 : volume;
  const sound = (kind) => playSfx(kind, volumeRef.current);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('office-theme', JSON.stringify(theme));
  }, [theme]);
  useEffect(() => {
    localStorage.setItem('office-profile', JSON.stringify(profile));
    bookIds.current = profile.books;
  }, [profile]);
  useEffect(() => {
    localStorage.setItem('office-volume', JSON.stringify(volume));
    localStorage.setItem('office-muted', JSON.stringify(muted));
  }, [volume, muted]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement;
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
      previous?.focus();
    };
  }, [modal]);
  useEffect(() => {
    const handle = (event) => {
      if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
      if (event.key === 'Escape' && !modal && screen === 'world') {
        event.preventDefault();
        setModal('pause');
      }
      if (event.key.toLowerCase() === 'e' && !modal && screen === 'world') {
        if (nearby) setModal(nearby);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [screen, modal, nearby]);
  useEffect(() => {
    if (!showMap) return;
    const timer = setInterval(() => setMapPosition([...position.current]), 150);
    return () => clearInterval(timer);
  }, [showMap]);
  function notify(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3500);
  }
  const currentWorld = WORLDS.find((w) => w.id === world);
  const currentBooks = profile.books
    .filter((id) => typeof id === 'string' && id.startsWith(world + ':'))
    .map((id) => Number(id.split(':')[1]));
  function updatePosition(x, z) {
    position.current = [x, z];
    if (screen !== 'world' || modal) return;
    const building =
      world === 'city'
        ? CITY_BUILDINGS.find(
            (item) => Math.hypot(x - item.position[0], z - (item.position[2] + 4.5)) < 3,
          )
        : null;
    const next =
      Math.hypot(x + 3, z - 2.5) < 2
        ? 'npc'
        : world === 'city'
          ? building
            ? 'lesson'
            : null
          : z < -2.8 && (Math.abs(x + 6.2) < 2.5 || Math.abs(x) < 2 || Math.abs(x - 6.2) < 2.5)
            ? 'lesson'
            : null;
    if (next === 'lesson')
      setTopic(building?.topic || (x < -3 ? 'word' : x > 3 ? 'powerpoint' : 'excel'));
    setNearby((current) => (current === next ? current : next));
    BOOKS.forEach(([bx, bz], index) => {
      const id = `${world}:${index}`;
      if (gameReady && !bookIds.current.includes(id) && Math.hypot(x - bx, z - bz) < 0.8) {
        bookIds.current = [...bookIds.current, id];
        adventureApi('/books', { world, index })
          .then((player) => {
            setProfile(player);
            sound('book');
            notify('Buku Ilmu ditemukan! +5 koin');
          })
          .catch((e) => {
            bookIds.current = bookIds.current.filter((v) => v !== id);
            setError(e.message);
            notify('Koleksi gagal. Coba sentuh buku lagi.');
          });
      }
    });
  }

  async function startQuiz() {
    setBusy(true);
    setError('');
    try {
      const data = await adventureApi('/runs', { topic, mode: activitySource, world });
      setSession(data);
      setFeedback(null);
      setModal('quiz');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function answer(index) {
    if (busy || feedback) return;
    setBusy(true);
    setError('');
    try {
      const data = await adventureApi(`/runs/${session.id}/answers`, {
        questionId: session.question.id,
        answer: index,
      });
      setFeedback(data);
      setProfile(data.player);
      sound(data.result.isCorrect ? 'correct' : 'wrong');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  function nextQuestion() {
    const next = feedback.session;
    setSession(next);
    setFeedback(null);
    if (!next.question) {
      sound('reward');
      setModal('result');
    }
  }
  async function openResults() {
    setModal('history');
    setError('');
    setBusy(true);
    try {
      setResults((await adventureApi('/profile')).history);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  const coins = profile.coins || 0;
  function speak(text) {
    if (!('speechSynthesis' in window)) {
      setError('Pembacaan soal tidak didukung browser ini.');
      return;
    }
    const localVoice = speechSynthesis
      .getVoices()
      .find((voice) => voice.localService && voice.lang.startsWith('id'));
    if (!localVoice) {
      setError('Suara pembaca Bahasa Indonesia offline belum tersedia di perangkat ini.');
      return;
    }
    speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(text);
    voice.voice = localVoice;
    voice.lang = 'id-ID';
    speechSynthesis.speak(voice);
  }
  useEffect(() => {
    if (autoRead && session?.question && modal === 'quiz') speak(session.question.prompt);
    return () => window.speechSynthesis?.cancel();
  }, [session?.question, modal, autoRead]);
  const projectorId = new URLSearchParams(location.search).get('projector');
  if (projectorId) return <Projector id={projectorId} />;
  return (
    <div
      className={`office-app ${gameMode ? 'office-app--mode' : ''}`}
      onClick={(event) => {
        if (event.target.closest('button')) sound('click');
      }}
    >
      {gameMode && (
        <GameMode
          key={`${gameMode}-${roomId || 'solo'}`}
          mode={gameMode}
          topic={topic}
          theme={runnerTheme}
          name={profile.name}
          resumeId={resumeId}
          roomId={roomId}
          onPlayer={setProfile}
          sound={sound}
          autoRead={autoRead}
          onExit={() => {
            setResumeId(null);
            setGameMode(null);
            setRoomId(null);
            setScreen('home');
            setModal(null);
          }}
        />
      )}
      <div className={`office-world ${screen === 'home' ? 'office-world--home' : ''}`}>
        <World
          world={world}
          cameraView={cameraView}
          quality={quality}
          trafficPaused={Boolean(modal) || Boolean(gameMode)}
          appearance={profile}
          exploration
          active={false}
          topic="word"
          name={profile.name}
          color={profile.color}
          paused={screen !== 'world' || Boolean(modal) || Boolean(gameMode)}
          movement={movement}
          onPosition={updatePosition}
          collected={currentBooks}
        />
      </div>
      {screen === 'home' ? (
        <>
          <header className="landing-header">
            <a href="#" className="office-brand">
              <span>
                <GraduationCap />
              </span>
              multi<b>edu</b>
            </a>
            <div className="header-actions">
              <button
                className="soft-button"
                disabled={OFFLINE_MODE}
                title="Akun guru memerlukan server lokal"
                onClick={() => setModal('teacher')}
              >
                Ruang Guru
              </button>
              <button
                className="icon-button"
                aria-label="Ganti tema"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun /> : <Moon />}
              </button>
              <button className="soft-button" onClick={() => setModal('settings')}>
                <Settings size={18} /> Pengaturan
              </button>
            </div>
          </header>
          <main className="landing-copy">
            <span className="edition">
              <span /> MICROSOFT OFFICE · SIAP DIMAINKAN OFFLINE
            </span>
            <h1>
              Dunia baru.
              <br />
              <em>Ilmu baru.</em>
              <br />
              Versi hebatmu.
            </h1>
            <p>
              Jelajahi sebelas dunia, temui warga, dan kuasai Word, Excel, serta PowerPoint. Belajar
              terasa lebih seru saat jadi petualangan.
            </p>
            <div className="hero-actions">
              <button
                className="primary-button"
                disabled={!gameReady}
                onClick={() => setModal('modes')}
              >
                <Play fill="currentColor" size={19} /> Mainkan Sekarang <ArrowRight size={19} />
              </button>
              <button className="soft-button" onClick={() => setModal('guide')}>
                <BookOpen size={18} /> Cara bermain
              </button>
            </div>
            <button
              className="soft-button"
              style={{ pointerEvents: 'auto', marginTop: 18 }}
              disabled={OFFLINE_MODE}
              title="Kelas lintas perangkat memerlukan server lokal"
              onClick={() => setModal('class')}
            >
              Punya kode guru? Gabung kelas
            </button>
            <div className="hero-facts">
              <span>
                <Compass /> Kota Ilmu 3D
              </span>
              <span>
                <BookOpen /> 18 soal Office
              </span>
              <span>
                <Coins /> 55 buku tersembunyi
              </span>
            </div>
          </main>
          <footer className="landing-footer">
            <span>LEARN. PLAY. LEVEL UP.</span>
            <span>Offline · Materi dan soal tersedia di dalam game</span>
          </footer>
        </>
      ) : (
        <>
          <header className="game-profile">
            <span className="player-initial" style={{ background: profile.color }}>
              {profile.name[0]?.toUpperCase()}
            </span>
            <div>
              <b>{profile.name}</b>
              <small>
                Level {profile.level || 1} · {profile.xp} XP
              </small>
              <progress value={profile.xp % 500} max="500" aria-label="Buku terkumpul" />
            </div>
          </header>
          <aside className="active-mission">
            <span>MISI AKTIF</span>
            <b>Kolektor Ilmu Office</b>
            <p>Temukan buku dan tuntaskan gedung Office.</p>
            <small>
              {currentBooks.length}/5 buku di dunia ini · {coins} koin
            </small>
          </aside>
          <div className="world-badge">
            {currentWorld.name}{' '}
            <span>
              <Coins size={16} /> {coins}
            </span>
          </div>
          <nav className="game-toolbar" aria-label="Menu permainan">
            {[
              [Pause, 'Jeda', 'pause'],
              [Map, 'Peta dunia', 'worlds'],
              [Flag, 'Misi', 'missions'],
              [Shirt, 'Lemari kostum', 'costume'],
              [Compass, 'Peta mini', 'map'],
              [Settings, 'Pengaturan', 'settings'],
            ].map(([Icon, label, id]) => (
              <button
                key={id}
                className="icon-button"
                aria-label={label}
                title={label}
                onClick={() => (id === 'map' ? setShowMap(!showMap) : setModal(id))}
              >
                <Icon />
              </button>
            ))}
          </nav>
          {showMap && (
            <div
              className={`mini-map ${world === 'city' ? 'mini-map--city' : ''}`}
              aria-label="Peta mini"
              data-x={mapPosition[0]}
              data-z={mapPosition[1]}
            >
              <span>U · GEDUNG WORD ↖</span>
              <i
                style={{
                  left: `${world === 'city' ? cityToMap(...mapPosition).left : (mapPosition[0] + 10) * 5}%`,
                  top: `${world === 'city' ? cityToMap(...mapPosition).top : (mapPosition[1] + 8) * 6}%`,
                }}
              >
                ▲
              </i>
              {world === 'city' ? (
                CITY_BUILDINGS.map((item) => (
                  <b
                    key={item.topic}
                    style={{
                      left: `${cityToMap(item.position[0], item.position[2]).left}%`,
                      top: `${cityToMap(item.position[0], item.position[2]).top}%`,
                    }}
                  >
                    {item.topic === 'word' ? 'W' : item.topic === 'excel' ? 'X' : 'P'}
                  </b>
                ))
              ) : (
                <b>W</b>
              )}
            </div>
          )}
          <div className="world-actions">
            {world === 'city' && (
              <button
                className="soft-button"
                onClick={() => setCameraView(cameraView === 'overview' ? 'follow' : 'overview')}
              >
                {cameraView === 'overview' ? 'Kamera dekat' : 'Lihat seluruh kota'}
              </button>
            )}
            <button
              className="soft-button"
              onClick={() => {
                setActivitySource('npc');
                setModal('npc');
              }}
            >
              Bicara dengan {currentWorld.npc}
            </button>
            <select
              aria-label="Materi gedung"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setLessonRead(false);
              }}
            >
              <option value="word">Word</option>
              <option value="excel">Excel</option>
              <option value="powerpoint">PowerPoint</option>
            </select>
            <button
              className="primary-button"
              onClick={() => {
                setActivitySource('quiz');
                setModal('lesson');
              }}
            >
              <BookOpen size={18} /> Kunjungi gedung {topic}
            </button>
          </div>
          {nearby && (
            <button
              className="interaction-button"
              onClick={() => {
                setActivitySource(nearby === 'npc' ? 'npc' : 'quiz');
                setModal(nearby);
              }}
            >
              E · {nearby === 'npc' ? `Bicara dengan ${currentWorld.npc}` : `Masuk gedung ${topic}`}
            </button>
          )}
          <div className="movement-pad">
            {[
              ['up', '↑'],
              ['left', '←'],
              ['down', '↓'],
              ['right', '→'],
            ].map(([id, label]) => (
              <button
                key={id}
                aria-label={`Bergerak ${id}`}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setMovement(id);
                }}
                onPointerUp={() => setMovement(null)}
                onPointerCancel={() => setMovement(null)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="controls-hint">
            WASD / panah · E interaksi · Esc jeda · Seret untuk kamera
          </div>
        </>
      )}
      {error && !modal && (
        <div role="alert" className="toast">
          <span>{error}</span>
          <button className="soft-button" onClick={() => location.reload()}>
            Muat ulang
          </button>
          <button className="icon-button" aria-label="Tutup pesan" onClick={() => setError('')}>
            ×
          </button>
        </div>
      )}
      {toast && (
        <div role="status" className="toast">
          <BookOpen size={18} />
          {toast}
        </div>
      )}
      {modal && (
        <dialog
          ref={dialog}
          className={`office-dialog ${modal === 'character' || modal === 'costume' ? 'office-dialog--costume' : ''}`}
          onCancel={(event) => {
            event.preventDefault();
            setModal(null);
          }}
        >
          <button
            className="close-dialog icon-button"
            aria-label="Tutup"
            onClick={() => setModal(null)}
          >
            <X />
          </button>
          {error && (
            <p className="error-banner" role="alert">
              {error}
              <button onClick={() => setError('')}>Tutup pesan</button>
            </p>
          )}
          {modal === 'modes' && (
            <>
              <span className="dialog-kicker">PILIH PETUALANGANMU</span>
              <h2>Mau belajar bagaimana?</h2>
              <p>Pilih mode permainan dan materi Office.</p>
              {read('office-active-run', null) && (
                <button
                  className="soft-button"
                  onClick={() => {
                    const saved = read('office-active-run', null);
                    setTopic(saved.topic);
                    setRunnerTheme(saved.theme);
                    setRoomId(saved.roomId);
                    setResumeId(saved.id);
                    setGameMode(saved.mode);
                    setModal(null);
                  }}
                >
                  Lanjutkan aktivitas tersimpan
                </button>
              )}
              <button className="mode-option" onClick={() => setModal('worlds')}>
                <Compass />
                <span>
                  <b>Jelajah Dunia</b>
                  <small>Temui NPC, koleksi buku, dan kerjakan kuis Word.</small>
                </span>
                <ArrowRight />
              </button>
              <div className="mode-grid">
                {MODES.map(([id, label, description]) => (
                  <button
                    className="mode-option"
                    key={id}
                    onClick={() => {
                      setSetupMode(id);
                      setTopic(id === 'market' ? 'excel' : id === 'detective' ? 'word' : 'mixed');
                      setModal('setup');
                    }}
                  >
                    <span>
                      <b>{label}</b>
                      <small>{description}</small>
                    </span>
                    <ArrowRight />
                  </button>
                ))}
              </div>
              <button
                className="soft-button"
                disabled={OFFLINE_MODE}
                title="Kelas lintas perangkat memerlukan server lokal"
                onClick={() => setModal('class')}
              >
                Ajak teman / Gabung kelas
              </button>
            </>
          )}
          {modal === 'worlds' && (
            <>
              <span className="dialog-kicker">PETA DUNIA</span>
              <h2>Tujuan pertamamu.</h2>
              <div className="world-grid">
                {WORLDS.map((item) => (
                  <button
                    key={item.id}
                    className="city-option"
                    style={{ background: `linear-gradient(130deg,${item.sky},#253a65)` }}
                    onClick={() => {
                      if (
                        screen === 'world' &&
                        !confirm('Pindah dunia? Aktivitas berjalan akan ditutup.')
                      )
                        return;
                      setWorld(item.id);
                      setTopic('word');
                      setModal('character');
                    }}
                  >
                    <b>{item.name}</b>
                    <p>{item.description}</p>
                    <small>
                      {
                        Object.keys(profile.buildings || {}).filter((k) =>
                          k.startsWith(item.id + ':'),
                        ).length
                      }
                      /3 gedung selesai
                    </small>
                    <span className="primary-button">
                      Masuk <ArrowRight size={18} />
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          {(modal === 'character' || modal === 'costume') && (
            <>
              <span className="dialog-kicker">IDENTITAS PENJELAJAH</span>
              <h2>Buat karaktermu.</h2>
              <div
                className="character-preview"
                style={{
                  '--shirt': profile.color,
                  '--pants': profile.pants,
                  '--hair': profile.hairColor,
                }}
              >
                <div className="pixel-head">{profile.face === 'glasses' ? '⌐■_■' : '•‿•'}</div>
                <div className="pixel-body" />
                <div className="pixel-legs" />
              </div>
              <label htmlFor="name">Nama penjelajah</label>
              <input
                id="name"
                maxLength="24"
                value={profile.name}
                onChange={(event) => setProfile({ ...profile, name: event.target.value })}
              />
              <p>
                Saldo: {coins} koin · Level {profile.level || 1}. Warna dasar kaos gratis.
              </p>
              <label htmlFor="costume-category">Kategori kostum</label>
              <select
                id="costume-category"
                value={costumeCategory}
                onChange={(e) => setCostumeCategory(e.target.value)}
              >
                {[
                  ['color', 'Atasan'],
                  ['pants', 'Bawahan'],
                  ['hair', 'Rambut'],
                  ['hairColor', 'Warna Rambut'],
                  ['hat', 'Topi'],
                  ['face', 'Wajah'],
                ].map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="costume-shop">
                {catalog
                  .filter((i) => i.category === costumeCategory)
                  .map((item) => (
                    <button
                      key={item.id}
                      className="soft-button"
                      onClick={async () => {
                        try {
                          if (
                            !(profile.owned || []).includes(item.id) &&
                            item.price > 0 &&
                            !confirm(
                              `Beli ${item.label} seharga ${item.price} koin? Saldo setelah beli: ${coins - item.price}.`,
                            )
                          )
                            return;
                          setProfile(
                            await adventureApi('/wardrobe', { id: item.id, confirm: true }),
                          );
                          sound('reward');
                        } catch (e) {
                          setError(e.message);
                        }
                      }}
                    >
                      {item.label} ·{' '}
                      {profile.owned?.includes(item.id) ? 'Dimiliki' : `${item.price} koin`} · Lv{' '}
                      {item.level} {profile[item.category] === item.value ? '✓' : ''}
                    </button>
                  ))}
              </div>
              <div className="costume-colors">
                {COLORS.map((color, index) => (
                  <button
                    key={color}
                    style={{ background: color }}
                    aria-label={`Kaos ${['ungu', 'biru', 'hijau', 'merah', 'kuning'][index]}`}
                    aria-pressed={profile.color === color}
                    onClick={() => setProfile({ ...profile, color })}
                  >
                    {profile.color === color && <Check />}
                  </button>
                ))}
              </div>
              <button
                className="primary-button"
                disabled={!profile.name.trim()}
                onClick={async () => {
                  try {
                    setProfile(
                      await adventureApi('/profile', {
                        name: profile.name.trim(),
                        color: profile.color,
                      }),
                    );
                  } catch (e) {
                    setError(e.message);
                    return;
                  }
                  setScreen('world');
                  setModal(null);
                  sound('reward');
                }}
              >
                {' '}
                {modal === 'costume' ? 'Simpan penampilan' : 'Masuk Kota'} <ArrowRight size={18} />
              </button>
            </>
          )}
          {modal === 'npc' && (
            <>
              <span className="dialog-kicker">{currentWorld.npc} · PENDAMPING OFFICE</span>
              <h2>Bantu menyiapkan dokumen?</h2>
              <p>
                Halo, {profile.name}! Bantu aku menyelesaikan tantangan {topic}. Ini aktivitas
                warga, terpisah dari kelulusan gedung.
              </p>
              <div className="dialog-actions">
                <button className="soft-button" onClick={() => setModal(null)}>
                  Nanti saja
                </button>
                <select
                  aria-label="Materi gedung"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    setLessonRead(false);
                  }}
                >
                  <option value="word">Word</option>
                  <option value="excel">Excel</option>
                  <option value="powerpoint">PowerPoint</option>
                </select>
                <button
                  className="primary-button"
                  onClick={() => {
                    setActivitySource('quiz');
                    setModal('lesson');
                  }}
                >
                  Bantu! <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}
          {modal === 'lesson' && (
            <>
              <span className="dialog-kicker">GEDUNG MICROSOFT {topic.toUpperCase()}</span>
              <h2>
                {topic === 'word'
                  ? 'Dokumen rapi, pesan jelas.'
                  : topic === 'excel'
                    ? 'Hitung tepat, data bermanfaat.'
                    : 'Presentasi jelas, ide tersampaikan.'}
              </h2>
              <div className="lesson-content">
                <p>{LESSONS[topic]}</p>
              </div>
              <label>
                <input
                  type="checkbox"
                  checked={lessonRead}
                  onChange={async (e) => {
                    setLessonRead(e.target.checked);
                    if (e.target.checked) {
                      try {
                        setProfile(await adventureApi('/lessons', { topic }));
                      } catch (err) {
                        setError(err.message);
                      }
                    }
                  }}
                />{' '}
                Saya telah membaca materi dan siap berlatih
              </label>
              <button className="primary-button" disabled={busy || !lessonRead} onClick={startQuiz}>
                {busy ? 'Menyiapkan…' : 'Mulai kuis · 6 soal'}
                <Play size={18} />
              </button>
            </>
          )}
          {modal === 'quiz' && session?.question && (
            <>
              <span className="dialog-kicker">
                MICROSOFT {topic.toUpperCase()} · SOAL {session.index + 1}/{session.total}
              </span>
              <h2>{session.question.prompt}</h2>
              <button className="soft-button" onClick={() => speak(session.question.prompt)}>
                Bacakan soal
              </button>
              <div className="quiz-answers">
                {session.question.options.map((option, index) => (
                  <button
                    key={option}
                    disabled={busy || Boolean(feedback)}
                    className={feedback?.result.correctAnswer === index ? 'is-correct' : ''}
                    onClick={() => answer(index)}
                  >
                    <b>{'ABCD'[index]}</b>
                    {option}
                  </button>
                ))}
              </div>
              {feedback && (
                <div role="status" className="quiz-feedback">
                  <b>
                    {feedback.result.isCorrect
                      ? 'Benar! +100 XP'
                      : 'Belum tepat. Yuk, pelajari lagi.'}
                  </b>
                  <p>{feedback.result.explanation}</p>
                  <button className="primary-button" onClick={nextQuestion}>
                    {feedback.session.question ? 'Soal berikutnya' : 'Lihat hasil'}
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}
              <p className="fine-print">
                Tanpa batas waktu. Keluar menutup kuis; latihan yang belum selesai tidak masuk
                rekap.
              </p>
            </>
          )}
          {modal === 'result' && (
            <>
              <Trophy className="result-trophy" size={52} />
              <h2>Petualangan selesai!</h2>
              <p>
                {session.correctCount}/{session.total} benar · {session.score} XP. Hasil kuis, XP,
                dan progres tersimpan di perangkat ini.
              </p>
              <button className="primary-button" onClick={() => setModal(null)}>
                Kembali menjelajah
                <Compass size={18} />
              </button>
            </>
          )}
          {modal === 'missions' && (
            <>
              <span className="dialog-kicker">PAPAN MISI</span>
              <h2>Langkah kecil, ilmu besar.</h2>
              <div className="dialog-actions">
                {['Misi', 'Profil', 'Penguasaan', 'Riwayat', 'Lencana'].map((tab) => (
                  <button
                    key={tab}
                    className="soft-button"
                    aria-pressed={missionTab === tab}
                    onClick={() => setMissionTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {missionTab === 'Misi' &&
                profile.missions?.map((m) => (
                  <div className="mission-row" key={m.id}>
                    <Flag />
                    <div>
                      <b>{m.label}</b>
                      <progress value={Math.min(m.progress, m.target)} max={m.target} />
                      <small>
                        {m.progress}/{m.target} · Hadiah {m.reward} koin
                      </small>
                      <button
                        className="soft-button"
                        disabled={m.claimed || m.progress < m.target}
                        onClick={() =>
                          adventureApi('/claims', { id: m.id })
                            .then((player) => {
                              setProfile(player);
                              sound('reward');
                            })
                            .catch((e) => setError(e.message))
                        }
                      >
                        {m.claimed
                          ? 'Sudah diklaim'
                          : m.progress >= m.target
                            ? 'Klaim hadiah'
                            : 'Belum selesai'}
                      </button>
                    </div>
                  </div>
                ))}
              {missionTab === 'Profil' && (
                <p>
                  {profile.name} · Level {profile.level} · {profile.xp} XP · {coins} koin ·{' '}
                  {profile.books.length} buku
                </p>
              )}
              {missionTab === 'Penguasaan' &&
                ['word', 'excel', 'powerpoint'].map((t) => {
                  const list = (profile.history || []).filter((h) => h.topic === t);
                  return (
                    <p key={t}>
                      {t}:{' '}
                      {list.length
                        ? Math.round(
                            list.reduce((n, h) => n + (h.correctCount / h.total) * 100, 0) /
                              list.length,
                          ) + '% rata-rata ketepatan'
                        : 'Belum ada data'}
                      . Ini rekap materi, bukan sertifikasi TP.
                    </p>
                  );
                })}
              {missionTab === 'Riwayat' &&
                (profile.history || []).map((h) => (
                  <p key={h.id}>
                    {h.mode} · {h.topic} · {h.score} XP · {h.correctCount}/{h.total}
                  </p>
                ))}
              {missionTab === 'Lencana' && (
                <p>{profile.badges?.join(' · ') || 'Selesaikan misi untuk membuka lencana.'}</p>
              )}
              <button className="soft-button" onClick={openResults}>
                Lihat riwayat latihan
                <ArrowRight size={17} />
              </button>
            </>
          )}
          {modal === 'history' && (
            <>
              <h2>Riwayat latihan Office</h2>
              <p>Riwayat ini milik profil pemain aktif. Gunakan nama samaran.</p>
              {busy ? (
                <p>Memuat…</p>
              ) : results.length ? (
                results.map((item) => (
                  <div className="history-row" key={item.id}>
                    <span>{item.name}</span>
                    <b>{item.score} XP</b>
                    <small>
                      {item.correctCount}/{item.total} benar
                    </small>
                  </div>
                ))
              ) : (
                <p>Belum ada hasil latihan Word.</p>
              )}
            </>
          )}
          {modal === 'settings' && (
            <>
              <span className="dialog-kicker">SESUAIKAN PENGALAMANMU</span>
              <h2>Pengaturan</h2>
              <label>Grafik</label>
              <div className="dialog-actions">
                <button
                  className="soft-button"
                  aria-pressed={quality === 'high'}
                  onClick={() => setQuality('high')}
                >
                  Tinggi (bayangan)
                </button>
                <button
                  className="soft-button"
                  aria-pressed={quality === 'low'}
                  onClick={() => setQuality('low')}
                >
                  Ringan
                </button>
              </div>
              <button
                className="soft-button"
                onClick={() => setAutoRead(!autoRead)}
                disabled={!('speechSynthesis' in window)}
              >
                Bacakan soal otomatis: {autoRead ? 'Nyala' : 'Mati'}
              </button>
              <div className="dialog-actions">
                <button
                  className="soft-button"
                  disabled={OFFLINE_MODE}
                  title="Akun guru memerlukan server lokal"
                  onClick={() => setModal('teacher')}
                >
                  Mode Guru
                </button>
                <button
                  className="soft-button"
                  disabled={OFFLINE_MODE}
                  title="Kelas lintas perangkat memerlukan server lokal"
                  onClick={() => setModal('class')}
                >
                  Main bersama / kode kelas
                </button>
                <button
                  className="soft-button"
                  onClick={() => {
                    if (confirm('Kembali ke beranda? Kuis belum selesai akan ditutup.')) {
                      setScreen('home');
                      setModal(null);
                    }
                  }}
                >
                  Beranda
                </button>
                <button
                  className="soft-button"
                  onClick={() => {
                    if (
                      confirm(
                        'Hapus XP, koin, buku, kepemilikan item dan progres profil offline ini di perangkat? Data kelas serta pengguna lain tidak dihapus.',
                      )
                    )
                      adventureApi('/reset', { confirm: true })
                        .then(setProfile)
                        .catch((e) => setError(e.message));
                  }}
                >
                  Hapus progres
                </button>
              </div>
              <label>Tema antarmuka</label>
              <div className="dialog-actions">
                <button
                  aria-pressed={theme === 'light'}
                  className="soft-button"
                  onClick={() => setTheme('light')}
                >
                  <Sun size={18} /> Light
                </button>
                <button
                  aria-pressed={theme === 'dark'}
                  className="soft-button"
                  onClick={() => setTheme('dark')}
                >
                  <Moon size={18} /> Dark
                </button>
              </div>
              <label htmlFor="volume">Volume SFX · {Math.round(volume * 100)}%</label>
              <input
                id="volume"
                type="range"
                min="0"
                max="1"
                step=".05"
                value={volume}
                onChange={(event) => {
                  setVolume(Number(event.target.value));
                }}
                onPointerUp={() => sound('book')}
              />
              <button className="soft-button" aria-pressed={muted} onClick={() => setMuted(!muted)}>
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}{' '}
                {muted ? 'Aktifkan suara' : 'Matikan suara'}
              </button>
              <p className="fine-print">
                Tema, suara, kostum, dan koleksi tersimpan pada browser ini. SFX aktif setelah
                interaksi pengguna.
              </p>
            </>
          )}
          {modal === 'pause' && (
            <>
              <Pause size={34} />
              <h2>Istirahat sebentar?</h2>
              <p>Pergerakan dijeda selama menu terbuka.</p>
              <div className="dialog-actions">
                <button className="primary-button" onClick={() => setModal(null)}>
                  Lanjut bermain
                </button>
                <button
                  className="soft-button"
                  onClick={() => {
                    setScreen('home');
                    setModal(null);
                  }}
                >
                  Beranda
                </button>
              </div>
            </>
          )}
          {modal === 'teacher' && <TeacherRoom />}
          {modal === 'class' && (
            <ClassLobby
              onPlay={(room) => {
                setRoomId(room.id);
                setTopic(room.topic);
                setGameMode(room.mode);
                setModal(null);
              }}
            />
          )}
          {modal === 'setup' && (
            <>
              <span className="dialog-kicker">PERSIAPAN PERMAINAN</span>
              <h2>{MODES.find((m) => m[0] === setupMode)?.[1]}</h2>
              <label htmlFor="setup-topic">Materi</label>
              <select
                id="setup-topic"
                disabled={['market', 'detective'].includes(setupMode)}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                {[
                  ['mixed', 'Campur semua Office'],
                  ['word', 'Microsoft Word'],
                  ['excel', 'Microsoft Excel'],
                  ['powerpoint', 'Microsoft PowerPoint'],
                ].map(([id, label]) => (
                  <option value={id} key={id}>
                    {label}
                  </option>
                ))}
              </select>
              {setupMode === 'runner' && (
                <>
                  <label htmlFor="runner-theme">Tema lintasan</label>
                  <select
                    id="runner-theme"
                    value={runnerTheme}
                    onChange={(e) => setRunnerTheme(e.target.value)}
                  >
                    <option value="city">Kota</option>
                    <option value="beach">Pantai</option>
                    <option value="space">Luar Angkasa</option>
                  </select>
                </>
              )}
              <p>
                {setupMode === 'tower'
                  ? 'Timer 15 detik. Benar naik satu lantai, salah turun satu lantai, minimum lantai 1. Di lantai 4, jawaban benar tetap di puncak. Tidak ada eliminasi.'
                  : setupMode === 'runner'
                    ? 'Timer 12 detik menuju gerbang. Pilih lajur dengan tombol atau panah. Benar +100 XP, salah 0.'
                    : 'Baca petunjuk dan jawab tantangan. Benar +100 XP, salah 0. Pasar menggunakan soal transaksi Excel.'}{' '}
                Sesi selesai setelah soal paket habis.
              </p>
              <button
                className="primary-button"
                onClick={() => {
                  setRoomId(null);
                  setGameMode(setupMode);
                  setModal(null);
                }}
              >
                Mulai permainan
              </button>
            </>
          )}
          {modal === 'guide' && (
            <>
              <span className="dialog-kicker">PANDUAN PENJELAJAH</span>
              <h2>Belajar lewat petualangan.</h2>
              <ol className="guide-list">
                <li>Pilih Jelajah Dunia, lalu Kota Ilmu.</li>
                <li>Buat nama samaran dan pilih warna kaos.</li>
                <li>Bergerak dengan WASD/panah atau tombol sentuh. Seret arena untuk kamera.</li>
                <li>
                  Sentuh buku kuning untuk mendapat 5 koin. Setiap buku hanya dihitung sekali.
                </li>
                <li>
                  Dekati Bu Sari atau gedung Word dan tekan E. Tombol kunjungan juga tersedia
                  sebagai alternatif.
                </li>
                <li>Baca materi, jawab enam soal, lalu lihat hasilmu.</li>
              </ol>
              <button
                className="primary-button"
                disabled={!gameReady}
                onClick={() => setModal('modes')}
              >
                Mulai petualangan
                <ArrowRight size={18} />
              </button>
            </>
          )}
        </dialog>
      )}
    </div>
  );
}
