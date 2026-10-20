import { render, screen } from '@testing-library/react';

import { PublicationsIntro } from './PublicationsIntro';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { useBlockFieldHandlers } from '~/shared/hooks/use-block-field-handlers/useBlockFieldHandlers';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

jest.mock('~/shared/hooks/use-page-block/usePageBlock');
jest.mock('~/store', () => ({
  useStore: jest.fn()
}));

jest.mock('~/ds-components/text-field/TextField', () => ({
  CustomTextField: jest.fn((props) => (
    <div data-testid={`field-${props.label}`}>
      <span>{props.label}</span>
      <span>{JSON.stringify(props.value)}</span>
    </div>
  ))
}));

jest.mock('../../edit-block-skeleton/EditBlockSkeleton', () => ({
  EditBlockSkeleton: () => <div data-testid="edit-block-skeleton" />
}));

jest.mock('../../design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  )
}));

jest.mock('@mui/material', () => ({
  Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

jest.mock('~/shared/hooks/use-block-field-handlers/useBlockFieldHandlers', () => ({
  useBlockFieldHandlers: jest.fn()
}));

describe('PublicationsIntro', () => {
  const mockHandleLocalizedContentChange = jest.fn((_field: string) => jest.fn());

  beforeEach(() => {
    jest.clearAllMocks();

    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk' }));

    (useBlockFieldHandlers as jest.Mock).mockReturnValue({
      handleLocalizedContentChange: mockHandleLocalizedContentChange
    });
  });

  it('should render the skeleton when block is missing', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: undefined });
    render(<PublicationsIntro />);
    expect(screen.getByTestId('edit-block-skeleton')).toBeInTheDocument();
  });

  it('should render both localized text fields when block exists', () => {
    (usePageBlock as jest.Mock).mockReturnValue({
      block: {
        publicationsIntro: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        },
        publicationsOutro: {
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        }
      }
    });
    render(<PublicationsIntro />);

    expect(screen.getByText('Вступний текст')).toBeInTheDocument();
    expect(screen.getByTestId('field-Перший абзац')).toBeInTheDocument();
    expect(screen.getByTestId('field-Другий абзац')).toBeInTheDocument();
  });

  it('should pass the current loclae content and correct change handlers to the fields', () => {
    const firstParagraph = { type: 'doc', content: [{ type: 'text', text: 'Перший абзац' }] };
    const secondParagraph = { type: 'doc', content: [{ type: 'text', text: 'Другий абзац' }] };

    (usePageBlock as jest.Mock).mockReturnValue({
      block: {
        publicationsIntro: {
          uk: firstParagraph,
          en: { type: 'doc', content: [] }
        },
        publicationsOutro: {
          uk: secondParagraph,
          en: { type: 'doc', content: [] }
        }
      }
    });

    render(<PublicationsIntro />);

    expect(CustomTextField).toHaveBeenCalledWith(
      expect.objectContaining({
        fieldType: 'formatting',
        label: 'Перший абзац',
        value: firstParagraph,
        onChange: expect.any(Function)
      }),
      undefined
    );

    expect(CustomTextField).toHaveBeenCalledWith(
      expect.objectContaining({
        fieldType: 'formatting',
        label: 'Другий абзац',
        value: secondParagraph,
        onChange: expect.any(Function)
      }),
      undefined
    );

    expect(mockHandleLocalizedContentChange).toHaveBeenCalledWith('publicationsIntro');
    expect(mockHandleLocalizedContentChange).toHaveBeenCalledWith('publicationsOutro');
  });

  it('should use the English content when the current locale is English', () => {
    const englishIntro = { type: 'doc', content: [{ type: 'text', text: 'English intro' }] };
    const englishOutro = { type: 'doc', content: [{ type: 'text', text: 'English outro' }] };

    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'en' }));

    (usePageBlock as jest.Mock).mockReturnValue({
      block: {
        publicationsIntro: {
          uk: { type: 'doc', content: [] },
          en: englishIntro
        },
        publicationsOutro: {
          uk: { type: 'doc', content: [] },
          en: englishOutro
        }
      }
    });

    render(<PublicationsIntro />);

    expect(screen.getByTestId('field-Перший абзац')).toHaveTextContent(JSON.stringify(englishIntro));
    expect(screen.getByTestId('field-Другий абзац')).toHaveTextContent(JSON.stringify(englishOutro));
  });
});
