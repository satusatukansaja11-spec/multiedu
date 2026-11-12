import { test, expect } from '@playwright/test';
async function enterCity(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Mainkan Sekarang/ }).click();
  await page.getByRole('button', { name: /Jelajah Dunia/ }).click();
  await page.getByRole('button', { name: /Kota Ilmu/ }).click();
  await page.getByLabel('Nama penjelajah').fill('Uji Word');
  await page.getByRole('button', { name: 'Kaos hijau' }).click();
  await page.getByRole('button', { name: /Masuk Kota/ }).click();
}
test('Word adventure: character, NPC, lesson, six questions and result', async ({ page }) => {
  await enterCity(page);
  await expect(page.locator('.game-profile')).toContainText('Uji Word');
  await page.getByRole('button', { name: 'Bicara dengan Bu Sari', exact: true }).click();
  await page.getByRole('button', { name: /Bantu!/ }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /Mulai kuis/ }).click();
  for (const [index, answer] of [0, 1, 2, 3, 1, 0].entries()) {
    await page.locator('.quiz-answers button').nth(answer).click();
    await expect(page.locator('.quiz-feedback')).toContainText('Benar!');
    await page
      .getByRole('button', { name: index === 5 ? 'Lihat hasil' : 'Soal berikutnya' })
      .click();
  }
  await expect(page.getByRole('dialog')).toContainText('600 XP');
  await page.getByRole('button', { name: /Kembali menjelajah/ }).click();
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('office-profile')).xp)).toBe(
    600,
  );
});
test('light theme, volume, mute and keyboard modal persist', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Pengaturan', exact: true }).click();
  await page.getByRole('button', { name: 'Light', exact: true }).click();
  await page.getByLabel(/Volume SFX/).fill('0.2');
  await page.getByRole('button', { name: 'Matikan suara' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Pengaturan', exact: true }).click();
  await expect(page.getByLabel(/Volume SFX/)).toHaveValue('0.2');
  await expect(page.getByRole('button', { name: 'Aktifkan suara' })).toBeVisible();
});
test('mobile exploration and collection are usable without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterCity(page);
  await page.getByRole('button', { name: 'Peta mini', exact: true }).click();
  // Use short movement pulses and let the minimap settle; a held key can
  // overshoot the pickup on slow software-rendered Chromium machines.
  for (let i = 0; i < 15; i++) {
    if (Number(await page.locator('.mini-map').getAttribute('data-x')) < -1.6) break;
    await page.keyboard.down('a');
    await page.waitForTimeout(80);
    await page.keyboard.up('a');
    await page.waitForTimeout(200);
  }
  for (let i = 0; i < 15; i++) {
    if (Number(await page.locator('.mini-map').getAttribute('data-z')) > 3.7) break;
    await page.keyboard.down('s');
    await page.waitForTimeout(80);
    await page.keyboard.up('s');
    await page.waitForTimeout(200);
  }
  await expect
    .poll(async () =>
      page.evaluate(() => JSON.parse(localStorage.getItem('office-profile')).books.length),
    )
    .toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Misi', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Kolektor Buku');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
