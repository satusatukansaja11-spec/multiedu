# Aturan Pengembangan Multiedu

Dokumen ini menetapkan aturan untuk implementasi Multiedu. Acuan visual berada di [desain.md](./desain.md). Stack berikut merupakan keputusan untuk pengembangan berikutnya; paket dan aplikasi belum dipasang.

## 1. Bahasa dan framework

**Gunakan JavaScript dengan React untuk antarmuka, Vite sebagai build tool, dan Node.js dengan Express untuk backend.** Gunakan Three.js melalui React Three Fiber untuk dunia permainan 3D.

| Bagian | Pilihan | Tujuan |
| --- | --- | --- |
| Bahasa | JavaScript modern, ES modules | Satu bahasa pada frontend dan backend |
| UI | React, berkas `.jsx` | Komponen, formulir, HUD, dan dashboard |
| Build frontend | Vite | Server pengembangan dan build produksi |
| Dunia 3D | Three.js + `@react-three/fiber` | Render arena dan avatar low-poly |
| Routing | React Router | Halaman murid, guru, dan proyektor |
| Styling | CSS dengan custom properties | Token visual dari `desain.md` |
| Backend | Node.js LTS + Express | API, validasi, dan aturan sesi |
| Komunikasi langsung | Socket.IO | Status lobi, fase permainan, dan peringkat |
| Database | PostgreSQL | Data akun, kelas, soal, sesi, dan hasil |
| Akses database | `pg`, kueri berparameter | Akses SQL dan transaksi eksplisit |

React menangani antarmuka yang memiliki banyak keadaan, sedangkan React Three Fiber menghubungkan dunia Three.js dengan komponen React. Vite adalah alat pengembangan/build, bukan backend. Socket.IO menangani komunikasi; aturan permainan tetap ditulis di server.

- Gunakan JavaScript, bukan TypeScript, kecuali ada keputusan perubahan dari pengguna.
- Gunakan `import`/`export` secara konsisten; konfigurasi Node memakai `"type": "module"`.
- Gunakan JSDoc untuk kontrak data atau fungsi yang kompleks.
- Jangan menambahkan framework UI besar, engine fisika, state library, atau layanan berbayar sebelum kebutuhannya jelas.
- Pasang dependensi ketika fitur terkait mulai dikerjakan. Jangan memasang seluruh stack hanya untuk halaman statis.
- Pilih versi stabil yang kompatibel pada saat inisialisasi, pin versi Node LTS, dan simpan lockfile. Gunakan satu package manager: npm.

## 2. Struktur proyek

Gunakan npm workspaces ketika frontend dan backend mulai dibuat:

```text
multiedu/
  apps/
    web/
      public/assets/
      src/
        app/
        components/
        features/
          lobby/
          gameplay/
          teacher-dashboard/
          question-builder/
        game/
          scenes/
          entities/
          controls/
        hooks/
        services/
        styles/
    server/
      src/
        config/
        features/
        middleware/
        realtime/
        db/
      migrations/
  packages/
    shared/
  desain.md
  rules.md
  package.json
  package-lock.json
```

Struktur ini adalah target, bukan daftar folder yang sudah ada. Buat folder saat dibutuhkan. `shared` hanya memuat kontrak, konstanta, dan utilitas yang aman digunakan klien; jangan memasukkan kredensial atau kunci jawaban aktif ke bundle frontend.

## 3. Gaya penamaan

Gunakan **bahasa Inggris untuk identifier kode** dan **bahasa Indonesia untuk teks antarmuka**. Hindari campuran seperti `getDataMurid`, singkatan tidak jelas, atau nama umum seperti `data2`.

| Objek | Aturan | Contoh |
| --- | --- | --- |
| Variabel dan fungsi | `camelCase` | `studentScore`, `calculateScore()` |
| Boolean | Awalan `is`, `has`, `can`, atau `should` | `isReady`, `canStartSession` |
| Komponen React | `PascalCase` | `QuestionPanel`, `TeacherDashboard` |
| Berkas komponen | `PascalCase.jsx` | `QuestionPanel.jsx` |
| Hook React | `use` + `PascalCase` | `useGameSession.js` |
| Kelas JavaScript | `PascalCase` | `SessionManager` |
| Konstanta tetap | `UPPER_SNAKE_CASE` | `MAX_PLAYERS`, `ANSWER_COLORS` |
| Folder dan berkas nonkomponen | `kebab-case` | `teacher-dashboard/`, `score-service.js` |
| CSS class | `kebab-case` dengan pola BEM | `.question-panel__option--selected` |
| CSS token | `--kebab-case` | `--accent-gold`, `--text-primary` |
| Environment variable | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `PORT` |
| Tabel dan kolom SQL | `snake_case`; tabel jamak | `game_sessions`, `student_id` |
| Properti JSON/API | `camelCase` | `sessionId`, `createdAt` |
| Path API | Kata benda jamak, `kebab-case` | `/api/v1/game-sessions` |
| Event Socket.IO | `domain:action`, bagian majemuk `kebab-case` | `session:start`, `player:ready`, `leaderboard:updated` |
| Aset | `kebab-case`, nama deskriptif | `sky-island.glb`, `coin-pickup.ogg` |
| Tes | Nama target + `.test.js`/`.test.jsx` | `score-service.test.js` |

