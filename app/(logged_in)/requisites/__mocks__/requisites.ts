import {
  RequisitesData,
  RequisitesDbRecord
} from '~/constants/requisites';

export const MOCK_REQUISITES_DB_RECORD: RequisitesDbRecord = {
  _id: '670f2a9c1e45b801a2c3d4e5',
  slug: 'requisites',
  items: [
    {
      id: 'req-uah',
      currency: 'UAH',
      content:
        'Отримувач: ГО "ФУНДАЦІЯ ЛЯТОШИНСЬКОГО"\n' +
        'Enterprise code: 45111281\n' +
        'IBAN: UA383510050000026009879189237\n' +
        'Банк: АТ «УКРСИББАНК»',
      pdfFile: {
        id: 'pdf-uah-001',
        name: 'IMSLP912906-PMLP804595-Rondo-Basset_Clarinet.pdf',
        url: '/files/IMSLP912906-PMLP804595-Rondo-Basset_Clarinet.pdf',
        size: 1048576
      },
      order: 0
    },
    {
      id: 'req-usd',
      currency: 'USD',
      content:
        'Beneficiary: NGO "LIATOSHYNSKY FOUNDATION"\n' +
        'Enterprise code: 45111281\n' +
        'IBAN: UA000000000000000000000000000\n' +
        'SWIFT: UKSIUA2X\n' +
        'Bank: JSC UKRSIBBANK',
      pdfFile: null,
      order: 1
    },
    {
      id: 'req-eur',
      currency: 'EUR',
      content:
        'Beneficiary: NGO "LIATOSHYNSKY FOUNDATION"\n' +
        'Enterprise code: 45111281\n' +
        'IBAN: UA111111111111111111111111111\n' +
        'SWIFT: UKSIUA2X\n' +
        'Bank: JSC UKRSIBBANK',
      pdfFile: null,
      order: 2
    },
    {
      id: 'req-gbp',
      currency: 'GBP',
      content:
        'Beneficiary: NGO "LIATOSHYNSKY FOUNDATION"\n' +
        'Enterprise code: 45111281\n' +
        'IBAN: UA222222222222222222222222222\n' +
        'SWIFT: UKSIUA2X\n' +
        'Bank: JSC UKRSIBBANK',
      pdfFile: null,
      order: 3
    }
  ],
  createdAt: '2026-10-22T20:00:00.000Z',
  updatedAt: '2026-10-22T20:00:00.000Z'
};

export const INITIAL_REQUISITES_DATA: RequisitesData = {
  items: MOCK_REQUISITES_DB_RECORD.items
};
