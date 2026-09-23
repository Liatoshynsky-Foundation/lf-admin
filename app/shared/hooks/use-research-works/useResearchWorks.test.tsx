import { collectUniqueAuthors } from './useResearchWorks';

describe('collectUniqueAuthors', () => {
  it('returns unique trimmed authors sorted with uk locale', () => {
    expect(
      collectUniqueAuthors([
        { author: 'Мельник Андрій' },
        { author: 'Коваленко Олена' },
        { author: 'Мельник Андрій' },
        { author: '  ' },
        { author: ' Коваленко Олена ' }
      ])
    ).toEqual(['Коваленко Олена', 'Мельник Андрій']);
  });

  it('returns an empty list when there are no authors', () => {
    expect(collectUniqueAuthors([])).toEqual([]);
  });
});
