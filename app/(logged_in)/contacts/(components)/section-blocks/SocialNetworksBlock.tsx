'use client';

import { Box } from '@mui/material';
import { useState } from 'react';

import {
  SOCIAL_NETWORK_OPTIONS,
  SocialNetworkFormItem,
  SocialNetworkOption,
  SocialNetworkPlatform
} from '../../../../constants/contacts';
import { HeaderRow } from '../../(shared)/HeaderRow';
import { IconPickerMenu } from '../../(shared)/IconPickerMenu';
import { IconTextField } from '../../(shared)/IconTextField';
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
      icon={Icon ? <Icon fontSize="small" /> : undefined}
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

  return <Icon fontSize="small" />;
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
    if (!activeItemId) return;

    onChange(items.map((item) => (item.id === activeItemId ? { ...item, platform } : item)));

    closePlatformMenu();
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <HeaderRow title="Ми в соцмережах" />

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
