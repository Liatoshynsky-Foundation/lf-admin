import type { DragEndEvent } from '@dnd-kit/core';
import { act, fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import toast from 'react-hot-toast';

import { MOCK_PAYMENT_DETAILS, MOCK_PAYMENT_DETAILS_PDF } from '../__mocks__/requisites';
import PaymentDetailsPageContent from './PaymentDetailsPageContent';
import { createDragEndEvent } from '~/__mocks__/utils';
import { PAYMENT_DETAILS_MESSAGES } from '~/constants/paymentDetails';
import {
  PAYMENT_DETAILS_PDF_MAX_SIZE_BYTES,
  REQUISITES_EMPTY,
  REQUISITES_ERROR,
  REQUISITES_LOADING,
  REQUISITES_MESSAGES
} from '~/constants/requisites';
import type { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';

const mockUsePaymentDetails = jest.fn();

const mockUpdatePaymentDetails = jest.fn();
const mockCreateAsset = jest.fn();
let latestMediaApply: ((result: MediaModalResult) => Promise<void>) | null = null;
let mockDragEnd: (event: DragEndEvent) => void;

jest.mock('~/shared/components/sortable-list/SortableList', () => {
  const actual = jest.requireActual('~/shared/components/sortable-list/SortableList');
  return {
    SortableList: (
      props: React.ComponentProps<typeof import('~/shared/components/sortable-list/SortableList').SortableList>
    ) => {
      mockDragEnd = props.onDragEnd;
      return <actual.SortableList {...props} />;
    }
  };
});

jest.mock('~/shared/hooks/use-payment-details/usePaymentDetails', () => ({
  ...jest.requireActual('~/shared/hooks/use-payment-details/usePaymentDetails'),
  usePaymentDetails: () => mockUsePaymentDetails()
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  AssetType: { Pdf: 'PDF' },
  useUpdatePaymentDetailsMutation: () => [mockUpdatePaymentDetails, { loading: false }],
  useCreateAssetMutation: () => [mockCreateAsset, { loading: false }]
}));

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  MediaModal: ({
    open,
    onApply,
    onClose
  }: {
    open: boolean;
    onApply: (result: MediaModalResult) => Promise<void>;
    onClose: () => void;
  }) => {
    latestMediaApply = onApply;
    if (!open) return null;
    return (
      <div data-testid="mock-media-modal">
        <button type="button" onClick={onClose}>
          close-media
        </button>
      </div>
    );
  }
}));

jest.mock('~/shared/components/media-modal/views/upload-view/UploadView', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-upload-view" />
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}));

