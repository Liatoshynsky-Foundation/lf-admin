import { buildArchiveCaseShareUrl } from './archiveCaseShare';

describe('buildArchiveCaseShareUrl', () => {
  it('builds a fund edit URL when the case has a fund', () => {
    expect(buildArchiveCaseShareUrl('https://example.com', 'case/1', 'fund/2')).toBe(
      'https://example.com/archive/fund/fund%2F2/edit?caseId=case%2F1'
    );
  });

  it('falls back to the cases list URL for an orphan case', () => {
    expect(buildArchiveCaseShareUrl('https://example.com', 'case-1')).toBe(
      'https://example.com/archive/cases?caseId=case-1'
    );
  });
});
