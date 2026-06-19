import PageCardMenuItems from './PageCardMenuItems';

describe('PageCardMenuItems', () => {
  const editSeoHref = '/admin/news/1/seo';

  const result = PageCardMenuItems({ editSeoHref });

  it('should return one menu item', () => {
    expect(result).toHaveLength(1);
  });

  it('should return menu item with correct text', () => {
    expect(result[0].text).toEqual({
      name: 'SEO налаштування'
    });
  });

  it('should return menu item with provided href', () => {
    expect(result[0].href).toBe(editSeoHref);
  });

  it('should return menu item with expected structure', () => {
    expect(result[0]).toMatchObject({
      text: {
        name: 'SEO налаштування'
      },
      href: editSeoHref
    });
  });
});
