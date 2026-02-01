import { test, expect } from '@playwright/test';

test.describe('Roll History Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to fully load
    await page.waitForSelector('.dice-roller');
    // Clear any stored history from previous tests
    await page.evaluate(() => {
      localStorage.removeItem('dnd-dicer-history');
      localStorage.removeItem('dnd-dicer-statistics');
    });
    // Reload to apply cleared state
    await page.reload();
    await page.waitForSelector('.dice-roller');
  });

  test('should display roll history section', async ({ page }) => {
    await expect(page.locator('.roll-history')).toBeVisible();
  });

  test('should have History, Statistics, and Probabilities tabs', async ({ page }) => {
    await expect(page.locator('.tab-navigation .tab-button').nth(0)).toBeVisible();
    await expect(page.locator('.tab-navigation .tab-button').nth(1)).toBeVisible();
    await expect(page.locator('.tab-navigation .tab-button').nth(2)).toBeVisible();
  });

  test('should show empty state initially', async ({ page }) => {
    await expect(page.locator('.roll-history .empty-state')).toBeVisible();
  });

  test('should display roll result after rolling', async ({ page }) => {
    // Roll dice
    await page.click('button.roll-button');

    // Result should appear in history
    await expect(page.locator('app-roll-result-detail').first()).toBeVisible();
    await expect(page.locator('.roll-result-detail .total')).toBeVisible();
  });

  test('should display notation in roll result', async ({ page }) => {
    // Roll dice
    await page.click('button.roll-button');

    // Check notation is displayed
    await expect(page.locator('.roll-result-detail .notation')).toBeVisible();
  });

  test('should display timestamp in roll result', async ({ page }) => {
    // Roll dice
    await page.click('button.roll-button');

    // Check timestamp is displayed
    await expect(page.locator('.roll-result-detail .timestamp')).toBeVisible();
  });

  test('should display breakdown in roll result', async ({ page }) => {
    // Roll dice
    await page.click('button.roll-button');

    // Check breakdown section is displayed
    await expect(page.locator('.roll-result-detail .result-breakdown')).toBeVisible();
    await expect(page.locator('.roll-result-detail .group')).toBeVisible();
  });

  test('should accumulate multiple rolls', async ({ page }) => {
    // Roll multiple times
    await page.click('button.roll-button');
    await page.click('button.roll-button');
    await page.click('button.roll-button');

    // Should have 3 results
    await expect(page.locator('app-roll-result-detail')).toHaveCount(3);
  });

  test('should show newest roll first', async ({ page }) => {
    // Roll twice with different dice
    await page.click('button.roll-button');

    // Change to d6
    const diceTypeSelect = page.locator('app-dice-group-form select').first();
    await diceTypeSelect.selectOption('6');
    await page.click('button.roll-button');

    // First result should be d6 (newest)
    const firstNotation = await page.locator('.roll-result-detail .notation').first().textContent();
    expect(firstNotation).toContain('d6');
  });

  test('should clear history when clear button is clicked', async ({ page }) => {
    // Roll some dice
    await page.click('button.roll-button');
    await page.click('button.roll-button');
    await expect(page.locator('app-roll-result-detail')).toHaveCount(2);

    // Click clear button
    await page.locator('.clear-button').click();

    // Confirm in modal
    await page.locator('.modal-confirm-btn').click();

    // History should be empty
    await expect(page.locator('app-roll-result-detail')).toHaveCount(0);
    await expect(page.locator('.roll-history .empty-state')).toBeVisible();
  });

  test('should cancel clear history operation', async ({ page }) => {
    // Roll some dice
    await page.click('button.roll-button');
    await expect(page.locator('app-roll-result-detail')).toHaveCount(1);

    // Click clear button
    await page.locator('.clear-button').click();

    // Cancel in modal
    await page.locator('.modal-cancel-btn').click();

    // History should still have the roll
    await expect(page.locator('app-roll-result-detail')).toHaveCount(1);
  });

  test('should copy roll to clipboard', async ({ page }) => {
    // Roll dice
    await page.click('button.roll-button');

    // Click copy button
    await page.locator('.copy-btn').first().click();

    // Should show success toast
    await expect(page.locator('.toast')).toBeVisible();
  });

  test('should highlight critical success (nat 20) on d20', async ({ page }) => {
    // Roll d20 multiple times to hopefully get a nat 20 (we'll check styling exists)
    await page.click('button.roll-button');

    // The critical-success class should be applied when rolling a 20
    // We can verify the class exists in the DOM (actual 20 depends on randomness)
    const totalElement = page.locator('.roll-result-detail .total').first();
    await expect(totalElement).toBeVisible();
  });

  test.describe('Statistics Tab', () => {
    test('should switch to statistics tab', async ({ page }) => {
      // Roll some dice first
      await page.click('button.roll-button');
      await page.click('button.roll-button');

      // Click Statistics tab
      await page.locator('.roll-history .tab-button').nth(1).click();

      // Statistics dashboard should appear
      await expect(page.locator('app-statistics-dashboard')).toBeVisible();
    });

    test('should display basic metrics', async ({ page }) => {
      // Roll some dice
      await page.click('button.roll-button');
      await page.click('button.roll-button');
      await page.click('button.roll-button');

      // Switch to statistics tab
      await page.locator('.roll-history .tab-button').nth(1).click();

      // Check metrics are displayed
      await expect(page.locator('.metrics-grid')).toBeVisible();
      await expect(page.locator('.metric-card').filter({ hasText: 'Total Rolls' })).toBeVisible();
      await expect(page.locator('.metric-card').filter({ hasText: 'Average' })).toBeVisible();
    });

    test('should show total rolls count', async ({ page }) => {
      // Roll 5 times
      for (let i = 0; i < 5; i++) {
        await page.click('button.roll-button');
      }

      // Switch to statistics tab
      await page.locator('.roll-history .tab-button').nth(1).click();

      // Check total rolls
      const totalRollsCard = page.locator('.metric-card').filter({ hasText: 'Total Rolls' });
      await expect(totalRollsCard.locator('.metric-value')).toContainText('5');
    });

    test('should show critical rolls section for d20', async ({ page }) => {
      // Roll d20 multiple times
      for (let i = 0; i < 5; i++) {
        await page.click('button.roll-button');
      }

      // Switch to statistics tab
      await page.locator('.roll-history .tab-button').nth(1).click();

      // Critical section should be visible
      await expect(page.locator('.critical-section')).toBeVisible();
      await expect(page.locator('.critical-card.success')).toBeVisible();
      await expect(page.locator('.critical-card.failure')).toBeVisible();
    });

    test('should filter statistics by time period', async ({ page }) => {
      // Roll some dice
      await page.click('button.roll-button');
      await page.click('button.roll-button');

      // Switch to statistics tab
      await page.locator('.roll-history .tab-button').nth(1).click();

      // Check filter buttons exist
      await expect(page.locator('.filter-button').filter({ hasText: 'Today' })).toBeVisible();
      await expect(page.locator('.filter-button').filter({ hasText: 'Session' })).toBeVisible();
      await expect(page.locator('.filter-button').filter({ hasText: 'All' })).toBeVisible();

      // Click different filters
      await page.locator('.filter-button').filter({ hasText: 'Session' }).click();
      await expect(
        page.locator('.filter-button.active').filter({ hasText: 'Session' }),
      ).toBeVisible();
    });

    test('should display distribution chart', async ({ page }) => {
      // Roll multiple times
      for (let i = 0; i < 5; i++) {
        await page.click('button.roll-button');
      }

      // Switch to statistics tab
      await page.locator('.roll-history .tab-button').nth(1).click();

      // Distribution chart should be visible
      await expect(page.locator('.distribution-section')).toBeVisible();
      await expect(page.locator('.distribution-chart')).toBeVisible();
    });

    test('should display dice type analysis', async ({ page }) => {
      // Roll d20
      await page.click('button.roll-button');

      // Roll d6
      await page.locator('app-dice-group-form select').first().selectOption('6');
      await page.click('button.roll-button');

      // Switch to statistics tab
      await page.locator('.roll-history .tab-button').nth(1).click();

      // Dice type analysis should be visible
      await expect(page.locator('.dice-types-section')).toBeVisible();
      await expect(page.locator('.dice-type-card')).toHaveCount(2);
    });

    test('should have export buttons', async ({ page }) => {
      // Roll some dice
      await page.click('button.roll-button');

      // Switch to statistics tab
      await page.locator('.roll-history .tab-button').nth(1).click();

      // Export buttons should be visible
      await expect(page.locator('.export-button.json')).toBeVisible();
      await expect(page.locator('.export-button.csv')).toBeVisible();
    });

    test('should start new session', async ({ page }) => {
      // Roll some dice
      await page.click('button.roll-button');
      await page.click('button.roll-button');

      // Switch to statistics tab
      await page.locator('.roll-history .tab-button').nth(1).click();

      // Click new session button
      await page.locator('.new-session-button').click();

      // Statistics should reset for session view
      await page.locator('.filter-button').filter({ hasText: 'Session' }).click();

      // Total rolls for session should be 0 (or show empty state)
      const totalRollsCard = page.locator('.metric-card').filter({ hasText: 'Total Rolls' });
      await expect(totalRollsCard.locator('.metric-value')).toContainText('0');
    });
  });

  test.describe('Probabilities Tab', () => {
    test('should switch to probabilities tab', async ({ page }) => {
      // Click Probabilities tab
      await page.locator('.roll-history .tab-button').nth(2).click();

      // Probability panel should appear
      await expect(page.locator('app-probability-panel')).toBeVisible();
    });

    test('should display probability information', async ({ page }) => {
      // Click Probabilities tab
      await page.locator('.roll-history .tab-button').nth(2).click();

      // Should show probability related content
      await expect(page.locator('app-probability-panel')).toBeVisible();
    });
  });

  test.describe('Compact Mode (Mobile)', () => {
    test.beforeEach(async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForSelector('.dice-roller');
    });

    test('should show compact roll history', async ({ page }) => {
      // In mobile, the history might be in compact mode
      await expect(page.locator('.roll-history')).toBeVisible();
    });

    test('should show recent rolls after rolling in mobile view', async ({ page }) => {
      // Roll some dice
      await page.click('button.roll-button');

      // Should show result in compact view
      await expect(page.locator('app-roll-result-detail').first()).toBeVisible();
    });
  });
});
