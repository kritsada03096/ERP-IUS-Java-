// Run against the LOCAL demo only; creates a purchase request for demonstration.
// Setup: npm install --prefix .tools/browser playwright
const { chromium } = require('../.tools/browser/node_modules/playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const reason = 'ทดสอบ workflow ผ่านเบราว์เซอร์ ' + Date.now();
  async function login(username) {
    await page.goto('http://localhost:4200/login');
    await page.getByLabel('ชื่อผู้ใช้', { exact: true }).fill(username);
    await page.getByLabel('รหัสผ่าน', { exact: true }).fill(process.env.DEMO_PASSWORD || 'LocalDemo123!');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ →', exact: true }).click();
    await page.waitForURL('**/dashboard');
    await page.locator('.stats').waitFor();
  }
  async function logout() {
    await page.getByRole('button', { name: 'ออกจากระบบ', exact: true }).click();
    await page.waitForURL('**/login');
  }
  try {
    await login('employee.it');
    await page.getByRole('link', { name: 'ใบขอซื้อ', exact: false }).first().click();
    await page.getByRole('button', { name: '+ สร้างใบขอซื้อ', exact: true }).click();
    await page.getByLabel('เหตุผลในการขอซื้อ').fill(reason);
    const product = page.getByRole('combobox').first();
    const value = await product.locator('option').nth(1).getAttribute('value');
    await product.selectOption(value);
    await page.getByLabel('จำนวน', { exact: true }).fill('2');
    await page.getByRole('button', { name: 'บันทึกฉบับร่าง', exact: true }).click();
    await page.getByText('บันทึกฉบับร่างแล้ว ตรวจสอบรายละเอียดก่อนกดส่งอนุมัติ', { exact: true }).waitFor();
    const number = await page.locator('.detail-panel .document-number').textContent();
    const row = page.locator('tbody tr').filter({ hasText: number });
    await row.getByRole('button', { name: 'ส่งอนุมัติ', exact: true }).click();
    await page.getByText('ส่งใบขอซื้อให้ผู้อนุมัติแล้ว', { exact: true }).waitFor();
    await logout();
    await login('manager.hr');
    await page.getByRole('link', { name: 'อนุมัติเอกสาร', exact: false }).click();
    await page.getByRole('heading', { name: 'ไม่มีรายการรอพิจารณา', exact: true }).waitFor();
    assert.equal(await page.locator('.approval-card').filter({ hasText: number }).count(), 0);
    await logout();
    await login('manager.it');
    await page.getByRole('link', { name: 'อนุมัติเอกสาร', exact: false }).click();
    const card = page.locator('.approval-card').filter({ hasText: number });
    await card.getByLabel('ความเห็นประกอบการพิจารณา').fill('ตรวจสอบแล้ว อนุมัติสำหรับการทดสอบ');
    await card.getByRole('button', { name: '✓ อนุมัติ', exact: true }).click();
    await page.getByText('อนุมัติใบขอซื้อแล้ว', { exact: true }).waitFor();
    await logout();
    await login('employee.it');
    await page.screenshot({ path: path.resolve('.tools/dashboard-preview.png'), fullPage: true });
    await page.getByRole('link', { name: 'ใบขอซื้อ', exact: false }).first().click();
    const approvedRow = page.locator('tbody tr').filter({ hasText: number });
    await approvedRow.getByText('อนุมัติแล้ว', { exact: true }).waitFor();
    await approvedRow.getByRole('button', { name: 'รายละเอียด', exact: true }).click();
    await page.locator('.detail-panel').getByText('ตรวจสอบแล้ว อนุมัติสำหรับการทดสอบ', { exact: true }).waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.resolve('.tools/mobile-preview.png'), fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Mobile page must not overflow horizontally');
    await page.reload();
    await page.locator('tbody tr').filter({ hasText: number }).getByText('อนุมัติแล้ว', { exact: true }).waitFor();
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ result: 'PASS', document: number, checks: ['login', 'create draft', 'submit', 'department isolation', 'approve', 'history', 'session restore', 'mobile layout'], screenshots: ['.tools/dashboard-preview.png', '.tools/mobile-preview.png'] }, null, 2));
  } catch (error) {
    await page.screenshot({ path: path.resolve('.tools/browser-failure.png'), fullPage: true });
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
