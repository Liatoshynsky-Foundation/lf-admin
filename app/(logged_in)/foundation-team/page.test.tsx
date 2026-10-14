import { render, screen } from '@testing-library/react';
import React, { ReactNode } from 'react';
import toast from 'react-hot-toast';

import FoundationTeamPage from './page';
import { FoundationTeamErrors } from '~/constants/errors';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { textToProse } from '~/lib/utils/prose';
import { scrollToFirstInvalidField } from '~/lib/utils/scrollToFirstInvalidField';
import { FoundationFoundersBlock, TeamMember } from '~/types/store/pages/about-us/blocks/foundationFounderBlock';

const mockSetShowValidationErrors = jest.fn();
const mockSetField = jest.fn();
const mockScrollToFirstInvalidField = scrollToFirstInvalidField as jest.MockedFunction<
  typeof scrollToFirstInvalidField
>;

const mockStoreState: {
  locale: 'uk' | 'en';
  setField: jest.Mock;
  blocks: Record<string, Record<string, Partial<FoundationFoundersBlock>>>;
} = {
  locale: 'uk',
  setField: mockSetField,
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
    (selector: (state: { setShowValidationErrors: jest.Mock }) => unknown) =>
      selector({ setShowValidationErrors: mockSetShowValidationErrors }),
    {
      getState: () => mockStoreState
    }
  )
}));

jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn()
}));

jest.mock('~/lib/utils/scrollToFirstInvalidField', () => ({
  scrollToFirstInvalidField: jest.fn()
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
  const emptyProse = textToProse('');
  const emptyLocalizedProse = { uk: emptyProse, en: emptyProse };
  const photoUrl = 'https://example.com/photo.png';

  const baseBlockFields = {
    titleText: { uk: textToProse('UK Title'), en: textToProse('EN Title') },
    listTitle: { uk: textToProse('UK List'), en: textToProse('EN List') }
  };

  const emptyMember: TeamMember = {
    name: emptyLocalizedProse,
    description: emptyLocalizedProse,
    photo: { src: '', generatedSrc: '', alt: emptyLocalizedProse }
  };

  const memberWithNameOnly: TeamMember = {
    name: { uk: textToProse('Name UK'), en: emptyProse },
    description: emptyLocalizedProse,
    photo: { src: '', generatedSrc: '', alt: emptyLocalizedProse }
  };

  const memberWithImage: TeamMember = {
    name: { uk: textToProse('Name UK'), en: textToProse('Name EN') },
    description: { uk: textToProse('Desc UK'), en: textToProse('Desc EN') },
    photo: {
      src: photoUrl,
      generatedSrc: photoUrl,
      alt: { uk: textToProse('Alt UK'), en: textToProse('Alt EN') }
    }
  };

  const memberWithAlt = (alt: TeamMember['photo']['alt']): TeamMember => ({
    ...memberWithImage,
    photo: { ...memberWithImage.photo, alt }
  });

  const setMembers = (members: TeamMember[]) => {
    mockStoreState.blocks[PAGE_IDS.ABOUT_US] = {
      [BLOCK_IDS.FOUNDATION_FOUNDERS]: { ...baseBlockFields, members }
    };
  };

  const triggerValidate = () => {
    render(<FoundationTeamPage />);
    screen.getByTestId('trigger-validate').click();
  };

  const expectValidationPassed = () => {
    expect(mockSetShowValidationErrors).toHaveBeenCalledWith(false);
    expect(toast.error).not.toHaveBeenCalled();
  };

  const expectMissingAlt = () => {
    expect(mockSetShowValidationErrors).toHaveBeenCalledWith(true);
    expect(toast.error).toHaveBeenCalledWith(FoundationTeamErrors.MISSING_ALT);
    expect(mockScrollToFirstInvalidField).toHaveBeenCalledTimes(1);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreState.locale = 'uk';
  });

  it('should render layout and content', () => {
    render(<FoundationTeamPage />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should pass validation when member has content but optional fields are empty', () => {
    setMembers([memberWithNameOnly]);
    triggerValidate();

    expectValidationPassed();
    expect(mockScrollToFirstInvalidField).not.toHaveBeenCalled();
    expect(mockSetField).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.FOUNDATION_FOUNDERS,
      'members',
      [expect.objectContaining({ name: expect.objectContaining({ uk: textToProse('Name UK') }) })]
    );
  });

  it('should remove fully empty members before save and notify the admin', () => {
    setMembers([emptyMember, memberWithNameOnly]);
    triggerValidate();

    expect(toast.success).toHaveBeenCalledWith(FoundationTeamErrors.EMPTY_MEMBERS_REMOVED(1));
    expect(mockSetField).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.FOUNDATION_FOUNDERS,
      'members',
      [expect.objectContaining({ name: expect.objectContaining({ uk: textToProse('Name UK') }) })]
    );
    expectValidationPassed();
  });

  it.each([
    ['full alt for both locales', memberWithImage],
    ['only active locale alt filled', memberWithAlt({ uk: textToProse('Alt UK'), en: emptyProse })]
  ])('should pass validation when %s', (_label, member) => {
    setMembers([member]);
    triggerValidate();
    expectValidationPassed();
  });

  it('should fail validation when member has image and alt for active locale is empty', () => {
    setMembers([memberWithAlt({ uk: emptyProse, en: textToProse('Alt EN') })]);
    triggerValidate();

    expectMissingAlt();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('should not show empty-members success toast when alt validation fails after cleanup', () => {
    setMembers([emptyMember, memberWithAlt({ uk: emptyProse, en: textToProse('Alt EN') })]);
    triggerValidate();

    expect(toast.error).toHaveBeenCalledWith(FoundationTeamErrors.MISSING_ALT);
    expect(toast.success).not.toHaveBeenCalled();
    expect(mockSetField).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.FOUNDATION_FOUNDERS,
      'members',
      [expect.objectContaining({ photo: expect.objectContaining({ src: photoUrl }) })]
    );
  });

  it('should validate alt for en locale when active locale is en', () => {
    mockStoreState.locale = 'en';
    setMembers([memberWithAlt({ uk: textToProse('Alt UK'), en: emptyProse })]);
    triggerValidate();
    expectMissingAlt();
  });
});
