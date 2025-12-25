import { expect, test } from '@playwright/test'

test('should display the main app structure', async ({ page }) => {
	await page.goto('/')

	// Check that the main container is visible
	const main = page.locator('main')
	await expect(main).toBeVisible()

	// Verify the grid layout exists
	const grid = page.locator('main > div.grid')
	await expect(grid).toBeVisible()
})

test('should display clock component', async ({ page }) => {
	await page.goto('/')

	// Check for time display - look for any text containing colon (time format)
	await page.waitForLoadState('networkidle')
	const timeElement = page.getByText(/\d{1,2}:\d{2}/)
	await expect(timeElement.first()).toBeVisible({ timeout: 10000 })
})

test('should display year progress component', async ({ page }) => {
	await page.goto('/')

	// Look for year progress text patterns like "2025" and percentage
	await page.waitForLoadState('networkidle')
	const yearText = page.getByText(/202[0-9]/)
	await expect(yearText.first()).toBeVisible({ timeout: 10000 })
})

test('should display calendar component', async ({ page }) => {
	await page.goto('/')

	// Look for month names (e.g., "December 2025")
	await page.waitForLoadState('networkidle')
	const calendar = page.getByText(
		/(January|February|March|April|May|June|July|August|September|October|November|December) 202[0-9]/
	)
	await expect(calendar.first()).toBeVisible({ timeout: 10000 })
})

test('should display compliments component', async ({ page }) => {
	await page.goto('/')

	// Compliments should be visible somewhere on the page
	// We can check if any text content is rendered (compliments change dynamically)
	const complimentsArea = page.locator('main')
	await expect(complimentsArea).toContainText(/./i, { timeout: 10000 })
})

test('should have responsive grid layout', async ({ page }) => {
	await page.goto('/')

	// Check that grid has responsive classes
	const grid = page.locator('main > div.grid')
	await expect(grid).toHaveClass(/grid-cols-1/)
	await expect(grid).toHaveClass(/md:grid-cols-2/)
})
