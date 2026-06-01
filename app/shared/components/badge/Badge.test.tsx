import { render, screen } from '@testing-library/react';

import Badge from './Badge';

describe('Badge Component', () => {
  describe('Rendering Variants', ()=>{
    it('should render the correct label for the news variant', () => {
      render(<Badge variant="news" localizations={['uk']} />);
      expect(screen.getByTestId('badge')).toHaveTextContent('Новина');
    });

    it('should render the correct label for the draft variant', () => {
      render(<Badge variant="draft" localizations={['uk']} />);
      expect(screen.getByTestId('badge')).toHaveTextContent('Чернетка');
    });

    it('should render the correct label for the events variant', () => {
      render(<Badge variant="events" localizations={['uk']} />);
      expect(screen.getByTestId('badge')).toHaveTextContent('Подія');
    });
    it('should render the correct label for the media variant', () => {
      render(<Badge variant="media" localizations={['uk']} />);
      expect(screen.getByTestId('badge')).toHaveTextContent('Ми у ЗМІ');
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
