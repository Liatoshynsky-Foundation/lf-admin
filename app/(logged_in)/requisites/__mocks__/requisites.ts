import type { JSONContent } from '@tiptap/react';

import type {
  PaymentDetails,
  PaymentDetailsPdfFile,
  PaymentDetailsTab,
  RequisitesData
} from '~/constants/requisites';

export const createTipTapDoc = (text: string): JSONContent => ({
  type: 'doc',
  content: text
    ? text.split('\n').map((line) => ({
      type: 'paragraph',
      content: line ? [{ type: 'text', text: line }] : []
    }))
    : [{ type: 'paragraph' }]
});

export const MOCK_PAYMENT_DETAILS_PDF: PaymentDetailsPdfFile = {
  filename: 'IMSLP912906-PMLP804595-Rondo-Basset_Clarinet.pdf',
  url: '/files/IMSLP912906-PMLP804595-Rondo-Basset_Clarinet.pdf',
  mimeType: 'application/pdf'
};

export const MOCK_PAYMENT_DETAILS_TABS: PaymentDetailsTab[] = [
  {
    id: 'req-uah',
    name: 'UAH',
    content: createTipTapDoc(
      'Отримувач: ГО "ФУНДАЦІЯ ЛЯТОШИНСЬКОГО"\n' +
        'Enterprise code: 45111281\n' +
        'IBAN: UA383510050000026009879189237\n' +
        'Банк: АТ «УКРСИББАНК»'
    ),
    pdfFile: MOCK_PAYMENT_DETAILS_PDF,
    order: 0
  },
  {
    id: 'req-usd',
    name: 'USD',
    content: createTipTapDoc(
      'Beneficiary: NGO "LIATOSHYNSKY FOUNDATION"\n' +
        'Enterprise code: 45111281\n' +
        'IBAN: UA000000000000000000000000000\n' +
        'SWIFT: UKSIUA2X\n' +
        'Bank: JSC UKRSIBBANK'
    ),
    pdfFile: null,
    order: 1
  },
  {
    id: 'req-eur',
    name: 'EUR',
    content: createTipTapDoc(
      'Beneficiary: NGO "LIATOSHYNSKY FOUNDATION"\n' +
        'Enterprise code: 45111281\n' +
        'IBAN: UA111111111111111111111111111\n' +
        'SWIFT: UKSIUA2X\n' +
        'Bank: JSC UKRSIBBANK'
    ),
    pdfFile: null,
    order: 2
  },
  {
    id: 'req-gbp',
    name: 'GBP',
    content: createTipTapDoc(
      'Beneficiary: NGO "LIATOSHYNSKY FOUNDATION"\n' +
        'Enterprise code: 45111281\n' +
        'IBAN: UA222222222222222222222222222\n' +
        'SWIFT: UKSIUA2X\n' +
        'Bank: JSC UKRSIBBANK'
    ),
    pdfFile: null,
    order: 3
  }
];

export const MOCK_PAYMENT_DETAILS: PaymentDetails = {
  id: '670f2a9c1e45b801a2c3d4e5',
  slug: 'payment-details',
  tabs: MOCK_PAYMENT_DETAILS_TABS,
  pdfFile: MOCK_PAYMENT_DETAILS_PDF,
  createdAt: '2026-10-22T20:00:00.000Z',
  updatedAt: '2026-10-22T20:00:00.000Z'
};

export const INITIAL_REQUISITES_DATA: RequisitesData = {
  items: MOCK_PAYMENT_DETAILS.tabs
};

export const MOCK_REQUISITES_DB_RECORD = MOCK_PAYMENT_DETAILS;
