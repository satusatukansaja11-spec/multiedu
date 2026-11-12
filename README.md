# Multiedu — Office Adventure

Game edukasi JavaScript dengan React, Three.js/React Three Fiber, dan Express. Materi: **Microsoft Word, Excel, dan PowerPoint**. Dunia dan karakter dibuat secara prosedural; tidak memakai aset Roblox atau situs referensi.

## Mode offline — versi aktif

Tombol **Mainkan Sekarang** kini memakai mesin permainan lokal tanpa menunggu Express/API. Semua materi, 18 soal (6 Word, 6 Excel, 6 PowerPoint), pembahasan, kostum, dan aturan penilaian dibundel di dalam aplikasi. Tidak ada pengambilan soal atau materi dari internet.

Untuk bermain tanpa backend:

```bash
npm run dev:offline
```

Buka port **5173**. Untuk hasil build mandiri:

```bash
npm run build
npm run preview
```

Buka port **4173**. Folder `apps/web/dist` dapat dihosting sebagai situs statis, termasuk pada subfolder. Service worker menyimpan aplikasi setelah pemuatan pertama selesai pada localhost/HTTPS; setelah cache siap, halaman dapat dimuat ulang dan dimainkan ketika jaringan diputus. Pemuatan pertama dari situs yang belum pernah dikunjungi tetap memerlukan akses ke situs itu. Bila semua berkas dijalankan dari localhost, internet tidak diperlukan untuk bermain.

Instalasi dependensi awal (`npm ci`) memerlukan paket yang sudah tersedia di cache atau akses registry. Ini terpisah dari kebutuhan internet saat bermain. Jangan membuka `index.html` langsung melalui `file://`; gunakan server statis lokal agar modul JavaScript dan cache bekerja.

Progres offline tersimpan dalam localStorage `multiedu-offline-v1`, terpisah dari data server versi sebelumnya. Jangan menghapus penyimpanan browser jika ingin mempertahankan hasil. Data lokal dan kunci jawaban dapat diperiksa/diubah di perangkat sendiri; mode ini untuk latihan, bukan ujian berpengamanan server.

Fitur akun guru, kode kelas, proyektor lintas perangkat, dan undangan teman **dinonaktifkan pada mode offline**. Materi/soal untuk ketiga aplikasi Office tetap tersedia tanpa akun. Fitur eksplorasi, NPC, kuis, lima mode tambahan, koin, misi, kostum, SFX dan light/dark menggunakan penyimpanan lokal.

Sumber materi: `apps/web/src/data/office-content.js`. Mesin lokal: `apps/web/src/offline-store.js`. Cache produksi dibuat oleh `apps/web/offline-plugin.js`.

Bagian berikut mendokumentasikan arsitektur server sebelumnya; autentikasi dan penyimpanan server tersebut **bukan syarat permainan offline aktif**.

## Menjalankan arsitektur server (opsional)

Prasyarat: Node.js 24 LTS, npm, browser WebGL.

```bash
npm ci
npm run dev
```

Frontend: port **5173**, backend: **3001**. Vite meneruskan `/api` ke backend. Jika cache pengguna tidak dapat ditulis, gunakan `npm ci --cache /workspace/.npm-cache`.

```bash
npm run build
npm start
```

Hasil build dan API disajikan pada port 3001. `PORT` dapat mengubah port backend produksi. Untuk development, perubahan port perlu diselaraskan pada proxy Vite. `.env.example` hanya contoh; `.env` tidak dimuat otomatis.

## Alur yang tersedia

### Eksplorasi

**Mainkan Sekarang → Jelajah Dunia → pilih dunia → buat karakter → masuk dunia.**

Sebelas dunia tersedia sebagai **area prosedural tunggal per tema**: Kota Ilmu, Samudra, Angkasa, Rimba, Nusantara, Mancanegara, Tubuh Manusia, Zaman Purba, Lorong Waktu, Iklim Ekstrem, dan Kota Masa Depan. Setiap tema mempunyai objek berbeda seperti karang/ikan, roket, hutan, perahu, piramida, sel, dinosaurus, candi, es, atau robot/kendaraan melayang. Belum ada perjalanan terpisah antar-subwilayah seperti Bulan → Mars dalam satu dunia.

- Gerak: WASD/panah, Shift berlari, Spasi melompat atau berenang naik di Samudra. Seret untuk kamera; E berinteraksi dekat NPC/gedung. Tombol sentuh dan tombol kunjungan tersedia.
- Tiga gedung materi, NPC bertema dunia, ringkasan materi, dan kuis. Kuis NPC dan gedung dicatat berbeda.
- Lima Buku Ilmu unik per dunia, masing-masing +5 koin, sekali per profil. Tidak muncul ulang harian.
- Kuis gedung lulus dengan minimal 50% benar. Kelulusan disimpan per dunia/materi. Jawaban benar +100 XP; hasil selesai memberi +2 koin per jawaban benar. Level = 1 + floor(XP / 500).
- Membaca materi memerlukan konfirmasi kesiapan sebelum kuis. Ini catatan partisipasi, bukan bukti pemahaman otomatis.

