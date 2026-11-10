# Panduan Desain Multiedu

Dokumen ini menjadi acuan visual dan interaksi agar seluruh layar Multiedu konsisten dengan gambar referensi pengguna: permainan belajar 3D low-poly dengan HUD biru gelap, aksen kuning, avatar balok, serta panel guru berwarna indigo.

Warna, ukuran, dan perilaku di bawah merupakan spesifikasi implementasi yang disarankan berdasarkan pengamatan gambar, bukan hasil pengukuran aset asli. Gambar belum tersedia sebagai berkas aset di repositori. Dokumen ini tidak menyatakan bahwa permainan atau sinkronisasi kelas telah diimplementasikan.

## 1. Arah visual

- **Suasana:** petualangan kelas yang cerah, ramah anak, aktif, dan mudah dipahami.
- **Dunia permainan:** pulau langit, pegunungan bersisi datar, rumput hijau terang, awan sederhana, kota kecil, jalan abu-abu, serta bangunan berwarna cerah.
- **Karakter:** proporsi avatar balok, wajah sederhana, pakaian dan aksesori beragam. Gunakan aset orisinal dengan bahasa bentuk yang seragam.
- **Antarmuka:** panel navy semiopak dengan sudut membulat, teks putih, batas cyan atau indigo, dan CTA kuning keemasan.
- **Hierarki:** soal dan aksi utama paling menonjol; statistik dan alat pendukung lebih kecil. Dunia 3D tetap menjadi ruang utama pada layar murid.
- **Bahasa produk:** bahasa Indonesia yang singkat dan langsung, misalnya “Masuk kelas”, “Mulai permainan”, dan “Pilih jawabanmu”.

## 2. Token desain

### Warna

| Token | Nilai | Penggunaan |
| --- | --- | --- |
| `bg-deep` | `#0B1029` | Latar dashboard, proyektor, dan halaman pendukung |
| `surface` | `#1C2452` | Panel utama |
| `surface-raised` | `#293468` | Kartu, bagian formulir, dan baris aktif |
| `surface-input` | `#111A3D` | Input dan area jawaban AI |
| `border-default` | `#48558E` | Batas panel dan input |
| `accent-gold` | `#FFD23F` | CTA utama, tab aktif, dan penekanan |
| `accent-gold-dark` | `#B98516` | Bayangan atau tepi bawah tombol emas |
| `accent-cyan` | `#39C8F4` | Fokus, portal, dan identitas pemain |
| `text-primary` | `#F7F9FF` | Judul dan teks utama |
| `text-muted` | `#BFC9E6` | Keterangan dan label pendukung |
| `answer-a` | `#F26862` | Pilihan A |
| `answer-b` | `#42ADF5` | Pilihan B |
| `answer-c` | `#30C780` | Pilihan C dan indikator berhasil |
| `answer-d` | `#FFD23F` | Pilihan D |
| `world-grass` | `#B6EE82` | Rumput dunia 3D |
| `world-sky` | `#BFE3FB` | Langit |
| `world-road` | `#65738B` | Jalan dan landasan |

Panel HUD memakai `surface-input` dengan opasitas 90–96% agar soal tetap terbaca pada dunia yang terang. Hindari ketergantungan pada blur. Teks pada tombol kuning dan bidang jawaban kuning memakai warna navy. Periksa kontras pada hasil implementasi; target teks normal minimal 4,5:1.

### Tipografi

Gunakan satu keluarga sans-serif membulat, dengan pilihan awal **Nunito Sans**, lalu `system-ui, sans-serif` sebagai fallback. Font ini merupakan rekomendasi, bukan identifikasi font dari gambar. Jika digunakan, simpan aset font secara lokal dengan lisensi yang sesuai.

| Peran | Ukuran desktop | Bobot |
| --- | --- | --- |
| Judul halaman | 28–32 px | 800 |
| Judul panel | 20–24 px | 800 |
| Pertanyaan | 18–22 px | 700 |
| Tombol dan isi | 16 px | 600–800 |
| Label pendukung | 14 px | 600 |
| Label avatar | 14–16 px | 800 |

