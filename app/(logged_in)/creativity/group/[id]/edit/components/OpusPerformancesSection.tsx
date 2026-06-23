import { Box, Divider,IconButton, Typography } from '@mui/material';
import { useState } from 'react';

import PlusIcon from '~/public/icons/plus.svg';
import TrashIcon from '~/public/icons/trash.svg';
import DeleteCardModal from '~/shared/components/delete-card-modal/DeleteCardModal';
import Button from '~/shared/components/design-system/button/Button';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';

export type PerformanceItem = {
  id: string;
  url: string;
  caption: string;
};

type OpusPerformancesSectionProps = {
  sectionTitle: string;
  performances: PerformanceItem[];
  onChangeSectionTitle: (title: string) => void;
  onChangePerformances: (performances: PerformanceItem[]) => void;
};

export const OpusPerformancesSection = ({
  sectionTitle,
  performances,
  onChangeSectionTitle,
  onChangePerformances
}: OpusPerformancesSectionProps) => {
  const [performanceIdToDelete, setPerformanceIdToDelete] = useState<string | null>(null);

  const handleAddPerformance = () => {
    const newPerformance: PerformanceItem = {
      id: crypto.randomUUID(),
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

  const handleUpdatePerformance = (idToUpdate: string, field: keyof PerformanceItem, value: string) => {
    onChangePerformances(performances.map((item) => (item.id === idToUpdate ? { ...item, [field]: value } : item)));
  };

  return (
    <CollapsibleBlock title="Всі версії виконання опису" defaultExpanded>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
        <CustomTextField
          label="Заголовок секції"
          value={sectionTitle}
          onChange={(e) => onChangeSectionTitle(e.target.value)}
          fullWidth
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Пункти секції:
          </Typography>
          <Divider sx={{ flexGrow: 1, borderColor: '#E0E2E8' }} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {performances.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
                <CustomTextField
                  label="Canonical URL"
                  value={item.url}
                  onChange={(e) => handleUpdatePerformance(item.id, 'url', e.target.value)}
                  fullWidth
                />
                <CustomTextField
                  label="Підпис"
                  value={item.caption}
                  onChange={(e) => handleUpdatePerformance(item.id, 'caption', e.target.value)}
                  fullWidth
                />
              </Box>

              <IconButton
                onClick={() => setPerformanceIdToDelete(item.id)}
                sx={{
                  color: '#131414',
                  width: '34px',
                  height: '34px'
                }}
              >
                <TrashIcon />
              </IconButton>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PlusIcon />}
            onClick={handleAddPerformance}
            sx={{ borderRadius: '20px', textTransform: 'none' }}
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