### Lima mode tambahan

| Mode | Perilaku |
| --- | --- |
| Lari Kilat | Empat lajur, gerbang mendekat selama 12 detik, pilihan terakhir di server terkunci pada deadline. Tema Kota/Pantai/Angkasa. Spasi lompat, Ctrl runduk; tersedia tombol sentuh. Koin otomatis pada lajur target atau tombol aksesibel, maksimal +1 per soal. Rintangan pada lajur berikutnya saat tersisa 6 detik; tabrakan -25 skor (minimum 0). Angsa visual mendekat setelah tabrakan; tanpa eliminasi. |
| Jatuh Bangun | Empat lantai nyata, timer 15 detik per soal. Pilih bidang melalui WASD/panah atau tombol A–D. Benar naik satu lantai; salah/tidak memilih turun satu lantai. Minimum lantai 1, maksimum 4, tanpa eliminasi. |
| Detektif Kota Ilmu | Kasus dokumen Word dengan empat bacaan petunjuk, kemudian dua pertanyaan untuk mengidentifikasi dokumen dan mencari informasi. |
| Pasar Nusantara | Tiga transaksi: total belanja, kembalian, diskon; dikaitkan dengan rumus Excel. |
| Jembatan Juara | Enam soal membangun bagian jembatan dan memindahkan avatar menuju finis. Jawaban salah tidak membuka bagian; hasil menunjukkan jumlah bagian berhasil. |

Bank awal berisi 18 soal Office, masing-masing 6 per materi. Campuran menggunakan 18 soal; Jembatan dibatasi 6. Detektif dan Pasar menggunakan kasus khusus. Soal, penilaian, hadiah, dan pilihan sebelum deadline berada di server. Gerak/collision grafis disimulasikan klien; ini belum sistem anti-cheat produksi.

Pada mode bertimer, pertanyaan berikutnya menunggu tombol Lanjut sehingga pembahasan dapat dibaca. Jeda individual menghentikan timer server. Pada kelas, jeda pribadi tidak tersedia. Sesi berakhir setelah soal habis. Aktivitas terakhir dapat dibuka melalui **Lanjutkan aktivitas tersimpan** pada pilihan mode; deadline tetap berlaku ketika halaman/browser ditutup. Token profil dan penunjuk aktivitas tersimpan di browser.

### Progres dan kostum

- Profil, penguasaan materi, riwayat, lencana, dan misi dapat dibuka lewat toolbar.
- Misi memiliki target, status, hadiah, dan klaim idempoten. Combo salah kembali nol; combo terbaik dipertahankan. Misi harian memakai hari UTC.
- Kostum: atasan, bawahan, rambut, warna rambut, topi, dan wajah. Warna kaos dasar gratis. Item berharga dan bersyarat level diperiksa server; pembelian meminta konfirmasi.
- Peta mini, kualitas grafis tinggi/ringan, tema light/dark, volume/mute, dan pembacaan soal opsional. Dukungan suara pembaca tergantung browser.
- Hapus progres hanya mereset profil pemain aktif setelah konfirmasi; tidak menghapus akun guru atau data peserta lain.
- Data lama dari rilis localStorage diarsipkan pada `office-legacy-profile` ketika profil server dibuat. Nama/warna digunakan kembali; saldo/XP lama tidak otomatis dikonversi ke ekonomi baru.

### Guru, kelas, dan proyektor

1. Buka **Ruang Guru**, daftar akun lokal server, kemudian masuk. Username 3–40 huruf/angka/underscore/dash; password minimal 8 karakter. Password di-hash dengan scrypt.
2. Buat paket melalui editor JSON, atau salin prompt ke ChatGPT/Gemini/Claude lalu tempel hasil. Guru harus meninjau kunci. Validasi menerima 1–30 soal. Paket dapat disalin ke editor dan diganti dengan konfirmasi.
3. Buka lobi dengan nama kelas, materi, mode, dan paket opsional. Bagikan kode enam angka.
4. Peserta membuka **Gabung kelas**, memasukkan kode, lalu memilih **Saya siap**.
5. Guru memulai setelah semua peserta siap; ada hitung mundur tiga detik. Peserta yang bergabung terlambat dapat mulai saat sesi masih berjalan.
6. Proyektor dibuka di tab lain pada browser guru yang sama. Peringkat dan laporan diperbarui setiap 1–1,5 detik melalui HTTP polling.
7. Laporan menampilkan ketepatan per materi, status selesai, saran latihan dengan acuan 75%, dan draf catatan yang harus ditinjau guru. Ini belum pemetaan TP kurikulum atau rapor resmi.

