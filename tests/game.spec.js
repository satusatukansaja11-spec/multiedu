import { test, expect } from '@playwright/test';
test('completes Office practice, persists results, and displays teacher bank', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Petualangan dimulai di sini.' })).toBeVisible();
  await page.getByRole('button', { name: 'Mulai petualangan' }).click();
  await page.getByLabel('Nama penjelajah', { exact: true }).fill('Uji Penjelajah');
  await page.getByRole('button', { name: 'Masuk arena' }).click();
  for (let index = 0; index < 6; index++) {
    await expect(page.locator('.question-card')).toBeVisible();
    await page.locator('.answer').nth([0, 1, 2, 3, 1, 0][index]).click();
    await page.getByRole('button', { name: 'Kunci jawaban' }).click();
    await expect(page.getByRole('status')).toContainText('Benar!');
    await page
      .getByRole('button', { name: index === 5 ? 'Lihat hasil' : 'Soal berikutnya' })
      .click();
  }
  await expect(page.locator('.completion-card')).toContainText('600 XP');
  await page.getByRole('button', { name: 'Papan peringkat' }).click();
  await expect(page.locator('table')).toContainText('Uji Penjelajah');
  await page.reload();
  await page.getByRole('button', { name: 'Ruang guru' }).click();
  await expect(page.locator('.bank-list details')).toHaveCount(18);
  await expect(page.locator('table')).toContainText('Uji Penjelajah');
});
test('mobile selection and guide remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /Microsoft Excel/ }).click();
  await expect(page.locator('.mission-panel h3')).toHaveText('Microsoft Excel');
  await page.getByRole('button', { name: 'Mulai petualangan' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('API validates input and prevents duplicate scoring', async ({ request }) => {
  const invalid = await request.post('/api/sessions', { data: { name: '', topic: 'word' } });
  expect(invalid.status()).toBe(400);
  const created = await request.post('/api/sessions', { data: { name: 'Uji API', topic: 'word' } });
  expect(created.status()).toBe(201);
  const session = await created.json();
  expect(session.question).not.toHaveProperty('answer');
  const payload = { questionId: session.question.id, answer: 0 };
  const first = await request.post(`/api/sessions/${session.id}/answers`, { data: payload });
  expect((await first.json()).session.score).toBe(100);
  const duplicate = await request.post(`/api/sessions/${session.id}/answers`, { data: payload });
  const repeated = await duplicate.json();
  expect(repeated.session.score).toBe(100);
  expect(repeated.session.index).toBe(1);
  const missing = await request.get('/api/sessions/not-a-session');
  expect(missing.status()).toBe(404);
});

test('Excel and PowerPoint can be completed through the API', async ({ request }) => {
  for (const [topic, answers] of [
    ['excel', [2, 1, 2, 3, 1, 0]],
    ['powerpoint', [2, 1, 2, 3, 0, 1]],
  ]) {
    const created = await request.post('/api/sessions', {
      data: { name: 'Uji Penjelajah', topic },
    });
    let session = await created.json();
    for (const answer of answers) {
      const response = await request.post(`/api/sessions/${session.id}/answers`, {
        data: { questionId: session.question.id, answer },
      });
      expect(response.ok()).toBe(true);
      session = (await response.json()).session;
    }
    expect(session.question).toBeNull();
    expect(session.score).toBe(600);
  }
});
