import { expect, test, type Page } from '@playwright/test';

async function navigate(page: Page, key: string) {
  await page.locator('[data-slide-key="' + key + '"]').click();
  await expect(page.locator('#slides-wrap > .slide[aria-hidden="false"]')).toHaveCount(1);
  await expect(page).toHaveURL(new RegExp('slide=' + key));
}

async function expectPanel(page: Page, index: number) {
  const carousel = page.locator('[data-horizontal-carousel]');
  await expect(carousel).toBeVisible();
  await expect(carousel).toHaveAttribute('data-horizontal-index', String(index));
  await expect(carousel.locator('[data-horizontal-panel][aria-hidden="false"]')).toHaveCount(1);
  await expect(carousel.locator('[data-horizontal-dot="' + index + '"]')).toHaveAttribute(
    'aria-current',
    'step',
  );
  await expect
    .poll(() =>
      carousel.evaluate((root, target) => {
        const viewport = root.querySelector('[data-horizontal-viewport]')!.getBoundingClientRect();
        const panels = Array.from(root.querySelectorAll('[data-horizontal-panel]'));
        const active = panels[target as number].getBoundingClientRect();
        const othersAreOutside = panels.every((panel, index) => {
          if (index === target) return true;
          const bounds = panel.getBoundingClientRect();
          return bounds.right <= viewport.left + 2 || bounds.left >= viewport.right - 2;
        });
        return (
          Math.abs(active.left - viewport.left) < 2 &&
          Math.abs(active.width - viewport.width) < 2 &&
          Math.abs(active.top - viewport.top) < 2 &&
          othersAreOutside
        );
      }, index),
    )
    .toBe(true);
}

