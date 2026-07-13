import { Box, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';

import { styles } from './GroupPerformancesSection.styles';
import { GroupPerformance } from '~/constants/creativity';
import { EditorLanguage } from '~/constants/publications';
import { generateUniqueId } from '~/lib/utils/generateUniqueId';
import PlusIcon from '~/public/icons/plus.svg';
import TrashIcon from '~/public/icons/trash.svg';
import DeleteCardModal from '~/shared/components/delete-card-modal/DeleteCardModal';
import Button from '~/shared/components/design-system/button/Button';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';

type GroupPerformancesSectionProps = {
  currentLanguage: EditorLanguage;
  sectionTitle: string;
  performances: GroupPerformance[];
  onChangeSectionTitle: (title: string) => void;
  onChangePerformances: (performances: GroupPerformance[]) => void;
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
  currentLanguage,
  sectionTitle,
  performances,
  onChangeSectionTitle,
  onChangePerformances
}: GroupPerformancesSectionProps) => {
  const langKey = currentLanguage === 'UA' ? 'uk' : 'en';

  const [performanceIdToDelete, setPerformanceIdToDelete] = useState<string | null>(null);

  const handleAddPerformance = () => {
    const newPerformance: GroupPerformance = {
      id: generateUniqueId(),
      url: '',
      caption: { uk: '', en: '' }
    };
    onChangePerformances([...performances, newPerformance]);
  };

  const handleConfirmDelete = () => {
    if (performanceIdToDelete) {
      onChangePerformances(performances.filter((item) => item.id !== performanceIdToDelete));
      setPerformanceIdToDelete(null);
    }
  };

  const handleUpdateUrl = (idToUpdate: string, value: string) => {
    onChangePerformances(
      performances.map((item) => (item.id === idToUpdate ? { ...item, url: value } : item))
    );
  };

  const handleUpdateCaption = (idToUpdate: string, value: string) => {
    onChangePerformances(
      performances.map((item) =>
        item.id === idToUpdate
          ? {
            ...item,
            caption: {
              uk: item.caption?.uk || '',
              en: item.caption?.en || '',
              [langKey]: value           
            }
          }
          : item
      )
    );
  };

  return (
    <>
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
                  title={renderLinkPreview(item.url || '')}
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
                      onChange={(e) => handleUpdateUrl(item.id || '', e.target.value)}
                      fullWidth
                    />
                  </Box>
                </Tooltip>

                <CustomTextField
                  label="Підпис"
                  value={item.caption?.[langKey] || ''}
                  onChange={(e) => handleUpdateCaption(item.id || '', e.target.value)}
                  fullWidth
                />
              </Box>

              <IconButton onClick={() => setPerformanceIdToDelete(item.id || '')} sx={styles.actionIcon}>
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
    </>
  );
};
