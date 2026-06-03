import { render, screen } from '@testing-library/react';

import Badge, { BadgeVariant } from './Badge';

describe('Badge Component', () => {
  describe('Rendering Variants', ()=>{
    it.each([
      { variant: 'news', expected: 'Новина' },
      { variant: 'draft', expected: 'Чернетка' },
      { variant: 'events', expected: 'Подія' },
      { variant: 'media', expected: 'Ми у ЗМІ' },
    ])('should render $expected for $variant variant', ({ variant, expected }) => {
      render(<Badge variant={variant as BadgeVariant} localizations={['uk']} />);
      expect(screen.getByTestId('badge')).toHaveTextContent(expected);
    });
  });

  describe('Localization Labels', () => {
    it('should display "EN" label when only English localization is provided', () => {
      render(<Badge variant="news" localizations={['en']} />);
      expect(screen.getByTestId('badge')).toHaveTextContent('EN');
    });

    it('should display "UK" label when only Ukrainian localization is provided', () => {
      render(<Badge variant="news" localizations={['uk']} />);
      expect(screen.getByTestId('badge')).toHaveTextContent('UK');
    });

    it('should not display a text label when both localizations are provided', () => {
      render(<Badge variant="news" localizations={['uk', 'en']} />);
      const badge = screen.getByTestId('badge');
      expect(badge).not.toHaveTextContent('UK');
      expect(badge).not.toHaveTextContent('EN');
    });
  });


  describe('Custom props', () => {
    it('should display correct custom label when provided', () => {
      render(<Badge variant="news" label='Custom label' localizations={['uk']} />);
      expect(screen.getByTestId('badge')).toHaveTextContent('Custom label');
    });

    it('should display correct styles for a badge when sx prop provided', ()=>{
      render(<Badge variant="news" sx={{gap: '32px'}} localizations={['uk']} />);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveStyle({
        gap: '32px'
      });
    });
  });
});
