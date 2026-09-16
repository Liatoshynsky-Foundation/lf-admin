'use client';

import { Box } from '@mui/material';
import { useState } from 'react';

import {
  SOCIAL_NETWORK_OPTIONS,
  SocialNetworkFormItem,
  SocialNetworkOption,
  SocialNetworkPlatform
} from '../../../../constants/contacts';
import { ContentSectionHeader } from '../../../../shared/components/content-section-header/ContentSectionHeader';
import { IconPickerMenu } from '../../../../shared/components/icon-picker-menu/IconPickerMenu';
import { IconTextField } from '../../../../shared/components/icon-text-field/IconTextField';
import { styles } from './SocialNetworksBlock.styles';
import ConfigurableList from '~/components/configurable-list/ConfigurableList';

type SocialNetworkFieldProps = Readonly<{
  item: SocialNetworkFormItem;
  index: number;
  onPlatformMenuOpen: (index: number, anchor: HTMLElement) => void;
  onItemChange: (item: SocialNetworkFormItem) => void;
  errors: Record<string, string>;
  onFieldChange: (index: number) => void;
  onFieldBlur: (index: number) => void;
}>;

const SocialNetworkField = ({
  item,
  onPlatformMenuOpen,
  onItemChange,
  errors,
  index,
  onFieldChange,
  onFieldBlur
}: SocialNetworkFieldProps) => {
  const selectedOption = SOCIAL_NETWORK_OPTIONS.find((option) => option.value === item.platform);
  const Icon = selectedOption?.icon;

  return (
    <IconTextField
      icon={
        Icon ? (
          <Box sx={styles.icon}>
            <Icon fontSize="small" />
          </Box>
        ) : undefined
      }
      onIconClick={(event) => onPlatformMenuOpen(index, event.currentTarget)}
      label="URL"
      value={item.link}
      onChange={(link) => {
        onItemChange({ ...item, link });
        onFieldChange(index);
      }}
      iconButtonVariant={selectedOption ? 'filled' : 'outlined'}
      error={Boolean(errors[`${index}.link`] || errors[`${index}.icon`])}
      helperText={errors[`${index}.link`] || errors[`${index}.icon`]}
      onBlur={() => onFieldBlur(index)}
    />
  );
};

const renderSocialNetworkOptionIcon = (option: SocialNetworkOption) => {
  const Icon = option.icon;

  return (
    <Box sx={styles.icon}>
      <Icon fontSize="small" />
    </Box>
  );
};

type SocialNetworksBlockProps = Readonly<{
  items: SocialNetworkFormItem[];
  onChange: (items: SocialNetworkFormItem[]) => void;
  errors?: Record<string, string>;
  onFieldChange?: (index: number) => void;
  onFieldBlur?: (index: number) => void;
}>;

export const SocialNetworksBlock = ({
  items,
  onChange,
  errors = {},
  onFieldChange = () => undefined,
  onFieldBlur = () => undefined
}: SocialNetworksBlockProps) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const addSocialNetwork = () => {
    const nextId = (items.at(-1)?.id ?? -1) + 1;

    onChange([...items, { id: nextId, link: '' }]);
  };

  const updateSocialNetwork = (updatedItem: SocialNetworkFormItem) => {
    onChange(items.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  };

  const removeSocialNetwork = (id: number) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const openPlatformMenu = (index: number, anchor: HTMLElement) => {
    setActiveItemIndex(index);
    setMenuAnchor(anchor);
  };

  const closePlatformMenu = () => {
    setActiveItemIndex(null);
    setMenuAnchor(null);
  };

  const selectPlatform = (platform: SocialNetworkPlatform) => {
    if (activeItemIndex === null) return;

    onChange(items.map((item, index) => (index === activeItemIndex ? { ...item, platform } : item)));
    onFieldChange(activeItemIndex);

    closePlatformMenu();
  };

  return (
    <Box sx={styles.container}>
      <ContentSectionHeader title="Ми в соцмережах" />

      <ConfigurableList<SocialNetworkFormItem>
        items={items}
        renderItem={({ item, index }) => (
          <SocialNetworkField
            item={item}
            index={index}
            onPlatformMenuOpen={openPlatformMenu}
            onItemChange={updateSocialNetwork}
            errors={errors}
            onFieldChange={onFieldChange}
            onFieldBlur={onFieldBlur}
          />
        )}
        addBtnLabel="Додати соціальну мережу"
        editable
        allowFirstItemDeletion
        onCreate={addSocialNetwork}
        onChange={updateSocialNetwork}
        onDelete={removeSocialNetwork}
      />

      <IconPickerMenu
        anchorEl={menuAnchor}
        options={SOCIAL_NETWORK_OPTIONS}
        getOptionKey={(option) => option.value}
        getOptionIcon={renderSocialNetworkOptionIcon}
        onClose={closePlatformMenu}
        onSelect={(option) => selectPlatform(option.value)}
      />
    </Box>
  );
};
