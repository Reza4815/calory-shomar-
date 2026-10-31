export default async function run(page) {
  const results = [];
  const widths = [360, 390, 430];

  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 780 });
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.body.innerText.includes("کالری باقی‌مانده"),
      null,
      { timeout: 20000 }
    );
    await page.waitForTimeout(600);

    const check = await page.evaluate(() => {
      const doc = document.documentElement;
      const overflowX = doc.scrollWidth - doc.clientWidth;
      const counts = (t) => document.body.innerText.split(t).length - 1;

      // gauge
      const gaugeSvg = document.querySelector("svg[width='145']");
      const flame = !!(gaugeSvg && gaugeSvg.parentElement.querySelector("[stroke^='#FF7067'], [color='#FF7067']"));

      // font
      const fam = getComputedStyle(document.body).getPropertyValue("--font-vazirmatn");
      const loaded = document.fonts.check(`700 16px ${fam}`);

      // menu elements
      const fab = document.querySelector("button[aria-label='ثبت سریع']");
      return {
        overflowX,
        calLabel: counts("کالری باقی‌مانده"),
        stats: { goal: counts("هدف"), burned: counts("سوزانده"), intake: counts("دریافتی") },
        dots: document.querySelectorAll("[role='tablist'] [role='tab']").length,
        flameCard: flame,
        fontVarSet: !!fam,
        fontLoaded: loaded,
        lang: document.documentElement.lang + "/" + document.documentElement.dir,
        fab: !!fab,
        headerArea: document.querySelector("header")?.getBoundingClientRect().height,
        cardW: document.querySelector("section.rounded-\\[24px\\]")?.getBoundingClientRect().width,
      };
    });

    // open the fab menu and verify structure
    await page.click("button[aria-label='ثبت سریع']");
    await page.waitForFunction(() =>
      document.body.innerText.includes("چی ثبت کنیم؟") &&
      document.querySelector("[role='dialog']")
    );
    await page.waitForTimeout(700);
    const menu = await page.evaluate(() => {
      const dialog = document.querySelector("div[role='dialog']");
      const buttons = Array.from(dialog.querySelectorAll("button")).filter((b) =>
        b.querySelector("span.h-16, span[class*='h-16']")
      );
      const cs = getComputedStyle(document.body);
      const dialogRect = dialog.getBoundingClientRect();
      const viewport = { w: innerWidth, h: innerHeight };
      const closeBtn = document.querySelector("button[aria-label='بستن']");
      const cb = closeBtn?.getBoundingClientRect();
      return {
        title: document.body.innerText.includes("چی ثبت کنیم؟"),
        subtitle: document.body.innerText.includes("مورد غذایی یا فعالیت امروزت رو انتخاب کن"),
        iconButtons: buttons.length,
        iconSize: buttons[0] ? Math.round(buttons[0].querySelector("span").getBoundingClientRect().width) : 0,
        bodyOverflow: cs.overflow,
        overlayBlur: !!document.querySelector("button[aria-label='بستن منو']"),
        withinViewport: dialogRect.width <= viewport.w + 1 && cb && cb.bottom <= viewport.h && cb.top >= 0,
        closeBtnVisible: !!cb && cb.width === 64,
      };
    });

    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    const closed = await page.evaluate(() => !document.querySelector("div[role='dialog']"));

    results.push({ width: w, ...check, menu, closed, scrollAfterClose: await page.evaluate(() => true) });

    // vertical shot for layout inspection
    await page.screenshot({ path: `qa-${w}.png` });
  }
  return results;
}
