import { expect, test } from '@playwright/test';

const makeTab = (id: string, name: string, order: number) => ({
  id,
  name,
  order,
  content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: `${name} payment details` }] }] }
});

test('dragging an inactive currency by its handle preserves selection and saves the order across reload', async ({ page }) => {
  const originalTabs = [makeTab('uah', 'UAH', 0), makeTab('usd', 'USD', 1), makeTab('eur', 'EUR', 2)];
  let saved = {
    id: 'payment-details',
    slug: 'payment-details',
    tabs: originalTabs,
    pdfFile: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  };
  const writes: unknown[] = [];
  let reads = 0;

  // Keep the API boundary deterministic without mocking the page, editor or dnd-kit.
  // This state outlives browser reloads but never touches an actual database.
  await page.route('**/api/graphql', async (route) => {
    const request = route.request().postDataJSON();
    if (request.operationName === 'GetPaymentDetails') {
      reads += 1;
      await route.fulfill({ json: { data: { paymentDetails: saved } } });
    } else if (request.operationName === 'UpdatePaymentDetails') {
      writes.push(request.variables.input);
      saved = {
        ...saved,
        tabs: request.variables.input.tabs.map((tab: typeof originalTabs[number], order: number) => ({ ...tab, order }))
      };
      await route.fulfill({ json: { data: { updatePaymentDetails: saved } } });
    } else {
      throw new Error(`Unexpected GraphQL operation: ${request.operationName}`);
    }
  });

  await page.goto('/');
  const tabs = page.getByRole('button', { name: /^(UAH|USD|EUR)$/ });
  const editor = page.locator('.tiptap');
  const selectedTab = page.getByRole('button', { name: 'Опції реквізиту' }).locator('..');
  await expect(tabs).toHaveText(['UAH', 'USD', 'EUR']);
  await expect(editor).toHaveText('UAH payment details');
  await expect(selectedTab).toContainText('UAH');

  // Drag USD while UAH is selected: a mistaken click on the dragged tab would change selection.
  const source = page.getByRole('button', { name: 'USD', exact: true }).locator('../..').getByRole('button', { name: '', exact: true });
  const target = page.getByRole('button', { name: 'UAH', exact: true });
  const start = await source.boundingBox();
  const end = await target.boundingBox();
  if (!start || !end) throw new Error('Currency handle or target is not visible');
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(start.x + start.width / 2 - 10, start.y + start.height / 2, { steps: 5 });
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 20 });
  await page.mouse.up();

  await expect(tabs).toHaveText(['USD', 'UAH', 'EUR']);
  await expect(editor).toHaveText('UAH payment details');
  await expect(selectedTab).toContainText('UAH');
  expect(writes).toHaveLength(0);

  await page.getByRole('button', { name: 'Зберегти', exact: true }).click();
  await expect(page.getByText('Реквізити успішно збережено', { exact: true })).toBeVisible();
  expect(writes).toEqual([{
    tabs: [originalTabs[1], originalTabs[0], originalTabs[2]].map(({ order: _order, ...tab }) => tab)
  }]);
  await expect(selectedTab).toContainText('UAH');
  await expect(editor).toHaveText('UAH payment details');

  await page.reload();
  await expect(tabs).toHaveText(['USD', 'UAH', 'EUR']);
  expect(reads).toBeGreaterThanOrEqual(2);
  // Reload selects the first saved tab. Each currency must still have its own content.
  await expect(editor).toHaveText('USD payment details');
  for (const name of ['UAH', 'EUR']) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(editor).toHaveText(`${name} payment details`);
  }
});
