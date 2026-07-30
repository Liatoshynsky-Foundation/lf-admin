import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { IntroSection } from './IntroSection';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

jest.mock('~/store', () => ({
  useStore: jest.fn()
}));

jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: jest.fn()
}));

jest.mock('../../design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="collapsible-block">{children}</div>
}));

jest.mock('../../design-system/text-field/TextField', () => ({
  CustomTextField: ({
    onChange,
    title,
    value
  }: {
    onChange: (val: unknown) => void;
    title: string;
    value: unknown;
  }) => (
    <input
      data-testid={`input-${title}`}
      value={value ? JSON.stringify(value) : ''}
      onChange={(e) => onChange({ type: 'doc', content: e.target.value })}
    />
  )
}));

jest.mock('../../edit-block-skeleton/EditBlockSkeleton', () => ({
  EditBlockSkeleton: () => <div data-testid="edit-block-skeleton" />
}));

const mockedUseStore = jest.mocked(useStore);
const mockedUsePageBlock = jest.mocked(usePageBlock);

describe('IntroSection', () => {
  const mockSetField = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseStore.mockImplementation((selector) => {
      const fakeState = {
        setField: mockSetField,
        locale: 'uk'
      };
      return selector(fakeState as never);
    });
  });

  test('renders skeleton when block data is not loaded', () => {
    mockedUsePageBlock.mockReturnValue({ block: null } as unknown as ReturnType<typeof usePageBlock>);

    render(<IntroSection />);

    expect(screen.getByTestId('edit-block-skeleton')).toBeInTheDocument();
  });

  test('renders fields and handles paragraph changes correctly', () => {
    const mockBlock = {
      trustAndSecurity: { uk: { type: 'doc', content: 'trust-data' } },
      agreement: { uk: { type: 'doc', content: 'agreement-data' } }
    };

    mockedUsePageBlock.mockReturnValue({ block: mockBlock } as unknown as ReturnType<typeof usePageBlock>);

    render(<IntroSection />);

    const firstParagraphInput = screen.getByTestId('input-Текст 1 абзацу');
    const secondParagraphInput = screen.getByTestId('input-Текст 2 абзацу');

    expect(firstParagraphInput).toBeInTheDocument();
    expect(secondParagraphInput).toBeInTheDocument();

    fireEvent.change(firstParagraphInput, { target: { value: 'updated-trust' } });

    expect(mockSetField).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'trustAndSecurity', {
      uk: { type: 'doc', content: 'updated-trust' }
    });

    fireEvent.change(secondParagraphInput, { target: { value: 'updated-agreement' } });

    expect(mockSetField).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'agreement', {
      uk: { type: 'doc', content: 'updated-agreement' }
    });
  });

  test('returns null and does not render component when paragraphs array is empty', () => {
    const mockBlock = {
      trustAndSecurity: { uk: { type: 'doc', content: 'data' } },
      agreement: { uk: { type: 'doc', content: 'data' } }
    };

    mockedUsePageBlock.mockReturnValue({ block: mockBlock } as unknown as ReturnType<typeof usePageBlock>);

    jest.spyOn(Array.prototype, 'map').mockReturnValueOnce([]);

    const { container } = render(<IntroSection />);

    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId('collapsible-block')).not.toBeInTheDocument();
  });
});
