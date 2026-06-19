import { Box, Divider, IconButton, Typography } from '@mui/material';
import { Pencil,Trash2  } from 'lucide-react';

import PlusIcon from '~/public/icons/plus.svg';
import Button from '~/shared/components/design-system/button/Button';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';

export type WorkItem = {
  id: string;
  title: string;
};

type OpusWorksSectionProps = {
  works: WorkItem[];
  onChange: (works: WorkItem[]) => void;
};

export const OpusWorksSection = ({ works, onChange }: OpusWorksSectionProps) => {
  const handleAddWork = () => {
    const newWork: WorkItem = {
      id: crypto.randomUUID(), 
      title: ''
    };
    onChange([...works, newWork]);
  };

  const handleDeleteWork = (idToRemove: string) => {
    onChange(works.filter((work) => work.id !== idToRemove));
  };

  const handleUpdateWork = (idToUpdate: string, newTitle: string) => {
    onChange(works.map((work) => (work.id === idToUpdate ? { ...work, title: newTitle } : work)));
  };

  return (
    <CollapsibleBlock title="Твори" defaultExpanded>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Твори в опусі
          </Typography>

          <Divider sx={{ flexGrow: 1, borderColor: '#E0E2E8' }} />

          <Button
            variant="outlined"
            color="primary"
            onClick={handleAddWork}
            sx={{ borderRadius: '20px', textTransform: 'none' }} 
          >
            Додати
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {works.map((work) => (
            <Box key={work.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <CustomTextField
                  value={work.title}
                  onChange={(e) => handleUpdateWork(work.id, e.target.value)}
                  placeholder="Назва твору"
                  fullWidth
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small">
                  <Pencil size={20} />
                </IconButton>
                <IconButton size="small" onClick={() => handleDeleteWork(work.id)}>
                  <Trash2 size={20} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PlusIcon />}
            onClick={handleAddWork}
            sx={{ borderRadius: '20px', textTransform: 'none' }}
          >
            Додати пункт
          </Button>
        </Box>
      </Box>
    </CollapsibleBlock>
  );
};