jest.mock('~/public/icons/type-pdf.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="PdfIcon" />
}));

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <section aria-label={title}>{children}</section>
  )
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('~/shared/components/custom-formatting-field/CustomFormattingField', () => ({
  __esModule: true,
  CustomFormattingField: ({
    label,
    value,
    onChange,
    editable = true
  }: {
    label?: string;
    value?: { content?: Array<{ content?: Array<{ text?: string }> }> };
    onChange?: (value: unknown) => void;
    editable?: boolean;
  }) => (
    <div data-testid="custom-formatting-field" data-editable={String(editable)}>
      <span>{label}</span>
      <span data-testid="editor-preview">{value?.content?.[0]?.content?.[0]?.text ?? ''}</span>
      <button
        type="button"
        onClick={() =>
          onChange?.({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Edited' }] }] })
        }
      >
        Edit content
      </button>
    </div>
  )
}));

describe('PaymentDetailsPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    latestMediaApply = null;
    mockUsePaymentDetails.mockReturnValue({
      data: MOCK_PAYMENT_DETAILS,
      loading: false,
      error: undefined
    });
  });

  it('renders initial UAH tab and content correctly', () => {
    render(<PaymentDetailsPageContent />);

    expect(screen.getByRole('heading', { name: 'Реквізити', level: 4 })).toBeInTheDocument();
    expect(screen.getByText('UAH')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('EUR')).toBeInTheDocument();
    expect(screen.getByText('GBP')).toBeInTheDocument();

    expect(screen.getByTestId('editor-preview')).toHaveTextContent('ФУНДАЦІЯ ЛЯТОШИНСЬКОГО');

    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();
    expect(screen.getByText('IMSLP912906-PMLP804595-Rondo-Basset_Clarinet.pdf')).toBeInTheDocument();
  });

  it('keeps reordering local until save, preserves tab data and sends the reordered mutation input', async () => {
    const [first, second, ...remaining] = MOCK_PAYMENT_DETAILS.tabs;
    const reordered = [second, first, ...remaining];
    const saved = {
      ...MOCK_PAYMENT_DETAILS,
      tabs: reordered.map((tab, order) => ({ ...tab, order }))
    };
    mockUpdatePaymentDetails.mockResolvedValue({ data: { updatePaymentDetails: saved } });
    const { rerender } = render(<PaymentDetailsPageContent />);

    act(() => mockDragEnd(createDragEndEvent(first.id, second.id)));

    const getTabNames = () =>
      screen
        .getAllByRole('button')
        .map((button) => button.textContent)
        .filter((name) => MOCK_PAYMENT_DETAILS.tabs.some((tab) => tab.name === name));
    expect(getTabNames()).toEqual(reordered.map((tab) => tab.name));
    expect(mockUpdatePaymentDetails).not.toHaveBeenCalled();
    expect(screen.getByTestId('editor-preview')).toHaveTextContent('ФУНДАЦІЯ ЛЯТОШИНСЬКОГО');

    fireEvent.click(screen.getByRole('button', { name: /зберегти/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(REQUISITES_MESSAGES.SAVE_SUCCESS));
    expect(mockUpdatePaymentDetails.mock.calls[0][0].variables.input.tabs).toEqual(
      reordered.map(({ id, name, content }) => ({ id, name, content }))
    );
    expect(getTabNames()).toEqual(reordered.map((tab) => tab.name));

    mockUsePaymentDetails.mockReturnValue({ data: saved, loading: false, error: undefined });
    rerender(<PaymentDetailsPageContent />);
    expect(getTabNames()).toEqual(reordered.map((tab) => tab.name));
  });

  it('renders currency tabs in configured order', () => {
    mockUsePaymentDetails.mockReturnValue({
      data: MOCK_PAYMENT_DETAILS,
      loading: false,
      error: undefined
    });

    render(<PaymentDetailsPageContent />);

    const tabs = screen
      .getAllByRole('button')
      .filter((button) => ['UAH', 'USD', 'EUR', 'GBP'].includes(button.textContent ?? ''));
    expect(tabs.map((tab) => tab.textContent)).toEqual(['UAH', 'USD', 'EUR', 'GBP']);
  });

  it('renders the root-level PDF returned by the API', () => {
    mockUsePaymentDetails.mockReturnValue({
      data: MOCK_PAYMENT_DETAILS,
      loading: false,
      error: undefined
    });

    render(<PaymentDetailsPageContent />);

    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();
    expect(screen.getByText('IMSLP912906-PMLP804595-Rondo-Basset_Clarinet.pdf')).toBeInTheDocument();
  });

  it('renders loading state while payment details are being fetched', () => {
    mockUsePaymentDetails.mockReturnValue({ data: null, loading: true, error: undefined });

    render(<PaymentDetailsPageContent />);

    expect(screen.getByText(REQUISITES_LOADING.title)).toBeInTheDocument();
  });

  it('renders error state when payment details request fails', () => {
    mockUsePaymentDetails.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Request failed')
    });

    render(<PaymentDetailsPageContent />);

    expect(screen.getByText(REQUISITES_ERROR.title)).toBeInTheDocument();
  });

  it('renders empty state when payment details record is missing', () => {
    mockUsePaymentDetails.mockReturnValue({ data: null, loading: false, error: undefined });

    render(<PaymentDetailsPageContent />);

    expect(screen.getByText(REQUISITES_EMPTY.title)).toBeInTheDocument();
  });

  it('renders empty state when payment details have no tabs', () => {
    mockUsePaymentDetails.mockReturnValue({
      data: { ...MOCK_PAYMENT_DETAILS, tabs: [] },
      loading: false,
      error: undefined
    });

    render(<PaymentDetailsPageContent />);

    expect(screen.getByText(REQUISITES_EMPTY.title)).toBeInTheDocument();
  });

  it('switches between currency tabs while keeping page-level attachment', () => {
    render(<PaymentDetailsPageContent />);

    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();

    fireEvent.click(screen.getByText('USD'));

    expect(screen.getByTestId('editor-preview')).toHaveTextContent('Beneficiary');
    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();

    fireEvent.click(screen.getByText('UAH'));
    expect(screen.getByTestId('attached-pdf-card')).toBeInTheDocument();
  });

  it('renders the save action', () => {
    render(<PaymentDetailsPageContent />);

    expect(screen.getByRole('button', { name: /зберегти/i })).toBeInTheDocument();
  });

  it('renders the editor as editable', () => {
    render(<PaymentDetailsPageContent />);

    expect(screen.getByTestId('custom-formatting-field')).toHaveAttribute('data-editable', 'true');
  });


  it('deletes a tab on confirmation, preserves remaining tabs data and excludes deleted tab from save payload', async () => {
    const remainingTabs = MOCK_PAYMENT_DETAILS.tabs.slice(1);
    const saved = {
      ...MOCK_PAYMENT_DETAILS,
      tabs: remainingTabs.map((tab, order) => ({ ...tab, order }))
    };
    mockUpdatePaymentDetails.mockResolvedValue({ data: { updatePaymentDetails: saved } });

    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Опції реквізиту' }));
    fireEvent.click(screen.getByText(REQUISITES_MESSAGES.DELETE_REQUISITE_MENU));

    expect(screen.getByText(REQUISITES_MESSAGES.DELETE_TAB_TITLE)).toBeInTheDocument();
    expect(screen.getByText(REQUISITES_MESSAGES.DELETE_TAB_DESCRIPTION('UAH'))).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.DELETE_TAB_CONFIRM }));

    await waitForElementToBeRemoved(() => screen.queryByText(REQUISITES_MESSAGES.DELETE_TAB_TITLE));

    expect(screen.queryByRole('button', { name: 'UAH' })).not.toBeInTheDocument();
    expect(screen.getByTestId('editor-preview')).toHaveTextContent('Beneficiary');
    expect(mockUpdatePaymentDetails).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /зберегти/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(REQUISITES_MESSAGES.SAVE_SUCCESS));
    expect(mockUpdatePaymentDetails.mock.calls[0][0].variables.input.tabs).toEqual(
      remainingTabs.map(({ id, name, content }) => ({ id, name, content }))
    );
  });

  it('cancels tab deletion without modifying the working draft', async () => {
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Опції реквізиту' }));
    fireEvent.click(screen.getByText(REQUISITES_MESSAGES.DELETE_REQUISITE_MENU));

    expect(screen.getByText(REQUISITES_MESSAGES.DELETE_TAB_TITLE)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.DELETE_TAB_CANCEL }));

    await waitForElementToBeRemoved(() => screen.queryByText(REQUISITES_MESSAGES.DELETE_TAB_TITLE));

    expect(screen.getByRole('button', { name: 'UAH' })).toBeInTheDocument();
    expect(screen.getByTestId('editor-preview')).toHaveTextContent('ФУНДАЦІЯ ЛЯТОШИНСЬКОГО');
  });

  it('falls back to the previous tab when the last active tab in the list is deleted', async () => {
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: 'GBP' }));

    fireEvent.click(screen.getByRole('button', { name: 'Опції реквізиту' }));
    fireEvent.click(screen.getByText(REQUISITES_MESSAGES.DELETE_REQUISITE_MENU));
    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.DELETE_TAB_CONFIRM }));

    await waitForElementToBeRemoved(() => screen.queryByText(REQUISITES_MESSAGES.DELETE_TAB_TITLE));

    expect(screen.queryByRole('button', { name: 'GBP' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EUR' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Опції реквізиту' })).toBeInTheDocument();
  });

  it('prevents deleting the last remaining tab and displays tooltip', async () => {
    mockUsePaymentDetails.mockReturnValue({
      data: { ...MOCK_PAYMENT_DETAILS, tabs: [MOCK_PAYMENT_DETAILS.tabs[0]] },
      loading: false,
      error: undefined
    });

    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Опції реквізиту' }));

    const deleteMenuItem = screen.getByRole('menuitem', {
      name: REQUISITES_MESSAGES.DELETE_REQUISITE_MENU
    });
    expect(deleteMenuItem).toHaveAttribute('aria-disabled', 'true');

    fireEvent.mouseOver(deleteMenuItem.parentElement ?? deleteMenuItem);
    expect(await screen.findByText(REQUISITES_MESSAGES.LAST_TAB_TOOLTIP)).toBeInTheDocument();

    fireEvent.click(deleteMenuItem);
    expect(screen.queryByText(REQUISITES_MESSAGES.DELETE_TAB_TITLE)).not.toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape', code: 'Escape' });

    expect(screen.getByRole('button', { name: 'UAH' })).toBeInTheDocument();
  });

  it('retains the deleted-tab state in the working draft when saving fails', async () => {
    mockUpdatePaymentDetails.mockRejectedValue(new Error('Network error'));
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Опції реквізиту' }));
    fireEvent.click(screen.getByText(REQUISITES_MESSAGES.DELETE_REQUISITE_MENU));
    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.DELETE_TAB_CONFIRM }));

    await waitForElementToBeRemoved(() => screen.queryByText(REQUISITES_MESSAGES.DELETE_TAB_TITLE));

    expect(screen.queryByRole('button', { name: 'UAH' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /зберегти/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(REQUISITES_MESSAGES.SAVE_ERROR));
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'UAH' })).not.toBeInTheDocument();
    expect(screen.getByTestId('editor-preview')).toHaveTextContent('Beneficiary');
  });

  it('saves edited content, new tabs in display order and the loaded PDF', async () => {
    const pdfWithSize = { ...MOCK_PAYMENT_DETAILS.pdfFile!, sizeBytes: 2048 };
    mockUsePaymentDetails.mockReturnValue({
      data: { ...MOCK_PAYMENT_DETAILS, pdfFile: pdfWithSize },
      loading: false,
      error: undefined
    });
    mockUpdatePaymentDetails.mockResolvedValue({ data: undefined });
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit content' }));
    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_REQUISITES }));
    fireEvent.click(screen.getByRole('button', { name: /зберегти/i }));

    await waitFor(() => expect(mockUpdatePaymentDetails).toHaveBeenCalledTimes(1));

    const { input } = mockUpdatePaymentDetails.mock.calls[0][0].variables;
    expect(input.tabs.map((tab: { id?: string; name: string }) => tab.id ?? tab.name)).toEqual([
      'req-uah',
      'req-usd',
      'req-eur',
      'req-gbp',
      REQUISITES_MESSAGES.DEFAULT_NEW_CURRENCY
    ]);
    expect(input.tabs[0].content.content[0].content[0].text).toBe('Edited');
    expect(input.tabs[4]).not.toHaveProperty('id');
    expect(input.pdfFile).toEqual({
      filename: pdfWithSize.filename,
      url: pdfWithSize.url,
      mimeType: pdfWithSize.mimeType,
      sizeBytes: 2048
    });
  });

  it('updates the form from the response and shows success feedback after saving', async () => {
    mockUpdatePaymentDetails.mockResolvedValue({
      data: {
        updatePaymentDetails: {
          ...MOCK_PAYMENT_DETAILS,
          tabs: [{ id: 'saved-uah', name: 'UAH saved', content: MOCK_PAYMENT_DETAILS.tabs[0].content, order: 0 }]
        }
      }
    });
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: /зберегти/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(REQUISITES_MESSAGES.SAVE_SUCCESS));
    expect(screen.getByText('UAH saved')).toBeInTheDocument();
    expect(screen.queryByText('USD')).not.toBeInTheDocument();
  });

  it('disables editing, adding and renaming tabs while saving', async () => {
    let resolveSave: (value: unknown) => void = () => {};
    mockUpdatePaymentDetails.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve;
      })
    );
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: /зберегти/i }));

    expect(screen.getByTestId('custom-formatting-field')).toHaveAttribute('data-editable', 'false');
    expect(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_REQUISITES })).toBeDisabled();
    expect(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_FILE_BUTTON })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Видалити файл' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Опції реквізиту' })).not.toBeInTheDocument();

    await act(async () => {
      resolveSave({ data: { updatePaymentDetails: MOCK_PAYMENT_DETAILS } });
    });

    await waitFor(() => expect(screen.getByTestId('custom-formatting-field')).toHaveAttribute('data-editable', 'true'));
    expect(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_REQUISITES })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Опції реквізиту' })).toBeInTheDocument();
  });

  it('shows an error and keeps local edits when the response has no saved record', async () => {
    mockUpdatePaymentDetails.mockResolvedValue({ data: undefined });
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_REQUISITES }));
    fireEvent.click(screen.getByRole('button', { name: /зберегти/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(REQUISITES_MESSAGES.SAVE_ERROR));
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue(REQUISITES_MESSAGES.DEFAULT_NEW_CURRENCY)).toBeInTheDocument();
  });

  it('keeps local edits and shows an error when saving fails', async () => {
    mockUpdatePaymentDetails.mockRejectedValue(new Error('Network error'));
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_REQUISITES }));
    fireEvent.click(screen.getByRole('button', { name: /зберегти/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(REQUISITES_MESSAGES.SAVE_ERROR));
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue(REQUISITES_MESSAGES.DEFAULT_NEW_CURRENCY)).toBeInTheDocument();
  });

  it('enables adding or detaching a PDF when the form is editable', () => {
    render(<PaymentDetailsPageContent />);

    expect(screen.getByRole('button', { name: /додати файл/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Видалити файл' })).toBeEnabled();
  });

  it('detaches a PDF only on save and clears the pending removal after success', async () => {
    const savedDetails = { ...MOCK_PAYMENT_DETAILS, pdfFile: null };
    mockUpdatePaymentDetails.mockResolvedValue({ data: { updatePaymentDetails: savedDetails } });
    const { unmount } = render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Видалити файл' }));

    expect(screen.queryByTestId('attached-pdf-card')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_FILE_BUTTON })).toBeEnabled();
    expect(mockUpdatePaymentDetails).not.toHaveBeenCalled();

    const saveButton = screen.getByRole('button', { name: /зберегти/i });
    fireEvent.click(saveButton);

    await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
    expect(mockUpdatePaymentDetails.mock.calls[0][0].variables.input).toHaveProperty('pdfFile', null);
    expect(screen.queryByTestId('attached-pdf-card')).not.toBeInTheDocument();

    fireEvent.click(saveButton);
    await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(2));
    expect(mockUpdatePaymentDetails.mock.calls[1][0].variables.input).not.toHaveProperty('pdfFile');

    unmount();
    mockUsePaymentDetails.mockReturnValue({ data: savedDetails, loading: false, error: undefined });
    render(<PaymentDetailsPageContent />);
    expect(screen.queryByTestId('attached-pdf-card')).not.toBeInTheDocument();
  });

  it('keeps a detached PDF out of the draft and retries the removal after save fails', async () => {
    mockUpdatePaymentDetails
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: { updatePaymentDetails: { ...MOCK_PAYMENT_DETAILS, pdfFile: null } } });
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Видалити файл' }));
    const saveButton = screen.getByRole('button', { name: /зберегти/i });
    fireEvent.click(saveButton);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(REQUISITES_MESSAGES.SAVE_ERROR));
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.queryByTestId('attached-pdf-card')).not.toBeInTheDocument();
    expect(mockUpdatePaymentDetails.mock.calls[0][0].variables.input).toHaveProperty('pdfFile', null);

    fireEvent.click(saveButton);
    await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
    expect(mockUpdatePaymentDetails.mock.calls[1][0].variables.input).toHaveProperty('pdfFile', null);
  });

  it('opens the PDF media dialog from "Додати файл" and closes it', () => {
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_FILE_BUTTON }));

    expect(screen.getByTestId('mock-media-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'close-media' }));

    expect(screen.queryByTestId('mock-media-modal')).not.toBeInTheDocument();
  });

  it('saves a replacement PDF after detaching the original and shows it after reload', async () => {
    const replacementPdf = {
      filename: 'new-requisites.pdf',
      url: 'https://example.com/new-requisites.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 2 * 1024 * 1024
    };
    const savedDetails = { ...MOCK_PAYMENT_DETAILS, pdfFile: replacementPdf };
    mockUpdatePaymentDetails.mockResolvedValue({ data: { updatePaymentDetails: savedDetails } });
    const { unmount } = render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Видалити файл' }));
    expect(screen.queryByTestId('attached-pdf-card')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_FILE_BUTTON }));
    await act(async () => {
      await latestMediaApply?.({
        selected: {
          kind: 'gallery',
          id: 'asset-1',
          fileName: replacementPdf.filename,
          src: replacementPdf.url,
          locale: 'uk',
          sizeBytes: replacementPdf.sizeBytes
        },
        crop: null
      });
    });

    await waitFor(() =>
      expect(screen.getByRole('link', { name: replacementPdf.filename })).toHaveAttribute('href', replacementPdf.url)
    );
    expect(screen.queryByText('IMSLP912906-PMLP804595-Rondo-Basset_Clarinet.pdf')).not.toBeInTheDocument();
    expect(mockCreateAsset).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /зберегти/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(REQUISITES_MESSAGES.SAVE_SUCCESS));
    expect(mockUpdatePaymentDetails).toHaveBeenCalledTimes(1);
    expect(mockUpdatePaymentDetails.mock.calls[0][0].variables.input.pdfFile).toEqual(replacementPdf);

    unmount();
    mockUsePaymentDetails.mockReturnValue({ data: savedDetails, loading: false, error: undefined });
    render(<PaymentDetailsPageContent />);
    expect(screen.getByRole('link', { name: replacementPdf.filename })).toHaveAttribute('href', replacementPdf.url);
    expect(screen.queryByText(MOCK_PAYMENT_DETAILS_PDF.filename)).not.toBeInTheDocument();
  });

  it('creates an asset for an uploaded PDF and attaches it', async () => {
    mockCreateAsset.mockResolvedValue({
      data: {
        createAsset: {
          filename: 'uploaded.pdf',
          url: 'https://example.com/stored.pdf',
          mimeType: 'application/pdf'
        }
      }
    });
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_FILE_BUTTON }));
    await act(async () => {
      await latestMediaApply?.({
        selected: {
          kind: 'upload',
          id: 'upload-1',
          fileName: 'uploaded.pdf',
          file: new File(['pdf'], 'uploaded.pdf', { type: 'application/pdf' })
        },
        crop: null,
        uploadResult: {
          url: 'https://example.com/stored.pdf',
          filename: 'stored.pdf',
          originalName: 'uploaded.pdf',
          mimeType: 'application/pdf',
          size: 4096
        }
      });
    });

    await waitFor(() => expect(screen.getByText('uploaded.pdf')).toBeInTheDocument());
    expect(mockCreateAsset).toHaveBeenCalledWith({
      variables: {
        input: {
          filename: 'uploaded.pdf',
          url: 'https://example.com/stored.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 4096,
          type: 'PDF'
        }
      }
    });
  });

  it('rejects library PDFs larger than 20 MB and keeps the current attachment', async () => {
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_FILE_BUTTON }));
    await act(async () => {
      await latestMediaApply?.({
        selected: {
          kind: 'gallery',
          id: 'asset-2',
          fileName: 'huge.pdf',
          src: 'https://example.com/huge.pdf',
          locale: 'uk',
          sizeBytes: PAYMENT_DETAILS_PDF_MAX_SIZE_BYTES + 1
        },
        crop: null
      });
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(PAYMENT_DETAILS_MESSAGES.pdfFileMaxSize));
    expect(screen.queryByText('huge.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('IMSLP912906-PMLP804595-Rondo-Basset_Clarinet.pdf')).toBeInTheDocument();
  });

  it('shows an upload error when the PDF asset cannot be created', async () => {
    mockCreateAsset.mockResolvedValue({ data: { createAsset: null } });
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_FILE_BUTTON }));
    await act(async () => {
      await latestMediaApply?.({
        selected: {
          kind: 'upload',
          id: 'upload-2',
          fileName: 'broken.pdf',
          file: new File(['pdf'], 'broken.pdf', { type: 'application/pdf' })
        },
        crop: null,
        uploadResult: {
          url: 'https://example.com/broken.pdf',
          filename: 'broken.pdf',
          originalName: 'broken.pdf',
          mimeType: 'application/pdf',
          size: 10
        }
      });
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(REQUISITES_MESSAGES.PDF_UPLOAD_FAILED));
    expect(screen.queryByText('broken.pdf')).not.toBeInTheDocument();
  });

  it('keeps the previous attachment when the media dialog is closed before createAsset completes', async () => {
    let resolveCreateAsset: (value: unknown) => void = () => {};
    mockCreateAsset.mockReturnValue(
      new Promise((resolve) => {
        resolveCreateAsset = resolve;
      })
    );
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: REQUISITES_MESSAGES.ADD_FILE_BUTTON }));

    const applyPromise = latestMediaApply?.({
      selected: {
        kind: 'upload',
        id: 'upload-3',
        fileName: 'cancelled.pdf',
        file: new File(['pdf'], 'cancelled.pdf', { type: 'application/pdf' })
      },
      crop: null,
      uploadResult: {
        url: 'https://example.com/cancelled.pdf',
        filename: 'cancelled.pdf',
        originalName: 'cancelled.pdf',
        mimeType: 'application/pdf',
        size: 1024
      }
    });

    fireEvent.click(screen.getByRole('button', { name: 'close-media' }));

    await act(async () => {
      resolveCreateAsset({
        data: {
          createAsset: {
            filename: 'cancelled.pdf',
            url: 'https://example.com/cancelled.pdf',
            mimeType: 'application/pdf'
          }
        }
      });
      await applyPromise;
    });

    expect(screen.queryByText('cancelled.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('IMSLP912906-PMLP804595-Rondo-Basset_Clarinet.pdf')).toBeInTheDocument();
  });

  it('rejects renaming a tab to an existing name regardless of case', () => {
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Опції реквізиту' }));
    fireEvent.click(screen.getByText('Редагувати назву'));

    const input = screen.getByDisplayValue('UAH');

    fireEvent.change(input, { target: { value: 'usd' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(toast.error).toHaveBeenCalledWith(PAYMENT_DETAILS_MESSAGES.tabNameDuplicate);

    expect(screen.getByDisplayValue('usd')).toBeInTheDocument();
  });

  it('successfully renames a tab when the new name is unique', () => {
    render(<PaymentDetailsPageContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Опції реквізиту' }));
    fireEvent.click(screen.getByText('Редагувати назву'));

    const input = screen.getByDisplayValue('UAH');

    fireEvent.change(input, { target: { value: 'CAD' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('CAD')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('CAD')).not.toBeInTheDocument();

    expect(toast.error).not.toHaveBeenCalled();
  });
});
