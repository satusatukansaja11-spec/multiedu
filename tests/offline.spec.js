import { test, expect } from '@playwright/test';
test('production game reloads and completes all Office subjects with network disabled', async ({
  page,
  context,
}) => {
  test.setTimeout(120000);
  const apiRequests = [],
    outsideRequests = [],
    errors = [];
  page.on('request', (r) => {
    if (r.url().includes('/api/')) apiRequests.push(r.url());
    if (
      !r.url().startsWith('http://127.0.0.1:4173') &&
      !r.url().startsWith('blob:') &&
      !r.url().startsWith('data:')
    )
      outsideRequests.push(r.url());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: /Mainkan Sekarang/ }).click();
  await page.getByRole('button', { name: /Jelajah Dunia/ }).click();
  await page.getByRole('button', { name: /Kota Ilmu/ }).click();
  await page.getByLabel('Nama penjelajah').fill('Uji Offline');
  await page.getByRole('button', { name: /Masuk Kota/ }).click();
  for (const [topic, answers] of [
    ['word', [0, 1, 2, 3, 1, 0]],
    ['excel', [2, 1, 2, 3, 1, 0]],
    ['powerpoint', [2, 1, 2, 3, 0, 1]],
  ]) {
    await page.getByLabel('Materi gedung').selectOption(topic);
    await page.getByRole('button', { name: /Kunjungi gedung/ }).click();
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /Mulai kuis/ }).click();
    for (const [index, answer] of answers.entries()) {
      await page.locator('.quiz-answers button').nth(answer).click();
      await expect(page.locator('.quiz-feedback')).toContainText('Benar!');
      await page
        .getByRole('button', { name: index === 5 ? 'Lihat hasil' : 'Soal berikutnya', exact: true })
        .click();
    }
    await expect(page.getByRole('dialog')).toContainText('600 XP');
    await page.getByRole('button', { name: /Kembali menjelajah/ }).click();
  }
  await page.reload();
  await expect(page.getByRole('button', { name: /Mainkan Sekarang/ })).toBeEnabled();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('multiedu-offline-v1')).player.xp),
  ).toBe(1800);
  expect(apiRequests).toEqual([]);
  expect(outsideRequests).toEqual([]);
  expect(errors).toEqual([]);
});
