

const mockReplace = jest.fn();
const mockPathname = '/dashboard';

const mockUseLocale = jest.fn();

jest.mock('~/../i18n/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    replace: mockReplace
  })
}));

jest.mock('next-intl', () => ({
  useLocale: () => mockUseLocale()
}));

class MockResizeObserver implements ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

globalThis.ResizeObserver = MockResizeObserver;

describe('LanguageSwitcher', () => {
  // let OriginalResizeObserver: typeof globalThis.ResizeObserver;
  //
  // beforeAll(() => {
  //   OriginalResizeObserver = globalThis.ResizeObserver;
  //   globalThis.ResizeObserver = MockResizeObserver;
  // });
  //
  // afterAll(() => {
  //   globalThis.ResizeObserver = OriginalResizeObserver;
  // });
  //
  // it('should render language buttons', () => {
  //   render(<LanguageSwitcher />);
  //   expect(screen.getByText('Українська')).toBeInTheDocument();
  //   expect(screen.getByText('English')).toBeInTheDocument();
  // });
  //
  // it('should set NEXT_LOCALE cookie and call router.replace when "English" is clicked', () => {
  //   render(<LanguageSwitcher />);
  //   const englishButton = screen.getByText('English');
  //
  //   fireEvent.click(englishButton);
  //
  //   expect(document.cookie).toContain('NEXT_LOCALE=en');
  //   expect(mockReplace).toHaveBeenCalledWith(mockPathname, { locale: 'en' });
  // });
  //
  // it('should set NEXT_LOCALE cookie and call router.replace when "Українська" is clicked', () => {
  //   mockUseLocale.mockReturnValue('en');
  //
  //   render(<LanguageSwitcher />);
  //   const ukrainianButton = screen.getByText('Українська');
  //
  //   fireEvent.click(ukrainianButton);
  //
  //   expect(document.cookie).toContain('NEXT_LOCALE=uk');
  //   expect(mockReplace).toHaveBeenCalledWith(mockPathname, { locale: 'uk' });
  // });
  //
  // it('should render the default active button', () => {
  //   mockUseLocale.mockReturnValue('en');
  //   render(<LanguageSwitcher />);
  //   expect(screen.getByText('English')).toBeInTheDocument();
  // });
});
