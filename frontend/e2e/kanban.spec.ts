import { test, expect } from '@playwright/test';

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('loads board with 5 columns and cards', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Kanban Board');
    
    const columns = page.getByTestId('kanban-column');
    await expect(columns).toHaveCount(5);
    
    await expect(columns.nth(0)).toContainText('Backlog');
    await expect(columns.nth(1)).toContainText('To Do');
    await expect(columns.nth(2)).toContainText('In Progress');
    await expect(columns.nth(3)).toContainText('Review');
    await expect(columns.nth(4)).toContainText('Done');
  });

  test('can delete a card', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    
    const firstColumn = page.getByTestId('kanban-column').first(); // Backlog column
    const deleteButton = firstColumn.locator('button:has-text("Delete")').first();
    await deleteButton.click();
    
    await expect(firstColumn.locator('[data-card-id="research-supabase"]')).not.toBeVisible();
  });

  test('can reorder cards within a column', async ({ page }) => {
    const column = page.getByTestId('kanban-column').nth(1); // To Do column
    const card = column.locator('[data-card-id="setup-nextjs"]').first();
    
    // Drag the card down slightly within the same column to test reordering
    await card.dragTo(column, { targetPosition: { x: 100, y: 200 } });
    
    // Card should still be in the same column
    await expect(column.locator('[data-card-id="setup-nextjs"]')).toBeVisible();
  });

  test('can rename a column', async ({ page }) => {
    const columnHeader = page.locator('h3:has-text("Backlog")').first();
    await columnHeader.click();
    
    const input = page.locator('input[type="text"]');
    await expect(input).toBeVisible();
    
    await input.fill('New Backlog Name');
    await input.press('Enter');
    
    await expect(page.locator('h3:has-text("New Backlog Name")')).toBeVisible();
  });

  test('can add a new card', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add card")').first();
    await addButton.click();
    
    const modal = page.locator('[role="dialog"], .fixed.inset-0');
    await expect(modal).toBeVisible();
    
    await page.fill('input[placeholder="Card title"]', 'New Test Card');
    await page.fill('textarea[placeholder="Add details..."]', 'Test details');
    
    await modal.locator('button:has-text("Add Card")').click();
    
    await expect(modal).not.toBeVisible();
    const firstColumn = page.getByTestId('kanban-column').first();
    await expect(firstColumn.locator('[data-card-id="new-test-card"]').first()).toBeVisible();
  });

  test('uses four responsive content-height columns on wide screens', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const columns = page.getByTestId('kanban-column');
    const firstRow = await Promise.all([0, 1, 2, 3].map((index) => columns.nth(index).boundingBox()));
    const fifthColumn = await columns.nth(4).boundingBox();

    expect(firstRow.every(Boolean)).toBe(true);
    expect(fifthColumn).not.toBeNull();
    expect(new Set(firstRow.map((column) => Math.round(column!.x))).size).toBe(4);
    expect(Math.round(fifthColumn!.y)).toBeGreaterThan(Math.round(firstRow[0]!.y));
    await expect(page.getByTestId('kanban-board')).toHaveCSS('align-items', 'flex-start');
  });

  test('stacks columns into one responsive mobile column', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const columns = page.getByTestId('kanban-column');
    const firstColumn = await columns.first().boundingBox();
    const secondColumn = await columns.nth(1).boundingBox();

    expect(firstColumn).not.toBeNull();
    expect(secondColumn).not.toBeNull();
    expect(Math.round(secondColumn!.x)).toBe(Math.round(firstColumn!.x));
    expect(Math.round(secondColumn!.y)).toBeGreaterThan(Math.round(firstColumn!.y));
    await expect(columns.first()).toBeVisible();
  });

  test('uses two columns per row on tablet screens', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 900 });

    const columns = page.getByTestId('kanban-column');
    const firstColumn = await columns.first().boundingBox();
    const secondColumn = await columns.nth(1).boundingBox();
    const thirdColumn = await columns.nth(2).boundingBox();

    expect(firstColumn).not.toBeNull();
    expect(secondColumn).not.toBeNull();
    expect(thirdColumn).not.toBeNull();
    expect(Math.round(secondColumn!.x)).toBeGreaterThan(Math.round(firstColumn!.x));
    expect(Math.round(thirdColumn!.x)).toBe(Math.round(firstColumn!.x));
    expect(Math.round(thirdColumn!.y)).toBeGreaterThan(Math.round(firstColumn!.y));
  });
});