Gunakan tinggi baris 1,4–1,5 untuk isi dan 1,2 untuk judul. Jangan meniru teks kecil atau buram dari tangkapan layar. Huruf kapital penuh hanya untuk label mode pendek, misalnya “LARI KILAT”.

### Ukuran dan bentuk

- Skala jarak: `4, 8, 12, 16, 24, 32, 48` px.
- Radius: input dan tombol kecil `8 px`, panel `16 px`, kartu besar `24 px`, badge `999 px`.
- Batas: panel biasa `1 px`, fokus dan pilihan aktif `2–3 px`.
- Tinggi kontrol minimal `44 px`; kontrol sentuh permainan disarankan `48–56 px`.
- Bayangan panel: `0 8px 24px rgba(0, 0, 0, .24)`.
- Tombol utama dapat memakai bayangan bawah emas gelap `0 4px 0 #B98516`; hindari glow pada semua komponen.
- Lebar konten guru maksimal `1200 px`, dengan padding halaman `24 px` pada desktop dan `16 px` pada ponsel.

## 3. Struktur pengalaman

### Murid

1. Masuk ke kelas dan pilih avatar.
2. Tiba di **Lobi Pulau Langit**, melihat kelas, jumlah pemain siap, dan status menunggu guru.
3. Guru memulai permainan; tampil hitung mundur, kemudian transisi terjun ke arena.
4. Murid mengikuti mode belajar, menjawab soal, serta menerima umpan balik.
5. Tampilkan hasil sesi, perkembangan XP, dan tombol kembali ke lobi.

### Guru

Navigasi utama: **Beranda · Soal · Kelas & Murid · Tantangan · Paket Saya · Lainnya**. Akun dan keluar berada pada area utilitas terpisah.

Alur utama: pilih kelas → pilih paket soal dan mode → buka lobi → periksa pemain siap → mulai sesi → pantau peringkat → lihat penguasaan tujuan pembelajaran (TP).

### Proyektor kelas

Layar khusus untuk judul sesi, kelas, status koneksi, waktu, dan papan peringkat langsung. Tidak menampilkan kontrol pribadi murid atau formulir guru. Gunakan ukuran teks besar yang terbaca dari belakang kelas.

## 4. Tata letak layar murid

### HUD bersama

- **Kiri atas:** kartu profil berisi avatar, nama, level, serta progres XP, misalnya “Raka · Level 1 · 0/100 XP”.
- **Tengah atas:** panel misi atau soal. Batasi lebarnya agar tidak menutup seluruh arena.
- **Kanan atas:** toolbar utilitas yang konsisten urutannya: jeda, dunia, misi, avatar, peta, pengaturan. Pada layar sempit gunakan satu menu tambahan.
- **Area dunia:** avatar, jalur, gedung, dan sasaran interaksi terlihat jelas.
- **Bawah kiri:** joystick virtual pada perangkat sentuh.
- **Bawah kanan:** tombol interaksi dan lompat jika mode memerlukannya.
- **Label avatar:** pill navy dengan batas cyan tipis, teks “Nama · Lv 4”. Label pemain lokal diprioritaskan; label jauh disembunyikan atau diringkas agar tidak bertumpuk.

Jangan menempatkan tombol di atas soal, joystick, atau sasaran jawaban. Hormati safe area perangkat. Panel soal harus bisa memuat teks panjang tanpa terpotong.

### Lobi Pulau Langit

Pulau hijau berpagar kuning, landasan abu-abu dengan garis putih, portal cyan, bendera, dan pegunungan berkabut di kejauhan. Panel pusat menampilkan nama sesi, “Menunggu guru menekan Mulai”, dan jumlah pemain siap. Tombol **Mulai permainan** hanya tersedia untuk guru. Murid melihat status kesiapan dan petunjuk kontrol.

