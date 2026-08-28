'use client';

import { Facebook, Instagram, YouTube } from '@mui/icons-material';
import LinkIcon from '@mui/icons-material/Link';
import { Box } from '@mui/material';
import { ReactNode, useState } from 'react';

import { HeaderRow } from '../../(shared)/HeaderRow';
import { IconPickerMenu } from '../../(shared)/IconPickerMenu';
import { IconTextField } from '../../(shared)/IconTextField';
import ConfigurableList from '~/components/configurable-list/ConfigurableList';

type SocialNetworkPlatform = 'instagram' | 'facebook' | 'youtube' | 'other';

type SocialNetworkItem = {
  id: string;
  platform?: SocialNetworkPlatform;
  link: string;
};

type SocialNetworkOption = {
  value: SocialNetworkPlatform;
  label: string;
  icon: ReactNode;
};

const SOCIAL_NETWORK_OPTIONS: readonly SocialNetworkOption[] = [
  { value: 'facebook', label: 'Facebook', icon: <Facebook fontSize="small" /> },
  { value: 'instagram', label: 'Instagram', icon: <Instagram fontSize="small" /> },
  { value: 'youtube', label: 'YouTube', icon: <YouTube fontSize="small" /> },
  { value: 'other', label: 'Інше', icon: <LinkIcon fontSize="small" /> }
];

export const SocialNetworksBlock = () => {
  const [socialNetworks, setSocialNetworks] = useState<SocialNetworkItem[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const addSocialNetwork = () => {
    setSocialNetworks((currentItems) => [...currentItems, { id: crypto.randomUUID(), link: '' }]);
  };

  const updateSocialNetwork = (updatedItem: SocialNetworkItem) => {
    setSocialNetworks((currentItems) => currentItems.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  };

  const removeSocialNetwork = (id: string) => {
    setSocialNetworks((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const openPlatformMenu = (itemId: string, anchor: HTMLElement) => {
    setActiveItemId(itemId);
    setMenuAnchor(anchor);
  };

  const closePlatformMenu = () => {
    setActiveItemId(null);
    setMenuAnchor(null);
  };

  const selectPlatform = (platform: SocialNetworkPlatform) => {
    if (!activeItemId) return;

    setSocialNetworks((currentItems) =>
      currentItems.map((item) => (item.id === activeItemId ? { ...item, platform } : item))
    );

    closePlatformMenu();
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <HeaderRow title="Ми в соцмережах" />

      <ConfigurableList<SocialNetworkItem>
        items={socialNetworks}
        renderItem={({ item }) => {
          const selectedOption = SOCIAL_NETWORK_OPTIONS.find((option) => option.value === item.platform);

          return (
            <IconTextField
              icon={selectedOption?.icon}
              onIconClick={(event) => openPlatformMenu(item.id, event.currentTarget)}
              label="URL"
              value={item.link}
              onChange={(link) => updateSocialNetwork({ ...item, link })}
              iconButtonVariant={selectedOption ? 'filled' : 'outlined'}
            />
          );
        }}
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
        getOptionIcon={(option) => option.icon}
        onClose={closePlatformMenu}
        onSelect={(option) => selectPlatform(option.value)}
      />
    </Box>
  );
};
