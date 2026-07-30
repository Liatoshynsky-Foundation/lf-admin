import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { SVGProps } from 'react';

import type { MediaModalTab } from '../../MediaModal.types';
import { MockDsButton } from '../../test-utils/mockDsButton';
import { MediaModalSwitcher } from './MediaModalSwitcher';

jest.mock('~/public/icons/gallery.svg', () => ({
  __esModule: true,
  default: (props: SVGProps<SVGSVGElement>) => <svg {...props} />
}));

jest.mock('~/public/icons/upload.svg', () => ({
  __esModule: true,
  default: (props: SVGProps<SVGSVGElement>) => <svg {...props} />
}));

jest.mock('~/public/icons/fileClock.svg', () => ({
  __esModule: true,
  default: (props: SVGProps<SVGSVGElement>) => <svg {...props} />
}));

jest.mock('~/shared/components/design-system/button/Button', () => ({
  __esModule: true,
  default: MockDsButton
}));

describe('MediaModalSwitcher', () => {
  it('should render 3 tabs and call onChange with correct tab', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn<void, [MediaModalTab]>();

    render(<MediaModalSwitcher value="GALLERY" onChange={onChange} />);

    expect(screen.getByTestId('MediaModalSwitcher')).toHaveAttribute('role', 'tablist');

    expect(screen.getByTestId('MediaModalSwitcher-galleryTab')).toHaveAttribute('role', 'tab');
    expect(screen.getByTestId('MediaModalSwitcher-uploadTab')).toHaveAttribute('role', 'tab');
    expect(screen.getByTestId('MediaModalSwitcher-usedTab')).toHaveAttribute('role', 'tab');

    expect(screen.getByTestId('MediaModalSwitcher-galleryTab')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('MediaModalSwitcher-uploadTab')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByTestId('MediaModalSwitcher-usedTab')).toHaveAttribute('aria-selected', 'false');

    await user.click(screen.getByTestId('MediaModalSwitcher-uploadTab'));
    expect(onChange).toHaveBeenCalledWith('UPLOAD');

    await user.click(screen.getByTestId('MediaModalSwitcher-usedTab'));
    expect(onChange).toHaveBeenCalledWith('USED');
    await user.click(screen.getByTestId('MediaModalSwitcher-galleryTab'));
    expect(onChange).toHaveBeenCalledWith('GALLERY');
  });

  it('should set correct tabIndex for active/inactive tabs', () => {
    const onChange = jest.fn<void, [MediaModalTab]>();

    render(<MediaModalSwitcher value="USED" onChange={onChange} />);

    expect(screen.getByTestId('MediaModalSwitcher-usedTab')).toHaveAttribute('tabindex', '0');
    expect(screen.getByTestId('MediaModalSwitcher-galleryTab')).toHaveAttribute('tabindex', '-1');
    expect(screen.getByTestId('MediaModalSwitcher-uploadTab')).toHaveAttribute('tabindex', '-1');
  });

  it('should set correct active attributes when value is UPLOAD', () => {
    const onChange = jest.fn<void, [MediaModalTab]>();

    render(<MediaModalSwitcher value="UPLOAD" onChange={onChange} />);

    expect(screen.getByTestId('MediaModalSwitcher-uploadTab')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('MediaModalSwitcher-uploadTab')).toHaveAttribute('tabindex', '0');
    expect(screen.getByTestId('MediaModalSwitcher-galleryTab')).toHaveAttribute('aria-selected', 'false');
  });
});
