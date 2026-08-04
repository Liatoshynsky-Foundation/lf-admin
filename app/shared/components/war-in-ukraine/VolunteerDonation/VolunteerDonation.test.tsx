import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { VolunteerDonation } from './VolunteerDonation';
import { BLOCK_IDS } from '~/constants/pageBlocks';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

beforeAll(() => {
  if (!global.crypto) {
    global.crypto = {} as Crypto;
  }
  if (!global.crypto.randomUUID) {
    Object.defineProperty(global.crypto, 'randomUUID', {
      value: jest.fn().mockReturnValue('mocked-uuid-9999')
    });
  }
});

jest.mock('~/shared/hooks/use-page-block/usePageBlock');
jest.mock('~/store');

jest.mock('~/shared/components/edit-block-skeleton/EditBlockSkeleton', () => ({
  EditBlockSkeleton: () => <div data-testid="edit-block-skeleton" />
}));

jest.mock('~/shared/components/design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ title, children, hidden, onToggleVisibility }: any) => (
    <div data-testid="collapsible-block" data-hidden={hidden}>
      <span>{title}</span>
      <button type="button" data-testid="toggle-visibility-btn" onClick={onToggleVisibility}>
        Toggle Visibility
      </button>
      {children}
    </div>
  )
}));

jest.mock('~/shared/components/design-system/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({ imageUrl, onChangeImage }: any) => (
    <div data-testid="image-preview-block" data-url={imageUrl}>
      <button 
        type="button" 
        data-testid="change-image-btn" 
        onClick={() => onChangeImage('https://images.com/new.jpg')}
      >
        Change Image
      </button>
    </div>
  )
}));

jest.mock('~/ds-components/text-field/TextField', () => ({
  CustomTextField: ({ title, value, onChange }: any) => (
    <div data-testid={`field-${title}`}>
      <input
        aria-label={title}
        value={value || ''}
        onChange={(e) => onChange(e)}
        data-testid={`input-${title}`}
      />
      <button 
        type="button" 
        data-testid={`direct-string-btn-${title}`} 
        onClick={() => onChange('Прямий рядок значення')}
      >
        Set Direct String
      </button>
      <button
        type="button"
        data-testid={`empty-btn-${title}`}
        onClick={() => onChange({ target: { value: '' } })}
      >
        Set Empty
      </button>
    </div>
  )
}));

jest.mock('~/components/configurable-list/ConfigurableList', () => ({
  __esModule: true,
  default: ({ items, addBtnLabel, onCreate, onChange, onDelete }: any) => (
    <div data-testid="configurable-list" data-count={items.length}>
      <button type="button" data-testid="create-method-btn" onClick={() => onCreate()}>
        {addBtnLabel}
      </button>
      {items.map((item: any, index: number) => (
        <div key={item.id || index} data-testid={`method-row-${index}`}>
          <span data-testid={`method-id-${index}`}>{item.id}</span>
          <span data-testid={`method-label-${index}`}>{JSON.stringify(item.label)}</span>
          <span data-testid={`method-value-${index}`}>{item.value}</span>
          <button 
            type="button" 
            data-testid={`update-method-btn-${index}`} 
            onClick={() => onChange({ ...item, value: 'UPDATED_VALUE' })}
          >
            Update Method
          </button>
          <button 
            type="button" 
            data-testid={`delete-method-btn-${index}`} 
            onClick={() => onDelete(item.id)}
          >
            Delete Method
          </button>
        </div>
      ))}
    </div>
  )
}));

jest.mock('../VolunteerDonationMethodCard/VolunteerDonationMethodCard', () => ({
  VolunteerDonationMethodCard: ({ method }: any) => (
    <div data-testid="donation-method-card">{method.value}</div>
  )
}));

