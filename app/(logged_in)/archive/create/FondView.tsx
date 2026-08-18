'use client';

import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { MouseEvent, useState } from 'react';

import { styles } from './page.styles';
import { ARCHIVE_BASE_PATH } from '~/constants/archive';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import ProgressStatus from '~/shared/components/divided-header/progress-status/ProgressStatus';
import { TitleDropdown } from '~/shared/components/divided-header/title-dropdown/TitleDropdown';
import ActionMenu, { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import FondCasesBlock from '~/shared/components/forms/fond-cases-block/FondCasesBlock';
import FondDetailsBlock from '~/shared/components/forms/fond-details-block/FondDetailsBlock';
import { useUpsertFond } from '~/shared/hooks/use-upsert-fond/useUpsertFond';
import { useStore } from '~/store';
import { BaseContentStatuses } from '~/types/enums/common.enums';

interface FondViewProps {
  data: ReturnType<typeof useUpsertFond>;
  mode?: 'create' | 'edit';
}

const FOND_PAGE_TITLES = {
  create: 'Створення фонду',
  edit: 'Редагування фонду'
};
const FOND_DETAILS_LABEL = 'Деталі';

export const FondActionMenuItems = ({ onAction }: { onAction: (action: string) => void }): ActionMenuGroups => [
  {
    items: [
      { id: 'SAVE', text: { name: 'Зберегти зміни' }, onClick: () => onAction('SAVE') },
      { id: 'SAVE_AND_EXIT', text: { name: 'Зберегти зміни і вийти' }, onClick: () => onAction('SAVE_AND_EXIT') }
    ]
  }
];

export default function FondView({ data, mode = 'create' }: Readonly<FondViewProps>) {
  const { details, setDetails, errors, forceShowErrors, isSaved, handleSave } = data;

  const router = useRouter();
  const currentLocale = useStore((state) => state.locale as 'uk' | 'en');
  const setLocale = useStore((state) => state.setLocale as (locale: 'uk' | 'en') => void);

  const [languageMenuAnchor, setLanguageMenuAnchor] = useState<HTMLButtonElement | null>(null);
  const [publishMenuAnchor, setPublishMenuAnchor] = useState<HTMLButtonElement | null>(null);

  const handleLanguageMenuOpen = (event: MouseEvent<HTMLElement>): void => {
    setLanguageMenuAnchor(event.currentTarget as HTMLButtonElement);
  };

  const handleActionClick = async (action: string): Promise<void> => {
    setPublishMenuAnchor(null);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (action === 'SAVE') {
      await handleSave(BaseContentStatuses.Draft);
    } else if (action === 'SAVE_AND_EXIT') {
      const id = await handleSave(BaseContentStatuses.Draft);
      if (id) {
        router.push(ARCHIVE_BASE_PATH);
      }
    } else if (action === 'PUBLISH') {
      await handleSave(BaseContentStatuses.Published);
    }
  };

  return (
    <>
      <DividedHeader
        originUrl={ARCHIVE_BASE_PATH}
        rightActionsComponent={
          <HeaderRightActions
            mode="edit"
            onPublish={() => handleActionClick('PUBLISH')}
            onMenuOpen={(e) => setPublishMenuAnchor(e.currentTarget as HTMLButtonElement)}
          />
        }
      >
        <TitleDropdown
          type="multilingual"
          language={currentLocale === 'uk' ? 'UA' : 'EN'}
          title={mode === 'edit' ? FOND_PAGE_TITLES.edit : FOND_PAGE_TITLES.create}
          onMenuOpen={handleLanguageMenuOpen}
        />
        <ProgressStatus isSaved={isSaved} />
      </DividedHeader>

      <Box sx={styles.contentWrapper}>
        <Box sx={styles.detailsAccordion}>
          <Box sx={styles.detailsSummary}>
            <Typography variant="h6" sx={styles.detailsTitle}>
              {FOND_DETAILS_LABEL}
            </Typography>
          </Box>
          <Box sx={styles.detailsContent}>
            <FondDetailsBlock
              value={details}
              onChange={setDetails}
              errors={errors}
              forceShowErrors={forceShowErrors}
              mode={mode}
            />
          </Box>
        </Box>

        <FondCasesBlock />
      </Box>

      <ActionMenu
        anchorEl={languageMenuAnchor}
        onClose={() => setLanguageMenuAnchor(null)}
        menuItems={[
          {
            title: 'Мовні версії',
            items: [
              { id: 'uk', text: { name: 'Українська' }, onClick: () => setLocale('uk') },
              { id: 'en', text: { name: 'Англійська' }, onClick: () => setLocale('en') }
            ]
          }
        ]}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        isSelectable
      />

      <ActionMenu
        anchorEl={publishMenuAnchor}
        onClose={() => setPublishMenuAnchor(null)}
        menuItems={FondActionMenuItems({ onAction: handleActionClick })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
    </>
  );
}
