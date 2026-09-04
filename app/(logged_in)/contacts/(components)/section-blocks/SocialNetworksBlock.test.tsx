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

const EMPTY_SOCIAL_NETWORK = { id: 0, link: '' } as const;
const NEW_SOCIAL_NETWORK = { id: SOCIAL_NETWORKS.at(-1)!.id + 1, link: '' } as const;
const UPDATED_SOCIAL_LINK = 'https://updated.example';
const TYPED_SOCIAL_LINK = 'https://typed.example';
const SELECTED_PLATFORM = 'youtube' as const;

describe('SocialNetworksBlock', () => {
  it('adds, updates and removes social networks', () => {
    const onChange = jest.fn();
    render(<SocialNetworksBlock items={SOCIAL_NETWORKS} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: SOCIAL_NETWORK_ADD_LABEL }));
    expect(onChange).toHaveBeenCalledWith([...SOCIAL_NETWORKS, NEW_SOCIAL_NETWORK]);
    fireEvent.click(screen.getByRole('button', { name: `${SOCIAL_NETWORK_UPDATE_LABEL}-0` }));
    expect(onChange).toHaveBeenCalledWith([{ ...SOCIAL_NETWORKS[0], link: UPDATED_SOCIAL_LINK }, SOCIAL_NETWORKS[1]]);
    fireEvent.change(screen.getAllByRole('textbox', { name: SOCIAL_NETWORK_FIELD_LABEL })[0], {
      target: { value: TYPED_SOCIAL_LINK }
    });
    expect(onChange).toHaveBeenCalledWith([{ ...SOCIAL_NETWORKS[0], link: TYPED_SOCIAL_LINK }, SOCIAL_NETWORKS[1]]);
    fireEvent.click(screen.getByRole('button', { name: `${SOCIAL_NETWORK_DELETE_LABEL}-1` }));
    expect(onChange).toHaveBeenCalledWith([SOCIAL_NETWORKS[0]]);
  });

  it('starts ids at zero when adding to an empty list', () => {
    const onChange = jest.fn();
    render(<SocialNetworksBlock items={[]} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: SOCIAL_NETWORK_ADD_LABEL }));

    expect(onChange).toHaveBeenCalledWith([EMPTY_SOCIAL_NETWORK]);
  });

  it('opens the platform menu and updates the selected platform', () => {
    const onChange = jest.fn();
    render(<SocialNetworksBlock items={SOCIAL_NETWORKS} onChange={onChange} />);

    fireEvent.click(screen.getAllByRole('button', { name: SOCIAL_NETWORK_ICON_LABEL })[0]);
    fireEvent.click(screen.getByRole('button', { name: `${SOCIAL_NETWORK_SELECT_PREFIX}${SELECTED_PLATFORM}` }));

    expect(onChange).toHaveBeenCalledWith([{ ...SOCIAL_NETWORKS[0], platform: SELECTED_PLATFORM }, SOCIAL_NETWORKS[1]]);
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
