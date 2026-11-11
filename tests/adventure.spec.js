import { test, expect } from '@playwright/test';
const prefix = '/api/adventure';
async function player(request) {
  const r = await request.post(prefix + '/players', { data: { name: 'Uji Full Flow' } });
  expect(r.ok()).toBe(true);
  return (await r.json()).token;
}
const headers = (token) => ({ Authorization: `Bearer ${token}` });
async function post(request, path, data, token) {
  return request.post(prefix + path, { data, headers: headers(token) });
}
async function get(request, path, token) {
  return request.get(prefix + path, { headers: headers(token) });
}
test('server progress, purchases, claims, ownership and all topic sessions', async ({
  request,
}) => {
  const token = await player(request),
    other = await player(request);
  for (const world of ['city', 'ocean'])
    for (let i = 0; i < 5; i++)
      expect((await post(request, '/books', { world, index: i }, token)).ok()).toBe(true);
  let profile = await (await post(request, '/books', { world: 'city', index: 0 }, token)).json();
  expect(profile.coins).toBe(50);
  expect(profile.books.length).toBe(10);
  profile = await (await post(request, '/claims', { id: 'books' }, token)).json();
  expect(profile.coins).toBe(90);
  expect((await (await post(request, '/claims', { id: 'books' }, token)).json()).coins).toBe(90);
  expect((await post(request, '/wardrobe', { id: 'hat-cap', confirm: true }, token)).status()).toBe(
    400,
  );
  profile = await (
    await post(request, '/wardrobe', { id: 'pants-red', confirm: true }, token)
  ).json();
  expect(profile.coins).toBe(75);
  expect(
    (await (await post(request, '/wardrobe', { id: 'pants-red', confirm: true }, token)).json())
      .coins,
  ).toBe(75);
  const key = {
    word: [0, 1, 2, 3, 1, 0],
    excel: [2, 1, 2, 3, 1, 0],
    powerpoint: [2, 1, 2, 3, 0, 1],
  };
  for (const topic of Object.keys(key)) {
    let run = await (
      await post(request, '/runs', { mode: 'quiz', topic, world: 'city' }, token)
    ).json();
    expect(run.question).not.toHaveProperty('answer');
    expect((await get(request, `/runs/${run.id}`, other)).status()).toBe(404);
    for (const answer of key[topic]) {
      const body = { questionId: run.question.id, answer };
      const r = await post(request, `/runs/${run.id}/answers`, body, token);
      expect(r.ok()).toBe(true);
      run = (await r.json()).session;
      const duplicate = await (await post(request, `/runs/${run.id}/answers`, body, token)).json();
      expect(duplicate.session.score).toBe(run.score);
    }
    expect(run.completed).toBe(true);
    expect(run.score).toBe(600);
  }
  profile = await (await get(request, '/profile', token)).json();
  expect(profile.history.length).toBe(3);
  expect(Object.keys(profile.buildings)).toHaveLength(3);
  expect(profile.xp).toBe(1800);
});
test('teacher roles, import, class lobby, countdown, score and report', async ({ request }) => {
  const username = `test_${Date.now()}`,
    password = 'Unique-test-pass-845';
  expect((await post(request, '/teachers/register', { username, password })).ok()).toBe(true);
  const teacher = (await (await post(request, '/teachers/login', { username, password })).json())
    .token;
  const p = await player(request);
  expect((await get(request, '/teacher', p)).status()).toBe(401);
  const pack = await (
    await post(
      request,
      '/packs',
      {
        title: 'Uji Paket',
        questions: [
          {
            topic: 'word',
            prompt: 'Format dokumen Word?',
            options: ['docx', 'xlsx', 'pptx', 'mp3'],
            answer: 0,
            explanation: 'Word memakai docx.',
          },
        ],
      },
      teacher,
    )
  ).json();
  expect(pack.id).toBeTruthy();
  expect(
    (await post(request, '/packs', { title: 'Invalid', questions: [{}] }, teacher)).status(),
  ).toBe(400);
  const room = await (
    await post(
      request,
      '/rooms',
      { name: 'Kelas Uji', topic: 'word', mode: 'quiz', packId: pack.id },
      teacher,
    )
  ).json();
  expect(room.id).toMatch(/^\d{6}$/);
  expect((await post(request, `/rooms/${room.id}/start`, {}, p)).status()).toBe(401);
  await post(request, `/rooms/${room.id}/join`, {}, p);
  expect((await post(request, `/rooms/${room.id}/start`, {}, teacher)).status()).toBe(400);
  await post(request, `/rooms/${room.id}/ready`, {}, p);
  await post(request, `/rooms/${room.id}/start`, {}, teacher);
  await new Promise((resolve) => setTimeout(resolve, 3100));
  const run = await (
    await post(request, '/runs', { mode: 'quiz', topic: 'word', world: 'city', roomId: room.id }, p)
  ).json();
  expect(run.question).toBeTruthy();
  await post(request, `/runs/${run.id}/answers`, { questionId: run.question.id, answer: 0 }, p);
  const ranking = await (await get(request, `/rooms/${room.id}/manage`, teacher)).json();
  expect(ranking.players[0].score).toBe(100);
  const report = await (await get(request, `/rooms/${room.id}/report`, teacher)).json();
  expect(report[0].objectives[0].percent).toBe(100);
  await post(request, `/rooms/${room.id}/end`, {}, teacher);
  expect((await post(request, `/rooms/${room.id}/join`, {}, p)).status()).toBe(404);
});
test('timed tower enforces deadline, server selection, pause and floor change', async ({
  request,
}) => {
  test.setTimeout(60000);
  const token = await player(request);
  let run = await (await post(request, '/runs', { mode: 'tower', topic: 'word' }, token)).json();
  await post(request, `/runs/${run.id}/selection`, { answer: 0 }, token);
  expect(
    (
      await post(
        request,
        `/runs/${run.id}/answers`,
        { questionId: run.question.id, answer: 0 },
        token,
      )
    ).status(),
  ).toBe(409);
  await post(request, `/runs/${run.id}/pause`, {}, token);
  expect((await post(request, `/runs/${run.id}/selection`, { answer: 2 }, token)).status()).toBe(
    409,
  );
  run = await (await post(request, `/runs/${run.id}/resume`, {}, token)).json();
  await new Promise((resolve) => setTimeout(resolve, Math.max(0, run.deadline - Date.now() + 100)));
  const data = await (
    await post(
      request,
      `/runs/${run.id}/answers`,
      { questionId: run.question.id, answer: 3 },
      token,
    )
  ).json();
  // The request cannot replace the selection after the deadline.
  expect(data.result.isCorrect).toBe(true);
  expect(data.session.floor).toBe(2);
  expect(data.session.paused).toBe(true);
});
test('new worlds and playable mode setup render on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /Mainkan Sekarang/ }).click();
  await page.getByRole('button', { name: /Jelajah Dunia/ }).click();
  await expect(page.locator('.world-grid button')).toHaveCount(11);
  await page.getByRole('button', { name: /Samudra/ }).click();
  await page.getByRole('button', { name: /Masuk Kota/ }).click();
  await expect(page.locator('.world-badge')).toContainText('Samudra');
  await page.getByRole('button', { name: 'Peta dunia', exact: true }).click();
  await expect(page.locator('.world-grid')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('bridge, market and detective complete with distinct content', async ({ request }) => {
  const token = await player(request);
  for (const [mode, answers] of [
    ['bridge', [0, 1, 2, 3, 1, 0]],
    ['market', [1, 2, 0]],
    ['detective', [2, 0]],
  ]) {
    let run = await (
      await post(
        request,
        '/runs',
        { mode, topic: mode === 'market' ? 'excel' : 'word', requestId: `${mode}-test` },
        token,
      )
    ).json();
    const again = await (
      await post(request, '/runs', { mode, topic: 'word', requestId: `${mode}-test` }, token)
    ).json();
    expect(again.id).toBe(run.id);
    if (mode === 'market') expect(run.question.prompt).toContain('Pembeli');
    if (mode === 'detective') expect(run.question.prompt).toContain('Laporan');
    for (const answer of answers) {
      const response = await post(
        request,
        `/runs/${run.id}/answers`,
        { questionId: run.question.id, answer },
        token,
      );
      expect(response.ok()).toBe(true);
      run = (await response.json()).session;
    }
    expect(run.completed).toBe(true);
    expect(run.correctCount).toBe(answers.length);
  }
});
test('runner gate uses selected lane, pause and coin collection', async ({ request }) => {
  const token = await player(request);
  let run = await (await post(request, '/runs', { mode: 'runner', topic: 'word' }, token)).json();
  const first = await (await post(request, `/runs/${run.id}/pickup`, { index: 0 }, token)).json();
  expect(first.coins).toBe(1);
  expect(
    (await (await post(request, `/runs/${run.id}/pickup`, { index: 0 }, token)).json()).coins,
  ).toBe(1);
  await post(request, `/runs/${run.id}/selection`, { answer: 0 }, token);
  await new Promise((resolve) => setTimeout(resolve, Math.max(0, run.deadline - Date.now() + 100)));
  const result = await (
    await post(
      request,
      `/runs/${run.id}/answers`,
      { questionId: run.question.id, answer: 1 },
      token,
    )
  ).json();
  expect(result.result.isCorrect).toBe(true);
  expect(result.session.score).toBe(100);
});
test('detective UI requires four clues and reaches a result', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Mainkan Sekarang/ }).click();
  await page.getByRole('button', { name: /Detektif Kota Ilmu/ }).click();
  await page.getByRole('button', { name: 'Mulai permainan', exact: true }).click();
  await expect(page.getByRole('button', { name: /Sudah membaca/ })).toBeDisabled();
  for (const label of ['Surat Bu Sari', 'Catatan operator', 'Berita sekolah', 'Kesaksian warga'])
    await page.getByRole('button', { name: new RegExp(label) }).click();
  await page.getByRole('button', { name: /Sudah membaca/ }).click();
  await page.locator('.quiz-answers button').nth(2).click();
  await page.getByRole('button', { name: 'Lanjut', exact: true }).click();
  await page.locator('.quiz-answers button').nth(0).click();
  await page.getByRole('button', { name: 'Lihat hasil', exact: true }).click();
  await expect(page.locator('.mode-hud')).toContainText('2/2 benar');
});

test('enter, exit and resume an arena without DOM errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: /Mainkan Sekarang/ }).click();
  await page.getByRole('button', { name: /Jembatan Juara/ }).click();
  await page.getByLabel('Materi', { exact: true }).selectOption('word');
  await page.getByRole('button', { name: 'Mulai permainan', exact: true }).click();
  await page.locator('.quiz-answers button').first().click();
  await page.getByRole('button', { name: 'Lanjut', exact: true }).click();
  await expect(page.locator('.mode-hud')).toContainText('SOAL 2/6');
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Keluar', exact: true }).click();
  await page.getByRole('button', { name: /Mainkan Sekarang/ }).click();
  await page.getByRole('button', { name: 'Lanjutkan aktivitas tersimpan', exact: true }).click();
  await expect(page.locator('.mode-hud')).toContainText('SOAL 2/6');
  expect(errors).toEqual([]);
});
