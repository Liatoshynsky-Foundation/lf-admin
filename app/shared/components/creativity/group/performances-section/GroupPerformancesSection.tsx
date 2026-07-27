import { DragEndEvent } from '@dnd-kit/core';
import { Box, Divider, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import { styles } from './GroupPerformancesSection.styles';
import { PerformanceRow } from './PerformanceRow';
import { GroupPerformance, NormalizedGroupPerformance } from '~/constants/creativity';
import { OPUS_FIELD_LIMITS } from '~/constants/opus';
import { EditorLanguage } from '~/constants/publications';
import { generateUniqueId } from '~/lib/utils/generateUniqueId';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import PlusIcon from '~/public/icons/plus.svg';
import DeleteCardModal from '~/shared/components/delete-card-modal/DeleteCardModal';
import Button from '~/shared/components/design-system/button/Button';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';

type GroupPerformancesSectionProps = {
  currentLanguage: EditorLanguage;
  sectionTitle: string;
  performances: GroupPerformance[];
  errors?: Record<string, string>;
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

const MAX_PERFORMANCES = OPUS_FIELD_LIMITS.maxPerformances;

export const GroupPerformancesSection = ({
  currentLanguage,
  sectionTitle,
  performances,
  errors,
  onChangeSectionTitle,
  onChangePerformances
}: GroupPerformancesSectionProps) => {
  const langKey = currentLanguage === 'UA' ? 'uk' : 'en';
  const [performanceIdToDelete, setPerformanceIdToDelete] = useState<string | null>(null);

  const preparedPerformances = useMemo(() => {
    return performances.map((item) => ({
      ...item,
      id: item.id || generateUniqueId()
    }));
  }, [performances]);

  const handleAddPerformance = () => {
    if (preparedPerformances.length >= MAX_PERFORMANCES) return;

    const newPerformance: NormalizedGroupPerformance = {
      id: generateUniqueId(),
      url: '',
      caption: { uk: '', en: '' }
    };
    onChangePerformances([...preparedPerformances, newPerformance]);
  };

  const handleConfirmDelete = () => {
    if (performanceIdToDelete) {
      onChangePerformances(preparedPerformances.filter((item) => item.id !== performanceIdToDelete));
      setPerformanceIdToDelete(null);
    }
  };

  const handleUpdateUrl = (idToUpdate: string, value: string) => {
    onChangePerformances(preparedPerformances.map((item) => (item.id === idToUpdate ? { ...item, url: value } : item)));
  };

  const handleUpdateCaption = (idToUpdate: string, value: string) => {
    onChangePerformances(
      preparedPerformances.map((item) => {
        if (item.id !== idToUpdate) return item;

        const currentUk = item.caption?.uk || '';
        const currentEn = item.caption?.en || '';

        const newCaption = {
          uk: currentUk,
          en: currentEn,
          [langKey]: value
        };

        if (langKey === 'uk' && (!currentEn || currentEn === currentUk)) {
          newCaption.en = value;
        }

        return {
          ...item,
          caption: newCaption
        };
      })
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    handleSortableDragEnd(event, preparedPerformances, onChangePerformances);
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
          <SortableList
            id="group-performances-list"
            items={preparedPerformances.map((item) => item.id)}
            onDragEnd={handleDragEnd}
          >
            {preparedPerformances.map((item) => (
              <SortableItemWrapper key={item.id} id={item.id} gripPosition="top" gripHandle>
                <Box sx={styles.performanceItemRow}>
                  <PerformanceRow
                    item={item}
                    langKey={langKey}
                    urlError={errors?.[`performances[${item.id}].url`]}
                    captionError={errors?.[`performances[${item.id}].caption.${langKey}`]}
                    renderLinkPreview={renderLinkPreview}
                    onUpdateUrl={handleUpdateUrl}
                    onUpdateCaption={handleUpdateCaption}
                    onDeleteRequest={setPerformanceIdToDelete}
                  />
                </Box>
              </SortableItemWrapper>
            ))}
          </SortableList>
        </Box>

        <Box sx={styles.addBtnWrapper}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PlusIcon />}
            onClick={handleAddPerformance}
            sx={styles.addBtn}
            disabled={preparedPerformances.length >= MAX_PERFORMANCES}
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