describe('VolunteerDonation', () => {
  const mockSetField = jest.fn();
  const mockToggleVisibility = jest.fn();
  const expectedBlockId = BLOCK_IDS.VOLUNTEER_DONATION;

  const mockBlockData = {
    hidden: false,
    title: { uk: 'ДОНАТИ ЗСУ', en: 'DONATE TO AFU' },
    caption: { uk: 'Підтримайте нас', en: 'Support us' },
    imageSrc: '/images/donation.jpg',
    paymentMethods: [
      { id: '1', label: { uk: 'Карта', en: 'Card' }, value: 'UA1111' }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders EditBlockSkeleton when block is not loaded (falsy block branch)', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: null });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk' }));

    render(<VolunteerDonation />);

    expect(screen.getByTestId('edit-block-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('collapsible-block')).not.toBeInTheDocument();
  });

  it('renders form correctly when block data is available for Ukrainian locale', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', toggleBlockVisibility: mockToggleVisibility };
      return selector(state);
    });

    render(<VolunteerDonation />);

    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByLabelText('Заголовок') as HTMLInputElement).toHaveValue('ДОНАТИ ЗСУ');
    expect(screen.getByLabelText('Підпис під фотографією') as HTMLInputElement).toHaveValue('Підтримайте нас');
    expect(screen.getByTestId('image-preview-block')).toHaveAttribute('data-url', '/images/donation.jpg');
    expect(screen.getByTestId('configurable-list')).toHaveAttribute('data-count', '1');
  });

  it('renders correctly for English locale with fallbacks for missing fields and methods', () => {
    const incompleteBlock = {
      hidden: true,
      // Відсутні title, caption, imageSrc та paymentMethods для покриття умовних гілок (|| '') та ([] інші)
    };

    (usePageBlock as jest.Mock).mockReturnValue({ block: incompleteBlock });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'en', toggleBlockVisibility: mockToggleVisibility };
      return selector(state);
    });

    render(<VolunteerDonation />);

    expect(screen.getByTestId('collapsible-block')).toHaveAttribute('data-hidden', 'true');
    expect(screen.getByLabelText('Заголовок') as HTMLInputElement).toHaveValue('');
    expect(screen.getByLabelText('Підпис під фотографією') as HTMLInputElement).toHaveValue('');
    expect(screen.getByTestId('image-preview-block')).toHaveAttribute('data-url', '/images/light-logo.svg');
    expect(screen.getByTestId('configurable-list')).toHaveAttribute('data-count', '0');
  });

  it('normalizes payment methods with missing label/value/id fields using defaults', () => {
    const blockWithPartialMethods = {
      ...mockBlockData,
      paymentMethods: [
        { id: '1', label: { uk: 'Карта', en: 'Card' }, value: 'UA1111' },
        {}
      ]
    };

    (usePageBlock as jest.Mock).mockReturnValue({ block: blockWithPartialMethods });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', toggleBlockVisibility: mockToggleVisibility }));

    render(<VolunteerDonation />);

    expect(screen.getByTestId('configurable-list')).toHaveAttribute('data-count', '2');
    expect(screen.getByTestId('method-label-1')).toHaveTextContent(JSON.stringify({ uk: '', en: '' }));
    expect(screen.getByTestId('method-value-1')).toHaveTextContent('');
    expect(screen.getByTestId('method-id-1')).toHaveTextContent('method-1');
  });

  it('toggles block visibility correctly via store action', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', toggleBlockVisibility: mockToggleVisibility };
      return selector(state);
    });

    render(<VolunteerDonation />);

    fireEvent.click(screen.getByTestId('toggle-visibility-btn'));

    expect(mockToggleVisibility).toHaveBeenCalledTimes(1);
    expect(mockToggleVisibility).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId);
  });

  it('updates title via React change event (typeof e !== string)', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', setField: mockSetField };
      return selector(state);
    });

    render(<VolunteerDonation />);

    const titleInput = screen.getByLabelText('Заголовок');
    fireEvent.change(titleInput, { target: { value: 'НОВИЙ ЗАГОЛОВОК' } });

    expect(mockSetField).toHaveBeenCalledWith(
      'war-in-ukraine',
      expectedBlockId,
      'title',
      {
        uk: 'НОВИЙ ЗАГОЛОВОК',
        en: 'DONATE TO AFU'
      }
    );
  });

  it('updates title with empty fallbacks when the block has no existing title object', () => {
    const blockWithoutTitle = { ...mockBlockData, title: undefined };
    (usePageBlock as jest.Mock).mockReturnValue({ block: blockWithoutTitle });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', setField: mockSetField };
      return selector(state);
    });

    render(<VolunteerDonation />);

    fireEvent.click(screen.getByTestId('direct-string-btn-Заголовок'));

    expect(mockSetField).toHaveBeenCalledWith(
      'war-in-ukraine',
      expectedBlockId,
      'title',
      {
        uk: 'Прямий рядок значення',
        en: ''
      }
    );
  });

  it('falls back to an empty string when the title change event carries no value', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', setField: mockSetField };
      return selector(state);
    });

    render(<VolunteerDonation />);

    fireEvent.click(screen.getByTestId('empty-btn-Заголовок'));

    expect(mockSetField).toHaveBeenCalledWith(
      'war-in-ukraine',
      expectedBlockId,
      'title',
      {
        uk: '',
        en: 'DONATE TO AFU'
      }
    );
  });

  it('updates caption via direct string value (typeof e === string)', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'en', setField: mockSetField };
      return selector(state);
    });

    render(<VolunteerDonation />);

    fireEvent.click(screen.getByTestId('direct-string-btn-Підпис під фотографією'));

    expect(mockSetField).toHaveBeenCalledWith(
      'war-in-ukraine',
      expectedBlockId,
      'caption',
      {
        uk: 'Підтримайте нас',
        en: 'Прямий рядок значення'
      }
    );
  });

  it('updates caption with empty fallbacks when the block has no existing caption object', () => {
    const blockWithoutCaption = { ...mockBlockData, caption: undefined };
    (usePageBlock as jest.Mock).mockReturnValue({ block: blockWithoutCaption });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', setField: mockSetField };
      return selector(state);
    });

    render(<VolunteerDonation />);

    fireEvent.click(screen.getByTestId('direct-string-btn-Підпис під фотографією'));

    expect(mockSetField).toHaveBeenCalledWith(
      'war-in-ukraine',
      expectedBlockId,
      'caption',
      {
        uk: 'Прямий рядок значення',
        en: ''
      }
    );
  });

  it('updates image source when ImagePreviewBlock triggers change', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', setField: mockSetField };
      return selector(state);
    });

    render(<VolunteerDonation />);

    fireEvent.click(screen.getByTestId('change-image-btn'));

    expect(mockSetField).toHaveBeenCalledWith(
      'war-in-ukraine',
      expectedBlockId,
      'imageSrc',
      'https://images.com/new.jpg'
    );
  });

  it('adds a new payment method when ConfigurableList triggers onCreate', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', setField: mockSetField };
      return selector(state);
    });

    render(<VolunteerDonation />);

    fireEvent.click(screen.getByTestId('create-method-btn'));

    expect(mockSetField).toHaveBeenCalledWith(
      'war-in-ukraine',
      expectedBlockId,
      'paymentMethods',
      [
        { id: '1', label: { uk: 'Карта', en: 'Card' }, value: 'UA1111' },
        {
          id: 'mocked-uuid-9999',
          label: { uk: '', en: '' },
          value: ''
        }
      ]
    );
  });

  it('adds the first payment method to an empty list', () => {
    const emptyMethodsBlock = { ...mockBlockData, paymentMethods: [] };
    (usePageBlock as jest.Mock).mockReturnValue({ block: emptyMethodsBlock });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', setField: mockSetField };
      return selector(state);
    });

    render(<VolunteerDonation />);

    fireEvent.click(screen.getByTestId('create-method-btn'));

    expect(mockSetField).toHaveBeenCalledWith(
      'war-in-ukraine',
      expectedBlockId,
      'paymentMethods',
      [
        {
          id: 'mocked-uuid-9999',
          label: { uk: '', en: '' },
          value: ''
        }
      ]
    );
  });

  it('updates a single payment method when ConfigurableList triggers onChange', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', setField: mockSetField };
      return selector(state);
    });

    render(<VolunteerDonation />);

    fireEvent.click(screen.getByTestId('update-method-btn-0'));

    expect(mockSetField).toHaveBeenCalledWith(
      'war-in-ukraine',
      expectedBlockId,
      'paymentMethods',
      [
        { id: '1', label: { uk: 'Карта', en: 'Card' }, value: 'UPDATED_VALUE' }
      ]
    );
  });

  it('removes a payment method when ConfigurableList triggers onDelete', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', setField: mockSetField };
      return selector(state);
    });

    render(<VolunteerDonation />);

    fireEvent.click(screen.getByTestId('delete-method-btn-0'));

    expect(mockSetField).toHaveBeenCalledWith(
      'war-in-ukraine',
      expectedBlockId,
      'paymentMethods',
      []
    );
  });
});