Kelas mendukung sesi soal bersama dan peringkat lintas perangkat. **Gerak avatar antarperangkat tidak disinkronkan.** Ini bukan dunia multiplayer fisika bersama. Pembaruan menggunakan polling, bukan Socket.IO. Proyektor memerlukan sesi guru aktif di browser yang sama; jangan membagikan token guru.

## Data dan batas operasional

- Penyimpanan lokal server: `apps/server/data/adventure.json`. Berisi profil, token, akun guru (hash password), paket, kelas, dan sesi. File diabaikan Git.
- Penulisan diserialkan dan memakai temporary file + rename. Kegagalan operasi membatalkan perubahan memori transaksi.
- Jalankan **satu proses backend** dengan direktori data persisten. Belum menggunakan PostgreSQL atau mendukung beberapa instance backend.
- Profil murid memakai token anonim di browser (berlaku satu tahun); sesi guru berlaku satu hari. Hilangnya token browser berarti profil anonim tidak dapat dipulihkan lewat login. Jangan menghapus storage browser bila ingin mempertahankan akses.
- Gunakan nama samaran. Peserta satu kelas dapat melihat nama tampilan dan skor satu sama lain. Akun guru dibatasi pada paket/kelas miliknya.
- Rute `/api/sessions`, `/api/results` lama dipertahankan untuk kompatibilitas latihan sebelumnya. Hasil legacy bersifat lokal dan terbuka; antarmuka baru memakai `/api/adventure` dengan akses berdasarkan token.
- Belum ada reset password, email verifikasi, pembatasan laju produksi, ekspor rapor, pengujian kapasitas puluhan pemain, atau administrasi sekolah.
- Untuk publikasi Internet perlu HTTPS, backup, PostgreSQL/migrasi, rate limit, kebijakan data murid, dan uji keamanan/beban. Konfigurasi ini untuk pengembangan dan uji coba terkontrol.

## Pengujian

```bash
npm test
npm run lint
npm run format:check
npm run build
npm run test:e2e
```

Playwright memakai `/usr/bin/chromium` pada cloud ini. Atur `CHROMIUM_PATH` pada mesin lain. Tes E2E menulis akun/pemain/paket/kelas sintetis pada server pengujian; jangan menjalankannya pada data sekolah. Tes waktu menggunakan deadline server sungguhan, sehingga lebih lama daripada tes UI biasa.

## Struktur dan dokumentasi

- `apps/web/src/OfficeAdventure.jsx`: alur masuk, eksplorasi, pengaturan, dan progres.
- `apps/web/src/World.jsx`, `WorldScenery.jsx`: avatar dan sebelas tema dunia.
- `apps/web/src/GameMode.jsx`: arena serta alur lima mode tambahan.
- `apps/web/src/TeacherRoom.jsx`: akun guru, paket, kelas, dan proyektor.
- `apps/server/src/adventure-api.js`: akses, ekonomi, progres, kelas, dan penilaian persisten.
- [permainan.md](./permainan.md): spesifikasi lengkap dan keputusan implementasi.
- [PRD.md](./PRD.md), [desain.md](./desain.md), [rules.md](./rules.md): kebutuhan produk, visual, dan aturan kode.

Microsoft dan Roblox merupakan merek pemiliknya masing-masing. Multiedu tidak berafiliasi dengan layanan tersebut.

Pembacaan soal pada mode offline hanya menggunakan suara Bahasa Indonesia yang ditandai lokal oleh browser/OS. Jika suara tersebut belum terpasang, game memberi pemberitahuan dan tidak memakai layanan suara online. SFX dibuat dengan Web Audio tanpa berkas dari internet.

## Kota Ilmu yang diperluas

Kota Ilmu memakai area 88 × 88 unit: sembilan blok, tiga gedung Office di sisi utara, permukiman, jalan dua arah dengan marka dan zebra cross, trotoar, lampu, pepohonan, serta plaza dengan air mancur dan bangku. Dua belas kendaraan (mobil dan bus) mengitari lintasan dalam dan luar dengan tikungan membulat. Kendaraan dijeda ketika menu/jeda terbuka.

Gapura pusat menampilkan **SELAMAT DATANG** pada sisi depan dan **KOTA ILMU** pada sisi belakang. Tulisan dibuat sebagai tekstur lokal, tanpa unduhan font/aset. Tombol **Kamera dekat / Lihat seluruh kota** mengganti sudut pandang; kamera dekat mengikuti gerak pemain. Peta mini dan interaksi gedung memakai koordinat kota yang diperluas. Kendaraan adalah lalu lintas visual, belum simulasi tabrakan/rambu penuh.
