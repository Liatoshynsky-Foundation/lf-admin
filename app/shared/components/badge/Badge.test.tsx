import { render, screen } from '@testing-library/react';

import Badge from './Badge';

describe('Badge Component', () => {
  describe('Rendering Variants', ()=>{
    it('should render the correct label for the news variant', () => {
      render(<Badge variant="news" localizations={['uk']} />);
      expect(screen.getByText('Новина')).toBeInTheDocument();
    });

    it('should render the correct label for the draft variant', () => {
      render(<Badge variant="draft" localizations={['uk']} />);
      expect(screen.getByText('Чернетка')).toBeInTheDocument();
    });

    it('should render the correct label for the events variant', () => {
      render(<Badge variant="events" localizations={['uk']} />);
      expect(screen.getByText('Подія')).toBeInTheDocument();
    });
    it('should render the correct label for the media variant', () => {
      render(<Badge variant="media" localizations={['uk']} />);
      expect(screen.getByText('Ми у ЗМІ')).toBeInTheDocument();
    });
  });

  describe('Localization Labels', () => {
    it('should display "EN" label when only english localization is provided', () => {
      render(<Badge variant="news" localizations={['en']} />);
      expect(screen.getByText('Новина EN')).toBeInTheDocument();
    });

    it('should display "UK" label when only ukrainian localization is provided', () => {
      render(<Badge variant="news" localizations={['uk']} />);
      expect(screen.getByText('Новина UK')).toBeInTheDocument();
    });

    it('should not display a text label when both localizations are provided', () => {
      render(<Badge variant="news" localizations={['uk', 'en']} />);
      expect(screen.queryByText('UK')).not.toBeInTheDocument();
      expect(screen.queryByText('EN')).not.toBeInTheDocument();
    });
  });


  describe('Custom props', () => {
    it('should display correct custom label when provided', () => {
      render(<Badge variant="news" label='Custom label' localizations={['uk']} />);
      expect(screen.getByText('Custom label')).toBeInTheDocument();
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
