import { scrollToFirstInvalidField } from './scrollToFirstInvalidField';

describe('scrollToFirstInvalidField', () => {
  const scrollIntoView = jest.fn();
  const focus = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('scrolls to and focuses the first invalid field after timeout', () => {
    const invalidField = { scrollIntoView, focus } as unknown as HTMLElement;
    jest.spyOn(document, 'querySelector').mockReturnValue(invalidField);

    scrollToFirstInvalidField();
    jest.runAllTimers();

    expect(document.querySelector).toHaveBeenCalledWith('[aria-invalid="true"]');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('uses a custom selector and scroll behavior when provided', () => {
    const invalidField = { scrollIntoView, focus } as unknown as HTMLElement;
    jest.spyOn(document, 'querySelector').mockReturnValue(invalidField);

    scrollToFirstInvalidField({ selector: '[data-testid="alt-error"]', behavior: 'auto' });
    jest.runAllTimers();

    expect(document.querySelector).toHaveBeenCalledWith('[data-testid="alt-error"]');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'center' });
  });

  it('does nothing when no invalid field is found', () => {
    jest.spyOn(document, 'querySelector').mockReturnValue(null);

    scrollToFirstInvalidField();
    jest.runAllTimers();

    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(focus).not.toHaveBeenCalled();
  });
});
