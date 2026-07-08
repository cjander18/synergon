// End-to-end recording of the canonical Synergon round with two contributors.
// Dana (coordinator) and each Sam run in separate browser contexts — the
// multi-user, multi-"Chrome window" flow. Serves as both the harness's worked
// example and a full-loop regression demo.
//
// Prereqs: app served (e.g. `npm run build && npx vite preview --port 4173`).
// Run:     node .claude/skills/demo-recorder/examples/canonical-round.mjs
import { createRecorder } from '../scripts/recorder.mjs';

const baseUrl = process.env.APP_URL ?? 'http://localhost:4173';
const rec = await createRecorder({ name: 'canonical-round', baseUrl });

// — Dana sets up the deliberation —
await rec.step('Dana', 'opens the empty coordinator console', async (page) => {
  await page.goto(`${baseUrl}/app.html`);
});

await rec.step('Dana', 'creates a workflow with two participants', async (page) => {
  await page.getByLabel('Title').fill('Sprint 12 risks');
  await page.getByLabel(/participants/i).fill('Ana\nBen');
  await page.getByRole('button', { name: 'Create workflow' }).click();
  await page.getByRole('heading', { name: 'Sprint 12 risks' }).waitFor();
});

await rec.step('Dana', 'drafts round 1: list the top risks', async (page) => {
  await page.getByLabel('Prompt').fill('List the top risks to this sprint');
  await page.getByRole('button', { name: 'Draft round' }).click();
  await page.getByRole('button', { name: 'Issue round' }).waitFor();
});

const danaPage = await rec.step('Dana', 'issues the round — links and passwords appear once', async (page) => {
  await page.getByRole('button', { name: 'Issue round' }).click();
  await page.locator('.invitation').nth(1).waitFor();
});

// Lift each invitation's link + password exactly as a human coordinator would.
const invitations = [];
for (const item of await danaPage.locator('.invitation').all()) {
  invitations.push({
    label: (await item.locator('h5').innerText()).trim(),
    url: await item.locator('a').getAttribute('href'),
    password: (await item.locator('code').innerText()).trim(),
  });
}

// — Each contributor answers in their own isolated browser context —
const answers = {
  Ana: 'Vendor lock-in\nteam burnout',
  Ben: 'vendor lock-in\nscope creep',
};
const responses = [];
for (const invitation of invitations) {
  const who = `Sam (${invitation.label})`;
  await rec.step(who, 'opens the invitation link', async (page) => {
    await page.goto(invitation.url);
  });
  await rec.step(who, 'unlocks with the out-of-band password', async (page) => {
    await page.getByLabel('Password').fill(invitation.password);
    await page.getByRole('button', { name: 'Unlock' }).click();
    await page.getByLabel(/your answer/i).waitFor();
  });
  const samPage = await rec.step(who, 'answers and encrypts the response', async (page) => {
    await page.getByLabel(/your answer/i).fill(answers[invitation.label] ?? 'no answer');
    await page.getByRole('button', { name: 'Encrypt response' }).click();
    await page.getByLabel(/your encrypted response/i).waitFor();
  });
  responses.push({
    label: invitation.label,
    password: invitation.password,
    envelope: await samPage.getByLabel(/your encrypted response/i).inputValue(),
  });
}

// — Dana collects and consolidates —
for (const [i, response] of responses.entries()) {
  await rec.step('Dana', `imports ${response.label}'s response`, async (page) => {
    await page.getByLabel(/paste a response envelope/i).fill(response.envelope);
    await page.getByRole('button', { name: 'Import response' }).click();
    await page.getByText(`${i + 1} of 2 responses`).waitFor();
  });
}

await rec.step('Dana', 're-enters passwords and runs consolidation', async (page) => {
  for (const response of responses) {
    await page.getByLabel(`Password for ${response.label}`).fill(response.password);
  }
  await page.getByRole('button', { name: 'Run consolidation' }).click();
  await page.locator('.badge', { hasText: 'Closed' }).waitFor();
});

await rec.step('Dana', 'sees the deduplicated pool and the next draft form', async (page) => {
  await page.getByLabel('Prompt').waitFor();
});

const { problems } = await rec.finish();
process.exit(problems.length > 0 ? 1 : 0);
