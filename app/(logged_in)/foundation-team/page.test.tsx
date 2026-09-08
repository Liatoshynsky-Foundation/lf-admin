import { render, screen } from '@testing-library/react';
import React, { ReactNode } from 'react';
import toast from 'react-hot-toast';

import FoundationTeamPage from './page';
import { FoundationTeamErrors } from '~/constants/errors';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { textToProse } from '~/lib/utils/prose';
import { FoundationFoundersBlock } from '~/types/store/pages/about-us/blocks/foundationFounderBlock';

const mockSetShowValidationErrors = jest.fn();

const mockStoreState: {
  blocks: Record<string, Record<string, Partial<FoundationFoundersBlock>>>;
} = {
  blocks: {
    [PAGE_IDS.ABOUT_US]: {
      [BLOCK_IDS.FOUNDATION_FOUNDERS]: {
        titleText: { uk: textToProse('UK Title'), en: textToProse('EN Title') },
        listTitle: { uk: textToProse('UK List'), en: textToProse('EN List') },
        members: []
      }
    }
  }
};

jest.mock('~/store', () => ({
  useStore: Object.assign(
    (selector: (state: { setShowValidationErrors: jest.Mock }) => unknown) => selector({ setShowValidationErrors: mockSetShowValidationErrors }),
    {
      getState: () => mockStoreState
    }
  )
}));

jest.mock('react-hot-toast', () => ({
  error: jest.fn()
}));

jest.mock('~/shared/components/editable-page-layout/EditablePageLayout', () => ({
  EditablePageLayout: ({ children, validateBeforeSave }: { children: ReactNode; validateBeforeSave: () => void }) => (
    <div data-testid="layout">
      <button data-testid="trigger-validate" onClick={() => validateBeforeSave()}>
        Validate
      </button>
      {children}
    </div>
  )
}));

jest.mock('./FoundationTeamContent', () => ({
  FoundationTeamContent: () => <div data-testid="content">Content</div>
}));

describe('FoundationTeamPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setMockBlocks = (blocks: Record<string, Partial<FoundationFoundersBlock>>) => {
    mockStoreState.blocks[PAGE_IDS.ABOUT_US] = blocks;
  };

  const validMockMember = {
    name: { uk: textToProse('Name UK'), en: textToProse('Name EN') },
    description: { uk: textToProse('Desc UK'), en: textToProse('Desc EN') },
    photo: { src: '', generatedSrc: '', alt: { uk: textToProse('Alt UK'), en: textToProse('Alt EN') } }
  };

  it('should render layout and content', () => {
    render(<FoundationTeamPage />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should return true and clear errors when validation passes', () => {
    setMockBlocks({
      [BLOCK_IDS.FOUNDATION_FOUNDERS]: {
        titleText: { uk: textToProse('UK Title'), en: textToProse('EN Title') },
        listTitle: { uk: textToProse('UK List'), en: textToProse('EN List') },
        members: [validMockMember]
      }
    });

    render(<FoundationTeamPage />);
    screen.getByTestId('trigger-validate').click();

    expect(mockSetShowValidationErrors).toHaveBeenCalledWith(false);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it.each([
    [
      'uk member data is missing',
      {
        titleText: { uk: textToProse('UK Title'), en: textToProse('EN Title') },
        listTitle: { uk: textToProse('UK List'), en: textToProse('EN List') },
        members: [
          {
            ...validMockMember,
            name: { uk: textToProse(''), en: textToProse('Name EN') }
          }
        ]
      },
      FoundationTeamErrors.MISSING_MEMBER_UK
    ],
    [
      'en member data is missing',
      {
        titleText: { uk: textToProse('UK Title'), en: textToProse('EN Title') },
        listTitle: { uk: textToProse('UK List'), en: textToProse('EN List') },
        members: [
          {
            ...validMockMember,
            name: { uk: textToProse('Name UK'), en: textToProse('') }
          }
        ]
      },
      FoundationTeamErrors.MISSING_MEMBER_EN
    ]
  ])(
    'should show validation error when %s',
    (_scenario, mockBlockData, expectedErrorMessage) => {
      setMockBlocks({
        [BLOCK_IDS.FOUNDATION_FOUNDERS]: mockBlockData
      });

      const { unmount } = render(<FoundationTeamPage />);
      
      screen.getByTestId('trigger-validate').click();

      expect(mockSetShowValidationErrors).toHaveBeenCalledWith(true);
      expect(toast.error).toHaveBeenCalledWith(expectedErrorMessage);
      
      unmount();
    }
  );
});
