import getFromPath from './getFromPath';

describe('getFromPath', () => {
  it('should return a path without /', () => {
    expect(getFromPath('/path')).toBe('path');
  });
});
