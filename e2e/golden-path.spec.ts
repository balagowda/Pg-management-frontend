import { expect, test } from '@playwright/test';

// Requires the pg-backend docker-compose stack running at
// http://localhost:8080 (see README "Running the E2E suite"). This is the
// web equivalent of the backend's own Section 1 contract test — it proves
// the two projects actually integrate, not just that each compiles alone.
test('register, build out a PG, and take a guest from PENDING to PAID', async ({ page }) => {
  const runId = Date.now();
  const email = `e2e-${runId}@example.com`;

  await page.goto('/register');
  await page.getByLabel('Name').fill('E2E Owner');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  // Create PG
  await page.goto('/pgs');
  await page.getByRole('button', { name: 'Add PG' }).click();
  await page.getByLabel('Name').fill('Sunrise PG');
  await page.getByLabel('Address').fill('12 MG Road');
  await page.getByLabel('City').fill('Bengaluru');
  await page.getByRole('button', { name: 'Create PG' }).click();
  await expect(page.getByText('Sunrise PG')).toBeVisible();

  // Create room
  await page.getByText('Sunrise PG').click();
  await expect(page).toHaveURL(/\/pgs\//);
  await page.getByRole('button', { name: 'Add room' }).click();
  await page.getByLabel('Room number').fill('101');
  await page.getByLabel('Capacity').fill('2');
  await page.getByRole('button', { name: 'Add room' }).click();
  await expect(page.getByText('101')).toBeVisible();

  // Create guest — assert a PENDING payment appears
  await page.goto('/guests');
  await page.getByRole('button', { name: 'Add guest' }).click();
  await page.getByText('Select PG').click();
  await page.getByRole('option', { name: 'Sunrise PG' }).click();
  await page.getByText('Select room').click();
  await page.getByRole('option', { name: '101' }).click();
  await page.getByLabel('Name').fill('Rahul Sharma');
  await page.getByLabel('Phone').fill('9876543210');
  await page.getByLabel('Monthly rent').fill('10000');
  await page.getByLabel('Deposit').fill('20000');
  await page.getByLabel('Due day').fill('5');
  await page.getByRole('button', { name: 'Add guest' }).click();

  await page.getByText('Rahul Sharma').click();
  await expect(page).toHaveURL(/\/guests\//);
  await expect(page.getByText('Pending')).toBeVisible();

  // Record a partial payment — status becomes PARTIAL, amount accumulates
  await page.getByRole('button', { name: 'Record payment' }).click();
  await page.getByLabel('Amount being paid now').fill('4000');
  await page.getByRole('button', { name: 'Record payment' }).click();
  await expect(page.getByText('Partial')).toBeVisible();
  await expect(page.getByText('₹4,000')).toBeVisible();

  // Record the remainder — status becomes PAID
  await page.getByRole('button', { name: 'Record payment' }).click();
  await page.getByLabel('Amount being paid now').fill('6000');
  await page.getByRole('button', { name: 'Record payment' }).click();
  await expect(page.getByText('Paid')).toBeVisible();

  // Dashboard reflects the numbers
  await page.goto('/dashboard');
  await expect(page.getByText('Revenue this month')).toBeVisible();
});
