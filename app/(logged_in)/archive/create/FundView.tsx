'use client';

import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { MouseEvent, useState } from 'react';
import toast from 'react-hot-toast';

import { PublishEmptyFundDialog } from '../(components)/publish-empty-fund-dialog/PublishEmptyFundDialog';
import { useFundPublishWarning } from '../(hooks)/useFundPublishWarning';
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
import { useNavigationGuard } from '~/shared/hooks/use-navigation-guard/useNavigationGuard';
import { useUnsavedChanges } from '~/shared/hooks/use-unsaved-changes/useUnsavedChanges';
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
  const { details, setDetails, errors, forceShowErrors, isSaved, currentStatus, hasUnsavedChanges, fundId, handleSave } = data;

  const router = useRouter();
  const checkFundPublishWarning = useFundPublishWarning();
  const currentLocale = useStore((state) => state.locale as 'uk' | 'en');
  const setLocale = useStore((state) => state.setLocale as (locale: 'uk' | 'en') => void);
  const { navigateBack } = useNavigationGuard();

  useUnsavedChanges(mode === 'edit' ? Boolean(hasUnsavedChanges) : false);

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

    const statusToSave = currentStatus ?? BaseContentStatuses.Hidden;

    if (action === 'SAVE') {
      const id = await handleSave(statusToSave);
      if (mode === 'create' && id) {
        router.push(`${ARCHIVE_BASE_PATH}/fund/${id}/edit`);
      }
    } else if (action === 'SAVE_AND_EXIT') {
      const id = await handleSave(statusToSave);
      if (id) {
        router.push(ARCHIVE_BASE_PATH);
      }
    } else if (action === 'PUBLISH') {
      const id = await handleSave(BaseContentStatuses.Published);
      if (mode === 'create' && id) {
        router.push(`${ARCHIVE_BASE_PATH}/fund/${id}/edit`);
      }
    }
  };

  const handlePublishClick = async (): Promise<void> => {
    setPublishMenuAnchor(null);

    if (mode === 'create') {
      await handleActionClick('PUBLISH');
      return;
    }

    if (!canPublish) {
      return;
    }

    const warningResult = await checkFundPublishWarning({
      fundId,
      casesCount: details.casesCount
    });

    if (warningResult === 'error') {
      toast.error(FundErrors.FAILED_TO_PUBLISH);
      return;
    }

    if (warningResult === 'show-warning') {
      setIsPublishWarningOpen(true);
      return;
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
        onBackClick={navigateBack}
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
        {mode === 'edit' && currentStatus === BaseContentStatuses.Published ? (
          <Typography variant="subtitle2">Опубліковано</Typography>
        ) : (
          <ProgressStatus isSaved={isSaved} />
        )}
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

        {mode === 'edit' ? <FundCasesBlock fundId={fundId} /> : null}
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