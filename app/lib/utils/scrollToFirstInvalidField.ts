type ScrollToFirstInvalidFieldOptions = {
  selector?: string;
  behavior?: ScrollBehavior;
};

export const scrollToFirstInvalidField = ({
  selector = '[aria-invalid="true"]',
  behavior = 'smooth'
}: ScrollToFirstInvalidFieldOptions = {}) => {
  window.setTimeout(() => {
    const invalidField = document.querySelector<HTMLElement>(selector);
    if (!invalidField) return;

    invalidField.scrollIntoView({ behavior, block: 'center' });
    invalidField.focus({ preventScroll: true });
  }, 0);
};
