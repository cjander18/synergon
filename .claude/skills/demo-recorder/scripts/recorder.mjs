// Multi-actor demo recorder. Each actor gets an isolated Chromium context —
// the automation equivalent of a separate Chrome window/profile — so
// coordinator and contributors never share storage or session state.
// Produces: numbered full-page screenshots per step, one video per actor,
// captured console/page errors, and a report.md tying it all together.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

export async function createRecorder({ name, baseUrl, outDir, headless = true }) {
  const dir = outDir ?? path.join('demo-recordings', `${name}-${timestamp()}`);
  await mkdir(path.join(dir, 'shots'), { recursive: true });
  await mkdir(path.join(dir, 'video'), { recursive: true });

  const browser = await chromium.launch({ headless });
  const actors = new Map();
  const steps = [];
  const problems = [];
  let shotCount = 0;

  async function actor(actorName) {
    const existing = actors.get(actorName);
    if (existing) return existing.page;
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      recordVideo: { dir: path.join(dir, 'video'), size: { width: 1280, height: 800 } },
    });
    const page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') problems.push(`[${actorName}] console error: ${msg.text()}`);
    });
    page.on('pageerror', (error) => problems.push(`[${actorName}] page error: ${error.message}`));
    actors.set(actorName, { context, page });
    return page;
  }

  // Runs fn (if given) as the named actor, then captures a full-page
  // screenshot and logs the step. Returns the actor's page for direct use.
  async function step(actorName, description, fn) {
    const page = await actor(actorName);
    if (fn) await fn(page);
    const file = path.join('shots', `${String(++shotCount).padStart(3, '0')}-${slug(actorName)}-${slug(description)}.png`);
    await page.screenshot({ path: path.join(dir, file), fullPage: true });
    steps.push({ n: shotCount, actor: actorName, description, file });
    console.log(`  [${shotCount}] ${actorName}: ${description}`);
    return page;
  }

  async function finish() {
    const videos = [];
    for (const [actorName, { context, page }] of actors) {
      const video = page.video();
      await context.close();
      if (video) {
        const file = path.join('video', `${slug(actorName)}.webm`);
        await video.saveAs(path.join(dir, file));
        await video.delete().catch(() => {});
        videos.push({ actor: actorName, file });
      }
    }
    await browser.close();

    const lines = [
      `# Demo recording — ${name}`,
      '',
      `- Recorded: ${new Date().toISOString()}`,
      `- App: ${baseUrl}`,
      `- Actors: ${[...actors.keys()].join(', ')} (one isolated browser context each)`,
      '',
      '## Steps',
      '',
      '| # | Actor | Step | Screenshot |',
      '|---|-------|------|------------|',
      ...steps.map((s) => `| ${s.n} | ${s.actor} | ${s.description} | [${path.basename(s.file)}](${s.file}) |`),
      '',
      '## Videos (one per actor)',
      '',
      ...videos.map((v) => `- ${v.actor}: [${path.basename(v.file)}](${v.file})`),
      '',
      '## Console / page errors observed',
      '',
      ...(problems.length === 0 ? ['None.'] : problems.map((p) => `- ${p}`)),
      '',
    ];
    await writeFile(path.join(dir, 'report.md'), lines.join('\n'));
    console.log(`\nReport: ${path.join(dir, 'report.md')} (${steps.length} steps, ${videos.length} videos, ${problems.length} errors)`);
    return { dir, steps, videos, problems };
  }

  return { actor, step, finish, baseUrl, problems };
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}
