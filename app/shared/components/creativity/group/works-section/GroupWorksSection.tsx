import { Autocomplete, Box, Divider, IconButton, Paper, Typography } from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { createContext, forwardRef, useContext, useState } from 'react';

import { styles } from './GroupWorksSection.styles';
import { GroupWork } from '~/constants/creativity';
import PencilIcon from '~/public/icons/pencil.svg';
import PlusIcon from '~/public/icons/plus.svg';
import TrashIcon from '~/public/icons/trash.svg';
import DeleteCardModal from '~/shared/components/delete-card-modal/DeleteCardModal';
import Button from '~/shared/components/design-system/button/Button';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';

interface LocalGroupWork extends GroupWork {
  rowId?: string;
}

type GroupWorksSectionProps = {
  works: GroupWork[];
  availableWorks: GroupWork[];
  onChange: (works: GroupWork[]) => void;
};

interface AutocompletePaperContextType {
  isInputEmpty: boolean;
  onSelectCreate: () => void;
}

const AutocompletePaperContext = createContext<AutocompletePaperContextType>({
  isInputEmpty: true,
  onSelectCreate: () => {}
});

const AutocompletePaper = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLElement>>((props, ref) => {
  const { isInputEmpty, onSelectCreate } = useContext(AutocompletePaperContext);

  return (
    <Paper {...props} ref={ref} sx={styles.autocompletePaper}>
      {!isInputEmpty && props.children}

      <Box onMouseDown={(e) => e.preventDefault()} onClick={onSelectCreate} sx={styles.createWorkBox}>
        <PlusIcon style={{ width: '20px', height: '20px' }} />
        <Typography sx={styles.createWorkText}>Створити новий твір</Typography>
      </Box>
    </Paper>
  );
});
AutocompletePaper.displayName = 'AutocompletePaper';

const generateUniqueId = (): string => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  const array = new Uint32Array(1);
  globalThis.crypto.getRandomValues(array);
  return `ui-${Date.now()}-${array[0].toString(36)}`;
};

const filter = createFilterOptions<GroupWork>();

export const GroupWorksSection = ({ works, availableWorks, onChange }: GroupWorksSectionProps) => {
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);
  const [workIdToDelete, setWorkIdToDelete] = useState<string | null>(null);
  const [searchValues, setSearchValues] = useState<Record<string, string>>({});

  const handleAddWork = () => {
    const newId = generateUniqueId();
    const newWork: LocalGroupWork = {
      id: newId,
      title: '',
      rowId: newId
    };
    onChange([...works, newWork]);
    setEditingWorkId(newId);

    setSearchValues((prev) => ({ ...prev, [newId]: '' }));
  };

  const handleSelectWork = (currentId: string, selectedWork: GroupWork | null) => {
    if (selectedWork) {
      onChange(
        works.map((work) =>
          work.id === currentId
            ? {
              ...work,
              id: selectedWork.id,
              title: selectedWork.title,
              genre: selectedWork.genre,
              rowId: (work as LocalGroupWork).rowId || work.id
            }
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
      <Box sx={styles.mainContainer}>
        <Box sx={styles.headerRow}>
          <Typography variant="body2" color="text.secondary">
            Твори в групі
          </Typography>

          <Divider sx={styles.divider} />

          <Button variant="outlined" color="primary" onClick={handleAddWork} sx={styles.addBtnTop}>
            Додати
          </Button>
        </Box>

        <Box sx={styles.worksList}>
          {works.map((work: LocalGroupWork) => {
            const isEditing = editingWorkId === work.id;

            const currentSearchValue = searchValues[work.id] ?? work.title;
            const isInputEmpty = currentSearchValue.trim() === '';
            const itemKey = work.rowId || work.id;

            return (
              <Box key={itemKey} sx={styles.workItemRow}>
                <Box sx={styles.autocompleteWrapper}>
                  <AutocompletePaperContext.Provider
                    value={{ isInputEmpty, onSelectCreate: () => setEditingWorkId(null) }}
                  >
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
                      PaperComponent={AutocompletePaper}
                      renderInput={(params) => <CustomTextField {...params} placeholder="Назва твору" fullWidth />}
                    />
                  </AutocompletePaperContext.Provider>
                </Box>

                <Box sx={styles.actionButtonsWrapper}>
                  <IconButton
                    data-testid="edit-work-btn"
                    sx={styles.actionIcon}
                    onClick={() => setEditingWorkId(isEditing ? null : work.id)}
                  >
                    <PencilIcon />
                  </IconButton>
                  <IconButton
                    data-testid="delete-work-btn"
                    sx={styles.actionIcon}
                    onClick={() => setWorkIdToDelete(work.id)}
                  >
                    <TrashIcon />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
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