Hitung mundur `3 → 2 → 1` berada di tengah dunia. Kapasitas seperti “70 murid” atau “8 kelas” pada gambar tidak boleh dijadikan janji produk sebelum batas sistem teruji; tampilkan jumlah aktual.

### Battle Petualangan

Gunakan transisi dari lobi ke terjun bersama, lalu mendarat di kota belajar. Tampilkan tujuan singkat, misalnya “Cari gedung Matematika”. Parasut, bayangan pendaratan, dan penanda tujuan harus memiliki bahasa bentuk yang sama dengan dunia low-poly.

### Jatuh Bangun

Arena bertingkat dengan empat bidang besar:

| Posisi | Pilihan | Warna |
| --- | --- | --- |
| Kiri atas | A | Merah |
| Kanan atas | B | Biru |
| Kiri bawah | C | Hijau |
| Kanan bawah | D | Kuning |

Huruf A–D harus terlihat pada bidang dunia dan pada panel jawaban. Panel atas memuat nomor soal, progres lantai, skor, timer, pertanyaan, dan empat pilihan dalam susunan yang sama. Jawaban benar menaikkan progres; jawaban salah menampilkan umpan balik dan animasi jatuh singkat tanpa kilatan agresif. Aturan skor dan perpindahan lantai mengikuti konfigurasi permainan, bukan diasumsikan dari gambar.

### Lari Kilat

Jalan memiliki empat lajur menuju gerbang A–D. Warna dan urutan pilihan sama dengan Jatuh Bangun. Panel soal menampilkan sisa waktu sebelum gerbang dan petunjuk “Pindah ke lajur jawabanmu”. Gunakan indikator pilihan aktif pada HUD dan lajur. Setelah gerbang dilewati, tampilkan hasil sebelum soal berikutnya.

### Detektif Kota Ilmu

Kota kecil berisi NPC, papan petunjuk, gedung belajar, dan penanda misi kuning. Interaksi dengan NPC membuka panel bacaan yang nyaman dibaca, tujuan misi, serta tombol lanjut. Petunjuk misi berasal dari isi bacaan. Status petunjuk yang telah ditemukan terlihat pada jurnal; jangan mengandalkan warna saja.

## 5. Komponen bersama

| Komponen | Aturan konsistensi |
| --- | --- |
| Tombol utama | Emas, teks navy tebal, satu aksi utama per bagian |
| Tombol sekunder | Indigo, teks putih, batas halus |
| Aksi berbahaya | Merah, label jelas; konfirmasi untuk menghapus atau mengakhiri sesi aktif |
| Tab | Indigo saat biasa, emas saat aktif; sertakan penanda aktif selain warna |
| Input | Latar navy, label di atas, contoh isi sebagai placeholder, pesan kesalahan di bawah |
| Pilihan A–D | Huruf, warna, teks jawaban, serta tanda terpilih; fokus tidak sama dengan jawaban benar |
| Badge kelas | Nama kelas dan status teks seperti “Tersinkron” atau “Menghubungkan” |
| Notifikasi | Ringkas, tidak menutup soal; kesalahan penting tetap terlihat sampai ditangani |
| Dialog | Judul, isi singkat, aksi utama dan batal; fokus kembali ke pemicu setelah ditutup |
| Ikon | Satu keluarga ikon dengan ketebalan seragam; tombol ikon memiliki nama aksesibel dan tooltip |

Keadaan wajib: normal, hover, fokus keyboard, ditekan, dipilih, nonaktif, memuat, berhasil, dan gagal. Saat memuat, tampilkan label seperti “Menyimpan…” serta cegah pengiriman ganda. Jangan menggunakan emoji sebagai satu-satunya identitas kontrol.

## 6. Dashboard guru

Gunakan latar `bg-deep` dan panel indigo. Hindari latar dunia 3D di belakang tabel atau formulir yang panjang.

### Beranda dan analitik

