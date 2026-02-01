import { test, expect } from '@playwright/test';

test.describe('Preset Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to fully load
    await page.waitForSelector('.preset-manager');
    // Clear any stored presets from previous tests
    await page.evaluate(() => {
      localStorage.removeItem('dnd-dicer-presets');
    });
    // Reload to apply cleared state
    await page.reload();
    await page.waitForSelector('.preset-manager');
  });

  test('should display the preset manager', async ({ page }) => {
    await expect(page.locator('.preset-manager h2')).toBeVisible();
    await expect(page.locator('.tab-switcher')).toBeVisible();
  });

  test('should have Templates and My Presets tabs', async ({ page }) => {
    await expect(page.locator('.tab-button').filter({ hasText: 'Templates' })).toBeVisible();
    await expect(page.locator('.tab-button').filter({ hasText: 'My Presets' })).toBeVisible();
  });

  test('should default to Templates tab', async ({ page }) => {
    await expect(page.locator('.tab-button.active').filter({ hasText: 'Templates' })).toBeVisible();
    await expect(page.locator('app-template-library')).toBeVisible();
  });

  test('should switch to My Presets tab', async ({ page }) => {
    // Click My Presets tab
    await page.locator('.tab-button').filter({ hasText: 'My Presets' }).click();

    // Should show presets tab content
    await expect(
      page.locator('.tab-button.active').filter({ hasText: 'My Presets' }),
    ).toBeVisible();
    // Should show empty state initially
    await expect(page.locator('.empty-state')).toBeVisible();
  });

  test('should show Save Current button in My Presets tab', async ({ page }) => {
    // Switch to My Presets tab
    await page.locator('.tab-button').filter({ hasText: 'My Presets' }).click();

    // Save button should be visible
    await expect(page.locator('button.save-button')).toBeVisible();
  });

  test('should toggle save form when Save Current is clicked', async ({ page }) => {
    // Switch to My Presets tab
    await page.locator('.tab-button').filter({ hasText: 'My Presets' }).click();

    // Click Save Current
    await page.locator('button.save-button').click();

    // Save form should appear
    await expect(page.locator('.save-form')).toBeVisible();
    await expect(page.locator('.preset-name-input')).toBeVisible();

    // Button should show Cancel
    await expect(page.locator('button.save-button')).toContainText('Cancel');

    // Click Cancel
    await page.locator('button.save-button').click();

    // Form should hide
    await expect(page.locator('.save-form')).not.toBeVisible();
  });

  test('should save a preset', async ({ page }) => {
    // First configure a roll
    const countInput = page.locator('app-dice-group-form input[type="number"]').first();
    await countInput.clear();
    await countInput.fill('2');

    const diceTypeSelect = page.locator('app-dice-group-form select').first();
    await diceTypeSelect.selectOption('6');

    // Switch to My Presets tab
    await page.locator('.tab-button').filter({ hasText: 'My Presets' }).click();

    // Open save form
    await page.locator('button.save-button').click();

    // Enter preset name
    await page.locator('.preset-name-input').fill('Test Preset 2d6');

    // Click Save Preset
    await page.locator('button.confirm-save-button').click();

    // Preset should appear in the list
    await expect(page.locator('.preset-item').filter({ hasText: 'Test Preset 2d6' })).toBeVisible();
  });

  test('should save preset with category', async ({ page }) => {
    // Switch to My Presets tab
    await page.locator('.tab-button').filter({ hasText: 'My Presets' }).click();

    // Open save form
    await page.locator('button.save-button').click();

    // Enter preset name
    await page.locator('.preset-name-input').fill('Damage Roll');

    // Select a category
    await page.locator('.category-chip').filter({ hasText: 'Damage' }).click();

    // Click Save Preset
    await page.locator('button.confirm-save-button').click();

    // Preset should appear with category badge
    await expect(page.locator('.preset-item').filter({ hasText: 'Damage Roll' })).toBeVisible();
    await expect(page.locator('.category-badge').filter({ hasText: 'Damage' })).toBeVisible();
  });

  test('should load a preset', async ({ page }) => {
    // First save a preset
    // Switch to My Presets tab
    await page.locator('.tab-button').filter({ hasText: 'My Presets' }).click();
    await page.locator('button.save-button').click();
    await page.locator('.preset-name-input').fill('Loadable Preset');
    await page.locator('button.confirm-save-button').click();

    // Change the dice config
    const countInput = page.locator('app-dice-group-form input[type="number"]').first();
    await countInput.clear();
    await countInput.fill('5');

    // Now load the preset
    await page
      .locator('.preset-item')
      .filter({ hasText: 'Loadable Preset' })
      .locator('.load-button')
      .click();

    // Wait for toast notification
    await expect(page.locator('.toast').filter({ hasText: 'Loaded preset' })).toBeVisible();
  });

  test('should delete a preset', async ({ page }) => {
    // First save a preset
    await page.locator('.tab-button').filter({ hasText: 'My Presets' }).click();
    await page.locator('button.save-button').click();
    await page.locator('.preset-name-input').fill('Deletable Preset');
    await page.locator('button.confirm-save-button').click();

    // Verify preset is there
    await expect(
      page.locator('.preset-item').filter({ hasText: 'Deletable Preset' }),
    ).toBeVisible();

    // Click delete
    await page
      .locator('.preset-item')
      .filter({ hasText: 'Deletable Preset' })
      .locator('.delete-button')
      .click();

    // Confirm deletion in modal
    await page.locator('.modal-confirm-btn').click();

    // Preset should be gone
    await expect(
      page.locator('.preset-item').filter({ hasText: 'Deletable Preset' }),
    ).not.toBeVisible();
  });

  test('should filter presets by category', async ({ page }) => {
    // Save multiple presets with different categories
    await page.locator('.tab-button').filter({ hasText: 'My Presets' }).click();

    // Save damage preset
    await page.locator('button.save-button').click();
    await page.locator('.preset-name-input').fill('Fireball');
    await page.locator('.category-chip').filter({ hasText: 'Damage' }).click();
    await page.locator('button.confirm-save-button').click();

    // Save combat preset
    await page.locator('button.save-button').click();
    await page.locator('.preset-name-input').fill('Attack Roll');
    await page.locator('.category-chip').filter({ hasText: 'Combat' }).click();
    await page.locator('button.confirm-save-button').click();

    // Both should be visible initially
    await expect(page.locator('.preset-item')).toHaveCount(2);

    // Filter by Damage
    await page.locator('#category-select').selectOption('Damage');
    await expect(page.locator('.preset-item')).toHaveCount(1);
    await expect(page.locator('.preset-item').filter({ hasText: 'Fireball' })).toBeVisible();

    // Filter by Combat
    await page.locator('#category-select').selectOption('Combat');
    await expect(page.locator('.preset-item')).toHaveCount(1);
    await expect(page.locator('.preset-item').filter({ hasText: 'Attack Roll' })).toBeVisible();
  });

  test('should use template from library', async ({ page }) => {
    // Should be on Templates tab by default
    await expect(page.locator('app-template-library')).toBeVisible();

    // Find and click use on a template
    const templateItem = page.locator('.template-item').first();
    await templateItem.locator('.use-button').click();

    // Should show toast notification
    await expect(page.locator('.toast')).toBeVisible();
  });

  test('should copy template to presets', async ({ page }) => {
    // Should be on Templates tab by default
    await expect(page.locator('app-template-library')).toBeVisible();

    // Find and click copy on a template
    const templateItem = page.locator('.template-item').first();
    const templateName = await templateItem.locator('.template-name').textContent();

    await templateItem.locator('.copy-button').click();

    // Should switch to presets tab and show the copied preset
    await expect(
      page.locator('.tab-button.active').filter({ hasText: 'My Presets' }),
    ).toBeVisible();
    await expect(
      page.locator('.preset-item').filter({ hasText: templateName || '' }),
    ).toBeVisible();
  });

  test('should not allow empty preset name', async ({ page }) => {
    await page.locator('.tab-button').filter({ hasText: 'My Presets' }).click();
    await page.locator('button.save-button').click();

    // Leave name empty and try to save
    const saveButton = page.locator('button.confirm-save-button');
    await expect(saveButton).toBeDisabled();
  });
});
