// Mobile design pass: the whole loop at a phone viewport (390x844, iPhone-ish).
// Contributors overwhelmingly open invitation links on phones; the coordinator
// console should at least be workable there too.
// Prereqs: app served. Run: node .claude/skills/demo-recorder/examples/mobile-pass.mjs
import { createRecorder } from '../scripts/recorder.mjs';

const baseUrl = process.env.APP_URL ?? 'http://localhost:4173';
const rec = await createRecorder({
  name: 'mobile-pass',
  baseUrl,
  viewport: { width: 390, height: 844 },
});

const danaPage = await rec.step('Dana', 'console on a phone: create workflow', async (page) => {
  await page.goto(`${baseUrl}/app.html`);
  await page.getByLabel('Title').fill('Mobile check');
  await page.getByLabel(/participants/i).fill('Ana');
  await page.getByRole('button', { name: 'Create workflow' }).click();
  await page.getByRole('heading', { name: 'Mobile check' }).waitFor();
});

await rec.step('Dana', 'draft and issue on a phone', async (page) => {
  await page.getByLabel('Prompt').fill('List the top risks');
  await page.getByRole('button', { name: 'Draft round' }).click();
  await page.getByRole('button', { name: 'Issue round' }).click();
  await page.locator('.invitation').first().waitFor();
});

const invitation = {
  url: await danaPage.locator('.invitation a').first().getAttribute('href'),
  password: (await danaPage.locator('.invitation code').first().innerText()).trim(),
};

await rec.step('Sam', 'invitation on a phone: locked view', async (page) => {
  await page.goto(invitation.url);
});

await rec.step('Sam', 'unlock and answer on a phone', async (page) => {
  await page.getByLabel('Password').fill(invitation.password);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await page.getByLabel(/your answer/i).fill('vendor lock-in\nburnout');
  await page.getByRole('button', { name: 'Encrypt response' }).click();
  await page.getByLabel(/your encrypted response/i).waitFor();
});

await rec.step('Sam', 'encrypted response with copy button', async () => {});

const { problems } = await rec.finish();
process.exit(problems.length > 0 ? 1 : 0);
