import { test, expect } from '@playwright/test';

test.describe('Dice Rolling Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to fully load
    await page.waitForSelector('.dice-roller');
  });

  test('should display the dice roller interface', async ({ page }) => {
    await expect(page.locator('.dice-roller h2')).toBeVisible();
    await expect(page.locator('button.roll-button')).toBeVisible();
  });

  test('should roll a single d20', async ({ page }) => {
    // Default is 1d20, so just click roll
    await page.click('button.roll-button');

    // Check that a result appears in history
    await expect(page.locator('app-roll-result-detail').first()).toBeVisible();
  });

  test('should change dice count and roll', async ({ page }) => {
    // Find the count input and change it
    const countInput = page.locator('app-dice-group-form input[type="number"]').first();
    await countInput.clear();
    await countInput.fill('3');

    // Click roll
    await page.click('button.roll-button');

    // Verify a result appears
    await expect(page.locator('app-roll-result-detail').first()).toBeVisible();
  });

  test('should change dice type and roll', async ({ page }) => {
    // Select d6 from the dropdown
    const diceTypeSelect = page.locator('app-dice-group-form select').first();
    await diceTypeSelect.selectOption('6');

    // Click roll
    await page.click('button.roll-button');

    // Verify a result appears
    await expect(page.locator('app-roll-result-detail').first()).toBeVisible();
  });

  test('should add and remove dice groups', async ({ page }) => {
    // Initially should have 1 group
    await expect(page.locator('app-dice-group-form')).toHaveCount(1);

    // Add a group
    await page.click('button.add-group-button');
    await expect(page.locator('app-dice-group-form')).toHaveCount(2);

    // Remove group button should appear
    await expect(page.locator('button.remove-group-button').first()).toBeVisible();

    // Remove the second group
    await page.locator('button.remove-group-button').last().click();
    await expect(page.locator('app-dice-group-form')).toHaveCount(1);
  });

  test('should roll with modifier', async ({ page }) => {
    // Find modifier input (it's a custom component)
    const modifierInput = page.locator('app-modifier-input input[type="number"]');
    await modifierInput.clear();
    await modifierInput.fill('5');

    // Roll
    await page.click('button.roll-button');

    // Verify a result appears
    await expect(page.locator('app-roll-result-detail').first()).toBeVisible();
  });

  test('should show advantage/disadvantage for d20 rolls', async ({ page }) => {
    // Default is d20, so advantage selector should be visible
    await expect(page.locator('select[formcontrolname="advantage"]')).toBeVisible();

    // Select advantage
    await page.locator('select[formcontrolname="advantage"]').selectOption('advantage');

    // Roll
    await page.click('button.roll-button');

    // Verify a result appears
    await expect(page.locator('app-roll-result-detail').first()).toBeVisible();
  });

  test('should hide advantage/disadvantage for non-d20 rolls', async ({ page }) => {
    // Change to d6
    const diceTypeSelect = page.locator('app-dice-group-form select').first();
    await diceTypeSelect.selectOption('6');

    // Advantage selector should not be visible
    await expect(page.locator('select[formcontrolname="advantage"]')).not.toBeVisible();
  });

  test('should display live success probability', async ({ page }) => {
    // Set a target DC
    const dcInput = page.locator('#targetDC');
    await dcInput.clear();
    await dcInput.fill('15');

    // Wait for probability to calculate
    await expect(page.locator('.success-indicator')).toBeVisible();
    await expect(page.locator('.success-value')).toContainText('%');
  });

  test('should repeat last roll', async ({ page }) => {
    // First, make a roll
    await page.click('button.roll-button');
    await expect(page.locator('app-roll-result-detail').first()).toBeVisible();

    // Now repeat button should be enabled
    const repeatButton = page.locator('button.repeat-button');
    await expect(repeatButton).toBeEnabled();

    // Click repeat
    await repeatButton.click();

    // Should have two results now
    await expect(page.locator('app-roll-result-detail')).toHaveCount(2);
  });

  test('should use custom dice sides', async ({ page }) => {
    // Click custom toggle button
    await page.locator('button.custom-toggle').click();

    // Find the custom sides input and enter a value
    const customInput = page.locator('.custom-sides-input');
    await customInput.clear();
    await customInput.fill('17');

    // Roll
    await page.click('button.roll-button');

    // Verify a result appears
    await expect(page.locator('app-roll-result-detail').first()).toBeVisible();
  });

  test('should enable keep/drop functionality', async ({ page }) => {
    // Change count to 4 (to make keep/drop meaningful)
    const countInput = page.locator('app-dice-group-form input[type="number"]').first();
    await countInput.clear();
    await countInput.fill('4');

    // Enable keep/drop
    await page.locator('.keep-drop-toggle input[type="checkbox"]').check();

    // Keep/drop section should appear
    await expect(page.locator('.keep-drop-section')).toBeVisible();

    // Select "drop lowest"
    await page.locator('.keep-drop-section select').selectOption('drop_lowest');

    // Roll
    await page.click('button.roll-button');

    // Verify a result appears
    await expect(page.locator('app-roll-result-detail').first()).toBeVisible();
  });
});
