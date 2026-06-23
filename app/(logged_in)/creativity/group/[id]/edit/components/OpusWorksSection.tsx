import {
  Autocomplete,
  Box,
  Divider,
  IconButton,
  Paper,
  Typography} from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { useState } from 'react';

import PencilIcon from '~/public/icons/pencil.svg';
import PlusIcon from '~/public/icons/plus.svg';
import TrashIcon from '~/public/icons/trash.svg';
import DeleteCardModal from '~/shared/components/delete-card-modal/DeleteCardModal';
import Button from '~/shared/components/design-system/button/Button';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';

export type WorkItem = {
  id: string;
  title: string;
  genre?: { uk: string; en: string };
};

type OpusWorksSectionProps = {
  works: WorkItem[];
  availableWorks: WorkItem[];
  onChange: (works: WorkItem[]) => void;
};

const filter = createFilterOptions<WorkItem>();

export const OpusWorksSection = ({ works, availableWorks, onChange }: OpusWorksSectionProps) => {
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);
  const [workIdToDelete, setWorkIdToDelete] = useState<string | null>(null);
  const [searchValues, setSearchValues] = useState<Record<string, string>>({});
  
  const handleAddWork = () => {
    const newId = crypto.randomUUID();
    const newWork: WorkItem = {
      id: newId,
      title: ''
    };
    onChange([...works, newWork]);
    setEditingWorkId(newId);

    setSearchValues((prev) => ({ ...prev, [newId]: '' }));
  };

  const handleSelectWork = (currentId: string, selectedWork: WorkItem | null) => {
    if (selectedWork) {
      onChange(
        works.map((work) =>
          work.id === currentId
            ? { ...work, id: selectedWork.id, title: selectedWork.title, genre: selectedWork.genre }
            : work
        )
      );
    }
  };

  const handleUpdateWorkText = (idToUpdate: string, value: string) => {
    onChange(works.map((work) => (work.id === idToUpdate ? { ...work, title: value } : work)));
  };

  const handleConfirmDelete = () => {
    if (workIdToDelete) {
      onChange(works.filter((work) => work.id !== workIdToDelete));
      if (editingWorkId === workIdToDelete) {
        setEditingWorkId(null);
      }
      setWorkIdToDelete(null);
    }
  };

  return (
    <CollapsibleBlock title="Твори" defaultExpanded>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Твори в групі
          </Typography>

          <Divider sx={{ flexGrow: 1, borderColor: '#E0E2E8' }} />

          <Button
            variant="outlined"
            color="primary"
            onClick={handleAddWork}
            sx={{
              borderRadius: '20px',
              textTransform: 'none',
              backgroundColor: '#190D03',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#222222'
              }
            }}
          >
            Додати
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {works.map((work) => {
            const isEditing = editingWorkId === work.id;

            const currentSearchValue = searchValues[work.id] !== undefined ? searchValues[work.id] : work.title;
            const isInputEmpty = currentSearchValue.trim() === '';

            return (
              <Box key={work.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Autocomplete
                    disabled={!isEditing}
                    options={availableWorks}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.title)}
                    value={work}
                    isOptionEqualToValue={(option, val) => option.id === val.id}
                    getOptionDisabled={(option) => {
                      return works.some((w) => w.id === option.id && w.id !== work.id);
                    }}
                    disableClearable
                    forcePopupIcon={false}
                    noOptionsText="Такого твору немає"
                    filterOptions={(options, params) => {
                      if (params.inputValue.trim() === '') {
                        return [];
                      }
                      return filter(options, params);
                    }}
                    onChange={(_, newValue) => {
                      if (newValue && typeof newValue !== 'string') {
                        handleSelectWork(work.id, newValue);
                      } else if (!newValue) {
                        handleUpdateWorkText(work.id, '');
                      }
                    }}
                    onInputChange={(_, newInputValue) => {
                      setSearchValues((prev) => ({ ...prev, [work.id]: newInputValue }));
                    }}
                    PaperComponent={(paperProps) => (
                      <Paper
                        {...paperProps}
                        sx={{
                          borderRadius: '12px',
                          mt: 1,
                          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                          overflow: 'hidden'
                        }}
                      >
                        {!isInputEmpty && paperProps.children}

                        <Box
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setEditingWorkId(null);
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            px: 2,
                            py: '6px',
                            cursor: 'pointer',
                            color: 'text.primary',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <PlusIcon style={{ width: '20px', height: '20px' }} />
                          <Typography sx={{ fontSize: '16px' }}>Створити новий твір</Typography>
                        </Box>
                      </Paper>
                    )}
                    renderInput={(params) => <CustomTextField {...params} placeholder="Назва твору" fullWidth />}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    sx={{ color: '#131414', width: '34px', height: '34px' }}
                    onClick={() => setEditingWorkId(isEditing ? null : work.id)}
                  >
                    <PencilIcon />
                  </IconButton>
                  <IconButton
                    sx={{ color: '#131414', width: '34px', height: '34px' }}
                    onClick={() => setWorkIdToDelete(work.id)}
                  >
                    <TrashIcon />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
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

      <DeleteCardModal
        open={Boolean(workIdToDelete)}
        onClose={() => setWorkIdToDelete(null)}
        onDelete={handleConfirmDelete}
        description="Ви збираєтесь видалити файл. Ви впевнені, що хочете продовжити?"
      />
    </CollapsibleBlock>
  );
};
