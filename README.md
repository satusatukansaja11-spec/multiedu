# Multiedu — Office Adventure

Game edukasi web 3D bergaya low-poly untuk mempelajari **Microsoft Word, Microsoft Excel, dan Microsoft PowerPoint**. Dibuat dengan JavaScript, React, React Three Fiber/Three.js, dan Express. Aset dunia dan avatar dibuat secara prosedural, tanpa mengambil aset Roblox atau Microsoft.

## Fitur yang dapat dimainkan

- Pulau 3D dengan gedung Word, Excel, dan PowerPoint, avatar balok, serta kamera yang bisa diputar.
- Gerakan WASD/tombol panah dan kontrol sentuh.
- Pilihan materi, nama samaran, dan ringkasan pelajaran sebelum bermain.
- 18 soal berbahasa Indonesia, enam soal per materi.
- Latihan Jatuh Bangun sederhana: pilih bidang A–D dengan avatar atau tombol jawaban, lalu kunci jawaban. Avatar melompat saat benar dan turun sesaat saat salah; belum ada arena bertingkat/eliminasi.
- Penilaian di server: benar mendapat 100 XP, salah 0 XP, tanpa batas waktu. Jawaban duplikat tidak menggandakan skor.
- Penjelasan setelah setiap soal, ringkasan hasil, serta peringkat hasil latihan.
- Pratinjau ruang guru: bank soal hanya baca dan rata-rata ketepatan per materi.
- Suara umpan balik opsional, layar penuh, dialog keyboard, dan layout responsif.

## Jalankan untuk pengembangan

Prasyarat: Node.js 24 LTS dan npm. PostgreSQL **belum diperlukan** pada versi ini.

```bash
npm ci
npm run dev
```

Frontend berjalan di port **5173** dan API di port **3001**. Vite meneruskan `/api` ke backend. Gunakan browser dengan WebGL untuk arena 3D. Tombol jawaban tetap disediakan sebagai alternatif gerak avatar.

Untuk instalasi pada lingkungan yang membatasi cache direktori pengguna:

```bash
npm ci --cache /workspace/.npm-cache
```

## Build dan jalankan hasil build

```bash
npm run build
npm start
```

Express menyajikan aplikasi hasil build dan API pada port **3001**. Variabel `PORT` dapat mengubah port server produksi. Pada development, bila port backend diubah, sesuaikan proxy pada `apps/web/vite.config.js`.

`.env.example` mendokumentasikan konfigurasi. Server membaca variabel proses; berkas `.env` tidak dimuat otomatis. Jangan menyimpan rahasia dalam variabel frontend `VITE_`.

## Cara bermain

1. Pilih Word, Excel, atau PowerPoint di kartu materi.
2. Baca “Bekal sebelum berangkat”.
3. Tekan **Mulai petualangan**, isi nama samaran, lalu **Masuk arena**.
4. Pilih A–D melalui tombol atau berdiri di bidang warna arena. Tekan **Kunci jawaban**.
5. Baca pembahasan dan lanjutkan sampai enam soal selesai.
6. Buka **Papan peringkat** atau **Ruang guru** untuk melihat hasil.

Memutar kamera tidak mengubah sumbu kontrol dunia. Suara jawaban nonaktif secara default. Keluar sebelum enam soal selesai tidak mencatat hasil.

## Penyimpanan dan batasan

Ini adalah **rilis latihan individual lokal**, bukan sistem kelas produksi. Semua hasil pada server yang sama dapat dilihat oleh siapa pun yang membuka aplikasi; gunakan nama samaran dan jangan masukkan data pribadi murid.

- Hasil selesai disimpan di `apps/server/data/results.json` (diabaikan Git), maksimal 500 hasil; API menampilkan 100 hasil terbaru.
- Sesi aktif berada di memori, berlaku satu jam, dan hilang ketika backend restart. Hasil selesai tetap tersimpan di disk.
- Jalankan satu proses backend untuk penyimpanan JSON ini. Penyimpanan bukan PostgreSQL dan tidak mendukung beberapa instance server.
- Nama pilihan tersimpan di localStorage browser. Halaman yang dimuat ulang kembali ke lobi; sesi tidak dipulihkan otomatis.
- Ruang guru belum memiliki autentikasi, editor soal, impor AI, atau pengelolaan kelas.
- Multiplayer/Socket.IO, mulai oleh guru, terjun dengan parasut, Lari Kilat, Detektif, dan proyektor langsung masih merupakan rencana PRD.
- Level akun, penyimpanan XP lintas akun, rapor, dan kapasitas 70 pemain belum diimplementasikan.
- Rata-rata pada ruang guru dihitung dari ketepatan latihan selesai per materi, bukan penguasaan TP yang tervalidasi.

Sebelum penggunaan sekolah/Internet publik: implementasikan autentikasi dan otorisasi, PostgreSQL, perlindungan data murid, pembatasan laju, serta uji keamanan dan beban. Stack database dan multiplayer yang ditetapkan dalam `rules.md` tetap menjadi target pengembangan berikutnya; JSON merupakan penyimpanan sementara untuk rilis latihan lokal ini.

## Pemeriksaan

```bash
npm test
npm run lint
npm run format:check
npm run build
npm run test:e2e
```

Vitest menguji penilaian, jawaban duplikat, penolakan soal yang tidak aktif, serta penyelesaian semua materi. Playwright menguji alur Word sampai hasil, bank soal, dan layout ponsel. E2E menulis hasil sintetis bernama “Uji Penjelajah” ke penyimpanan lokal; gunakan server pengujian terpisah dari data nyata.

Konfigurasi Playwright memakai Chromium sistem `/usr/bin/chromium` pada lingkungan cloud ini. Untuk mesin lain tentukan `CHROMIUM_PATH` ke executable Chromium yang tersedia, atau ubah `launchOptions.executablePath` agar memakai browser Playwright yang telah diinstal.

## Struktur

```text
apps/
  web/src/
    main.jsx                 # Antarmuka, latihan, dan dashboard
    World.jsx                # Dunia, avatar, dan kontrol 3D
    styles.css               # Token dan layout responsif
  server/src/
    index.js                 # API dan penyimpanan hasil
    game-service.js          # Sesi dan penilaian
    questions.js             # Materi dan soal; kunci tetap di server
    game-service.test.js
  server/data/               # Hasil lokal, tidak masuk Git
tests/game.spec.js           # Pengujian browser
```

## Dokumentasi produk

- [PRD.md](./PRD.md): visi lengkap, fitur, dan alur pengguna.
- [desain.md](./desain.md): bahasa visual dan komponen.
- [rules.md](./rules.md): teknologi, penamaan, dan aturan pengembangan.

Dokumen PRD mencakup cakupan yang lebih luas dari rilis ini. Daftar fitur yang benar-benar tersedia dijelaskan di README ini. Microsoft Word, Excel, PowerPoint, dan Roblox adalah merek milik pemiliknya masing-masing; proyek ini bukan layanan resmi atau afiliasi mereka.