- Pemilih kelas, paket, dan periode berada di atas ringkasan.
- Tab analisis mengikuti referensi: **Per mapel**, **Per TP & deskripsi rapor**, **Membaca (Detektif)**, dan **Berhitung (Pasar)**. Tab hanya aktif bila datanya tersedia.
- Grafik batang penguasaan TP memakai sumbu 0–100, label nilai, nama TP, serta garis target yang diberi label. Nilai target berasal dari pengaturan kelas; angka 75 pada referensi hanya contoh.
- Warna hijau menandai capaian sesuai target; warna coral menandai kebutuhan latihan. Sertakan teks agar arti tidak bergantung pada warna.
- Bagian “TP yang perlu diperkuat” menjelaskan TP, capaian, dan saran tindak lanjut.
- Tabel murid menampilkan nama, hasil per TP, dan aksi detail. Header tetap terbaca saat tabel digulir.
- Deskripsi rapor dan remedial harus dapat ditinjau guru sebelum digunakan.

### Pembuat soal dengan AI

Pertahankan alur tiga langkah dari referensi:

1. **Isi topik soal:** mapel/topik, jenjang/kelas, jumlah soal, jenis soal, dan catatan tambahan opsional.
2. **Salin perintah:** tombol emas “Salin perintah”, pratinjau instruksi, dan tautan layanan AI yang diberi tanda membuka situs lain. Tampilkan “Perintah disalin” setelah berhasil.
3. **Tempel jawaban AI:** textarea berfont monospace, petunjuk format, validasi struktur, dan pratinjau soal sebelum dimasukkan ke paket.

Tombol **Masukkan ke Paket Saya** memakai gaya sukses. Aksi **Ganti semua soal** memakai gaya sekunder dan membutuhkan konfirmasi bila menimpa isi. Tombol **Simpan** konsisten posisinya di akhir formulir. Jika hasil AI tidak valid, pertahankan teks pengguna dan jelaskan bagian yang perlu diperbaiki. Kunci jawaban wajib dapat diperiksa guru. Alur salin-tempel ini tidak mengasumsikan adanya integrasi API AI.

### Papan peringkat langsung

Panel memuat judul mode, kelas, status pembaruan, serta daftar peringkat, nama, dan skor. Tiga peringkat teratas memiliki pembeda bentuk atau ikon; semua baris tetap mudah dibaca. Perubahan skor diberi sorotan singkat tanpa membuat baris sulit diikuti. Saat koneksi terputus, pertahankan skor terakhir dengan label “Data terakhir” dan status menghubungkan kembali. Proyektor memakai nama tampilan sesuai pengaturan privasi kelas.

## 7. Responsif dan aksesibilitas

| Ukuran | Perilaku |
| --- | --- |
| Desktop ≥ 1024 px | HUD lengkap; jawaban 2 × 2; dashboard dengan tabel dan grafik lebar |
| Tablet 768–1023 px | Toolbar diringkas; panel dan formulir menyesuaikan ruang; kontrol sentuh tersedia |
| Ponsel < 768 px | Formulir satu kolom; navigasi guru menjadi menu; jawaban boleh satu kolom; tabel bergulir di dalam kontainernya |
| Proyektor | Fokus pada peringkat dan status sesi; ukuran teks disesuaikan jarak pandang; tanpa kontrol sentuh |

Permainan diutamakan dalam orientasi landscape, tetapi portrait tetap menyediakan soal, status, dan kontrol dasar tanpa memaksa rotasi. Gunakan skala HUD berdasarkan ruang yang tersedia, jangan mengecilkan semua teks secara proporsional.

