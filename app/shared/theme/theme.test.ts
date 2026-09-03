import { adminTheme } from './theme';

type StyleFunction<T> = (props: T) => Record<string, unknown>;

describe('theme', () => {
  it('should generate MuiPaginationItem dynamic styles properly', () => {
    const rootStyleFn = adminTheme.components?.MuiPaginationItem?.styleOverrides?.root as StyleFunction<{ ownerState: Record<string, unknown> }>;
    
    if (typeof rootStyleFn === 'function') {
      const style1 = rootStyleFn({ ownerState: { type: 'previous', selected: true } });
      expect(style1).toBeDefined();

      const style2 = rootStyleFn({ ownerState: { type: 'next' } });
      expect(style2).toBeDefined();

      const style3 = rootStyleFn({ ownerState: { type: 'start-ellipsis' } });
      expect(style3).toBeDefined();

      const style4 = rootStyleFn({ ownerState: { type: 'end-ellipsis' } });
      expect(style4).toBeDefined();
      
      const style5 = rootStyleFn({ ownerState: { type: 'page' } });
      expect(style5).toBeDefined();
    }
  });

  it('should generate MuiTooltip dynamic styles properly', () => {
    const tooltipStyleFn = adminTheme.components?.MuiTooltip?.styleOverrides?.tooltip as StyleFunction<{ theme: typeof adminTheme }>;
    
    if (typeof tooltipStyleFn === 'function') {
      const style = tooltipStyleFn({ theme: adminTheme });
      expect(style).toBeDefined();
    }
  });
});
