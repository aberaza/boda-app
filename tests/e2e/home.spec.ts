import { expect, test } from '@playwright/test';

test.describe('home experience', () => {
  test('renders the four main slides and language links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.slide')).toHaveCount(4);
    await expect(page.locator('#language-nav a')).toHaveCount(3);
    await expect(page.locator('#slide-nav [data-slide-btn]')).toHaveCount(4);
  });

  test('supports keyboard section navigation on desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'This test targets the desktop controller.');
    await page.goto('/');
    await page.keyboard.press('ArrowDown');
    await expect(page).toHaveURL(/slide=cuando/);
    await page.keyboard.press('j');
    await expect(page).toHaveURL(/slide=donde/);
    await page.keyboard.press('ArrowUp');
    await expect(page).toHaveURL(/slide=cuando/);
  });

  test('opens and closes the Jerez overlay', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-slide-btn="1"]').click();
    await page.locator('[data-open-overlay="jerez"]').click();
    await expect(page.locator('#jerez-detail')).toHaveClass(/is-open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#jerez-detail')).not.toHaveClass(/is-open/);
  });

  test('keeps touch navigation available on coarse pointer projects', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'chromium', 'This test targets touch scroll snap.');
    await page.goto('/');
    await page.locator('#slides-wrap').evaluate((element) => {
      const wrap = element as HTMLElement;
      wrap.scrollTo({ top: wrap.clientHeight, behavior: 'auto' });
    });
    await expect(page).toHaveURL(/slide=cuando/);
  });
});
