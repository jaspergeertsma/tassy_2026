
import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Tasmanië/);
});

test('navigation links work', async ({ page }) => {
    await page.goto('/');

    // Click the Planning link.
    await page.getByRole('link', { name: 'Planning' }).first().click();

    // Expects page to be Planning.
    await expect(page).toHaveURL(/.*planning/);
});
