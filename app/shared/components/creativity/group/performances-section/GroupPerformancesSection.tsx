import { Box, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';

import { styles } from './GroupPerformancesSection.styles';
import { GroupPerformance } from '~/constants/creativity';
import PlusIcon from '~/public/icons/plus.svg';
import TrashIcon from '~/public/icons/trash.svg';
import DeleteCardModal from '~/shared/components/delete-card-modal/DeleteCardModal';
import Button from '~/shared/components/design-system/button/Button';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';

type GroupPerformancesSectionProps = {
  sectionTitle: string;
  performances: GroupPerformance[];
  onChangeSectionTitle: (title: string) => void;
  onChangePerformances: (performances: GroupPerformance[]) => void;
};

const generateUniqueId = (): string => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
   
  const array = new Uint32Array(1);
  globalThis.crypto.getRandomValues(array);
  return `ui-${Date.now()}-${array[0].toString(36)}`;
};

const renderLinkPreview = (url: string) => {
  if (!url) return null;

  const validUrl = url.startsWith('http') ? url : `https://${url}`;

  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/;
  const ytMatch = regex.exec(url);

  if (ytMatch) {
    const videoId = ytMatch[1];
    return (
      <Box
        component="a"
        href={validUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
      >
        <Box
          component="img"
          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
          alt="YouTube Preview"
          sx={styles.tooltipView}
        />
        <Typography variant="caption" sx={styles.videoText}>
          Відкрити відео
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="a" href={validUrl} target="_blank" rel="noopener noreferrer" sx={styles.linkText}>
      Перейти за посиланням
    </Box>
  );
};

export const GroupPerformancesSection = ({
  sectionTitle,
  performances,
  onChangeSectionTitle,
  onChangePerformances
}: GroupPerformancesSectionProps) => {
  const [performanceIdToDelete, setPerformanceIdToDelete] = useState<string | null>(null);

  const handleAddPerformance = () => {
    const newPerformance: GroupPerformance = {
      id: generateUniqueId(),
      url: '',
      caption: ''
    };
    onChangePerformances([...performances, newPerformance]);
  };

  const handleConfirmDelete = () => {
    if (performanceIdToDelete) {
      onChangePerformances(performances.filter((item) => item.id !== performanceIdToDelete));
      setPerformanceIdToDelete(null);
    }
  };

  const handleUpdatePerformance = (idToUpdate: string, field: keyof GroupPerformance, value: string) => {
    onChangePerformances(performances.map((item) => (item.id === idToUpdate ? { ...item, [field]: value } : item)));
  };

  return (
    <CollapsibleBlock title="Всі версії виконання опису" defaultExpanded>
      <Box sx={styles.mainContainer}>
        <CustomTextField
          label="Заголовок секції"
          value={sectionTitle}
          onChange={(e) => onChangeSectionTitle(e.target.value)}
          fullWidth
        />

        <Box sx={styles.headerRow}>
          <Typography variant="body2" color="text.secondary" sx={styles.typographyTitle}>
            Пункти секції:
          </Typography>
          <Divider sx={styles.divider} />
        </Box>

        <Box sx={styles.performancesList}>
          {performances.map((item) => (
            <Box key={item.id} sx={styles.performanceItemRow}>
              <Box sx={styles.inputsWrapper}>
                <Tooltip
                  title={renderLinkPreview(item.url)}
                  placement="top-start"
                  enterDelay={400}
                  slotProps={{
                    tooltip: {
                      sx: styles.tooltipBox
                    }
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    {' '}
                    <CustomTextField
                      label="Canonical URL"
                      value={item.url}
                      onChange={(e) => handleUpdatePerformance(item.id, 'url', e.target.value)}
                      fullWidth
                    />
                  </Box>
                </Tooltip>

                <CustomTextField
                  label="Підпис"
                  value={item.caption}
                  onChange={(e) => handleUpdatePerformance(item.id, 'caption', e.target.value)}
                  fullWidth
                />
              </Box>

              <IconButton onClick={() => setPerformanceIdToDelete(item.id)} sx={styles.actionIcon}>
                <TrashIcon />
              </IconButton>
            </Box>
          ))}
        </Box>

        <Box sx={styles.addBtnWrapper}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PlusIcon />}
            onClick={handleAddPerformance}
            sx={styles.addBtn}
          >
            Додати пункт
          </Button>
        </Box>
      </Box>

      <DeleteCardModal
        open={Boolean(performanceIdToDelete)}
        onClose={() => setPerformanceIdToDelete(null)}
        onDelete={handleConfirmDelete}
        description="Ви збираєтеся видалити цей пункт. Ви впевнені, що хочете продовжити?"
      />
    </CollapsibleBlock>
  );
};