Gunakan akhiran satuan untuk angka yang ambigu: `durationMs`, `remainingSeconds`, `distanceMeters`. Gunakan `Id` dalam identifier, misalnya `studentId`, bukan `studentID`. Gunakan nama fungsi berbentuk aksi seperti `createSession`, bukan `sessionProcess`.

Handler lokal diberi nama `handleStartSession`; callback prop diberi nama `onStartSession`. Gunakan named export sebagai default konvensi, dengan pengecualian bila alat yang dipakai memerlukan default export.

## 4. Gaya penulisan kode

- Indentasi dua spasi, titik koma, single quotes, dan trailing comma; gunakan Prettier untuk format otomatis.
- Gunakan `const` secara default dan `let` jika nilainya berubah. Jangan gunakan `var`.
- Gunakan `async`/`await`, `===`, serta early return untuk mengurangi percabangan bertingkat.
- Pisahkan logika domain, akses jaringan, akses database, dan tampilan.
- Jangan menaruh kueri database dalam route handler yang panjang atau logika skor di komponen UI.
- Hindari duplikasi aturan; ekstrak fungsi atau komponen ketika ada kebutuhan nyata untuk digunakan bersama.
- Komentar menjelaskan alasan, batasan, atau keputusan; jangan mengulang kode.
- Tangani kegagalan secara eksplisit. Jangan menelan error dengan `catch` kosong.
- Jalankan ESLint dengan aturan React Hooks dan Prettier setelah alat tersebut diinisialisasi.

## 5. React dan dunia 3D

- Gunakan function component dan Hooks. Jangan memanggil Hooks secara kondisional.
- Mulai dengan state lokal; gunakan Context untuk sesi atau konfigurasi bersama yang benar-benar diperlukan.
- Pisahkan state UI dari state simulasi berfrekuensi tinggi. Jangan menjalankan pembaruan state React setiap frame untuk posisi avatar.
- Gunakan delta time untuk gerak, batasi pembaruan jaringan, dan interpolasikan posisi pemain lain.
- Bersihkan listener, timer, koneksi, serta resource Three.js ketika tidak dipakai.
- Muat aset dengan indikator progres dan fallback kegagalan; gunakan kembali geometry/material jika sesuai.
- Sediakan kualitas grafis yang dapat disesuaikan dan uji pada perangkat kelas yang menjadi target.
- Soal dan kontrol penting memakai elemen HTML aksesibel di atas canvas, mengikuti `desain.md`.

## 6. API, sesi, dan data

- Server menjadi sumber kebenaran untuk waktu sesi, jawaban benar, skor, hak guru, dan perpindahan fase.
- Validasi seluruh input HTTP dan Socket.IO di server dengan satu pustaka skema yang konsisten, misalnya Zod.
- Periksa autentikasi, peran, dan keanggotaan kelas pada setiap operasi yang memerlukannya.
- Gunakan parameter SQL; jangan menyusun kueri dengan interpolasi input pengguna.
- Gunakan migrasi SQL berurutan, misalnya `0001_create_classes.sql`. Jangan mengubah migrasi yang sudah diterapkan pada lingkungan bersama.
- Gunakan transaksi untuk perubahan data yang harus berhasil atau gagal bersama.
- Simpan waktu sebagai timestamp UTC; tampilkan sesuai zona waktu pengguna.
- Petakan kolom SQL `snake_case` menjadi properti API `camelCase` di lapisan akses data.
- Gunakan status HTTP yang sesuai dan format error stabil, misalnya `{ "error": { "code": "SESSION_NOT_FOUND", "message": "Sesi tidak ditemukan." } }`.
- Event mutasi harus aman terhadap pengiriman ulang. Jangan menghitung skor dua kali saat klien tersambung kembali.
- Setelah reconnect, ambil snapshot sesi terbaru; jangan menganggap state lokal masih benar.
- Jangan mengirim kunci jawaban soal aktif ke murid sebelum fase pengungkapan jawaban.

