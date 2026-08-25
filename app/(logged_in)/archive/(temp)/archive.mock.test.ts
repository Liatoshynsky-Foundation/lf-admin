import { ARCHIVE_FUNDS_MOCK_DATA } from './archive.mock';

describe('archive.mock', () => {
  it('should export valid ARCHIVE_FUNDS_MOCK_DATA with normalized statuses', () => {
    expect(ARCHIVE_FUNDS_MOCK_DATA).toBeDefined();
    expect(Array.isArray(ARCHIVE_FUNDS_MOCK_DATA)).toBe(true);
    expect(ARCHIVE_FUNDS_MOCK_DATA.length).toBeGreaterThan(0);

    ARCHIVE_FUNDS_MOCK_DATA.forEach((item) => {
      expect(item).toHaveProperty('status');
      expect(typeof item.status).toBe('string');
    });
  });

  it('should fallback to Draft status when item status in seed data is invalid', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock('./archive.mock.data.json', () => [{ id: '1', title: 'Test Fund', status: 'INVALID_STATUS_STRING' }]);

      const { ARCHIVE_FUNDS_MOCK_DATA: mockData } = await import('./archive.mock');
      expect(mockData[0].status).toBe('draft');
    });
  });
});
