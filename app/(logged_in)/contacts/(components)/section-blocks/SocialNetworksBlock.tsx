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
  onPlatformMenuOpen: (itemId: number, anchor: HTMLElement) => void;
  onItemChange: (item: SocialNetworkFormItem) => void;
}>;

const SocialNetworkField = ({ item, onPlatformMenuOpen, onItemChange }: SocialNetworkFieldProps) => {
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
      onIconClick={(event) => onPlatformMenuOpen(item.id, event.currentTarget)}
      label="URL"
      value={item.link}
      onChange={(link) => onItemChange({ ...item, link })}
      iconButtonVariant={selectedOption ? 'filled' : 'outlined'}
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
}>;

export const SocialNetworksBlock = ({ items, onChange }: SocialNetworksBlockProps) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [activeItemId, setActiveItemId] = useState<number | null>(null);

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

  const openPlatformMenu = (itemId: number, anchor: HTMLElement) => {
    setActiveItemId(itemId);
    setMenuAnchor(anchor);
  };

  const closePlatformMenu = () => {
    setActiveItemId(null);
    setMenuAnchor(null);
  };

  const selectPlatform = (platform: SocialNetworkPlatform) => {
    if (activeItemId === null) return;

    onChange(items.map((item) => (item.id === activeItemId ? { ...item, platform } : item)));

    closePlatformMenu();
  };

  return (
    <Box sx={styles.container}>
      <ContentSectionHeader title="Ми в соцмережах" />

      <ConfigurableList<SocialNetworkFormItem>
        items={items}
        renderItem={({ item }) => (
          <SocialNetworkField item={item} onPlatformMenuOpen={openPlatformMenu} onItemChange={updateSocialNetwork} />
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
