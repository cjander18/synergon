// Deliberately paced ~20s single-actor clip for the landing hero: load the
// seeded demo workflow and tour the three-round arc to the ranked outcome.
// Pacing pauses make the video read as a demo, not a work session.
// Prereqs: app served. Run: node .claude/skills/demo-recorder/examples/hero-video.mjs
import { createRecorder } from '../scripts/recorder.mjs';

const baseUrl = process.env.APP_URL ?? 'http://localhost:4173';
const rec = createRecorder({
  name: 'hero-video',
  baseUrl,
  viewport: { width: 1100, height: 720 },
});
const r = await rec;

const pause = (page, ms) => page.waitForTimeout(ms);

await r.step('Dana', 'open the app', async (page) => {
  await page.goto(`${baseUrl}/app.html`);
  await pause(page, 1200);
});

await r.step('Dana', 'load the demo deliberation', async (page) => {
  await page.getByRole('button', { name: 'Load the demo workflow' }).click();
  await page.getByRole('heading', { name: /demo/i }).waitFor();
  await pause(page, 1800);
});

await r.step('Dana', 'round 1: everyone lists risks, deduplicated', async (page) => {
  await page.getByRole('heading', { name: 'Round 1' }).scrollIntoViewIfNeeded();
  await pause(page, 2200);
});

await r.step('Dana', 'round 2: consolidation with support counts', async (page) => {
  await page.getByRole('heading', { name: 'Round 2' }).scrollIntoViewIfNeeded();
  await pause(page, 2200);
});

await r.step('Dana', 'round 3: the ranked outcome', async (page) => {
  await page.getByRole('heading', { name: 'Round 3' }).scrollIntoViewIfNeeded();
  await pause(page, 2600);
});

await r.step('Dana', 'the next round is ready to draft', async (page) => {
  await page.getByRole('button', { name: 'Draft round' }).scrollIntoViewIfNeeded();
  await pause(page, 2000);
});

const { problems } = await r.finish();
process.exit(problems.length > 0 ? 1 : 0);
