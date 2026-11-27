import { fireEvent, render, screen } from '@testing-library/react';

import { SOCIAL_NETWORKS } from '../../__mocks__/contacts';
import {
  SOCIAL_NETWORK_ADD_LABEL,
  SOCIAL_NETWORK_DELETE_LABEL,
  SOCIAL_NETWORK_FIELD_LABEL,
  SOCIAL_NETWORK_ICON_LABEL,
  SOCIAL_NETWORK_SELECT_PREFIX,
  SOCIAL_NETWORK_SELECT_WITHOUT_ANCHOR_LABEL,
  SOCIAL_NETWORK_UPDATE_LABEL
} from '../__mocks__/ContactsMocks';
import { SocialNetworksBlock } from './SocialNetworksBlock';
import { MAX_SOCIAL_NETWORKS_COUNT } from '~/constants/contacts';
import { contactsValidationErrors } from '~/src/constants/errors';

jest.mock('~/components/configurable-list/ConfigurableList', () => {
  const { MockConfigurableList } = jest.requireActual('../__mocks__/ContactsMocks');
  return { __esModule: true, default: MockConfigurableList };
});
jest.mock('~/shared/components/icon-picker-menu/IconPickerMenu', () => {
  const { MockIconPickerMenu } = jest.requireActual('../__mocks__/ContactsMocks');
  return { IconPickerMenu: MockIconPickerMenu };
});
jest.mock('~/shared/components/icon-text-field/IconTextField', () => {
  const { MockIconTextField } = jest.requireActual('../__mocks__/ContactsMocks');
  return { IconTextField: MockIconTextField };
});

const onChange = jest.fn();
const onFieldChange = jest.fn();

const EMPTY_SOCIAL_NETWORK = { id: 0, link: '' } as const;
const NEW_SOCIAL_NETWORK = { id: SOCIAL_NETWORKS.at(-1)!.id + 1, link: '' } as const;
const UPDATED_SOCIAL_LINK = 'https://updated.example';
const TYPED_SOCIAL_LINK = 'https://typed.example';
const SELECTED_PLATFORM = 'youtube' as const;