test.describe('home experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent = 'astro-dev-toolbar { display: none !important; }';
      document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
    });
  });
  test('renders five main sections without a runtime error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await expect(page.locator('#slides-wrap > .slide')).toHaveCount(5);
    await expect(page.locator('#venue-carousel [data-horizontal-panel]')).toHaveCount(5);
    await expect(page.locator('[data-overlay-key="jerez"]')).toHaveCount(0);
    await expect(page.locator('#language-nav a')).toHaveCount(3);
    await expect(page.locator('#slide-nav [data-slide-btn]')).toHaveCount(5);
    await navigate(page, 'donde');
    await expectPanel(page, 0);
    expect(errors).toEqual([]);
  });

  test('buttons and dots change only the horizontal axis; vertical exit and return preserve the panel', async ({
    page,
  }) => {
    await page.goto('/?slide=donde');
    await expectPanel(page, 0);
    await page.locator('[data-horizontal-next]').last().click();
    await expectPanel(page, 1);
    await expect(page).toHaveURL(/slide=donde/);
    await page.locator('[data-horizontal-dot="0"]').click();
    await expectPanel(page, 0);
    await expect(page.locator('[data-horizontal-prev]')).toBeDisabled();
    await page.locator('[data-horizontal-dot="4"]').click();
    await expectPanel(page, 4);
    await expect(page.locator('[data-horizontal-next]').last()).toBeDisabled();
    await navigate(page, 'info');
    await navigate(page, 'donde');
    await expectPanel(page, 4);
    await navigate(page, 'evento');
    await navigate(page, 'donde');
    await expectPanel(page, 4);
  });

  test('keyboard directions use independent axes and do not trap vertical navigation', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?slide=donde');
    await expectPanel(page, 0);
    await page.keyboard.press('ArrowRight');
    await expectPanel(page, 1);
    await page.keyboard.press('ArrowRight');
    await expectPanel(page, 2);
    await page.keyboard.press('ArrowDown');
    await expect(page).toHaveURL(/slide=info/);
    await page.keyboard.press('ArrowUp');
    await expect(page).toHaveURL(/slide=donde/);
    await expectPanel(page, 2);
    await page.keyboard.press('ArrowLeft');
    await expectPanel(page, 1);
    await page.keyboard.press('ArrowUp');
    await expect(page).toHaveURL(/slide=evento/);
  });

  test('all venue and Jerez content is available in one five-panel horizontal flow', async ({
    page,
  }) => {
    await page.goto('/?slide=donde');
    await expectPanel(page, 0);
    const expectedHeadings = [
      'Finca La Carreña',
      'La ciudad',
      'Llegar a Jerez',
      'Alojamiento en Jerez',
      'Alargar la estancia',
    ];
    for (let index = 1; index < expectedHeadings.length; index++) {
      await page.locator('[data-horizontal-next]').last().click();
      await expectPanel(page, index);
      await expect(page.locator('[data-horizontal-panel]').nth(index)).toContainText(
        expectedHeadings[index],
      );
    }
    await expect(page.locator('[data-horizontal-next]').last()).toBeDisabled();
    await expect(page.locator('#jerez-city-map')).toBeAttached();
    await expect(page.locator('#jerez-routes-map')).toBeAttached();
    await expect(page.locator('#jerez-surroundings-map')).toBeAttached();
    await expect(page).toHaveURL(/slide=donde/);
  });

  test('CARTO basemap tile requests include the key parameter', async ({ page }) => {
    const tileRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('.basemaps.cartocdn.com/')) tileRequests.push(request.url());
    });
    await page.goto('/?slide=donde');
    await page.locator('[data-horizontal-dot="1"]').click();
    await expect(page.locator('#jerez-city-map .leaflet-tile').first()).toHaveAttribute(
      'src',
      /\?key=/,
    );
    await expect.poll(() => tileRequests.length).toBeGreaterThan(0);
    for (const tileUrl of tileRequests) {
      const url = new URL(tileUrl);
      expect(url.searchParams.get('key')).toBeTruthy();
      expect(url.searchParams.has('api_key')).toBe(false);
    }
  });

  test('horizontal wheel does not change the main section and vertical wheel can exit it', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Desktop wheel integration');
    await page.goto('/?slide=donde');
    await expectPanel(page, 0);
    await page.waitForTimeout(1000);
    const viewport = page.locator('[data-horizontal-viewport]');
    const bounds = (await viewport.boundingBox())!;
    await page.mouse.move(bounds.x + bounds.width * 0.3, bounds.y + bounds.height * 0.25);
    await page.mouse.wheel(300, 0);
    await expectPanel(page, 1);
    await expect(page).toHaveURL(/slide=donde/);
    await page.waitForTimeout(400);
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(250);
    await page.mouse.wheel(0, 2000);
    await expect(page).toHaveURL(/slide=info/);
  });

  test('mobile Chromium supports native horizontal and vertical swipes', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile-chrome',
      'CDP generates real browser touch input on Chromium',
    );
    await page.goto('/?slide=donde');
    await expectPanel(page, 0);
    const client = await page.context().newCDPSession(page);
    const size = page.viewportSize()!;
    const swipe = async (from: [number, number], to: [number, number]) => {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: from[0], y: from[1] }],
      });
      for (let i = 1; i <= 12; i++) {
        await client.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [
            {
              x: from[0] + ((to[0] - from[0]) * i) / 12,
              y: from[1] + ((to[1] - from[1]) * i) / 12,
            },
          ],
        });
        await page.waitForTimeout(25);
      }
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    await swipe([size.width * 0.65, size.height * 0.25], [size.width * 0.15, size.height * 0.25]);
    await expectPanel(page, 1);
    await expect(page).toHaveURL(/slide=donde/);
    await swipe([size.width * 0.15, size.height * 0.25], [size.width * 0.65, size.height * 0.25]);
    await expectPanel(page, 0);
    // The fixed controls sit outside the panel's inner reading scroll region.
    await swipe([30, size.height - 45], [30, 70]);
    await expect(page).toHaveURL(/slide=info/);
  });

  test('panels remain aligned after resize; inactive panels cannot receive focus', async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?slide=donde');
    await expectPanel(page, 0);
    await page.locator('[data-horizontal-dot="4"]').click();
    await expectPanel(page, 4);
    await page.setViewportSize({ width: 820, height: 560 });
    await expect(page).toHaveURL(/slide=donde/);
    await expect(page.locator('[data-slide-key="donde"]')).toHaveAttribute('aria-current', 'step');
    await expectPanel(page, 4);
    await expect(page.locator('[data-horizontal-panel]').first()).toHaveAttribute('inert', '');
    await page.screenshot({ path: testInfo.outputPath('venue-final-panel.png') });
    await page.locator('[data-horizontal-dot="0"]').click();
    await expectPanel(page, 0);
    await page.screenshot({ path: testInfo.outputPath('venue-first-panel.png') });
  });
});
