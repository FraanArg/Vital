import { test, expect } from '@playwright/test';

test.describe('logging', () => {
    // These tests require authentication. 
    // We skip them for now until we set up a test user or auth bypass.
    test.skip('should allow logging water', async ({ page }) => {
        await page.goto('/');

        // TODO: Login

        await page.getByRole('button', { name: 'Water' }).click();
        await expect(page.getByText('Water Tracker')).toBeVisible();

        // Add water
        await page.getByRole('button', { name: '+250ml' }).click();

        // Verify toast or update
        await expect(page.getByText('Log saved')).toBeVisible();
    });
});