describe('SocialNetworksBlock', () => {
  it('adds, updates and removes social networks', () => {
    const onChange = jest.fn();
    const onFieldChange = jest.fn();
    const onFieldBlur = jest.fn();
    render(
      <SocialNetworksBlock
        items={SOCIAL_NETWORKS}
        onChange={onChange}
        onFieldChange={onFieldChange}
        onFieldBlur={onFieldBlur}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: SOCIAL_NETWORK_ADD_LABEL }));
    expect(onChange).toHaveBeenCalledWith([...SOCIAL_NETWORKS, NEW_SOCIAL_NETWORK]);
    fireEvent.click(screen.getByRole('button', { name: `${SOCIAL_NETWORK_UPDATE_LABEL}-0` }));
    expect(onChange).toHaveBeenCalledWith([{ ...SOCIAL_NETWORKS[0], link: UPDATED_SOCIAL_LINK }, SOCIAL_NETWORKS[1]]);
    fireEvent.change(screen.getAllByRole('textbox', { name: SOCIAL_NETWORK_FIELD_LABEL })[0], {
      target: { value: TYPED_SOCIAL_LINK }
    });
    expect(onChange).toHaveBeenCalledWith([{ ...SOCIAL_NETWORKS[0], link: TYPED_SOCIAL_LINK }, SOCIAL_NETWORKS[1]]);
    expect(onFieldChange).toHaveBeenCalledWith(0);
    fireEvent.blur(screen.getAllByRole('textbox', { name: SOCIAL_NETWORK_FIELD_LABEL })[0]);
    expect(onFieldBlur).toHaveBeenCalledWith(0);
    fireEvent.click(screen.getByRole('button', { name: `${SOCIAL_NETWORK_DELETE_LABEL}-1` }));
    expect(onChange).toHaveBeenCalledWith([SOCIAL_NETWORKS[0]]);
  });

  it('starts ids at zero when adding to an empty list', () => {
    const onChange = jest.fn();
    render(<SocialNetworksBlock items={[]} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: SOCIAL_NETWORK_ADD_LABEL }));

    expect(onChange).toHaveBeenCalledWith([EMPTY_SOCIAL_NETWORK]);
  });

  it('preserves overlength links for correction', () => {
    const onChange = jest.fn();
    const overlengthLink = `https://${'a'.repeat(143)}`;
    render(<SocialNetworksBlock items={SOCIAL_NETWORKS} onChange={onChange} />);

    fireEvent.change(screen.getAllByRole('textbox', { name: SOCIAL_NETWORK_FIELD_LABEL })[0], {
      target: { value: overlengthLink }
    });

    expect(onChange).toHaveBeenCalledWith([
      { ...SOCIAL_NETWORKS[0], link: overlengthLink },
      SOCIAL_NETWORKS[1]
    ]);
  });

  it('disables adding at the row limit and re-enables it after a row is removed', () => {
    const onChange = jest.fn();
    const itemsAtLimit = Array.from({ length: MAX_SOCIAL_NETWORKS_COUNT }, (_, id) => ({
      ...SOCIAL_NETWORKS[0],
      id
    }));
    const { rerender } = render(<SocialNetworksBlock items={itemsAtLimit} onChange={onChange} />);
    const addButton = screen.getByRole('button', { name: SOCIAL_NETWORK_ADD_LABEL });

    expect(addButton).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(contactsValidationErrors.SOCIAL_NETWORKS_LIMIT_REACHED);

    rerender(<SocialNetworksBlock items={itemsAtLimit.slice(1)} onChange={onChange} />);

    expect(screen.getByRole('button', { name: SOCIAL_NETWORK_ADD_LABEL })).toBeEnabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('updates a network when field callbacks are not provided', () => {
    render(<SocialNetworksBlock items={SOCIAL_NETWORKS} onChange={onChange} />);

    const socialNetworkInput = screen.getAllByRole('textbox', { name: SOCIAL_NETWORK_FIELD_LABEL })[0];
    fireEvent.change(socialNetworkInput, { target: { value: TYPED_SOCIAL_LINK } });
    fireEvent.blur(socialNetworkInput);

    expect(onChange).toHaveBeenCalledWith([{ ...SOCIAL_NETWORKS[0], link: TYPED_SOCIAL_LINK }, SOCIAL_NETWORKS[1]]);
  });

  it('opens the platform menu and updates the selected platform', () => {
    render(<SocialNetworksBlock items={SOCIAL_NETWORKS} onChange={onChange} onFieldChange={onFieldChange} />);

    fireEvent.click(screen.getAllByRole('button', { name: SOCIAL_NETWORK_ICON_LABEL })[0]);
    fireEvent.click(screen.getByRole('button', { name: `${SOCIAL_NETWORK_SELECT_PREFIX}${SELECTED_PLATFORM}` }));

    expect(onChange).toHaveBeenCalledWith([{ ...SOCIAL_NETWORKS[0], platform: SELECTED_PLATFORM }, SOCIAL_NETWORKS[1]]);
    expect(onFieldChange).toHaveBeenCalledWith(0);
    expect(screen.queryByTestId('icon-picker')).not.toBeInTheDocument();
  });

  it('supports a new network without a selected platform', () => {
    render(<SocialNetworksBlock items={[...SOCIAL_NETWORKS, NEW_SOCIAL_NETWORK]} onChange={jest.fn()} />);

    expect(screen.getAllByRole('button', { name: SOCIAL_NETWORK_ICON_LABEL })).toHaveLength(3);
  });

  it('ignores platform selection when no item menu is open', () => {
    const onChange = jest.fn();
    render(<SocialNetworksBlock items={SOCIAL_NETWORKS} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: SOCIAL_NETWORK_SELECT_WITHOUT_ANCHOR_LABEL }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
