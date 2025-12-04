import { expect, test } from '@playwright/test'

test('should display Response header', async ({ page }) => {
	// Go to the app
	await page.goto('/')

	// Check that the Response header is visible
	const responseHeader = page.locator('h1', { hasText: 'API Response' })
	await expect(responseHeader).toBeVisible()

	// Verify the header text content
	await expect(responseHeader).toHaveText('API Response')

	// Verify it's actually an h1 element
	await expect(responseHeader).toHaveRole('heading')
})

test('should show loading state initially', async ({ page }) => {
	// Intercept the API call to slow it down and ensure loading state is visible
	await page.route('**/posts', async (route) => {
		// Add a delay to make loading state more visible
		await new Promise((resolve) => setTimeout(resolve, 1000))
		route.continue()
	})

	// Go to the app
	await page.goto('/')

	// Check that loading text appears initially (with a reasonable timeout)
	const loadingText = page.locator('text=Loading posts...')
	await expect(loadingText).toBeVisible({ timeout: 2000 })
})

test('should eventually load posts data', async ({ page }) => {
	// Go to the app
	await page.goto('/')

	// Wait for loading to disappear (posts should load)
	const loadingText = page.locator('text=Loading posts...')
	await expect(loadingText).toBeHidden({ timeout: 15_000 })

	// Verify that some post content appears in list items
	const postList = page.locator('ul')
	await expect(postList).toBeVisible()

	const postElements = page.locator('li')
	await expect(postElements.first()).toBeVisible()

	// Verify we have multiple posts loaded
	const postCount = await postElements.count()
	expect(postCount).toBeGreaterThan(0)
})
