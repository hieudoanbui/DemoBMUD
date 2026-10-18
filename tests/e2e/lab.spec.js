import { test, expect } from '@playwright/test';

async function noTechnicalUi(page) {
  await expect(page.locator('body')).not.toContainText(/QueryLab|CyberShield|SQL Query|Inspector|Prepared Statements|DATABASE RESULT|SQL Injection succeeded|EXPOSED BY|Aiven|MySQL|LAB ONLY/);
  await expect(page.getByRole('button', { name: 'Copy SQL' })).toHaveCount(0);
}
async function submitLogin(page, mode) {
  const response = page.waitForResponse((r) => r.url().endsWith(`/api/${mode}/login`) && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  const result = await response;
  expect(await result.json()).not.toHaveProperty('trace');
  return result;
}
async function sampleLogin(page, mode = 'secure') {
  await page.goto('/login');
  await page.getByRole('button', { name: mode === 'secure' ? 'Secure' : 'Vulnerable', exact: true }).click();
  await page.getByRole('button', { name: 'Tài khoản mẫu', exact: true }).click();
  expect((await submitLogin(page, mode)).status()).toBe(200);
  await expect(page.locator('.phone-card')).toHaveCount(6);
}
async function search(page) {
  const response = page.waitForResponse((r) => r.url().includes('/phones/search') && r.request().method() === 'GET');
  await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click();
  const result = await response;
  const data = await result.json();
  expect(data).not.toHaveProperty('trace');
  expect(data).not.toHaveProperty('exposed');
  return data;
}

test('TC13 · login gọn, mặc định Light, PhoneStore và không còn Inspector', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/products');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Đăng nhập', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'PhoneStore — Trang chủ' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 250, 252)');
  const card = await page.locator('.login-card').boundingBox();
  expect(card.width).toBeGreaterThanOrEqual(380);
  expect(card.width).toBeLessThanOrEqual(440);
  expect(Math.abs(card.x + card.width / 2 - 720)).toBeLessThan(2);
  await noTechnicalUi(page);
  await page.screenshot({ path: 'test-results/login-desktop-light.png', fullPage: true });
});

test('SQLi Login/Search vẫn thực thi MySQL; chỉ badge Đang ẩn, đổi tab bỏ dữ liệu cũ, logout', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/login');
  await page.getByRole('button', { name: 'Secure', exact: true }).click();
  await page.getByRole('button', { name: 'Điền mẫu SQLi', exact: true }).click();
  const payload = await page.getByLabel('Username', { exact: true }).inputValue();
  expect((await submitLogin(page, 'secure')).status()).toBe(401);
  await expect(page.getByRole('alert')).toHaveText('Tên đăng nhập hoặc mật khẩu không đúng');
  await page.getByRole('button', { name: 'Vulnerable', exact: true }).click();
  await expect(page.getByLabel('Username', { exact: true })).toHaveValue(payload);
  expect((await submitLogin(page, 'vulnerable')).status()).toBe(200);
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.locator('.account-name')).toHaveText('admin');
  await expect(page.locator('.phone-card')).toHaveCount(6);
  await page.getByRole('button', { name: 'Điền mẫu SQLi', exact: true }).click();
  await expect(page.locator('.hidden-badge')).toHaveCount(0);
  const result = await search(page);
  expect(result.phones.filter((p) => p.status === 'off')).toHaveLength(4);
  await expect(page.locator('.phone-card')).toHaveCount(10);
  await expect(page.getByText('Đang ẩn', { exact: true })).toHaveCount(4);
  await noTechnicalUi(page);
  await page.screenshot({ path: 'test-results/products-hidden-light.png', fullPage: true });
  await page.getByRole('button', { name: 'Secure', exact: true }).click();
  await expect(page.locator('.phone-card')).toHaveCount(6);
  await expect(page.locator('.hidden-badge')).toHaveCount(0);
  await expect(page.getByLabel('Tìm kiếm điện thoại', { exact: true })).toHaveValue('');
  await page.getByRole('button', { name: 'Điền mẫu SQLi', exact: true }).click();
  await search(page);
  await expect(page.getByText('Không tìm thấy sản phẩm', { exact: true })).toBeVisible();
  await expect(page.locator('.hidden-badge')).toHaveCount(0);
  await page.getByRole('button', { name: 'Tìm kiếm mẫu', exact: true }).click();
  await search(page);
  await expect(page.locator('.phone-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/products');
  await expect(page).toHaveURL(/\/login$/);
  expect(errors).toEqual([]);
});

