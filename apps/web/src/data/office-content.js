const make = (topic, entries) =>
  entries.map(([prompt, options, answer, explanation], index) => ({
    id: `${topic}-${index + 1}`,
    topic,
    prompt,
    options,
    answer,
    explanation,
  }));
export const questions = [
  ...make('word', [
    [
      'Untuk membuat judul dokumen menjadi tebal, gunakan…',
      ['Bold (Ctrl+B)', 'Italic (Ctrl+I)', 'Underline (Ctrl+U)', 'Save (Ctrl+S)'],
      0,
      'Bold menebalkan teks yang dipilih. Pada Word desktop Windows, pintasannya Ctrl+B.',
    ],
    [
      'Fitur untuk mengatur batas tepi halaman adalah…',
      ['Font Color', 'Margins', 'Zoom', 'Find'],
      1,
      'Margins pada tab Layout mengatur jarak isi dokumen dari tepi halaman.',
    ],
    [
      'Bagaimana membuat daftar bernomor otomatis?',
      ['Insert Picture', 'Page Color', 'Numbering', 'Word Count'],
      2,
      'Numbering membuat daftar berurutan dan memperbarui nomor secara otomatis.',
    ],
    [
      'Format berkas dokumen Word modern adalah…',
      ['.xlsx', '.pptx', '.png', '.docx'],
      3,
      '.docx adalah format dokumen Word; .xlsx untuk Excel dan .pptx untuk PowerPoint.',
    ],
    [
      'Agar teks berada di tengah paragraf, pilih…',
      ['Align Left', 'Center', 'Justify', 'Align Right'],
      1,
      'Center menempatkan teks di tengah antara margin kiri dan kanan.',
    ],
    [
      'Untuk mencari kata di dalam dokumen, gunakan…',
      ['Find (Ctrl+F)', 'Print (Ctrl+P)', 'New (Ctrl+N)', 'Paste (Ctrl+V)'],
      0,
      'Find membantu menemukan kata tanpa membaca seluruh dokumen secara manual.',
    ],
  ]),
  ...make('excel', [
    [
      'Rumus Excel selalu diawali dengan tanda…',
      ['#', '@', '=', '&'],
      2,
      'Tanda sama dengan memberi tahu Excel bahwa isi sel adalah rumus.',
    ],
    [
      'Rumus untuk menjumlahkan nilai sel A1 sampai A5 adalah…',
      ['=AVERAGE(A1:A5)', '=SUM(A1:A5)', '=MAX(A1:A5)', '=COUNT(A1:A5)'],
      1,
      'SUM menjumlahkan nilai dalam rentang. Tanda titik dua menyatakan rentang A1 hingga A5.',
    ],
    [
      'Pertemuan kolom B dan baris 3 disebut sel…',
      ['3B', 'BB', 'B3', 'B:B'],
      2,
      'Alamat sel ditulis dengan huruf kolom diikuti nomor baris: B3.',
    ],
    [
      'Fungsi untuk menghitung rata-rata adalah…',
      ['SUM', 'MAX', 'MIN', 'AVERAGE'],
      3,
      'AVERAGE menghitung rata-rata aritmetika dari nilai numerik.',
    ],
    [
      'Jika A1 berisi 10 dan A2 berisi 5, hasil =A1*A2 adalah…',
      ['15', '50', '2', '5'],
      1,
      'Tanda bintang adalah operator perkalian: 10 × 5 = 50.',
    ],
    [
      'Format berkas workbook Excel modern adalah…',
      ['.xlsx', '.docx', '.pptx', '.mp3'],
      0,
      'Workbook Excel disimpan dengan ekstensi .xlsx dan dapat berisi banyak worksheet.',
    ],
  ]),
  ...make('powerpoint', [
    [
      'Satu halaman dalam presentasi PowerPoint disebut…',
      ['Cell', 'Sheet', 'Slide', 'Paragraph'],
      2,
      'Presentasi terdiri dari slide yang menyajikan informasi secara bertahap.',
    ],
    [
      'Efek perpindahan antar-slide disebut…',
      ['Animation', 'Transition', 'Formula', 'Margin'],
      1,
      'Transition berlaku pada perpindahan slide; Animation berlaku pada objek di dalam slide.',
    ],
    [
      'Untuk memulai presentasi dari awal pada PowerPoint desktop Windows, tekan…',
      ['F1', 'F2', 'F5', 'F12'],
      2,
      'F5 memulai Slide Show dari awal pada PowerPoint desktop Windows.',
    ],
    [
      'Presentasi yang mudah dibaca sebaiknya menggunakan…',
      [
        'Paragraf sangat panjang',
        'Banyak font berbeda',
        'Teks kecil di semua sudut',
        'Poin ringkas dan kontras jelas',
      ],
      3,
      'Poin ringkas dan kontras yang cukup membantu audiens memahami pesan utama.',
    ],
    [
      'Untuk menambahkan foto ke slide, gunakan…',
      ['Insert → Pictures', 'Layout → Margins', 'Data → Sort', 'Formulas → SUM'],
      0,
      'Insert → Pictures digunakan untuk menyisipkan gambar ke slide.',
    ],
    [
      'Format berkas presentasi PowerPoint modern adalah…',
      ['.docx', '.pptx', '.xlsx', '.txt'],
      1,
      '.pptx adalah format presentasi PowerPoint modern.',
    ],
  ]),
];
export const topics = [
  {
    id: 'word',
    name: 'Microsoft Word',
    short: 'W',
    color: '#4285fa',
    description: 'Kuasai dokumen, format teks, dan tata letak.',
    lesson:
      'Pilih teks sebelum mengubah format. Tab Home berisi Bold, alignment, dan Numbering. Atur margin melalui Layout, lalu simpan dokumen sebagai .docx.',
  },
  {
    id: 'excel',
    name: 'Microsoft Excel',
    short: 'X',
    color: '#37cb8a',
    description: 'Jelajahi sel, rumus, dan pengolahan angka.',
    lesson:
      'Alamat sel terdiri dari kolom dan baris, misalnya B3. Rumus diawali =. Gunakan SUM untuk penjumlahan dan AVERAGE untuk rata-rata. Simpan workbook sebagai .xlsx.',
  },
  {
    id: 'powerpoint',
    name: 'Microsoft PowerPoint',
    short: 'P',
    color: '#ff9775',
    description: 'Bangun presentasi yang jelas dan menarik.',
    lesson:
      'Gunakan satu ide utama per slide. Transition mengatur perpindahan slide, Animation mengatur objek. Sisipkan gambar lewat Insert dan simpan presentasi sebagai .pptx.',
  },
];
