const puppeteer = require('c:/Users/LENOVO/Downloads/vela-portfolio/node_modules/puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  await page.goto('file:///C:/Users/LENOVO/Downloads/vela-portfolio/book.html', { waitUntil: 'load' });

  const info = await page.evaluate(() => {
    const ids = ['date', 'time', 'guests', 'area', 'name', 'phone', 'email', 'notes'];
    return ids.map(id => {
      const el = document.getElementById(id);
      if (!el) return { id, missing: true };
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        id,
        tagName: el.tagName,
        type: el.type,
        rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
        display: style.display,
        visibility: style.visibility,
        pointerEvents: style.pointerEvents,
        className: el.className
      };
    });
  });

  console.log('Fields info:', JSON.stringify(info, null, 2));

  // Now let's test clicking on #name
  console.log('Testing click on #name...');
  await page.click('#name');
  const nameActive = await page.evaluate(() => document.activeElement.id);
  console.log('Active element after page.click(#name):', nameActive);

  // Check computed styles on #name and its parent .field
  const nameStyles = await page.evaluate(() => {
    const input = document.getElementById('name');
    const field = input.closest('.field');
    const label = field.querySelector('label');
    return {
      inputBg: window.getComputedStyle(input).backgroundColor,
      inputBorderBottom: window.getComputedStyle(input).borderBottomColor,
      inputBoxShadow: window.getComputedStyle(input).boxShadow,
      labelColor: window.getComputedStyle(label).color,
      fieldFocusWithin: field.matches(':focus-within')
    };
  });
  console.log('nameStyles after click:', nameStyles);

  await browser.close();
})();
