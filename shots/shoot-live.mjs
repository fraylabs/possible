import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
await mkdir('shots/out', { recursive: true });
const paths = [['home','/'], ['skills','/skills/'], ['skill','/skills/browser-game-maker/'], ['result','/results/possible-launch-film/'], ['docs','/docs/']];
const browser = await chromium.launch({headless:true});
try {
  for (const [view,width,height] of [['desktop',1440,900], ['mobile',390,844]]) {
    const context = await browser.newContext({viewport:{width,height}});
    for (const [name,path] of paths) {
      const page = await context.newPage();
      const response = await page.goto(`https://possible.sh${path}?nocache=live-proof-20261112`, {waitUntil:'networkidle',timeout:45000});
      if (!response || response.status() !== 200) throw new Error(`${path}: ${response?.status()}`);
      await page.screenshot({path:`shots/out/live-${name}-${view}.png`});
      console.log(`live ${name} ${view} OK`);
      await page.close();
    }
    await context.close();
  }
} finally { await browser.close(); }