for (const mode of ['vulnerable', 'secure']) {
  test(`tài khoản mẫu ${mode}, tìm iPhone đúng, reload giữ session`, async ({ page }) => {
    await sampleLogin(page, mode);
    await page.getByRole('button', { name: mode === 'secure' ? 'Secure' : 'Vulnerable', exact: true }).click();
    await expect(page.locator('.phone-card')).toHaveCount(6);
    await page.getByRole('button', { name: 'Tìm kiếm mẫu', exact: true }).click();
    const result = await search(page);
    expect(result.count).toBe(2);
    expect(result.phones.every((p) => p.status === 'on' && p.name.includes('iPhone'))).toBe(true);
    await expect(page.locator('.phone-card')).toHaveCount(2);
    await page.reload();
    await expect(page.locator('.phone-card')).toHaveCount(6);
    await noTechnicalUi(page);
  });
}

test('theme thay đổi màu toàn trang, giữ khi refresh/chuyển route; responsive 320–1440px', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/login');
  await page.getByRole('button', { name: 'Bật Dark Mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(17, 24, 39)');
  // The click leaves the pointer on the toggle: verify hover, then its base color.
  await expect(page.locator('.theme-toggle')).toHaveCSS('background-color', 'rgb(41, 52, 69)');
  await page.mouse.move(0, 0);
  for (const selector of ['.site-header', '.login-card', '#username', '.theme-toggle']) {
    await expect(page.locator(selector)).toHaveCSS('background-color', 'rgb(31, 41, 55)');
  }
  await expect(page.locator('.login-submit')).toHaveCSS('background-color', 'rgb(59, 130, 246)');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Bật Light Mode' })).toBeVisible();
  await page.screenshot({ path: 'test-results/login-desktop-dark.png', fullPage: true });
  await sampleLogin(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  for (const selector of ['.site-header', '.phone-card:first-child', '.search-panel', '#phone-search']) {
    await expect(page.locator(selector)).toHaveCSS('background-color', 'rgb(31, 41, 55)');
  }
  await page.screenshot({ path: 'test-results/products-desktop-dark.png', fullPage: true });
  await page.getByRole('button', { name: 'Bật Light Mode' }).click();
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 250, 252)');
  await expect(page.locator('.phone-card:first-child')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.screenshot({ path: 'test-results/products-desktop-light.png', fullPage: true });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.phone-card')).toHaveCount(6);
  for (const [width, columns] of [[1440, 4], [768, 2], [390, 2], [320, 1]]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('.phone-grid').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(columns);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/products-mobile-light.png', fullPage: true });
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: 'Bật Dark Mode' })).toBeVisible();
  await page.screenshot({ path: 'test-results/login-mobile-light.png', fullPage: true });
  await noTechnicalUi(page);
});

test('hiện/ẩn password và thiếu kết nối báo lỗi ngắn, không render debug', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Tài khoản mẫu', exact: true }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: 'Hiện mật khẩu', exact: true }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ẩn mật khẩu', exact: true }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'password');
  // Simulate a transport outage only, never a fake DB success or search result.
  await page.route('**/api/vulnerable/login', (route) => route.abort('connectionrefused'));
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Có lỗi xảy ra, vui lòng thử lại');
  await noTechnicalUi(page);
});