- Sediakan fokus keyboard yang jelas dan urutan tab logis.
- Kontrol desktop: WASD/tombol panah untuk bergerak, tombol interaksi yang ditampilkan pada petunjuk, dan Escape untuk menu. Hindari mengambil alih tombol saat pengguna mengetik pada input.
- Sediakan kontrol jawaban yang dapat digunakan tanpa perpindahan avatar presisi sebagai alternatif aksesibilitas; aturan penguncian jawaban harus sama.
- Soal, pilihan, timer, dan hasil memiliki representasi teks di luar canvas 3D.
- Jangan membacakan setiap perubahan peringkat melalui pembaca layar; umumkan perubahan penting secara terkendali.
- Hormati `prefers-reduced-motion`: kurangi gerak kamera, transisi terjun, dan efek jatuh.
- Audio memiliki pengaturan volume dan mute; informasi penting tetap tersedia secara visual.
- Uji teks panjang, pembesaran teks, safe area, dan kontras sebelum menyatakan aksesibilitas terpenuhi.

## 8. Gerak dan umpan balik

Transisi tombol dan panel berlangsung sekitar 120–200 ms. Umpan balik jawaban berlangsung sekitar 300–600 ms dan tidak menghalangi soal berikutnya. Kamera mengikuti avatar dengan gerak stabil, tanpa guncangan wajib. Koin dan XP dapat memakai animasi kecil; hasil benar atau salah selalu disertai teks/ikon. Timer menggunakan waktu sesi yang konsisten; tampilkan status bila sinkronisasi belum tersedia.

## 9. Gaya promosi dari referensi

Gambar referensi juga memuat elemen presentasi: badge mode kuning, bingkai emas, judul putih dengan beberapa kata kuning, serta caption navy di bawah cuplikan permainan. Gunakan pola ini untuk halaman pengenalan atau materi promosi.

Caption seperti “Guru tekan Mulai, satu kelas terjun bersamaan” dan “Jawab benar naik, salah jatuh!” bukan kontrol permainan. Jangan menempelkan caption promosi besar pada HUD aktif karena menutup arena. Kartu panduan tiga langkah dapat digunakan pada onboarding: **Terjun ke dunia 3D → Jelajahi kota → Jawab soal dan kumpulkan progres**.

## 10. Batas konsistensi

- Jangan mengubah warna A–D antar-mode, halaman, atau gerbang.
- Jangan memakai gaya avatar realistis di dunia low-poly.
- Jangan mencampur banyak font, keluarga ikon, atau radius tanpa peran yang jelas.
- Jangan menampilkan teks putih pada bidang kuning tanpa pemeriksaan kontras.
- Jangan menutup tujuan permainan dengan label avatar, banner, atau toolbar.
- Jangan menampilkan status “Tersinkron”, skor langsung, kapasitas pemain, atau data tersimpan bila sistem belum mengonfirmasinya.
- Mode tambahan mengikuti token dan komponen yang sama. Referensi belum cukup untuk menetapkan aturan rinci mode Berhitung/Pasar.

## 11. Checklist peninjauan implementasi

- [ ] Semua layar memakai token warna, font, jarak, radius, dan tombol yang sama.
- [ ] Profil, panel soal, toolbar, serta kontrol murid konsisten antar-mode.
- [ ] Pilihan A–D konsisten dalam warna, huruf, urutan, dan status.
- [ ] Lobi, permainan, hasil, dashboard guru, pembuat soal, dan proyektor memiliki keadaan kosong/memuat/gagal yang sesuai.
- [ ] Soal panjang dan nama murid panjang tidak terpotong tanpa cara membaca lengkapnya.
- [ ] Formulir AI mempertahankan input saat validasi gagal dan menyediakan tinjauan soal.
- [ ] Dashboard membedakan data belum tersedia dari nilai nol.
- [ ] Tampilan diperiksa pada lebar 1440, 768, dan 390 px serta landscape ponsel.
- [ ] Keyboard, sentuhan, kontras, dan pengurangan gerak diperiksa.
- [ ] Perilaku permainan dan sinkronisasi diuji secara fungsional sebelum diklaim bekerja.

Checklist ini merupakan kriteria penerimaan untuk implementasi berikutnya; belum merupakan hasil pengujian aplikasi.
