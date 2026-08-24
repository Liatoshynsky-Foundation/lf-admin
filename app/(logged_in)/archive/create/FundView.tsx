'use client';

import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { MouseEvent, useState } from 'react';
import toast from 'react-hot-toast';

import { PublishEmptyFundDialog } from '../(components)/publish-empty-fund-dialog/PublishEmptyFundDialog';
import { styles } from './page.styles';
import { ARCHIVE_BASE_PATH } from '~/constants/archive';
import { FundErrors } from '~/constants/errors';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import ProgressStatus from '~/shared/components/divided-header/progress-status/ProgressStatus';
import { TitleDropdown } from '~/shared/components/divided-header/title-dropdown/TitleDropdown';
import ActionMenu, { ActionMenuGroups } from '~/shared/components/dropdown-menu/ActionMenu';
import FundCasesBlock from '~/shared/components/forms/fund-cases-block/FundCasesBlock';
import FundDetailsBlock from '~/shared/components/forms/fund-details-block/FundDetailsBlock';
import { useHasPublishedCasesInFund } from '~/shared/hooks/use-funds/useFunds';
import { useUpsertFund } from '~/shared/hooks/use-upsert-fund/useUpsertFund';
import { useStore } from '~/store';
import { BaseContentStatuses } from '~/types/enums/common.enums';

interface FundViewProps {
  data: ReturnType<typeof useUpsertFund>;
  mode?: 'create' | 'edit';
}

const FUND_PAGE_TITLES = {
  create: 'Створення фонду',
  edit: 'Редагування фонду'
};
const FUND_DETAILS_LABEL = 'Деталі';

export const FundActionMenuItems = ({ onAction }: { onAction: (action: string) => void }): ActionMenuGroups => [
  {
    items: [
      { id: 'SAVE', text: { name: 'Зберегти зміни' }, onClick: () => onAction('SAVE') },
      { id: 'SAVE_AND_EXIT', text: { name: 'Зберегти зміни і вийти' }, onClick: () => onAction('SAVE_AND_EXIT') }
    ]
  }
];

export default function FundView({ data, mode = 'create' }: Readonly<FundViewProps>) {
  const { details, setDetails, errors, forceShowErrors, isSaved, currentStatus, fundId, handleSave } = data;

  const router = useRouter();
  const hasPublishedCasesInFund = useHasPublishedCasesInFund();
  const currentLocale = useStore((state) => state.locale as 'uk' | 'en');
  const setLocale = useStore((state) => state.setLocale as (locale: 'uk' | 'en') => void);

  const [languageMenuAnchor, setLanguageMenuAnchor] = useState<HTMLButtonElement | null>(null);
  const [publishMenuAnchor, setPublishMenuAnchor] = useState<HTMLButtonElement | null>(null);
  const [isPublishWarningOpen, setIsPublishWarningOpen] = useState(false);
  const canPublish = currentStatus === BaseContentStatuses.Hidden;

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

  const handlePublishClick = async (): Promise<void> => {
    setPublishMenuAnchor(null);

    if (details.casesCount === 0) {
      setIsPublishWarningOpen(true);
      return;
    }

    if (fundId) {
      try {
        const hasPublishedCases = await hasPublishedCasesInFund(fundId);

        if (!hasPublishedCases) {
          setIsPublishWarningOpen(true);
          return;
        }
      } catch {
        toast.error(FundErrors.FAILED_TO_PUBLISH);
        return;
      }
    }

    await handleActionClick('PUBLISH');
  };

  const handleConfirmPublish = async (): Promise<void> => {
    setIsPublishWarningOpen(false);
    await handleActionClick('PUBLISH');
  };

  return (
    <>
      <DividedHeader
        originUrl={ARCHIVE_BASE_PATH}
        rightActionsComponent={
          <HeaderRightActions
            mode="edit"
            onPublish={handlePublishClick}
            onMenuOpen={(e) => setPublishMenuAnchor(e.currentTarget as HTMLButtonElement)}
            showPublish={canPublish}
          />
        }
      >
        <TitleDropdown
          type="multilingual"
          language={currentLocale === 'uk' ? 'UA' : 'EN'}
          title={mode === 'edit' ? FUND_PAGE_TITLES.edit : FUND_PAGE_TITLES.create}
          onMenuOpen={handleLanguageMenuOpen}
        />
        <ProgressStatus isSaved={isSaved} />
      </DividedHeader>

      <Box sx={styles.contentWrapper}>
        <Box sx={styles.detailsAccordion}>
          <Box sx={styles.detailsSummary}>
            <Typography variant="h6" sx={styles.detailsTitle}>
              {FUND_DETAILS_LABEL}
            </Typography>
          </Box>
          <Box sx={styles.detailsContent}>
            <FundDetailsBlock
              value={details}
              onChange={setDetails}
              errors={errors}
              forceShowErrors={forceShowErrors}
              mode={mode}
            />
          </Box>
        </Box>

        <FundCasesBlock />
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
        menuItems={FundActionMenuItems({ onAction: handleActionClick })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
      <PublishEmptyFundDialog
        open={isPublishWarningOpen}
        onCancel={() => setIsPublishWarningOpen(false)}
        onConfirm={handleConfirmPublish}
      />
    </>
  );
}
