export default async function run(page) {
  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.innerText.includes("کالری باقی‌مانده"), null, { timeout: 30000 });
  await page.waitForTimeout(500);

  const font = await page.evaluate(() => {
    const fam = getComputedStyle(document.body).getPropertyValue("--font-vazirmatn").trim().replace(/["']/g, "").split(",")[0];
    const probe = [document.body, document.querySelector("h2"), document.querySelector("input"), document.querySelector("header")].filter(Boolean);
    return {
      varValue: fam,
      bodyFamily: getComputedStyle(document.body).fontFamily.slice(0, 80),
      firstFamily: probe.length ? getComputedStyle(probe[0]).fontFamily.slice(0, 80) : null,
      fontsEntries: Array.from(document.fonts).map((f) => ({ fam: f.family, w: f.weight, st: f.status })).slice(0, 12),
      check: document.fonts.check(`700 16px "${fam}"`),
    };
  });

  // icon side check on the progress rows
  const rows = await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll("section")).find((s) => s.querySelector && Array.from(s.querySelectorAll("span[style]")).some((sp) => sp.textContent.length === 1));
    const barRows = Array.from(document.querySelectorAll("span[style*='9B78E8'], span[style*='155,120,232'], span[style*='0 0 12px']")).slice(0, 3);
    return barRows.map((r) => {
      const rect = r.getBoundingClientRect();
      const parent = r.parentElement.getBoundingClientRect();
      return { iconSideRight: rect.left > parent.left + parent.width / 2, iconLeft: Math.round(rect.left), rowRight: Math.round(parent.right), rowW: Math.round(parent.width) };
    });
  });

  // open menu
  await page.click("button[aria-label='ثبت سریع']");
  await page.waitForFunction(() => !!document.querySelector("div[role='dialog']") && document.body.innerText.includes("چی ثبت کنیم؟"));
  await page.waitForTimeout(900);
  await page.screenshot({ path: "qa-menu-open.png" });

  const openState = await page.evaluate(() => {
    const d = document.querySelector("div[role='dialog']");
    const close = document.querySelector("button[aria-label='بستن']");
    const cb = close?.getBoundingClientRect();
    return {
      dialogRect: d ? { w: Math.round(d.getBoundingClientRect().width), h: Math.round(d.getBoundingClientRect().height) } : null,
      closeSize: cb ? { w: Math.round(cb.width), h: Math.round(cb.height), bottom: Math.round(cb.bottom), visible: cb.width > 0 } : null,
      bodyOverflow: getComputedStyle(document.body).overflow,
    };
  });

  // close via the X button
  await page.click("button[aria-label='بستن']");
  await page.waitForTimeout(900);
  const afterClose = await page.evaluate(() => ({
    dialog: !!document.querySelector("div[role='dialog']"),
    bodyOverflow: getComputedStyle(document.body).overflow,
  }));
  await page.screenshot({ path: "qa-menu-closed.png" });

  // now Escape test
  await page.click("button[aria-label='ثبت سریع']");
  await page.waitForFunction(() => !!document.querySelector("div[role='dialog']"));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(900);
  const afterEscape = await page.evaluate(() => ({ dialog: !!document.querySelector("div[role='dialog']") }));

  return { font, rows, openState, afterClose, afterEscape };
}
