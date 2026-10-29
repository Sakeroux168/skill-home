const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', (e) => console.error('页面报错', e.message));
  await p.goto('file://' + path.resolve(__dirname, 'cover.html'));
  await p.waitForFunction('window.done === true');
  for (const k of ['16x9', '3x4']) {
    const url = await p.evaluate((k) => drawCover(k), k);
    fs.writeFileSync(path.resolve(__dirname, 'out', `封面-${k}.png`), Buffer.from(url.split(',')[1], 'base64'));
    console.log('ok', k);
  }
  await b.close();
})();
