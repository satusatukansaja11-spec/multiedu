export async function adventureApi(path, body, teacher = false) {
  const response = await fetch(`/api/adventure${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem(teacher ? 'office-teacher-token' : 'office-player-token') || ''}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok)
    throw Object.assign(new Error(data.error?.message || 'Server tidak tersedia.'), {
      status: response.status,
    });
  return data;
}
export const WORLDS = [
  ['city', 'Kota Ilmu', 'Kota, plaza dan gedung belajar.', '#91b9c2', '#b9df91', 'Bu Sari'],
  ['ocean', 'Samudra', 'Karang, ikan dan bangunan kubah.', '#167f9c', '#dfcd8b', 'Penyelam Dina'],
  ['space', 'Angkasa', 'Bulan, roket dan stasiun orbit.', '#101431', '#72748d', 'Astronaut Raka'],
  ['forest', 'Rimba', 'Hutan lebat, sungai dan air terjun.', '#90b9a1', '#529963', 'Ranger Rani'],
  [
    'islands',
    'Nusantara',
    'Pulau tropis, perahu dan rumah panggung.',
    '#7ecce1',
    '#e4d994',
    'Pemandu Wayan',
  ],
  ['global', 'Mancanegara', 'Piramida dan menara landmark.', '#b6d8ec', '#c7bc92', 'Pemandu Maya'],
  ['body', 'Tubuh Manusia', 'Sel, pembuluh dan organ raksasa.', '#743647', '#ce8197', 'Dokter Sel'],
  [
    'prehistoric',
    'Zaman Purba',
    'Dinosaurus dan gunung berapi.',
    '#e1a88b',
    '#98876a',
    'Peneliti Bima',
  ],
  [
    'history',
    'Lorong Waktu',
    'Candi, jam dan gerbang sejarah.',
    '#ac9dc2',
    '#bba787',
    'Pemandu Waktu',
  ],
  [
    'extreme',
    'Iklim Ekstrem',
    'Salju, es dan tenda ekspedisi.',
    '#bfd9ec',
    '#edf5ff',
    'Peneliti Salju',
  ],
  [
    'future',
    'Kota Masa Depan',
    'Robot, energi surya dan mobil terbang.',
    '#253951',
    '#74aeb4',
    'Robo Ilmu',
  ],
].map(([id, name, description, sky, ground, npc]) => ({ id, name, description, sky, ground, npc }));
export const MODES = [
  ['runner', 'Lari Kilat', 'Pilih lajur sebelum gerbang, hindari rintangan.'],
  ['tower', 'Jatuh Bangun', 'Empat lantai, benar naik dan salah turun.'],
  ['detective', 'Detektif Kota Ilmu', 'Baca empat petunjuk untuk memecahkan kasus.'],
  ['market', 'Pasar Nusantara', 'Gunakan Excel untuk menghitung transaksi.'],
  ['bridge', 'Jembatan Juara', 'Jawab soal untuk membangun jalan menuju finis.'],
];
export const LESSONS = {
  word: 'Pilih teks sebelum mengubah format. Ctrl+B menebalkan teks, Numbering membuat daftar, Layout → Margins mengatur batas halaman. Ctrl+F mencari teks. Simpan dokumen sebagai .docx.',
  excel:
    'Sel ditulis dengan huruf kolom dan nomor baris, misalnya B3. Rumus diawali =. SUM menjumlahkan rentang, AVERAGE menghitung rata-rata. Tanda * untuk perkalian. Workbook disimpan sebagai .xlsx.',
  powerpoint:
    'Satu halaman disebut slide. Transition mengatur perpindahan slide; Animation mengatur objek. Gunakan poin ringkas dan gambar melalui Insert → Pictures. F5 memulai presentasi pada desktop Windows. Simpan sebagai .pptx.',
};
