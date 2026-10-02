const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://khy.com/', { waitUntil: 'networkidle' });
  
  const data = await page.evaluate(() => {
    const getStyles = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return {
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        color: s.color,
        backgroundColor: s.backgroundColor,
        padding: s.padding,
        margin: s.margin
      };
    };

    return {
      body: getStyles('body'),
      h1: getStyles('h1'),
      h2: getStyles('h2'),
      header: getStyles('header'),
      button: getStyles('button'),
      components: Array.from(document.querySelectorAll('header, footer, section, .product-card, nav')).map(el => el.tagName + (el.className ? '.' + el.className.split(' ').join('.') : ''))
    };
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
