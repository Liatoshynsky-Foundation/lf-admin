import { fireEvent, render, screen } from '@testing-library/react';

import { Header } from './Header';

type HeaderProps = {
  title: string;
  onPreview: () => void;
  onSave: () => void;
  isSaving: boolean;
  onLanguageChange: (lang: 'uk' | 'en') => void;
  children?: React.ReactNode;
};

jest.mock('../language-switcher/LanguageSwitcher', () => ({
  __esModule: true,
  default: ({ languageSwitcher }: { languageSwitcher: (lang: 'uk' | 'en') => void }) => (
    <button data-testid="language-switcher" onClick={() => languageSwitcher('en')}>
      Switch Language
    </button>
  )
}));

jest.mock('../design-system/button/Button', () => ({
  __esModule: true,
  default: ({ children, ...props }: HeaderProps) => <button {...props}>{children}</button>
}));

jest.mock('~/public/icons/externalLink.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="external-link" />
}));

describe('Header', () => {
  const defaultProps = {
    title: 'Про нас',
    onPreview: jest.fn(),
    onSave: jest.fn(),
    onCancel: jest.fn(),
    isSaving: false,
    onLanguageChange: jest.fn(),
    isActionsDisabled: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UI', () => {
    it('should render title, description & "Скасувати зміни" and "Зберегти" buttons ', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByText('Про нас')).toBeInTheDocument();
      expect(screen.getByText('Редагуйте та змінюйте вміст сторінки “Про нас”.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Скасувати зміни/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Зберегти/i })).toBeInTheDocument();
    });
  });
  describe('actions logic', () => {

    it.each([
      {
        verb: 'call',
        buttonName: 'Попередній перегляд',
        propsAction: 'onPreview' as const,
        props: { isActionsDisabled: false },
        expectedCall: true,
        condition: ''
      },
      {
        verb: 'NOT call',
        buttonName: 'Зберегти',
        propsAction: 'onSave' as const,
        props: { isActionsDisabled: true },
        expectedCall: false,
        condition: 'if isActionsDisabled is true'
      },
      {
        verb: 'NOT call',
        buttonName: 'Скасувати зміни',
        propsAction: 'onCancel' as const,
        props: { isActionsDisabled: true },
        expectedCall: false,
        condition: 'if isActionsDisabled is true'
      },
      {
        verb: 'call',
        buttonName: 'Зберегти',
        propsAction: 'onSave' as const,
        props: { isActionsDisabled: false },
        expectedCall: true,
        condition: 'if isActionsDisabled is false'
      },
      {
        verb: 'call',
        buttonName: 'Скасувати зміни',
        propsAction: 'onCancel' as const,
        props: { isActionsDisabled: false },
        expectedCall: true,
        condition: 'if isActionsDisabled is false'
      },
    ])(
      'should $verb $propsAction when "$buttonName" button is clicked $condition',
      ({ buttonName, propsAction, props, expectedCall }) => {
        const mergedProps = { ...defaultProps, ...props };
        render(<Header {...mergedProps} />);

        const button = screen.getByRole('button', { name: new RegExp(buttonName, 'i') });
        fireEvent.click(button);

        if (expectedCall) {
          expect(mergedProps[propsAction]).toHaveBeenCalledTimes(1);
        } else {
          expect(mergedProps[propsAction]).not.toHaveBeenCalled();
        }
      }
    );

    it('should call onLanguageChange when LanguageSwitcher is used', () => {
      render(<Header {...defaultProps} />);
      const switcher = screen.getByTestId('language-switcher');
      fireEvent.click(switcher);
      expect(defaultProps.onLanguageChange).toHaveBeenCalledWith('en');
    });
  });

  describe('UI states', () => {
    it('should disable "Зберегти" button when isSaving is true', () => {
      render(<Header {...defaultProps} isSaving={true} />);
      const saveButton = screen.getByRole('button', { name: /Зберегти/i });
      expect(saveButton).toBeDisabled();
    });

    it('should disable "Скасувати зміни" and "Зберегти" buttons when isActionsDisabled is true', () => {
      render(<Header {...defaultProps} isActionsDisabled={true} />);

      const cancelButton = screen.getByRole('button', { name: /Скасувати зміни/i });
      const saveButton = screen.getByRole('button', { name: /Зберегти/i });

      expect(cancelButton).toBeDisabled();
      expect(saveButton).toBeDisabled();
    });

    it('should disable only the "Зберегти" button when isSaveDisabled is true, leaving "Скасувати зміни" enabled', () => {
      render(<Header {...defaultProps} isActionsDisabled={false} isSaveDisabled={true} />);

      const cancelButton = screen.getByRole('button', { name: /Скасувати зміни/i });
      const saveButton = screen.getByRole('button', { name: /Зберегти/i });

      expect(cancelButton).not.toBeDisabled();
      expect(saveButton).toBeDisabled();
      expect(saveButton).toHaveAttribute('title', 'Виправте порожні заголовки розділів перед збереженням');
    });

    it('should keep the "Зберегти" button enabled when isSaveDisabled is false', () => {
      render(<Header {...defaultProps} isActionsDisabled={false} isSaveDisabled={false} />);

      const saveButton = screen.getByRole('button', { name: /Зберегти/i });

      expect(saveButton).not.toBeDisabled();
      expect(saveButton).not.toHaveAttribute('title');
    });
  });
});
