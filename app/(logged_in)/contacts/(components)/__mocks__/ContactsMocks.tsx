import type { ConfigurableListProps } from '~/components/configurable-list/ConfigurableList';
import type { SocialNetworkFormItem } from '~/constants/contacts';
import type { IconPickerMenuProps } from '~/shared/components/icon-picker-menu/IconPickerMenu';
import type { IconTextFieldProps } from '~/shared/components/icon-text-field/IconTextField';

export const SOCIAL_NETWORK_ADD_LABEL = 'add network';
export const SOCIAL_NETWORK_UPDATE_LABEL = 'update';
export const SOCIAL_NETWORK_DELETE_LABEL = 'delete';
export const SOCIAL_NETWORK_ICON_LABEL = 'choose icon';
export const SOCIAL_NETWORK_FIELD_LABEL = 'URL';
export const SOCIAL_NETWORK_SELECT_PREFIX = 'select-';
export const SOCIAL_NETWORK_SELECT_WITHOUT_ANCHOR_LABEL = 'select-without-anchor';

export const MockIconTextField = ({ value, onChange, onIconClick }: IconTextFieldProps) => (
  <div>
    <button onClick={onIconClick}>choose icon</button>
    <input aria-label={SOCIAL_NETWORK_FIELD_LABEL} value={value} onChange={(event) => onChange(event.target.value)} />
  </div>
);

export const MockConfigurableList = ({
  items,
  onCreate,
  onChange,
  onDelete,
  renderItem
}: ConfigurableListProps<SocialNetworkFormItem>) => (
  <div>
    {items.map((item, index) => (
      <div key={item.id} data-testid={`social-${item.id}`}>
        {renderItem({
          item,
          onChange: (updatedItem) => onChange(updatedItem),
          onDelete: () => onDelete(item.id),
          index
        })}
        <button onClick={() => onDelete(item.id)}>{`${SOCIAL_NETWORK_DELETE_LABEL}-${item.id}`}</button>
        <button
          onClick={() => onChange({ ...item, link: 'https://updated.example' })}
        >{`${SOCIAL_NETWORK_UPDATE_LABEL}-${item.id}`}</button>
      </div>
    ))}
    <button onClick={onCreate}>{SOCIAL_NETWORK_ADD_LABEL}</button>
  </div>
);

type MockIconPickerOption = { value: string };

export const MockIconPickerMenu = ({
  anchorEl,
  options,
  getOptionKey,
  getOptionIcon,
  onClose,
  onSelect
}: IconPickerMenuProps<MockIconPickerOption>) => (
  <>
    <button onClick={() => onSelect(options[0])}>{SOCIAL_NETWORK_SELECT_WITHOUT_ANCHOR_LABEL}</button>
    {anchorEl ? (
      <div data-testid="icon-picker">
        {options.map((option) => {
          getOptionIcon(option);
          return (
            <div key={getOptionKey(option)}>
              <button onClick={() => onSelect(option)}>{`${SOCIAL_NETWORK_SELECT_PREFIX}${option.value}`}</button>
            </div>
          );
        })}
        <button onClick={onClose}>close menu</button>
      </div>
    ) : null}
  </>
);
