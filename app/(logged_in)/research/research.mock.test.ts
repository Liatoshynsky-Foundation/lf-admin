import { BaseContentStatuses } from '~/types/enums/common.enums';

jest.mock('./research.mock.data.json', () => {
  const { BaseContentStatuses: Enum } = jest.requireActual('~/types/enums/common.enums');
  const validStatus = Object.values(Enum)[0];

  return [
    {
      id: '1',
      author: 'Author 1',
      bibliographicDescription: 'Description 1',
      year: '2020',
      keywords: 'test',
      status: validStatus,
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2020-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      author: 'Author 2',
      bibliographicDescription: 'Description 2',
      year: '2021',
      keywords: 'test2',
      status: 'INVALID_STATUS_VALUE',
      createdAt: '2021-01-01T00:00:00.000Z',
      updatedAt: '2021-01-01T00:00:00.000Z'
    }
  ];
});

import { RESEARCH_WORKS_MOCK_DATA } from './research.mock';

describe('RESEARCH_WORKS_MOCK_DATA', () => {
  it('should map items and fallback invalid statuses to Draft', () => {
    const firstStatus = Object.values(BaseContentStatuses)[0] as BaseContentStatuses;

    expect(RESEARCH_WORKS_MOCK_DATA).toHaveLength(2);

    expect(RESEARCH_WORKS_MOCK_DATA[0].status).toBe(firstStatus);

    expect(RESEARCH_WORKS_MOCK_DATA[1].status).toBe(BaseContentStatuses.Draft);
  });
});
