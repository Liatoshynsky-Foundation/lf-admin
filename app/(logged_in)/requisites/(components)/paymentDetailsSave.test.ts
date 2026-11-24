import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';

import { buildPaymentDetailsInput, getSaveErrorMessage } from './paymentDetailsSave';
import { type PaymentDetailsTab, REQUISITES_MESSAGES } from '~/constants/requisites';

const content = { type: 'doc', content: [{ type: 'paragraph' }] };

const tabs: PaymentDetailsTab[] = [
  { id: 'saved-usd', name: 'USD', content, order: 1 },
  { id: 'saved-uah', name: 'UAH', content, order: 0 },
  { id: 'req-123', name: 'GBP', content, order: 2 }
];

const savedTabIds = new Set(['saved-uah', 'saved-usd']);

const pdfFile = {
  filename: 'requisites.pdf',
  url: 'https://example.com/requisites.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 1024
};

describe('buildPaymentDetailsInput', () => {
  it('sends tabs in display order with saved IDs and without temporary IDs for new tabs', () => {
    const input = buildPaymentDetailsInput(tabs, savedTabIds, null);

    expect(input.tabs).toEqual([
      { id: 'saved-usd', name: 'USD', content },
      { id: 'saved-uah', name: 'UAH', content },
      { name: 'GBP', content }
    ]);
  });

  it('excludes deleted tabs from the payload while preserving IDs, names and content of remaining tabs', () => {
    const remainingTabs = tabs.filter((tab) => tab.id !== 'saved-usd');

    const input = buildPaymentDetailsInput(remainingTabs, savedTabIds, null);

    expect(input.tabs).toEqual([
      { id: 'saved-uah', name: 'UAH', content },
      { name: 'GBP', content }
    ]);
  });

  it('sends the currently loaded PDF without extra fields', () => {
    const input = buildPaymentDetailsInput(tabs, savedTabIds, { ...pdfFile, __typename: 'PaymentDetailsPdfFile' } as never);

    expect(input.pdfFile).toEqual(pdfFile);
  });

  it.each([
    ['there is no PDF', null],
    ['the PDF has no size', { ...pdfFile, sizeBytes: null }]
  ])('omits the PDF when %s, so the stored file is kept', (_description, file) => {
    const input = buildPaymentDetailsInput(tabs, savedTabIds, file);

    expect(input).not.toHaveProperty('pdfFile');
  });
});

describe('getSaveErrorMessage', () => {
  it('returns the first validation message from the server', () => {
    const error = new ApolloError({
      graphQLErrors: [
        new GraphQLError('Invalid payment details input', {
          extensions: { code: 'BAD_USER_INPUT', issues: [{ message: 'Вкладка з такою назвою вже існує.' }] }
        })
      ]
    });

    expect(getSaveErrorMessage(error)).toBe('Вкладка з такою назвою вже існує.');
  });

  it.each([
    ['an Apollo error without validation issues', new ApolloError({ errorMessage: 'Network error' })],
    ['an unknown error', new Error('Unexpected')]
  ])('returns the default save error for %s', (_description, error) => {
    expect(getSaveErrorMessage(error)).toBe(REQUISITES_MESSAGES.SAVE_ERROR);
  });
});