## 7. UI dan konten

- Ikuti token dan komponen di `desain.md`; hindari nilai warna yang tersebar tanpa token.
- Pertahankan warna dan urutan A–D pada semua mode.
- Gunakan teks produk bahasa Indonesia yang konsisten: “murid”, “guru”, “kelas”, “paket soal”, dan “sesi”.
- Sediakan keadaan memuat, kosong, gagal, berhasil, nonaktif, dan kehilangan koneksi.
- Bedakan data demo dari data tersimpan. Jangan menampilkan tombol atau status seolah terhubung bila integrasinya belum dibuat.
- Pertahankan input pengguna saat validasi gagal dan tampilkan pesan dekat field terkait.
- Aset harus memiliki sumber dan lisensi yang jelas. Jangan menganggap screenshot referensi sebagai aset siap pakai.

## 8. Keamanan dan konfigurasi

- Simpan konfigurasi lokal dalam `.env` yang diabaikan Git; sediakan `.env.example` berisi nama variabel dan contoh nonrahasia.
- Jangan menyimpan token, password, atau data pribadi murid dalam kode, log, dan dokumentasi.
- Variabel berawalan `VITE_` dapat terbaca oleh pengguna browser; jangan gunakan untuk rahasia.
- Jika autentikasi password dibuat, gunakan hashing password yang sesuai, cookie sesi aman, pembatasan percobaan, dan otorisasi server.
- Konfigurasi origin/CORS secara eksplisit. Terapkan perlindungan CSRF pada mutasi berbasis cookie sesuai arsitektur.
- Batasi ukuran payload, input soal AI, dan laju event agar klien tidak membebani sesi.
- Data soal AI harus divalidasi dan ditinjau guru; jangan menjalankan teks hasil AI sebagai kode atau HTML mentah.

## 9. Pengujian dan verifikasi

- Gunakan Vitest untuk unit test, React Testing Library untuk perilaku UI, dan Playwright untuk alur end-to-end ketika aplikasinya tersedia.
- Prioritaskan tes aturan skor, penguncian jawaban, otorisasi guru, validasi soal AI, dan reconnect tanpa skor ganda.
- Uji kueri/transaksi dengan database pengujian terpisah; jangan memakai data produksi.
- Uji alur guru membuka lobi, murid bergabung, sesi dimulai, jawaban diproses, dan hasil muncul di proyektor.
- Uji UI desktop/ponsel, keyboard/sentuhan, soal panjang, serta koneksi terputus.
- Jalankan lint, tes relevan, dan build sebelum menyatakan perubahan siap. Laporkan pemeriksaan yang gagal atau belum dijalankan.
- Jangan membuat tes yang hanya mengulang implementasi atau menonaktifkan assertion agar lolos.

## 10. Skrip dan kolaborasi

Saat proyek diinisialisasi, sediakan kontrak skrip root berikut dan dokumentasikan kebutuhan database serta variabelnya:

| Perintah | Fungsi yang diharapkan |
| --- | --- |
| `npm ci` | Memasang dependensi dari lockfile |
| `npm run dev` | Menjalankan frontend dan backend untuk pengembangan |
| `npm run build` | Membuat build produksi frontend dan memvalidasi target terkait |
| `npm run lint` | Memeriksa aturan kode |
| `npm run format:check` | Memeriksa format |
| `npm test` | Menjalankan unit/integration test yang tersedia |
| `npm run test:e2e` | Menjalankan alur end-to-end |
| `npm run db:migrate` | Menerapkan migrasi pada database yang dikonfigurasi |

Perintah di atas adalah kontrak yang harus dibuat, belum merupakan perintah yang telah tersedia atau diuji di repositori ini.

- Gunakan checkout yang ada; jangan membuat worktree tanpa permintaan pengguna.
- Pertahankan perubahan pengguna dan jangan melakukan reset atau menghapus file tanpa dasar yang jelas.
- Kerjakan perubahan sesuai lingkup; perubahan stack harus dijelaskan dan disetujui pengguna sebelum migrasi.
- Commit memakai pola `type(scope): description`, misalnya `feat(lobby): add player readiness indicator` atau `fix(scoring): prevent duplicate answers`.
- Perbarui dokumentasi bila cara menjalankan, kontrak API, atau keputusan desain berubah.
- Jangan mengklaim fitur, sinkronisasi, deployment, atau pengujian berhasil tanpa bukti eksekusi.
